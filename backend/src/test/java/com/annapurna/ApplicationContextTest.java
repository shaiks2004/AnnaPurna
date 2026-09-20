package com.annapurna;

import org.junit.jupiter.api.Test;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.boot.test.mock.mockito.MockBean;
import org.springframework.test.context.ActiveProfiles;
import com.annapurna.auth.AuthenticatedUserService;
import com.annapurna.auth.AuthenticationService;
import com.annapurna.auth.UserRoleAssignmentService;
import com.annapurna.commodity.CommodityService;
import com.annapurna.market.MarketService;
import com.annapurna.marketprice.MarketPriceService;
import com.annapurna.quality.QualityService;
import com.annapurna.supply.SupplyService;
import com.annapurna.lot.LotService;
import com.annapurna.lot.LotLocationService;
import com.annapurna.lot.LotDocumentService;

@SpringBootTest
@ActiveProfiles("test")
class ApplicationContextTest {
    @MockBean
    private AuthenticationService authenticationService;

    @MockBean
    private AuthenticatedUserService authenticatedUserService;

    @MockBean
    private UserRoleAssignmentService userRoleAssignmentService;

    @MockBean
    private CommodityService commodityService;

    @MockBean
    private MarketService marketService;

    @MockBean
    private MarketPriceService marketPriceService;

    @MockBean
    private SupplyService supplyService;

    @MockBean
    private LotService lotService;

    @MockBean
    private LotLocationService lotLocationService;

    @MockBean
    private LotDocumentService lotDocumentService;

    @MockBean
    private QualityService qualityService;

    @Test
    void contextStarts() {}
}
