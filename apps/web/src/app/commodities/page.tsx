'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Plus, Search, Eye, Loader2, Sprout } from 'lucide-react';
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
import {
  listCommodities,
  createCommodity,
  type Commodity,
  type CommodityCreateRequest,
} from '@/lib/api';
import { useAuth } from '@/lib/auth';

export default function CommoditiesPage() {
  const queryClient = useQueryClient();
  const { hasRole } = useAuth();
  const isAdmin = hasRole('ADMIN');

  const [page, setPage] = useState(0);
  const [search, setSearch] = useState('');
  const [appliedSearch, setAppliedSearch] = useState('');
  const [modalOpen, setModalOpen] = useState(false);
  const [notification, setNotification] = useState<{
    type: 'success' | 'error';
    message: string;
  } | null>(null);

  // Form state
  const [newName, setNewName] = useState('');
  const [newCode, setNewCode] = useState('');
  const [newActive, setNewActive] = useState(true);

  const query = useQuery({
    queryKey: ['commodities', page, appliedSearch],
    queryFn: () => listCommodities(page, 20, appliedSearch),
  });

  const createMutation = useMutation({
    mutationFn: (payload: CommodityCreateRequest) => createCommodity(payload),
    onSuccess: (created) => {
      setModalOpen(false);
      setNewName('');
      setNewCode('');
      setNewActive(true);
      setNotification({
        type: 'success',
        message: `Commodity "${created.name}" created successfully.`,
      });
      void queryClient.invalidateQueries({ queryKey: ['commodities'] });
    },
    onError: (err) => {
      setNotification({
        type: 'error',
        message: err instanceof Error ? err.message : 'Failed to create commodity.',
      });
    },
  });

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setPage(0);
    setAppliedSearch(search.trim());
  };

  const handleCreateSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    createMutation.mutate({
      name: newName.trim(),
      commodityCode: newCode.trim() || null,
      active: newActive,
    });
  };

  return (
    <AppShell>
      <PageHeader
        title="Commodities Catalog"
        eyebrow="Market Intelligence"
        breadcrumbs={[{ label: 'Dashboard', href: '/dashboard' }, { label: 'Commodities' }]}
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
              <span>Add Commodity</span>
            </button>
          )
        }
      />

      {notification && (
        <StatusNotification type={notification.type} message={notification.message} />
      )}

      {/* Filter Bar */}
      <div className="agri-card p-4 mb-6">
        <form onSubmit={handleSearchSubmit} className="flex gap-2">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-2.5 h-4 w-4 text-[#78877E]" />
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search by commodity name..."
              className="agri-input pl-9"
            />
          </div>
          <button
            type="submit"
            className="agri-btn-primary"
          >
            Search
          </button>
          {appliedSearch && (
            <button
              type="button"
              onClick={() => {
                setSearch('');
                setAppliedSearch('');
                setPage(0);
              }}
              className="agri-btn-secondary"
            >
              Clear
            </button>
          )}
        </form>
      </div>

      {/* Data Table */}
      <div className="agri-card overflow-hidden">
        {query.isLoading ? (
          <LoadingState message="Fetching commodities from backend..." />
        ) : query.error ? (
          <div className="p-6">
            <ErrorState error={query.error} onRetry={() => query.refetch()} />
          </div>
        ) : !query.data?.data.length ? (
          <div className="p-8">
            <EmptyState
              title="No commodities found"
              description={
                appliedSearch
                  ? `No commodities matched "${appliedSearch}". Try a different keyword.`
                  : 'No commodity records exist in the database.'
              }
            />
          </div>
        ) : (
          <div>
            <div className="overflow-x-auto">
              <table className="agri-table">
                <thead>
                  <tr>
                    <th>Commodity Name</th>
                    <th>Code</th>
                    <th>Status</th>
                    <th className="text-right">Action</th>
                  </tr>
                </thead>
                <tbody>
                  {query.data.data.map((c: Commodity) => (
                    <tr key={c.id}>
                      <td className="font-heading font-semibold text-[#26332D]">
                        <div className="flex items-center gap-2">
                          <Sprout className="h-4 w-4 text-[#17633F]" />
                          <span>{c.name}</span>
                        </div>
                      </td>
                      <td className="font-mono text-[#657169] text-xs">
                        {c.commodityCode ?? '—'}
                      </td>
                      <td>
                        <Badge variant={c.active ? 'success' : 'default'}>
                          {c.active ? 'Active' : 'Inactive'}
                        </Badge>
                      </td>
                      <td className="text-right">
                        <Link
                          href={`/commodities/${c.id}`}
                          className="inline-flex items-center gap-1 text-[#17633F] hover:text-[#124D31] font-heading font-semibold text-xs"
                        >
                          <Eye className="h-3.5 w-3.5" />
                          <span>View Details</span>
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

      {/* Add Commodity Modal (Admin Only) */}
      <Modal
        isOpen={modalOpen}
        onClose={() => setModalOpen(false)}
        title="Add New Commodity"
        subtitle="Provision a standard agricultural commodity in the catalog"
      >
        <form onSubmit={handleCreateSubmit} className="space-y-4">
          <div>
            <label
              className="block text-[11px] font-heading font-semibold uppercase tracking-wider text-[#26332D] mb-1"
              htmlFor="comm-name"
            >
              Commodity Name *
            </label>
            <input
              id="comm-name"
              type="text"
              required
              value={newName}
              onChange={(e) => setNewName(e.target.value)}
              placeholder="e.g. Wheat (Lokwan)"
              className="agri-input"
            />
          </div>

          <div>
            <label
              className="block text-[11px] font-heading font-semibold uppercase tracking-wider text-[#26332D] mb-1"
              htmlFor="comm-code"
            >
              Commodity Code
            </label>
            <input
              id="comm-code"
              type="text"
              value={newCode}
              onChange={(e) => setNewCode(e.target.value)}
              placeholder="e.g. WHT-LOK-01"
              className="agri-input font-mono"
            />
          </div>

          <div className="flex items-center gap-2 pt-1">
            <input
              id="comm-active"
              type="checkbox"
              checked={newActive}
              onChange={(e) => setNewActive(e.target.checked)}
              className="h-4 w-4 text-[#17633F] rounded border-[#DDE2DB] focus:ring-[#17633F]"
            />
            <label htmlFor="comm-active" className="text-xs font-medium text-[#26332D]">
              Active in trade catalog
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
              <span>Save Commodity</span>
            </button>
          </div>
        </form>
      </Modal>
    </AppShell>
  );
}
