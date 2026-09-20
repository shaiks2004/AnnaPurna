package com.annapurna.auth;

import com.annapurna.organization.OrganizationMembership;
import java.util.Map;
import java.util.Set;
import java.util.UUID;
import java.util.stream.Collectors;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
public class AuthenticatedUserService {
    private final OrganizationMembershipRepository membershipRepository;
    private final UserRoleAssignmentRepository roleRepository;

    public AuthenticatedUserService(
            OrganizationMembershipRepository membershipRepository, UserRoleAssignmentRepository roleRepository) {
        this.membershipRepository = membershipRepository;
        this.roleRepository = roleRepository;
    }

    @Transactional(readOnly = true)
    public AuthenticatedUser load(UUID userId) {
        Set<UUID> organizationIds = membershipRepository.findByUserId(userId).stream()
                .map(OrganizationMembership::getOrganization)
                .map(organization -> organization.getId())
                .collect(Collectors.toUnmodifiableSet());
        Set<Role> globalRoles = roleRepository.findByUserId(userId).stream()
                .filter(assignment -> assignment.getOrganizationMembership() == null)
                .map(UserRoleAssignment::getRole)
                .collect(Collectors.toUnmodifiableSet());
        Map<UUID, Set<Role>> organizationRoles = roleRepository.findByUserId(userId).stream()
                .filter(assignment -> assignment.getOrganizationMembership() != null)
                .collect(Collectors.groupingBy(
                        assignment -> assignment.getOrganizationMembership().getOrganization().getId(),
                        Collectors.mapping(UserRoleAssignment::getRole, Collectors.toUnmodifiableSet())));
        return new AuthenticatedUser(userId, organizationIds, globalRoles, Map.copyOf(organizationRoles));
    }
}
