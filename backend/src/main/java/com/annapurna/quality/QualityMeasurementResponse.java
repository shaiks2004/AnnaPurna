package com.annapurna.quality;

import java.math.BigDecimal;
import java.util.UUID;

public record QualityMeasurementResponse(
        UUID id,
        UUID qualityTestId,
        String metricName,
        BigDecimal numericValue,
        String unit,
        String textValue) {
    public static QualityMeasurementResponse from(QualityMeasurement measurement) {
        return new QualityMeasurementResponse(
                measurement.getId(),
                measurement.getQualityTest().getId(),
                measurement.getMetricName(),
                measurement.getNumericValue(),
                measurement.getUnit(),
                measurement.getTextValue());
    }
}
