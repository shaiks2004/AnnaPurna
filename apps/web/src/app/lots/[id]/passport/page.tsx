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
              className="agri-btn-secondary"
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
          <div className="bg-gradient-to-r from-[#123C2C] to-[#17633F] text-white rounded-lg p-6 sm:p-8 shadow-sm flex flex-col sm:flex-row sm:items-center justify-between gap-6 border border-[#B8D99F]/30">
            <div className="flex items-start gap-4">
              <div className="p-3.5 bg-[#0B261C] rounded-full border border-[#B8D99F]/40 text-[#B8D99F] shrink-0">
                <ShieldCheck className="h-8 w-8" />
              </div>
              <div>
                <span className="text-[10px] font-semibold uppercase tracking-widest text-[#B8D99F] block font-heading">
                  Official Lot Traceability Passport
                </span>
                <h2 className="text-2xl sm:text-3xl font-bold tracking-tight mt-0.5 font-heading font-mono text-white">
                  {query.data.lot.lotNumber}
                </h2>
                <div className="flex items-center gap-3 mt-2 flex-wrap text-xs text-[#EAF2E8]">
                  <span className="font-semibold font-heading">
                    {query.data.lot.quantity} {query.data.lot.quantityUnit}
                  </span>
                  <span>·</span>
                  <span className="flex items-center gap-1 font-mono text-[11px] text-[#B8D99F]">
                    <Lock className="h-3 w-3" />
                    <span>ID: {query.data.lotId.substring(0, 18)}...</span>
                  </span>
                </div>
              </div>
            </div>

            <div className="flex flex-col sm:items-end">
              <span className="text-[11px] text-[#B8D99F] uppercase tracking-wider mb-1.5 font-heading font-medium">
                Verification Status
              </span>
              <span
                className={`px-3.5 py-1.5 rounded text-xs font-bold uppercase tracking-wider border font-heading ${
                  query.data.lot.status === 'VERIFIED'
                    ? 'bg-[#17633F] text-[#EAF2E8] border-[#B8D99F]'
                    : 'bg-[#5C3D10] text-[#FDF3D6] border-[#E8B931]'
                }`}
              >
                {query.data.lot.status}
              </span>
            </div>
          </div>

          {/* Section 1: Origin & Supplier Traceability */}
          <div className="agri-card overflow-hidden">
            <div className="px-5 py-3.5 border-b border-[#DDE2DB] bg-[#F8F9F6] flex items-center gap-2">
              <Building className="h-4 w-4 text-[#17633F]" />
              <h3 className="text-xs font-semibold uppercase tracking-wider text-[#123C2C] font-heading">
                1. Origin & Supplier Custody
              </h3>
            </div>
            <div className="p-5 grid grid-cols-1 sm:grid-cols-3 gap-5 text-xs">
              <div>
                <span className="text-[#78877E] font-semibold uppercase tracking-wider block mb-1 font-heading text-[11px]">
                  Supplier Model
                </span>
                <span className="text-sm font-semibold text-[#26332D] flex items-center gap-1.5">
                  {query.data.supplierType === 'ORGANIZATION' ? (
                    <Building className="h-3.5 w-3.5 text-[#17633F]" />
                  ) : (
                    <User className="h-3.5 w-3.5 text-[#17633F]" />
                  )}
                  <span>{query.data.supplierType}</span>
                </span>
              </div>

              <div>
                <span className="text-[#78877E] font-semibold uppercase tracking-wider block mb-1 font-heading text-[11px]">
                  Supplier Entity ID
                </span>
                <span
                  className="text-xs font-mono font-medium text-[#26332D] block truncate"
                  title={query.data.supplierId}
                >
                  {query.data.supplierId}
                </span>
              </div>

              <div>
                <span className="text-[#78877E] font-semibold uppercase tracking-wider block mb-1 font-heading text-[11px]">
                  Commodity Reference
                </span>
                <span
                  className="text-xs font-mono font-medium text-[#26332D] block truncate"
                  title={query.data.lot.commodityId}
                >
                  {query.data.lot.commodityId}
                </span>
              </div>

              <div>
                <span className="text-[#78877E] font-semibold uppercase tracking-wider block mb-1 font-heading text-[11px]">
                  Harvest Timeline
                </span>
                <span className="text-xs font-medium text-[#26332D] flex items-center gap-1.5">
                  <Calendar className="h-4 w-4 text-[#17633F]" />
                  <span>{query.data.lot.harvestDate ?? 'Unspecified'}</span>
                </span>
              </div>

              <div>
                <span className="text-[#78877E] font-semibold uppercase tracking-wider block mb-1 font-heading text-[11px]">
                  Availability Window
                </span>
                <span className="text-xs font-medium text-[#26332D] flex items-center gap-1.5">
                  <Calendar className="h-4 w-4 text-[#17633F]" />
                  <span>{query.data.lot.availableFrom ?? 'Immediate'}</span>
                </span>
              </div>

              <div>
                <span className="text-[#78877E] font-semibold uppercase tracking-wider block mb-1 font-heading text-[11px]">
                  Source Supply
                </span>
                <span className="text-xs font-mono text-[#657169] block truncate">
                  {query.data.lot.sourceSupplyId ?? 'Direct Declaration'}
                </span>
              </div>
            </div>
          </div>

          {/* Section 2: Origin GPS Coordinates */}
          <div className="agri-card overflow-hidden">
            <div className="px-5 py-3.5 border-b border-[#DDE2DB] bg-[#F8F9F6] flex items-center justify-between">
              <div className="flex items-center gap-2">
                <MapPin className="h-4 w-4 text-[#17633F]" />
                <h3 className="text-xs font-semibold uppercase tracking-wider text-[#123C2C] font-heading">
                  2. Origin GPS Location (WGS84)
                </h3>
              </div>
              <Link
                href={`/lots/${id}/location`}
                className="text-xs text-[#17633F] hover:text-[#123C2C] font-semibold transition"
              >
                Manage location
              </Link>
            </div>
            <div className="p-5 text-xs">
              {query.data.location ? (
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                  <div className="bg-[#F8F9F6] p-3 rounded-md border border-[#DDE2DB]">
                    <span className="text-[#78877E] font-semibold block mb-0.5 font-heading text-[11px] uppercase tracking-wider">Geometry Type</span>
                    <span className="font-semibold text-[#123C2C]">{query.data.location.type}</span>
                  </div>
                  <div className="bg-[#F8F9F6] p-3 rounded-md border border-[#DDE2DB]">
                    <span className="text-[#78877E] font-semibold block mb-0.5 font-heading text-[11px] uppercase tracking-wider">Longitude (X)</span>
                    <span className="font-mono font-semibold text-[#123C2C]">
                      {query.data.location.coordinates[0]}
                    </span>
                  </div>
                  <div className="bg-[#F8F9F6] p-3 rounded-md border border-[#DDE2DB]">
                    <span className="text-[#78877E] font-semibold block mb-0.5 font-heading text-[11px] uppercase tracking-wider">Latitude (Y)</span>
                    <span className="font-mono font-semibold text-[#123C2C]">
                      {query.data.location.coordinates[1]}
                    </span>
                  </div>
                </div>
              ) : (
                <p className="text-[#78877E] italic">
                  No GPS coordinates recorded for this lot yet.
                </p>
              )}
            </div>
          </div>

          {/* Section 3: Verified Quality Evidence */}
          <div className="agri-card overflow-hidden">
            <div className="px-5 py-3.5 border-b border-[#DDE2DB] bg-[#F8F9F6] flex items-center justify-between">
              <div className="flex items-center gap-2">
                <FlaskConical className="h-4 w-4 text-[#17633F]" />
                <h3 className="text-xs font-semibold uppercase tracking-wider text-[#123C2C] font-heading">
                  3. Quality Tests & Inspection
                </h3>
              </div>
              <Link
                href={`/lots/${id}/quality`}
                className="text-xs text-[#17633F] hover:text-[#123C2C] font-semibold transition"
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
                          ? 'bg-[#EAF2E8]/60 border-[#B8D99F]'
                          : 'bg-[#F8F9F6] border-[#DDE2DB]'
                      }`}
                    >
                      <div className="flex items-center justify-between flex-wrap gap-2 mb-2">
                        <div className="flex items-center gap-2">
                          <span className="font-semibold text-[#123C2C] text-sm font-heading">
                            {test.testType}
                          </span>
                          <Badge variant={test.status === 'VERIFIED' ? 'success' : 'default'}>
                            {test.status}
                          </Badge>
                        </div>
                        {test.verifiedAt && (
                          <span className="text-[11px] text-[#17633F] font-semibold flex items-center gap-1 font-heading">
                            <CheckCircle2 className="h-3.5 w-3.5 text-[#17633F]" />
                            <span>
                              Verified on {new Date(test.verifiedAt).toLocaleDateString()}
                            </span>
                          </span>
                        )}
                      </div>
                      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-[#657169] text-[11px] mt-2">
                        <div>
                          Method: <strong className="text-[#26332D] font-mono">{test.methodCode}</strong>
                        </div>
                        <div>
                          Source:{' '}
                          <strong className="text-[#26332D] font-mono">{test.sourceCode ?? 'Lab'}</strong>
                        </div>
                        <div>
                          Inspector ID:{' '}
                          <span className="font-mono text-[#657169]">
                            {test.inspectorUserId?.substring(0, 8) ?? '—'}
                          </span>
                        </div>
                      </div>
                      {test.notes && (
                        <p className="mt-2 text-[#657169] italic text-[11px]">{test.notes}</p>
                      )}
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-[#78877E] italic">No quality tests recorded yet.</p>
              )}
            </div>
          </div>

          {/* Section 4: Document Metadata Records */}
          <div className="agri-card overflow-hidden">
            <div className="px-5 py-3.5 border-b border-[#DDE2DB] bg-[#F8F9F6] flex items-center justify-between">
              <div className="flex items-center gap-2">
                <FileText className="h-4 w-4 text-[#17633F]" />
                <h3 className="text-xs font-semibold uppercase tracking-wider text-[#123C2C] font-heading">
                  4. Attached Verifiable Document Records
                </h3>
              </div>
              <Link
                href={`/lots/${id}/documents`}
                className="text-xs text-[#17633F] hover:text-[#123C2C] font-semibold transition"
              >
                Manage documents
              </Link>
            </div>
            <div className="p-5 text-xs">
              {query.data.documents?.length ? (
                <div className="divide-y divide-[#E6EBE4]">
                  {query.data.documents.map((doc: LotDocument) => (
                    <div key={doc.id} className="py-2.5 flex items-center justify-between text-xs">
                      <div>
                        <strong className="text-[#123C2C] block font-medium font-heading">
                          {doc.documentTypeCode}
                        </strong>
                        <span className="text-[11px] text-[#657169] font-mono">
                          Ref: {doc.storageReference}{' '}
                          {doc.originalFilename ? `(${doc.originalFilename})` : ''}
                        </span>
                      </div>
                      <span className="text-[10px] text-[#78877E] font-mono">
                        {doc.createdAt?.split('T')[0]}
                      </span>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-[#78877E] italic">No document metadata records attached.</p>
              )}
            </div>
          </div>
        </div>
      )}
    </AppShell>
  );
}
