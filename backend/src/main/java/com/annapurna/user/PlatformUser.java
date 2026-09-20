package com.annapurna.user;

import com.annapurna.common.persistence.AuditableEntity;
import jakarta.persistence.Entity;
import jakarta.persistence.Column;
import jakarta.persistence.Table;

/** Internal platform user record; authentication credentials are intentionally external. */
@Entity
@Table(name = "app_user")
public class PlatformUser extends AuditableEntity {
    @Column(length = 320)
    private String email;

    @Column(name = "password_hash", length = 255)
    private String passwordHash;

    @Column(nullable = false)
    private boolean active;

    protected PlatformUser() {
        super();
    }

    public String getEmail() {
        return email;
    }

    public String getPasswordHash() {
        return passwordHash;
    }

    public boolean isActive() {
        return active;
    }
}
