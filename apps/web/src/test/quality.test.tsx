import { render, screen } from '@testing-library/react';
import { describe, it, expect, beforeEach, vi } from 'vitest';
import { QueryProvider } from '@/lib/query';
import { AuthProvider } from '@/lib/auth';
import LotQualityPage from '@/app/lots/[id]/quality/page';
import { saveTokens } from '@/lib/api';

vi.mock('next/navigation', () => ({
  useParams: () => ({ id: 'lot-quality-123' }),
  useRouter: () => ({ push: vi.fn(), replace: vi.fn() }),
  usePathname: () => '/lots/lot-quality-123/quality',
}));

describe('Quality Verification & Inspector Actions', () => {
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

  it('renders quality tests and displays Verify Test button for QUALITY_INSPECTOR', async () => {
    const mockTests = {
      data: [
        {
          id: 'test-qa-01',
          lotId: 'lot-quality-123',
          inspectorUserId: null,
          testType: 'GRAIN_PURITY_ASSAY',
          sampledAt: '2026-09-18T10:00:00Z',
          testedAt: '2026-09-18T11:00:00Z',
          status: 'PENDING_VERIFICATION',
          methodCode: 'ISO-520-GRAIN',
          sourceCode: 'LAB-PUNE',
          notes: 'Standard purity check',
          verifiedAt: null,
          verifiedByUserId: null,
        },
      ],
      page: { number: 0, size: 20, totalElements: 1, totalPages: 1 },
    };

    const mockMeasurements = [
      {
        id: 'meas-1',
        qualityTestId: 'test-qa-01',
        metricName: 'ForeignMatter',
        numericValue: 0.8,
        unit: '%',
        textValue: 'Passes Grade A',
      },
    ];

    const mockMe = {
      userId: 'inspector-user-1',
      organizationIds: [],
      globalRoles: ['QUALITY_INSPECTOR'],
      organizationRoles: {},
    };

    globalThis.fetch = vi.fn().mockImplementation((url: string) => {
      if (url.includes('/me')) {
        return Promise.resolve({ ok: true, status: 200, json: async () => mockMe } as Response);
      }
      if (url.includes('/quality-tests/test-qa-01/results')) {
        return Promise.resolve({
          ok: true,
          status: 200,
          json: async () => mockMeasurements,
        } as Response);
      }
      if (url.includes('/lots/lot-quality-123/quality-tests')) {
        return Promise.resolve({ ok: true, status: 200, json: async () => mockTests } as Response);
      }
      if (url.includes('/lots/lot-quality-123')) {
        return Promise.resolve({
          ok: true,
          status: 200,
          json: async () => ({ id: 'lot-quality-123', lotNumber: 'LOT-QA-01' }),
        } as Response);
      }
      return Promise.resolve({ ok: true, status: 200, json: async () => ({}) } as Response);
    });

    render(
      <QueryProvider>
        <AuthProvider>
          <LotQualityPage />
        </AuthProvider>
      </QueryProvider>,
    );

    expect(await screen.findByText('GRAIN_PURITY_ASSAY')).toBeInTheDocument();
    expect(screen.getByText('ISO-520-GRAIN')).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /Verify Test/i })).toBeInTheDocument();
    expect(await screen.findByText('ForeignMatter')).toBeInTheDocument();
    expect(screen.getByText('0.8')).toBeInTheDocument();
  });

  it('hides Verify button for non-inspector roles', async () => {
    const mockTests = {
      data: [
        {
          id: 'test-qa-02',
          lotId: 'lot-quality-123',
          inspectorUserId: null,
          testType: 'MOISTURE_TEST',
          sampledAt: '2026-09-18T10:00:00Z',
          testedAt: '2026-09-18T11:00:00Z',
          status: 'PENDING_VERIFICATION',
          methodCode: 'ISO-712',
          sourceCode: 'LAB-1',
          notes: null,
          verifiedAt: null,
          verifiedByUserId: null,
        },
      ],
      page: { number: 0, size: 20, totalElements: 1, totalPages: 1 },
    };

    const mockMe = {
      userId: 'farmer-user-1',
      organizationIds: [],
      globalRoles: ['FARMER'],
      organizationRoles: {},
    };

    globalThis.fetch = vi.fn().mockImplementation((url: string) => {
      if (url.includes('/me')) {
        return Promise.resolve({ ok: true, status: 200, json: async () => mockMe } as Response);
      }
      if (url.includes('/results')) {
        return Promise.resolve({ ok: true, status: 200, json: async () => [] } as Response);
      }
      if (url.includes('/quality-tests')) {
        return Promise.resolve({ ok: true, status: 200, json: async () => mockTests } as Response);
      }
      if (url.includes('/lots/')) {
        return Promise.resolve({
          ok: true,
          status: 200,
          json: async () => ({ id: 'lot-quality-123', lotNumber: 'LOT-QA-02' }),
        } as Response);
      }
      return Promise.resolve({ ok: true, status: 200, json: async () => ({}) } as Response);
    });

    render(
      <QueryProvider>
        <AuthProvider>
          <LotQualityPage />
        </AuthProvider>
      </QueryProvider>,
    );

    expect(await screen.findByText('MOISTURE_TEST')).toBeInTheDocument();
    expect(screen.queryByRole('button', { name: /Verify Test/i })).not.toBeInTheDocument();
  });
});
