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
              className="agri-btn-primary bg-[#123C2C] hover:bg-[#17633F]"
            >
              <ShieldCheck className="h-4 w-4 text-[#B8D99F]" />
              <span>Lot Passport</span>
            </Link>
            {query.data?.status === 'DECLARED' && !isEditing && (
              <button
                onClick={startEditing}
                className="agri-btn-secondary"
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
      <div className="flex items-center gap-2 pb-4 mb-6 border-b border-[#DDE2DB] overflow-x-auto text-xs">
        <Link
          href={`/lots/${id}`}
          className="px-3.5 py-1.5 rounded-md bg-[#123C2C] text-white font-semibold font-heading"
        >
          Overview & Manage
        </Link>
        <Link
          href={`/lots/${id}/passport`}
          className="px-3.5 py-1.5 rounded-md hover:bg-[#F4F1E8] text-[#26332D] font-medium transition flex items-center gap-1.5 border border-[#DDE2DB]"
        >
          <ShieldCheck className="h-3.5 w-3.5 text-[#17633F]" />
          <span>Lot Passport</span>
        </Link>
        <Link
          href={`/lots/${id}/quality`}
          className="px-3.5 py-1.5 rounded-md hover:bg-[#F4F1E8] text-[#26332D] font-medium transition flex items-center gap-1.5 border border-[#DDE2DB]"
        >
          <FlaskConical className="h-3.5 w-3.5 text-[#657169]" />
          <span>Quality Tests</span>
        </Link>
        <Link
          href={`/lots/${id}/location`}
          className="px-3.5 py-1.5 rounded-md hover:bg-[#F4F1E8] text-[#26332D] font-medium transition flex items-center gap-1.5 border border-[#DDE2DB]"
        >
          <MapPin className="h-3.5 w-3.5 text-[#657169]" />
          <span>Origin Location</span>
        </Link>
        <Link
          href={`/lots/${id}/documents`}
          className="px-3.5 py-1.5 rounded-md hover:bg-[#F4F1E8] text-[#26332D] font-medium transition flex items-center gap-1.5 border border-[#DDE2DB]"
        >
          <FileText className="h-3.5 w-3.5 text-[#657169]" />
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
        <div className="agri-card p-6 sm:p-7 max-w-2xl">
          <div className="flex items-center justify-between pb-4 mb-5 border-b border-[#DDE2DB]">
            <div>
              <h2 className="text-sm font-semibold text-[#123C2C] font-heading">Edit DECLARED Lot</h2>
              <p className="text-[11px] text-[#657169]">
                You can update declared quantity and availability before quality verification.
              </p>
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
                  htmlFor="edit-lot-qty"
                >
                  Quantity *
                </label>
                <input
                  id="edit-lot-qty"
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
                  htmlFor="edit-lot-unit"
                >
                  Quantity Unit *
                </label>
                <input
                  id="edit-lot-unit"
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
                  htmlFor="edit-lot-harvest"
                >
                  Harvest Date
                </label>
                <input
                  id="edit-lot-harvest"
                  type="date"
                  value={editHarvest}
                  onChange={(e) => setEditHarvest(e.target.value)}
                  className="agri-input text-xs"
                />
              </div>

              <div>
                <label
                  className="block text-[11px] font-semibold uppercase tracking-wider text-[#657169] mb-1.5 font-heading"
                  htmlFor="edit-lot-avail"
                >
                  Available From Date
                </label>
                <input
                  id="edit-lot-avail"
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
        <div className="space-y-6 max-w-4xl">
          <div className="agri-card overflow-hidden">
            <div className="p-6 border-b border-[#DDE2DB] bg-[#F8F9F6] flex items-start gap-4">
              <div className="p-3 bg-[#EAF2E8] border border-[#B8D99F]/50 rounded-lg text-[#17633F]">
                <Leaf className="h-6 w-6" />
              </div>
              <div className="flex-1">
                <div className="flex items-center justify-between flex-wrap gap-2 mb-1">
                  <div className="flex items-center gap-2.5">
                    <h2 className="text-xl font-semibold text-[#123C2C] font-heading font-mono">
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
                <p className="text-xs text-[#657169] font-mono">Lot ID: <span className="text-[#26332D] font-semibold">{query.data.id}</span></p>
              </div>
            </div>

            <div className="p-6 grid grid-cols-1 sm:grid-cols-3 gap-6 text-xs">
              <div>
                <span className="text-[#78877E] font-semibold uppercase tracking-wider block mb-1 font-heading text-[11px]">
                  Declared Quantity
                </span>
                <span className="text-base font-semibold text-[#123C2C] font-heading">
                  {query.data.quantity} {query.data.quantityUnit}
                </span>
              </div>

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
                  Supplier Entity
                </span>
                <span className="text-xs font-mono font-medium text-[#26332D] block truncate">
                  {query.data.organizationId
                    ? `Org: ${query.data.organizationId}`
                    : `Farmer: ${query.data.farmerId}`}
                </span>
              </div>

              <div>
                <span className="text-[#78877E] font-semibold uppercase tracking-wider block mb-1 font-heading text-[11px]">
                  Harvest Date
                </span>
                <span className="text-sm font-medium text-[#26332D] flex items-center gap-1.5">
                  <Calendar className="h-4 w-4 text-[#17633F]" />
                  <span>{query.data.harvestDate ?? 'Not specified'}</span>
                </span>
              </div>

              <div>
                <span className="text-[#78877E] font-semibold uppercase tracking-wider block mb-1 font-heading text-[11px]">
                  Available From
                </span>
                <span className="text-sm font-medium text-[#26332D] flex items-center gap-1.5">
                  <Calendar className="h-4 w-4 text-[#17633F]" />
                  <span>{query.data.availableFrom ?? 'Immediate'}</span>
                </span>
              </div>

              <div>
                <span className="text-[#78877E] font-semibold uppercase tracking-wider block mb-1 font-heading text-[11px]">
                  Source Supply ID
                </span>
                <span className="text-xs font-mono text-[#657169] truncate block">
                  {query.data.sourceSupplyId ?? 'Direct Lot Creation'}
                </span>
              </div>
            </div>
          </div>

          {/* Quick Traceability Action Cards */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <Link
              href={`/lots/${id}/quality`}
              className="p-4 bg-white rounded-lg border border-[#DDE2DB] hover:border-[#17633F] transition shadow-xs group"
            >
              <div className="flex items-center justify-between text-[#657169] mb-2 group-hover:text-[#17633F]">
                <span className="text-[11px] font-semibold uppercase tracking-wider font-heading">
                  Quality Evidence
                </span>
                <FlaskConical className="h-4 w-4 text-[#17633F]" />
              </div>
              <p className="text-xs text-[#657169]">
                Inspect lab measurements and verify test results.
              </p>
            </Link>

            <Link
              href={`/lots/${id}/location`}
              className="p-4 bg-white rounded-lg border border-[#DDE2DB] hover:border-[#17633F] transition shadow-xs group"
            >
              <div className="flex items-center justify-between text-[#657169] mb-2 group-hover:text-[#17633F]">
                <span className="text-[11px] font-semibold uppercase tracking-wider font-heading">
                  Origin Location
                </span>
                <MapPin className="h-4 w-4 text-[#17633F]" />
              </div>
              <p className="text-xs text-[#657169]">
                Manage GPS WGS84 coordinates for GIS proximity matching.
              </p>
            </Link>

            <Link
              href={`/lots/${id}/documents`}
              className="p-4 bg-white rounded-lg border border-[#DDE2DB] hover:border-[#17633F] transition shadow-xs group"
            >
              <div className="flex items-center justify-between text-[#657169] mb-2 group-hover:text-[#17633F]">
                <span className="text-[11px] font-semibold uppercase tracking-wider font-heading">
                  Document Records
                </span>
                <FileText className="h-4 w-4 text-[#17633F]" />
              </div>
              <p className="text-xs text-[#657169]">
                Attach and inspect verifiable certificate metadata.
              </p>
            </Link>
          </div>
        </div>
      )}
    </AppShell>
  );
}
