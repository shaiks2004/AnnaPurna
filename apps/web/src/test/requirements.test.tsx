import { render, screen } from '@testing-library/react';
import { describe, it, expect, beforeEach, vi } from 'vitest';
import { QueryProvider } from '@/lib/query';
import { AuthProvider } from '@/lib/auth';
import RequirementsPage from '@/app/requirements/page';
import RequirementDetailPage from '@/app/requirements/[id]/page';
import { saveTokens } from '@/lib/api';

vi.mock('next/navigation', () => ({
  useParams: () => ({ id: 'req-test-123' }),
  useRouter: () => ({ push: vi.fn(), replace: vi.fn() }),
  usePathname: () => '/requirements',
}));

describe('Buyer Requirements & Lifecycle Workflows', () => {
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

  it('renders requirements list table with real data', async () => {
    const mockRequirements = {
      data: [
        {
          id: 'req-uuid-001',
          buyerProfileId: 'buyer-uuid',
          buyerOrganizationId: 'org-uuid',
          commodityId: 'comm-uuid',
          quantity: 150.0,
          quantityUnit: 'MT',
          qualitySpecification: 'Grade A Lokwan',
          deliveryLocation: 'Nashik Yard',
          requiredBy: '2026-10-15',
          targetPrice: 2400.0,
          maximumPrice: 2550.0,
          currencyCode: 'INR',
          status: 'OPEN',
          notes: 'Standard bag delivery',
          version: 1,
          createdAt: '2026-09-18T10:00:00Z',
          updatedAt: '2026-09-18T10:00:00Z',
        },
      ],
      page: { number: 0, size: 20, totalElements: 1, totalPages: 1 },
    };

    const mockMe = {
      userId: 'user-1',
      organizationIds: ['org-uuid'],
      globalRoles: ['BUYER_USER'],
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
      if (url.includes('/requirements')) {
        return Promise.resolve({
          ok: true,
          status: 200,
          json: async () => mockRequirements,
        } as Response);
      }
      return Promise.resolve({ ok: true, status: 200, json: async () => ({}) } as Response);
    });

    render(
      <QueryProvider>
        <AuthProvider>
          <RequirementsPage />
        </AuthProvider>
      </QueryProvider>,
    );

    expect(await screen.findByText(/Buyer Procurement Requirements/i)).toBeInTheDocument();
    expect(await screen.findByText(/150 MT/i)).toBeInTheDocument();
    expect(screen.getByText('OPEN')).toBeInTheDocument();
    expect(screen.getByText('INR 2400 (Max: 2550)')).toBeInTheDocument();
  });

  it('renders requirement detail page with lifecycle action buttons', async () => {
    const mockDetail = {
      id: 'req-test-123',
      buyerProfileId: 'buyer-uuid',
      buyerOrganizationId: 'org-uuid',
      commodityId: 'comm-uuid',
      quantity: 80.0,
      quantityUnit: 'MT',
      qualitySpecification: 'Grade A; Moisture <= 12%',
      deliveryLocation: 'Pune Central Silo',
      requiredBy: '2026-10-30',
      targetPrice: 2200.0,
      maximumPrice: 2350.0,
      currencyCode: 'INR',
      status: 'DRAFT',
      notes: 'Payment net 15',
      version: 0,
      createdAt: '2026-09-19T00:00:00Z',
      updatedAt: '2026-09-19T00:00:00Z',
    };

    const mockMe = {
      userId: 'user-1',
      organizationIds: ['org-uuid'],
      globalRoles: ['BUYER_USER'],
      organizationRoles: {},
    };

    globalThis.fetch = vi.fn().mockImplementation((url: string) => {
      if (url.includes('/me')) {
        return Promise.resolve({ ok: true, status: 200, json: async () => mockMe } as Response);
      }
      if (url.includes('/requirements/req-test-123')) {
        return Promise.resolve({ ok: true, status: 200, json: async () => mockDetail } as Response);
      }
      return Promise.resolve({ ok: true, status: 200, json: async () => ({}) } as Response);
    });

    render(
      <QueryProvider>
        <AuthProvider>
          <RequirementDetailPage />
        </AuthProvider>
      </QueryProvider>,
    );

    expect(await screen.findByText(/80 MT/i)).toBeInTheDocument();
    expect(screen.getByText('DRAFT')).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /Publish Requirement/i })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /Edit Draft/i })).toBeInTheDocument();
  });
});
