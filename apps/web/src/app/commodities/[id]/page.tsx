'use client';

import React, { useState } from 'react';
import { useParams } from 'next/navigation';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Leaf, Edit2, Loader2, Save, X } from 'lucide-react';
import { AppShell } from '@/components/layout/AppShell';
import {
  PageHeader,
  LoadingState,
  ErrorState,
  Badge,
  StatusNotification,
} from '@/components/ui/States';
import { getCommodity, updateCommodity, type CommodityPatchRequest } from '@/lib/api';
import { useAuth } from '@/lib/auth';

export default function CommodityDetailPage() {
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
  const [editCode, setEditCode] = useState('');
  const [editActive, setEditActive] = useState(true);

  const query = useQuery({
    queryKey: ['commodity', id],
    queryFn: () => getCommodity(id!),
    enabled: !!id,
  });

  const updateMutation = useMutation({
    mutationFn: (payload: CommodityPatchRequest) => updateCommodity(id!, payload),
    onSuccess: (updated) => {
      setIsEditing(false);
      setNotification({
        type: 'success',
        message: `Commodity "${updated.name}" updated successfully.`,
      });
      void queryClient.invalidateQueries({ queryKey: ['commodity', id] });
      void queryClient.invalidateQueries({ queryKey: ['commodities'] });
    },
    onError: (err) => {
      setNotification({
        type: 'error',
        message: err instanceof Error ? err.message : 'Failed to update commodity.',
      });
    },
  });

  const startEditing = () => {
    if (query.data) {
      setEditName(query.data.name);
      setEditCode(query.data.commodityCode ?? '');
      setEditActive(query.data.active);
      setIsEditing(true);
      setNotification(null);
    }
  };

  const handleUpdateSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    updateMutation.mutate({
      name: editName.trim() || undefined,
      commodityCode: editCode.trim() || null,
      active: editActive,
    });
  };

  return (
    <AppShell>
      <PageHeader
        title={query.data ? query.data.name : 'Commodity Details'}
        eyebrow="Market Intelligence Catalog"
        breadcrumbs={[
          { label: 'Dashboard', href: '/dashboard' },
          { label: 'Commodities', href: '/commodities' },
          { label: query.data ? query.data.name : (id?.substring(0, 8) ?? 'Details') },
        ]}
        actions={
          isAdmin &&
          !isEditing &&
          query.data && (
            <button
              onClick={startEditing}
              className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-md bg-stone-800 hover:bg-stone-900 text-white text-xs font-medium shadow-xs transition"
            >
              <Edit2 className="h-3.5 w-3.5" />
              <span>Edit Commodity</span>
            </button>
          )
        }
      />

      {notification && (
        <StatusNotification type={notification.type} message={notification.message} />
      )}

      {query.isLoading ? (
        <LoadingState message="Loading commodity specifications..." />
      ) : query.error ? (
        <ErrorState error={query.error} onRetry={() => query.refetch()} />
      ) : !query.data ? (
        <ErrorState error={new Error('Commodity not found')} />
      ) : isEditing ? (
        /* Edit Form */
        <div className="bg-white rounded-lg border border-stone-200 shadow-2xs p-6 max-w-2xl">
          <div className="flex items-center justify-between pb-4 mb-4 border-b border-stone-200">
            <h2 className="text-sm font-semibold text-stone-900">Edit Commodity Record</h2>
            <button
              onClick={() => setIsEditing(false)}
              className="text-stone-400 hover:text-stone-700 p-1 rounded"
              aria-label="Cancel editing"
            >
              <X className="h-4 w-4" />
            </button>
          </div>

          <form onSubmit={handleUpdateSubmit} className="space-y-4">
            <div>
              <label
                className="block text-xs font-semibold uppercase tracking-wider text-stone-600 mb-1"
                htmlFor="edit-name"
              >
                Commodity Name
              </label>
              <input
                id="edit-name"
                type="text"
                required
                value={editName}
                onChange={(e) => setEditName(e.target.value)}
                className="w-full px-3 py-2 text-xs border border-stone-300 rounded-md focus:outline-none focus:ring-2 focus:ring-emerald-700/20 focus:border-emerald-700 text-stone-900"
              />
            </div>

            <div>
              <label
                className="block text-xs font-semibold uppercase tracking-wider text-stone-600 mb-1"
                htmlFor="edit-code"
              >
                Commodity Code
              </label>
              <input
                id="edit-code"
                type="text"
                value={editCode}
                onChange={(e) => setEditCode(e.target.value)}
                className="w-full px-3 py-2 text-xs border border-stone-300 rounded-md focus:outline-none focus:ring-2 focus:ring-emerald-700/20 focus:border-emerald-700 text-stone-900 font-mono"
              />
            </div>

            <div className="flex items-center gap-2 pt-1">
              <input
                id="edit-active"
                type="checkbox"
                checked={editActive}
                onChange={(e) => setEditActive(e.target.checked)}
                className="h-4 w-4 text-emerald-800 rounded border-stone-300 focus:ring-emerald-700"
              />
              <label htmlFor="edit-active" className="text-xs font-medium text-stone-700">
                Active in trade catalog
              </label>
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
              <Leaf className="h-6 w-6" />
            </div>
            <div>
              <div className="flex items-center gap-2 mb-1">
                <h2 className="text-xl font-semibold text-stone-900">{query.data.name}</h2>
                <Badge variant={query.data.active ? 'success' : 'default'}>
                  {query.data.active ? 'Active' : 'Inactive'}
                </Badge>
              </div>
              <p className="text-xs text-stone-500 font-mono">ID: {query.data.id}</p>
            </div>
          </div>

          <div className="p-6 grid grid-cols-1 sm:grid-cols-2 gap-6 text-xs">
            <div>
              <span className="text-stone-400 font-semibold uppercase tracking-wider block mb-1">
                Commodity Code
              </span>
              <span className="text-sm font-mono font-medium text-stone-800">
                {query.data.commodityCode ?? 'Not Assigned'}
              </span>
            </div>

            <div>
              <span className="text-stone-400 font-semibold uppercase tracking-wider block mb-1">
                Trading Status
              </span>
              <span className="text-sm font-medium text-stone-800">
                {query.data.active
                  ? 'Available for trade lots & requirements'
                  : 'Suspended / Inactive'}
              </span>
            </div>
          </div>
        </div>
      )}
    </AppShell>
  );
}
