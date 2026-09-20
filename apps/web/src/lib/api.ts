export type Role =
  | 'FARMER'
  | 'FPO_USER'
  | 'BUYER_USER'
  | 'QUALITY_INSPECTOR'
  | 'LOGISTICS_USER'
  | 'FINANCE_USER'
  | 'ADMIN';

export type Page<T> = {
  data: T[];
  page: {
    number: number;
    size: number;
    totalElements: number;
    totalPages: number;
  };
};

export type Commodity = {
  id: string;
  name: string;
  commodityCode: string | null;
  active: boolean;
};

export type CommodityCreateRequest = {
  name: string;
  commodityCode?: string | null;
  active?: boolean;
};

export type CommodityPatchRequest = {
  name?: string | null;
  commodityCode?: string | null;
  active?: boolean | null;
};

export type Market = {
  id: string;
  name: string;
  marketCode: string;
  marketTypeCode: string | null;
  state: string | null;
  district: string | null;
  active: boolean;
};

export type MarketCreateRequest = {
  name: string;
  marketCode: string;
  marketTypeCode?: string | null;
  state?: string | null;
  district?: string | null;
  active?: boolean;
};

export type MarketPatchRequest = {
  name?: string | null;
  marketTypeCode?: string | null;
  state?: string | null;
  district?: string | null;
  active?: boolean | null;
};

export type MarketPrice = {
  id: string;
  commodityId: string;
  marketId: string;
  observedOn: string;
  minPrice: number | null;
  maxPrice: number | null;
  modalPrice: number | null;
  currencyCode: string | null;
  priceUnit: string;
  sourceName: string;
  sourceReference: string | null;
  createdAt: string;
};

export type MarketPriceCreateRequest = {
  commodityId: string;
  marketId: string;
  observedOn: string;
  minPrice?: number | null;
  maxPrice?: number | null;
  modalPrice?: number | null;
  currencyCode?: string | null;
  priceUnit: string;
  sourceName: string;
  sourceReference?: string | null;
};

export type SupplyKind = 'PLANNED' | 'HARVESTED' | 'STORED';

export type Supply = {
  id: string;
  commodityId: string;
  farmerId: string | null;
  organizationId: string | null;
  supplyKind: SupplyKind;
  quantity: number;
  quantityUnit: string;
  expectedHarvestDate: string | null;
  availableFrom: string | null;
};

export type SupplyCreateRequest = {
  commodityId: string;
  farmerId?: string | null;
  organizationId?: string | null;
  supplyKind: SupplyKind;
  quantity: number;
  quantityUnit: string;
  expectedHarvestDate?: string | null;
  availableFrom?: string | null;
};

export type SupplyPatchRequest = {
  quantity?: number;
  quantityUnit?: string;
  expectedHarvestDate?: string | null;
  availableFrom?: string | null;
};

export type LotStatus = 'DECLARED' | 'VERIFIED' | 'COMMITTED' | 'CLOSED';

export type Lot = {
  id: string;
  lotNumber: string;
  commodityId: string;
  sourceSupplyId: string | null;
  farmerId: string | null;
  organizationId: string | null;
  quantity: number;
  quantityUnit: string;
  harvestDate: string | null;
  availableFrom: string | null;
  status: LotStatus;
};

export type LotCreateRequest = {
  lotNumber: string;
  commodityId: string;
  sourceSupplyId?: string | null;
  farmerId?: string | null;
  organizationId?: string | null;
  quantity: number;
  quantityUnit: string;
  harvestDate?: string | null;
  availableFrom?: string | null;
};

export type LotPatchRequest = {
  quantity?: number;
  quantityUnit?: string;
  harvestDate?: string | null;
  availableFrom?: string | null;
};

export type LotLocation = {
  lotId: string;
  type: string;
  coordinates: [number, number]; // [longitude, latitude]
};

export type GeoPointRequest = {
  type: string;
  coordinates: [number, number];
};

