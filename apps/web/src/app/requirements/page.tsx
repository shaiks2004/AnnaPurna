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
              className="agri-btn-primary"
            >
              <Plus className="h-4 w-4" />
              <span>New Requirement</span>
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
              htmlFor="req-comm"
            >
              Commodity
            </label>
            <select
              id="req-comm"
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
              htmlFor="req-status"
            >
              Lifecycle Status
            </label>
            <select
              id="req-status"
              value={status}
              onChange={(e) => setStatus(e.target.value as RequirementStatus | '')}
              className="agri-input text-xs py-1.5"
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
              className="flex-1 agri-btn-primary justify-center text-xs py-2"
            >
              <Filter className="h-3.5 w-3.5" />
              <span>Apply Filters</span>
            </button>
            {(appliedFilters.commodityId || appliedFilters.status) && (
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

      {/* Requirements Table */}
      <div className="agri-card overflow-hidden">
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
                    className="agri-btn-primary"
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
              <table className="agri-table">
                <thead>
                  <tr>
                    <th>Requirement ID</th>
                    <th>Quantity</th>
                    <th>Target / Max Price</th>
                    <th>Required By</th>
                    <th>Status</th>
                    <th className="text-right">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {query.data.data.map((req: Requirement) => (
                    <tr key={req.id}>
                      <td className="font-medium text-[#26332D] font-mono">
                        <span className="inline-flex items-center gap-2">
                          <ClipboardList className="h-4 w-4 text-[#17633F]" />
                          <span>{req.id.substring(0, 8)}...</span>
                        </span>
                      </td>
                      <td className="font-semibold text-[#123C2C]">
                        {req.quantity} {req.quantityUnit}
                      </td>
                      <td className="text-[#26332D]">
                        {req.targetPrice !== null
                          ? `${req.currencyCode ?? 'INR'} ${req.targetPrice}`
                          : '—'}
                        {req.maximumPrice !== null ? ` (Max: ${req.maximumPrice})` : ''}
                      </td>
                      <td className="text-[#657169]">
                        <span className="flex items-center gap-1.5">
                          <Calendar className="h-3.5 w-3.5 text-[#78877E]" />
                          <span>{req.requiredBy}</span>
                        </span>
                      </td>
                      <td>
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
                      <td className="text-right space-x-2">
                        {(req.status === 'OPEN' || req.status === 'PUBLISHED') && (
                          <Link
                            href={`/requirements/${req.id}/matches`}
                            className="inline-flex items-center gap-1 text-[#17633F] hover:text-[#123C2C] font-semibold bg-[#EAF2E8] px-2.5 py-1 rounded border border-[#B8D99F]/60 transition text-xs font-heading"
                            title="Execute deterministic matching engine"
                          >
                            <Boxes className="h-3.5 w-3.5 text-[#17633F]" />
                            <span>Matches</span>
                          </Link>
                        )}
                        <Link
                          href={`/requirements/${req.id}`}
                          className="agri-btn-secondary text-xs py-1 px-2.5"
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
