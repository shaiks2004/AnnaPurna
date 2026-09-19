package com.annapurna.commodity;

import java.util.UUID;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;

public interface CommodityRepository extends JpaRepository<Commodity, UUID> {
    Page<Commodity> findByNameContainingIgnoreCase(String search, Pageable pageable);
}