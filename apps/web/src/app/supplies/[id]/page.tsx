'use client';

import React, { useState } from 'react';
import { useParams } from 'next/navigation';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Database, Edit2, Loader2, Save, X, Calendar } from 'lucide-react';
import { AppShell } from '@/components/layout/AppShell';
import {
  PageHeader,
  LoadingState,
  ErrorState,
  Badge,
  StatusNotification,
} from '@/components/ui/States';
import { getSupply, updateSupply, type SupplyPatchRequest } from '@/lib/api';

export default function SupplyDetailPage() {
  const params = useParams<{ id: string }>();
  const id = params?.id;
  const queryClient = useQueryClient();

  const [isEditing, setIsEditing] = useState(false);
  const [notification, setNotification] = useState<{
    type: 'success' | 'error';
    message: string;
  } | null>(null);

  const [editQty, setEditQty] = useState('');
  const [editUnit, setEditUnit] = useState('');
  const [editHarvest, setEditHarvest] = useState('');
  const [editAvail, setEditAvail] = useState('');

  const query = useQuery({
    queryKey: ['supply', id],
    queryFn: () => getSupply(id!),
    enabled: !!id,
  });

  const updateMutation = useMutation({
    mutationFn: (payload: SupplyPatchRequest) => updateSupply(id!, payload),
    onSuccess: () => {
      setIsEditing(false);
      setNotification({ type: 'success', message: 'Supply declaration updated successfully.' });
      void queryClient.invalidateQueries({ queryKey: ['supply', id] });
      void queryClient.invalidateQueries({ queryKey: ['supplies'] });
    },
    onError: (err) => {
      setNotification({
        type: 'error',
        message: err instanceof Error ? err.message : 'Failed to update supply declaration.',
      });
    },
  });

  const startEditing = () => {
    if (query.data) {
      setEditQty(String(query.data.quantity));
      setEditUnit(query.data.quantityUnit);
      setEditHarvest(query.data.expectedHarvestDate ?? '');
      setEditAvail(query.data.availableFrom ?? '');
      setIsEditing(true);
      setNotification(null);
    }
  };

  const handleUpdateSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    updateMutation.mutate({
      quantity: editQty ? Number(editQty) : undefined,
      quantityUnit: editUnit.trim() || undefined,
      expectedHarvestDate: editHarvest || null,
      availableFrom: editAvail || null,
    });
  };

  return (
    <AppShell>
      <PageHeader
        title="Supply Declaration"
        eyebrow="Supply Management"
        breadcrumbs={[
          { label: 'Dashboard', href: '/dashboard' },
          { label: 'Supplies', href: '/supplies' },
          { label: id?.substring(0, 8) ?? 'Details' },
        ]}
        actions={
          !isEditing &&
          query.data && (
            <button
              onClick={startEditing}
              className="agri-btn-secondary"
            >
              <Edit2 className="h-3.5 w-3.5" />
              <span>Edit Supply</span>
            </button>
          )
        }
      />

      {notification && (
        <StatusNotification type={notification.type} message={notification.message} />
      )}

      {query.isLoading ? (
        <LoadingState message="Loading supply declaration..." />
      ) : query.error ? (
        <ErrorState error={query.error} onRetry={() => query.refetch()} />
      ) : !query.data ? (
        <ErrorState error={new Error('Supply declaration not found')} />
      ) : isEditing ? (
        /* Edit Form */
        <div className="agri-card p-6 sm:p-7 max-w-2xl">
          <div className="flex items-center justify-between pb-4 mb-5 border-b border-[#DDE2DB]">
            <div>
              <h2 className="text-sm font-semibold text-[#123C2C] font-heading">Edit Supply Declaration</h2>
              <p className="text-[11px] text-[#657169]">Update quantity and expected timeline for this declared crop volume</p>
            </div>
            <button
              onClick={() => setIsEditing(false)}
              className="text-[#78877E] hover:text-[#26332D] p-1.5 rounded-md hover:bg-[#F4F1E8] transition"
              aria-label="Cancel editing"
            >
              <X className="h-4 w-4" />
            </button>
          </div>

          <form onSubmit={handleUpdateSubmit} className="space-y-4">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label
                  className="block text-[11px] font-semibold uppercase tracking-wider text-[#657169] mb-1.5 font-heading"
                  htmlFor="edit-sup-qty"
                >
                  Quantity *
                </label>
                <input
                  id="edit-sup-qty"
                  type="number"
                  step="0.001"
                  min="0.001"
                  required
                  value={editQty}
                  onChange={(e) => setEditQty(e.target.value)}
                  className="agri-input text-xs"
                />
              </div>

              <div>
                <label
                  className="block text-[11px] font-semibold uppercase tracking-wider text-[#657169] mb-1.5 font-heading"
                  htmlFor="edit-sup-unit"
                >
                  Quantity Unit *
                </label>
                <input
                  id="edit-sup-unit"
                  type="text"
                  required
                  value={editUnit}
                  onChange={(e) => setEditUnit(e.target.value)}
                  className="agri-input text-xs uppercase font-mono"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label
                  className="block text-[11px] font-semibold uppercase tracking-wider text-[#657169] mb-1.5 font-heading"
                  htmlFor="edit-sup-harvest"
                >
                  Expected Harvest Date
                </label>
                <input
                  id="edit-sup-harvest"
                  type="date"
                  value={editHarvest}
                  onChange={(e) => setEditHarvest(e.target.value)}
                  className="agri-input text-xs"
                />
              </div>

              <div>
                <label
                  className="block text-[11px] font-semibold uppercase tracking-wider text-[#657169] mb-1.5 font-heading"
                  htmlFor="edit-sup-avail"
                >
                  Available From
                </label>
                <input
                  id="edit-sup-avail"
                  type="date"
                  value={editAvail}
                  onChange={(e) => setEditAvail(e.target.value)}
                  className="agri-input text-xs"
                />
              </div>
            </div>

            <div className="pt-4 border-t border-[#DDE2DB] flex items-center justify-end gap-2.5">
              <button
                type="button"
                onClick={() => setIsEditing(false)}
                className="agri-btn-secondary"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={updateMutation.isPending}
                className="agri-btn-primary"
              >
                {updateMutation.isPending ? (
                  <Loader2 className="h-3.5 w-3.5 animate-spin" />
                ) : (
                  <Save className="h-3.5 w-3.5" />
                )}
                <span>Save Changes</span>
              </button>
            </div>
          </form>
        </div>
      ) : (
        /* Read Details View */
        <div className="agri-card overflow-hidden max-w-3xl">
          <div className="p-6 border-b border-[#DDE2DB] bg-[#F8F9F6] flex items-start gap-4">
            <div className="p-3 bg-[#EAF2E8] border border-[#B8D99F]/50 rounded-lg text-[#17633F]">
              <Database className="h-6 w-6" />
            </div>
            <div>
              <div className="flex items-center gap-2.5 mb-1">
                <h2 className="text-xl font-semibold text-[#123C2C] font-heading">
                  {query.data.quantity} {query.data.quantityUnit}
                </h2>
                <Badge
                  variant={
                    query.data.supplyKind === 'HARVESTED'
                      ? 'success'
                      : query.data.supplyKind === 'STORED'
                        ? 'info'
                        : 'warning'
                  }
                >
                  {query.data.supplyKind}
                </Badge>
              </div>
              <p className="text-xs text-[#657169] font-mono">Supply ID: <span className="text-[#26332D] font-semibold">{query.data.id}</span></p>
            </div>
          </div>

          <div className="p-6 grid grid-cols-1 sm:grid-cols-2 gap-6 text-xs">
            <div>
              <span className="text-[#78877E] font-semibold uppercase tracking-wider block mb-1 font-heading text-[11px]">
                Commodity ID
              </span>
              <span
                className="text-xs font-mono font-medium text-[#26332D] block truncate"
                title={query.data.commodityId}
              >
                {query.data.commodityId}
              </span>
            </div>

            <div>
              <span className="text-[#78877E] font-semibold uppercase tracking-wider block mb-1 font-heading text-[11px]">
                Supplier Ownership
              </span>
              <span className="text-xs font-mono font-medium text-[#26332D] block truncate">
                {query.data.organizationId
                  ? `Organization: ${query.data.organizationId}`
                  : `Farmer: ${query.data.farmerId}`}
              </span>
            </div>

            <div>
              <span className="text-[#78877E] font-semibold uppercase tracking-wider block mb-1 font-heading text-[11px]">
                Expected Harvest
              </span>
              <span className="text-sm font-medium text-[#26332D] flex items-center gap-1.5">
                <Calendar className="h-4 w-4 text-[#17633F]" />
                <span>{query.data.expectedHarvestDate ?? 'Not specified'}</span>
              </span>
            </div>

            <div>
              <span className="text-[#78877E] font-semibold uppercase tracking-wider block mb-1 font-heading text-[11px]">
                Available From Date
              </span>
              <span className="text-sm font-medium text-[#26332D] flex items-center gap-1.5">
                <Calendar className="h-4 w-4 text-[#17633F]" />
                <span>{query.data.availableFrom ?? 'Immediate availability'}</span>
              </span>
            </div>
          </div>
        </div>
      )}
    </AppShell>
  );
}
