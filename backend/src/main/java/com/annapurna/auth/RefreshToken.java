package com.annapurna.auth;

import com.annapurna.user.PlatformUser;
import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.FetchType;
import jakarta.persistence.Id;
import jakarta.persistence.JoinColumn;
import jakarta.persistence.ManyToOne;
import jakarta.persistence.PrePersist;
import jakarta.persistence.Table;
import java.time.Instant;
import java.util.UUID;

@Entity
@Table(name = "refresh_token")
public class RefreshToken {
    @Id
    private UUID id;

    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "user_id", nullable = false)
    private PlatformUser user;

    @Column(name = "token_hash", nullable = false, unique = true, length = 64)
    private String tokenHash;

    @Column(name = "token_family_id", nullable = false)
    private UUID tokenFamilyId;

    @Column(name = "expires_at", nullable = false)
    private Instant expiresAt;

    @Column(name = "revoked_at")
    private Instant revokedAt;

    @Column(name = "created_at", nullable = false, updatable = false)
    private Instant createdAt;

    protected RefreshToken() {}

    public static RefreshToken issue(PlatformUser user, String tokenHash, UUID tokenFamilyId, Instant expiresAt) {
        RefreshToken refreshToken = new RefreshToken();
        refreshToken.user = user;
        refreshToken.tokenHash = tokenHash;
        refreshToken.tokenFamilyId = tokenFamilyId;
        refreshToken.expiresAt = expiresAt;
        return refreshToken;
    }

    public PlatformUser getUser() {
        return user;
    }

    public UUID getTokenFamilyId() {
        return tokenFamilyId;
    }

    public boolean isUsableAt(Instant instant) {
        return revokedAt == null && expiresAt.isAfter(instant);
    }

    public void revokeAt(Instant instant) {
        revokedAt = instant;
    }

    @PrePersist
    void assignIdAndTimestamp() {
        id = UUID.randomUUID();
        createdAt = Instant.now();
    }
}
