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
            className="agri-btn-secondary"
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
        <div className="p-4 bg-[#EAF2E8] border border-[#B8D99F] rounded-lg text-xs text-[#123C2C] flex items-start gap-3">
          <Info className="h-5 w-5 text-[#17633F] shrink-0 mt-0.5" />
          <div className="leading-relaxed">
            <strong className="font-semibold block mb-0.5 font-heading">
              PostGIS Geographic Point Specification
            </strong>
            <span className="text-[#26332D]">
              Coordinates are stored as a WGS84 (EPSG:4326) Point. Proximity calculations and
              geospatial matching algorithms use these coordinates to compute farm-to-mandi travel
              distances.
            </span>
          </div>
        </div>

        {/* Location Form */}
        <div className="agri-card p-6 sm:p-8">
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
            className="block text-[11px] font-semibold uppercase tracking-wider text-[#657169] mb-1.5 font-heading"
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
            className="agri-input text-xs font-mono"
          />
        </div>

        <div>
          <label
            className="block text-[11px] font-semibold uppercase tracking-wider text-[#657169] mb-1.5 font-heading"
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
            className="agri-input text-xs font-mono"
          />
        </div>
      </div>

      {savedCoordinates && (
        <div className="p-3 bg-[#F8F9F6] rounded-md border border-[#DDE2DB] text-xs text-[#26332D] flex items-center justify-between">
          <span className="text-[#657169] font-medium">Current Saved Coordinates:</span>
          <span className="font-mono font-semibold text-[#123C2C]">
            [{savedCoordinates[0]}, {savedCoordinates[1]}]
          </span>
        </div>
      )}

      <div className="pt-4 border-t border-[#DDE2DB] flex items-center justify-end gap-2.5">
        <button
          type="submit"
          disabled={isPending}
          className="agri-btn-primary"
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
