import { render, screen } from '@testing-library/react';
import { describe, it, expect, beforeEach, vi } from 'vitest';
import { QueryProvider } from '@/lib/query';
import { AuthProvider } from '@/lib/auth';
import LotsPage from '@/app/lots/page';
import LotPassportPage from '@/app/lots/[id]/passport/page';
import { saveTokens } from '@/lib/api';

vi.mock('next/navigation', () => ({
  useParams: () => ({ id: 'lot-test-123' }),
  useRouter: () => ({ push: vi.fn(), replace: vi.fn() }),
  usePathname: () => '/lots',
}));

describe('Lots, Traceability & Passport Views', () => {
  beforeEach(() => {
    sessionStorage.clear();
    saveTokens({
      accessToken: 'test-token',
      tokenType: 'Bearer',
      expiresIn: 900,
      refreshToken: 'test-refresh',
    });
    vi.restoreAllMocks();
  });

  it('renders lots list table with status badge', async () => {
    const mockLots = {
      data: [
        {
          id: 'lot-uuid-001',
          lotNumber: 'LOT-2026-WHT-001',
          commodityId: 'comm-uuid-1',
          sourceSupplyId: null,
          farmerId: 'farmer-uuid',
          organizationId: null,
          quantity: 120.0,
          quantityUnit: 'MT',
          harvestDate: '2026-09-01',
          availableFrom: '2026-09-05',
          status: 'VERIFIED',
        },
      ],
      page: { number: 0, size: 20, totalElements: 1, totalPages: 1 },
    };

    const mockMe = {
      userId: 'user-1',
      organizationIds: [],
      globalRoles: ['ADMIN'],
      organizationRoles: {},
    };

    globalThis.fetch = vi.fn().mockImplementation((url: string) => {
      if (url.includes('/me')) {
        return Promise.resolve({ ok: true, status: 200, json: async () => mockMe } as Response);
      }
      if (url.includes('/commodities')) {
        return Promise.resolve({
          ok: true,
          status: 200,
          json: async () => ({ data: [], page: {} }),
        } as Response);
      }
      if (url.includes('/lots')) {
        return Promise.resolve({ ok: true, status: 200, json: async () => mockLots } as Response);
      }
      return Promise.resolve({ ok: true, status: 200, json: async () => ({}) } as Response);
    });

    render(
      <QueryProvider>
        <AuthProvider>
          <LotsPage />
        </AuthProvider>
      </QueryProvider>,
    );

    expect(await screen.findByText('LOT-2026-WHT-001')).toBeInTheDocument();
    expect(screen.getByText('120 MT')).toBeInTheDocument();
    expect(screen.getByText('VERIFIED')).toBeInTheDocument();
  });

  it('renders immutable lot passport with full traceability sections', async () => {
    const mockPassport = {
      lotId: 'lot-test-123',
      lot: {
        id: 'lot-test-123',
        lotNumber: 'LOT-2026-PASSPORT-01',
        commodityId: 'comm-wheat-01',
        sourceSupplyId: 'sup-1',
        farmerId: null,
        organizationId: 'fpo-org-1',
        quantity: 200.0,
        quantityUnit: 'MT',
        harvestDate: '2026-08-25',
        availableFrom: '2026-09-01',
        status: 'VERIFIED',
      },
      supplierType: 'ORGANIZATION',
      supplierId: 'fpo-org-1',
      location: {
        lotId: 'lot-test-123',
        type: 'Point',
        coordinates: [73.7898, 19.9975],
      },
      documents: [
        {
          id: 'doc-1',
          lotId: 'lot-test-123',
          documentTypeCode: 'ORGANIC_CERTIFICATE',
          storageReference: 's3://vault/cert.pdf',
          originalFilename: 'cert.pdf',
          contentType: 'application/pdf',
          checksum: 'sha256:abc12345',
          createdAt: '2026-09-01T00:00:00Z',
        },
      ],
      tests: [
        {
          id: 'test-1',
          lotId: 'lot-test-123',
          inspectorUserId: 'insp-1',
          testType: 'PHYSICAL_MOISTURE_ASSAY',
          sampledAt: '2026-09-02T10:00:00Z',
          testedAt: '2026-09-02T11:00:00Z',
          status: 'VERIFIED',
          methodCode: 'ISO-712-OVEN',
          sourceCode: 'LAB-CENTRAL',
          notes: 'Standard sample',
          verifiedAt: '2026-09-02T12:00:00Z',
          verifiedByUserId: 'insp-1',
        },
      ],
      latestVerifiedResult: null,
    };

    const mockMe = {
      userId: 'user-1',
      organizationIds: [],
      globalRoles: ['ADMIN'],
      organizationRoles: {},
    };

    globalThis.fetch = vi.fn().mockImplementation((url: string) => {
      if (url.includes('/me')) {
        return Promise.resolve({ ok: true, status: 200, json: async () => mockMe } as Response);
      }
      if (url.includes('/passport')) {
        return Promise.resolve({
          ok: true,
          status: 200,
          json: async () => mockPassport,
        } as Response);
      }
      return Promise.resolve({ ok: true, status: 200, json: async () => ({}) } as Response);
    });

    render(
      <QueryProvider>
        <AuthProvider>
          <LotPassportPage />
        </AuthProvider>
      </QueryProvider>,
    );

    expect((await screen.findAllByText('LOT-2026-PASSPORT-01')).length).toBeGreaterThanOrEqual(1);
    expect(screen.getByText('200 MT')).toBeInTheDocument();
    expect(screen.getByText('1. Origin & Supplier Custody')).toBeInTheDocument();
    expect(screen.getByText('2. Origin GPS Location (WGS84)')).toBeInTheDocument();
    expect(screen.getByText('3. Quality Tests & Inspection')).toBeInTheDocument();
    expect(screen.getByText('4. Attached Verifiable Document Records')).toBeInTheDocument();
    expect(screen.getByText('ORGANIC_CERTIFICATE')).toBeInTheDocument();
    expect(screen.getByText('PHYSICAL_MOISTURE_ASSAY')).toBeInTheDocument();
  });
});
