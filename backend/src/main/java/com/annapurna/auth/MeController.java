package com.annapurna.auth;

import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.security.SecurityRequirement;
import io.swagger.v3.oas.annotations.tags.Tag;
import java.util.Map;
import java.util.Set;
import java.util.UUID;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/v1/me")
@Tag(name = "Identity")
@SecurityRequirement(name = "bearerAuth")
public class MeController {
    private final CurrentUser currentUser;
    private final AuthenticatedUserService authenticatedUserService;

    public MeController(CurrentUser currentUser, AuthenticatedUserService authenticatedUserService) {
        this.currentUser = currentUser;
        this.authenticatedUserService = authenticatedUserService;
    }

    @GetMapping
    @Operation(summary = "Return the caller's server-resolved identity and access context")
    public MeResponse me() {
        AuthenticatedUser user = authenticatedUserService.load(currentUser.id());
        return new MeResponse(user.userId(), user.organizationIds(), user.globalRoles(), user.organizationRoles());
    }

    public record MeResponse(
            UUID userId, Set<UUID> organizationIds, Set<Role> globalRoles, Map<UUID, Set<Role>> organizationRoles) {}
}
