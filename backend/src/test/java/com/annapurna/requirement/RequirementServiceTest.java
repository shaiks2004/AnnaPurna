package com.annapurna.requirement;

import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.assertThatThrownBy;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.ArgumentMatchers.eq;
import static org.mockito.Mockito.mock;
import static org.mockito.Mockito.never;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;

import com.annapurna.auth.AccessControlService;
import com.annapurna.auth.AuthenticatedUser;
import com.annapurna.auth.Role;
import com.annapurna.buyer.BuyerProfile;
import com.annapurna.buyer.BuyerProfileRepository;
import com.annapurna.commodity.Commodity;
import com.annapurna.commodity.CommodityRepository;
import com.annapurna.common.web.InvalidRequestException;
import com.annapurna.common.web.ResourceNotFoundException;
import com.annapurna.organization.Organization;
import java.math.BigDecimal;
import java.time.LocalDate;
import java.util.Map;
import java.util.Optional;
import java.util.Set;
import java.util.UUID;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.springframework.data.domain.PageImpl;
import org.springframework.data.domain.Pageable;
import org.springframework.security.access.AccessDeniedException;

class RequirementServiceTest {
    private final RequirementRepository requirementRepository = mock(RequirementRepository.class);
    private final CommodityRepository commodityRepository = mock(CommodityRepository.class);
    private final BuyerProfileRepository buyerProfileRepository = mock(BuyerProfileRepository.class);
    private final AccessControlService accessControlService = mock(AccessControlService.class);
    private RequirementService service;

    @BeforeEach
    void setUp() {
        service = new RequirementService(
                requirementRepository,
                commodityRepository,
                buyerProfileRepository,
                accessControlService);
    }

    @Test
    void buyerCanCreateRequirementForOwnOrganization() {
        UUID buyerProfileId = UUID.randomUUID();
        UUID organizationId = UUID.randomUUID();
        UUID commodityId = UUID.randomUUID();
        BuyerProfile buyerProfile = mock(BuyerProfile.class);
        Organization organization = mock(Organization.class);
        Commodity commodity = mock(Commodity.class);
        when(buyerProfileRepository.findById(buyerProfileId)).thenReturn(Optional.of(buyerProfile));
        when(buyerProfile.getOrganization()).thenReturn(organization);
        when(organization.getId()).thenReturn(organizationId);
        when(commodityRepository.findById(commodityId)).thenReturn(Optional.of(commodity));
        when(requirementRepository.save(any(Requirement.class))).thenAnswer(invocation -> invocation.getArgument(0));

        RequirementResponse response = service.create(new RequirementCreateRequest(
                buyerProfileId,
                commodityId,
                new BigDecimal("500"),
                "MT",
                "Grade A",
                "Nashik",
                LocalDate.of(2026, 11, 15),
                new BigDecimal("1800"),
                new BigDecimal("2200"),
                "INR",
                "buyer's requirement"
        ));

        assertThat(response.status()).isEqualTo(RequirementStatus.DRAFT);
        verify(accessControlService).requireOrganizationRole(organizationId, Role.BUYER_USER);
    }

    @Test
    void unrelatedBuyerCannotCreateForAnotherOrganization() {
        UUID buyerProfileId = UUID.randomUUID();
        UUID organizationId = UUID.randomUUID();
        UUID commodityId = UUID.randomUUID();
        BuyerProfile buyerProfile = mock(BuyerProfile.class);
        Organization organization = mock(Organization.class);
        when(buyerProfileRepository.findById(buyerProfileId)).thenReturn(Optional.of(buyerProfile));
        when(buyerProfile.getOrganization()).thenReturn(organization);
        when(organization.getId()).thenReturn(organizationId);
        when(commodityRepository.findById(commodityId)).thenReturn(Optional.of(mock(Commodity.class)));
        org.mockito.Mockito.doThrow(new AccessDeniedException("denied"))
                .when(accessControlService).requireOrganizationRole(organizationId, Role.BUYER_USER);

        assertThatThrownBy(() -> service.create(new RequirementCreateRequest(
                buyerProfileId,
                commodityId,
                new BigDecimal("100"),
                "MT",
                "Grade A",
                "Nashik",
                LocalDate.of(2026, 11, 15),
                null,
                null,
                null,
                null
        ))).isInstanceOf(AccessDeniedException.class);
        verify(requirementRepository, never()).save(any(Requirement.class));
    }

    @Test
    void invalidQuantityIsRejected() {
        assertThatThrownBy(() -> service.create(new RequirementCreateRequest(
                UUID.randomUUID(),
                UUID.randomUUID(),
                BigDecimal.ZERO,
                "MT",
                "Grade A",
                "Nashik",
                LocalDate.of(2026, 11, 15),
                null,
                null,
                null,
                null
        ))).isInstanceOf(InvalidRequestException.class);
        verify(commodityRepository, never()).findById(any());
    }

