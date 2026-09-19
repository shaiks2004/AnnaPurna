package com.annapurna.quality;

import com.annapurna.common.persistence.AuditableEntity;
import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.FetchType;
import jakarta.persistence.JoinColumn;
import jakarta.persistence.ManyToOne;
import jakarta.persistence.Table;
import java.math.BigDecimal;

@Entity
@Table(name = "quality_measurement")
public class QualityMeasurement extends AuditableEntity {
    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "quality_test_id", nullable = false)
    private QualityTest qualityTest;

    @Column(name = "metric_name", nullable = false, length = 128)
    private String metricName;

    @Column(name = "numeric_value", precision = 19, scale = 4)
    private BigDecimal numericValue;

    @Column(name = "unit", length = 32)
    private String unit;

    @Column(name = "text_value", length = 512)
    private String textValue;

    protected QualityMeasurement() {}

    public static QualityMeasurement create(QualityTest qualityTest, String metricName, BigDecimal numericValue, String unit, String textValue) {
        QualityMeasurement measurement = new QualityMeasurement();
        measurement.qualityTest = qualityTest;
        measurement.metricName = metricName.trim();
        measurement.numericValue = numericValue;
        measurement.unit = unit == null || unit.isBlank() ? null : unit.trim();
        measurement.textValue = textValue == null || textValue.isBlank() ? null : textValue.trim();
        return measurement;
    }

    public QualityTest getQualityTest() { return qualityTest; }
    public String getMetricName() { return metricName; }
    public BigDecimal getNumericValue() { return numericValue; }
    public String getUnit() { return unit; }
    public String getTextValue() { return textValue; }
}
