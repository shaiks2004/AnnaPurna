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
              className="agri-btn-secondary"
            >
              <ArrowLeft className="h-3.5 w-3.5" />
              <span>Lot Overview</span>
            </Link>
            <button
              onClick={() => {
                setNotification(null);
                setModalOpen(true);
              }}
              className="agri-btn-primary"
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
        <div className="p-4 bg-[#F8F9F6] border border-[#DDE2DB] rounded-lg text-xs text-[#26332D] flex items-start gap-3">
          <Info className="h-5 w-5 text-[#17633F] shrink-0 mt-0.5" />
          <div className="leading-relaxed">
            <strong className="font-semibold block mb-0.5 text-[#123C2C] font-heading">
              Verifiable Metadata Storage
            </strong>
            <span className="text-[#657169]">
              The backend stores cryptographic hashes, document type codes, and storage references
              for audits and passport verification. File bytes reside in external object storage.
            </span>
          </div>
        </div>

        {/* Documents Table */}
        <div className="agri-card overflow-hidden">
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
                    className="agri-btn-primary"
                  >
                    <Plus className="h-4 w-4" />
                    <span>Attach Certificate Record</span>
                  </button>
                }
              />
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="agri-table">
                <thead>
                  <tr>
                    <th>Document Type</th>
                    <th>Storage Reference</th>
                    <th>Original Filename</th>
                    <th>Checksum</th>
                    <th>Created</th>
                  </tr>
                </thead>
                <tbody>
                  {query.data.map((doc: LotDocument) => (
                    <tr key={doc.id}>
                      <td className="font-medium text-[#26332D]">
                        <span className="inline-flex items-center gap-2">
                          <FileText className="h-4 w-4 text-[#17633F]" />
                          <span className="font-semibold font-heading">{doc.documentTypeCode}</span>
                        </span>
                      </td>
                      <td
                        className="font-mono text-[11px] text-[#657169] max-w-xs truncate"
                        title={doc.storageReference}
                      >
                        {doc.storageReference}
                      </td>
                      <td className="text-[#26332D]">{doc.originalFilename ?? '—'}</td>
                      <td
                        className="font-mono text-[10px] text-[#78877E] max-w-[150px] truncate"
                        title={doc.checksum ?? ''}
                      >
                        {doc.checksum ?? '—'}
                      </td>
                      <td className="text-[#78877E] text-[11px]">
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
              className="block text-[11px] font-semibold uppercase tracking-wider text-[#657169] mb-1.5 font-heading"
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
              className="agri-input text-xs font-mono"
            />
          </div>

          <div>
            <label
              className="block text-[11px] font-semibold uppercase tracking-wider text-[#657169] mb-1.5 font-heading"
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
              className="agri-input text-xs font-mono"
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label
                className="block text-[11px] font-semibold uppercase tracking-wider text-[#657169] mb-1.5 font-heading"
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
                className="agri-input text-xs"
              />
            </div>

            <div>
              <label
                className="block text-[11px] font-semibold uppercase tracking-wider text-[#657169] mb-1.5 font-heading"
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
                className="agri-input text-xs font-mono"
              />
            </div>
          </div>

          <div>
            <label
              className="block text-[11px] font-semibold uppercase tracking-wider text-[#657169] mb-1.5 font-heading"
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
              className="agri-input text-xs font-mono"
            />
          </div>

          <div className="pt-4 border-t border-[#DDE2DB] flex items-center justify-end gap-2.5">
            <button
              type="button"
              onClick={() => setModalOpen(false)}
              className="agri-btn-secondary"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={createMutation.isPending}
              className="agri-btn-primary"
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
