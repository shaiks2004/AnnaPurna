package com.annapurna.auth;

import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.assertThatThrownBy;
import static org.mockito.Mockito.mock;
import static org.mockito.Mockito.never;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;

import com.annapurna.organization.OrganizationRepository;
import com.annapurna.organization.OrganizationMembership;
import com.annapurna.user.PlatformUser;
import java.util.Optional;
import java.util.UUID;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;

class UserRoleAssignmentServiceTest {
    private final PlatformUserRepository userRepository = mock(PlatformUserRepository.class);
    private final OrganizationRepository organizationRepository = mock(OrganizationRepository.class);
    private final OrganizationMembershipRepository membershipRepository = mock(OrganizationMembershipRepository.class);
    private final UserRoleAssignmentRepository roleAssignmentRepository = mock(UserRoleAssignmentRepository.class);
    private UserRoleAssignmentService service;

    @BeforeEach
    void setUp() {
        service = new UserRoleAssignmentService(
                userRepository, organizationRepository, membershipRepository, roleAssignmentRepository);
    }

    @Test
    void organizationRoleAssignmentSucceedsForOrganizationMember() {
        UUID userId = UUID.randomUUID();
        UUID organizationId = UUID.randomUUID();
        PlatformUser user = mock(PlatformUser.class);
        OrganizationMembership membership = mock(OrganizationMembership.class);
        UserRoleAssignment savedAssignment = mock(UserRoleAssignment.class);
        when(userRepository.findById(userId)).thenReturn(Optional.of(user));
        when(organizationRepository.existsById(organizationId)).thenReturn(true);
        when(membershipRepository.findByOrganizationIdAndUserId(organizationId, userId))
                .thenReturn(Optional.of(membership));
        when(roleAssignmentRepository.save(org.mockito.ArgumentMatchers.any(UserRoleAssignment.class)))
                .thenReturn(savedAssignment);

        assertThat(service.assignOrganizationRole(userId, organizationId, Role.BUYER_USER))
                .isSameAs(savedAssignment);
        verify(roleAssignmentRepository).save(org.mockito.ArgumentMatchers.any(UserRoleAssignment.class));
    }

    @Test
    void organizationRoleAssignmentFailsForNonMember() {
        UUID userId = UUID.randomUUID();
        UUID organizationId = UUID.randomUUID();
        when(userRepository.findById(userId)).thenReturn(Optional.of(mock(PlatformUser.class)));
        when(organizationRepository.existsById(organizationId)).thenReturn(true);
        when(membershipRepository.findByOrganizationIdAndUserId(organizationId, userId))
                .thenReturn(Optional.empty());

        assertThatThrownBy(() -> service.assignOrganizationRole(userId, organizationId, Role.BUYER_USER))
                .isInstanceOf(IllegalArgumentException.class)
                .hasMessage("User is not a member of the organization");
        verify(roleAssignmentRepository, never()).save(org.mockito.ArgumentMatchers.any());
    }

    @Test
    void organizationRoleAssignmentFailsForMissingOrganization() {
        UUID userId = UUID.randomUUID();
        UUID organizationId = UUID.randomUUID();
        when(userRepository.findById(userId)).thenReturn(Optional.of(mock(PlatformUser.class)));
        when(organizationRepository.existsById(organizationId)).thenReturn(false);

        assertThatThrownBy(() -> service.assignOrganizationRole(userId, organizationId, Role.BUYER_USER))
                .isInstanceOf(IllegalArgumentException.class)
                .hasMessage("Organization does not exist");
        verify(membershipRepository, never()).findByOrganizationIdAndUserId(organizationId, userId);
    }

    @Test
    void globalRoleAssignmentStillRequiresAnExistingUser() {
        UUID userId = UUID.randomUUID();
        PlatformUser user = mock(PlatformUser.class);
        when(userRepository.findById(userId)).thenReturn(Optional.of(user));
        when(roleAssignmentRepository.save(org.mockito.ArgumentMatchers.any(UserRoleAssignment.class)))
                .thenAnswer(invocation -> invocation.getArgument(0));

        UserRoleAssignment assignment = service.assignGlobalRole(userId, Role.ADMIN);

        assertThat(assignment.getOrganizationMembership()).isNull();
        verify(roleAssignmentRepository).save(org.mockito.ArgumentMatchers.any(UserRoleAssignment.class));
    }

        @Test
        void globalRolesCannotBeAssignedToAnOrganization() {
                assertThatThrownBy(() -> service.assignOrganizationRole(
                                UUID.randomUUID(), UUID.randomUUID(), Role.ADMIN))
                                .isInstanceOf(IllegalArgumentException.class)
                                .hasMessage("Role is global and cannot be organization-scoped");
        }

        @Test
        void organizationRolesCannotBeAssignedGlobally() {
                assertThatThrownBy(() -> service.assignGlobalRole(UUID.randomUUID(), Role.BUYER_USER))
                                .isInstanceOf(IllegalArgumentException.class)
                                .hasMessage("Role must be global");
        }
}