export type LotDocument = {
  id: string;
  lotId: string;
  documentTypeCode: string;
  storageReference: string;
  originalFilename: string | null;
  contentType: string | null;
  checksum: string | null;
  createdAt: string;
};

export type LotDocumentCreateRequest = {
  documentTypeCode: string;
  storageReference: string;
  originalFilename?: string | null;
  contentType?: string | null;
  checksum?: string | null;
};

export type QualityTest = {
  id: string;
  lotId: string;
  inspectorUserId: string | null;
  testType: string;
  sampledAt: string | null;
  testedAt: string | null;
  status: string;
  methodCode: string;
  sourceCode: string | null;
  notes: string | null;
  verifiedAt: string | null;
  verifiedByUserId: string | null;
};

export type QualityTestCreateRequest = {
  testType: string;
  sampledAt?: string | null;
  testedAt?: string | null;
  methodCode: string;
  sourceCode?: string | null;
  notes?: string | null;
};

export type QualityMeasurement = {
  id: string;
  qualityTestId: string;
  metricName: string;
  numericValue: number | null;
  unit: string | null;
  textValue: string | null;
};

export type QualityMeasurementCreateRequest = {
  metricName: string;
  unit: string;
  numericValue: number;
  textValue?: string | null;
};

export type LotPassport = {
  lotId: string;
  lot: Lot;
  supplierType: string;
  supplierId: string;
  location: LotLocation | null;
  documents: LotDocument[];
  tests: QualityTest[];
  latestVerifiedResult: QualityTest | null;
};

export type RequirementStatus = 'DRAFT' | 'PUBLISHED' | 'OPEN' | 'CLOSED';

export type Requirement = {
  id: string;
  buyerProfileId: string;
  buyerOrganizationId: string;
  commodityId: string;
  quantity: number;
  quantityUnit: string;
  qualitySpecification: string;
  deliveryLocation: string;
  requiredBy: string;
  targetPrice: number | null;
  maximumPrice: number | null;
  currencyCode: string | null;
  status: RequirementStatus;
  notes: string | null;
  version: number;
  createdAt: string;
  updatedAt: string;
};

export type RequirementCreateRequest = {
  buyerProfileId: string;
  commodityId: string;
  quantity: number;
  quantityUnit: string;
  qualitySpecification: string;
  deliveryLocation: string;
  requiredBy: string;
  targetPrice?: number | null;
  maximumPrice?: number | null;
  currencyCode?: string | null;
  notes?: string | null;
};

export type RequirementPatchRequest = {
  quantity?: number;
  quantityUnit?: string;
  qualitySpecification?: string;
  deliveryLocation?: string;
  requiredBy?: string;
  targetPrice?: number | null;
  maximumPrice?: number | null;
  currencyCode?: string | null;
  notes?: string | null;
};

export type MatchResult = {
  requirementId: string;
  lotId: string;
  score: number;
  modelName: string;
  modelVersion: string;
  rankedPosition: number;
  explanation: string[];
};

export type Me = {
  userId: string;
  organizationIds: string[];
  globalRoles: Role[];
  organizationRoles: Record<string, Role[]>;
  buyerProfileId?: string | null;
  farmerProfileId?: string | null;
};

export type AuthToken = {
  accessToken: string;
  tokenType: string;
  expiresIn: number;
  refreshToken: string;
};

export class ApiError extends Error {
  public readonly code?: string;
  public readonly errors?: Record<string, string>;

  constructor(
    public readonly status: number,
    message: string,
    public readonly details?: Record<string, unknown>,
  ) {
    super(message);
    this.name = 'ApiError';
    this.code = typeof details?.code === 'string' ? details.code : undefined;
    if (details?.errors && typeof details.errors === 'object') {
      this.errors = details.errors as Record<string, string>;
    }
  }

