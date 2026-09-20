package com.annapurna.auth;

import static org.assertj.core.api.Assertions.assertThat;

import org.junit.jupiter.api.Test;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;

class PasswordHashingTest {
    @Test
    void passwordHashDoesNotContainThePlaintextPassword() {
        String plaintext = "not-a-persisted-credential";
        String hash = new BCryptPasswordEncoder().encode(plaintext);

        assertThat(hash).isNotEqualTo(plaintext);
        assertThat(new BCryptPasswordEncoder().matches(plaintext, hash)).isTrue();
    }
}
