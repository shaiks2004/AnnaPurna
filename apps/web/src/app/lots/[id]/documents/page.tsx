'use client';

import React, { useState } from 'react';
import { useParams } from 'next/navigation';
import Link from 'next/link';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { FileText, Plus, Loader2, ArrowLeft, Info } from 'lucide-react';
import { AppShell } from '@/components/layout/AppShell';
import {
  PageHeader,
  LoadingState,
  ErrorState,
  EmptyState,
  StatusNotification,
} from '@/components/ui/States';
import { Modal } from '@/components/ui/Modal';
import {
  listDocuments,
  createDocument,
  getLot,
  type LotDocument,
  type LotDocumentCreateRequest,
} from '@/lib/api';

export default function LotDocumentsPage() {
  const params = useParams<{ id: string }>();
  const id = params?.id;
  const queryClient = useQueryClient();

  const [modalOpen, setModalOpen] = useState(false);
  const [notification, setNotification] = useState<{
    type: 'success' | 'error';
    message: string;
  } | null>(null);

  // Form state
  const [docType, setDocType] = useState('ORGANIC_CERTIFICATE');
  const [storageRef, setStorageRef] = useState('s3://annapurna-vault/lots/org-cert-001.pdf');
  const [filename, setFilename] = useState('organic_audit_2026.pdf');
  const [contentType, setContentType] = useState('application/pdf');
  const [checksum, setChecksum] = useState(
    'sha256:e3b0c44298fc1c149afbf4c8996fb92427ae41e4649b934ca495991b7852b855',
  );

  const lotQuery = useQuery({
    queryKey: ['lot', id],
    queryFn: () => getLot(id!),
    enabled: !!id,
  });

  const query = useQuery({
    queryKey: ['documents', id],
    queryFn: () => listDocuments(id!),
    enabled: !!id,
  });

  const createMutation = useMutation({
    mutationFn: (payload: LotDocumentCreateRequest) => createDocument(id!, payload),
    onSuccess: (doc) => {
      setModalOpen(false);
      setNotification({
        type: 'success',
        message: `Document metadata for "${doc.documentTypeCode}" added successfully.`,
      });
      void queryClient.invalidateQueries({ queryKey: ['documents', id] });
      void queryClient.invalidateQueries({ queryKey: ['passport', id] });
    },
    onError: (err) => {
      setNotification({
        type: 'error',
        message: err instanceof Error ? err.message : 'Failed to attach document metadata.',
      });
    },
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    createMutation.mutate({
      documentTypeCode: docType.trim(),
      storageReference: storageRef.trim(),
      originalFilename: filename.trim() || null,
      contentType: contentType.trim() || null,
      checksum: checksum.trim() || null,
    });
  };

  return (
    <AppShell>
      <PageHeader
        title="Attached Document Records"
        eyebrow="Lot Verification & Compliance"
        breadcrumbs={[
          { label: 'Dashboard', href: '/dashboard' },
          { label: 'Lots', href: '/lots' },
          { label: lotQuery.data?.lotNumber ?? id?.substring(0, 8) ?? 'Lot', href: `/lots/${id}` },
          { label: 'Documents' },
        ]}
        actions={
          <div className="flex items-center gap-2">
            <Link
              href={`/lots/${id}`}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-md border border-stone-300 hover:bg-stone-50 text-stone-700 text-xs font-medium transition"
            >
              <ArrowLeft className="h-3.5 w-3.5" />
              <span>Lot Overview</span>
            </Link>
            <button
              onClick={() => {
                setNotification(null);
                setModalOpen(true);
              }}
              className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-md bg-[#0e4937] hover:bg-[#135f48] text-white text-xs font-medium shadow-xs transition"
            >
              <Plus className="h-4 w-4" />
              <span>Attach Document Metadata</span>
            </button>
          </div>
        }
      />

      {notification && (
        <StatusNotification type={notification.type} message={notification.message} />
      )}

      <div className="space-y-6 max-w-4xl">
        {/* Compliance info banner */}
        <div className="p-4 bg-stone-50 border border-stone-200 rounded-lg text-xs text-stone-700 flex items-start gap-3">
          <Info className="h-5 w-5 text-stone-500 shrink-0 mt-0.5" />
          <div className="leading-relaxed">
            <strong className="font-semibold block mb-0.5 text-stone-900">
              Verifiable Metadata Storage
            </strong>
            <span>
              The backend stores cryptographic hashes, document type codes, and storage references
              for audits and passport verification. File bytes reside in external object storage.
            </span>
          </div>
        </div>

        {/* Documents Table */}
        <div className="bg-white rounded-lg border border-stone-200 shadow-2xs overflow-hidden">
          {query.isLoading ? (
            <LoadingState message="Fetching attached document records..." />
          ) : query.error ? (
            <div className="p-6">
              <ErrorState error={query.error} onRetry={() => query.refetch()} />
            </div>
          ) : !query.data?.length ? (
            <div className="p-8">
              <EmptyState
                title="No documents attached"
                description="No verifiable document records or certificates have been attached to this lot."
                action={
                  <button
                    onClick={() => setModalOpen(true)}
                    className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-md bg-[#0e4937] hover:bg-[#135f48] text-white text-xs font-medium transition"
                  >
                    <Plus className="h-4 w-4" />
                    <span>Attach Certificate Record</span>
                  </button>
                }
              />
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs border-collapse">
                <thead>
                  <tr className="border-b border-stone-200 bg-stone-50/50 text-stone-600">
                    <th className="py-3 px-4 font-semibold uppercase tracking-wider">
                      Document Type
                    </th>
                    <th className="py-3 px-4 font-semibold uppercase tracking-wider">
                      Storage Reference
                    </th>
                    <th className="py-3 px-4 font-semibold uppercase tracking-wider">
                      Original Filename
                    </th>
                    <th className="py-3 px-4 font-semibold uppercase tracking-wider">Checksum</th>
                    <th className="py-3 px-4 font-semibold uppercase tracking-wider">Created</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-stone-100">
                  {query.data.map((doc: LotDocument) => (
                    <tr key={doc.id} className="hover:bg-stone-50/60 transition">
                      <td className="py-3.5 px-4 font-medium text-stone-900 flex items-center gap-2">
                        <FileText className="h-4 w-4 text-emerald-700" />
                        <span>{doc.documentTypeCode}</span>
                      </td>
                      <td
                        className="py-3.5 px-4 font-mono text-[11px] text-stone-700 max-w-xs truncate"
                        title={doc.storageReference}
                      >
                        {doc.storageReference}
                      </td>
                      <td className="py-3.5 px-4 text-stone-700">{doc.originalFilename ?? '—'}</td>
                      <td
                        className="py-3.5 px-4 font-mono text-[10px] text-stone-500 max-w-[150px] truncate"
                        title={doc.checksum ?? ''}
                      >
                        {doc.checksum ?? '—'}
                      </td>
                      <td className="py-3.5 px-4 text-stone-500 text-[11px]">
                        {doc.createdAt?.split('T')[0]}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>

      {/* Attach Document Modal */}
      <Modal
        isOpen={modalOpen}
        onClose={() => setModalOpen(false)}
        title="Attach Document Record"
        subtitle="Provide safe metadata and storage reference for audit trail"
      >
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label
              className="block text-xs font-semibold uppercase tracking-wider text-stone-600 mb-1"
              htmlFor="doc-type"
            >
              Document Type Code *
            </label>
            <input
              id="doc-type"
              type="text"
              required
              value={docType}
              onChange={(e) => setDocType(e.target.value)}
              placeholder="e.g. ORGANIC_CERTIFICATE / APMC_RECEIPT / PHYTO_CERT"
              className="w-full px-3 py-2 text-xs border border-stone-300 rounded-md focus:outline-none focus:ring-2 focus:ring-emerald-700/20 focus:border-emerald-700 text-stone-900 font-mono"
            />
          </div>

          <div>
            <label
              className="block text-xs font-semibold uppercase tracking-wider text-stone-600 mb-1"
              htmlFor="doc-ref"
            >
              Storage Reference / URI *
            </label>
            <input
              id="doc-ref"
              type="text"
              required
              value={storageRef}
              onChange={(e) => setStorageRef(e.target.value)}
              placeholder="e.g. s3://vault/certificates/2026/wht-001.pdf"
              className="w-full px-3 py-2 text-xs border border-stone-300 rounded-md focus:outline-none focus:ring-2 focus:ring-emerald-700/20 focus:border-emerald-700 text-stone-900 font-mono"
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label
                className="block text-xs font-semibold uppercase tracking-wider text-stone-600 mb-1"
                htmlFor="doc-fn"
              >
                Original Filename
              </label>
              <input
                id="doc-fn"
                type="text"
                value={filename}
                onChange={(e) => setFilename(e.target.value)}
                placeholder="e.g. audit_certificate.pdf"
                className="w-full px-3 py-2 text-xs border border-stone-300 rounded-md focus:outline-none focus:ring-2 focus:ring-emerald-700/20 focus:border-emerald-700 text-stone-900"
              />
            </div>

            <div>
              <label
                className="block text-xs font-semibold uppercase tracking-wider text-stone-600 mb-1"
                htmlFor="doc-ct"
              >
                Content / MIME Type
              </label>
              <input
                id="doc-ct"
                type="text"
                value={contentType}
                onChange={(e) => setContentType(e.target.value)}
                placeholder="e.g. application/pdf"
                className="w-full px-3 py-2 text-xs border border-stone-300 rounded-md focus:outline-none focus:ring-2 focus:ring-emerald-700/20 focus:border-emerald-700 text-stone-900 font-mono"
              />
            </div>
          </div>

          <div>
            <label
              className="block text-xs font-semibold uppercase tracking-wider text-stone-600 mb-1"
              htmlFor="doc-cs"
            >
              Cryptographic Checksum / Hash
            </label>
            <input
              id="doc-cs"
              type="text"
              value={checksum}
              onChange={(e) => setChecksum(e.target.value)}
              placeholder="e.g. sha256:4f53cda18c2baa..."
              className="w-full px-3 py-2 text-xs border border-stone-300 rounded-md focus:outline-none focus:ring-2 focus:ring-emerald-700/20 focus:border-emerald-700 text-stone-900 font-mono"
            />
          </div>

          <div className="pt-4 border-t border-stone-200 flex items-center justify-end gap-2">
            <button
              type="button"
              onClick={() => setModalOpen(false)}
              className="px-4 py-2 border border-stone-300 hover:bg-stone-50 text-stone-700 text-xs font-medium rounded-md transition"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={createMutation.isPending}
              className="inline-flex items-center gap-1.5 px-4 py-2 bg-[#0e4937] hover:bg-[#135f48] text-white text-xs font-medium rounded-md shadow-xs transition disabled:opacity-50"
            >
              {createMutation.isPending && <Loader2 className="h-3.5 w-3.5 animate-spin" />}
              <span>Save Record</span>
            </button>
          </div>
        </form>
      </Modal>
    </AppShell>
  );
}
