'use client';

import React from 'react';
import { useParams } from 'next/navigation';
import Link from 'next/link';
import { useQuery } from '@tanstack/react-query';
import {
  ShieldCheck,
  MapPin,
  FileText,
  FlaskConical,
  CheckCircle2,
  Calendar,
  Building,
  User,
  ArrowLeft,
  Lock,
} from 'lucide-react';
import { AppShell } from '@/components/layout/AppShell';
import { PageHeader, LoadingState, ErrorState, Badge } from '@/components/ui/States';
import { getPassport, type QualityTest, type LotDocument } from '@/lib/api';

export default function LotPassportPage() {
  const params = useParams<{ id: string }>();
  const id = params?.id;

  const query = useQuery({
    queryKey: ['passport', id],
    queryFn: () => getPassport(id!),
    enabled: !!id,
  });

  return (
    <AppShell>
      <PageHeader
        title="Lot Traceability Passport"
        eyebrow="Immutable Verification Record"
        breadcrumbs={[
          { label: 'Dashboard', href: '/dashboard' },
          { label: 'Lots', href: '/lots' },
          { label: query.data?.lot.lotNumber ?? id?.substring(0, 8) ?? 'Lot', href: `/lots/${id}` },
          { label: 'Passport' },
        ]}
        actions={
          <div className="flex items-center gap-2">
            <Link
              href={`/lots/${id}`}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-md border border-stone-300 hover:bg-stone-50 text-stone-700 text-xs font-medium transition"
            >
              <ArrowLeft className="h-3.5 w-3.5" />
              <span>Back to Lot</span>
            </Link>
          </div>
        }
      />

      {query.isLoading ? (
        <LoadingState message="Generating verified lot passport from live backend..." />
      ) : query.error ? (
        <ErrorState error={query.error} onRetry={() => query.refetch()} />
      ) : !query.data ? (
        <ErrorState error={new Error('Passport data not available for this lot')} />
      ) : (
        <div className="space-y-6 max-w-4xl">
          {/* Passport Header Seal */}
          <div className="bg-gradient-to-r from-[#0e4937] to-[#135f48] text-white rounded-lg p-6 sm:p-8 shadow-sm flex flex-col sm:flex-row sm:items-center justify-between gap-6 border border-emerald-800">
            <div className="flex items-start gap-4">
              <div className="p-3.5 bg-emerald-950/80 rounded-full border border-emerald-400 text-amber-300 shrink-0">
                <ShieldCheck className="h-8 w-8" />
              </div>
              <div>
                <span className="text-[10px] font-semibold uppercase tracking-widest text-emerald-300 block">
                  Official Lot Passport
                </span>
                <h2 className="text-2xl sm:text-3xl font-serif font-bold tracking-tight mt-0.5 font-mono">
                  {query.data.lot.lotNumber}
                </h2>
                <div className="flex items-center gap-3 mt-2 flex-wrap text-xs text-emerald-100">
                  <span className="font-semibold">
                    {query.data.lot.quantity} {query.data.lot.quantityUnit}
                  </span>
                  <span>·</span>
                  <span className="flex items-center gap-1 font-mono text-[11px]">
                    <Lock className="h-3 w-3" />
                    <span>ID: {query.data.lotId.substring(0, 18)}...</span>
                  </span>
                </div>
              </div>
            </div>

            <div className="flex flex-col sm:items-end">
              <span className="text-[11px] text-emerald-300 uppercase tracking-wider mb-1">
                Status Verification
              </span>
              <span
                className={`px-3 py-1 rounded text-xs font-bold uppercase tracking-wider border ${
                  query.data.lot.status === 'VERIFIED'
                    ? 'bg-emerald-900/80 text-emerald-200 border-emerald-400'
                    : 'bg-amber-950/80 text-amber-200 border-amber-400'
                }`}
              >
                {query.data.lot.status}
              </span>
            </div>
          </div>

          {/* Section 1: Origin & Supplier Traceability */}
          <div className="bg-white rounded-lg border border-stone-200 shadow-2xs overflow-hidden">
            <div className="px-5 py-3.5 border-b border-stone-200 bg-stone-50/50 flex items-center gap-2">
              <Building className="h-4 w-4 text-emerald-800" />
              <h3 className="text-xs font-semibold uppercase tracking-wider text-stone-900">
                1. Origin & Supplier Custody
              </h3>
            </div>
            <div className="p-5 grid grid-cols-1 sm:grid-cols-3 gap-5 text-xs">
              <div>
                <span className="text-stone-400 font-semibold uppercase tracking-wider block mb-1">
                  Supplier Model
                </span>
                <span className="text-sm font-semibold text-stone-800 flex items-center gap-1.5">
                  {query.data.supplierType === 'ORGANIZATION' ? (
                    <Building className="h-3.5 w-3.5 text-stone-500" />
                  ) : (
                    <User className="h-3.5 w-3.5 text-stone-500" />
                  )}
                  <span>{query.data.supplierType}</span>
                </span>
              </div>

              <div>
                <span className="text-stone-400 font-semibold uppercase tracking-wider block mb-1">
                  Supplier Entity ID
                </span>
                <span
                  className="text-xs font-mono font-medium text-stone-800 block truncate"
                  title={query.data.supplierId}
                >
                  {query.data.supplierId}
                </span>
              </div>

              <div>
                <span className="text-stone-400 font-semibold uppercase tracking-wider block mb-1">
                  Commodity Reference
                </span>
                <span
                  className="text-xs font-mono font-medium text-stone-800 block truncate"
                  title={query.data.lot.commodityId}
                >
                  {query.data.lot.commodityId}
                </span>
              </div>

              <div>
                <span className="text-stone-400 font-semibold uppercase tracking-wider block mb-1">
                  Harvest Timeline
                </span>
                <span className="text-xs font-medium text-stone-800 flex items-center gap-1">
                  <Calendar className="h-3.5 w-3.5 text-stone-500" />
                  <span>{query.data.lot.harvestDate ?? 'Unspecified'}</span>
                </span>
              </div>

              <div>
                <span className="text-stone-400 font-semibold uppercase tracking-wider block mb-1">
                  Availability Window
                </span>
                <span className="text-xs font-medium text-stone-800 flex items-center gap-1">
                  <Calendar className="h-3.5 w-3.5 text-stone-500" />
                  <span>{query.data.lot.availableFrom ?? 'Immediate'}</span>
                </span>
              </div>

              <div>
                <span className="text-stone-400 font-semibold uppercase tracking-wider block mb-1">
                  Source Supply
                </span>
                <span className="text-xs font-mono text-stone-600 block truncate">
                  {query.data.lot.sourceSupplyId ?? 'Direct Declaration'}
                </span>
              </div>
            </div>
          </div>

          {/* Section 2: Origin GPS Coordinates */}
          <div className="bg-white rounded-lg border border-stone-200 shadow-2xs overflow-hidden">
            <div className="px-5 py-3.5 border-b border-stone-200 bg-stone-50/50 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <MapPin className="h-4 w-4 text-emerald-800" />
                <h3 className="text-xs font-semibold uppercase tracking-wider text-stone-900">
                  2. Origin GPS Location (WGS84)
                </h3>
              </div>
              <Link
                href={`/lots/${id}/location`}
                className="text-xs text-emerald-800 hover:text-emerald-950 font-medium"
              >
                Manage location
              </Link>
            </div>
            <div className="p-5 text-xs">
              {query.data.location ? (
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                  <div className="bg-stone-50 p-3 rounded border border-stone-200">
                    <span className="text-stone-500 font-medium block mb-0.5">Geometry Type</span>
                    <span className="font-semibold text-stone-900">{query.data.location.type}</span>
                  </div>
                  <div className="bg-stone-50 p-3 rounded border border-stone-200">
                    <span className="text-stone-500 font-medium block mb-0.5">Longitude (X)</span>
                    <span className="font-mono font-semibold text-stone-900">
                      {query.data.location.coordinates[0]}
                    </span>
                  </div>
                  <div className="bg-stone-50 p-3 rounded border border-stone-200">
                    <span className="text-stone-500 font-medium block mb-0.5">Latitude (Y)</span>
                    <span className="font-mono font-semibold text-stone-900">
                      {query.data.location.coordinates[1]}
                    </span>
                  </div>
                </div>
              ) : (
                <p className="text-stone-500 italic">
                  No GPS coordinates recorded for this lot yet.
                </p>
              )}
            </div>
          </div>

          {/* Section 3: Verified Quality Evidence */}
          <div className="bg-white rounded-lg border border-stone-200 shadow-2xs overflow-hidden">
            <div className="px-5 py-3.5 border-b border-stone-200 bg-stone-50/50 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <FlaskConical className="h-4 w-4 text-emerald-800" />
                <h3 className="text-xs font-semibold uppercase tracking-wider text-stone-900">
                  3. Quality Tests & Inspection
                </h3>
              </div>
              <Link
                href={`/lots/${id}/quality`}
                className="text-xs text-emerald-800 hover:text-emerald-950 font-medium"
              >
                All quality tests
              </Link>
            </div>
            <div className="p-5 text-xs">
              {query.data.tests?.length ? (
                <div className="space-y-4">
                  {query.data.tests.map((test: QualityTest) => (
                    <div
                      key={test.id}
                      className={`p-4 rounded-md border ${
                        test.status === 'VERIFIED'
                          ? 'bg-emerald-50/40 border-emerald-200'
                          : 'bg-stone-50 border-stone-200'
                      }`}
                    >
                      <div className="flex items-center justify-between flex-wrap gap-2 mb-2">
                        <div className="flex items-center gap-2">
                          <span className="font-semibold text-stone-900 text-sm">
                            {test.testType}
                          </span>
                          <Badge variant={test.status === 'VERIFIED' ? 'success' : 'default'}>
                            {test.status}
                          </Badge>
                        </div>
                        {test.verifiedAt && (
                          <span className="text-[11px] text-emerald-800 font-medium flex items-center gap-1">
                            <CheckCircle2 className="h-3.5 w-3.5 text-emerald-600" />
                            <span>
                              Verified on {new Date(test.verifiedAt).toLocaleDateString()}
                            </span>
                          </span>
                        )}
                      </div>
                      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-stone-600 text-[11px] mt-2">
                        <div>
                          Method: <strong className="text-stone-800">{test.methodCode}</strong>
                        </div>
                        <div>
                          Source:{' '}
                          <strong className="text-stone-800">{test.sourceCode ?? 'Lab'}</strong>
                        </div>
                        <div>
                          Inspector ID:{' '}
                          <span className="font-mono text-stone-700">
                            {test.inspectorUserId?.substring(0, 8) ?? '—'}
                          </span>
                        </div>
                      </div>
                      {test.notes && (
                        <p className="mt-2 text-stone-500 italic text-[11px]">{test.notes}</p>
                      )}
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-stone-500 italic">No quality tests recorded yet.</p>
              )}
            </div>
          </div>

          {/* Section 4: Document Metadata Records */}
          <div className="bg-white rounded-lg border border-stone-200 shadow-2xs overflow-hidden">
            <div className="px-5 py-3.5 border-b border-stone-200 bg-stone-50/50 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <FileText className="h-4 w-4 text-emerald-800" />
                <h3 className="text-xs font-semibold uppercase tracking-wider text-stone-900">
                  4. Attached Verifiable Document Records
                </h3>
              </div>
              <Link
                href={`/lots/${id}/documents`}
                className="text-xs text-emerald-800 hover:text-emerald-950 font-medium"
              >
                Manage documents
              </Link>
            </div>
            <div className="p-5 text-xs">
              {query.data.documents?.length ? (
                <div className="divide-y divide-stone-100">
                  {query.data.documents.map((doc: LotDocument) => (
                    <div key={doc.id} className="py-2.5 flex items-center justify-between text-xs">
                      <div>
                        <strong className="text-stone-900 block font-medium">
                          {doc.documentTypeCode}
                        </strong>
                        <span className="text-[11px] text-stone-500 font-mono">
                          Ref: {doc.storageReference}{' '}
                          {doc.originalFilename ? `(${doc.originalFilename})` : ''}
                        </span>
                      </div>
                      <span className="text-[10px] text-stone-400 font-mono">
                        {doc.createdAt?.split('T')[0]}
                      </span>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-stone-500 italic">No document metadata records attached.</p>
              )}
            </div>
          </div>
        </div>
      )}
    </AppShell>
  );
}
