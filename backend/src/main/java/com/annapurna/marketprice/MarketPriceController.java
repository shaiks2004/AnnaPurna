package com.annapurna.marketprice;

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
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.ResponseStatus;
import org.springframework.web.bind.annotation.RestController;

@RestController
@Validated
@RequestMapping("/api/v1/market-prices")
@Tag(name = "Market Prices")
@SecurityRequirement(name = "bearerAuth")
public class MarketPriceController {
    private final MarketPriceService marketPriceService;

    public MarketPriceController(MarketPriceService marketPriceService) {
        this.marketPriceService = marketPriceService;
    }

    @GetMapping
    @Operation(summary = "List market-price observations", description = "Authenticated users may filter and page source-traceable observations.")
    public PageResponse<MarketPriceResponse> list(
            @RequestParam(required = false) UUID commodityId,
            @RequestParam(required = false) UUID marketId,
            @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate from,
            @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate to,
            @RequestParam(defaultValue = "0") @Min(0) int page,
            @RequestParam(defaultValue = "20") @Min(1) @Max(100) int size) {
        return PageResponse.from(marketPriceService.list(commodityId, marketId, from, to, page, size));
    }

    @GetMapping("/{priceId}")
    @Operation(summary = "Get a market-price observation")
    public MarketPriceResponse get(@PathVariable UUID priceId) {
        return marketPriceService.get(priceId);
    }

    @PostMapping
    @ResponseStatus(HttpStatus.CREATED)
    @Operation(summary = "Create a market-price observation", description = "Requires the ADMIN role. Source fields are preserved for traceability.")
    public MarketPriceResponse create(@Valid @RequestBody MarketPriceCreateRequest request) {
        return marketPriceService.create(request);
    }
}