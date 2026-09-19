package com.annapurna.market;

import com.annapurna.common.web.PageResponse;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.security.SecurityRequirement;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import jakarta.validation.constraints.Max;
import jakarta.validation.constraints.Min;
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
@RequestMapping("/api/v1/markets")
@Tag(name = "Markets")
@SecurityRequirement(name = "bearerAuth")
public class MarketController {
    private final MarketService marketService;

    public MarketController(MarketService marketService) {
        this.marketService = marketService;
    }

    @GetMapping
    @Operation(summary = "List markets", description = "Authenticated users may filter and page markets.")
    public PageResponse<MarketResponse> list(
            @RequestParam(required = false) String search,
            @RequestParam(required = false) String state,
            @RequestParam(required = false) String district,
            @RequestParam(required = false) UUID commodityId,
            @RequestParam(defaultValue = "0") @Min(0) int page,
            @RequestParam(defaultValue = "20") @Min(1) @Max(100) int size) {
        return PageResponse.from(marketService.list(search, state, district, commodityId, page, size));
    }

    @GetMapping("/{marketId}")
    @Operation(summary = "Get a market")
    public MarketResponse get(@PathVariable UUID marketId) {
        return marketService.get(marketId);
    }

    @PostMapping
    @ResponseStatus(HttpStatus.CREATED)
    @Operation(summary = "Create a market", description = "Requires the ADMIN role.")
    public MarketResponse create(@Valid @RequestBody MarketCreateRequest request) {
        return marketService.create(request);
    }

    @PatchMapping("/{marketId}")
    @Operation(summary = "Update a market", description = "Requires the ADMIN role.")
    public MarketResponse update(@PathVariable UUID marketId, @Valid @RequestBody MarketPatchRequest request) {
        return marketService.update(marketId, request);
    }
}