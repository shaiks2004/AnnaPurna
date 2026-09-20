'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Plus, Search, Eye, Loader2, Store, Filter } from 'lucide-react';
import { AppShell } from '@/components/layout/AppShell';
import {
  PageHeader,
  LoadingState,
  ErrorState,
  EmptyState,
  Badge,
  StatusNotification,
} from '@/components/ui/States';
import { Pagination } from '@/components/ui/Pagination';
import { Modal } from '@/components/ui/Modal';
import { listMarkets, createMarket, type Market, type MarketCreateRequest } from '@/lib/api';
import { useAuth } from '@/lib/auth';

export default function MarketsPage() {
  const queryClient = useQueryClient();
  const { hasRole } = useAuth();
  const isAdmin = hasRole('ADMIN');

  const [page, setPage] = useState(0);
  const [search, setSearch] = useState('');
  const [stateFilter, setStateFilter] = useState('');
  const [districtFilter, setDistrictFilter] = useState('');
  const [appliedFilters, setAppliedFilters] = useState<{
    search?: string;
    state?: string;
    district?: string;
  }>({});

  const [modalOpen, setModalOpen] = useState(false);
  const [notification, setNotification] = useState<{
    type: 'success' | 'error';
    message: string;
  } | null>(null);

  // New Market Form state
  const [newName, setNewName] = useState('');
  const [newCode, setNewCode] = useState('');
  const [newType, setNewType] = useState('');
  const [newState, setNewState] = useState('');
  const [newDistrict, setNewDistrict] = useState('');
  const [newActive, setNewActive] = useState(true);

  const query = useQuery({
    queryKey: ['markets', page, appliedFilters],
    queryFn: () =>
      listMarkets({
        page,
        size: 20,
        search: appliedFilters.search,
        state: appliedFilters.state,
        district: appliedFilters.district,
      }),
  });

  const createMutation = useMutation({
    mutationFn: (payload: MarketCreateRequest) => createMarket(payload),
    onSuccess: (created) => {
      setModalOpen(false);
      setNewName('');
      setNewCode('');
      setNewType('');
      setNewState('');
      setNewDistrict('');
      setNewActive(true);
      setNotification({
        type: 'success',
        message: `Market "${created.name}" created successfully.`,
      });
      void queryClient.invalidateQueries({ queryKey: ['markets'] });
    },
    onError: (err) => {
      setNotification({
        type: 'error',
        message: err instanceof Error ? err.message : 'Failed to create market.',
      });
    },
  });

  const handleFilterSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setPage(0);
    setAppliedFilters({
      search: search.trim() || undefined,
      state: stateFilter.trim() || undefined,
      district: districtFilter.trim() || undefined,
    });
  };

  const handleClearFilters = () => {
    setSearch('');
    setStateFilter('');
    setDistrictFilter('');
    setAppliedFilters({});
    setPage(0);
  };

  const handleCreateSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    createMutation.mutate({
      name: newName.trim(),
      marketCode: newCode.trim(),
      marketTypeCode: newType.trim() || null,
      state: newState.trim() || null,
      district: newDistrict.trim() || null,
      active: newActive,
    });
  };

  return (
    <AppShell>
      <PageHeader
        title="Physical Markets & Mandis"
        eyebrow="Market Intelligence"
        breadcrumbs={[{ label: 'Dashboard', href: '/dashboard' }, { label: 'Markets' }]}
        actions={
          isAdmin && (
            <button
              onClick={() => {
                setNotification(null);
                setModalOpen(true);
              }}
              className="agri-btn-primary"
            >
              <Plus className="h-4 w-4" />
              <span>Add Market</span>
            </button>
          )
        }
      />

      {notification && (
        <StatusNotification type={notification.type} message={notification.message} />
      )}

      {/* Filter Bar */}
      <div className="agri-card p-4 mb-6">
        <form
          onSubmit={handleFilterSubmit}
          className="grid grid-cols-1 sm:grid-cols-4 gap-3 items-end"
        >
          <div>
            <label
              className="block text-[11px] font-heading font-semibold uppercase tracking-wider text-[#657169] mb-1"
              htmlFor="mkt-search"
            >
              Keyword
            </label>
            <div className="relative">
              <Search className="absolute left-3 top-2.5 h-3.5 w-3.5 text-[#78877E]" />
              <input
                id="mkt-search"
                type="text"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Market name or code..."
                className="agri-input pl-8"
              />
            </div>
          </div>

          <div>
            <label
              className="block text-[11px] font-heading font-semibold uppercase tracking-wider text-[#657169] mb-1"
              htmlFor="mkt-state"
            >
              State
            </label>
            <input
              id="mkt-state"
              type="text"
              value={stateFilter}
              onChange={(e) => setStateFilter(e.target.value)}
              placeholder="e.g. Maharashtra"
              className="agri-input"
            />
          </div>

          <div>
            <label
              className="block text-[11px] font-heading font-semibold uppercase tracking-wider text-[#657169] mb-1"
              htmlFor="mkt-district"
            >
              District
            </label>
            <input
              id="mkt-district"
              type="text"
              value={districtFilter}
              onChange={(e) => setDistrictFilter(e.target.value)}
              placeholder="e.g. Nashik"
              className="agri-input"
            />
          </div>

          <div className="flex gap-2">
            <button
              type="submit"
              className="agri-btn-primary flex-1"
            >
              <Filter className="h-3.5 w-3.5" />
              <span>Apply Filters</span>
            </button>
            {(appliedFilters.search || appliedFilters.state || appliedFilters.district) && (
              <button
                type="button"
                onClick={handleClearFilters}
                className="agri-btn-secondary"
              >
                Clear
              </button>
            )}
          </div>
        </form>
      </div>

      {/* Markets Table */}
      <div className="agri-card overflow-hidden">
        {query.isLoading ? (
          <LoadingState message="Fetching market directory from backend..." />
        ) : query.error ? (
          <div className="p-6">
            <ErrorState error={query.error} onRetry={() => query.refetch()} />
          </div>
        ) : !query.data?.data.length ? (
          <div className="p-8">
            <EmptyState
              title="No markets found"
              description="No registered market records matched the specified criteria."
            />
          </div>
        ) : (
          <div>
            <div className="overflow-x-auto">
              <table className="agri-table">
                <thead>
                  <tr>
                    <th>Market Name</th>
                    <th>Market Code</th>
                    <th>Type</th>
                    <th>Location</th>
                    <th>Status</th>
                    <th className="text-right">Action</th>
                  </tr>
                </thead>
                <tbody>
                  {query.data.data.map((m: Market) => (
                    <tr key={m.id}>
                      <td className="font-heading font-semibold text-[#26332D]">
                        <div className="flex items-center gap-2">
                          <Store className="h-4 w-4 text-[#17633F]" />
                          <span>{m.name}</span>
                        </div>
                      </td>
                      <td className="font-mono text-[#657169] text-xs">{m.marketCode}</td>
                      <td className="text-[#657169]">{m.marketTypeCode ?? 'APMC'}</td>
                      <td className="text-[#26332D]">
                        {[m.district, m.state].filter(Boolean).join(', ') || 'Not specified'}
                      </td>
                      <td>
                        <Badge variant={m.active ? 'success' : 'default'}>
                          {m.active ? 'Active' : 'Inactive'}
                        </Badge>
                      </td>
                      <td className="text-right">
                        <Link
                          href={`/markets/${m.id}`}
                          className="inline-flex items-center gap-1 text-[#17633F] hover:text-[#124D31] font-heading font-semibold text-xs"
                        >
                          <Eye className="h-3.5 w-3.5" />
                          <span>View</span>
                        </Link>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            <Pagination
              currentPage={query.data.page.number}
              totalPages={query.data.page.totalPages}
              totalElements={query.data.page.totalElements}
              onPageChange={(p) => setPage(p)}
              pageSize={query.data.page.size}
            />
          </div>
        )}
      </div>

      {/* Add Market Modal (Admin Only) */}
      <Modal
        isOpen={modalOpen}
        onClose={() => setModalOpen(false)}
        title="Register Physical Market"
        subtitle="Provision an APMC or private trading yard in the directory"
      >
        <form onSubmit={handleCreateSubmit} className="space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label
                className="block text-[11px] font-heading font-semibold uppercase tracking-wider text-[#26332D] mb-1"
                htmlFor="m-name"
              >
                Market Name *
              </label>
              <input
                id="m-name"
                type="text"
                required
                value={newName}
                onChange={(e) => setNewName(e.target.value)}
                placeholder="e.g. Lasalgaon APMC"
                className="agri-input"
              />
            </div>

            <div>
              <label
                className="block text-[11px] font-heading font-semibold uppercase tracking-wider text-[#26332D] mb-1"
                htmlFor="m-code"
              >
                Market Code *
              </label>
              <input
                id="m-code"
                type="text"
                required
                value={newCode}
                onChange={(e) => setNewCode(e.target.value)}
                placeholder="e.g. MKT-LAS-01"
                className="agri-input font-mono"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div>
              <label
                className="block text-[11px] font-heading font-semibold uppercase tracking-wider text-[#26332D] mb-1"
                htmlFor="m-type"
              >
                Type Code
              </label>
              <input
                id="m-type"
                type="text"
                value={newType}
                onChange={(e) => setNewType(e.target.value)}
                placeholder="e.g. PRIMARY_APMC"
                className="agri-input"
              />
            </div>

            <div>
              <label
                className="block text-[11px] font-heading font-semibold uppercase tracking-wider text-[#26332D] mb-1"
                htmlFor="m-state"
              >
                State
              </label>
              <input
                id="m-state"
                type="text"
                value={newState}
                onChange={(e) => setNewState(e.target.value)}
                placeholder="e.g. Maharashtra"
                className="agri-input"
              />
            </div>

            <div>
              <label
                className="block text-[11px] font-heading font-semibold uppercase tracking-wider text-[#26332D] mb-1"
                htmlFor="m-district"
              >
                District
              </label>
              <input
                id="m-district"
                type="text"
                value={newDistrict}
                onChange={(e) => setNewDistrict(e.target.value)}
                placeholder="e.g. Nashik"
                className="agri-input"
              />
            </div>
          </div>

          <div className="flex items-center gap-2 pt-1">
            <input
              id="m-active"
              type="checkbox"
              checked={newActive}
              onChange={(e) => setNewActive(e.target.checked)}
              className="h-4 w-4 text-[#17633F] rounded border-[#DDE2DB] focus:ring-[#17633F]"
            />
            <label htmlFor="m-active" className="text-xs font-medium text-[#26332D]">
              Active in procurement operations
            </label>
          </div>

          <div className="pt-4 border-t border-[#DDE2DB] flex items-center justify-end gap-2">
            <button
              type="button"
              onClick={() => setModalOpen(false)}
              className="agri-btn-secondary"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={createMutation.isPending}
              className="agri-btn-primary"
            >
              {createMutation.isPending && <Loader2 className="h-3.5 w-3.5 animate-spin" />}
              <span>Register Market</span>
            </button>
          </div>
        </form>
      </Modal>
    </AppShell>
  );
}
