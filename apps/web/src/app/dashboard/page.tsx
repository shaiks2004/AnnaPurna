'use client';

import React from 'react';
import Link from 'next/link';
import { useQuery } from '@tanstack/react-query';
import {
  Boxes,
  ClipboardList,
  Database,
  ExternalLink,
  Sprout,
  Plus,
  Store,
  ArrowRight,
  TrendingUp,
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
        title="Procurement Control Center"
        eyebrow="Annapurna Live Agricultural Network"
        actions={
          <div className="flex items-center gap-2">
            {(hasRole('BUYER_USER') || hasRole('ADMIN')) && (
              <Link
                href="/requirements/new"
                className="agri-btn-primary"
              >
                <Plus className="h-4 w-4" />
                <span>New Requirement</span>
              </Link>
            )}
            {(hasRole('FARMER') || hasRole('FPO_USER') || hasRole('ADMIN')) && (
              <Link
                href="/lots/new"
                className="agri-btn-secondary"
              >
                <Plus className="h-4 w-4" />
                <span>Create Lot</span>
              </Link>
            )}
          </div>
        }
      />

      {/* Real Summary Metric KPI Cards */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3.5 mb-8">
        <div className="agri-card p-4">
          <div className="flex items-center justify-between text-[#78877E] mb-2">
            <span className="text-[11px] font-heading font-semibold uppercase tracking-wider text-[#657169]">
              Commodities
            </span>
            <div className="p-1.5 rounded-lg bg-[#E8F4EC] text-[#17633F]">
              <Sprout className="h-3.5 w-3.5" />
            </div>
          </div>
          <div className="text-2xl sm:text-3xl font-heading font-bold text-[#26332D]">
            {commoditiesQuery.isLoading ? '...' : (commoditiesQuery.data?.page.totalElements ?? 0)}
          </div>
          <span className="text-[11px] text-[#78877E] mt-1 block">Active agricultural catalog</span>
        </div>

        <div className="agri-card p-4">
          <div className="flex items-center justify-between text-[#78877E] mb-2">
            <span className="text-[11px] font-heading font-semibold uppercase tracking-wider text-[#657169]">
              Mandis & Markets
            </span>
            <div className="p-1.5 rounded-lg bg-[#E8F4EC] text-[#17633F]">
              <Store className="h-3.5 w-3.5" />
            </div>
          </div>
          <div className="text-2xl sm:text-3xl font-heading font-bold text-[#26332D]">
            {marketsQuery.isLoading ? '...' : (marketsQuery.data?.page.totalElements ?? 0)}
          </div>
          <span className="text-[11px] text-[#78877E] mt-1 block">Registered physical markets</span>
        </div>

        <div className="agri-card p-4">
          <div className="flex items-center justify-between text-[#78877E] mb-2">
            <span className="text-[11px] font-heading font-semibold uppercase tracking-wider text-[#657169]">
              Active Lots
            </span>
            <div className="p-1.5 rounded-lg bg-[#E8F4EC] text-[#17633F]">
              <Database className="h-3.5 w-3.5" />
            </div>
          </div>
          <div className="text-2xl sm:text-3xl font-heading font-bold text-[#26332D]">
            {lotsQuery.isLoading ? '...' : (lotsQuery.data?.page.totalElements ?? 0)}
          </div>
          <span className="text-[11px] text-[#78877E] mt-1 block">Traceable physical inventory</span>
        </div>

        {(hasRole('BUYER_USER') || hasRole('ADMIN')) && (
          <div className="agri-card p-4">
            <div className="flex items-center justify-between text-[#78877E] mb-2">
              <span className="text-[11px] font-heading font-semibold uppercase tracking-wider text-[#657169]">
                Requirements
              </span>
              <div className="p-1.5 rounded-lg bg-[#E8F4EC] text-[#17633F]">
                <ClipboardList className="h-3.5 w-3.5" />
              </div>
            </div>
            <div className="text-2xl sm:text-3xl font-heading font-bold text-[#26332D]">
              {requirementsQuery.isLoading
                ? '...'
                : (requirementsQuery.data?.page.totalElements ?? 0)}
            </div>
            <span className="text-[11px] text-[#78877E] mt-1 block">Buyer procurement intents</span>
          </div>
        )}

        {(hasRole('FARMER') || hasRole('FPO_USER') || hasRole('ADMIN')) && (
          <div className="agri-card p-4">
            <div className="flex items-center justify-between text-[#78877E] mb-2">
              <span className="text-[11px] font-heading font-semibold uppercase tracking-wider text-[#657169]">
                Supply Declarations
              </span>
              <div className="p-1.5 rounded-lg bg-[#E8F4EC] text-[#17633F]">
                <Boxes className="h-3.5 w-3.5" />
              </div>
            </div>
            <div className="text-2xl sm:text-3xl font-heading font-bold text-[#26332D]">
              {suppliesQuery.isLoading ? '...' : (suppliesQuery.data?.page.totalElements ?? 0)}
            </div>
            <span className="text-[11px] text-[#78877E] mt-1 block">Farmer & FPO declared volume</span>
          </div>
        )}
      </div>

      {/* Main Two-Column Live Panels */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Market Price Intelligence */}
        <div className="agri-card overflow-hidden flex flex-col">
          <div className="px-5 py-4 border-b border-[#DDE2DB] flex items-center justify-between bg-[#F8F9F6]">
            <div>
              <h2 className="text-sm font-heading font-semibold text-[#26332D] flex items-center gap-2">
                <TrendingUp className="h-4 w-4 text-[#17633F]" />
                <span>Recent Market Price Observations</span>
              </h2>
              <p className="text-xs text-[#657169] mt-0.5">
                Live price points from monitored mandi locations
              </p>
            </div>
            <Link
              href="/market-prices"
              className="text-xs font-heading font-semibold text-[#17633F] hover:text-[#124D31] inline-flex items-center gap-1"
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
                <table className="agri-table">
                  <thead>
                    <tr>
                      <th>Date</th>
                      <th>Modal Price</th>
                      <th>Range (Min - Max)</th>
                      <th>Source</th>
                    </tr>
                  </thead>
                  <tbody>
                    {pricesQuery.data.data.map((price: MarketPrice) => (
                      <tr key={price.id}>
                        <td className="font-medium text-[#26332D]">{price.observedOn}</td>
                        <td className="font-heading font-semibold text-[#17633F]">
                          {price.modalPrice !== null
                            ? `${price.currencyCode ?? 'INR'} ${price.modalPrice} / ${price.priceUnit}`
                            : 'N/A'}
                        </td>
                        <td className="text-[#657169]">
                          {price.minPrice !== null && price.maxPrice !== null
                            ? `${price.minPrice} - ${price.maxPrice}`
                            : '—'}
                        </td>
                        <td className="text-[#78877E] text-[11px]">{price.sourceName}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </div>

        {/* Visible Lots / Requirements */}
        <div className="agri-card overflow-hidden flex flex-col">
          <div className="px-5 py-4 border-b border-[#DDE2DB] flex items-center justify-between bg-[#F8F9F6]">
            <div>
              <h2 className="text-sm font-heading font-semibold text-[#26332D] flex items-center gap-2">
                <Database className="h-4 w-4 text-[#17633F]" />
                <span>Physical Lots & Passports</span>
              </h2>
              <p className="text-xs text-[#657169] mt-0.5">
                Physical lots registered for quality & matching
              </p>
            </div>
            <Link
              href="/lots"
              className="text-xs font-heading font-semibold text-[#17633F] hover:text-[#124D31] inline-flex items-center gap-1"
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
                <table className="agri-table">
                  <thead>
                    <tr>
                      <th>Lot Number</th>
                      <th>Quantity</th>
                      <th>Status</th>
                      <th className="text-right">Action</th>
                    </tr>
                  </thead>
                  <tbody>
                    {lotsQuery.data.data.map((lot: Lot) => (
                      <tr key={lot.id}>
                        <td className="font-medium text-[#26332D] font-mono text-xs">
                          {lot.lotNumber}
                        </td>
                        <td className="text-[#26332D] font-heading font-medium">
                          {lot.quantity} {lot.quantityUnit}
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
                        <td className="text-right">
                          <Link
                            href={`/lots/${lot.id}/passport`}
                            className="text-[#17633F] hover:text-[#124D31] font-heading font-semibold inline-flex items-center gap-1 text-xs"
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
