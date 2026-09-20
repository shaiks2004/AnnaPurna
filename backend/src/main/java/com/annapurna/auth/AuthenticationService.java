package com.annapurna.auth;

import java.nio.charset.StandardCharsets;
import java.security.MessageDigest;
import java.security.NoSuchAlgorithmException;
import java.security.SecureRandom;
import java.time.Instant;
import java.util.Base64;
import java.util.UUID;
import org.springframework.security.authentication.BadCredentialsException;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
public class AuthenticationService {
    private static final SecureRandom SECURE_RANDOM = new SecureRandom();
    private final PlatformUserRepository userRepository;
    private final RefreshTokenRepository refreshTokenRepository;
    private final AuthenticatedUserService authenticatedUserService;
    private final JwtTokenService jwtTokenService;
    private final JwtProperties properties;
    private final PasswordEncoder passwordEncoder;
    private final boolean localPasswordLoginEnabled;

    public AuthenticationService(
            PlatformUserRepository userRepository,
            RefreshTokenRepository refreshTokenRepository,
            AuthenticatedUserService authenticatedUserService,
            JwtTokenService jwtTokenService,
            JwtProperties properties,
            PasswordEncoder passwordEncoder,
            @Value("${annapurna.security.local-password-login-enabled:false}") boolean localPasswordLoginEnabled) {
        this.userRepository = userRepository;
        this.refreshTokenRepository = refreshTokenRepository;
        this.authenticatedUserService = authenticatedUserService;
        this.jwtTokenService = jwtTokenService;
        this.properties = properties;
        this.passwordEncoder = passwordEncoder;
        this.localPasswordLoginEnabled = localPasswordLoginEnabled;
    }

    @Transactional
    public AuthTokenResponse login(LoginRequest request) {
        if (!localPasswordLoginEnabled) {
            throw invalidCredentials();
        }
        var user = userRepository.findByEmailIgnoreCase(request.email()).orElseThrow(this::invalidCredentials);
        if (!user.isActive() || user.getPasswordHash() == null || !passwordEncoder.matches(request.password(), user.getPasswordHash())) {
            throw invalidCredentials();
        }
        return issueTokens(user.getId(), UUID.randomUUID());
    }

    @Transactional
    public AuthTokenResponse refresh(RefreshRequest request) {
        Instant now = Instant.now();
        RefreshToken existing = refreshTokenRepository.findByTokenHash(hash(request.refreshToken()))
                .filter(token -> token.isUsableAt(now))
                .orElseThrow(this::invalidCredentials);
        existing.revokeAt(now);
        return issueTokens(existing.getUser().getId(), existing.getTokenFamilyId());
    }

    @Transactional
    public void logout(RefreshRequest request) {
        refreshTokenRepository.findByTokenHash(hash(request.refreshToken())).ifPresent(token -> token.revokeAt(Instant.now()));
    }

    private AuthTokenResponse issueTokens(UUID userId, UUID familyId) {
        String rawRefreshToken = newRefreshToken();
        var user = userRepository.getReferenceById(userId);
        refreshTokenRepository.save(RefreshToken.issue(
                user, hash(rawRefreshToken), familyId, Instant.now().plus(properties.refreshTokenTtl())));
        AuthenticatedUser authenticatedUser = authenticatedUserService.load(userId);
        return new AuthTokenResponse(
                jwtTokenService.issueAccessToken(authenticatedUser),
                "Bearer",
                jwtTokenService.accessTokenLifetimeSeconds(),
                rawRefreshToken);
    }

    private BadCredentialsException invalidCredentials() {
        return new BadCredentialsException("Invalid credentials");
    }

    private static String newRefreshToken() {
        byte[] bytes = new byte[48];
        SECURE_RANDOM.nextBytes(bytes);
        return Base64.getUrlEncoder().withoutPadding().encodeToString(bytes);
    }

    static String hash(String value) {
        try {
            return java.util.HexFormat.of().formatHex(
                    MessageDigest.getInstance("SHA-256").digest(value.getBytes(StandardCharsets.UTF_8)));
        } catch (NoSuchAlgorithmException exception) {
            throw new IllegalStateException("SHA-256 is not available", exception);
        }
    }
}
