package com.annapurna.marketprice;

import java.time.LocalDate;
import java.util.UUID;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

public interface MarketPriceRepository extends JpaRepository<MarketPrice, UUID> {
    @Query("""
            select p from MarketPrice p
            where (:commodityId is null or p.commodity.id = :commodityId)
              and (:marketId is null or p.market.id = :marketId)
              and (:fromDate is null or p.observedOn >= :fromDate)
              and (:toDate is null or p.observedOn <= :toDate)
            """)
    Page<MarketPrice> search(
            @Param("commodityId") UUID commodityId,
            @Param("marketId") UUID marketId,
            @Param("fromDate") LocalDate fromDate,
            @Param("toDate") LocalDate toDate,
            Pageable pageable);
}