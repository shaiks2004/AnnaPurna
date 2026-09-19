import { render, screen } from '@testing-library/react';
import { describe, it, expect, beforeEach, vi } from 'vitest';
import { QueryProvider } from '@/lib/query';
import { AuthProvider } from '@/lib/auth';
import RequirementMatchesPage from '@/app/requirements/[id]/matches/page';
import { saveTokens } from '@/lib/api';

vi.mock('next/navigation', () => ({
  useParams: () => ({ id: 'req-match-123' }),
  useRouter: () => ({ push: vi.fn(), replace: vi.fn() }),
  usePathname: () => '/requirements/req-match-123/matches',
}));

describe('Matching Engine Results & Baseline Transparency', () => {
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

  it('renders ranked lot match cards with score, model info, and factor reasons', async () => {
    const mockMatches = [
      {
        requirementId: 'req-match-123',
        lotId: 'lot-uuid-001',
        score: 0.845,
        modelName: 'deterministic-baseline',
        modelVersion: 'v1',
        rankedPosition: 1,
        explanation: [
          'Commodity match: 1.000',
          'Quantity coverage: 1.000 (100.00 MT available)',
          'Verified quality: 0.850 (Moisture 11.4%)',
          'Geospatial proximity: 0.920 (Distance 42 km)',
          'Delivery schedule: 1.000',
        ],
      },
    ];

    const mockMe = {
      userId: 'user-1',
      organizationIds: [],
      globalRoles: ['BUYER_USER'],
      organizationRoles: {},
    };

    globalThis.fetch = vi.fn().mockImplementation((url: string) => {
      if (url.includes('/me')) {
        return Promise.resolve({ ok: true, status: 200, json: async () => mockMe } as Response);
      }
      if (url.includes('/requirements/req-match-123/matches')) {
        return Promise.resolve({
          ok: true,
          status: 200,
          json: async () => mockMatches,
        } as Response);
      }
      if (url.includes('/requirements/req-match-123')) {
        return Promise.resolve({
          ok: true,
          status: 200,
          json: async () => ({ id: 'req-match-123', status: 'OPEN' }),
        } as Response);
      }
      return Promise.resolve({ ok: true, status: 200, json: async () => ({}) } as Response);
    });

    render(
      <QueryProvider>
        <AuthProvider>
          <RequirementMatchesPage />
        </AuthProvider>
      </QueryProvider>,
    );

    expect(await screen.findByText(/Ranked Lot Matches/i)).toBeInTheDocument();
    expect(await screen.findByText(/#1/i)).toBeInTheDocument();
    expect(screen.getByText('84.5%')).toBeInTheDocument();
    expect(screen.getAllByText(/deterministic-baseline/i).length).toBeGreaterThanOrEqual(1);
    expect(screen.getByText(/Commodity match: 1.000/i)).toBeInTheDocument();
    expect(screen.getByText(/Verified quality: 0.850/i)).toBeInTheDocument();
    expect(screen.getByRole('link', { name: /Inspect Lot Passport/i })).toHaveAttribute(
      'href',
      '/lots/lot-uuid-001/passport',
    );
  });

  it('renders informative empty state when zero matches are returned', async () => {
    const mockMe = {
      userId: 'user-1',
      organizationIds: [],
      globalRoles: ['BUYER_USER'],
      organizationRoles: {},
    };

    globalThis.fetch = vi.fn().mockImplementation((url: string) => {
      if (url.includes('/me')) {
        return Promise.resolve({ ok: true, status: 200, json: async () => mockMe } as Response);
      }
      if (url.includes('/matches')) {
        return Promise.resolve({ ok: true, status: 200, json: async () => [] } as Response);
      }
      return Promise.resolve({
        ok: true,
        status: 200,
        json: async () => ({ id: 'req-match-123' }),
      } as Response);
    });

    render(
      <QueryProvider>
        <AuthProvider>
          <RequirementMatchesPage />
        </AuthProvider>
      </QueryProvider>,
    );

    expect(await screen.findByText(/No matching lots available/i)).toBeInTheDocument();
  });
});
