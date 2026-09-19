package com.annapurna.quality;

import com.annapurna.common.persistence.AuditableEntity;
import com.annapurna.lot.Lot;
import com.annapurna.user.PlatformUser;
import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.EnumType;
import jakarta.persistence.Enumerated;
import jakarta.persistence.FetchType;
import jakarta.persistence.JoinColumn;
import jakarta.persistence.ManyToOne;
import jakarta.persistence.Table;
import java.time.Instant;

@Entity
@Table(name = "quality_test")
public class QualityTest extends AuditableEntity {
    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "lot_id", nullable = false)
    private Lot lot;

    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "inspector_user_id", nullable = false)
    private PlatformUser inspectorUser;

    @Column(name = "test_type_code", nullable = false, length = 64)
    private String testType;

    @Column(name = "sampled_at")
    private Instant sampledAt;

    @Column(name = "tested_at")
    private Instant testedAt;

    @Enumerated(EnumType.STRING)
    @Column(name = "status_code", nullable = false, length = 32)
    private QualityTestStatus status;

    @Column(name = "method_code", nullable = false, length = 64)
    private String methodCode;

    @Column(name = "source_code", nullable = false, length = 64)
    private String sourceCode;

    @Column(name = "notes", columnDefinition = "TEXT")
    private String notes;

    @Column(name = "verified_at")
    private Instant verifiedAt;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "verified_by_user_id")
    private PlatformUser verifiedByUser;

    protected QualityTest() {}

    public static QualityTest create(
            Lot lot,
            PlatformUser inspectorUser,
            String testType,
            Instant sampledAt,
            Instant testedAt,
            String methodCode,
            String sourceCode,
            String notes) {
        QualityTest qualityTest = new QualityTest();
        qualityTest.lot = lot;
        qualityTest.inspectorUser = inspectorUser;
        qualityTest.testType = testType.trim();
        qualityTest.sampledAt = sampledAt;
        qualityTest.testedAt = testedAt;
        qualityTest.methodCode = methodCode.trim();
        qualityTest.sourceCode = sourceCode == null || sourceCode.isBlank() ? "MANUAL" : sourceCode.trim();
        qualityTest.notes = notes == null || notes.isBlank() ? null : notes.trim();
        qualityTest.status = QualityTestStatus.CREATED;
        return qualityTest;
    }

    public void transitionTo(QualityTestStatus nextStatus) {
        if (status == null) {
            throw new IllegalStateException("Quality test is missing a status");
        }
        boolean allowed = switch (status) {
            case CREATED -> nextStatus == QualityTestStatus.SAMPLED || nextStatus == QualityTestStatus.REJECTED;
            case SAMPLED -> nextStatus == QualityTestStatus.TESTED || nextStatus == QualityTestStatus.REJECTED;
            case TESTED -> nextStatus == QualityTestStatus.VERIFIED || nextStatus == QualityTestStatus.REJECTED;
            case VERIFIED, REJECTED, EXPIRED -> false;
        };
        if (!allowed) {
            throw new IllegalStateException("Invalid quality test transition: " + status + " -> " + nextStatus);
        }
        this.status = nextStatus;
        if (nextStatus == QualityTestStatus.VERIFIED) {
            this.verifiedAt = Instant.now();
        }
    }

    public Lot getLot() { return lot; }
    public PlatformUser getInspectorUser() { return inspectorUser; }
    public String getTestType() { return testType; }
    public Instant getSampledAt() { return sampledAt; }
    public Instant getTestedAt() { return testedAt; }
    public QualityTestStatus getStatus() { return status; }
    public String getMethodCode() { return methodCode; }
    public String getSourceCode() { return sourceCode; }
    public String getNotes() { return notes; }
    public Instant getVerifiedAt() { return verifiedAt; }
    public PlatformUser getVerifiedByUser() { return verifiedByUser; }
    public void setSampledAt(Instant sampledAt) { this.sampledAt = sampledAt; }
    public void setTestedAt(Instant testedAt) { this.testedAt = testedAt; }
    public void setStatus(QualityTestStatus status) { this.status = status; }
    public void setVerifiedByUser(PlatformUser verifiedByUser) { this.verifiedByUser = verifiedByUser; }
    public void setVerifiedAt(Instant verifiedAt) { this.verifiedAt = verifiedAt; }
}
