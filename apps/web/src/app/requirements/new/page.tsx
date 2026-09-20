'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useMutation, useQuery } from '@tanstack/react-query';
import { Loader2, ArrowLeft } from 'lucide-react';
import Link from 'next/link';
import { AppShell } from '@/components/layout/AppShell';
import { PageHeader, StatusNotification } from '@/components/ui/States';
import { createRequirement, listCommodities, type RequirementCreateRequest } from '@/lib/api';
import { useAuth } from '@/lib/auth';

export default function NewRequirementPage() {
  const router = useRouter();
  const { user } = useAuth();

  const [buyerProfileId, setBuyerProfileId] = useState(
    user?.buyerProfileId ?? user?.organizationIds?.[0] ?? '',
  );

  React.useEffect(() => {
    if (user?.buyerProfileId) {
      setBuyerProfileId(user.buyerProfileId);
    } else if (user?.organizationIds?.[0]) {
      setBuyerProfileId(user.organizationIds[0]);
    }
  }, [user]);

  const [commodityId, setCommodityId] = useState('');
  const [quantity, setQuantity] = useState('');
  const [quantityUnit, setQuantityUnit] = useState('MT');
  const [qualitySpecification, setQualitySpecification] = useState(
    'Grade A; moisture at most 12%; foreign matter max 1%',
  );
  const [deliveryLocation, setDeliveryLocation] = useState('Warehouse Bay 3, APMC Yard, Nashik');
  const [requiredBy, setRequiredBy] = useState(() => {
    const future = new Date();
    future.setDate(future.getDate() + 14);
    return future.toISOString().split('T')[0];
  });
  const [targetPrice, setTargetPrice] = useState('');
  const [maximumPrice, setMaximumPrice] = useState('');
  const currencyCode = 'INR';
  const [notes, setNotes] = useState('');
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  const commoditiesQuery = useQuery({
    queryKey: ['commodities-dropdown'],
    queryFn: () => listCommodities(0, 100),
  });

  const mutation = useMutation({
    mutationFn: (payload: RequirementCreateRequest) => createRequirement(payload),
    onSuccess: (req) => {
      router.push(`/requirements/${req.id}`);
    },
    onError: (err) => {
      setErrorMsg(err instanceof Error ? err.message : 'Failed to create procurement requirement.');
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

    const target = targetPrice ? Number(targetPrice) : null;
    const max = maximumPrice ? Number(maximumPrice) : null;

    if (target !== null && max !== null && max < target) {
      setErrorMsg('Maximum price must be greater than or equal to target price.');
      return;
    }

    mutation.mutate({
      buyerProfileId: buyerProfileId.trim(),
      commodityId,
      quantity: qty,
      quantityUnit: quantityUnit.trim(),
      qualitySpecification: qualitySpecification.trim(),
      deliveryLocation: deliveryLocation.trim(),
      requiredBy,
      targetPrice: target,
      maximumPrice: max,
      currencyCode: currencyCode.trim() || 'INR',
      notes: notes.trim() || null,
    });
  };

  return (
    <AppShell>
      <PageHeader
        title="Create Procurement Requirement"
        eyebrow="Buyer Intents & Matching"
        breadcrumbs={[
          { label: 'Dashboard', href: '/dashboard' },
          { label: 'Requirements', href: '/requirements' },
          { label: 'New Requirement' },
        ]}
        actions={
          <Link
            href="/requirements"
            className="agri-btn-secondary"
          >
            <ArrowLeft className="h-3.5 w-3.5" />
            <span>Back to Requirements</span>
          </Link>
        }
      />

      {errorMsg && <StatusNotification type="error" message={errorMsg} />}

      <div className="agri-card p-6 sm:p-8 max-w-2xl">
        <form onSubmit={handleSubmit} className="space-y-5">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label
                className="block text-[11px] font-semibold uppercase tracking-wider text-[#657169] mb-1.5 font-heading"
                htmlFor="req-buyer-id"
              >
                Buyer Profile ID *
              </label>
              <input
                id="req-buyer-id"
                type="text"
                required
                value={buyerProfileId}
                onChange={(e) => setBuyerProfileId(e.target.value)}
                placeholder="UUID of registered buyer profile"
                className="agri-input text-xs font-mono"
              />
            </div>

            <div>
              <label
                className="block text-[11px] font-semibold uppercase tracking-wider text-[#657169] mb-1.5 font-heading"
                htmlFor="req-comm-select"
              >
                Commodity *
              </label>
              <select
                id="req-comm-select"
                required
                value={commodityId}
                onChange={(e) => setCommodityId(e.target.value)}
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
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label
                className="block text-[11px] font-semibold uppercase tracking-wider text-[#657169] mb-1.5 font-heading"
                htmlFor="req-qty"
              >
                Required Quantity *
              </label>
              <input
                id="req-qty"
                type="number"
                step="0.001"
                min="0.001"
                required
                value={quantity}
                onChange={(e) => setQuantity(e.target.value)}
                placeholder="e.g. 50.000"
                className="agri-input text-xs"
              />
            </div>

            <div>
              <label
                className="block text-[11px] font-semibold uppercase tracking-wider text-[#657169] mb-1.5 font-heading"
                htmlFor="req-unit"
              >
                Quantity Unit *
              </label>
              <input
                id="req-unit"
                type="text"
                required
                value={quantityUnit}
                onChange={(e) => setQuantityUnit(e.target.value)}
                placeholder="MT / QUINTAL / KG"
                className="agri-input text-xs uppercase font-mono"
              />
            </div>
          </div>

          <div>
            <label
              className="block text-[11px] font-semibold uppercase tracking-wider text-[#657169] mb-1.5 font-heading"
              htmlFor="req-qual"
            >
              Quality Specification *
            </label>
            <textarea
              id="req-qual"
              required
              rows={2}
              value={qualitySpecification}
              onChange={(e) => setQualitySpecification(e.target.value)}
              placeholder="e.g. Grade A; moisture content <= 12%; foreign matter <= 1%"
              className="agri-input text-xs"
            />
          </div>

          <div>
            <label
              className="block text-[11px] font-semibold uppercase tracking-wider text-[#657169] mb-1.5 font-heading"
              htmlFor="req-loc"
            >
              Delivery Location *
            </label>
            <input
              id="req-loc"
              type="text"
              required
              value={deliveryLocation}
              onChange={(e) => setDeliveryLocation(e.target.value)}
              placeholder="e.g. Central Warehouse, Sector 4, Pune APMC"
              className="agri-input text-xs"
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div>
              <label
                className="block text-[11px] font-semibold uppercase tracking-wider text-[#657169] mb-1.5 font-heading"
                htmlFor="req-by"
              >
                Required By Date *
              </label>
              <input
                id="req-by"
                type="date"
                required
                value={requiredBy}
                onChange={(e) => setRequiredBy(e.target.value)}
                className="agri-input text-xs"
              />
            </div>

            <div>
              <label
                className="block text-[11px] font-semibold uppercase tracking-wider text-[#657169] mb-1.5 font-heading"
                htmlFor="req-target-p"
              >
                Target Price
              </label>
              <input
                id="req-target-p"
                type="number"
                step="0.0001"
                value={targetPrice}
                onChange={(e) => setTargetPrice(e.target.value)}
                placeholder="e.g. 2350.00"
                className="agri-input text-xs"
              />
            </div>

            <div>
              <label
                className="block text-[11px] font-semibold uppercase tracking-wider text-[#657169] mb-1.5 font-heading"
                htmlFor="req-max-p"
              >
                Maximum Price Ceiling
              </label>
              <input
                id="req-max-p"
                type="number"
                step="0.0001"
                value={maximumPrice}
                onChange={(e) => setMaximumPrice(e.target.value)}
                placeholder="e.g. 2500.00"
                className="agri-input text-xs"
              />
            </div>
          </div>

          <div>
            <label
              className="block text-[11px] font-semibold uppercase tracking-wider text-[#657169] mb-1.5 font-heading"
              htmlFor="req-notes"
            >
              Procurement Notes & Terms
            </label>
            <textarea
              id="req-notes"
              rows={2}
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="Packaging requirements, gate delivery slots..."
              className="agri-input text-xs"
            />
          </div>

          <div className="pt-4 border-t border-[#DDE2DB] flex items-center justify-end gap-2.5">
            <Link
              href="/requirements"
              className="agri-btn-secondary"
            >
              Cancel
            </Link>
            <button
              type="submit"
              disabled={mutation.isPending}
              className="agri-btn-primary"
            >
              {mutation.isPending && <Loader2 className="h-3.5 w-3.5 animate-spin" />}
              <span>Create Draft Requirement</span>
            </button>
          </div>
        </form>
      </div>
    </AppShell>
  );
}
