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
                  className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-md bg-[#0e4937] hover:bg-[#135f48] text-white text-xs font-semibold shadow-xs transition"
                >
                  <Boxes className="h-4 w-4 text-amber-300" />
                  <span>Execute Matching Engine</span>
                </Link>
              )}

              {/* Edit Draft Action */}
              {query.data.status === 'DRAFT' && isBuyer && !isEditing && (
                <button
                  onClick={startEditing}
                  className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-md bg-stone-800 hover:bg-stone-900 text-white text-xs font-medium shadow-xs transition"
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
                  className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-md bg-emerald-800 hover:bg-emerald-900 text-white text-xs font-medium shadow-xs transition disabled:opacity-50"
                >
                  {publishMutation.isPending ? (
                    <Loader2 className="h-3.5 w-3.5 animate-spin" />
                  ) : (
                    <CheckCircle2 className="h-3.5 w-3.5" />
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
                  className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-md bg-emerald-800 hover:bg-emerald-900 text-white text-xs font-medium shadow-xs transition disabled:opacity-50"
                >
                  {openMutation.isPending ? (
                    <Loader2 className="h-3.5 w-3.5 animate-spin" />
                  ) : (
                    <Boxes className="h-3.5 w-3.5" />
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
                  className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-md border border-stone-300 hover:bg-red-50 hover:text-red-700 hover:border-red-200 text-stone-700 text-xs font-medium transition disabled:opacity-50"
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
        <div className="bg-white rounded-lg border border-stone-200 shadow-2xs p-6 max-w-2xl">
          <div className="flex items-center justify-between pb-4 mb-4 border-b border-stone-200">
            <div>
              <h2 className="text-sm font-semibold text-stone-900">
                Edit DRAFT Procurement Requirement
              </h2>
              <p className="text-[11px] text-stone-500">
                You can adjust required quantity, quality specifications, and pricing targets before
                publishing.
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
                  htmlFor="edit-req-qty"
                >
                  Quantity
                </label>
                <input
                  id="edit-req-qty"
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
                  htmlFor="edit-req-unit"
                >
                  Quantity Unit
                </label>
                <input
                  id="edit-req-unit"
                  type="text"
                  required
                  value={editUnit}
                  onChange={(e) => setEditUnit(e.target.value)}
                  className="w-full px-3 py-2 text-xs border border-stone-300 rounded-md focus:outline-none focus:ring-2 focus:ring-emerald-700/20 focus:border-emerald-700 text-stone-900 uppercase font-mono"
                />
              </div>
            </div>

            <div>
              <label
                className="block text-xs font-semibold uppercase tracking-wider text-stone-600 mb-1"
                htmlFor="edit-req-qual"
              >
                Quality Specification
              </label>
              <textarea
                id="edit-req-qual"
                required
                rows={2}
                value={editQual}
                onChange={(e) => setEditQual(e.target.value)}
                className="w-full px-3 py-2 text-xs border border-stone-300 rounded-md focus:outline-none focus:ring-2 focus:ring-emerald-700/20 focus:border-emerald-700 text-stone-900"
              />
            </div>

            <div>
              <label
                className="block text-xs font-semibold uppercase tracking-wider text-stone-600 mb-1"
                htmlFor="edit-req-loc"
              >
                Delivery Location
              </label>
              <input
                id="edit-req-loc"
                type="text"
                required
                value={editLoc}
                onChange={(e) => setEditLoc(e.target.value)}
                className="w-full px-3 py-2 text-xs border border-stone-300 rounded-md focus:outline-none focus:ring-2 focus:ring-emerald-700/20 focus:border-emerald-700 text-stone-900"
              />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div>
                <label
                  className="block text-xs font-semibold uppercase tracking-wider text-stone-600 mb-1"
                  htmlFor="edit-req-by"
                >
                  Required By Date
                </label>
                <input
                  id="edit-req-by"
                  type="date"
                  required
                  value={editRequiredBy}
                  onChange={(e) => setEditRequiredBy(e.target.value)}
                  className="w-full px-3 py-2 text-xs border border-stone-300 rounded-md focus:outline-none focus:ring-2 focus:ring-emerald-700/20 focus:border-emerald-700 text-stone-900"
                />
              </div>

              <div>
                <label
                  className="block text-xs font-semibold uppercase tracking-wider text-stone-600 mb-1"
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
                  className="w-full px-3 py-2 text-xs border border-stone-300 rounded-md focus:outline-none focus:ring-2 focus:ring-emerald-700/20 focus:border-emerald-700 text-stone-900"
                />
              </div>

              <div>
                <label
                  className="block text-xs font-semibold uppercase tracking-wider text-stone-600 mb-1"
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
                  className="w-full px-3 py-2 text-xs border border-stone-300 rounded-md focus:outline-none focus:ring-2 focus:ring-emerald-700/20 focus:border-emerald-700 text-stone-900"
                />
              </div>
            </div>

            <div>
              <label
                className="block text-xs font-semibold uppercase tracking-wider text-stone-600 mb-1"
                htmlFor="edit-req-notes"
              >
                Notes
              </label>
              <textarea
                id="edit-req-notes"
                rows={2}
                value={editNotes}
                onChange={(e) => setEditNotes(e.target.value)}
                className="w-full px-3 py-2 text-xs border border-stone-300 rounded-md focus:outline-none focus:ring-2 focus:ring-emerald-700/20 focus:border-emerald-700 text-stone-900"
              />
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
          {/* Main Summary Panel */}
          <div className="bg-white rounded-lg border border-stone-200 shadow-2xs overflow-hidden">
            <div className="p-6 border-b border-stone-200 bg-stone-50/50 flex items-start gap-4">
              <div className="p-3 bg-emerald-100 rounded-lg text-emerald-800">
                <ClipboardList className="h-6 w-6" />
              </div>
              <div className="flex-1">
                <div className="flex items-center justify-between flex-wrap gap-2 mb-1">
                  <div className="flex items-center gap-2.5">
                    <h2 className="text-xl font-semibold text-stone-900">
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
                  <span className="text-xs text-stone-400 font-mono">
                    Version: v{query.data.version}
                  </span>
                </div>
                <p className="text-xs text-stone-500 font-mono">Requirement ID: {query.data.id}</p>
              </div>
            </div>

            <div className="p-6 grid grid-cols-1 sm:grid-cols-3 gap-6 text-xs border-b border-stone-100">
              <div>
                <span className="text-stone-400 font-semibold uppercase tracking-wider block mb-1">
                  Commodity Reference
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
                  Buyer Profile
                </span>
                <span
                  className="text-xs font-mono font-medium text-stone-800 block truncate"
                  title={query.data.buyerProfileId}
                >
                  {query.data.buyerProfileId}
                </span>
              </div>

              <div>
                <span className="text-stone-400 font-semibold uppercase tracking-wider block mb-1">
                  Buyer Organization
                </span>
                <span
                  className="text-xs font-mono font-medium text-stone-800 block truncate"
                  title={query.data.buyerOrganizationId}
                >
                  {query.data.buyerOrganizationId}
                </span>
              </div>

              <div>
                <span className="text-stone-400 font-semibold uppercase tracking-wider block mb-1">
                  Target Price
                </span>
                <span className="text-sm font-semibold text-stone-900">
                  {query.data.targetPrice !== null
                    ? `${query.data.currencyCode ?? 'INR'} ${query.data.targetPrice}`
                    : 'Flexible'}
                </span>
              </div>

              <div>
                <span className="text-stone-400 font-semibold uppercase tracking-wider block mb-1">
                  Maximum Price Ceiling
                </span>
                <span className="text-sm font-semibold text-stone-900">
                  {query.data.maximumPrice !== null
                    ? `${query.data.currencyCode ?? 'INR'} ${query.data.maximumPrice}`
                    : 'No Ceiling'}
                </span>
              </div>

              <div>
                <span className="text-stone-400 font-semibold uppercase tracking-wider block mb-1">
                  Required By
                </span>
                <span className="text-sm font-medium text-stone-800 flex items-center gap-1.5">
                  <Calendar className="h-3.5 w-3.5 text-stone-500" />
                  <span>{query.data.requiredBy}</span>
                </span>
              </div>
            </div>

            <div className="p-6 space-y-4 text-xs">
              <div>
                <span className="text-stone-400 font-semibold uppercase tracking-wider block mb-1">
                  Delivery Destination
                </span>
                <span className="text-sm font-medium text-stone-800 flex items-center gap-1.5">
                  <MapPin className="h-3.5 w-3.5 text-stone-500" />
                  <span>{query.data.deliveryLocation}</span>
                </span>
              </div>

              <div>
                <span className="text-stone-400 font-semibold uppercase tracking-wider block mb-1">
                  Quality Specification
                </span>
                <p className="text-xs leading-relaxed text-stone-800 bg-stone-50 p-3 rounded border border-stone-200">
                  {query.data.qualitySpecification}
                </p>
              </div>

              {query.data.notes && (
                <div>
                  <span className="text-stone-400 font-semibold uppercase tracking-wider block mb-1">
                    Procurement Notes
                  </span>
                  <p className="text-xs text-stone-600 italic">{query.data.notes}</p>
                </div>
              )}
            </div>
          </div>

          {/* Matching Engine Callout */}
          {(query.data.status === 'OPEN' || query.data.status === 'PUBLISHED') && (
            <div className="p-6 bg-gradient-to-r from-emerald-950 to-emerald-900 text-white rounded-lg border border-emerald-800 shadow-sm flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div>
                <div className="flex items-center gap-2 mb-1">
                  <Boxes className="h-5 w-5 text-amber-300" />
                  <h3 className="text-sm font-semibold uppercase tracking-wider text-emerald-100">
                    Deterministic Baseline Matching Engine
                  </h3>
                </div>
                <p className="text-xs text-emerald-200/90 max-w-xl leading-relaxed">
                  Evaluate real inventory lots against this requirement. Computes multi-factor
                  scores across commodity match (35%), quantity coverage (30%), verified quality
                  (20%), geospatial proximity (10%), and delivery window (5%).
                </p>
              </div>
              <Link
                href={`/requirements/${id}/matches`}
                className="inline-flex items-center gap-2 px-4 py-2.5 bg-amber-400 hover:bg-amber-300 text-stone-950 text-xs font-bold rounded-md shadow-xs transition shrink-0"
              >
                <span>Find Ranked Matches</span>
                <ArrowRight className="h-4 w-4" />
              </Link>
            </div>
          )}
        </div>
      )}
    </AppShell>
  );
}
