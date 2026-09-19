'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Plus, Search, Eye, Loader2, Leaf } from 'lucide-react';
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
              className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-md bg-[#0e4937] hover:bg-[#135f48] text-white text-xs font-medium shadow-xs transition"
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
      <div className="bg-white p-4 rounded-lg border border-stone-200 shadow-2xs mb-6">
        <form onSubmit={handleSearchSubmit} className="flex gap-2">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-2.5 h-4 w-4 text-stone-400" />
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search by commodity name..."
              className="w-full pl-9 pr-4 py-2 text-xs border border-stone-300 rounded-md focus:outline-none focus:ring-2 focus:ring-emerald-700/20 focus:border-emerald-700 text-stone-900"
            />
          </div>
          <button
            type="submit"
            className="px-4 py-2 bg-stone-800 hover:bg-stone-900 text-white text-xs font-medium rounded-md transition"
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
              className="px-3 py-2 border border-stone-300 hover:bg-stone-50 text-stone-700 text-xs font-medium rounded-md transition"
            >
              Clear
            </button>
          )}
        </form>
      </div>

      {/* Data Table */}
      <div className="bg-white rounded-lg border border-stone-200 shadow-2xs overflow-hidden">
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
              <table className="w-full text-left text-xs border-collapse">
                <thead>
                  <tr className="border-b border-stone-200 bg-stone-50/50 text-stone-600">
                    <th className="py-3 px-4 font-semibold uppercase tracking-wider">
                      Commodity Name
                    </th>
                    <th className="py-3 px-4 font-semibold uppercase tracking-wider">Code</th>
                    <th className="py-3 px-4 font-semibold uppercase tracking-wider">Status</th>
                    <th className="py-3 px-4 font-semibold uppercase tracking-wider text-right">
                      Action
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-stone-100">
                  {query.data.data.map((c: Commodity) => (
                    <tr key={c.id} className="hover:bg-stone-50/60 transition">
                      <td className="py-3.5 px-4 font-medium text-stone-900 flex items-center gap-2">
                        <Leaf className="h-4 w-4 text-emerald-700" />
                        <span>{c.name}</span>
                      </td>
                      <td className="py-3.5 px-4 font-mono text-stone-600">
                        {c.commodityCode ?? '—'}
                      </td>
                      <td className="py-3.5 px-4">
                        <Badge variant={c.active ? 'success' : 'default'}>
                          {c.active ? 'Active' : 'Inactive'}
                        </Badge>
                      </td>
                      <td className="py-3.5 px-4 text-right">
                        <Link
                          href={`/commodities/${c.id}`}
                          className="inline-flex items-center gap-1 text-emerald-800 hover:text-emerald-950 font-medium"
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
              className="block text-xs font-semibold uppercase tracking-wider text-stone-600 mb-1"
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
              className="w-full px-3 py-2 text-xs border border-stone-300 rounded-md focus:outline-none focus:ring-2 focus:ring-emerald-700/20 focus:border-emerald-700 text-stone-900"
            />
          </div>

          <div>
            <label
              className="block text-xs font-semibold uppercase tracking-wider text-stone-600 mb-1"
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
              className="w-full px-3 py-2 text-xs border border-stone-300 rounded-md focus:outline-none focus:ring-2 focus:ring-emerald-700/20 focus:border-emerald-700 text-stone-900 font-mono"
            />
          </div>

          <div className="flex items-center gap-2 pt-1">
            <input
              id="comm-active"
              type="checkbox"
              checked={newActive}
              onChange={(e) => setNewActive(e.target.checked)}
              className="h-4 w-4 text-emerald-800 rounded border-stone-300 focus:ring-emerald-700"
            />
            <label htmlFor="comm-active" className="text-xs font-medium text-stone-700">
              Active in trade catalog
            </label>
          </div>

          <div className="pt-4 border-t border-stone-200 flex items-center justify-end gap-2">
            <button
              type="button"
              onClick={() => setModalOpen(false)}
              className="px-4 py-2 border border-stone-300 hover:bg-stone-50 text-stone-700 text-xs font-medium rounded-md transition"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={createMutation.isPending}
              className="inline-flex items-center gap-1.5 px-4 py-2 bg-[#0e4937] hover:bg-[#135f48] text-white text-xs font-medium rounded-md shadow-xs transition disabled:opacity-50"
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
