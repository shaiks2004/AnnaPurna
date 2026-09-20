package com.annapurna.organization;

import com.annapurna.common.persistence.AuditableEntity;
import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.Table;

@Entity
@Table(name = "organization")
public class Organization extends AuditableEntity {
    @Column(nullable = false)
    private String name;

    protected Organization() {
        super();
    }
}
