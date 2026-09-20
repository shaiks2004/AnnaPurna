package com.annapurna.auth;

import com.annapurna.buyer.BuyerProfile;
import com.annapurna.buyer.BuyerProfileRepository;
import com.annapurna.farmer.FarmerProfile;
import com.annapurna.farmer.FarmerProfileRepository;
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
    private final BuyerProfileRepository buyerProfileRepository;
    private final FarmerProfileRepository farmerProfileRepository;

    public MeController(
            CurrentUser currentUser,
            AuthenticatedUserService authenticatedUserService,
            BuyerProfileRepository buyerProfileRepository,
            FarmerProfileRepository farmerProfileRepository) {
        this.currentUser = currentUser;
        this.authenticatedUserService = authenticatedUserService;
        this.buyerProfileRepository = buyerProfileRepository;
        this.farmerProfileRepository = farmerProfileRepository;
    }

    @GetMapping
    @Operation(summary = "Return the caller's server-resolved identity and access context")
    public MeResponse me() {
        AuthenticatedUser user = authenticatedUserService.load(currentUser.id());
        UUID buyerProfileId = user.organizationIds().isEmpty()
                ? null
                : buyerProfileRepository.findFirstByOrganizationIdIn(user.organizationIds())
                        .map(BuyerProfile::getId)
                        .orElse(null);
        UUID farmerProfileId = farmerProfileRepository.findByUserId(user.userId())
                .map(FarmerProfile::getId)
                .orElse(null);
        return new MeResponse(
                user.userId(),
                user.organizationIds(),
                user.globalRoles(),
                user.organizationRoles(),
                buyerProfileId,
                farmerProfileId);
    }

    public record MeResponse(
            UUID userId,
            Set<UUID> organizationIds,
            Set<Role> globalRoles,
            Map<UUID, Set<Role>> organizationRoles,
            UUID buyerProfileId,
            UUID farmerProfileId) {}
}
