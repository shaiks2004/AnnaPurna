package com.annapurna.quality;

import com.annapurna.lot.Lot;
import com.annapurna.lot.LotDocument;
import com.annapurna.lot.LotDocumentResponse;
import com.annapurna.lot.LotLocationResponse;
import com.annapurna.lot.LotResponse;
import java.util.List;
import java.util.UUID;

public record LotPassportResponse(
        UUID lotId,
        LotResponse lot,
        String supplierType,
        UUID supplierId,
        LotLocationResponse location,
        List<LotDocumentResponse> documents,
        List<QualityTestResponse> tests,
        QualityTestResponse latestVerifiedResult) {
    public static LotPassportResponse from(
            Lot lot,
            String supplierType,
            UUID supplierId,
            LotLocationResponse location,
            List<LotDocumentResponse> documents,
            List<QualityTestResponse> tests,
            QualityTestResponse latestVerifiedResult) {
        return new LotPassportResponse(
                lot.getId(),
                LotResponse.from(lot),
                supplierType,
                supplierId,
                location,
                documents,
                tests,
                latestVerifiedResult);
    }
}
