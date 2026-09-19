'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { useQuery } from '@tanstack/react-query';
import { Plus, Search, Eye, Leaf, ShieldCheck, Filter } from 'lucide-react';
import { AppShell } from '@/components/layout/AppShell';
import { PageHeader, LoadingState, ErrorState, EmptyState, Badge } from '@/components/ui/States';
import { Pagination } from '@/components/ui/Pagination';
import { listLots, listCommodities, type Lot, type LotStatus } from '@/lib/api';
import { useAuth } from '@/lib/auth';

export default function LotsPage() {
  const { hasRole } = useAuth();
  const canCreate = hasRole('FARMER') || hasRole('FPO_USER') || hasRole('ADMIN');

  const [page, setPage] = useState(0);
  const [search, setSearch] = useState('');
  const [commodityId, setCommodityId] = useState('');
  const [status, setStatus] = useState<LotStatus | ''>('');
  const [appliedFilters, setAppliedFilters] = useState<{
    search?: string;
    commodityId?: string;
    status?: LotStatus;
  }>({});

  const commoditiesQuery = useQuery({
    queryKey: ['commodities-dropdown'],
    queryFn: () => listCommodities(0, 100),
  });

  const query = useQuery({
    queryKey: ['lots', page, appliedFilters],
    queryFn: () =>
      listLots({
        page,
        size: 20,
        search: appliedFilters.search,
        commodityId: appliedFilters.commodityId,
        status: appliedFilters.status || undefined,
      }),
  });

  const handleFilterSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setPage(0);
    setAppliedFilters({
      search: search.trim() || undefined,
      commodityId: commodityId || undefined,
      status: status || undefined,
    });
  };

  const handleClear = () => {
    setSearch('');
    setCommodityId('');
    setStatus('');
    setAppliedFilters({});
    setPage(0);
  };

  return (
    <AppShell>
      <PageHeader
        title="Physical Lots & Traceability"
        eyebrow="Lot Inventory & Passports"
        breadcrumbs={[{ label: 'Dashboard', href: '/dashboard' }, { label: 'Lots' }]}
        actions={
          canCreate && (
            <Link
              href="/lots/new"
              className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-md bg-[#0e4937] hover:bg-[#135f48] text-white text-xs font-medium shadow-xs transition"
            >
              <Plus className="h-4 w-4" />
              <span>Create Physical Lot</span>
            </Link>
          )
        }
      />

      {/* Filter Bar */}
      <div className="bg-white p-4 rounded-lg border border-stone-200 shadow-2xs mb-6">
        <form
          onSubmit={handleFilterSubmit}
          className="grid grid-cols-1 sm:grid-cols-4 gap-3 items-end"
        >
          <div>
            <label
              className="block text-[11px] font-semibold uppercase tracking-wider text-stone-500 mb-1"
              htmlFor="lot-search"
            >
              Keyword
            </label>
            <div className="relative">
              <Search className="absolute left-3 top-2.5 h-3.5 w-3.5 text-stone-400" />
              <input
                id="lot-search"
                type="text"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Search lot number..."
                className="w-full pl-8 pr-3 py-1.5 text-xs border border-stone-300 rounded-md focus:outline-none focus:ring-2 focus:ring-emerald-700/20 focus:border-emerald-700 text-stone-900"
              />
            </div>
          </div>

          <div>
            <label
              className="block text-[11px] font-semibold uppercase tracking-wider text-stone-500 mb-1"
              htmlFor="lot-comm"
            >
              Commodity
            </label>
            <select
              id="lot-comm"
              value={commodityId}
              onChange={(e) => setCommodityId(e.target.value)}
              className="w-full px-3 py-1.5 text-xs border border-stone-300 rounded-md focus:outline-none focus:ring-2 focus:ring-emerald-700/20 focus:border-emerald-700 text-stone-900 bg-white"
            >
              <option value="">All Commodities</option>
              {commoditiesQuery.data?.data.map((c) => (
                <option key={c.id} value={c.id}>
                  {c.name}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label
              className="block text-[11px] font-semibold uppercase tracking-wider text-stone-500 mb-1"
              htmlFor="lot-status"
            >
              Lifecycle Status
            </label>
            <select
              id="lot-status"
              value={status}
              onChange={(e) => setStatus(e.target.value as LotStatus | '')}
              className="w-full px-3 py-1.5 text-xs border border-stone-300 rounded-md focus:outline-none focus:ring-2 focus:ring-emerald-700/20 focus:border-emerald-700 text-stone-900 bg-white"
            >
              <option value="">All Statuses</option>
              <option value="DECLARED">DECLARED (Initial State)</option>
              <option value="VERIFIED">VERIFIED (Quality Approved)</option>
              <option value="COMMITTED">COMMITTED (Allocated)</option>
              <option value="CLOSED">CLOSED (Completed / Settled)</option>
            </select>
          </div>

          <div className="flex gap-2">
            <button
              type="submit"
              className="flex-1 inline-flex items-center justify-center gap-1.5 px-3 py-2 bg-stone-800 hover:bg-stone-900 text-white text-xs font-medium rounded-md transition"
            >
              <Filter className="h-3.5 w-3.5" />
              <span>Apply Filters</span>
            </button>
            {(appliedFilters.search || appliedFilters.commodityId || appliedFilters.status) && (
              <button
                type="button"
                onClick={handleClear}
                className="px-3 py-2 border border-stone-300 hover:bg-stone-50 text-stone-700 text-xs font-medium rounded-md transition"
              >
                Clear
              </button>
            )}
          </div>
        </form>
      </div>

      {/* Lots Table */}
      <div className="bg-white rounded-lg border border-stone-200 shadow-2xs overflow-hidden">
        {query.isLoading ? (
          <LoadingState message="Fetching lot records from backend..." />
        ) : query.error ? (
          <div className="p-6">
            <ErrorState error={query.error} onRetry={() => query.refetch()} />
          </div>
        ) : !query.data?.data.length ? (
          <div className="p-8">
            <EmptyState
              title="No lots found"
              description="No physical lot records matched your current filters or access scope."
              action={
                canCreate ? (
                  <Link
                    href="/lots/new"
                    className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-md bg-[#0e4937] hover:bg-[#135f48] text-white text-xs font-medium transition"
                  >
                    <Plus className="h-4 w-4" />
                    <span>Create First Lot</span>
                  </Link>
                ) : undefined
              }
            />
          </div>
        ) : (
          <div>
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs border-collapse">
                <thead>
                  <tr className="border-b border-stone-200 bg-stone-50/50 text-stone-600">
                    <th className="py-3 px-4 font-semibold uppercase tracking-wider">Lot Number</th>
                    <th className="py-3 px-4 font-semibold uppercase tracking-wider">Quantity</th>
                    <th className="py-3 px-4 font-semibold uppercase tracking-wider">
                      Harvest Date
                    </th>
                    <th className="py-3 px-4 font-semibold uppercase tracking-wider">
                      Available From
                    </th>
                    <th className="py-3 px-4 font-semibold uppercase tracking-wider">Status</th>
                    <th className="py-3 px-4 font-semibold uppercase tracking-wider text-right">
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-stone-100">
                  {query.data.data.map((lot: Lot) => (
                    <tr key={lot.id} className="hover:bg-stone-50/60 transition">
                      <td className="py-3.5 px-4 font-medium text-stone-900 font-mono flex items-center gap-2">
                        <Leaf className="h-4 w-4 text-emerald-700" />
                        <span>{lot.lotNumber}</span>
                      </td>
                      <td className="py-3.5 px-4 font-semibold text-stone-800">
                        {lot.quantity} {lot.quantityUnit}
                      </td>
                      <td className="py-3.5 px-4 text-stone-600">{lot.harvestDate ?? '—'}</td>
                      <td className="py-3.5 px-4 text-stone-600">
                        {lot.availableFrom ?? 'Immediate'}
                      </td>
                      <td className="py-3.5 px-4">
                        <Badge
                          variant={
                            lot.status === 'VERIFIED'
                              ? 'success'
                              : lot.status === 'COMMITTED'
                                ? 'info'
                                : lot.status === 'CLOSED'
                                  ? 'default'
                                  : 'warning'
                          }
                        >
                          {lot.status}
                        </Badge>
                      </td>
                      <td className="py-3.5 px-4 text-right space-x-2">
                        <Link
                          href={`/lots/${lot.id}/passport`}
                          className="inline-flex items-center gap-1 text-emerald-800 hover:text-emerald-950 font-semibold bg-emerald-50 px-2 py-1 rounded border border-emerald-200 transition"
                          title="View complete immutable Lot Passport"
                        >
                          <ShieldCheck className="h-3.5 w-3.5" />
                          <span>Passport</span>
                        </Link>
                        <Link
                          href={`/lots/${lot.id}`}
                          className="inline-flex items-center gap-1 text-stone-700 hover:text-stone-950 font-medium px-2 py-1 rounded border border-stone-200 hover:bg-stone-50 transition"
                        >
                          <Eye className="h-3.5 w-3.5" />
                          <span>Manage</span>
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
    </AppShell>
  );
}
