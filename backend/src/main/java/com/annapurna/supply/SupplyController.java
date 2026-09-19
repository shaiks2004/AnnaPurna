package com.annapurna.supply;

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
@RequestMapping("/api/v1/supplies")
@Tag(name = "Supply")
@SecurityRequirement(name = "bearerAuth")
public class SupplyController {
    private final SupplyService supplyService;

    public SupplyController(SupplyService supplyService) {
        this.supplyService = supplyService;
    }

    @PostMapping
    @ResponseStatus(HttpStatus.CREATED)
    @Operation(summary = "Create a supply declaration")
    public SupplyResponse create(@Valid @RequestBody SupplyCreateRequest request) {
        return supplyService.create(request);
    }

    @GetMapping
    @Operation(summary = "List visible supply declarations")
    public PageResponse<SupplyResponse> list(
            @RequestParam(required = false) UUID commodityId,
            @RequestParam(required = false) UUID farmerId,
            @RequestParam(required = false) UUID organizationId,
            @RequestParam(required = false) SupplyKind supplyKind,
            @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate expectedFrom,
            @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate expectedTo,
            @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate availableFrom,
            @RequestParam(defaultValue = "0") @Min(0) int page,
            @RequestParam(defaultValue = "20") @Min(1) @Max(100) int size) {
        return PageResponse.from(supplyService.list(
                commodityId, farmerId, organizationId, supplyKind,
                expectedFrom, expectedTo, availableFrom, page, size));
    }

    @GetMapping("/{supplyId}")
    @Operation(summary = "Get a visible supply declaration")
    public SupplyResponse get(@PathVariable UUID supplyId) {
        return supplyService.get(supplyId);
    }

    @PatchMapping("/{supplyId}")
    @Operation(summary = "Update an owned supply declaration")
    public SupplyResponse update(@PathVariable UUID supplyId, @Valid @RequestBody SupplyPatchRequest request) {
        return supplyService.update(supplyId, request);
    }
}