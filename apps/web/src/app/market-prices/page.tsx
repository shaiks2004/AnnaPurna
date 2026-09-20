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
              className="agri-btn-primary"
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
      <div className="agri-card p-4 sm:p-5 mb-6">
        <form
          onSubmit={handleFilterSubmit}
          className="grid grid-cols-1 sm:grid-cols-5 gap-3 items-end"
        >
          <div>
            <label
              className="block text-[11px] font-semibold uppercase tracking-wider text-[#657169] mb-1.5 font-heading"
              htmlFor="f-comm"
            >
              Commodity
            </label>
            <select
              id="f-comm"
              value={commodityIdFilter}
              onChange={(e) => setCommodityIdFilter(e.target.value)}
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
              htmlFor="f-mkt"
            >
              Market / Mandi
            </label>
            <select
              id="f-mkt"
              value={marketIdFilter}
              onChange={(e) => setMarketIdFilter(e.target.value)}
              className="agri-input text-xs py-1.5"
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
              className="block text-[11px] font-semibold uppercase tracking-wider text-[#657169] mb-1.5 font-heading"
              htmlFor="f-from"
            >
              Observed From
            </label>
            <input
              id="f-from"
              type="date"
              value={fromDateFilter}
              onChange={(e) => setFromDateFilter(e.target.value)}
              className="agri-input text-xs py-1.5"
            />
          </div>

          <div>
            <label
              className="block text-[11px] font-semibold uppercase tracking-wider text-[#657169] mb-1.5 font-heading"
              htmlFor="f-to"
            >
              Observed To
            </label>
            <input
              id="f-to"
              type="date"
              value={toDateFilter}
              onChange={(e) => setToDateFilter(e.target.value)}
              className="agri-input text-xs py-1.5"
            />
          </div>

          <div className="flex gap-2">
            <button
              type="submit"
              className="flex-1 agri-btn-primary justify-center text-xs py-2"
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
                className="agri-btn-secondary text-xs py-2"
              >
                Clear
              </button>
            )}
          </div>
        </form>
      </div>

      {/* Market Prices Table */}
      <div className="agri-card overflow-hidden">
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
              <table className="agri-table">
                <thead>
                  <tr>
                    <th>Observation Date</th>
                    <th>Modal Price</th>
                    <th>Min - Max Range</th>
                    <th>Unit</th>
                    <th>Source & Traceability</th>
                  </tr>
                </thead>
                <tbody>
                  {query.data.data.map((p: MarketPrice) => (
                    <tr key={p.id}>
                      <td className="font-medium text-[#26332D]">
                        <span className="inline-flex items-center gap-1.5">
                          <MapPinned className="h-3.5 w-3.5 text-[#17633F]" />
                          <span>{p.observedOn}</span>
                        </span>
                      </td>
                      <td className="font-semibold text-[#123C2C] text-sm">
                        {p.modalPrice !== null
                          ? `${p.currencyCode ?? 'INR'} ${p.modalPrice.toLocaleString()}`
                          : 'N/A'}
                      </td>
                      <td className="text-[#657169]">
                        {p.minPrice !== null && p.maxPrice !== null
                          ? `${p.minPrice} — ${p.maxPrice}`
                          : (p.minPrice ?? p.maxPrice ?? '—')}
                      </td>
                      <td className="text-[#657169] uppercase font-mono text-[11px]">
                        {p.priceUnit}
                      </td>
                      <td className="text-[#26332D]">
                        <span className="font-medium text-[#123C2C]">{p.sourceName}</span>
                        {p.sourceReference && (
                          <span className="block text-[11px] text-[#78877E] font-mono">
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
                className="block text-[11px] font-semibold uppercase tracking-wider text-[#657169] mb-1.5 font-heading"
                htmlFor="p-comm"
              >
                Commodity *
              </label>
              <select
                id="p-comm"
                required
                value={newCommodityId}
                onChange={(e) => setNewCommodityId(e.target.value)}
                className="agri-input text-xs"
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
                className="block text-[11px] font-semibold uppercase tracking-wider text-[#657169] mb-1.5 font-heading"
                htmlFor="p-mkt"
              >
                Market / Mandi *
              </label>
              <select
                id="p-mkt"
                required
                value={newMarketId}
                onChange={(e) => setNewMarketId(e.target.value)}
                className="agri-input text-xs"
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
                className="block text-[11px] font-semibold uppercase tracking-wider text-[#657169] mb-1.5 font-heading"
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
                className="agri-input text-xs"
              />
            </div>

            <div>
              <label
                className="block text-[11px] font-semibold uppercase tracking-wider text-[#657169] mb-1.5 font-heading"
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
                className="agri-input text-xs"
              />
            </div>

            <div>
              <label
                className="block text-[11px] font-semibold uppercase tracking-wider text-[#657169] mb-1.5 font-heading"
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
                className="agri-input text-xs uppercase font-mono"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label
                className="block text-[11px] font-semibold uppercase tracking-wider text-[#657169] mb-1.5 font-heading"
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
                className="agri-input text-xs"
              />
            </div>

            <div>
              <label
                className="block text-[11px] font-semibold uppercase tracking-wider text-[#657169] mb-1.5 font-heading"
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
                className="agri-input text-xs"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label
                className="block text-[11px] font-semibold uppercase tracking-wider text-[#657169] mb-1.5 font-heading"
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
                className="agri-input text-xs"
              />
            </div>

            <div>
              <label
                className="block text-[11px] font-semibold uppercase tracking-wider text-[#657169] mb-1.5 font-heading"
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
                className="agri-input text-xs font-mono"
              />
            </div>
          </div>

          <div className="pt-4 border-t border-[#DDE2DB] flex items-center justify-end gap-2.5">
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
              <span>Record Price</span>
            </button>
          </div>
        </form>
      </Modal>
    </AppShell>
  );
}
