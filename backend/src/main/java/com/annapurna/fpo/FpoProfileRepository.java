package com.annapurna.fpo;

import java.util.UUID;
import org.springframework.data.jpa.repository.JpaRepository;

public interface FpoProfileRepository extends JpaRepository<FpoProfile, UUID> {
    boolean existsByOrganizationId(UUID organizationId);
}