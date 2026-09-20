package com.annapurna.auth;

import com.annapurna.organization.OrganizationRepository;
import com.annapurna.user.PlatformUser;
import java.util.UUID;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
public class UserRoleAssignmentService {
    private final PlatformUserRepository userRepository;
    private final OrganizationRepository organizationRepository;
    private final OrganizationMembershipRepository membershipRepository;
    private final UserRoleAssignmentRepository roleAssignmentRepository;

    public UserRoleAssignmentService(
            PlatformUserRepository userRepository,
            OrganizationRepository organizationRepository,
            OrganizationMembershipRepository membershipRepository,
            UserRoleAssignmentRepository roleAssignmentRepository) {
        this.userRepository = userRepository;
        this.organizationRepository = organizationRepository;
        this.membershipRepository = membershipRepository;
        this.roleAssignmentRepository = roleAssignmentRepository;
    }

    @Transactional
    public UserRoleAssignment assignOrganizationRole(UUID userId, UUID organizationId, Role role) {
        if (role == Role.FARMER || role == Role.ADMIN) {
            throw new IllegalArgumentException("Role is global and cannot be organization-scoped");
        }
        PlatformUser user = userRepository.findById(userId).orElseThrow(() ->
                new IllegalArgumentException("User does not exist"));
        if (!organizationRepository.existsById(organizationId)) {
            throw new IllegalArgumentException("Organization does not exist");
        }
        var membership = membershipRepository.findByOrganizationIdAndUserId(organizationId, userId).orElseThrow(() ->
                new IllegalArgumentException("User is not a member of the organization"));
        return roleAssignmentRepository.save(UserRoleAssignment.create(user, membership, role));
    }

    @Transactional
    public UserRoleAssignment assignGlobalRole(UUID userId, Role role) {
        if (role != Role.FARMER && role != Role.ADMIN) {
            throw new IllegalArgumentException("Role must be global");
        }
        PlatformUser user = userRepository.findById(userId).orElseThrow(() ->
                new IllegalArgumentException("User does not exist"));
        return roleAssignmentRepository.save(UserRoleAssignment.create(user, null, role));
    }
}