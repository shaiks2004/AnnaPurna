package com.annapurna.farmer;

import com.annapurna.common.persistence.AuditableEntity;
import com.annapurna.user.PlatformUser;
import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.FetchType;
import jakarta.persistence.JoinColumn;
import jakarta.persistence.ManyToOne;
import jakarta.persistence.Table;

@Entity
@Table(name = "farmer_profile")
public class FarmerProfile extends AuditableEntity {
    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "user_id", nullable = false, unique = true)
    private PlatformUser user;

    @Column(name = "status_code", nullable = false, length = 32)
    private String statusCode;

    protected FarmerProfile() {}

    public PlatformUser getUser() {
        return user;
    }
}
