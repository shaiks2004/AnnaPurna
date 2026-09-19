package com.annapurna.auth;

import java.util.UUID;
import org.springframework.stereotype.Component;

/** Central ownership checks for future application services; controllers do not implement policy logic. */
@Component
public class AuthorizationPolicy {
    public boolean canAccessOrganization(AuthenticatedUser user, UUID organizationId) {
        return user.hasGlobalRole(Role.ADMIN) || user.belongsTo(organizationId);
    }

    public boolean canAccessFarmer(AuthenticatedUser user, UUID farmerUserId) {
        return user.hasGlobalRole(Role.ADMIN) || user.userId().equals(farmerUserId);
    }

    public boolean hasOrganizationRole(AuthenticatedUser user, UUID organizationId, Role role) {
        return user.hasGlobalRole(Role.ADMIN) || user.hasOrganizationRole(organizationId, role);
    }
}
