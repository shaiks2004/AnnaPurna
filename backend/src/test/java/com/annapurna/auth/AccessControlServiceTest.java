package com.annapurna.auth;

import static org.assertj.core.api.Assertions.assertThatThrownBy;
import static org.mockito.Mockito.mock;
import static org.mockito.Mockito.when;

import java.util.Map;
import java.util.Set;
import java.util.UUID;
import org.junit.jupiter.api.Test;
import org.springframework.security.access.AccessDeniedException;

class AccessControlServiceTest {
    private final CurrentUser currentUser = mock(CurrentUser.class);
    private final AuthenticatedUserService authenticatedUserService = mock(AuthenticatedUserService.class);
        private final AuthorizationPolicy authorizationPolicy = mock(AuthorizationPolicy.class);
        private final AccessControlService service = new AccessControlService(
            currentUser, authenticatedUserService, authorizationPolicy);

    @Test
    void nonAdminCannotUseAdminOnlyOperations() {
        UUID userId = UUID.randomUUID();
        when(currentUser.id()).thenReturn(userId);
        when(authenticatedUserService.load(userId))
                .thenReturn(new AuthenticatedUser(userId, Set.of(), Set.of(Role.FARMER), Map.of()));

        assertThatThrownBy(service::requireAdmin).isInstanceOf(AccessDeniedException.class);
    }

    @Test
    void adminCanUseAdminOnlyOperations() {
        UUID userId = UUID.randomUUID();
        when(currentUser.id()).thenReturn(userId);
        when(authenticatedUserService.load(userId))
                .thenReturn(new AuthenticatedUser(userId, Set.of(), Set.of(Role.ADMIN), Map.of()));

        service.requireAdmin();
    }
}