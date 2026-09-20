'use client';

import React, { useState } from 'react';
import { useParams } from 'next/navigation';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Store, Edit2, Loader2, Save, X, MapPin } from 'lucide-react';
import { AppShell } from '@/components/layout/AppShell';
import {
  PageHeader,
  LoadingState,
  ErrorState,
  Badge,
  StatusNotification,
} from '@/components/ui/States';
import { getMarket, updateMarket, type MarketPatchRequest } from '@/lib/api';
import { useAuth } from '@/lib/auth';

export default function MarketDetailPage() {
  const params = useParams<{ id: string }>();
  const id = params?.id;
  const queryClient = useQueryClient();
  const { hasRole } = useAuth();
  const isAdmin = hasRole('ADMIN');

  const [isEditing, setIsEditing] = useState(false);
  const [notification, setNotification] = useState<{
    type: 'success' | 'error';
    message: string;
  } | null>(null);

  const [editName, setEditName] = useState('');
  const [editType, setEditType] = useState('');
  const [editState, setEditState] = useState('');
  const [editDistrict, setEditDistrict] = useState('');
  const [editActive, setEditActive] = useState(true);

  const query = useQuery({
    queryKey: ['market', id],
    queryFn: () => getMarket(id!),
    enabled: !!id,
  });

  const updateMutation = useMutation({
    mutationFn: (payload: MarketPatchRequest) => updateMarket(id!, payload),
    onSuccess: (updated) => {
      setIsEditing(false);
      setNotification({
        type: 'success',
        message: `Market "${updated.name}" updated successfully.`,
      });
      void queryClient.invalidateQueries({ queryKey: ['market', id] });
      void queryClient.invalidateQueries({ queryKey: ['markets'] });
    },
    onError: (err) => {
      setNotification({
        type: 'error',
        message: err instanceof Error ? err.message : 'Failed to update market.',
      });
    },
  });

  const startEditing = () => {
    if (query.data) {
      setEditName(query.data.name);
      setEditType(query.data.marketTypeCode ?? '');
      setEditState(query.data.state ?? '');
      setEditDistrict(query.data.district ?? '');
      setEditActive(query.data.active);
      setIsEditing(true);
      setNotification(null);
    }
  };

  const handleUpdateSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    updateMutation.mutate({
      name: editName.trim() || undefined,
      marketTypeCode: editType.trim() || null,
      state: editState.trim() || null,
      district: editDistrict.trim() || null,
      active: editActive,
    });
  };

  return (
    <AppShell>
      <PageHeader
        title={query.data ? query.data.name : 'Market Details'}
        eyebrow="Market Intelligence"
        breadcrumbs={[
          { label: 'Dashboard', href: '/dashboard' },
          { label: 'Markets', href: '/markets' },
          { label: query.data ? query.data.name : (id?.substring(0, 8) ?? 'Details') },
        ]}
        actions={
          isAdmin &&
          !isEditing &&
          query.data && (
            <button
              onClick={startEditing}
              className="agri-btn-secondary"
            >
              <Edit2 className="h-3.5 w-3.5" />
              <span>Edit Market</span>
            </button>
          )
        }
      />

      {notification && (
        <StatusNotification type={notification.type} message={notification.message} />
      )}

      {query.isLoading ? (
        <LoadingState message="Loading market details..." />
      ) : query.error ? (
        <ErrorState error={query.error} onRetry={() => query.refetch()} />
      ) : !query.data ? (
        <ErrorState error={new Error('Market not found')} />
      ) : isEditing ? (
        /* Edit Form */
        <div className="agri-card p-6 sm:p-7 max-w-2xl">
          <div className="flex items-center justify-between pb-4 mb-5 border-b border-[#DDE2DB]">
            <div>
              <h2 className="text-sm font-semibold text-[#123C2C] font-heading">Edit Market Record</h2>
              <p className="text-[11px] text-[#657169]">Update APMC market classification and geographic details</p>
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
            <div>
              <label
                className="block text-[11px] font-semibold uppercase tracking-wider text-[#657169] mb-1.5 font-heading"
                htmlFor="edit-m-name"
              >
                Market Name *
              </label>
              <input
                id="edit-m-name"
                type="text"
                required
                value={editName}
                onChange={(e) => setEditName(e.target.value)}
                className="agri-input"
              />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              <div>
                <label
                  className="block text-[11px] font-semibold uppercase tracking-wider text-[#657169] mb-1.5 font-heading"
                  htmlFor="edit-m-type"
                >
                  Type Code
                </label>
                <input
                  id="edit-m-type"
                  type="text"
                  value={editType}
                  onChange={(e) => setEditType(e.target.value)}
                  placeholder="e.g. APMC_PRINCIPAL"
                  className="agri-input uppercase font-mono"
                />
              </div>

              <div>
                <label
                  className="block text-[11px] font-semibold uppercase tracking-wider text-[#657169] mb-1.5 font-heading"
                  htmlFor="edit-m-state"
                >
                  State
                </label>
                <input
                  id="edit-m-state"
                  type="text"
                  value={editState}
                  onChange={(e) => setEditState(e.target.value)}
                  placeholder="e.g. Maharashtra"
                  className="agri-input"
                />
              </div>

              <div>
                <label
                  className="block text-[11px] font-semibold uppercase tracking-wider text-[#657169] mb-1.5 font-heading"
                  htmlFor="edit-m-district"
                >
                  District
                </label>
                <input
                  id="edit-m-district"
                  type="text"
                  value={editDistrict}
                  onChange={(e) => setEditDistrict(e.target.value)}
                  placeholder="e.g. Nashik"
                  className="agri-input"
                />
              </div>
            </div>

            <div className="flex items-center gap-2 pt-2">
              <input
                id="edit-m-active"
                type="checkbox"
                checked={editActive}
                onChange={(e) => setEditActive(e.target.checked)}
                className="h-4 w-4 rounded border-[#DDE2DB] text-[#17633F] focus:ring-[#17633F]"
              />
              <label htmlFor="edit-m-active" className="text-xs font-medium text-[#26332D]">
                Active in procurement network & price feed
              </label>
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
              <Store className="h-6 w-6" />
            </div>
            <div>
              <div className="flex items-center gap-2.5 mb-1">
                <h2 className="text-xl font-semibold text-[#123C2C] font-heading">{query.data.name}</h2>
                <Badge variant={query.data.active ? 'success' : 'default'}>
                  {query.data.active ? 'Active' : 'Inactive'}
                </Badge>
              </div>
              <p className="text-xs text-[#657169] font-mono">
                Market Code: <span className="font-semibold text-[#26332D]">{query.data.marketCode}</span>
              </p>
            </div>
          </div>

          <div className="p-6 grid grid-cols-1 sm:grid-cols-3 gap-6 text-xs">
            <div>
              <span className="text-[#78877E] font-semibold uppercase tracking-wider block mb-1 font-heading text-[11px]">
                Market Classification
              </span>
              <span className="text-sm font-medium text-[#26332D]">
                {query.data.marketTypeCode ?? 'APMC Market'}
              </span>
            </div>

            <div>
              <span className="text-[#78877E] font-semibold uppercase tracking-wider block mb-1 font-heading text-[11px]">
                Location Region
              </span>
              <span className="text-sm font-medium text-[#26332D] flex items-center gap-1.5">
                <MapPin className="h-4 w-4 text-[#17633F]" />
                <span>
                  {[query.data.district, query.data.state].filter(Boolean).join(', ') ||
                    'Unspecified'}
                </span>
              </span>
            </div>

            <div>
              <span className="text-[#78877E] font-semibold uppercase tracking-wider block mb-1 font-heading text-[11px]">
                Internal Identifier
              </span>
              <span
                className="text-xs font-mono text-[#657169] truncate block"
                title={query.data.id}
              >
                {query.data.id}
              </span>
            </div>
          </div>
        </div>
      )}
    </AppShell>
  );
}
