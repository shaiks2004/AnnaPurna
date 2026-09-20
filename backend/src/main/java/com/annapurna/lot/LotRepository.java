package com.annapurna.lot;

import java.time.LocalDate;
import java.util.Collection;
import java.util.List;
import java.util.UUID;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

public interface LotRepository extends JpaRepository<Lot, UUID> {
        List<Lot> findByCommodityIdAndStatusIn(UUID commodityId, Collection<LotStatus> statuses);

    @Query("""
            select l from Lot l
            left join l.farmer f
            where (:search is null or lower(l.lotNumber) like lower(concat('%', cast(:search as string), '%')))
              and (:commodityId is null or l.commodity.id = :commodityId)
              and (:farmerId is null or l.farmer.id = :farmerId)
              and (:organizationId is null or l.organization.id = :organizationId)
              and (:sourceSupplyId is null or l.sourceSupply.id = :sourceSupplyId)
              and (:status is null or l.status = :status)
              and (:availableFrom is null or l.availableFrom >= :availableFrom)
              and (:availableTo is null or l.availableFrom <= :availableTo)
              and (:unrestricted = true or f.user.id = :userId or (l.organization is not null and l.organization.id in :organizationIds))
            """)
    Page<Lot> search(
            @Param("search") String search,
            @Param("commodityId") UUID commodityId,
            @Param("farmerId") UUID farmerId,
            @Param("organizationId") UUID organizationId,
            @Param("sourceSupplyId") UUID sourceSupplyId,
            @Param("status") LotStatus status,
            @Param("availableFrom") LocalDate availableFrom,
            @Param("availableTo") LocalDate availableTo,
            @Param("unrestricted") boolean unrestricted,
            @Param("userId") UUID userId,
            @Param("organizationIds") Collection<UUID> organizationIds,
            Pageable pageable);
}