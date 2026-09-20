package com.annapurna.buyer;

import com.annapurna.common.persistence.AuditableEntity;
import com.annapurna.organization.Organization;
import jakarta.persistence.Entity;
import jakarta.persistence.FetchType;
import jakarta.persistence.JoinColumn;
import jakarta.persistence.ManyToOne;
import jakarta.persistence.Table;

@Entity
@Table(name = "buyer_profile")
public class BuyerProfile extends AuditableEntity {
    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "organization_id", nullable = false, unique = true)
    private Organization organization;

    protected BuyerProfile() {}

    public static BuyerProfile create(Organization organization) {
        BuyerProfile profile = new BuyerProfile();
        profile.organization = organization;
        return profile;
    }

    public Organization getOrganization() {
        return organization;
    }
}
