'use client';

import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Plus, Filter, Loader2, MapPinned } from 'lucide-react';
import { AppShell } from '@/components/layout/AppShell';
import {
  PageHeader,
  LoadingState,
  ErrorState,
  EmptyState,
  StatusNotification,
} from '@/components/ui/States';
import { Pagination } from '@/components/ui/Pagination';
import { Modal } from '@/components/ui/Modal';
import {
  listPrices,
  createPrice,
  listCommodities,
  listMarkets,
  type MarketPrice,
  type MarketPriceCreateRequest,
} from '@/lib/api';
import { useAuth } from '@/lib/auth';

export default function MarketPricesPage() {
  const queryClient = useQueryClient();
  const { hasRole } = useAuth();
  const isAdmin = hasRole('ADMIN');

  const [page, setPage] = useState(0);
  const [commodityIdFilter, setCommodityIdFilter] = useState('');
  const [marketIdFilter, setMarketIdFilter] = useState('');
  const [fromDateFilter, setFromDateFilter] = useState('');
  const [toDateFilter, setToDateFilter] = useState('');
  const [appliedFilters, setAppliedFilters] = useState<{
    commodityId?: string;
    marketId?: string;
    from?: string;
    to?: string;
  }>({});

  const [modalOpen, setModalOpen] = useState(false);
  const [notification, setNotification] = useState<{
    type: 'success' | 'error';
    message: string;
  } | null>(null);

  // New Price Form state
  const [newCommodityId, setNewCommodityId] = useState('');
  const [newMarketId, setNewMarketId] = useState('');
  const [newObservedOn, setNewObservedOn] = useState(new Date().toISOString().split('T')[0]);
  const [newModalPrice, setNewModalPrice] = useState('');
  const [newMinPrice, setNewMinPrice] = useState('');
  const [newMaxPrice, setNewMaxPrice] = useState('');
  const newCurrency = 'INR';
  const [newPriceUnit, setNewPriceUnit] = useState('QUINTAL');
  const [newSourceName, setNewSourceName] = useState('Agmarknet / APMC Official');
  const [newSourceRef, setNewSourceRef] = useState('');

  // Dropdown data
  const commoditiesQuery = useQuery({
    queryKey: ['commodities-dropdown'],
    queryFn: () => listCommodities(0, 100),
  });

  const marketsQuery = useQuery({
    queryKey: ['markets-dropdown'],
    queryFn: () => listMarkets({ page: 0, size: 100 }),
  });

  const query = useQuery({
    queryKey: ['market-prices', page, appliedFilters],
    queryFn: () =>
      listPrices({
        page,
        size: 20,
        commodityId: appliedFilters.commodityId,
        marketId: appliedFilters.marketId,
        from: appliedFilters.from,
        to: appliedFilters.to,
      }),
  });

  const createMutation = useMutation({
    mutationFn: (payload: MarketPriceCreateRequest) => createPrice(payload),
    onSuccess: () => {
      setModalOpen(false);
      setNewModalPrice('');
      setNewMinPrice('');
      setNewMaxPrice('');
      setNewSourceRef('');
      setNotification({
        type: 'success',
        message: 'Market price observation recorded successfully.',
      });
      void queryClient.invalidateQueries({ queryKey: ['market-prices'] });
      void queryClient.invalidateQueries({ queryKey: ['prices-summary'] });
    },
    onError: (err) => {
      setNotification({
        type: 'error',
        message: err instanceof Error ? err.message : 'Failed to record market price.',
      });
    },
  });

  const handleFilterSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setPage(0);
    setAppliedFilters({
      commodityId: commodityIdFilter.trim() || undefined,
      marketId: marketIdFilter.trim() || undefined,
      from: fromDateFilter.trim() || undefined,
      to: toDateFilter.trim() || undefined,
    });
  };

  const handleClearFilters = () => {
    setCommodityIdFilter('');
    setMarketIdFilter('');
    setFromDateFilter('');
    setToDateFilter('');
    setAppliedFilters({});
    setPage(0);
  };

  const handleCreateSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    createMutation.mutate({
      commodityId: newCommodityId,
      marketId: newMarketId,
      observedOn: newObservedOn,
      modalPrice: newModalPrice ? Number(newModalPrice) : null,
      minPrice: newMinPrice ? Number(newMinPrice) : null,
      maxPrice: newMaxPrice ? Number(newMaxPrice) : null,
      currencyCode: newCurrency.trim() || 'INR',
      priceUnit: newPriceUnit.trim() || 'QUINTAL',
      sourceName: newSourceName.trim(),
      sourceReference: newSourceRef.trim() || null,
    });
  };

  return (
    <AppShell>
      <PageHeader
        title="Market Price Intelligence"
        eyebrow="Market Intelligence"
        breadcrumbs={[{ label: 'Dashboard', href: '/dashboard' }, { label: 'Market Prices' }]}
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
              <span>Record Price Observation</span>
            </button>
          )
        }
      />

      {notification && (
        <StatusNotification type={notification.type} message={notification.message} />
      )}

      {/* Filter Bar */}
      <div className="bg-white p-4 rounded-lg border border-stone-200 shadow-2xs mb-6">
        <form
          onSubmit={handleFilterSubmit}
          className="grid grid-cols-1 sm:grid-cols-5 gap-3 items-end"
        >
          <div>
            <label
              className="block text-[11px] font-semibold uppercase tracking-wider text-stone-500 mb-1"
              htmlFor="f-comm"
            >
              Commodity
            </label>
            <select
              id="f-comm"
              value={commodityIdFilter}
              onChange={(e) => setCommodityIdFilter(e.target.value)}
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
              htmlFor="f-mkt"
            >
              Market / Mandi
            </label>
            <select
              id="f-mkt"
              value={marketIdFilter}
              onChange={(e) => setMarketIdFilter(e.target.value)}
              className="w-full px-3 py-1.5 text-xs border border-stone-300 rounded-md focus:outline-none focus:ring-2 focus:ring-emerald-700/20 focus:border-emerald-700 text-stone-900 bg-white"
            >
              <option value="">All Markets</option>
              {marketsQuery.data?.data.map((m) => (
                <option key={m.id} value={m.id}>
                  {m.name} ({m.marketCode})
                </option>
              ))}
            </select>
          </div>

          <div>
            <label
              className="block text-[11px] font-semibold uppercase tracking-wider text-stone-500 mb-1"
              htmlFor="f-from"
            >
              Observed From
            </label>
            <input
              id="f-from"
              type="date"
              value={fromDateFilter}
              onChange={(e) => setFromDateFilter(e.target.value)}
              className="w-full px-3 py-1.5 text-xs border border-stone-300 rounded-md focus:outline-none focus:ring-2 focus:ring-emerald-700/20 focus:border-emerald-700 text-stone-900"
            />
          </div>

          <div>
            <label
              className="block text-[11px] font-semibold uppercase tracking-wider text-stone-500 mb-1"
              htmlFor="f-to"
            >
              Observed To
            </label>
            <input
              id="f-to"
              type="date"
              value={toDateFilter}
              onChange={(e) => setToDateFilter(e.target.value)}
              className="w-full px-3 py-1.5 text-xs border border-stone-300 rounded-md focus:outline-none focus:ring-2 focus:ring-emerald-700/20 focus:border-emerald-700 text-stone-900"
            />
          </div>

          <div className="flex gap-2">
            <button
              type="submit"
              className="flex-1 inline-flex items-center justify-center gap-1.5 px-3 py-2 bg-stone-800 hover:bg-stone-900 text-white text-xs font-medium rounded-md transition"
            >
              <Filter className="h-3.5 w-3.5" />
              <span>Apply</span>
            </button>
            {(appliedFilters.commodityId ||
              appliedFilters.marketId ||
              appliedFilters.from ||
              appliedFilters.to) && (
              <button
                type="button"
                onClick={handleClearFilters}
                className="px-3 py-2 border border-stone-300 hover:bg-stone-50 text-stone-700 text-xs font-medium rounded-md transition"
              >
                Clear
              </button>
            )}
          </div>
        </form>
      </div>

      {/* Market Prices Table */}
      <div className="bg-white rounded-lg border border-stone-200 shadow-2xs overflow-hidden">
        {query.isLoading ? (
          <LoadingState message="Fetching market price observations from backend..." />
        ) : query.error ? (
          <div className="p-6">
            <ErrorState error={query.error} onRetry={() => query.refetch()} />
          </div>
        ) : !query.data?.data.length ? (
          <div className="p-8">
            <EmptyState
              title="No price observations found"
              description="No price records matched the selected filters."
            />
          </div>
        ) : (
          <div>
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs border-collapse">
                <thead>
                  <tr className="border-b border-stone-200 bg-stone-50/50 text-stone-600">
                    <th className="py-3 px-4 font-semibold uppercase tracking-wider">Date</th>
                    <th className="py-3 px-4 font-semibold uppercase tracking-wider">
                      Modal Price
                    </th>
                    <th className="py-3 px-4 font-semibold uppercase tracking-wider">
                      Min - Max Range
                    </th>
                    <th className="py-3 px-4 font-semibold uppercase tracking-wider">Unit</th>
                    <th className="py-3 px-4 font-semibold uppercase tracking-wider">
                      Source & Traceability
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-stone-100">
                  {query.data.data.map((p: MarketPrice) => (
                    <tr key={p.id} className="hover:bg-stone-50/60 transition">
                      <td className="py-3.5 px-4 font-medium text-stone-900 flex items-center gap-1.5">
                        <MapPinned className="h-4 w-4 text-emerald-700" />
                        <span>{p.observedOn}</span>
                      </td>
                      <td className="py-3.5 px-4 font-semibold text-emerald-900 text-sm">
                        {p.modalPrice !== null
                          ? `${p.currencyCode ?? 'INR'} ${p.modalPrice}`
                          : 'N/A'}
                      </td>
                      <td className="py-3.5 px-4 text-stone-700">
                        {p.minPrice !== null && p.maxPrice !== null
                          ? `${p.minPrice} — ${p.maxPrice}`
                          : (p.minPrice ?? p.maxPrice ?? '—')}
                      </td>
                      <td className="py-3.5 px-4 text-stone-600 uppercase font-mono text-[11px]">
                        {p.priceUnit}
                      </td>
                      <td className="py-3.5 px-4 text-stone-600">
                        <span className="font-medium text-stone-800">{p.sourceName}</span>
                        {p.sourceReference && (
                          <span className="block text-[11px] text-stone-400 font-mono">
                            Ref: {p.sourceReference}
                          </span>
                        )}
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

      {/* Add Price Observation Modal (Admin Only) */}
      <Modal
        isOpen={modalOpen}
        onClose={() => setModalOpen(false)}
        title="Record Price Observation"
        subtitle="Submit source-traceable market price observation to the network"
      >
        <form onSubmit={handleCreateSubmit} className="space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label
                className="block text-xs font-semibold uppercase tracking-wider text-stone-600 mb-1"
                htmlFor="p-comm"
              >
                Commodity *
              </label>
              <select
                id="p-comm"
                required
                value={newCommodityId}
                onChange={(e) => setNewCommodityId(e.target.value)}
                className="w-full px-3 py-2 text-xs border border-stone-300 rounded-md focus:outline-none focus:ring-2 focus:ring-emerald-700/20 focus:border-emerald-700 text-stone-900 bg-white"
              >
                <option value="">Select commodity...</option>
                {commoditiesQuery.data?.data.map((c) => (
                  <option key={c.id} value={c.id}>
                    {c.name}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label
                className="block text-xs font-semibold uppercase tracking-wider text-stone-600 mb-1"
                htmlFor="p-mkt"
              >
                Market / Mandi *
              </label>
              <select
                id="p-mkt"
                required
                value={newMarketId}
                onChange={(e) => setNewMarketId(e.target.value)}
                className="w-full px-3 py-2 text-xs border border-stone-300 rounded-md focus:outline-none focus:ring-2 focus:ring-emerald-700/20 focus:border-emerald-700 text-stone-900 bg-white"
              >
                <option value="">Select market...</option>
                {marketsQuery.data?.data.map((m) => (
                  <option key={m.id} value={m.id}>
                    {m.name} ({m.marketCode})
                  </option>
                ))}
              </select>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div>
              <label
                className="block text-xs font-semibold uppercase tracking-wider text-stone-600 mb-1"
                htmlFor="p-date"
              >
                Observation Date *
              </label>
              <input
                id="p-date"
                type="date"
                required
                value={newObservedOn}
                onChange={(e) => setNewObservedOn(e.target.value)}
                className="w-full px-3 py-2 text-xs border border-stone-300 rounded-md focus:outline-none focus:ring-2 focus:ring-emerald-700/20 focus:border-emerald-700 text-stone-900"
              />
            </div>

            <div>
              <label
                className="block text-xs font-semibold uppercase tracking-wider text-stone-600 mb-1"
                htmlFor="p-modal"
              >
                Modal Price (Typical)
              </label>
              <input
                id="p-modal"
                type="number"
                step="0.01"
                value={newModalPrice}
                onChange={(e) => setNewModalPrice(e.target.value)}
                placeholder="e.g. 2450.00"
                className="w-full px-3 py-2 text-xs border border-stone-300 rounded-md focus:outline-none focus:ring-2 focus:ring-emerald-700/20 focus:border-emerald-700 text-stone-900"
              />
            </div>

            <div>
              <label
                className="block text-xs font-semibold uppercase tracking-wider text-stone-600 mb-1"
                htmlFor="p-unit"
              >
                Price Unit *
              </label>
              <input
                id="p-unit"
                type="text"
                required
                value={newPriceUnit}
                onChange={(e) => setNewPriceUnit(e.target.value)}
                placeholder="QUINTAL / MT / KG"
                className="w-full px-3 py-2 text-xs border border-stone-300 rounded-md focus:outline-none focus:ring-2 focus:ring-emerald-700/20 focus:border-emerald-700 text-stone-900 uppercase font-mono"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label
                className="block text-xs font-semibold uppercase tracking-wider text-stone-600 mb-1"
                htmlFor="p-min"
              >
                Minimum Observed Price
              </label>
              <input
                id="p-min"
                type="number"
                step="0.01"
                value={newMinPrice}
                onChange={(e) => setNewMinPrice(e.target.value)}
                placeholder="e.g. 2300.00"
                className="w-full px-3 py-2 text-xs border border-stone-300 rounded-md focus:outline-none focus:ring-2 focus:ring-emerald-700/20 focus:border-emerald-700 text-stone-900"
              />
            </div>

            <div>
              <label
                className="block text-xs font-semibold uppercase tracking-wider text-stone-600 mb-1"
                htmlFor="p-max"
              >
                Maximum Observed Price
              </label>
              <input
                id="p-max"
                type="number"
                step="0.01"
                value={newMaxPrice}
                onChange={(e) => setNewMaxPrice(e.target.value)}
                placeholder="e.g. 2600.00"
                className="w-full px-3 py-2 text-xs border border-stone-300 rounded-md focus:outline-none focus:ring-2 focus:ring-emerald-700/20 focus:border-emerald-700 text-stone-900"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label
                className="block text-xs font-semibold uppercase tracking-wider text-stone-600 mb-1"
                htmlFor="p-source"
              >
                Data Source Name *
              </label>
              <input
                id="p-source"
                type="text"
                required
                value={newSourceName}
                onChange={(e) => setNewSourceName(e.target.value)}
                placeholder="e.g. Agmarknet Daily Bulletin"
                className="w-full px-3 py-2 text-xs border border-stone-300 rounded-md focus:outline-none focus:ring-2 focus:ring-emerald-700/20 focus:border-emerald-700 text-stone-900"
              />
            </div>

            <div>
              <label
                className="block text-xs font-semibold uppercase tracking-wider text-stone-600 mb-1"
                htmlFor="p-ref"
              >
                Source Reference / Report ID
              </label>
              <input
                id="p-ref"
                type="text"
                value={newSourceRef}
                onChange={(e) => setNewSourceRef(e.target.value)}
                placeholder="e.g. RPT-2026-09-18"
                className="w-full px-3 py-2 text-xs border border-stone-300 rounded-md focus:outline-none focus:ring-2 focus:ring-emerald-700/20 focus:border-emerald-700 text-stone-900 font-mono"
              />
            </div>
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
              <span>Record Price</span>
            </button>
          </div>
        </form>
      </Modal>
    </AppShell>
  );
}
