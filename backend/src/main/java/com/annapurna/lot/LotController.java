package com.annapurna.lot;

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
@RequestMapping("/api/v1/lots")
@Tag(name = "Lots")
@SecurityRequirement(name = "bearerAuth")
public class LotController {
    private final LotService lotService;

    public LotController(LotService lotService) {
        this.lotService = lotService;
    }

    @PostMapping
    @ResponseStatus(HttpStatus.CREATED)
    @Operation(summary = "Create a physical lot", description = "Creates a lot in the server-controlled DECLARED state.")
    public LotResponse create(@Valid @RequestBody LotCreateRequest request) {
        return lotService.create(request);
    }

    @GetMapping
    @Operation(summary = "List visible physical lots")
    public PageResponse<LotResponse> list(
            @RequestParam(required = false) String search,
            @RequestParam(required = false) UUID commodityId,
            @RequestParam(required = false) UUID farmerId,
            @RequestParam(required = false) UUID organizationId,
            @RequestParam(required = false) UUID sourceSupplyId,
            @RequestParam(required = false) LotStatus status,
            @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate availableFrom,
            @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate availableTo,
            @RequestParam(defaultValue = "0") @Min(0) int page,
            @RequestParam(defaultValue = "20") @Min(1) @Max(100) int size) {
        return PageResponse.from(lotService.list(
                search, commodityId, farmerId, organizationId, sourceSupplyId, status,
                availableFrom, availableTo, page, size));
    }

    @GetMapping("/{lotId}")
    @Operation(summary = "Get a visible physical lot")
    public LotResponse get(@PathVariable UUID lotId) {
        return lotService.get(lotId);
    }

    @PatchMapping("/{lotId}")
    @Operation(summary = "Update an owned DECLARED lot")
    public LotResponse update(@PathVariable UUID lotId, @Valid @RequestBody LotPatchRequest request) {
        return lotService.update(lotId, request);
    }
}