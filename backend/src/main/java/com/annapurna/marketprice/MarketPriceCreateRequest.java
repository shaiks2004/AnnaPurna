package com.annapurna.marketprice;

import jakarta.validation.constraints.Digits;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Pattern;
import jakarta.validation.constraints.Size;
import java.math.BigDecimal;
import java.time.LocalDate;
import java.util.UUID;

public record MarketPriceCreateRequest(
        @NotNull UUID commodityId,
        @NotNull UUID marketId,
        @NotNull LocalDate observedOn,
        LocalDate periodStart,
        LocalDate periodEnd,
        @Digits(integer = 15, fraction = 4) BigDecimal minPrice,
        @Digits(integer = 15, fraction = 4) BigDecimal maxPrice,
        @Digits(integer = 15, fraction = 4) BigDecimal modalPrice,
        @Pattern(regexp = "[A-Za-z]{3}") String currencyCode,
        @NotBlank @Size(max = 32) String priceUnit,
        @Digits(integer = 16, fraction = 3) BigDecimal arrivalQuantity,
        @Size(max = 32) String arrivalQuantityUnit,
        @NotBlank @Size(max = 255) String sourceName,
        @Size(max = 512) String sourceReference) {}