package com.annapurna.requirement;

import java.time.LocalDate;
import java.util.Collection;
import java.util.UUID;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

public interface RequirementRepository extends JpaRepository<Requirement, UUID> {
    @Query("""
            select r from Requirement r
            where (:buyerOrganizationId is null or r.buyerProfile.organization.id = :buyerOrganizationId)
              and (:commodityId is null or r.commodity.id = :commodityId)
              and (:status is null or r.status = :status)
              and (:requiredBy is null or r.requiredBy = :requiredBy)
              and (:unrestricted = true or r.buyerProfile.organization.id in :organizationIds)
            """)
    Page<Requirement> search(
            @Param("buyerOrganizationId") UUID buyerOrganizationId,
            @Param("commodityId") UUID commodityId,
            @Param("status") RequirementStatus status,
            @Param("requiredBy") LocalDate requiredBy,
            @Param("unrestricted") boolean unrestricted,
            @Param("organizationIds") Collection<UUID> organizationIds,
            Pageable pageable);
}
