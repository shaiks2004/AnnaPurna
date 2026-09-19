package com.annapurna.auth;

import java.util.Map;
import java.util.Set;
import java.util.UUID;

/** Server-resolved request identity. Roles are intentionally not trusted from JWT claims. */
public record AuthenticatedUser(
        UUID userId, Set<UUID> organizationIds, Set<Role> globalRoles, Map<UUID, Set<Role>> organizationRoles) {
    public boolean belongsTo(UUID organizationId) {
        return organizationIds.contains(organizationId);
    }

    public boolean hasGlobalRole(Role role) {
        return globalRoles.contains(role);
    }

    public boolean hasOrganizationRole(UUID organizationId, Role role) {
        return organizationRoles.getOrDefault(organizationId, Set.of()).contains(role);
    }
}
