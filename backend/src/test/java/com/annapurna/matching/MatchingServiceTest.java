package com.annapurna.matching;

import static org.assertj.core.api.Assertions.assertThatThrownBy;
import static org.mockito.Mockito.doThrow;
import static org.mockito.Mockito.mock;
import static org.mockito.Mockito.never;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;

import com.annapurna.auth.AccessControlService;
import com.annapurna.common.web.InvalidRequestException;
import com.annapurna.common.web.ResourceNotFoundException;
import com.annapurna.commodity.Commodity;
import com.annapurna.organization.Organization;
import com.annapurna.requirement.Requirement;
import com.annapurna.requirement.RequirementRepository;
import com.annapurna.requirement.RequirementStatus;
import java.util.List;
import java.util.Optional;
import java.util.UUID;
import org.junit.jupiter.api.Test;
import org.springframework.security.access.AccessDeniedException;

class MatchingServiceTest {
    private final RequirementRepository requirementRepository = mock(RequirementRepository.class);
    private final CandidateLotProvider candidateLotProvider = mock(CandidateLotProvider.class);
    private final MatchRanker matchRanker = mock(MatchRanker.class);
    private final AccessControlService accessControlService = mock(AccessControlService.class);
    private final MatchingService service = new MatchingService(
            requirementRepository, candidateLotProvider, matchRanker, accessControlService);

    @Test
    void unauthorizedRequirementReturnsNotFoundWithoutRetrievingCandidates() {
        Requirement requirement = requirement(RequirementStatus.OPEN);
        when(requirementRepository.findById(requirement.getId())).thenReturn(Optional.of(requirement));
        UUID organizationId = requirement.getBuyerOrganizationId();
        doThrow(new AccessDeniedException("denied")).when(accessControlService)
            .requireOrganizationAccess(organizationId);

        assertThatThrownBy(() -> service.findMatches(requirement.getId(), 20))
                .isInstanceOf(ResourceNotFoundException.class);
        verify(candidateLotProvider, never()).findCandidates(requirement);
    }

    @Test
    void draftRequirementCannotBeMatched() {
        Requirement requirement = requirement(RequirementStatus.DRAFT);
        when(requirementRepository.findById(requirement.getId())).thenReturn(Optional.of(requirement));

        assertThatThrownBy(() -> service.findMatches(requirement.getId(), 20))
                .isInstanceOf(ResourceNotFoundException.class);
        verify(candidateLotProvider, never()).findCandidates(requirement);
    }

    @Test
    void invalidLimitIsRejected() {
        assertThatThrownBy(() -> service.findMatches(UUID.randomUUID(), 0))
                .isInstanceOf(InvalidRequestException.class);
    }

    private Requirement requirement(RequirementStatus status) {
        Organization organization = mock(Organization.class);
        UUID organizationId = UUID.randomUUID();
        when(organization.getId()).thenReturn(organizationId);
        com.annapurna.buyer.BuyerProfile buyer = com.annapurna.buyer.BuyerProfile.create(organization);
        Commodity commodity = Commodity.create("Onion", "ONION", true);
        Requirement requirement = Requirement.create(
                buyer, commodity, new java.math.BigDecimal("100"), "MT", "Grade A", 
                "Nashik", java.time.LocalDate.now().plusDays(10), null, null, null, null);
        if (status == RequirementStatus.PUBLISHED) {
            requirement.publish();
        } else if (status == RequirementStatus.OPEN) {
            requirement.publish();
            requirement.open();
        }
        return requirement;
    }
}
