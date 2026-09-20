import { describe, it, expect, beforeEach, vi, afterEach } from 'vitest';
import {
  ApiError,
  getAccessToken,
  getRefreshToken,
  saveTokens,
  clearTokens,
  login,
  logout,
  listCommodities,
} from '@/lib/api';

describe('Central API Client and Error Handling', () => {
  beforeEach(() => {
    sessionStorage.clear();
    vi.restoreAllMocks();
  });

  afterEach(() => {
    sessionStorage.clear();
  });

  describe('ApiError Classification', () => {
    it('formats 400 validation errors with field details', () => {
      const error = new ApiError(400, 'Invalid request', {
        code: 'VALIDATION_ERROR',
        errors: { quantity: 'must be greater than 0', requiredBy: 'must be in the future' },
      });
      expect(error.status).toBe(400);
      expect(error.userFriendlyMessage).toContain('quantity: must be greater than 0');
      expect(error.userFriendlyMessage).toContain('requiredBy: must be in the future');
    });

    it('formats 401 session expired message', () => {
      const error = new ApiError(401, 'Unauthorized');
      expect(error.userFriendlyMessage).toBe(
        'Your session has expired or authentication is invalid. Please sign in again.',
      );
    });

    it('formats 403 access denied message', () => {
      const error = new ApiError(403, 'Forbidden');
      expect(error.userFriendlyMessage).toBe(
        'You do not have permission to perform this action in this organization.',
      );
    });

    it('formats 404 resource not found message', () => {
      const error = new ApiError(404, 'Requirement not found');
      expect(error.userFriendlyMessage).toBe('Requirement not found');
    });

    it('formats 409 CONCURRENT_UPDATE message specifically', () => {
      const error = new ApiError(409, 'Conflict occurred', {
        code: 'CONCURRENT_UPDATE',
      });
      expect(error.status).toBe(409);
      expect(error.code).toBe('CONCURRENT_UPDATE');
      expect(error.userFriendlyMessage).toBe(
        'This record was changed by another user. Refresh before editing.',
      );
    });

    it('formats 409 DUPLICATE_RESOURCE message', () => {
      const error = new ApiError(409, 'A resource with this identifier already exists', {
        code: 'DUPLICATE_RESOURCE',
      });
      expect(error.userFriendlyMessage).toBe('A resource with this identifier already exists');
    });

    it('formats 422 invalid request message', () => {
      const error = new ApiError(422, 'Only draft requirements can be edited', {
        code: 'INVALID_REQUEST',
      });
      expect(error.userFriendlyMessage).toBe('Only draft requirements can be edited');
    });

    it('formats 500 server error message', () => {
      const error = new ApiError(500, 'Internal Server Error');
      expect(error.userFriendlyMessage).toBe('Internal Server Error');
    });
  });

  describe('Token Management and Auth Endpoints', () => {
    it('saves and clears tokens from sessionStorage', () => {
      saveTokens({
        accessToken: 'mock-access-token',
        tokenType: 'Bearer',
        expiresIn: 900,
        refreshToken: 'mock-refresh-token',
      });

      expect(getAccessToken()).toBe('mock-access-token');
      expect(getRefreshToken()).toBe('mock-refresh-token');

      clearTokens();
      expect(getAccessToken()).toBeNull();
      expect(getRefreshToken()).toBeNull();
    });

    it('handles login and stores returned tokens', async () => {
      const mockTokens = {
        accessToken: 'acc-123',
        tokenType: 'Bearer',
        expiresIn: 900,
        refreshToken: 'ref-456',
      };

      globalThis.fetch = vi.fn().mockResolvedValue({
        ok: true,
        status: 200,
        json: async () => mockTokens,
      } as Response);

      const result = await login('admin@annapurna.com', 'password123');
      expect(result.accessToken).toBe('acc-123');
      expect(getAccessToken()).toBe('acc-123');
      expect(getRefreshToken()).toBe('ref-456');
    });

    it('handles logout and clears storage', async () => {
      saveTokens({
        accessToken: 'acc-123',
        tokenType: 'Bearer',
        expiresIn: 900,
        refreshToken: 'ref-456',
      });

      globalThis.fetch = vi.fn().mockResolvedValue({
        ok: true,
        status: 204,
      } as Response);

      await logout();
      expect(getAccessToken()).toBeNull();
      expect(getRefreshToken()).toBeNull();
    });

    it('attaches Authorization header when access token is present', async () => {
      saveTokens({
        accessToken: 'my-secret-access-token',
        tokenType: 'Bearer',
        expiresIn: 900,
        refreshToken: 'my-refresh-token',
      });

      let capturedHeaders: Headers | undefined;
      globalThis.fetch = vi.fn().mockImplementation((url, init) => {
        capturedHeaders = new Headers(init?.headers);
        return Promise.resolve({
          ok: true,
          status: 200,
          json: async () => ({
            data: [],
            page: { number: 0, size: 20, totalElements: 0, totalPages: 0 },
          }),
        } as Response);
      });

      await listCommodities(0, 20);
      expect(capturedHeaders?.get('Authorization')).toBe('Bearer my-secret-access-token');
    });
  });
});
