package com.annapurna.commodity;

import com.annapurna.common.web.PageResponse;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.security.SecurityRequirement;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import jakarta.validation.constraints.Max;
import jakarta.validation.constraints.Min;
import java.util.UUID;
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
@RequestMapping("/api/v1/commodities")
@Tag(name = "Commodities")
@SecurityRequirement(name = "bearerAuth")
public class CommodityController {
    private final CommodityService commodityService;

    public CommodityController(CommodityService commodityService) {
        this.commodityService = commodityService;
    }

    @GetMapping
    @Operation(summary = "List commodities", description = "Authenticated users may search and page commodities.")
    public PageResponse<CommodityResponse> list(
            @RequestParam(required = false) String search,
            @RequestParam(defaultValue = "0") @Min(0) int page,
            @RequestParam(defaultValue = "20") @Min(1) @Max(100) int size) {
        return PageResponse.from(commodityService.list(search, page, size));
    }

    @GetMapping("/{commodityId}")
    @Operation(summary = "Get a commodity")
    public CommodityResponse get(@PathVariable UUID commodityId) {
        return commodityService.get(commodityId);
    }

    @PostMapping
    @ResponseStatus(HttpStatus.CREATED)
    @Operation(summary = "Create a commodity", description = "Requires the ADMIN role.")
    public CommodityResponse create(@Valid @RequestBody CommodityCreateRequest request) {
        return commodityService.create(request);
    }

    @PatchMapping("/{commodityId}")
    @Operation(summary = "Update a commodity", description = "Requires the ADMIN role.")
    public CommodityResponse update(
            @PathVariable UUID commodityId, @Valid @RequestBody CommodityPatchRequest request) {
        return commodityService.update(commodityId, request);
    }
}