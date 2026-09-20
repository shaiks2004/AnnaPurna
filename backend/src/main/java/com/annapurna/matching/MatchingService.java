package com.annapurna.matching;

import com.annapurna.auth.AccessControlService;
import com.annapurna.common.web.InvalidRequestException;
import com.annapurna.common.web.ResourceNotFoundException;
import com.annapurna.requirement.Requirement;
import com.annapurna.requirement.RequirementRepository;
import com.annapurna.requirement.RequirementStatus;
import java.util.List;
import java.util.UUID;
import org.springframework.security.access.AccessDeniedException;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
public class MatchingService {
    private final RequirementRepository requirementRepository;
    private final CandidateLotProvider candidateLotProvider;
    private final MatchRanker matchRanker;
    private final AccessControlService accessControlService;

    public MatchingService(
            RequirementRepository requirementRepository,
            CandidateLotProvider candidateLotProvider,
            MatchRanker matchRanker,
            AccessControlService accessControlService) {
        this.requirementRepository = requirementRepository;
        this.candidateLotProvider = candidateLotProvider;
        this.matchRanker = matchRanker;
        this.accessControlService = accessControlService;
    }

    @Transactional(readOnly = true)
    public List<MatchResult> findMatches(UUID requirementId, int limit) {
        if (limit < 1 || limit > 100) {
            throw new InvalidRequestException("Match limit must be between 1 and 100");
        }
        Requirement requirement = requirementRepository.findById(requirementId)
                .orElseThrow(() -> new ResourceNotFoundException("Requirement"));
        requireRequirementAccess(requirement);
        if (requirement.getStatus() != RequirementStatus.PUBLISHED
                && requirement.getStatus() != RequirementStatus.OPEN) {
            throw new ResourceNotFoundException("Requirement");
        }
        return matchRanker.rank(requirement, candidateLotProvider.findCandidates(requirement))
                .stream()
                .limit(limit)
                .toList();
    }

    private void requireRequirementAccess(Requirement requirement) {
        try {
            UUID organizationId = requirement.getBuyerOrganizationId();
            if (organizationId == null) {
                throw new ResourceNotFoundException("Requirement");
            }
            accessControlService.requireOrganizationAccess(organizationId);
        } catch (AccessDeniedException exception) {
            throw new ResourceNotFoundException("Requirement");
        }
    }
}
