package com.annapurna.commodity;

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
public class CommodityService {
    private static final Sort DEFAULT_SORT = Sort.by(Sort.Order.asc("name"), Sort.Order.asc("id"));

    private final CommodityRepository commodityRepository;
    private final AccessControlService accessControlService;

    public CommodityService(CommodityRepository commodityRepository, AccessControlService accessControlService) {
        this.commodityRepository = commodityRepository;
        this.accessControlService = accessControlService;
    }

    @Transactional(readOnly = true)
    public Page<CommodityResponse> list(String search, int page, int size) {
        var pageable = Pagination.of(page, size, DEFAULT_SORT);
        Page<Commodity> commodities = search == null || search.isBlank()
                ? commodityRepository.findAll(pageable)
                : commodityRepository.findByNameContainingIgnoreCase(search.trim(), pageable);
        return commodities.map(CommodityResponse::from);
    }

    @Transactional(readOnly = true)
    public CommodityResponse get(UUID id) {
        return CommodityResponse.from(find(id));
    }

    @Transactional
    public CommodityResponse create(CommodityCreateRequest request) {
        accessControlService.requireAdmin();
        Commodity commodity = Commodity.create(request.name().trim(), request.commodityCode().trim(), request.active());
        return CommodityResponse.from(commodityRepository.save(commodity));
    }

    @Transactional
    public CommodityResponse update(UUID id, CommodityPatchRequest request) {
        accessControlService.requireAdmin();
        if (!request.hasChanges()) {
            throw new InvalidRequestException("At least one commodity field must be supplied");
        }
        Commodity commodity = find(id);
        commodity.update(
                request.name() == null ? commodity.getName() : request.name().trim(),
                request.commodityCode() == null ? commodity.getCommodityCode() : request.commodityCode().trim(),
                request.active() == null ? commodity.isActive() : request.active());
        return CommodityResponse.from(commodity);
    }

    private Commodity find(UUID id) {
        return commodityRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Commodity"));
    }
}