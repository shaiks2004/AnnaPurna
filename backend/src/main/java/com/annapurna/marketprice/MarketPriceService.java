package com.annapurna.marketprice;

import com.annapurna.auth.AccessControlService;
import com.annapurna.commodity.Commodity;
import com.annapurna.commodity.CommodityRepository;
import com.annapurna.common.web.InvalidRequestException;
import com.annapurna.common.web.Pagination;
import com.annapurna.common.web.ResourceNotFoundException;
import com.annapurna.market.Market;
import com.annapurna.market.MarketRepository;
import java.math.BigDecimal;
import java.time.LocalDate;
import java.util.UUID;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Sort;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
public class MarketPriceService {
    private static final Sort DEFAULT_SORT = Sort.by(Sort.Order.desc("observedOn"), Sort.Order.desc("id"));

    private final MarketPriceRepository marketPriceRepository;
    private final CommodityRepository commodityRepository;
    private final MarketRepository marketRepository;
    private final AccessControlService accessControlService;

    public MarketPriceService(
            MarketPriceRepository marketPriceRepository,
            CommodityRepository commodityRepository,
            MarketRepository marketRepository,
            AccessControlService accessControlService) {
        this.marketPriceRepository = marketPriceRepository;
        this.commodityRepository = commodityRepository;
        this.marketRepository = marketRepository;
        this.accessControlService = accessControlService;
    }

    @Transactional(readOnly = true)
    public Page<MarketPriceResponse> list(
            UUID commodityId, UUID marketId, LocalDate from, LocalDate to, int page, int size) {
        validateDateRange(from, to);
        var pageable = Pagination.of(page, size, DEFAULT_SORT);
        return marketPriceRepository.search(commodityId, marketId, from, to, pageable)
                .map(MarketPriceResponse::from);
    }

    @Transactional(readOnly = true)
    public MarketPriceResponse get(UUID id) {
        return MarketPriceResponse.from(find(id));
    }

    @Transactional
    public MarketPriceResponse create(MarketPriceCreateRequest request) {
        accessControlService.requireAdmin();
        validateValues(request);
        Commodity commodity = commodityRepository.findById(request.commodityId())
                .orElseThrow(() -> new ResourceNotFoundException("Commodity"));
        Market market = marketRepository.findById(request.marketId())
                .orElseThrow(() -> new ResourceNotFoundException("Market"));
        MarketPrice price = MarketPrice.create(
                commodity,
                market,
                request.observedOn(),
                request.periodStart(),
                request.periodEnd(),
                request.minPrice(),
                request.maxPrice(),
                request.modalPrice(),
                trimToNull(request.currencyCode()),
                request.priceUnit().trim(),
                request.arrivalQuantity(),
                trimToNull(request.arrivalQuantityUnit()),
                request.sourceName().trim(),
                trimToNull(request.sourceReference()));
        return MarketPriceResponse.from(marketPriceRepository.save(price));
    }

    private MarketPrice find(UUID id) {
        return marketPriceRepository.findById(id).orElseThrow(() -> new ResourceNotFoundException("Market price"));
    }

    private static void validateValues(MarketPriceCreateRequest request) {
        validateDateRange(request.periodStart(), request.periodEnd());
        validateNonNegative("Minimum price", request.minPrice());
        validateNonNegative("Maximum price", request.maxPrice());
        validateNonNegative("Modal price", request.modalPrice());
        validateNonNegative("Arrival quantity", request.arrivalQuantity());
        if (request.minPrice() != null && request.maxPrice() != null
                && request.minPrice().compareTo(request.maxPrice()) > 0) {
            throw new InvalidRequestException("Minimum price cannot exceed maximum price");
        }
    }

    private static void validateDateRange(LocalDate from, LocalDate to) {
        if (from != null && to != null && from.isAfter(to)) {
            throw new InvalidRequestException("The start date cannot be after the end date");
        }
    }

    private static void validateNonNegative(String field, BigDecimal value) {
        if (value != null && value.signum() < 0) {
            throw new InvalidRequestException(field + " cannot be negative");
        }
    }

    private static String trimToNull(String value) {
        return value == null || value.isBlank() ? null : value.trim();
    }
}