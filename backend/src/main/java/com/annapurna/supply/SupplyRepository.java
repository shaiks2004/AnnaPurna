package com.annapurna.supply;

import java.time.LocalDate;
import java.util.Collection;
import java.util.UUID;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

public interface SupplyRepository extends JpaRepository<Supply, UUID> {
    @Query("""
            select s from Supply s
            where (:commodityId is null or s.commodity.id = :commodityId)
              and (:farmerId is null or s.farmer.id = :farmerId)
              and (:organizationId is null or s.organization.id = :organizationId)
              and (:supplyKind is null or s.supplyKind = :supplyKind)
              and (:expectedFrom is null or s.expectedHarvestDate >= :expectedFrom)
              and (:expectedTo is null or s.expectedHarvestDate <= :expectedTo)
              and (:availableFrom is null or s.availableFrom >= :availableFrom)
              and (:unrestricted = true or s.farmer.user.id = :userId or s.organization.id in :organizationIds)
            """)
    Page<Supply> search(
            @Param("commodityId") UUID commodityId,
            @Param("farmerId") UUID farmerId,
            @Param("organizationId") UUID organizationId,
            @Param("supplyKind") SupplyKind supplyKind,
            @Param("expectedFrom") LocalDate expectedFrom,
            @Param("expectedTo") LocalDate expectedTo,
            @Param("availableFrom") LocalDate availableFrom,
            @Param("unrestricted") boolean unrestricted,
            @Param("userId") UUID userId,
            @Param("organizationIds") Collection<UUID> organizationIds,
            Pageable pageable);
}