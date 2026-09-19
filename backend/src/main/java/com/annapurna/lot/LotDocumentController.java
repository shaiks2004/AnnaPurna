package com.annapurna.lot;

import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.security.SecurityRequirement;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import java.util.List;
import java.util.UUID;
import org.springframework.http.HttpStatus;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.ResponseStatus;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/v1/lots/{lotId}/documents")
@Tag(name = "Lot Documents")
@SecurityRequirement(name = "bearerAuth")
public class LotDocumentController {
    private final LotDocumentService documentService;

    public LotDocumentController(LotDocumentService documentService) {
        this.documentService = documentService;
    }

    @GetMapping
    @Operation(summary = "List safe lot document metadata")
    public List<LotDocumentResponse> list(@PathVariable UUID lotId) {
        return documentService.list(lotId);
    }

    @PostMapping
    @ResponseStatus(HttpStatus.CREATED)
    @Operation(summary = "Add safe lot document metadata", description = "Does not upload or fetch file content.")
    public LotDocumentResponse create(
            @PathVariable UUID lotId, @Valid @RequestBody LotDocumentCreateRequest request) {
        return documentService.create(lotId, request);
    }
}