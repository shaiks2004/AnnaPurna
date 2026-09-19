'use client';

import React, { useState } from 'react';
import { useParams } from 'next/navigation';
import Link from 'next/link';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Save, Loader2, ArrowLeft, Info } from 'lucide-react';
import { AppShell } from '@/components/layout/AppShell';
import { PageHeader, StatusNotification } from '@/components/ui/States';
import { getLocation, saveLocation, getLot, type ApiError } from '@/lib/api';

export default function LotLocationPage() {
  const params = useParams<{ id: string }>();
  const id = params?.id;
  const queryClient = useQueryClient();

  const [validationError, setValidationError] = useState<string | null>(null);
  const [notification, setNotification] = useState<{
    type: 'success' | 'error';
    message: string;
  } | null>(null);

  const lotQuery = useQuery({
    queryKey: ['lot', id],
    queryFn: () => getLot(id!),
    enabled: !!id,
  });

  const locationQuery = useQuery({
    queryKey: ['location', id],
    queryFn: () => getLocation(id!),
    enabled: !!id,
    retry: (count, err) => {
      if ((err as ApiError)?.status === 404) return false;
      return count < 2;
    },
  });

  const saveMutation = useMutation({
    mutationFn: (coords: [number, number]) => saveLocation(id!, coords),
    onSuccess: (saved) => {
      setNotification({
        type: 'success',
        message: `Origin coordinates saved successfully: [${saved.coordinates[0]}, ${saved.coordinates[1]}].`,
      });
      void queryClient.invalidateQueries({ queryKey: ['location', id] });
      void queryClient.invalidateQueries({ queryKey: ['passport', id] });
    },
    onError: (err) => {
      setNotification({
        type: 'error',
        message: err instanceof Error ? err.message : 'Failed to save location coordinates.',
      });
    },
  });

  const handleSave = (lat: number, lon: number) => {
    setValidationError(null);
    setNotification(null);

    if (isNaN(lat) || lat < -90 || lat > 90) {
      setValidationError('Latitude must be a valid number between -90.0 and 90.0 degrees.');
      return;
    }

    if (isNaN(lon) || lon < -180 || lon > 180) {
      setValidationError('Longitude must be a valid number between -180.0 and 180.0 degrees.');
      return;
    }

    // GeoJSON Point format: [longitude, latitude]
    saveMutation.mutate([lon, lat]);
  };

  return (
    <AppShell>
      <PageHeader
        title="Lot Origin Location"
        eyebrow="Geospatial Traceability (WGS84)"
        breadcrumbs={[
          { label: 'Dashboard', href: '/dashboard' },
          { label: 'Lots', href: '/lots' },
          { label: lotQuery.data?.lotNumber ?? id?.substring(0, 8) ?? 'Lot', href: `/lots/${id}` },
          { label: 'Location' },
        ]}
        actions={
          <Link
            href={`/lots/${id}`}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-md border border-stone-300 hover:bg-stone-50 text-stone-700 text-xs font-medium transition"
          >
            <ArrowLeft className="h-3.5 w-3.5" />
            <span>Lot Overview</span>
          </Link>
        }
      />

      {notification && (
        <StatusNotification type={notification.type} message={notification.message} />
      )}
      {validationError && <StatusNotification type="error" message={validationError} />}

      <div className="space-y-6 max-w-2xl">
        {/* Information Notice */}
        <div className="p-4 bg-emerald-50 border border-emerald-200 rounded-lg text-xs text-emerald-950 flex items-start gap-3">
          <Info className="h-5 w-5 text-emerald-800 shrink-0 mt-0.5" />
          <div className="leading-relaxed">
            <strong className="font-semibold block mb-0.5">
              PostGIS Geographic Point Specification
            </strong>
            <span>
              Coordinates are stored as a WGS84 (EPSG:4326) Point. Proximity calculations and
              geospatial matching algorithms use these coordinates to compute farm-to-mandi travel
              distances.
            </span>
          </div>
        </div>

        {/* Location Form */}
        <div className="bg-white rounded-lg border border-stone-200 shadow-2xs p-6 sm:p-8">
          <LocationForm
            key={
              locationQuery.data?.coordinates ? locationQuery.data.coordinates.join(',') : 'empty'
            }
            initialLon={
              locationQuery.data?.coordinates ? String(locationQuery.data.coordinates[0]) : ''
            }
            initialLat={
              locationQuery.data?.coordinates ? String(locationQuery.data.coordinates[1]) : ''
            }
            savedCoordinates={locationQuery.data?.coordinates}
            onSave={handleSave}
            isPending={saveMutation.isPending}
          />
        </div>
      </div>
    </AppShell>
  );
}

function LocationForm({
  initialLon,
  initialLat,
  savedCoordinates,
  onSave,
  isPending,
}: {
  initialLon: string;
  initialLat: string;
  savedCoordinates?: [number, number];
  onSave: (lat: number, lon: number) => void;
  isPending: boolean;
}) {
  const [latitude, setLatitude] = useState(initialLat);
  const [longitude, setLongitude] = useState(initialLon);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSave(Number(latitude), Number(longitude));
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-5">
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div>
          <label
            className="block text-xs font-semibold uppercase tracking-wider text-stone-600 mb-1"
            htmlFor="loc-lat"
          >
            Latitude (-90 to +90) *
          </label>
          <input
            id="loc-lat"
            type="number"
            step="any"
            min="-90"
            max="90"
            required
            value={latitude}
            onChange={(e) => setLatitude(e.target.value)}
            placeholder="e.g. 19.9975"
            className="w-full px-3 py-2 text-xs border border-stone-300 rounded-md focus:outline-none focus:ring-2 focus:ring-emerald-700/20 focus:border-emerald-700 text-stone-900 font-mono"
          />
        </div>

        <div>
          <label
            className="block text-xs font-semibold uppercase tracking-wider text-stone-600 mb-1"
            htmlFor="loc-lon"
          >
            Longitude (-180 to +180) *
          </label>
          <input
            id="loc-lon"
            type="number"
            step="any"
            min="-180"
            max="180"
            required
            value={longitude}
            onChange={(e) => setLongitude(e.target.value)}
            placeholder="e.g. 73.7898"
            className="w-full px-3 py-2 text-xs border border-stone-300 rounded-md focus:outline-none focus:ring-2 focus:ring-emerald-700/20 focus:border-emerald-700 text-stone-900 font-mono"
          />
        </div>
      </div>

      {savedCoordinates && (
        <div className="p-3 bg-stone-50 rounded border border-stone-200 text-xs text-stone-700 flex items-center justify-between">
          <span className="text-stone-500">Current Saved Coordinates:</span>
          <span className="font-mono font-semibold text-emerald-900">
            [{savedCoordinates[0]}, {savedCoordinates[1]}]
          </span>
        </div>
      )}

      <div className="pt-4 border-t border-stone-200 flex items-center justify-end gap-2.5">
        <button
          type="submit"
          disabled={isPending}
          className="inline-flex items-center gap-1.5 px-4 py-2 bg-[#0e4937] hover:bg-[#135f48] text-white text-xs font-medium rounded-md shadow-xs transition disabled:opacity-50"
        >
          {isPending ? (
            <Loader2 className="h-3.5 w-3.5 animate-spin" />
          ) : (
            <Save className="h-3.5 w-3.5" />
          )}
          <span>Save Origin Coordinates</span>
        </button>
      </div>
    </form>
  );
}
