package com.annapurna.quality;

import java.util.List;
import java.util.UUID;
import org.springframework.data.jpa.repository.JpaRepository;

public interface QualityMeasurementRepository extends JpaRepository<QualityMeasurement, UUID> {
    List<QualityMeasurement> findByQualityTestIdOrderByIdAsc(UUID qualityTestId);
}