  get userFriendlyMessage(): string {
    if (this.status === 401) {
      return 'Your session has expired or authentication is invalid. Please sign in again.';
    }
    if (this.status === 403) {
      return 'You do not have permission to perform this action in this organization.';
    }
    if (this.status === 404) {
      return this.message || 'The requested resource was not found.';
    }
    if (this.status === 409) {
      if (this.code === 'CONCURRENT_UPDATE') {
        return 'This record was changed by another user. Refresh before editing.';
      }
      return this.message || 'A conflicting record already exists with these details.';
    }
    if (this.status === 422) {
      return this.message || 'The request contains invalid business parameters.';
    }
    if (this.status === 400 && this.errors) {
      const fieldErrors = Object.entries(this.errors)
        .map(([f, msg]) => `${f}: ${msg}`)
        .join(', ');
      return `Validation failed: ${fieldErrors}`;
    }
    return this.message || `Server request failed with status ${this.status}.`;
  }
}

const API_BASE_URL = (
  process.env.NEXT_PUBLIC_API_BASE_URL ?? '/api/v1'
).replace(/\/$/, '');
const ACCESS_TOKEN_KEY = 'annapurna.accessToken';
const REFRESH_TOKEN_KEY = 'annapurna.refreshToken';

export function getAccessToken(): string | null {
  return typeof window === 'undefined' ? null : sessionStorage.getItem(ACCESS_TOKEN_KEY);
}

export function getRefreshToken(): string | null {
  return typeof window === 'undefined' ? null : sessionStorage.getItem(REFRESH_TOKEN_KEY);
}

export function saveTokens(tokens: AuthToken): void {
  sessionStorage.setItem(ACCESS_TOKEN_KEY, tokens.accessToken);
  sessionStorage.setItem(REFRESH_TOKEN_KEY, tokens.refreshToken);
}

export function clearTokens(): void {
  if (typeof window !== 'undefined') {
    sessionStorage.removeItem(ACCESS_TOKEN_KEY);
    sessionStorage.removeItem(REFRESH_TOKEN_KEY);
  }
}

async function request<T>(path: string, init: RequestInit = {}, retry = true): Promise<T> {
  const headers = new Headers(init.headers);
  headers.set('Accept', 'application/json');
  if (init.body && !(init.body instanceof FormData)) {
    headers.set('Content-Type', 'application/json');
  }

  const token = getAccessToken();
  if (token) {
    headers.set('Authorization', `Bearer ${token}`);
  }

  const response = await fetch(`${API_BASE_URL}${path}`, { ...init, headers });

  if (response.status === 401 && retry && getRefreshToken()) {
    try {
      await refresh();
      return request<T>(path, init, false);
    } catch {
      clearTokens();
    }
  }

  if (!response.ok) {
    let body: Record<string, unknown> = {};
    try {
      body = (await response.json()) as Record<string, unknown>;
    } catch {
      // Empty or non-JSON error response
    }
    const message =
      typeof body.detail === 'string'
        ? body.detail
        : typeof body.message === 'string'
          ? body.message
          : `Request failed (${response.status})`;
    throw new ApiError(response.status, message, body);
  }

  if (response.status === 204) {
    return undefined as T;
  }

  return response.json() as Promise<T>;
}

// -------------------------------------------------------------
// Authentication & Identity
// -------------------------------------------------------------
export async function login(email: string, password: string): Promise<AuthToken> {
  const tokens = await request<AuthToken>(
    '/auth/login',
    {
      method: 'POST',
      body: JSON.stringify({ email, password }),
    },
    false,
  );
  saveTokens(tokens);
  return tokens;
}

export async function refresh(): Promise<AuthToken> {
  const refreshToken = getRefreshToken();
  if (!refreshToken) {
    throw new ApiError(401, 'No refresh token available');
  }
  const tokens = await request<AuthToken>(
    '/auth/refresh',
    {
      method: 'POST',
      body: JSON.stringify({ refreshToken }),
    },
    false,
  );
  saveTokens(tokens);
  return tokens;
}

export async function logout(): Promise<void> {
  const token = getRefreshToken();
  if (token) {
    await request<void>(
      '/auth/logout',
      {
        method: 'POST',
        body: JSON.stringify({ refreshToken: token }),
      },
      false,
    ).catch(() => undefined);
  }
  clearTokens();
}

