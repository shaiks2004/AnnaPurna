package com.annapurna.lot;

import com.annapurna.auth.AccessControlService;
import com.annapurna.auth.Role;
import com.annapurna.common.web.InvalidRequestException;
import com.annapurna.common.web.ResourceNotFoundException;
import java.util.List;
import java.util.UUID;
import org.springframework.security.access.AccessDeniedException;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
public class LotDocumentService {
    private final LotRepository lotRepository;
    private final LotDocumentRepository documentRepository;
    private final AccessControlService accessControlService;

    public LotDocumentService(
            LotRepository lotRepository,
            LotDocumentRepository documentRepository,
            AccessControlService accessControlService) {
        this.lotRepository = lotRepository;
        this.documentRepository = documentRepository;
        this.accessControlService = accessControlService;
    }

    @Transactional(readOnly = true)
    public List<LotDocumentResponse> list(UUID lotId) {
        Lot lot = findLot(lotId);
        requireReadAccess(lot);
        return documentRepository.findByLotIdOrderByCreatedAtAsc(lotId).stream()
                .map(LotDocumentResponse::from)
                .toList();
    }

    @Transactional
    public LotDocumentResponse create(UUID lotId, LotDocumentCreateRequest request) {
        Lot lot = findLot(lotId);
        requireWriteAccess(lot);
        if (lot.getStatus() != LotStatus.DECLARED) {
            throw new InvalidRequestException("Only DECLARED lots can receive document metadata");
        }
        String storageReference = request.storageReference().trim();
        if (storageReference.contains("://")) {
            throw new InvalidRequestException("Storage reference must be an opaque provider reference");
        }
        LotDocument document = LotDocument.create(
                lot,
                request.documentTypeCode().trim(),
                storageReference,
                trimToNull(request.originalFilename()),
                trimToNull(request.contentType()),
                trimToNull(request.checksum()));
        return LotDocumentResponse.from(documentRepository.save(document));
    }

    private Lot findLot(UUID lotId) {
        return lotRepository.findById(lotId).orElseThrow(() -> new ResourceNotFoundException("Lot"));
    }

    private void requireReadAccess(Lot lot) {
        try {
            if (lot.getFarmer() != null) {
                accessControlService.requireFarmerAccess(lot.getFarmer().getUser().getId());
            } else {
                accessControlService.requireOrganizationAccess(lot.getOrganization().getId());
            }
        } catch (AccessDeniedException exception) {
            throw new ResourceNotFoundException("Lot");
        }
    }

    private void requireWriteAccess(Lot lot) {
        if (lot.getFarmer() != null) {
            accessControlService.requireFarmerAccess(lot.getFarmer().getUser().getId());
        } else {
            accessControlService.requireOrganizationRole(lot.getOrganization().getId(), Role.FPO_USER);
        }
    }

    private static String trimToNull(String value) {
        return value == null || value.isBlank() ? null : value.trim();
    }
}