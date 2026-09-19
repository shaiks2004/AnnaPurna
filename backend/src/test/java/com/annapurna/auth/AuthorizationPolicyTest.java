package com.annapurna.auth;

import static org.assertj.core.api.Assertions.assertThat;

import java.util.Map;
import java.util.Set;
import java.util.UUID;
import org.junit.jupiter.api.Test;

class AuthorizationPolicyTest {
    private final AuthorizationPolicy policy = new AuthorizationPolicy();
    private final UUID userId = UUID.randomUUID();
    private final UUID organizationId = UUID.randomUUID();

    @Test
    void userCannotAccessAnotherUsersFarmerResources() {
        AuthenticatedUser user = new AuthenticatedUser(userId, Set.of(), Set.of(Role.FARMER), Map.of());

        assertThat(policy.canAccessFarmer(user, UUID.randomUUID())).isFalse();
        assertThat(policy.canAccessFarmer(user, userId)).isTrue();
    }

    @Test
    void organizationMembershipAndScopedRoleAreRequired() {
        AuthenticatedUser user = new AuthenticatedUser(
                userId, Set.of(organizationId), Set.of(), Map.of(organizationId, Set.of(Role.FPO_USER)));

        assertThat(policy.canAccessOrganization(user, organizationId)).isTrue();
        assertThat(policy.canAccessOrganization(user, UUID.randomUUID())).isFalse();
        assertThat(policy.hasOrganizationRole(user, organizationId, Role.FPO_USER)).isTrue();
        assertThat(policy.hasOrganizationRole(user, organizationId, Role.BUYER_USER)).isFalse();
    }

    @Test
    void adminCanAccessAnyOwnershipBoundary() {
        AuthenticatedUser admin = new AuthenticatedUser(userId, Set.of(), Set.of(Role.ADMIN), Map.of());

        assertThat(policy.canAccessOrganization(admin, UUID.randomUUID())).isTrue();
        assertThat(policy.canAccessFarmer(admin, UUID.randomUUID())).isTrue();
        assertThat(policy.hasOrganizationRole(admin, UUID.randomUUID(), Role.FINANCE_USER)).isTrue();
    }
}