export const getMe = (): Promise<Me> => request<Me>('/me');
export const getHealth = (): Promise<{ status: string; timestamp: string }> =>
  request<{ status: string; timestamp: string }>('/health');

// -------------------------------------------------------------
// Commodities
// -------------------------------------------------------------
export const listCommodities = (page = 0, size = 20, search?: string): Promise<Page<Commodity>> => {
  const params = new URLSearchParams({ page: String(page), size: String(size) });
  if (search?.trim()) params.set('search', search.trim());
  return request<Page<Commodity>>(`/commodities?${params.toString()}`);
};

export const getCommodity = (id: string): Promise<Commodity> =>
  request<Commodity>(`/commodities/${id}`);

export const createCommodity = (payload: CommodityCreateRequest): Promise<Commodity> =>
  request<Commodity>('/commodities', { method: 'POST', body: JSON.stringify(payload) });

export const updateCommodity = (id: string, payload: CommodityPatchRequest): Promise<Commodity> =>
  request<Commodity>(`/commodities/${id}`, { method: 'PATCH', body: JSON.stringify(payload) });

// -------------------------------------------------------------
// Markets
// -------------------------------------------------------------
export type MarketFilterParams = {
  search?: string;
  state?: string;
  district?: string;
  commodityId?: string;
  page?: number;
  size?: number;
};

export const listMarkets = (params: MarketFilterParams = {}): Promise<Page<Market>> => {
  const query = new URLSearchParams({
    page: String(params.page ?? 0),
    size: String(params.size ?? 20),
  });
  if (params.search?.trim()) query.set('search', params.search.trim());
  if (params.state?.trim()) query.set('state', params.state.trim());
  if (params.district?.trim()) query.set('district', params.district.trim());
  if (params.commodityId?.trim()) query.set('commodityId', params.commodityId.trim());
  return request<Page<Market>>(`/markets?${query.toString()}`);
};

export const getMarket = (id: string): Promise<Market> => request<Market>(`/markets/${id}`);

export const createMarket = (payload: MarketCreateRequest): Promise<Market> =>
  request<Market>('/markets', { method: 'POST', body: JSON.stringify(payload) });

export const updateMarket = (id: string, payload: MarketPatchRequest): Promise<Market> =>
  request<Market>(`/markets/${id}`, { method: 'PATCH', body: JSON.stringify(payload) });

// -------------------------------------------------------------
// Market Prices
// -------------------------------------------------------------
export type MarketPriceFilterParams = {
  commodityId?: string;
  marketId?: string;
  from?: string;
  to?: string;
  page?: number;
  size?: number;
};

export const listPrices = (params: MarketPriceFilterParams = {}): Promise<Page<MarketPrice>> => {
  const query = new URLSearchParams({
    page: String(params.page ?? 0),
    size: String(params.size ?? 20),
  });
  if (params.commodityId?.trim()) query.set('commodityId', params.commodityId.trim());
  if (params.marketId?.trim()) query.set('marketId', params.marketId.trim());
  if (params.from?.trim()) query.set('from', params.from.trim());
  if (params.to?.trim()) query.set('to', params.to.trim());
  return request<Page<MarketPrice>>(`/market-prices?${query.toString()}`);
};

export const getPrice = (id: string): Promise<MarketPrice> =>
  request<MarketPrice>(`/market-prices/${id}`);

export const createPrice = (payload: MarketPriceCreateRequest): Promise<MarketPrice> =>
  request<MarketPrice>('/market-prices', { method: 'POST', body: JSON.stringify(payload) });

// -------------------------------------------------------------
// Supplies
// -------------------------------------------------------------
export type SupplyFilterParams = {
  commodityId?: string;
  farmerId?: string;
  organizationId?: string;
  supplyKind?: SupplyKind;
  expectedFrom?: string;
  expectedTo?: string;
  availableFrom?: string;
  page?: number;
  size?: number;
};

