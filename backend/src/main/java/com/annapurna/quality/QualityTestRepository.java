package com.annapurna.quality;

import java.util.List;
import java.util.UUID;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;

public interface QualityTestRepository extends JpaRepository<QualityTest, UUID> {
    Page<QualityTest> findByLotId(UUID lotId, Pageable pageable);
    List<QualityTest> findByLotIdOrderByTestedAtDesc(UUID lotId);
}
