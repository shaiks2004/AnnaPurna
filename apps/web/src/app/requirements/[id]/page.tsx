'use client';

import React, { useState } from 'react';
import { useParams } from 'next/navigation';
import Link from 'next/link';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import {
  ClipboardList,
  Boxes,
  Edit2,
  Loader2,
  Save,
  X,
  Calendar,
  MapPin,
  CheckCircle2,
  ArrowRight,
} from 'lucide-react';
import { AppShell } from '@/components/layout/AppShell';
import {
  PageHeader,
  LoadingState,
  ErrorState,
  Badge,
  StatusNotification,
} from '@/components/ui/States';
import {
  getRequirement,
  updateRequirement,
  publishRequirement,
  openRequirement,
  closeRequirement,
  type RequirementPatchRequest,
} from '@/lib/api';
import { useAuth } from '@/lib/auth';

export default function RequirementDetailPage() {
  const params = useParams<{ id: string }>();
  const id = params?.id;
  const queryClient = useQueryClient();
  const { hasRole } = useAuth();
  const isBuyer = hasRole('BUYER_USER') || hasRole('ADMIN');

  const [isEditing, setIsEditing] = useState(false);
  const [notification, setNotification] = useState<{
    type: 'success' | 'error';
    message: string;
  } | null>(null);

  // Edit fields
  const [editQty, setEditQty] = useState('');
  const [editUnit, setEditUnit] = useState('');
  const [editQual, setEditQual] = useState('');
  const [editLoc, setEditLoc] = useState('');
  const [editRequiredBy, setEditRequiredBy] = useState('');
  const [editTargetPrice, setEditTargetPrice] = useState('');
  const [editMaxPrice, setEditMaxPrice] = useState('');
  const [editNotes, setEditNotes] = useState('');

  const query = useQuery({
    queryKey: ['requirement', id],
    queryFn: () => getRequirement(id!),
    enabled: !!id,
  });

  const updateMutation = useMutation({
    mutationFn: (payload: RequirementPatchRequest) => updateRequirement(id!, payload),
    onSuccess: () => {
      setIsEditing(false);
      setNotification({ type: 'success', message: 'Draft requirement updated successfully.' });
      void queryClient.invalidateQueries({ queryKey: ['requirement', id] });
      void queryClient.invalidateQueries({ queryKey: ['requirements'] });
    },
    onError: (err) => {
      setNotification({
        type: 'error',
        message: err instanceof Error ? err.message : 'Failed to update draft requirement.',
      });
    },
  });

  const publishMutation = useMutation({
    mutationFn: () => publishRequirement(id!),
    onSuccess: () => {
      setNotification({ type: 'success', message: 'Requirement published to the network.' });
      void queryClient.invalidateQueries({ queryKey: ['requirement', id] });
      void queryClient.invalidateQueries({ queryKey: ['requirements'] });
    },
    onError: (err) => {
      setNotification({
        type: 'error',
        message: err instanceof Error ? err.message : 'Failed to publish requirement.',
      });
    },
  });

  const openMutation = useMutation({
    mutationFn: () => openRequirement(id!),
    onSuccess: () => {
      setNotification({ type: 'success', message: 'Requirement opened for algorithmic matching.' });
      void queryClient.invalidateQueries({ queryKey: ['requirement', id] });
      void queryClient.invalidateQueries({ queryKey: ['requirements'] });
    },
    onError: (err) => {
      setNotification({
        type: 'error',
        message: err instanceof Error ? err.message : 'Failed to open requirement.',
      });
    },
  });

  const closeMutation = useMutation({
    mutationFn: () => closeRequirement(id!),
    onSuccess: () => {
      setNotification({ type: 'success', message: 'Requirement closed.' });
      void queryClient.invalidateQueries({ queryKey: ['requirement', id] });
      void queryClient.invalidateQueries({ queryKey: ['requirements'] });
    },
    onError: (err) => {
      setNotification({
        type: 'error',
        message: err instanceof Error ? err.message : 'Failed to close requirement.',
      });
    },
  });

  const startEditing = () => {
    if (query.data) {
      setEditQty(String(query.data.quantity));
      setEditUnit(query.data.quantityUnit);
      setEditQual(query.data.qualitySpecification);
      setEditLoc(query.data.deliveryLocation);
      setEditRequiredBy(query.data.requiredBy);
      setEditTargetPrice(query.data.targetPrice !== null ? String(query.data.targetPrice) : '');
      setEditMaxPrice(query.data.maximumPrice !== null ? String(query.data.maximumPrice) : '');
      setEditNotes(query.data.notes ?? '');
      setIsEditing(true);
      setNotification(null);
    }
  };

  const handleUpdateSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    updateMutation.mutate({
      quantity: editQty ? Number(editQty) : undefined,
      quantityUnit: editUnit.trim() || undefined,
      qualitySpecification: editQual.trim() || undefined,
      deliveryLocation: editLoc.trim() || undefined,
      requiredBy: editRequiredBy || undefined,
      targetPrice: editTargetPrice ? Number(editTargetPrice) : null,
      maximumPrice: editMaxPrice ? Number(editMaxPrice) : null,
      notes: editNotes.trim() || null,
    });
  };

  const isTransitioning =
    publishMutation.isPending || openMutation.isPending || closeMutation.isPending;

  return (
    <AppShell>
      <PageHeader
        title={query.data ? `Requirement #${query.data.id.substring(0, 8)}` : 'Requirement Details'}
        eyebrow="Buyer Procurement Intent"
        breadcrumbs={[
          { label: 'Dashboard', href: '/dashboard' },
          { label: 'Requirements', href: '/requirements' },
          { label: id?.substring(0, 8) ?? 'Details' },
        ]}
        actions={
          query.data && (
            <div className="flex items-center gap-2 flex-wrap">
              {/* Matching Action */}
              {(query.data.status === 'OPEN' || query.data.status === 'PUBLISHED') && (
                <Link
                  href={`/requirements/${id}/matches`}
                  className="agri-btn-primary bg-[#123C2C] hover:bg-[#17633F]"
                >
                  <Boxes className="h-4 w-4 text-[#B8D99F]" />
                  <span>Execute Matching Engine</span>
                </Link>
              )}

              {/* Edit Draft Action */}
              {query.data.status === 'DRAFT' && isBuyer && !isEditing && (
                <button
                  onClick={startEditing}
                  className="agri-btn-secondary"
                >
                  <Edit2 className="h-3.5 w-3.5" />
                  <span>Edit Draft</span>
                </button>
              )}

              {/* Lifecycle Transition Buttons */}
              {query.data.status === 'DRAFT' && isBuyer && (
                <button
                  onClick={() => {
                    if (
                      window.confirm(
                        'Publish this requirement? It will be visible across the procurement network.',
                      )
                    ) {
                      publishMutation.mutate();
                    }
                  }}
                  disabled={isTransitioning}
                  className="agri-btn-primary bg-[#17633F] hover:bg-[#124D31] text-xs disabled:opacity-50"
                >
                  {publishMutation.isPending ? (
                    <Loader2 className="h-3.5 w-3.5 animate-spin" />
                  ) : (
                    <CheckCircle2 className="h-3.5 w-3.5 text-[#B8D99F]" />
                  )}
                  <span>Publish Requirement</span>
                </button>
              )}

              {query.data.status === 'PUBLISHED' && isBuyer && (
                <button
                  onClick={() => {
                    if (window.confirm('Open this requirement for algorithmic matching?')) {
                      openMutation.mutate();
                    }
                  }}
                  disabled={isTransitioning}
                  className="agri-btn-primary bg-[#17633F] hover:bg-[#124D31] text-xs disabled:opacity-50"
                >
                  {openMutation.isPending ? (
                    <Loader2 className="h-3.5 w-3.5 animate-spin" />
                  ) : (
                    <Boxes className="h-3.5 w-3.5 text-[#B8D99F]" />
                  )}
                  <span>Open for Matching</span>
                </button>
              )}

              {(query.data.status === 'PUBLISHED' || query.data.status === 'OPEN') && isBuyer && (
                <button
                  onClick={() => {
                    if (
                      window.confirm(
                        'Close this requirement? It will no longer participate in active matching.',
                      )
                    ) {
                      closeMutation.mutate();
                    }
                  }}
                  disabled={isTransitioning}
                  className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-lg border border-red-200 bg-red-50/60 hover:bg-red-50 text-red-700 text-xs font-semibold font-heading transition disabled:opacity-50"
                >
                  {closeMutation.isPending ? (
                    <Loader2 className="h-3.5 w-3.5 animate-spin" />
                  ) : (
                    <X className="h-3.5 w-3.5" />
                  )}
                  <span>Close Requirement</span>
                </button>
              )}
            </div>
          )
        }
      />

      {notification && (
        <StatusNotification type={notification.type} message={notification.message} />
      )}

      {query.isLoading ? (
        <LoadingState message="Loading procurement requirement..." />
      ) : query.error ? (
        <ErrorState error={query.error} onRetry={() => query.refetch()} />
      ) : !query.data ? (
        <ErrorState error={new Error('Requirement not found')} />
      ) : isEditing ? (
        /* Edit Form */
        <div className="agri-card p-6 sm:p-7 max-w-2xl">
          <div className="flex items-center justify-between pb-4 mb-5 border-b border-[#DDE2DB]">
            <div>
              <h2 className="text-sm font-semibold text-[#123C2C] font-heading">
                Edit DRAFT Procurement Requirement
              </h2>
              <p className="text-[11px] text-[#657169]">
                You can adjust required quantity, quality specifications, and pricing targets before
                publishing.
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
                  htmlFor="edit-req-qty"
                >
                  Quantity *
                </label>
                <input
                  id="edit-req-qty"
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
                  htmlFor="edit-req-unit"
                >
                  Quantity Unit *
                </label>
                <input
                  id="edit-req-unit"
                  type="text"
                  required
                  value={editUnit}
                  onChange={(e) => setEditUnit(e.target.value)}
                  className="agri-input text-xs uppercase font-mono"
                />
              </div>
            </div>

            <div>
              <label
                className="block text-[11px] font-semibold uppercase tracking-wider text-[#657169] mb-1.5 font-heading"
                htmlFor="edit-req-qual"
              >
                Quality Specification *
              </label>
              <textarea
                id="edit-req-qual"
                required
                rows={2}
                value={editQual}
                onChange={(e) => setEditQual(e.target.value)}
                className="agri-input text-xs"
              />
            </div>

            <div>
              <label
                className="block text-[11px] font-semibold uppercase tracking-wider text-[#657169] mb-1.5 font-heading"
                htmlFor="edit-req-loc"
              >
                Delivery Location *
              </label>
              <input
                id="edit-req-loc"
                type="text"
                required
                value={editLoc}
                onChange={(e) => setEditLoc(e.target.value)}
                className="agri-input text-xs"
              />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div>
                <label
                  className="block text-[11px] font-semibold uppercase tracking-wider text-[#657169] mb-1.5 font-heading"
                  htmlFor="edit-req-by"
                >
                  Required By Date *
                </label>
                <input
                  id="edit-req-by"
                  type="date"
                  required
                  value={editRequiredBy}
                  onChange={(e) => setEditRequiredBy(e.target.value)}
                  className="agri-input text-xs"
                />
              </div>

              <div>
                <label
                  className="block text-[11px] font-semibold uppercase tracking-wider text-[#657169] mb-1.5 font-heading"
                  htmlFor="edit-req-tp"
                >
                  Target Price
                </label>
                <input
                  id="edit-req-tp"
                  type="number"
                  step="0.0001"
                  value={editTargetPrice}
                  onChange={(e) => setEditTargetPrice(e.target.value)}
                  className="agri-input text-xs"
                />
              </div>

              <div>
                <label
                  className="block text-[11px] font-semibold uppercase tracking-wider text-[#657169] mb-1.5 font-heading"
                  htmlFor="edit-req-mp"
                >
                  Maximum Price
                </label>
                <input
                  id="edit-req-mp"
                  type="number"
                  step="0.0001"
                  value={editMaxPrice}
                  onChange={(e) => setEditMaxPrice(e.target.value)}
                  className="agri-input text-xs"
                />
              </div>
            </div>

            <div>
              <label
                className="block text-[11px] font-semibold uppercase tracking-wider text-[#657169] mb-1.5 font-heading"
                htmlFor="edit-req-notes"
              >
                Notes
              </label>
              <textarea
                id="edit-req-notes"
                rows={2}
                value={editNotes}
                onChange={(e) => setEditNotes(e.target.value)}
                className="agri-input text-xs"
              />
            </div>

            <div className="pt-4 border-t border-[#DDE2DB] flex items-center justify-end gap-3">
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
                className="agri-btn-primary bg-[#17633F] hover:bg-[#124D31] disabled:opacity-50"
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
          {/* Main Summary Panel */}
          <div className="agri-card overflow-hidden">
            <div className="p-6 border-b border-[#DDE2DB] bg-[#F8F9F6] flex items-start gap-4">
              <div className="p-3 bg-[#E8F0E6] rounded-xl text-[#17633F] border border-[#B8D99F]/40 shrink-0">
                <ClipboardList className="h-6 w-6" />
              </div>
              <div className="flex-1">
                <div className="flex items-center justify-between flex-wrap gap-2 mb-1">
                  <div className="flex items-center gap-2.5">
                    <h2 className="text-xl font-bold text-[#123C2C] font-heading">
                      {query.data.quantity} {query.data.quantityUnit}
                    </h2>
                    <Badge
                      variant={
                        query.data.status === 'OPEN'
                          ? 'success'
                          : query.data.status === 'PUBLISHED'
                            ? 'info'
                            : query.data.status === 'DRAFT'
                              ? 'warning'
                              : 'default'
                      }
                    >
                      {query.data.status}
                    </Badge>
                  </div>
                  <span className="text-xs text-[#78877E] font-mono bg-white px-2.5 py-1 rounded-md border border-[#DDE2DB]">
                    Version: v{query.data.version}
                  </span>
                </div>
                <p className="text-xs text-[#657169] font-mono">Requirement ID: {query.data.id}</p>
              </div>
            </div>

            <div className="p-6 grid grid-cols-1 sm:grid-cols-3 gap-6 text-xs border-b border-[#DDE2DB]/60 bg-white">
              <div>
                <span className="text-[#657169] font-semibold uppercase tracking-wider text-[11px] block mb-1 font-heading">
                  Commodity Reference
                </span>
                <span
                  className="text-xs font-mono font-medium text-[#26332D] block truncate"
                  title={query.data.commodityId}
                >
                  {query.data.commodityId}
                </span>
              </div>

              <div>
                <span className="text-[#657169] font-semibold uppercase tracking-wider text-[11px] block mb-1 font-heading">
                  Buyer Profile
                </span>
                <span
                  className="text-xs font-mono font-medium text-[#26332D] block truncate"
                  title={query.data.buyerProfileId}
                >
                  {query.data.buyerProfileId}
                </span>
              </div>

              <div>
                <span className="text-[#657169] font-semibold uppercase tracking-wider text-[11px] block mb-1 font-heading">
                  Buyer Organization
                </span>
                <span
                  className="text-xs font-mono font-medium text-[#26332D] block truncate"
                  title={query.data.buyerOrganizationId}
                >
                  {query.data.buyerOrganizationId}
                </span>
              </div>

              <div>
                <span className="text-[#657169] font-semibold uppercase tracking-wider text-[11px] block mb-1 font-heading">
                  Target Price
                </span>
                <span className="text-sm font-bold text-[#123C2C] font-heading">
                  {query.data.targetPrice !== null
                    ? `${query.data.currencyCode ?? 'INR'} ${query.data.targetPrice}`
                    : 'Flexible'}
                </span>
              </div>

              <div>
                <span className="text-[#657169] font-semibold uppercase tracking-wider text-[11px] block mb-1 font-heading">
                  Maximum Price Ceiling
                </span>
                <span className="text-sm font-bold text-[#123C2C] font-heading">
                  {query.data.maximumPrice !== null
                    ? `${query.data.currencyCode ?? 'INR'} ${query.data.maximumPrice}`
                    : 'No Ceiling'}
                </span>
              </div>

              <div>
                <span className="text-[#657169] font-semibold uppercase tracking-wider text-[11px] block mb-1 font-heading">
                  Required By
                </span>
                <span className="text-sm font-medium text-[#26332D] flex items-center gap-1.5">
                  <Calendar className="h-3.5 w-3.5 text-[#17633F]" />
                  <span>{query.data.requiredBy}</span>
                </span>
              </div>
            </div>

            <div className="p-6 space-y-4 text-xs bg-[#F8F9F6]/40">
              <div>
                <span className="text-[#657169] font-semibold uppercase tracking-wider text-[11px] block mb-1 font-heading">
                  Delivery Destination
                </span>
                <span className="text-sm font-medium text-[#26332D] flex items-center gap-1.5">
                  <MapPin className="h-3.5 w-3.5 text-[#17633F]" />
                  <span>{query.data.deliveryLocation}</span>
                </span>
              </div>

              <div>
                <span className="text-[#657169] font-semibold uppercase tracking-wider text-[11px] block mb-1 font-heading">
                  Quality Specification
                </span>
                <p className="text-xs leading-relaxed text-[#26332D] bg-white p-3.5 rounded-lg border border-[#DDE2DB]">
                  {query.data.qualitySpecification}
                </p>
              </div>

              {query.data.notes && (
                <div>
                  <span className="text-[#657169] font-semibold uppercase tracking-wider text-[11px] block mb-1 font-heading">
                    Procurement Notes
                  </span>
                  <p className="text-xs text-[#657169] italic bg-white p-3.5 rounded-lg border border-[#DDE2DB]">
                    {query.data.notes}
                  </p>
                </div>
              )}
            </div>
          </div>

          {/* Matching Engine Callout */}
          {(query.data.status === 'OPEN' || query.data.status === 'PUBLISHED') && (
            <div className="p-6 sm:p-7 bg-[#123C2C] text-white rounded-xl border border-[#17633F] shadow-sm flex flex-col sm:flex-row sm:items-center justify-between gap-5">
              <div>
                <div className="flex items-center gap-2 mb-1.5">
                  <Boxes className="h-5 w-5 text-[#B8D99F]" />
                  <h3 className="text-sm font-bold uppercase tracking-wider text-[#B8D99F] font-heading">
                    Deterministic Baseline Matching Engine
                  </h3>
                </div>
                <p className="text-xs text-white/85 max-w-xl leading-relaxed">
                  Evaluate real inventory lots against this requirement. Computes multi-factor
                  scores across commodity match (35%), quantity coverage (30%), verified quality
                  (20%), geospatial proximity (10%), and delivery window (5%).
                </p>
              </div>
              <Link
                href={`/requirements/${id}/matches`}
                className="inline-flex items-center gap-2 px-5 py-2.5 bg-[#B8D99F] hover:bg-[#a8cd8d] text-[#123C2C] text-xs font-bold font-heading rounded-lg shadow-sm transition shrink-0"
              >
                <span>Find Ranked Matches</span>
                <ArrowRight className="h-4 w-4 text-[#123C2C]" />
              </Link>
            </div>
          )}
        </div>
      )}
    </AppShell>
  );
}
