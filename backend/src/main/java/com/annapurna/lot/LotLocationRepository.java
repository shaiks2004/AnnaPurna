package com.annapurna.lot;

import java.util.Optional;
import java.util.UUID;
import org.springframework.data.jpa.repository.JpaRepository;

public interface LotLocationRepository extends JpaRepository<LotLocation, UUID> {
    Optional<LotLocation> findByLotId(UUID lotId);
}