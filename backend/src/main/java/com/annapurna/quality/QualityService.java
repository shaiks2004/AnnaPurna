package com.annapurna.quality;

import com.annapurna.auth.AccessControlService;
import com.annapurna.auth.PlatformUserRepository;
import com.annapurna.common.web.InvalidRequestException;
import com.annapurna.common.web.Pagination;
import com.annapurna.common.web.ResourceNotFoundException;
import com.annapurna.lot.Lot;
import com.annapurna.lot.LotDocumentRepository;
import com.annapurna.lot.LotDocumentResponse;
import com.annapurna.lot.LotLocationRepository;
import com.annapurna.lot.LotLocationResponse;
import com.annapurna.lot.LotRepository;
import com.annapurna.lot.LotResponse;
import com.annapurna.user.PlatformUser;
import java.math.BigDecimal;
import java.time.Instant;
import java.util.Comparator;
import java.util.List;
import java.util.UUID;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
import org.springframework.security.access.AccessDeniedException;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
public class QualityService {
    private static final Sort DEFAULT_SORT = Sort.by(Sort.Order.desc("testedAt"), Sort.Order.desc("id"));

    private final LotRepository lotRepository;
    private final QualityTestRepository qualityTestRepository;
    private final QualityMeasurementRepository qualityMeasurementRepository;
    private final LotDocumentRepository lotDocumentRepository;
    private final LotLocationRepository lotLocationRepository;
    private final PlatformUserRepository platformUserRepository;
    private final AccessControlService accessControlService;

    public QualityService(
            LotRepository lotRepository,
            QualityTestRepository qualityTestRepository,
            QualityMeasurementRepository qualityMeasurementRepository,
            LotDocumentRepository lotDocumentRepository,
            LotLocationRepository lotLocationRepository,
            PlatformUserRepository platformUserRepository,
            AccessControlService accessControlService) {
        this.lotRepository = lotRepository;
        this.qualityTestRepository = qualityTestRepository;
        this.qualityMeasurementRepository = qualityMeasurementRepository;
        this.lotDocumentRepository = lotDocumentRepository;
        this.lotLocationRepository = lotLocationRepository;
        this.platformUserRepository = platformUserRepository;
        this.accessControlService = accessControlService;
    }

    @Transactional(readOnly = true)
    public Page<QualityTestResponse> listTestsForLot(UUID lotId, int page, int size) {
        requireLotAccess(lotId);
        Pageable pageable = Pagination.of(page, size, DEFAULT_SORT);
        return qualityTestRepository.findByLotId(lotId, pageable).map(QualityTestResponse::from);
    }

    @Transactional(readOnly = true)
    public QualityTestResponse getTest(UUID testId) {
        QualityTest test = findTest(testId);
        if (test.getLot() == null || test.getLot().getId() == null) {
            throw new ResourceNotFoundException("Quality test");
        }
        requireLotAccess(test.getLot().getId());
        return QualityTestResponse.from(test);
    }

    @Transactional
    public QualityTestResponse createTest(UUID lotId, QualityTestCreateRequest request) {
        accessControlService.requireInspectionAccess(lotId);
        Lot lot = findLot(lotId);
        PlatformUser inspector = platformUserRepository.findById(accessControlService.current().userId())
                .orElseThrow(() -> new ResourceNotFoundException("Inspector user"));
        QualityTest test = QualityTest.create(
                lot,
                inspector,
                request.testType().trim(),
                request.sampledAt(),
                request.testedAt(),
                request.methodCode().trim(),
                request.sourceCode() == null || request.sourceCode().isBlank() ? "MANUAL" : request.sourceCode().trim(),
                request.notes());
        return QualityTestResponse.from(qualityTestRepository.save(test));
    }

    @Transactional
    public QualityTestResponse transitionTo(UUID testId, QualityTestStatus nextStatus) {
        QualityTest test = findTest(testId);
        if (test.getLot() == null || test.getLot().getId() == null) {
            throw new ResourceNotFoundException("Quality test");
        }
        requireInspectionAccess(test.getLot().getId());
        if (nextStatus == null) {
            throw new InvalidRequestException("Target status is required");
        }
        try {
            test.transitionTo(nextStatus);
        } catch (IllegalStateException ex) {
            throw new InvalidRequestException(ex.getMessage());
        }
        return QualityTestResponse.from(test);
    }

