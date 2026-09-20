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
              className="agri-btn-primary"
            >
              <Plus className="h-4 w-4" />
              <span>Create Physical Lot</span>
            </Link>
          )
        }
      />

      {/* Filter Bar */}
      <div className="agri-card p-4 sm:p-5 mb-6">
        <form
          onSubmit={handleFilterSubmit}
          className="grid grid-cols-1 sm:grid-cols-4 gap-3 items-end"
        >
          <div>
            <label
              className="block text-[11px] font-semibold uppercase tracking-wider text-[#657169] mb-1.5 font-heading"
              htmlFor="lot-search"
            >
              Keyword
            </label>
            <div className="relative">
              <Search className="absolute left-3 top-2.5 h-3.5 w-3.5 text-[#78877E]" />
              <input
                id="lot-search"
                type="text"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Search lot number..."
                className="agri-input pl-8 text-xs py-1.5"
              />
            </div>
          </div>

          <div>
            <label
              className="block text-[11px] font-semibold uppercase tracking-wider text-[#657169] mb-1.5 font-heading"
              htmlFor="lot-comm"
            >
              Commodity
            </label>
            <select
              id="lot-comm"
              value={commodityId}
              onChange={(e) => setCommodityId(e.target.value)}
              className="agri-input text-xs py-1.5"
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
              className="block text-[11px] font-semibold uppercase tracking-wider text-[#657169] mb-1.5 font-heading"
              htmlFor="lot-status"
            >
              Lifecycle Status
            </label>
            <select
              id="lot-status"
              value={status}
              onChange={(e) => setStatus(e.target.value as LotStatus | '')}
              className="agri-input text-xs py-1.5"
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
              className="flex-1 agri-btn-primary justify-center text-xs py-2"
            >
              <Filter className="h-3.5 w-3.5" />
              <span>Apply Filters</span>
            </button>
            {(appliedFilters.search || appliedFilters.commodityId || appliedFilters.status) && (
              <button
                type="button"
                onClick={handleClear}
                className="agri-btn-secondary text-xs py-2"
              >
                Clear
              </button>
            )}
          </div>
        </form>
      </div>

      {/* Lots Table */}
      <div className="agri-card overflow-hidden">
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
                    className="agri-btn-primary"
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
              <table className="agri-table">
                <thead>
                  <tr>
                    <th>Lot Number</th>
                    <th>Quantity</th>
                    <th>Harvest Date</th>
                    <th>Available From</th>
                    <th>Status</th>
                    <th className="text-right">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {query.data.data.map((lot: Lot) => (
                    <tr key={lot.id}>
                      <td className="font-medium text-[#26332D] font-mono">
                        <span className="inline-flex items-center gap-2">
                          <Leaf className="h-4 w-4 text-[#17633F]" />
                          <span className="font-semibold">{lot.lotNumber}</span>
                        </span>
                      </td>
                      <td className="font-semibold text-[#123C2C]">
                        {lot.quantity} {lot.quantityUnit}
                      </td>
                      <td className="text-[#657169]">{lot.harvestDate ?? '—'}</td>
                      <td className="text-[#657169]">
                        {lot.availableFrom ?? 'Immediate'}
                      </td>
                      <td>
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
                      <td className="text-right space-x-2">
                        <Link
                          href={`/lots/${lot.id}/passport`}
                          className="inline-flex items-center gap-1 text-[#17633F] hover:text-[#123C2C] font-semibold bg-[#EAF2E8] px-2.5 py-1 rounded border border-[#B8D99F]/60 transition text-xs"
                          title="View complete immutable Lot Passport"
                        >
                          <ShieldCheck className="h-3.5 w-3.5 text-[#17633F]" />
                          <span>Passport</span>
                        </Link>
                        <Link
                          href={`/lots/${lot.id}`}
                          className="agri-btn-secondary text-xs py-1 px-2.5"
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
