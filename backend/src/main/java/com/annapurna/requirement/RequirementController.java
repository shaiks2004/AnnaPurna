package com.annapurna.requirement;

import com.annapurna.common.web.PageResponse;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.security.SecurityRequirement;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import jakarta.validation.constraints.Max;
import jakarta.validation.constraints.Min;
import java.time.LocalDate;
import java.util.UUID;
import org.springframework.format.annotation.DateTimeFormat;
import org.springframework.http.HttpStatus;
import org.springframework.validation.annotation.Validated;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PatchMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.ResponseStatus;
import org.springframework.web.bind.annotation.RestController;

@RestController
@Validated
@RequestMapping("/api/v1/requirements")
@Tag(name = "Requirements")
@SecurityRequirement(name = "bearerAuth")
public class RequirementController {
    private final RequirementService requirementService;

    public RequirementController(RequirementService requirementService) {
        this.requirementService = requirementService;
    }

    @PostMapping
    @ResponseStatus(HttpStatus.CREATED)
    @Operation(summary = "Create a buyer procurement requirement")
    public RequirementResponse create(@Valid @RequestBody RequirementCreateRequest request) {
        return requirementService.create(request);
    }

    @GetMapping
    @Operation(summary = "List visible buyer requirements")
    public PageResponse<RequirementResponse> list(
            @RequestParam(required = false) UUID buyerOrganizationId,
            @RequestParam(required = false) UUID commodityId,
            @RequestParam(required = false) RequirementStatus status,
            @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate requiredBy,
            @RequestParam(defaultValue = "0") @Min(0) int page,
            @RequestParam(defaultValue = "20") @Min(1) @Max(100) int size) {
        return PageResponse.from(requirementService.list(buyerOrganizationId, commodityId, status, requiredBy, page, size));
    }

    @GetMapping("/{requirementId}")
    @Operation(summary = "Get a buyer requirement")
    public RequirementResponse get(@PathVariable UUID requirementId) {
        return requirementService.get(requirementId);
    }

    @PatchMapping("/{requirementId}")
    @Operation(summary = "Update a draft buyer requirement", description = "PATCH does not allow lifecycle status changes. Closed requirements cannot be edited.")
    public RequirementResponse update(@PathVariable UUID requirementId, @Valid @RequestBody RequirementPatchRequest request) {
        return requirementService.update(requirementId, request);
    }

    @PostMapping("/{requirementId}/publish")
    @Operation(summary = "Publish a draft buyer requirement")
    public RequirementResponse publish(@PathVariable UUID requirementId) {
        return requirementService.publish(requirementId);
    }

    @PostMapping("/{requirementId}/close")
    @Operation(summary = "Close an open or published buyer requirement")
    public RequirementResponse close(@PathVariable UUID requirementId) {
        return requirementService.close(requirementId);
    }

    @PostMapping("/{requirementId}/open")
    @Operation(summary = "Open a published buyer requirement")
    public RequirementResponse open(@PathVariable UUID requirementId) {
        return requirementService.open(requirementId);
    }
}
