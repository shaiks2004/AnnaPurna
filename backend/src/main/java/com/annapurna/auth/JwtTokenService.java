package com.annapurna.auth;

import java.time.Instant;
import java.util.Base64;
import javax.crypto.SecretKey;
import javax.crypto.spec.SecretKeySpec;
import org.springframework.security.oauth2.jose.jws.MacAlgorithm;
import org.springframework.security.oauth2.jwt.JwtClaimsSet;
import org.springframework.security.oauth2.jwt.JwtEncoder;
import org.springframework.security.oauth2.jwt.JwtEncoderParameters;
import org.springframework.security.oauth2.jwt.JwsHeader;
import org.springframework.stereotype.Service;

@Service
public class JwtTokenService {
    private final JwtEncoder encoder;
    private final JwtProperties properties;

    public JwtTokenService(JwtEncoder encoder, JwtProperties properties) {
        this.encoder = encoder;
        this.properties = properties;
    }

    public String issueAccessToken(AuthenticatedUser user) {
        Instant issuedAt = Instant.now();
        JwtClaimsSet claims = JwtClaimsSet.builder()
                .issuer(properties.issuer())
                .subject(user.userId().toString())
                .audience(java.util.List.of(properties.audience()))
                .issuedAt(issuedAt)
                .expiresAt(issuedAt.plus(properties.accessTokenTtl()))
                .build();
        JwsHeader header = JwsHeader.with(MacAlgorithm.HS256).build();
        return encoder.encode(JwtEncoderParameters.from(header, claims)).getTokenValue();
    }

    public long accessTokenLifetimeSeconds() {
        return properties.accessTokenTtl().toSeconds();
    }

    public static SecretKey secretKey(String encodedSecret) {
        byte[] bytes = Base64.getDecoder().decode(encodedSecret);
        if (bytes.length < 32) {
            throw new IllegalStateException("ANNAPURNA_JWT_SECRET must contain at least 256 bits of key material");
        }
        return new SecretKeySpec(bytes, "HmacSHA256");
    }
}
