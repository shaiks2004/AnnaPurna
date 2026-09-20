package com.annapurna.lot;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;

public record LotDocumentCreateRequest(
        @NotBlank @Size(max = 64) String documentTypeCode,
        @NotBlank @Size(max = 1024) String storageReference,
        @Size(max = 512) String originalFilename,
        @Size(max = 255) String contentType,
        @Size(max = 128) String checksum) {}