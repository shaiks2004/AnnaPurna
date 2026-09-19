package com.annapurna.matching;

import com.annapurna.lot.LotRepository;
import com.annapurna.lot.LotStatus;
import com.annapurna.requirement.Requirement;
import java.util.List;
import org.springframework.stereotype.Component;

@Component
public class JpaCandidateLotProvider implements CandidateLotProvider {
    private static final List<LotStatus> ELIGIBLE_STATUSES = List.of(LotStatus.VERIFIED, LotStatus.AVAILABLE);

    private final LotRepository lotRepository;

    public JpaCandidateLotProvider(LotRepository lotRepository) {
        this.lotRepository = lotRepository;
    }

    @Override
    public List<MatchCandidate> findCandidates(Requirement requirement) {
        return lotRepository.findByCommodityIdAndStatusIn(requirement.getCommodity().getId(), ELIGIBLE_STATUSES)
                .stream()
                .map(lot -> new MatchCandidate(
                        lot.getId(),
                        lot.getCommodity().getId(),
                        lot.getQuantity(),
                        lot.getQuantityUnit(),
                        lot.getAvailableFrom(),
                        lot.getStatus()))
                .toList();
    }
}
