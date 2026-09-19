package com.annapurna.common.web;

import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;
import static org.mockito.Mockito.when;

import com.annapurna.auth.AuthenticatedUser;
import com.annapurna.auth.AuthenticatedUserService;
import com.annapurna.auth.AuthenticationService;
import com.annapurna.auth.JwtTokenService;
import com.annapurna.auth.Role;
import com.annapurna.auth.UserRoleAssignmentService;
import com.annapurna.commodity.CommodityService;
import com.annapurna.market.MarketService;
import com.annapurna.marketprice.MarketPriceService;
import com.annapurna.quality.QualityService;
import com.annapurna.supply.SupplyService;
import com.annapurna.lot.LotService;
import com.annapurna.lot.LotLocationService;
import com.annapurna.lot.LotDocumentService;
import java.util.Map;
import java.util.Set;
import java.util.UUID;
import org.springframework.data.domain.Page;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.AutoConfigureMockMvc;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.boot.test.mock.mockito.MockBean;
import org.springframework.test.context.ActiveProfiles;
import org.springframework.test.web.servlet.MockMvc;

@SpringBootTest
@AutoConfigureMockMvc
@ActiveProfiles("test")
class SystemApiTest {
    private static final UUID USER_ID = UUID.fromString("2e2a3aa4-cc18-47a4-8c30-cc7d643f3c7a");

    @Autowired
    private MockMvc mockMvc;

    @Autowired
    private JwtTokenService jwtTokenService;

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
    void healthEndpointIsAvailable() throws Exception {
        mockMvc.perform(get("/api/v1/health"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.status").value("UP"));
    }

    @Test
    void openApiDocumentUsesVersion31() throws Exception {
        mockMvc.perform(get("/v3/api-docs"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.openapi").value("3.1.0"))
                .andExpect(jsonPath("$.paths['/api/v1/health'].get").exists())
                .andExpect(jsonPath("$.paths['/api/v1/commodities'].get").exists())
                .andExpect(jsonPath("$.paths['/api/v1/markets'].get").exists())
                .andExpect(jsonPath("$.paths['/api/v1/market-prices'].get").exists())
                .andExpect(jsonPath("$.paths['/api/v1/supplies'].get").exists())
                .andExpect(jsonPath("$.paths['/api/v1/lots'].get").exists())
                .andExpect(jsonPath("$.paths['/api/v1/lots/{lotId}/location'].get").exists())
                .andExpect(jsonPath("$.paths['/api/v1/lots/{lotId}/documents'].get").exists())
                .andExpect(jsonPath("$.paths['/api/v1/lots/{lotId}/quality-tests'].post").exists())
                .andExpect(jsonPath("$.paths['/api/v1/quality-tests/{testId}/verify'].post").exists())
                .andExpect(jsonPath("$.paths['/api/v1/lots/{lotId}/passport'].get").exists())
                .andExpect(jsonPath("$.paths['/api/v1/requirements'].post").exists())
                .andExpect(jsonPath("$.paths['/api/v1/requirements'].get").exists())
                .andExpect(jsonPath("$.paths['/api/v1/requirements/{requirementId}'].patch").exists())
                .andExpect(jsonPath("$.paths['/api/v1/requirements/{requirementId}/publish'].post").exists())
                .andExpect(jsonPath("$.paths['/api/v1/requirements/{requirementId}/open'].post").exists())
                .andExpect(jsonPath("$.paths['/api/v1/requirements/{requirementId}/close'].post").exists())
                .andExpect(jsonPath("$.paths['/api/v1/requirements/{requirementId}/matches'].get").exists())
                .andExpect(jsonPath("$.components.securitySchemes.bearerAuth.scheme").value("bearer"));
    }

    @Test
    void unauthenticatedAgriculturalReadsAreRejected() throws Exception {
        mockMvc.perform(get("/api/v1/commodities")).andExpect(status().isUnauthorized());
        mockMvc.perform(get("/api/v1/markets")).andExpect(status().isUnauthorized());
        mockMvc.perform(get("/api/v1/market-prices")).andExpect(status().isUnauthorized());
                mockMvc.perform(get("/api/v1/requirements")).andExpect(status().isUnauthorized());
                mockMvc.perform(get("/api/v1/requirements/00000000-0000-0000-0000-000000000000/matches"))
                        .andExpect(status().isUnauthorized());
    }

    @Test
    void unauthenticatedSupplyAndLotReadsAreRejected() throws Exception {
        mockMvc.perform(get("/api/v1/supplies")).andExpect(status().isUnauthorized());
        mockMvc.perform(get("/api/v1/lots")).andExpect(status().isUnauthorized());
        mockMvc.perform(get("/api/v1/lots/00000000-0000-0000-0000-000000000000/location"))
                .andExpect(status().isUnauthorized());
        mockMvc.perform(get("/api/v1/lots/00000000-0000-0000-0000-000000000000/documents"))
                .andExpect(status().isUnauthorized());
        mockMvc.perform(get("/api/v1/lots/00000000-0000-0000-0000-000000000000/passport"))
                .andExpect(status().isUnauthorized());
    }

    @Test
    void authenticatedUserCanReadAgriculturalLists() throws Exception {
        when(commodityService.list(null, 0, 20)).thenReturn(Page.empty());
        when(marketService.list(null, null, null, null, 0, 20)).thenReturn(Page.empty());
        when(marketPriceService.list(null, null, null, null, 0, 20)).thenReturn(Page.empty());
        String token = jwtTokenService.issueAccessToken(
                new AuthenticatedUser(USER_ID, Set.of(), Set.of(Role.FARMER), Map.of()));

        mockMvc.perform(get("/api/v1/commodities").header("Authorization", "Bearer " + token))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.page.number").value(0));
        mockMvc.perform(get("/api/v1/markets").header("Authorization", "Bearer " + token))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.page.number").value(0));
        mockMvc.perform(get("/api/v1/market-prices").header("Authorization", "Bearer " + token))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.data").isArray());
    }

    @Test
    void unauthenticatedProtectedEndpointIsRejected() throws Exception {
        mockMvc.perform(get("/api/v1/me")).andExpect(status().isUnauthorized());
    }

    @Test
    void invalidBearerTokenIsRejected() throws Exception {
        mockMvc.perform(get("/api/v1/me").header("Authorization", "Bearer invalid"))
                .andExpect(status().isUnauthorized());
    }

    @Test
    void authenticatedUserCanReadOwnAccessContext() throws Exception {
        when(authenticatedUserService.load(USER_ID))
                .thenReturn(new AuthenticatedUser(USER_ID, Set.of(), Set.of(Role.FARMER), Map.of()));
        String token = jwtTokenService.issueAccessToken(new AuthenticatedUser(USER_ID, Set.of(), Set.of(Role.FARMER), Map.of()));

        mockMvc.perform(get("/api/v1/me").header("Authorization", "Bearer " + token))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.userId").value(USER_ID.toString()))
                .andExpect(jsonPath("$.globalRoles[0]").value("FARMER"));
    }
}
