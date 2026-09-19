package com.annapurna.market;

import java.util.UUID;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

public interface MarketRepository extends JpaRepository<Market, UUID> {
    @Query("""
            select m from Market m
            where (:search is null or lower(m.name) like lower(concat('%', :search, '%')))
              and (:state is null or lower(m.state) = lower(:state))
              and (:district is null or lower(m.district) = lower(:district))
              and (:commodityId is null or exists (
                  select p.id from MarketPrice p
                  where p.market = m and p.commodity.id = :commodityId
              ))
            """)
    Page<Market> search(
            @Param("search") String search,
            @Param("state") String state,
            @Param("district") String district,
            @Param("commodityId") UUID commodityId,
            Pageable pageable);
}