export const listSupplies = (params: SupplyFilterParams = {}): Promise<Page<Supply>> => {
  const query = new URLSearchParams({
    page: String(params.page ?? 0),
    size: String(params.size ?? 20),
  });
  if (params.commodityId?.trim()) query.set('commodityId', params.commodityId.trim());
  if (params.farmerId?.trim()) query.set('farmerId', params.farmerId.trim());
  if (params.organizationId?.trim()) query.set('organizationId', params.organizationId.trim());
  if (params.supplyKind) query.set('supplyKind', params.supplyKind);
  if (params.expectedFrom?.trim()) query.set('expectedFrom', params.expectedFrom.trim());
  if (params.expectedTo?.trim()) query.set('expectedTo', params.expectedTo.trim());
  if (params.availableFrom?.trim()) query.set('availableFrom', params.availableFrom.trim());
  return request<Page<Supply>>(`/supplies?${query.toString()}`);
};

export const getSupply = (id: string): Promise<Supply> => request<Supply>(`/supplies/${id}`);

export const createSupply = (payload: SupplyCreateRequest): Promise<Supply> =>
  request<Supply>('/supplies', { method: 'POST', body: JSON.stringify(payload) });

export const updateSupply = (id: string, payload: SupplyPatchRequest): Promise<Supply> =>
  request<Supply>(`/supplies/${id}`, { method: 'PATCH', body: JSON.stringify(payload) });

// -------------------------------------------------------------
// Physical Lots
// -------------------------------------------------------------
export type LotFilterParams = {
  search?: string;
  commodityId?: string;
  farmerId?: string;
  organizationId?: string;
  sourceSupplyId?: string;
  status?: LotStatus;
  availableFrom?: string;
  availableTo?: string;
  page?: number;
  size?: number;
};

export const listLots = (params: LotFilterParams = {}): Promise<Page<Lot>> => {
  const query = new URLSearchParams({
    page: String(params.page ?? 0),
    size: String(params.size ?? 20),
  });
  if (params.search?.trim()) query.set('search', params.search.trim());
  if (params.commodityId?.trim()) query.set('commodityId', params.commodityId.trim());
  if (params.farmerId?.trim()) query.set('farmerId', params.farmerId.trim());
  if (params.organizationId?.trim()) query.set('organizationId', params.organizationId.trim());
  if (params.sourceSupplyId?.trim()) query.set('sourceSupplyId', params.sourceSupplyId.trim());
  if (params.status) query.set('status', params.status);
  if (params.availableFrom?.trim()) query.set('availableFrom', params.availableFrom.trim());
  if (params.availableTo?.trim()) query.set('availableTo', params.availableTo.trim());
  return request<Page<Lot>>(`/lots?${query.toString()}`);
};

export const getLot = (id: string): Promise<Lot> => request<Lot>(`/lots/${id}`);

export const createLot = (payload: LotCreateRequest): Promise<Lot> =>
  request<Lot>('/lots', { method: 'POST', body: JSON.stringify(payload) });

export const updateLot = (id: string, payload: LotPatchRequest): Promise<Lot> =>
  request<Lot>(`/lots/${id}`, { method: 'PATCH', body: JSON.stringify(payload) });

// -------------------------------------------------------------
// Lot Location (GeoJSON Point: [longitude, latitude])
// -------------------------------------------------------------
export const getLocation = (lotId: string): Promise<LotLocation> =>
  request<LotLocation>(`/lots/${lotId}/location`);

export const saveLocation = (lotId: string, coordinates: [number, number]): Promise<LotLocation> =>
  request<LotLocation>(`/lots/${lotId}/location`, {
    method: 'PUT',
    body: JSON.stringify({ type: 'Point', coordinates }),
  });

// -------------------------------------------------------------
// Lot Documents Metadata
// -------------------------------------------------------------
export const listDocuments = (lotId: string): Promise<LotDocument[]> =>
  request<LotDocument[]>(`/lots/${lotId}/documents`);

