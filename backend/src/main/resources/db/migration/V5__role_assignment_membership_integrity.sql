ALTER TABLE organization_membership
    ADD CONSTRAINT uq_organization_membership_id_user UNIQUE (id, user_id);

ALTER TABLE user_role_assignment
    ADD CONSTRAINT fk_user_role_assignment_membership_user
        FOREIGN KEY (organization_membership_id, user_id)
        REFERENCES organization_membership (id, user_id);