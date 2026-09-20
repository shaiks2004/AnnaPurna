package com.annapurna.auth;

import java.util.UUID;
import org.springframework.security.access.AccessDeniedException;
import org.springframework.stereotype.Service;

@Service
public class AccessControlService {
    private final CurrentUser currentUser;
    private final AuthenticatedUserService authenticatedUserService;
    private final AuthorizationPolicy authorizationPolicy;

    public AccessControlService(
            CurrentUser currentUser,
            AuthenticatedUserService authenticatedUserService,
            AuthorizationPolicy authorizationPolicy) {
        this.currentUser = currentUser;
        this.authenticatedUserService = authenticatedUserService;
        this.authorizationPolicy = authorizationPolicy;
    }

    public void requireAdmin() {
        if (!current().hasGlobalRole(Role.ADMIN)) {
            throw new AccessDeniedException("Insufficient permission");
        }
    }

    public void requireInspectionAccess() {
        AuthenticatedUser user = current();
        if (!user.hasGlobalRole(Role.QUALITY_INSPECTOR) && !user.hasGlobalRole(Role.ADMIN)) {
            throw new AccessDeniedException("Insufficient permission");
        }
    }

    public void requireInspectionAccess(UUID lotId) {
        requireInspectionAccess();
    }

    public AuthenticatedUser current() {
        return authenticatedUserService.load(currentUser.id());
    }

    public void requireFarmerAccess(UUID farmerUserId) {
        if (!authorizationPolicy.canAccessFarmer(current(), farmerUserId)) {
            throw new AccessDeniedException("Insufficient permission");
        }
    }

    public void requireOrganizationAccess(UUID organizationId) {
        if (!authorizationPolicy.canAccessOrganization(current(), organizationId)) {
            throw new AccessDeniedException("Insufficient permission");
        }
    }

    public void requireOrganizationRole(UUID organizationId, Role role) {
        if (!authorizationPolicy.hasOrganizationRole(current(), organizationId, role)) {
            throw new AccessDeniedException("Insufficient permission");
        }
    }
}
