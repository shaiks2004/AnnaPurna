'use client';

import React, { useState } from 'react';
import { useParams } from 'next/navigation';
import Link from 'next/link';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import {
  Leaf,
  ShieldCheck,
  MapPin,
  FileText,
  FlaskConical,
  Edit2,
  Loader2,
  Save,
  X,
  Calendar,
} from 'lucide-react';
import { AppShell } from '@/components/layout/AppShell';
import {
  PageHeader,
  LoadingState,
  ErrorState,
  Badge,
  StatusNotification,
} from '@/components/ui/States';
import { getLot, updateLot, type LotPatchRequest } from '@/lib/api';

export default function LotDetailPage() {
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
    queryKey: ['lot', id],
    queryFn: () => getLot(id!),
    enabled: !!id,
  });

  const updateMutation = useMutation({
    mutationFn: (payload: LotPatchRequest) => updateLot(id!, payload),
    onSuccess: () => {
      setIsEditing(false);
      setNotification({ type: 'success', message: 'Lot details updated successfully.' });
      void queryClient.invalidateQueries({ queryKey: ['lot', id] });
      void queryClient.invalidateQueries({ queryKey: ['lots'] });
    },
    onError: (err) => {
      setNotification({
        type: 'error',
        message: err instanceof Error ? err.message : 'Failed to update physical lot.',
      });
    },
  });

  const startEditing = () => {
    if (query.data) {
      setEditQty(String(query.data.quantity));
      setEditUnit(query.data.quantityUnit);
      setEditHarvest(query.data.harvestDate ?? '');
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
      harvestDate: editHarvest || null,
      availableFrom: editAvail || null,
    });
  };

  return (
    <AppShell>
      <PageHeader
        title={query.data ? `Lot: ${query.data.lotNumber}` : 'Lot Details'}
        eyebrow="Lot Inventory & Traceability"
        breadcrumbs={[
          { label: 'Dashboard', href: '/dashboard' },
          { label: 'Lots', href: '/lots' },
          { label: query.data ? query.data.lotNumber : (id?.substring(0, 8) ?? 'Details') },
        ]}
        actions={
          <div className="flex items-center gap-2">
            <Link
              href={`/lots/${id}/passport`}
              className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-md bg-emerald-800 hover:bg-emerald-900 text-white text-xs font-semibold shadow-xs transition"
            >
              <ShieldCheck className="h-4 w-4 text-amber-300" />
              <span>Lot Passport</span>
            </Link>
            {query.data?.status === 'DECLARED' && !isEditing && (
              <button
                onClick={startEditing}
                className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-md bg-stone-800 hover:bg-stone-900 text-white text-xs font-medium shadow-xs transition"
              >
                <Edit2 className="h-3.5 w-3.5" />
                <span>Edit Details</span>
              </button>
            )}
          </div>
        }
      />

      {notification && (
        <StatusNotification type={notification.type} message={notification.message} />
      )}

      {/* Lot Management Sub-Navigation Tabs */}
      <div className="flex items-center gap-2 pb-4 mb-6 border-b border-stone-200 overflow-x-auto text-xs">
        <Link
          href={`/lots/${id}`}
          className="px-3 py-1.5 rounded-md bg-emerald-100 text-emerald-900 font-semibold border border-emerald-300"
        >
          Overview & Manage
        </Link>
        <Link
          href={`/lots/${id}/passport`}
          className="px-3 py-1.5 rounded-md hover:bg-stone-200/70 text-stone-700 font-medium transition flex items-center gap-1.5"
        >
          <ShieldCheck className="h-3.5 w-3.5 text-emerald-700" />
          <span>Lot Passport</span>
        </Link>
        <Link
          href={`/lots/${id}/quality`}
          className="px-3 py-1.5 rounded-md hover:bg-stone-200/70 text-stone-700 font-medium transition flex items-center gap-1.5"
        >
          <FlaskConical className="h-3.5 w-3.5 text-stone-500" />
          <span>Quality Tests</span>
        </Link>
        <Link
          href={`/lots/${id}/location`}
          className="px-3 py-1.5 rounded-md hover:bg-stone-200/70 text-stone-700 font-medium transition flex items-center gap-1.5"
        >
          <MapPin className="h-3.5 w-3.5 text-stone-500" />
          <span>Origin Location</span>
        </Link>
        <Link
          href={`/lots/${id}/documents`}
          className="px-3 py-1.5 rounded-md hover:bg-stone-200/70 text-stone-700 font-medium transition flex items-center gap-1.5"
        >
          <FileText className="h-3.5 w-3.5 text-stone-500" />
          <span>Documents</span>
        </Link>
      </div>

      {query.isLoading ? (
        <LoadingState message="Loading physical lot record..." />
      ) : query.error ? (
        <ErrorState error={query.error} onRetry={() => query.refetch()} />
      ) : !query.data ? (
        <ErrorState error={new Error('Lot not found')} />
      ) : isEditing ? (
        /* Edit Form */
        <div className="bg-white rounded-lg border border-stone-200 shadow-2xs p-6 max-w-2xl">
          <div className="flex items-center justify-between pb-4 mb-4 border-b border-stone-200">
            <div>
              <h2 className="text-sm font-semibold text-stone-900">Edit DECLARED Lot</h2>
              <p className="text-[11px] text-stone-500">
                You can update declared quantity and availability before quality verification.
              </p>
            </div>
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
                  htmlFor="edit-lot-qty"
                >
                  Quantity
                </label>
                <input
                  id="edit-lot-qty"
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
                  htmlFor="edit-lot-unit"
                >
                  Quantity Unit
                </label>
                <input
                  id="edit-lot-unit"
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
                  htmlFor="edit-lot-harvest"
                >
                  Harvest Date
                </label>
                <input
                  id="edit-lot-harvest"
                  type="date"
                  value={editHarvest}
                  onChange={(e) => setEditHarvest(e.target.value)}
                  className="w-full px-3 py-2 text-xs border border-stone-300 rounded-md focus:outline-none focus:ring-2 focus:ring-emerald-700/20 focus:border-emerald-700 text-stone-900"
                />
              </div>

              <div>
                <label
                  className="block text-xs font-semibold uppercase tracking-wider text-stone-600 mb-1"
                  htmlFor="edit-lot-avail"
                >
                  Available From Date
                </label>
                <input
                  id="edit-lot-avail"
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
        <div className="space-y-6 max-w-4xl">
          <div className="bg-white rounded-lg border border-stone-200 shadow-2xs overflow-hidden">
            <div className="p-6 border-b border-stone-200 bg-stone-50/50 flex items-start gap-4">
              <div className="p-3 bg-emerald-100 rounded-lg text-emerald-800">
                <Leaf className="h-6 w-6" />
              </div>
              <div className="flex-1">
                <div className="flex items-center justify-between flex-wrap gap-2 mb-1">
                  <div className="flex items-center gap-2.5">
                    <h2 className="text-xl font-semibold text-stone-900 font-mono">
                      {query.data.lotNumber}
                    </h2>
                    <Badge
                      variant={
                        query.data.status === 'VERIFIED'
                          ? 'success'
                          : query.data.status === 'COMMITTED'
                            ? 'info'
                            : query.data.status === 'CLOSED'
                              ? 'default'
                              : 'warning'
                      }
                    >
                      {query.data.status}
                    </Badge>
                  </div>
                </div>
                <p className="text-xs text-stone-500 font-mono">Lot ID: {query.data.id}</p>
              </div>
            </div>

            <div className="p-6 grid grid-cols-1 sm:grid-cols-3 gap-6 text-xs">
              <div>
                <span className="text-stone-400 font-semibold uppercase tracking-wider block mb-1">
                  Declared Quantity
                </span>
                <span className="text-base font-semibold text-stone-900">
                  {query.data.quantity} {query.data.quantityUnit}
                </span>
              </div>

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
                  Supplier Entity
                </span>
                <span className="text-xs font-mono font-medium text-stone-800 block truncate">
                  {query.data.organizationId
                    ? `Org: ${query.data.organizationId}`
                    : `Farmer: ${query.data.farmerId}`}
                </span>
              </div>

              <div>
                <span className="text-stone-400 font-semibold uppercase tracking-wider block mb-1">
                  Harvest Date
                </span>
                <span className="text-sm font-medium text-stone-800 flex items-center gap-1.5">
                  <Calendar className="h-3.5 w-3.5 text-stone-500" />
                  <span>{query.data.harvestDate ?? 'Not specified'}</span>
                </span>
              </div>

              <div>
                <span className="text-stone-400 font-semibold uppercase tracking-wider block mb-1">
                  Available From
                </span>
                <span className="text-sm font-medium text-stone-800 flex items-center gap-1.5">
                  <Calendar className="h-3.5 w-3.5 text-stone-500" />
                  <span>{query.data.availableFrom ?? 'Immediate'}</span>
                </span>
              </div>

              <div>
                <span className="text-stone-400 font-semibold uppercase tracking-wider block mb-1">
                  Source Supply ID
                </span>
                <span className="text-xs font-mono text-stone-600 truncate block">
                  {query.data.sourceSupplyId ?? 'Direct Lot Creation'}
                </span>
              </div>
            </div>
          </div>

          {/* Quick Traceability Action Cards */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <Link
              href={`/lots/${id}/quality`}
              className="p-4 bg-white rounded-lg border border-stone-200 hover:border-emerald-600 transition shadow-2xs group"
            >
              <div className="flex items-center justify-between text-stone-500 mb-2 group-hover:text-emerald-800">
                <span className="text-xs font-semibold uppercase tracking-wider">
                  Quality Evidence
                </span>
                <FlaskConical className="h-4 w-4 text-emerald-700" />
              </div>
              <p className="text-xs text-stone-600">
                Inspect lab measurements and verify test results.
              </p>
            </Link>

            <Link
              href={`/lots/${id}/location`}
              className="p-4 bg-white rounded-lg border border-stone-200 hover:border-emerald-600 transition shadow-2xs group"
            >
              <div className="flex items-center justify-between text-stone-500 mb-2 group-hover:text-emerald-800">
                <span className="text-xs font-semibold uppercase tracking-wider">
                  Origin Location
                </span>
                <MapPin className="h-4 w-4 text-emerald-700" />
              </div>
              <p className="text-xs text-stone-600">
                Manage GPS WGS84 coordinates for GIS proximity matching.
              </p>
            </Link>

            <Link
              href={`/lots/${id}/documents`}
              className="p-4 bg-white rounded-lg border border-stone-200 hover:border-emerald-600 transition shadow-2xs group"
            >
              <div className="flex items-center justify-between text-stone-500 mb-2 group-hover:text-emerald-800">
                <span className="text-xs font-semibold uppercase tracking-wider">
                  Document Records
                </span>
                <FileText className="h-4 w-4 text-emerald-700" />
              </div>
              <p className="text-xs text-stone-600">
                Attach and inspect verifiable certificate metadata.
              </p>
            </Link>
          </div>
        </div>
      )}
    </AppShell>
  );
}
