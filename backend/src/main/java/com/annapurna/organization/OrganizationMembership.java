package com.annapurna.organization;

import com.annapurna.common.persistence.AuditableEntity;
import com.annapurna.user.PlatformUser;
import jakarta.persistence.Entity;
import jakarta.persistence.FetchType;
import jakarta.persistence.JoinColumn;
import jakarta.persistence.ManyToOne;
import jakarta.persistence.Table;
import jakarta.persistence.UniqueConstraint;

@Entity
@Table(name = "organization_membership", uniqueConstraints = @UniqueConstraint(name = "uq_organization_membership_user_organization", columnNames = {"organization_id", "user_id"}))
public class OrganizationMembership extends AuditableEntity {
    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "organization_id", nullable = false)
    private Organization organization;

    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "user_id", nullable = false)
    private PlatformUser user;

    protected OrganizationMembership() {
        super();
    }

    public Organization getOrganization() {
        return organization;
    }
}
