'use client';

import React from 'react';
import Link from 'next/link';
import { useQuery } from '@tanstack/react-query';
import {
  Boxes,
  ClipboardList,
  Database,
  ExternalLink,
  Leaf,
  Plus,
  Store,
  ArrowRight,
} from 'lucide-react';
import { AppShell } from '@/components/layout/AppShell';
import { PageHeader, LoadingState, ErrorState, EmptyState, Badge } from '@/components/ui/States';
import {
  listCommodities,
  listLots,
  listMarkets,
  listPrices,
  listRequirements,
  listSupplies,
  type Lot,
  type MarketPrice,
} from '@/lib/api';
import { useAuth } from '@/lib/auth';

export default function DashboardPage() {
  const { hasRole } = useAuth();

  const commoditiesQuery = useQuery({
    queryKey: ['commodities-summary'],
    queryFn: () => listCommodities(0, 1),
  });

  const marketsQuery = useQuery({
    queryKey: ['markets-summary'],
    queryFn: () => listMarkets({ page: 0, size: 1 }),
  });

  const pricesQuery = useQuery({
    queryKey: ['prices-summary'],
    queryFn: () => listPrices({ page: 0, size: 5 }),
  });

  const lotsQuery = useQuery({
    queryKey: ['lots-summary'],
    queryFn: () => listLots({ page: 0, size: 5 }),
  });

  const requirementsQuery = useQuery({
    queryKey: ['requirements-summary'],
    queryFn: () => listRequirements({ page: 0, size: 5 }),
    enabled: hasRole('BUYER_USER') || hasRole('ADMIN'),
  });

  const suppliesQuery = useQuery({
    queryKey: ['supplies-summary'],
    queryFn: () => listSupplies({ page: 0, size: 5 }),
    enabled: hasRole('FARMER') || hasRole('FPO_USER') || hasRole('ADMIN'),
  });

  return (
    <AppShell>
      <PageHeader
        title="Operations Overview"
        eyebrow="Annapurna Live Agricultural Network"
        actions={
          <div className="flex items-center gap-2">
            {(hasRole('BUYER_USER') || hasRole('ADMIN')) && (
              <Link
                href="/requirements/new"
                className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-md bg-[#0e4937] hover:bg-[#135f48] text-white text-xs font-medium shadow-xs transition"
              >
                <Plus className="h-4 w-4" />
                <span>New Requirement</span>
              </Link>
            )}
            {(hasRole('FARMER') || hasRole('FPO_USER') || hasRole('ADMIN')) && (
              <Link
                href="/lots/new"
                className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-md bg-stone-800 hover:bg-stone-900 text-white text-xs font-medium shadow-xs transition"
              >
                <Plus className="h-4 w-4" />
                <span>Create Lot</span>
              </Link>
            )}
          </div>
        }
      />

      {/* Real Summary Metric Cards */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3.5 mb-8">
        <div className="bg-white p-4 rounded-lg border border-stone-200 shadow-2xs">
          <div className="flex items-center justify-between text-stone-500 mb-2">
            <span className="text-xs font-medium">Commodities</span>
            <Leaf className="h-4 w-4 text-emerald-700" />
          </div>
          <div className="text-2xl font-bold text-stone-900">
            {commoditiesQuery.isLoading ? '...' : (commoditiesQuery.data?.page.totalElements ?? 0)}
          </div>
          <span className="text-[11px] text-stone-500 mt-1 block">Active agricultural catalog</span>
        </div>

        <div className="bg-white p-4 rounded-lg border border-stone-200 shadow-2xs">
          <div className="flex items-center justify-between text-stone-500 mb-2">
            <span className="text-xs font-medium">Mandis & Markets</span>
            <Store className="h-4 w-4 text-emerald-700" />
          </div>
          <div className="text-2xl font-bold text-stone-900">
            {marketsQuery.isLoading ? '...' : (marketsQuery.data?.page.totalElements ?? 0)}
          </div>
          <span className="text-[11px] text-stone-500 mt-1 block">Registered physical markets</span>
        </div>

        <div className="bg-white p-4 rounded-lg border border-stone-200 shadow-2xs">
          <div className="flex items-center justify-between text-stone-500 mb-2">
            <span className="text-xs font-medium">Physical Lots</span>
            <Database className="h-4 w-4 text-emerald-700" />
          </div>
          <div className="text-2xl font-bold text-stone-900">
            {lotsQuery.isLoading ? '...' : (lotsQuery.data?.page.totalElements ?? 0)}
          </div>
          <span className="text-[11px] text-stone-500 mt-1 block">Traceable inventory lots</span>
        </div>

        {(hasRole('BUYER_USER') || hasRole('ADMIN')) && (
          <div className="bg-white p-4 rounded-lg border border-stone-200 shadow-2xs">
            <div className="flex items-center justify-between text-stone-500 mb-2">
              <span className="text-xs font-medium">Requirements</span>
              <ClipboardList className="h-4 w-4 text-emerald-700" />
            </div>
            <div className="text-2xl font-bold text-stone-900">
              {requirementsQuery.isLoading
                ? '...'
                : (requirementsQuery.data?.page.totalElements ?? 0)}
            </div>
            <span className="text-[11px] text-stone-500 mt-1 block">Buyer procurement intents</span>
          </div>
        )}

        {(hasRole('FARMER') || hasRole('FPO_USER') || hasRole('ADMIN')) && (
          <div className="bg-white p-4 rounded-lg border border-stone-200 shadow-2xs">
            <div className="flex items-center justify-between text-stone-500 mb-2">
              <span className="text-xs font-medium">Supply Declarations</span>
              <Boxes className="h-4 w-4 text-emerald-700" />
            </div>
            <div className="text-2xl font-bold text-stone-900">
              {suppliesQuery.isLoading ? '...' : (suppliesQuery.data?.page.totalElements ?? 0)}
            </div>
            <span className="text-[11px] text-stone-500 mt-1 block">Farmer / FPO declarations</span>
          </div>
        )}
      </div>

      {/* Main Two-Column Live Panels */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Market Price Intelligence */}
        <div className="bg-white rounded-lg border border-stone-200 shadow-2xs overflow-hidden flex flex-col">
          <div className="px-5 py-4 border-b border-stone-200 flex items-center justify-between bg-stone-50/50">
            <div>
              <h2 className="text-sm font-semibold text-stone-900">
                Recent Market Price Observations
              </h2>
              <p className="text-xs text-stone-500">
                Live price points from monitored mandi locations
              </p>
            </div>
            <Link
              href="/market-prices"
              className="text-xs font-medium text-emerald-800 hover:text-emerald-950 inline-flex items-center gap-1"
            >
              <span>View all</span>
              <ArrowRight className="h-3 w-3" />
            </Link>
          </div>

          <div className="flex-1 p-0">
            {pricesQuery.isLoading ? (
              <LoadingState message="Loading market prices..." />
            ) : pricesQuery.error ? (
              <div className="p-4">
                <ErrorState error={pricesQuery.error} onRetry={() => pricesQuery.refetch()} />
              </div>
            ) : !pricesQuery.data?.data.length ? (
              <div className="p-4">
                <EmptyState description="No market price observations recorded yet." />
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs border-collapse">
                  <thead>
                    <tr className="border-b border-stone-200 bg-stone-50/30 text-stone-500">
                      <th className="py-2.5 px-4 font-semibold uppercase tracking-wider">Date</th>
                      <th className="py-2.5 px-4 font-semibold uppercase tracking-wider">
                        Modal Price
                      </th>
                      <th className="py-2.5 px-4 font-semibold uppercase tracking-wider">Range</th>
                      <th className="py-2.5 px-4 font-semibold uppercase tracking-wider">Source</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-stone-100">
                    {pricesQuery.data.data.map((price: MarketPrice) => (
                      <tr key={price.id} className="hover:bg-stone-50/60 transition">
                        <td className="py-3 px-4 font-medium text-stone-900">{price.observedOn}</td>
                        <td className="py-3 px-4 font-semibold text-emerald-900">
                          {price.modalPrice !== null
                            ? `${price.currencyCode ?? 'INR'} ${price.modalPrice} / ${price.priceUnit}`
                            : 'N/A'}
                        </td>
                        <td className="py-3 px-4 text-stone-600">
                          {price.minPrice !== null && price.maxPrice !== null
                            ? `${price.minPrice} - ${price.maxPrice}`
                            : '—'}
                        </td>
                        <td className="py-3 px-4 text-stone-500 text-[11px]">{price.sourceName}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </div>

        {/* Visible Lots / Requirements */}
        <div className="bg-white rounded-lg border border-stone-200 shadow-2xs overflow-hidden flex flex-col">
          <div className="px-5 py-4 border-b border-stone-200 flex items-center justify-between bg-stone-50/50">
            <div>
              <h2 className="text-sm font-semibold text-stone-900">Available Lots & Passports</h2>
              <p className="text-xs text-stone-500">
                Physical lots registered for quality & matching
              </p>
            </div>
            <Link
              href="/lots"
              className="text-xs font-medium text-emerald-800 hover:text-emerald-950 inline-flex items-center gap-1"
            >
              <span>View all</span>
              <ArrowRight className="h-3 w-3" />
            </Link>
          </div>

          <div className="flex-1 p-0">
            {lotsQuery.isLoading ? (
              <LoadingState message="Loading physical lots..." />
            ) : lotsQuery.error ? (
              <div className="p-4">
                <ErrorState error={lotsQuery.error} onRetry={() => lotsQuery.refetch()} />
              </div>
            ) : !lotsQuery.data?.data.length ? (
              <div className="p-4">
                <EmptyState description="No physical lots registered yet." />
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs border-collapse">
                  <thead>
                    <tr className="border-b border-stone-200 bg-stone-50/30 text-stone-500">
                      <th className="py-2.5 px-4 font-semibold uppercase tracking-wider">
                        Lot Number
                      </th>
                      <th className="py-2.5 px-4 font-semibold uppercase tracking-wider">
                        Quantity
                      </th>
                      <th className="py-2.5 px-4 font-semibold uppercase tracking-wider">Status</th>
                      <th className="py-2.5 px-4 font-semibold uppercase tracking-wider text-right">
                        Action
                      </th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-stone-100">
                    {lotsQuery.data.data.map((lot: Lot) => (
                      <tr key={lot.id} className="hover:bg-stone-50/60 transition">
                        <td className="py-3 px-4 font-medium text-stone-900 font-mono text-xs">
                          {lot.lotNumber}
                        </td>
                        <td className="py-3 px-4 text-stone-800">
                          {lot.quantity} {lot.quantityUnit}
                        </td>
                        <td className="py-3 px-4">
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
                        <td className="py-3 px-4 text-right">
                          <Link
                            href={`/lots/${lot.id}/passport`}
                            className="text-emerald-800 hover:text-emerald-950 font-medium inline-flex items-center gap-1 text-[11px]"
                          >
                            <span>Passport</span>
                            <ExternalLink className="h-3 w-3" />
                          </Link>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </div>
      </div>
    </AppShell>
  );
}
