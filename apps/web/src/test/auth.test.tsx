import { render, screen, act, waitFor } from '@testing-library/react';
import { describe, it, expect, beforeEach, vi, afterEach } from 'vitest';
import { AuthProvider, useAuth } from '@/lib/auth';
import { saveTokens } from '@/lib/api';

function TestConsumer() {
  const { user, loading, error, login, logout, hasRole, hasGlobalRole } = useAuth();

  return (
    <div>
      {loading ? (
        <span data-testid="auth-loading">Loading...</span>
      ) : user ? (
        <div>
          <span data-testid="user-id">{user.userId}</span>
          <span data-testid="is-admin">{String(hasRole('ADMIN'))}</span>
          <span data-testid="is-farmer">{String(hasRole('FARMER'))}</span>
          <span data-testid="is-global-admin">{String(hasGlobalRole('ADMIN'))}</span>
          <button onClick={() => logout()} data-testid="logout-btn">
            Logout
          </button>
        </div>
      ) : (
        <div>
          <span data-testid="no-user">Not authenticated</span>
          {error && <span data-testid="auth-error">{error}</span>}
          <button
            onClick={() => login('admin@annapurna.com', 'password123')}
            data-testid="login-btn"
          >
            Login
          </button>
        </div>
      )}
    </div>
  );
}

describe('AuthProvider & useAuth', () => {
  beforeEach(() => {
    sessionStorage.clear();
    vi.restoreAllMocks();
  });

  afterEach(() => {
    sessionStorage.clear();
  });

  it('starts in unauthenticated state when no token exists in storage', async () => {
    render(
      <AuthProvider>
        <TestConsumer />
      </AuthProvider>,
    );

    expect(await screen.findByTestId('no-user')).toBeInTheDocument();
  });

  it('restores authenticated session when token exists in storage', async () => {
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
      <AuthProvider>
        <TestConsumer />
      </AuthProvider>,
    );

    expect(await screen.findByTestId('user-id')).toHaveTextContent(mockMe.userId);
    expect(screen.getByTestId('is-admin')).toHaveTextContent('true');
    expect(screen.getByTestId('is-farmer')).toHaveTextContent('false');
  });

  it('handles login and updates session context', async () => {
    const mockTokens = {
      accessToken: 'new-access-token',
      tokenType: 'Bearer',
      expiresIn: 900,
      refreshToken: 'new-refresh-token',
    };

    const mockMe = {
      userId: '22222222-2222-2222-2222-222222222222',
      organizationIds: [],
      globalRoles: ['BUYER_USER'],
      organizationRoles: {},
    };

    globalThis.fetch = vi
      .fn()
      .mockResolvedValueOnce({
        ok: true,
        status: 200,
        json: async () => mockTokens,
      } as Response)
      .mockResolvedValueOnce({
        ok: true,
        status: 200,
        json: async () => mockMe,
      } as Response);

    render(
      <AuthProvider>
        <TestConsumer />
      </AuthProvider>,
    );

    expect(await screen.findByTestId('no-user')).toBeInTheDocument();

    await act(async () => {
      screen.getByTestId('login-btn').click();
    });

    await waitFor(() => {
      expect(screen.getByTestId('user-id')).toHaveTextContent(mockMe.userId);
    });
  });

  it('handles logout and clears context state', async () => {
    saveTokens({
      accessToken: 'valid-access-token',
      tokenType: 'Bearer',
      expiresIn: 900,
      refreshToken: 'valid-refresh-token',
    });

    const mockMe = {
      userId: '33333333-3333-3333-3333-333333333333',
      organizationIds: [],
      globalRoles: ['ADMIN'],
      organizationRoles: {},
    };

    globalThis.fetch = vi
      .fn()
      .mockResolvedValueOnce({
        ok: true,
        status: 200,
        json: async () => mockMe,
      } as Response)
      .mockResolvedValueOnce({
        ok: true,
        status: 204,
      } as Response);

    render(
      <AuthProvider>
        <TestConsumer />
      </AuthProvider>,
    );

    expect(await screen.findByTestId('user-id')).toBeInTheDocument();

    await act(async () => {
      screen.getByTestId('logout-btn').click();
    });

    await waitFor(() => {
      expect(screen.getByTestId('no-user')).toBeInTheDocument();
    });
  });
});
