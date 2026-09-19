'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { useQuery } from '@tanstack/react-query';
import { Plus, Eye, Database, Filter } from 'lucide-react';
import { AppShell } from '@/components/layout/AppShell';
import { PageHeader, LoadingState, ErrorState, EmptyState, Badge } from '@/components/ui/States';
import { Pagination } from '@/components/ui/Pagination';
import { listSupplies, listCommodities, type Supply, type SupplyKind } from '@/lib/api';
import { useAuth } from '@/lib/auth';

export default function SuppliesPage() {
  const { hasRole } = useAuth();
  const canCreate = hasRole('FARMER') || hasRole('FPO_USER') || hasRole('ADMIN');

  const [page, setPage] = useState(0);
  const [commodityId, setCommodityId] = useState('');
  const [supplyKind, setSupplyKind] = useState<SupplyKind | ''>('');
  const [appliedFilters, setAppliedFilters] = useState<{
    commodityId?: string;
    supplyKind?: SupplyKind;
  }>({});

  const commoditiesQuery = useQuery({
    queryKey: ['commodities-dropdown'],
    queryFn: () => listCommodities(0, 100),
  });

  const query = useQuery({
    queryKey: ['supplies', page, appliedFilters],
    queryFn: () =>
      listSupplies({
        page,
        size: 20,
        commodityId: appliedFilters.commodityId,
        supplyKind: appliedFilters.supplyKind || undefined,
      }),
  });

  const handleFilterSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setPage(0);
    setAppliedFilters({
      commodityId: commodityId || undefined,
      supplyKind: supplyKind || undefined,
    });
  };

  const handleClear = () => {
    setCommodityId('');
    setSupplyKind('');
    setAppliedFilters({});
    setPage(0);
  };

  return (
    <AppShell>
      <PageHeader
        title="Supply Declarations"
        eyebrow="Farmer & FPO Supply Management"
        breadcrumbs={[{ label: 'Dashboard', href: '/dashboard' }, { label: 'Supplies' }]}
        actions={
          canCreate && (
            <Link
              href="/supplies/new"
              className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-md bg-[#0e4937] hover:bg-[#135f48] text-white text-xs font-medium shadow-xs transition"
            >
              <Plus className="h-4 w-4" />
              <span>Declare Supply</span>
            </Link>
          )
        }
      />

      {/* Filter Bar */}
      <div className="bg-white p-4 rounded-lg border border-stone-200 shadow-2xs mb-6">
        <form
          onSubmit={handleFilterSubmit}
          className="grid grid-cols-1 sm:grid-cols-3 gap-3 items-end"
        >
          <div>
            <label
              className="block text-[11px] font-semibold uppercase tracking-wider text-stone-500 mb-1"
              htmlFor="sup-comm"
            >
              Commodity
            </label>
            <select
              id="sup-comm"
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
              htmlFor="sup-kind"
            >
              Supply Kind
            </label>
            <select
              id="sup-kind"
              value={supplyKind}
              onChange={(e) => setSupplyKind(e.target.value as SupplyKind | '')}
              className="w-full px-3 py-1.5 text-xs border border-stone-300 rounded-md focus:outline-none focus:ring-2 focus:ring-emerald-700/20 focus:border-emerald-700 text-stone-900 bg-white"
            >
              <option value="">All Kinds</option>
              <option value="PLANNED">PLANNED (Future Crop)</option>
              <option value="HARVESTED">HARVESTED (Field Post-Harvest)</option>
              <option value="STORED">STORED (Warehouse / Cold Storage)</option>
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
            {(appliedFilters.commodityId || appliedFilters.supplyKind) && (
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

      {/* Supplies Table */}
      <div className="bg-white rounded-lg border border-stone-200 shadow-2xs overflow-hidden">
        {query.isLoading ? (
          <LoadingState message="Fetching supply declarations from backend..." />
        ) : query.error ? (
          <div className="p-6">
            <ErrorState error={query.error} onRetry={() => query.refetch()} />
          </div>
        ) : !query.data?.data.length ? (
          <div className="p-8">
            <EmptyState
              title="No supply declarations"
              description="No supplies are visible in your current organization access context."
              action={
                canCreate ? (
                  <Link
                    href="/supplies/new"
                    className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-md bg-[#0e4937] hover:bg-[#135f48] text-white text-xs font-medium transition"
                  >
                    <Plus className="h-4 w-4" />
                    <span>Create Supply Declaration</span>
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
                    <th className="py-3 px-4 font-semibold uppercase tracking-wider">Supply ID</th>
                    <th className="py-3 px-4 font-semibold uppercase tracking-wider">
                      Supply Kind
                    </th>
                    <th className="py-3 px-4 font-semibold uppercase tracking-wider">Quantity</th>
                    <th className="py-3 px-4 font-semibold uppercase tracking-wider">
                      Available From
                    </th>
                    <th className="py-3 px-4 font-semibold uppercase tracking-wider">
                      Expected Harvest
                    </th>
                    <th className="py-3 px-4 font-semibold uppercase tracking-wider text-right">
                      Action
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-stone-100">
                  {query.data.data.map((s: Supply) => (
                    <tr key={s.id} className="hover:bg-stone-50/60 transition">
                      <td className="py-3.5 px-4 font-medium text-stone-900 font-mono flex items-center gap-1.5">
                        <Database className="h-3.5 w-3.5 text-emerald-700" />
                        <span>{s.id.substring(0, 8)}...</span>
                      </td>
                      <td className="py-3.5 px-4">
                        <Badge
                          variant={
                            s.supplyKind === 'HARVESTED'
                              ? 'success'
                              : s.supplyKind === 'STORED'
                                ? 'info'
                                : 'warning'
                          }
                        >
                          {s.supplyKind}
                        </Badge>
                      </td>
                      <td className="py-3.5 px-4 font-semibold text-stone-900">
                        {s.quantity} {s.quantityUnit}
                      </td>
                      <td className="py-3.5 px-4 text-stone-700">
                        {s.availableFrom ?? 'Immediate'}
                      </td>
                      <td className="py-3.5 px-4 text-stone-600">{s.expectedHarvestDate ?? '—'}</td>
                      <td className="py-3.5 px-4 text-right">
                        <Link
                          href={`/supplies/${s.id}`}
                          className="inline-flex items-center gap-1 text-emerald-800 hover:text-emerald-950 font-medium"
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
    </AppShell>
  );
}
