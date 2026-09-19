package com.annapurna.lot;

import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.security.SecurityRequirement;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import java.util.UUID;
import org.springframework.http.MediaType;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping(path = "/api/v1/lots/{lotId}/location", produces = MediaType.APPLICATION_JSON_VALUE)
@Tag(name = "Lot Locations")
@SecurityRequirement(name = "bearerAuth")
public class LotLocationController {
    private final LotLocationService locationService;

    public LotLocationController(LotLocationService locationService) {
        this.locationService = locationService;
    }

    @GetMapping
    @Operation(summary = "Get a lot origin location", description = "Returns a GeoJSON-compatible WGS84 Point.")
    public LotLocationResponse get(@PathVariable UUID lotId) {
        return locationService.get(lotId);
    }

    @PutMapping(consumes = MediaType.APPLICATION_JSON_VALUE)
    @Operation(summary = "Create or replace a lot origin location")
    public LotLocationResponse put(@PathVariable UUID lotId, @Valid @RequestBody GeoPointRequest request) {
        return locationService.put(lotId, request);
    }
}