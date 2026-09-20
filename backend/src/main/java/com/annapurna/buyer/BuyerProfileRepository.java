package com.annapurna.buyer;

import java.util.Collection;
import java.util.Optional;
import java.util.UUID;
import org.springframework.data.jpa.repository.JpaRepository;

public interface BuyerProfileRepository extends JpaRepository<BuyerProfile, UUID> {
    Optional<BuyerProfile> findByOrganizationId(UUID organizationId);
    Optional<BuyerProfile> findFirstByOrganizationIdIn(Collection<UUID> organizationIds);
}