    @Test
    void publishDraftSucceeds() {
        UUID requirementId = UUID.randomUUID();
        UUID organizationId = UUID.randomUUID();
        Organization organization = mock(Organization.class);
        when(organization.getId()).thenReturn(organizationId);
        BuyerProfile buyerProfile = BuyerProfile.create(organization);
        Commodity commodity = Commodity.create("Onion", "ONION", true);
        Requirement requirement = Requirement.create(
                buyerProfile,
                commodity,
                new BigDecimal("10"),
                "MT",
                "Grade A",
                "Nashik",
                LocalDate.of(2026, 11, 15),
                new BigDecimal("1800"),
                new BigDecimal("2200"),
                null,
                null);
        when(requirementRepository.findById(requirementId)).thenReturn(Optional.of(requirement));
        when(requirementRepository.save(requirement)).thenReturn(requirement);

        RequirementResponse response = service.publish(requirementId);

        assertThat(response.status()).isEqualTo(RequirementStatus.PUBLISHED);
        verify(accessControlService).requireOrganizationRole(organizationId, Role.BUYER_USER);
    }

    @Test
    void invalidTransitionIsRejected() {
        UUID requirementId = UUID.randomUUID();
        UUID organizationId = UUID.randomUUID();
        Organization organization = mock(Organization.class);
        when(organization.getId()).thenReturn(organizationId);
        BuyerProfile buyerProfile = BuyerProfile.create(organization);
        Commodity commodity = Commodity.create("Onion", "ONION", true);
        Requirement requirement = Requirement.create(
                buyerProfile,
                commodity,
                new BigDecimal("10"),
                "MT",
                "Grade A",
                "Nashik",
                LocalDate.of(2026, 11, 15),
                new BigDecimal("1800"),
                new BigDecimal("2200"),
                null,
                null);
        requirement.publish();
        requirement.open();
        when(requirementRepository.findById(requirementId)).thenReturn(Optional.of(requirement));

        assertThatThrownBy(() -> service.publish(requirementId))
                .isInstanceOf(InvalidRequestException.class);
    }

    @Test
    void publishedRequirementCanBeOpened() {
        UUID requirementId = UUID.randomUUID();
        UUID organizationId = UUID.randomUUID();
        Organization organization = mock(Organization.class);
        when(organization.getId()).thenReturn(organizationId);
        Requirement requirement = Requirement.create(
                BuyerProfile.create(organization),
                Commodity.create("Onion", "ONION", true),
                new BigDecimal("10"), "MT", "Grade A", "Nashik",
                LocalDate.of(2026, 11, 15), null, null, null, null);
        requirement.publish();
        when(requirementRepository.findById(requirementId)).thenReturn(Optional.of(requirement));
        when(requirementRepository.save(requirement)).thenReturn(requirement);

        assertThat(service.open(requirementId).status()).isEqualTo(RequirementStatus.OPEN);
    }

    @Test
    void publishedRequirementCannotBePatched() {
        UUID requirementId = UUID.randomUUID();
        UUID organizationId = UUID.randomUUID();
        Organization organization = mock(Organization.class);
        when(organization.getId()).thenReturn(organizationId);
        Requirement requirement = Requirement.create(
                BuyerProfile.create(organization),
                Commodity.create("Onion", "ONION", true),
                new BigDecimal("10"), "MT", "Grade A", "Nashik",
                LocalDate.of(2026, 11, 15), null, null, null, null);
        requirement.publish();
        when(requirementRepository.findById(requirementId)).thenReturn(Optional.of(requirement));

        assertThatThrownBy(() -> service.update(requirementId, new RequirementPatchRequest(
                new BigDecimal("20"), null, null, null, null, null, null, null, null)))
                .isInstanceOf(InvalidRequestException.class);
        verify(requirementRepository, never()).save(any(Requirement.class));
    }

    @Test
    void listUsesPaginationAndFilters() {
        UUID userId = UUID.randomUUID();
        UUID organizationId = UUID.randomUUID();
        when(accessControlService.current()).thenReturn(
                new AuthenticatedUser(userId, Set.of(organizationId), Set.of(Role.BUYER_USER), Map.of()));
        when(requirementRepository.search(
                eq(null), eq(organizationId), eq(null), eq(null), eq(false), eq(Set.of(organizationId)), any(Pageable.class)))
                .thenReturn(new PageImpl<>(java.util.List.of()));

        service.list(null, organizationId, null, null, 0, 20);

        verify(requirementRepository).search(
                eq(null), eq(organizationId), eq(null), eq(null), eq(false), eq(Set.of(organizationId)), any(Pageable.class));
    }
}
