'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { useQuery } from '@tanstack/react-query';
import { Plus, Eye, ClipboardList, Boxes, Filter, Calendar } from 'lucide-react';
import { AppShell } from '@/components/layout/AppShell';
import { PageHeader, LoadingState, ErrorState, EmptyState, Badge } from '@/components/ui/States';
import { Pagination } from '@/components/ui/Pagination';
import {
  listRequirements,
  listCommodities,
  type Requirement,
  type RequirementStatus,
} from '@/lib/api';
import { useAuth } from '@/lib/auth';

export default function RequirementsPage() {
  const { hasRole } = useAuth();
  const canCreate = hasRole('BUYER_USER') || hasRole('ADMIN');

  const [page, setPage] = useState(0);
  const [commodityId, setCommodityId] = useState('');
  const [status, setStatus] = useState<RequirementStatus | ''>('');
  const [appliedFilters, setAppliedFilters] = useState<{
    commodityId?: string;
    status?: RequirementStatus;
  }>({});

  const commoditiesQuery = useQuery({
    queryKey: ['commodities-dropdown'],
    queryFn: () => listCommodities(0, 100),
  });

  const query = useQuery({
    queryKey: ['requirements', page, appliedFilters],
    queryFn: () =>
      listRequirements({
        page,
        size: 20,
        commodityId: appliedFilters.commodityId,
        status: appliedFilters.status || undefined,
      }),
  });

  const handleFilterSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setPage(0);
    setAppliedFilters({
      commodityId: commodityId || undefined,
      status: status || undefined,
    });
  };

  const handleClear = () => {
    setCommodityId('');
    setStatus('');
    setAppliedFilters({});
    setPage(0);
  };

  return (
    <AppShell>
      <PageHeader
        title="Buyer Procurement Requirements"
        eyebrow="Procurement Intents & Matching"
        breadcrumbs={[{ label: 'Dashboard', href: '/dashboard' }, { label: 'Requirements' }]}
        actions={
          canCreate && (
            <Link
              href="/requirements/new"
              className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-md bg-[#0e4937] hover:bg-[#135f48] text-white text-xs font-medium shadow-xs transition"
            >
              <Plus className="h-4 w-4" />
              <span>New Requirement</span>
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
              htmlFor="req-comm"
            >
              Commodity
            </label>
            <select
              id="req-comm"
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
              htmlFor="req-status"
            >
              Lifecycle Status
            </label>
            <select
              id="req-status"
              value={status}
              onChange={(e) => setStatus(e.target.value as RequirementStatus | '')}
              className="w-full px-3 py-1.5 text-xs border border-stone-300 rounded-md focus:outline-none focus:ring-2 focus:ring-emerald-700/20 focus:border-emerald-700 text-stone-900 bg-white"
            >
              <option value="">All Statuses</option>
              <option value="DRAFT">DRAFT (Editable)</option>
              <option value="PUBLISHED">PUBLISHED</option>
              <option value="OPEN">OPEN (Ready for Matching)</option>
              <option value="CLOSED">CLOSED</option>
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
            {(appliedFilters.commodityId || appliedFilters.status) && (
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

      {/* Requirements Table */}
      <div className="bg-white rounded-lg border border-stone-200 shadow-2xs overflow-hidden">
        {query.isLoading ? (
          <LoadingState message="Fetching buyer requirements from backend..." />
        ) : query.error ? (
          <div className="p-6">
            <ErrorState error={query.error} onRetry={() => query.refetch()} />
          </div>
        ) : !query.data?.data.length ? (
          <div className="p-8">
            <EmptyState
              title="No requirements found"
              description="No procurement requirements exist in your current organizational access scope."
              action={
                canCreate ? (
                  <Link
                    href="/requirements/new"
                    className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-md bg-[#0e4937] hover:bg-[#135f48] text-white text-xs font-medium transition"
                  >
                    <Plus className="h-4 w-4" />
                    <span>Create Procurement Requirement</span>
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
                    <th className="py-3 px-4 font-semibold uppercase tracking-wider">
                      Requirement ID
                    </th>
                    <th className="py-3 px-4 font-semibold uppercase tracking-wider">Quantity</th>
                    <th className="py-3 px-4 font-semibold uppercase tracking-wider">
                      Target / Max Price
                    </th>
                    <th className="py-3 px-4 font-semibold uppercase tracking-wider">
                      Required By
                    </th>
                    <th className="py-3 px-4 font-semibold uppercase tracking-wider">Status</th>
                    <th className="py-3 px-4 font-semibold uppercase tracking-wider text-right">
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-stone-100">
                  {query.data.data.map((req: Requirement) => (
                    <tr key={req.id} className="hover:bg-stone-50/60 transition">
                      <td className="py-3.5 px-4 font-medium text-stone-900 font-mono flex items-center gap-2">
                        <ClipboardList className="h-4 w-4 text-emerald-700" />
                        <span>{req.id.substring(0, 8)}...</span>
                      </td>
                      <td className="py-3.5 px-4 font-semibold text-stone-800">
                        {req.quantity} {req.quantityUnit}
                      </td>
                      <td className="py-3.5 px-4 text-stone-700">
                        {req.targetPrice !== null
                          ? `${req.currencyCode ?? 'INR'} ${req.targetPrice}`
                          : '—'}
                        {req.maximumPrice !== null ? ` (Max: ${req.maximumPrice})` : ''}
                      </td>
                      <td className="py-3.5 px-4 text-stone-600">
                        <span className="flex items-center gap-1">
                          <Calendar className="h-3.5 w-3.5 text-stone-400" />
                          <span>{req.requiredBy}</span>
                        </span>
                      </td>
                      <td className="py-3.5 px-4">
                        <Badge
                          variant={
                            req.status === 'OPEN'
                              ? 'success'
                              : req.status === 'PUBLISHED'
                                ? 'info'
                                : req.status === 'DRAFT'
                                  ? 'warning'
                                  : 'default'
                          }
                        >
                          {req.status}
                        </Badge>
                      </td>
                      <td className="py-3.5 px-4 text-right space-x-2">
                        {(req.status === 'OPEN' || req.status === 'PUBLISHED') && (
                          <Link
                            href={`/requirements/${req.id}/matches`}
                            className="inline-flex items-center gap-1 text-emerald-800 hover:text-emerald-950 font-semibold bg-emerald-50 px-2 py-1 rounded border border-emerald-200 transition"
                            title="Execute deterministic matching engine"
                          >
                            <Boxes className="h-3.5 w-3.5" />
                            <span>Matches</span>
                          </Link>
                        )}
                        <Link
                          href={`/requirements/${req.id}`}
                          className="inline-flex items-center gap-1 text-stone-700 hover:text-stone-950 font-medium px-2 py-1 rounded border border-stone-200 hover:bg-stone-50 transition"
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
