package com.annapurna.marketprice;

import java.math.BigDecimal;
import java.time.Instant;
import java.time.LocalDate;
import java.util.UUID;

public record MarketPriceResponse(
        UUID id,
        UUID commodityId,
        UUID marketId,
        LocalDate observedOn,
        LocalDate periodStart,
        LocalDate periodEnd,
        BigDecimal minPrice,
        BigDecimal maxPrice,
        BigDecimal modalPrice,
        String currencyCode,
        String priceUnit,
        BigDecimal arrivalQuantity,
        String arrivalQuantityUnit,
        String sourceName,
        String sourceReference,
        Instant createdAt) {
    public static MarketPriceResponse from(MarketPrice price) {
        return new MarketPriceResponse(
                price.getId(),
                price.getCommodity().getId(),
                price.getMarket().getId(),
                price.getObservedOn(),
                price.getPeriodStart(),
                price.getPeriodEnd(),
                price.getMinPrice(),
                price.getMaxPrice(),
                price.getModalPrice(),
                price.getCurrencyCode(),
                price.getPriceUnit(),
                price.getArrivalQuantity(),
                price.getArrivalQuantityUnit(),
                price.getSourceName(),
                price.getSourceReference(),
                price.getCreatedAt());
    }
}