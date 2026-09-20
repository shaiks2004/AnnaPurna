package com.annapurna.market;

import com.annapurna.auth.AccessControlService;
import com.annapurna.common.web.InvalidRequestException;
import com.annapurna.common.web.Pagination;
import com.annapurna.common.web.ResourceNotFoundException;
import java.util.UUID;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Sort;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
public class MarketService {
    private static final Sort DEFAULT_SORT = Sort.by(Sort.Order.asc("name"), Sort.Order.asc("id"));

    private final MarketRepository marketRepository;
    private final AccessControlService accessControlService;

    public MarketService(MarketRepository marketRepository, AccessControlService accessControlService) {
        this.marketRepository = marketRepository;
        this.accessControlService = accessControlService;
    }

    @Transactional(readOnly = true)
    public Page<MarketResponse> list(String search, String state, String district, UUID commodityId, int page, int size) {
        var pageable = Pagination.of(page, size, DEFAULT_SORT);
        Page<Market> markets = marketRepository.search(
                normalize(search), normalize(state), normalize(district), commodityId, pageable);
        return markets.map(MarketResponse::from);
    }

    @Transactional(readOnly = true)
    public MarketResponse get(UUID id) {
        return MarketResponse.from(find(id));
    }

    @Transactional
    public MarketResponse create(MarketCreateRequest request) {
        accessControlService.requireAdmin();
        Market market = Market.create(
                request.name().trim(),
                request.marketCode().trim(),
                trimToNull(request.marketTypeCode()),
                trimToNull(request.state()),
                trimToNull(request.district()),
                request.active());
        return MarketResponse.from(marketRepository.save(market));
    }

    @Transactional
    public MarketResponse update(UUID id, MarketPatchRequest request) {
        accessControlService.requireAdmin();
        if (!request.hasChanges()) {
            throw new InvalidRequestException("At least one market field must be supplied");
        }
        Market market = find(id);
        market.update(
                request.name() == null ? market.getName() : request.name().trim(),
                request.marketCode() == null ? market.getMarketCode() : request.marketCode().trim(),
                request.marketTypeCode() == null ? market.getMarketTypeCode() : trimToNull(request.marketTypeCode()),
                request.state() == null ? market.getState() : trimToNull(request.state()),
                request.district() == null ? market.getDistrict() : trimToNull(request.district()),
                request.active() == null ? market.isActive() : request.active());
        return MarketResponse.from(market);
    }

    private Market find(UUID id) {
        return marketRepository.findById(id).orElseThrow(() -> new ResourceNotFoundException("Market"));
    }

    private static String normalize(String value) {
        return value == null || value.isBlank() ? null : value.trim();
    }

    private static String trimToNull(String value) {
        return value == null || value.isBlank() ? null : value.trim();
    }
}