export const createDocument = (
  lotId: string,
  payload: LotDocumentCreateRequest,
): Promise<LotDocument> =>
  request<LotDocument>(`/lots/${lotId}/documents`, {
    method: 'POST',
    body: JSON.stringify(payload),
  });

// -------------------------------------------------------------
// Quality Tests, Measurements & Lot Passport
// -------------------------------------------------------------
export const listQualityTests = (lotId: string, page = 0, size = 20): Promise<Page<QualityTest>> =>
  request<Page<QualityTest>>(`/lots/${lotId}/quality-tests?page=${page}&size=${size}`);

export const createQualityTest = (
  lotId: string,
  payload: QualityTestCreateRequest,
): Promise<QualityTest> =>
  request<QualityTest>(`/lots/${lotId}/quality-tests`, {
    method: 'POST',
    body: JSON.stringify(payload),
  });

export const getQualityTest = (testId: string): Promise<QualityTest> =>
  request<QualityTest>(`/quality-tests/${testId}`);

export const listMeasurements = (testId: string): Promise<QualityMeasurement[]> =>
  request<QualityMeasurement[]>(`/quality-tests/${testId}/results`);

export const createMeasurement = (
  testId: string,
  payload: QualityMeasurementCreateRequest,
): Promise<QualityMeasurement> =>
  request<QualityMeasurement>(`/quality-tests/${testId}/results`, {
    method: 'POST',
    body: JSON.stringify(payload),
  });

export const verifyQualityTest = (testId: string): Promise<QualityTest> =>
  request<QualityTest>(`/quality-tests/${testId}/verify`, { method: 'POST' });

export const getPassport = (lotId: string): Promise<LotPassport> =>
  request<LotPassport>(`/lots/${lotId}/passport`);

// -------------------------------------------------------------
// Buyer Requirements & Lifecycle
// -------------------------------------------------------------
export type RequirementFilterParams = {
  buyerOrganizationId?: string;
  commodityId?: string;
  status?: RequirementStatus;
  requiredBy?: string;
  page?: number;
  size?: number;
};

export const listRequirements = (
  params: RequirementFilterParams = {},
): Promise<Page<Requirement>> => {
  const query = new URLSearchParams({
    page: String(params.page ?? 0),
    size: String(params.size ?? 20),
  });
  if (params.buyerOrganizationId?.trim())
    query.set('buyerOrganizationId', params.buyerOrganizationId.trim());
  if (params.commodityId?.trim()) query.set('commodityId', params.commodityId.trim());
  if (params.status) query.set('status', params.status);
  if (params.requiredBy?.trim()) query.set('requiredBy', params.requiredBy.trim());
  return request<Page<Requirement>>(`/requirements?${query.toString()}`);
};

export const getRequirement = (id: string): Promise<Requirement> =>
  request<Requirement>(`/requirements/${id}`);

export const createRequirement = (payload: RequirementCreateRequest): Promise<Requirement> =>
  request<Requirement>('/requirements', {
    method: 'POST',
    body: JSON.stringify(payload),
  });

export const updateRequirement = (
  id: string,
  payload: RequirementPatchRequest,
): Promise<Requirement> =>
  request<Requirement>(`/requirements/${id}`, {
    method: 'PATCH',
    body: JSON.stringify(payload),
  });

export const publishRequirement = (id: string): Promise<Requirement> =>
  request<Requirement>(`/requirements/${id}/publish`, { method: 'POST' });

export const openRequirement = (id: string): Promise<Requirement> =>
  request<Requirement>(`/requirements/${id}/open`, { method: 'POST' });

export const closeRequirement = (id: string): Promise<Requirement> =>
  request<Requirement>(`/requirements/${id}/close`, { method: 'POST' });

// -------------------------------------------------------------
// Matching (Deterministic Baseline Model v1)
// -------------------------------------------------------------
export const listMatches = (requirementId: string, limit = 20): Promise<MatchResult[]> =>
  request<MatchResult[]>(`/requirements/${requirementId}/matches?limit=${limit}`);
