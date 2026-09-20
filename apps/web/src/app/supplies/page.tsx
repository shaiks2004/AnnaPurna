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
              className="agri-btn-primary"
            >
              <Plus className="h-4 w-4" />
              <span>Declare Supply</span>
            </Link>
          )
        }
      />

      {/* Filter Bar */}
      <div className="agri-card p-4 sm:p-5 mb-6">
        <form
          onSubmit={handleFilterSubmit}
          className="grid grid-cols-1 sm:grid-cols-3 gap-3 items-end"
        >
          <div>
            <label
              className="block text-[11px] font-semibold uppercase tracking-wider text-[#657169] mb-1.5 font-heading"
              htmlFor="sup-comm"
            >
              Commodity
            </label>
            <select
              id="sup-comm"
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
              htmlFor="sup-kind"
            >
              Supply Kind
            </label>
            <select
              id="sup-kind"
              value={supplyKind}
              onChange={(e) => setSupplyKind(e.target.value as SupplyKind | '')}
              className="agri-input text-xs py-1.5"
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
              className="flex-1 agri-btn-primary justify-center text-xs py-2"
            >
              <Filter className="h-3.5 w-3.5" />
              <span>Apply Filters</span>
            </button>
            {(appliedFilters.commodityId || appliedFilters.supplyKind) && (
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

      {/* Supplies Table */}
      <div className="agri-card overflow-hidden">
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
                    className="agri-btn-primary"
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
              <table className="agri-table">
                <thead>
                  <tr>
                    <th>Supply ID</th>
                    <th>Supply Kind</th>
                    <th>Quantity</th>
                    <th>Available From</th>
                    <th>Expected Harvest</th>
                    <th className="text-right">Action</th>
                  </tr>
                </thead>
                <tbody>
                  {query.data.data.map((s: Supply) => (
                    <tr key={s.id}>
                      <td className="font-medium text-[#26332D] font-mono">
                        <span className="inline-flex items-center gap-1.5">
                          <Database className="h-3.5 w-3.5 text-[#17633F]" />
                          <span>{s.id.substring(0, 8)}...</span>
                        </span>
                      </td>
                      <td>
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
                      <td className="font-semibold text-[#123C2C]">
                        {s.quantity} {s.quantityUnit}
                      </td>
                      <td className="text-[#657169]">
                        {s.availableFrom ?? 'Immediate'}
                      </td>
                      <td className="text-[#657169]">{s.expectedHarvestDate ?? '—'}</td>
                      <td className="text-right">
                        <Link
                          href={`/supplies/${s.id}`}
                          className="inline-flex items-center gap-1 text-[#17633F] hover:text-[#123C2C] font-semibold transition"
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