    @Transactional
    public QualityTestResponse verifyTest(UUID testId) {
        QualityTest test = findTest(testId);
        if (test.getLot() == null || test.getLot().getId() == null) {
            throw new ResourceNotFoundException("Quality test");
        }
        requireInspectionAccess(test.getLot().getId());
        if (test.getStatus() != QualityTestStatus.TESTED) {
            throw new InvalidRequestException("Only TESTED quality tests can be verified");
        }
        test.setStatus(QualityTestStatus.VERIFIED);
        test.setVerifiedAt(Instant.now());
        PlatformUser verifier = platformUserRepository.findById(accessControlService.current().userId())
                .orElseThrow(() -> new ResourceNotFoundException("Verifier user"));
        test.setVerifiedByUser(verifier);
        return QualityTestResponse.from(test);
    }

    @Transactional
    public QualityMeasurementResponse createMeasurement(UUID testId, QualityMeasurementCreateRequest request) {
        QualityTest test = findTest(testId);
        if (test.getLot() == null || test.getLot().getId() == null) {
            throw new ResourceNotFoundException("Quality test");
        }
        requireInspectionAccess(test.getLot().getId());
        if (request.numericValue() == null || request.numericValue().signum() < 0) {
            throw new InvalidRequestException("Measurement value must be non-negative");
        }
        if (request.unit() == null || request.unit().isBlank()) {
            throw new InvalidRequestException("Measurement unit is required");
        }
        if (test.getStatus() == QualityTestStatus.VERIFIED) {
            throw new InvalidRequestException("Verified quality tests cannot be modified");
        }
        QualityMeasurement measurement = QualityMeasurement.create(
                test,
                request.metricName().trim(),
                request.numericValue(),
                request.unit().trim(),
                request.textValue());
        return QualityMeasurementResponse.from(qualityMeasurementRepository.save(measurement));
    }

    @Transactional(readOnly = true)
    public List<QualityMeasurementResponse> listMeasurements(UUID testId) {
        QualityTest test = findTest(testId);
        requireLotAccess(test.getLot().getId());
        return qualityMeasurementRepository.findByQualityTestIdOrderByIdAsc(testId).stream()
                .map(QualityMeasurementResponse::from)
                .toList();
    }

    @Transactional(readOnly = true)
    public LotPassportResponse getLotPassport(UUID lotId) {
        Lot lot = findLot(lotId);
        requireLotAccess(lotId);
        String supplierType = lot.getFarmer() != null ? "FARMER" : "FPO";
        UUID supplierId = lot.getFarmer() != null ? lot.getFarmer().getId() : lot.getOrganization().getId();
        LotLocationResponse location = lotLocationRepository.findByLotId(lotId)
                .map(LotLocationResponse::from)
                .orElse(null);
        List<LotDocumentResponse> documents = lotDocumentRepository.findByLotIdOrderByCreatedAtAsc(lotId).stream()
                .map(LotDocumentResponse::from)
                .toList();
        List<QualityTestResponse> tests = qualityTestRepository.findByLotIdOrderByTestedAtDesc(lotId).stream()
                .map(QualityTestResponse::from)
                .toList();
        QualityTestResponse latestVerified = tests.stream()
                .filter(test -> test.status() == QualityTestStatus.VERIFIED)
                .findFirst()
                .orElse(null);
        return LotPassportResponse.from(lot, supplierType, supplierId, location, documents, tests, latestVerified);
    }

    private Lot findLot(UUID lotId) {
        return lotRepository.findById(lotId).orElseThrow(() -> new ResourceNotFoundException("Lot"));
    }

    private QualityTest findTest(UUID testId) {
        return qualityTestRepository.findById(testId).orElseThrow(() -> new ResourceNotFoundException("Quality test"));
    }

    private void requireLotAccess(UUID lotId) {
        try {
            Lot lot = findLot(lotId);
            if (lot.getFarmer() != null) {
                if (lot.getFarmer().getUser() == null) {
                    throw new ResourceNotFoundException("Lot");
                }
                accessControlService.requireFarmerAccess(lot.getFarmer().getUser().getId());
            } else if (lot.getOrganization() != null) {
                accessControlService.requireOrganizationAccess(lot.getOrganization().getId());
            } else {
                throw new ResourceNotFoundException("Lot");
            }
        } catch (AccessDeniedException ex) {
            throw new ResourceNotFoundException("Lot");
        }
    }

    private void requireInspectionAccess(UUID lotId) {
        try {
            accessControlService.requireInspectionAccess(lotId);
            requireLotAccess(lotId);
        } catch (AccessDeniedException ex) {
            throw new ResourceNotFoundException("Lot");
        }
    }
}
