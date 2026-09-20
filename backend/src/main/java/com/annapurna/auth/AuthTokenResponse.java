package com.annapurna.auth;

import io.swagger.v3.oas.annotations.media.Schema;

public record AuthTokenResponse(
        @Schema(description = "Short-lived JWT access token") String accessToken,
        @Schema(description = "Bearer") String tokenType,
        @Schema(description = "Access-token lifetime in seconds") long expiresIn,
        @Schema(description = "Opaque, rotating refresh token") String refreshToken) {}
