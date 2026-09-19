package com.annapurna.matching;

import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.security.SecurityRequirement;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.constraints.Max;
import jakarta.validation.constraints.Min;
import java.util.List;
import java.util.UUID;
import org.springframework.validation.annotation.Validated;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

@RestController
@Validated
@RequestMapping("/api/v1/requirements/{requirementId}/matches")
@Tag(name = "Matching")
@SecurityRequirement(name = "bearerAuth")
public class MatchingController {
    private final MatchingService matchingService;

    public MatchingController(MatchingService matchingService) {
        this.matchingService = matchingService;
    }

    @GetMapping
    @Operation(
            summary = "Compute ranked lot matches for a requirement",
            description = "Returns read-only ranked results from the deterministic baseline model. The model is not trained machine learning.")
    public List<MatchResult> findMatches(
            @PathVariable UUID requirementId,
            @RequestParam(defaultValue = "20") @Min(1) @Max(100) int limit) {
        return matchingService.findMatches(requirementId, limit);
    }
}
