import { render, screen, waitFor } from '@testing-library/react';
import { describe, expect, it, vi, beforeEach } from 'vitest';
import RootPage from './page';
import { AuthProvider } from '@/lib/auth';
import { QueryProvider } from '@/lib/query';
import { saveTokens } from '@/lib/api';

const mockReplace = vi.fn();

vi.mock('next/navigation', () => ({
  useRouter: () => ({
    replace: mockReplace,
    push: vi.fn(),
  }),
}));

describe('RootPage', () => {
  beforeEach(() => {
    sessionStorage.clear();
    mockReplace.mockClear();
    vi.restoreAllMocks();
  });

  it('renders initialization state and redirects unauthenticated user to /login', async () => {
    render(
      <QueryProvider>
        <AuthProvider>
          <RootPage />
        </AuthProvider>
      </QueryProvider>,
    );

    expect(screen.getByText(/Initializing Annapurna platform/i)).toBeInTheDocument();

    await waitFor(() => {
      expect(mockReplace).toHaveBeenCalledWith('/login');
    });
  });

  it('redirects authenticated user to /dashboard', async () => {
    saveTokens({
      accessToken: 'valid-access-token',
      tokenType: 'Bearer',
      expiresIn: 900,
      refreshToken: 'valid-refresh-token',
    });

    const mockMe = {
      userId: '11111111-1111-1111-1111-111111111111',
      organizationIds: ['org-1'],
      globalRoles: ['ADMIN'],
      organizationRoles: {},
    };

    globalThis.fetch = vi.fn().mockResolvedValue({
      ok: true,
      status: 200,
      json: async () => mockMe,
    } as Response);

    render(
      <QueryProvider>
        <AuthProvider>
          <RootPage />
        </AuthProvider>
      </QueryProvider>,
    );

    await waitFor(() => {
      expect(mockReplace).toHaveBeenCalledWith('/dashboard');
    });
  });
});
