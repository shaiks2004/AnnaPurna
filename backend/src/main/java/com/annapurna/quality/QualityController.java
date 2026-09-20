package com.annapurna.quality;

import com.annapurna.common.web.PageResponse;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.security.SecurityRequirement;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import jakarta.validation.constraints.Max;
import jakarta.validation.constraints.Min;
import java.util.List;
import java.util.UUID;
import org.springframework.http.HttpStatus;
import org.springframework.validation.annotation.Validated;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.ResponseStatus;
import org.springframework.web.bind.annotation.RestController;

@RestController
@Validated
@Tag(name = "Quality")
@SecurityRequirement(name = "bearerAuth")
public class QualityController {
    private final QualityService qualityService;

    public QualityController(QualityService qualityService) {
        this.qualityService = qualityService;
    }

    @PostMapping("/api/v1/lots/{lotId}/quality-tests")
    @ResponseStatus(HttpStatus.CREATED)
    @Operation(summary = "Create a quality test for a lot")
    public QualityTestResponse createTest(@PathVariable UUID lotId, @Valid @RequestBody QualityTestCreateRequest request) {
        return qualityService.createTest(lotId, request);
    }

    @GetMapping("/api/v1/lots/{lotId}/quality-tests")
    @Operation(summary = "List quality tests for a lot")
    public PageResponse<QualityTestResponse> listTestsForLot(
            @PathVariable UUID lotId,
            @RequestParam(defaultValue = "0") @Min(0) int page,
            @RequestParam(defaultValue = "20") @Min(1) @Max(100) int size) {
        return PageResponse.from(qualityService.listTestsForLot(lotId, page, size));
    }

    @GetMapping("/api/v1/quality-tests/{testId}")
    @Operation(summary = "Read a single quality test")
    public QualityTestResponse getTest(@PathVariable UUID testId) {
        return qualityService.getTest(testId);
    }

    @PostMapping("/api/v1/quality-tests/{testId}/results")
    @ResponseStatus(HttpStatus.CREATED)
    @Operation(summary = "Add a measurement result to a quality test")
    public QualityMeasurementResponse addMeasurement(
            @PathVariable UUID testId,
            @Valid @RequestBody QualityMeasurementCreateRequest request) {
        return qualityService.createMeasurement(testId, request);
    }

    @GetMapping("/api/v1/quality-tests/{testId}/results")
    @Operation(summary = "List measurement results for a quality test")
    public List<QualityMeasurementResponse> listMeasurements(@PathVariable UUID testId) {
        return qualityService.listMeasurements(testId);
    }

    @PostMapping("/api/v1/quality-tests/{testId}/verify")
    @Operation(summary = "Verify a quality test")
    public QualityTestResponse verifyTest(@PathVariable UUID testId) {
        return qualityService.verifyTest(testId);
    }

    @GetMapping("/api/v1/lots/{lotId}/passport")
    @Operation(summary = "Read the lot passport")
    public LotPassportResponse getPassport(@PathVariable UUID lotId) {
        return qualityService.getLotPassport(lotId);
    }
}
