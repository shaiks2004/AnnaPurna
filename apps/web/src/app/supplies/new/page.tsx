'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useMutation, useQuery } from '@tanstack/react-query';
import { Loader2, ArrowLeft } from 'lucide-react';
import Link from 'next/link';
import { AppShell } from '@/components/layout/AppShell';
import { PageHeader, StatusNotification } from '@/components/ui/States';
import {
  createSupply,
  listCommodities,
  type SupplyCreateRequest,
  type SupplyKind,
} from '@/lib/api';
import { useAuth } from '@/lib/auth';

export default function NewSupplyPage() {
  const router = useRouter();
  const { user } = useAuth();

  const [commodityId, setCommodityId] = useState('');
  const [supplierType, setSupplierType] = useState<'ORGANIZATION' | 'FARMER'>('ORGANIZATION');
  const [organizationId, setOrganizationId] = useState(user?.organizationIds?.[0] ?? '');
  const [farmerId, setFarmerId] = useState('');
  const [supplyKind, setSupplyKind] = useState<SupplyKind>('HARVESTED');
  const [quantity, setQuantity] = useState('');
  const [quantityUnit, setQuantityUnit] = useState('MT');
  const [expectedHarvestDate, setExpectedHarvestDate] = useState('');
  const [availableFrom, setAvailableFrom] = useState('');
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  const commoditiesQuery = useQuery({
    queryKey: ['commodities-dropdown'],
    queryFn: () => listCommodities(0, 100),
  });

  const mutation = useMutation({
    mutationFn: (payload: SupplyCreateRequest) => createSupply(payload),
    onSuccess: (supply) => {
      router.push(`/supplies/${supply.id}`);
    },
    onError: (err) => {
      setErrorMsg(err instanceof Error ? err.message : 'Failed to declare supply.');
    },
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg(null);

    const qty = Number(quantity);
    if (!qty || qty <= 0) {
      setErrorMsg('Quantity must be greater than zero.');
      return;
    }

    if (supplierType === 'ORGANIZATION' && !organizationId.trim()) {
      setErrorMsg('Organization ID is required when supplier is an organization.');
      return;
    }

    if (supplierType === 'FARMER' && !farmerId.trim()) {
      setErrorMsg('Farmer ID is required when supplier is an individual farmer.');
      return;
    }

    mutation.mutate({
      commodityId,
      organizationId: supplierType === 'ORGANIZATION' ? organizationId.trim() : null,
      farmerId: supplierType === 'FARMER' ? farmerId.trim() : null,
      supplyKind,
      quantity: qty,
      quantityUnit: quantityUnit.trim(),
      expectedHarvestDate: expectedHarvestDate ? expectedHarvestDate : null,
      availableFrom: availableFrom ? availableFrom : null,
    });
  };

  return (
    <AppShell>
      <PageHeader
        title="Declare Agricultural Supply"
        eyebrow="Supply Management"
        breadcrumbs={[
          { label: 'Dashboard', href: '/dashboard' },
          { label: 'Supplies', href: '/supplies' },
          { label: 'New Declaration' },
        ]}
        actions={
          <Link
            href="/supplies"
            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-md border border-stone-300 hover:bg-stone-50 text-stone-700 text-xs font-medium transition"
          >
            <ArrowLeft className="h-3.5 w-3.5" />
            <span>Back to Supplies</span>
          </Link>
        }
      />

      {errorMsg && <StatusNotification type="error" message={errorMsg} />}

      <div className="bg-white rounded-lg border border-stone-200 shadow-2xs p-6 sm:p-8 max-w-2xl">
        <form onSubmit={handleSubmit} className="space-y-5">
          <div>
            <label
              className="block text-xs font-semibold uppercase tracking-wider text-stone-600 mb-1"
              htmlFor="sup-comm-select"
            >
              Commodity *
            </label>
            <select
              id="sup-comm-select"
              required
              value={commodityId}
              onChange={(e) => setCommodityId(e.target.value)}
              className="w-full px-3 py-2 text-xs border border-stone-300 rounded-md focus:outline-none focus:ring-2 focus:ring-emerald-700/20 focus:border-emerald-700 text-stone-900 bg-white"
            >
              <option value="">Select agricultural commodity...</option>
              {commoditiesQuery.data?.data.map((c) => (
                <option key={c.id} value={c.id}>
                  {c.name} ({c.commodityCode ?? 'No Code'})
                </option>
              ))}
            </select>
          </div>

          {/* Supplier Ownership Radio Group */}
          <div>
            <label className="block text-xs font-semibold uppercase tracking-wider text-stone-600 mb-2">
              Supplier Ownership Model *
            </label>
            <div className="grid grid-cols-2 gap-3">
              <label
                className={`flex items-center gap-2 p-3 border rounded-md cursor-pointer text-xs transition ${
                  supplierType === 'ORGANIZATION'
                    ? 'border-emerald-700 bg-emerald-50/50 text-emerald-950 font-semibold'
                    : 'border-stone-200 hover:bg-stone-50 text-stone-700'
                }`}
              >
                <input
                  type="radio"
                  name="supplierType"
                  value="ORGANIZATION"
                  checked={supplierType === 'ORGANIZATION'}
                  onChange={() => setSupplierType('ORGANIZATION')}
                  className="h-4 w-4 text-emerald-800"
                />
                <span>FPO / Organization</span>
              </label>

              <label
                className={`flex items-center gap-2 p-3 border rounded-md cursor-pointer text-xs transition ${
                  supplierType === 'FARMER'
                    ? 'border-emerald-700 bg-emerald-50/50 text-emerald-950 font-semibold'
                    : 'border-stone-200 hover:bg-stone-50 text-stone-700'
                }`}
              >
                <input
                  type="radio"
                  name="supplierType"
                  value="FARMER"
                  checked={supplierType === 'FARMER'}
                  onChange={() => setSupplierType('FARMER')}
                  className="h-4 w-4 text-emerald-800"
                />
                <span>Individual Farmer</span>
              </label>
            </div>
          </div>

          {supplierType === 'ORGANIZATION' ? (
            <div>
              <label
                className="block text-xs font-semibold uppercase tracking-wider text-stone-600 mb-1"
                htmlFor="sup-org-id"
              >
                Organization ID *
              </label>
              <input
                id="sup-org-id"
                type="text"
                required
                value={organizationId}
                onChange={(e) => setOrganizationId(e.target.value)}
                placeholder="UUID of registered FPO / enterprise"
                className="w-full px-3 py-2 text-xs border border-stone-300 rounded-md focus:outline-none focus:ring-2 focus:ring-emerald-700/20 focus:border-emerald-700 text-stone-900 font-mono"
              />
            </div>
          ) : (
            <div>
              <label
                className="block text-xs font-semibold uppercase tracking-wider text-stone-600 mb-1"
                htmlFor="sup-farmer-id"
              >
                Farmer ID *
              </label>
              <input
                id="sup-farmer-id"
                type="text"
                required
                value={farmerId}
                onChange={(e) => setFarmerId(e.target.value)}
                placeholder="UUID of registered farmer"
                className="w-full px-3 py-2 text-xs border border-stone-300 rounded-md focus:outline-none focus:ring-2 focus:ring-emerald-700/20 focus:border-emerald-700 text-stone-900 font-mono"
              />
            </div>
          )}

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div>
              <label
                className="block text-xs font-semibold uppercase tracking-wider text-stone-600 mb-1"
                htmlFor="sup-kind-select"
              >
                Supply Kind *
              </label>
              <select
                id="sup-kind-select"
                required
                value={supplyKind}
                onChange={(e) => setSupplyKind(e.target.value as SupplyKind)}
                className="w-full px-3 py-2 text-xs border border-stone-300 rounded-md focus:outline-none focus:ring-2 focus:ring-emerald-700/20 focus:border-emerald-700 text-stone-900 bg-white"
              >
                <option value="HARVESTED">HARVESTED</option>
                <option value="PLANNED">PLANNED</option>
                <option value="STORED">STORED</option>
              </select>
            </div>

            <div>
              <label
                className="block text-xs font-semibold uppercase tracking-wider text-stone-600 mb-1"
                htmlFor="sup-qty"
              >
                Quantity *
              </label>
              <input
                id="sup-qty"
                type="number"
                step="0.001"
                min="0.001"
                required
                value={quantity}
                onChange={(e) => setQuantity(e.target.value)}
                placeholder="e.g. 50.000"
                className="w-full px-3 py-2 text-xs border border-stone-300 rounded-md focus:outline-none focus:ring-2 focus:ring-emerald-700/20 focus:border-emerald-700 text-stone-900"
              />
            </div>

            <div>
              <label
                className="block text-xs font-semibold uppercase tracking-wider text-stone-600 mb-1"
                htmlFor="sup-unit"
              >
                Quantity Unit *
              </label>
              <input
                id="sup-unit"
                type="text"
                required
                value={quantityUnit}
                onChange={(e) => setQuantityUnit(e.target.value)}
                placeholder="MT / QUINTAL / KG"
                className="w-full px-3 py-2 text-xs border border-stone-300 rounded-md focus:outline-none focus:ring-2 focus:ring-emerald-700/20 focus:border-emerald-700 text-stone-900 uppercase font-mono"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label
                className="block text-xs font-semibold uppercase tracking-wider text-stone-600 mb-1"
                htmlFor="sup-harvest-date"
              >
                Expected Harvest Date
              </label>
              <input
                id="sup-harvest-date"
                type="date"
                value={expectedHarvestDate}
                onChange={(e) => setExpectedHarvestDate(e.target.value)}
                className="w-full px-3 py-2 text-xs border border-stone-300 rounded-md focus:outline-none focus:ring-2 focus:ring-emerald-700/20 focus:border-emerald-700 text-stone-900"
              />
            </div>

            <div>
              <label
                className="block text-xs font-semibold uppercase tracking-wider text-stone-600 mb-1"
                htmlFor="sup-avail-from"
              >
                Available From
              </label>
              <input
                id="sup-avail-from"
                type="date"
                value={availableFrom}
                onChange={(e) => setAvailableFrom(e.target.value)}
                className="w-full px-3 py-2 text-xs border border-stone-300 rounded-md focus:outline-none focus:ring-2 focus:ring-emerald-700/20 focus:border-emerald-700 text-stone-900"
              />
            </div>
          </div>

          <div className="pt-4 border-t border-stone-200 flex items-center justify-end gap-2.5">
            <Link
              href="/supplies"
              className="px-4 py-2 border border-stone-300 hover:bg-stone-50 text-stone-700 text-xs font-medium rounded-md transition"
            >
              Cancel
            </Link>
            <button
              type="submit"
              disabled={mutation.isPending}
              className="inline-flex items-center gap-1.5 px-4 py-2 bg-[#0e4937] hover:bg-[#135f48] text-white text-xs font-medium rounded-md shadow-xs transition disabled:opacity-50"
            >
              {mutation.isPending && <Loader2 className="h-3.5 w-3.5 animate-spin" />}
              <span>Submit Declaration</span>
            </button>
          </div>
        </form>
      </div>
    </AppShell>
  );
}
