package com.annapurna.auth;

import com.annapurna.common.persistence.AuditableEntity;
import com.annapurna.organization.OrganizationMembership;
import com.annapurna.user.PlatformUser;
import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.EnumType;
import jakarta.persistence.Enumerated;
import jakarta.persistence.FetchType;
import jakarta.persistence.JoinColumn;
import jakarta.persistence.ManyToOne;
import jakarta.persistence.Table;

@Entity
@Table(name = "user_role_assignment")
public class UserRoleAssignment extends AuditableEntity {
    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "user_id", nullable = false)
    private PlatformUser user;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "organization_membership_id")
    private OrganizationMembership organizationMembership;

    @Enumerated(EnumType.STRING)
    @Column(name = "role_code", nullable = false, length = 64)
    private Role role;

    protected UserRoleAssignment() {}

    public static UserRoleAssignment create(PlatformUser user, OrganizationMembership organizationMembership, Role role) {
        UserRoleAssignment assignment = new UserRoleAssignment();
        assignment.user = user;
        assignment.organizationMembership = organizationMembership;
        assignment.role = role;
        return assignment;
    }

    public Role getRole() {
        return role;
    }

    public OrganizationMembership getOrganizationMembership() {
        return organizationMembership;
    }
}
