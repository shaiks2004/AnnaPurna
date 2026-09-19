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
              className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-md bg-stone-800 hover:bg-stone-900 text-white text-xs font-medium shadow-xs transition"
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
        <div className="bg-white rounded-lg border border-stone-200 shadow-2xs p-6 max-w-2xl">
          <div className="flex items-center justify-between pb-4 mb-4 border-b border-stone-200">
            <h2 className="text-sm font-semibold text-stone-900">Edit Supply Declaration</h2>
            <button
              onClick={() => setIsEditing(false)}
              className="text-stone-400 hover:text-stone-700 p-1 rounded"
              aria-label="Cancel editing"
            >
              <X className="h-4 w-4" />
            </button>
          </div>

          <form onSubmit={handleUpdateSubmit} className="space-y-4">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label
                  className="block text-xs font-semibold uppercase tracking-wider text-stone-600 mb-1"
                  htmlFor="edit-sup-qty"
                >
                  Quantity
                </label>
                <input
                  id="edit-sup-qty"
                  type="number"
                  step="0.001"
                  min="0.001"
                  required
                  value={editQty}
                  onChange={(e) => setEditQty(e.target.value)}
                  className="w-full px-3 py-2 text-xs border border-stone-300 rounded-md focus:outline-none focus:ring-2 focus:ring-emerald-700/20 focus:border-emerald-700 text-stone-900"
                />
              </div>

              <div>
                <label
                  className="block text-xs font-semibold uppercase tracking-wider text-stone-600 mb-1"
                  htmlFor="edit-sup-unit"
                >
                  Quantity Unit
                </label>
                <input
                  id="edit-sup-unit"
                  type="text"
                  required
                  value={editUnit}
                  onChange={(e) => setEditUnit(e.target.value)}
                  className="w-full px-3 py-2 text-xs border border-stone-300 rounded-md focus:outline-none focus:ring-2 focus:ring-emerald-700/20 focus:border-emerald-700 text-stone-900 uppercase font-mono"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label
                  className="block text-xs font-semibold uppercase tracking-wider text-stone-600 mb-1"
                  htmlFor="edit-sup-harvest"
                >
                  Expected Harvest Date
                </label>
                <input
                  id="edit-sup-harvest"
                  type="date"
                  value={editHarvest}
                  onChange={(e) => setEditHarvest(e.target.value)}
                  className="w-full px-3 py-2 text-xs border border-stone-300 rounded-md focus:outline-none focus:ring-2 focus:ring-emerald-700/20 focus:border-emerald-700 text-stone-900"
                />
              </div>

              <div>
                <label
                  className="block text-xs font-semibold uppercase tracking-wider text-stone-600 mb-1"
                  htmlFor="edit-sup-avail"
                >
                  Available From
                </label>
                <input
                  id="edit-sup-avail"
                  type="date"
                  value={editAvail}
                  onChange={(e) => setEditAvail(e.target.value)}
                  className="w-full px-3 py-2 text-xs border border-stone-300 rounded-md focus:outline-none focus:ring-2 focus:ring-emerald-700/20 focus:border-emerald-700 text-stone-900"
                />
              </div>
            </div>

            <div className="pt-4 border-t border-stone-200 flex items-center justify-end gap-2">
              <button
                type="button"
                onClick={() => setIsEditing(false)}
                className="px-4 py-2 border border-stone-300 hover:bg-stone-50 text-stone-700 text-xs font-medium rounded-md transition"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={updateMutation.isPending}
                className="inline-flex items-center gap-1.5 px-4 py-2 bg-[#0e4937] hover:bg-[#135f48] text-white text-xs font-medium rounded-md shadow-xs transition disabled:opacity-50"
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
        <div className="bg-white rounded-lg border border-stone-200 shadow-2xs overflow-hidden max-w-3xl">
          <div className="p-6 border-b border-stone-200 bg-stone-50/50 flex items-start gap-4">
            <div className="p-3 bg-emerald-100 rounded-lg text-emerald-800">
              <Database className="h-6 w-6" />
            </div>
            <div>
              <div className="flex items-center gap-2 mb-1">
                <h2 className="text-xl font-semibold text-stone-900">
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
              <p className="text-xs text-stone-500 font-mono">Supply ID: {query.data.id}</p>
            </div>
          </div>

          <div className="p-6 grid grid-cols-1 sm:grid-cols-2 gap-6 text-xs">
            <div>
              <span className="text-stone-400 font-semibold uppercase tracking-wider block mb-1">
                Commodity ID
              </span>
              <span
                className="text-xs font-mono font-medium text-stone-800 block truncate"
                title={query.data.commodityId}
              >
                {query.data.commodityId}
              </span>
            </div>

            <div>
              <span className="text-stone-400 font-semibold uppercase tracking-wider block mb-1">
                Supplier Ownership
              </span>
              <span className="text-xs font-mono font-medium text-stone-800 block truncate">
                {query.data.organizationId
                  ? `Organization: ${query.data.organizationId}`
                  : `Farmer: ${query.data.farmerId}`}
              </span>
            </div>

            <div>
              <span className="text-stone-400 font-semibold uppercase tracking-wider block mb-1">
                Expected Harvest
              </span>
              <span className="text-sm font-medium text-stone-800 flex items-center gap-1.5">
                <Calendar className="h-3.5 w-3.5 text-stone-500" />
                <span>{query.data.expectedHarvestDate ?? 'Not specified'}</span>
              </span>
            </div>

            <div>
              <span className="text-stone-400 font-semibold uppercase tracking-wider block mb-1">
                Available From Date
              </span>
              <span className="text-sm font-medium text-stone-800 flex items-center gap-1.5">
                <Calendar className="h-3.5 w-3.5 text-stone-500" />
                <span>{query.data.availableFrom ?? 'Immediate availability'}</span>
              </span>
            </div>
          </div>
        </div>
      )}
    </AppShell>
  );
}
