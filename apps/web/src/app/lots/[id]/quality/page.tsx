'use client';

import React, { useState } from 'react';
import { useParams } from 'next/navigation';
import Link from 'next/link';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import {
  FlaskConical,
  Plus,
  ShieldCheck,
  CheckCircle2,
  Loader2,
  ArrowLeft,
  ChevronDown,
  ChevronUp,
} from 'lucide-react';
import { AppShell } from '@/components/layout/AppShell';
import {
  PageHeader,
  LoadingState,
  ErrorState,
  EmptyState,
  Badge,
  StatusNotification,
} from '@/components/ui/States';
import { Modal } from '@/components/ui/Modal';
import {
  listQualityTests,
  createQualityTest,
  getLot,
  listMeasurements,
  createMeasurement,
  verifyQualityTest,
  type QualityTest,
  type QualityTestCreateRequest,
  type QualityMeasurementCreateRequest,
} from '@/lib/api';
import { useAuth } from '@/lib/auth';

export default function LotQualityPage() {
  const params = useParams<{ id: string }>();
  const id = params?.id;
  const queryClient = useQueryClient();
  const { hasRole } = useAuth();
  const isInspector = hasRole('QUALITY_INSPECTOR') || hasRole('ADMIN');

  const [testModalOpen, setTestModalOpen] = useState(false);
  const [measModalOpen, setMeasModalOpen] = useState(false);
  const [activeTestId, setActiveTestId] = useState<string | null>(null);
  const [notification, setNotification] = useState<{
    type: 'success' | 'error';
    message: string;
  } | null>(null);

  // New Test Form
  const [testType, setTestType] = useState('PHYSICAL_MOISTURE_ASSAY');
  const [methodCode, setMethodCode] = useState('ISO-712-OVEN');
  const [sourceCode, setSourceCode] = useState('LAB-CENTRAL-01');
  const [notes, setNotes] = useState('');

  // New Measurement Form
  const [metricName, setMetricName] = useState('MoistureContent');
  const [unit, setUnit] = useState('%');
  const [numericValue, setNumericValue] = useState('');
  const [textValue, setTextValue] = useState('');

  const lotQuery = useQuery({
    queryKey: ['lot', id],
    queryFn: () => getLot(id!),
    enabled: !!id,
  });

  const testsQuery = useQuery({
    queryKey: ['quality-tests', id],
    queryFn: () => listQualityTests(id!, 0, 50),
    enabled: !!id,
  });

  const createTestMutation = useMutation({
    mutationFn: (payload: QualityTestCreateRequest) => createQualityTest(id!, payload),
    onSuccess: () => {
      setTestModalOpen(false);
      setNotes('');
      setNotification({ type: 'success', message: 'Quality test created successfully.' });
      void queryClient.invalidateQueries({ queryKey: ['quality-tests', id] });
      void queryClient.invalidateQueries({ queryKey: ['passport', id] });
    },
    onError: (err) => {
      setNotification({
        type: 'error',
        message: err instanceof Error ? err.message : 'Failed to create quality test.',
      });
    },
  });

  const createMeasMutation = useMutation({
    mutationFn: ({
      testId,
      payload,
    }: {
      testId: string;
      payload: QualityMeasurementCreateRequest;
    }) => createMeasurement(testId, payload),
    onSuccess: () => {
      setMeasModalOpen(false);
      setNumericValue('');
      setTextValue('');
      setNotification({ type: 'success', message: 'Measurement result added successfully.' });
      void queryClient.invalidateQueries({ queryKey: ['measurements', activeTestId] });
      void queryClient.invalidateQueries({ queryKey: ['passport', id] });
    },
    onError: (err) => {
      setNotification({
        type: 'error',
        message: err instanceof Error ? err.message : 'Failed to add measurement.',
      });
    },
  });

  const verifyMutation = useMutation({
    mutationFn: (testId: string) => verifyQualityTest(testId),
    onSuccess: (verifiedTest) => {
      setNotification({
        type: 'success',
        message: `Quality test "${verifiedTest.testType}" has been formally verified.`,
      });
      void queryClient.invalidateQueries({ queryKey: ['quality-tests', id] });
      void queryClient.invalidateQueries({ queryKey: ['lot', id] });
      void queryClient.invalidateQueries({ queryKey: ['passport', id] });
    },
    onError: (err) => {
      setNotification({
        type: 'error',
        message: err instanceof Error ? err.message : 'Failed to verify quality test.',
      });
    },
  });

  const handleTestSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    createTestMutation.mutate({
      testType: testType.trim(),
      methodCode: methodCode.trim(),
      sourceCode: sourceCode.trim() || null,
      notes: notes.trim() || null,
    });
  };

  const handleMeasSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!activeTestId) return;
    const num = Number(numericValue);
    createMeasMutation.mutate({
      testId: activeTestId,
      payload: {
        metricName: metricName.trim(),
        unit: unit.trim(),
        numericValue: num,
        textValue: textValue.trim() || null,
      },
    });
  };

  return (
    <AppShell>
      <PageHeader
        title="Lot Quality Verification"
        eyebrow="Quality & Lab Evidence"
        breadcrumbs={[
          { label: 'Dashboard', href: '/dashboard' },
          { label: 'Lots', href: '/lots' },
          { label: lotQuery.data?.lotNumber ?? id?.substring(0, 8) ?? 'Lot', href: `/lots/${id}` },
          { label: 'Quality' },
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
                setTestModalOpen(true);
              }}
              className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-md bg-[#0e4937] hover:bg-[#135f48] text-white text-xs font-medium shadow-xs transition"
            >
              <Plus className="h-4 w-4" />
              <span>Record Quality Test</span>
            </button>
          </div>
        }
      />

      {notification && (
        <StatusNotification type={notification.type} message={notification.message} />
      )}

      {testsQuery.isLoading ? (
        <LoadingState message="Loading recorded quality tests..." />
      ) : testsQuery.error ? (
        <ErrorState error={testsQuery.error} onRetry={() => testsQuery.refetch()} />
      ) : !testsQuery.data?.data.length ? (
        <EmptyState
          title="No quality tests recorded"
          description="This lot has no quality tests or assay records yet. Record a test to initiate verification."
          action={
            <button
              onClick={() => setTestModalOpen(true)}
              className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-md bg-[#0e4937] hover:bg-[#135f48] text-white text-xs font-medium transition"
            >
              <Plus className="h-4 w-4" />
              <span>Create Quality Test</span>
            </button>
          }
        />
      ) : (
        <div className="space-y-6 max-w-4xl">
          {testsQuery.data.data.map((test: QualityTest) => (
            <TestCard
              key={test.id}
              test={test}
              isInspector={isInspector}
              onAddMeasurement={() => {
                setActiveTestId(test.id);
                setMeasModalOpen(true);
              }}
              onVerify={() => verifyMutation.mutate(test.id)}
              verifying={verifyMutation.isPending}
            />
          ))}
        </div>
      )}

      {/* Record Test Modal */}
      <Modal
        isOpen={testModalOpen}
        onClose={() => setTestModalOpen(false)}
        title="Record Quality Test"
        subtitle="Initiate quality inspection or assay for this physical lot"
      >
        <form onSubmit={handleTestSubmit} className="space-y-4">
          <div>
            <label
              className="block text-xs font-semibold uppercase tracking-wider text-stone-600 mb-1"
              htmlFor="qt-type"
            >
              Test Type *
            </label>
            <input
              id="qt-type"
              type="text"
              required
              value={testType}
              onChange={(e) => setTestType(e.target.value)}
              placeholder="e.g. PHYSICAL_MOISTURE_ASSAY"
              className="w-full px-3 py-2 text-xs border border-stone-300 rounded-md focus:outline-none focus:ring-2 focus:ring-emerald-700/20 focus:border-emerald-700 text-stone-900"
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label
                className="block text-xs font-semibold uppercase tracking-wider text-stone-600 mb-1"
                htmlFor="qt-method"
              >
                Method Code *
              </label>
              <input
                id="qt-method"
                type="text"
                required
                value={methodCode}
                onChange={(e) => setMethodCode(e.target.value)}
                placeholder="e.g. ISO-712-OVEN"
                className="w-full px-3 py-2 text-xs border border-stone-300 rounded-md focus:outline-none focus:ring-2 focus:ring-emerald-700/20 focus:border-emerald-700 text-stone-900 font-mono"
              />
            </div>

            <div>
              <label
                className="block text-xs font-semibold uppercase tracking-wider text-stone-600 mb-1"
                htmlFor="qt-source"
              >
                Source / Laboratory Code
              </label>
              <input
                id="qt-source"
                type="text"
                value={sourceCode}
                onChange={(e) => setSourceCode(e.target.value)}
                placeholder="e.g. LAB-NABL-01"
                className="w-full px-3 py-2 text-xs border border-stone-300 rounded-md focus:outline-none focus:ring-2 focus:ring-emerald-700/20 focus:border-emerald-700 text-stone-900 font-mono"
              />
            </div>
          </div>

          <div>
            <label
              className="block text-xs font-semibold uppercase tracking-wider text-stone-600 mb-1"
              htmlFor="qt-notes"
            >
              Inspection Notes
            </label>
            <textarea
              id="qt-notes"
              rows={3}
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="Sampled from center bags, dry batch..."
              className="w-full px-3 py-2 text-xs border border-stone-300 rounded-md focus:outline-none focus:ring-2 focus:ring-emerald-700/20 focus:border-emerald-700 text-stone-900"
            />
          </div>

          <div className="pt-4 border-t border-stone-200 flex items-center justify-end gap-2">
            <button
              type="button"
              onClick={() => setTestModalOpen(false)}
              className="px-4 py-2 border border-stone-300 hover:bg-stone-50 text-stone-700 text-xs font-medium rounded-md transition"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={createTestMutation.isPending}
              className="inline-flex items-center gap-1.5 px-4 py-2 bg-[#0e4937] hover:bg-[#135f48] text-white text-xs font-medium rounded-md shadow-xs transition disabled:opacity-50"
            >
              {createTestMutation.isPending && <Loader2 className="h-3.5 w-3.5 animate-spin" />}
              <span>Save Quality Test</span>
            </button>
          </div>
        </form>
      </Modal>

      {/* Add Measurement Modal */}
      <Modal
        isOpen={measModalOpen}
        onClose={() => setMeasModalOpen(false)}
        title="Add Measurement Metric"
        subtitle="Record quantitative assay result for this test"
      >
        <form onSubmit={handleMeasSubmit} className="space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label
                className="block text-xs font-semibold uppercase tracking-wider text-stone-600 mb-1"
                htmlFor="m-name"
              >
                Metric Name *
              </label>
              <input
                id="m-name"
                type="text"
                required
                value={metricName}
                onChange={(e) => setMetricName(e.target.value)}
                placeholder="e.g. MoistureContent / ForeignMatter"
                className="w-full px-3 py-2 text-xs border border-stone-300 rounded-md focus:outline-none focus:ring-2 focus:ring-emerald-700/20 focus:border-emerald-700 text-stone-900"
              />
            </div>

            <div>
              <label
                className="block text-xs font-semibold uppercase tracking-wider text-stone-600 mb-1"
                htmlFor="m-unit"
              >
                Unit *
              </label>
              <input
                id="m-unit"
                type="text"
                required
                value={unit}
                onChange={(e) => setUnit(e.target.value)}
                placeholder="% / PPM / mm"
                className="w-full px-3 py-2 text-xs border border-stone-300 rounded-md focus:outline-none focus:ring-2 focus:ring-emerald-700/20 focus:border-emerald-700 text-stone-900 font-mono"
              />
            </div>
          </div>

          <div>
            <label
              className="block text-xs font-semibold uppercase tracking-wider text-stone-600 mb-1"
              htmlFor="m-val"
            >
              Numeric Value *
            </label>
            <input
              id="m-val"
              type="number"
              step="any"
              required
              value={numericValue}
              onChange={(e) => setNumericValue(e.target.value)}
              placeholder="e.g. 11.4"
              className="w-full px-3 py-2 text-xs border border-stone-300 rounded-md focus:outline-none focus:ring-2 focus:ring-emerald-700/20 focus:border-emerald-700 text-stone-900"
            />
          </div>

          <div>
            <label
              className="block text-xs font-semibold uppercase tracking-wider text-stone-600 mb-1"
              htmlFor="m-text"
            >
              Qualitative / Observation Text
            </label>
            <input
              id="m-text"
              type="text"
              value={textValue}
              onChange={(e) => setTextValue(e.target.value)}
              placeholder="e.g. Within Grade A threshold"
              className="w-full px-3 py-2 text-xs border border-stone-300 rounded-md focus:outline-none focus:ring-2 focus:ring-emerald-700/20 focus:border-emerald-700 text-stone-900"
            />
          </div>

          <div className="pt-4 border-t border-stone-200 flex items-center justify-end gap-2">
            <button
              type="button"
              onClick={() => setMeasModalOpen(false)}
              className="px-4 py-2 border border-stone-300 hover:bg-stone-50 text-stone-700 text-xs font-medium rounded-md transition"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={createMeasMutation.isPending}
              className="inline-flex items-center gap-1.5 px-4 py-2 bg-[#0e4937] hover:bg-[#135f48] text-white text-xs font-medium rounded-md shadow-xs transition disabled:opacity-50"
            >
              {createMeasMutation.isPending && <Loader2 className="h-3.5 w-3.5 animate-spin" />}
              <span>Save Measurement</span>
            </button>
          </div>
        </form>
      </Modal>
    </AppShell>
  );
}

function TestCard({
  test,
  isInspector,
  onAddMeasurement,
  onVerify,
  verifying,
}: {
  test: QualityTest;
  isInspector: boolean;
  onAddMeasurement: () => void;
  onVerify: () => void;
  verifying: boolean;
}) {
  const [expanded, setExpanded] = useState(true);

  const measurementsQuery = useQuery({
    queryKey: ['measurements', test.id],
    queryFn: () => listMeasurements(test.id),
  });

  return (
    <div className="bg-white rounded-lg border border-stone-200 shadow-2xs overflow-hidden">
      <div className="p-5 border-b border-stone-200 bg-stone-50/50 flex items-center justify-between flex-wrap gap-3">
        <div className="flex items-center gap-3">
          <div className="p-2 bg-emerald-100 rounded text-emerald-800">
            <FlaskConical className="h-5 w-5" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h3 className="text-sm font-semibold text-stone-900">{test.testType}</h3>
              <Badge variant={test.status === 'VERIFIED' ? 'success' : 'warning'}>
                {test.status}
              </Badge>
            </div>
            <span className="text-[11px] text-stone-500 font-mono">Test ID: {test.id}</span>
          </div>
        </div>

        <div className="flex items-center gap-2">
          {test.status !== 'VERIFIED' && isInspector && (
            <button
              onClick={onVerify}
              disabled={verifying}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded bg-emerald-800 hover:bg-emerald-900 text-white text-xs font-semibold shadow-2xs transition disabled:opacity-50"
            >
              {verifying ? (
                <Loader2 className="h-3.5 w-3.5 animate-spin" />
              ) : (
                <ShieldCheck className="h-3.5 w-3.5" />
              )}
              <span>Verify Test</span>
            </button>
          )}
          <button
            onClick={() => setExpanded(!expanded)}
            className="p-1.5 rounded hover:bg-stone-200/60 text-stone-500"
            aria-label="Toggle measurements panel"
          >
            {expanded ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
          </button>
        </div>
      </div>

      <div className="p-5 text-xs">
        <div className="grid grid-cols-1 sm:grid-cols-4 gap-4 pb-4 border-b border-stone-100 text-stone-600">
          <div>
            <span className="text-stone-400 font-semibold uppercase tracking-wider block mb-0.5">
              Method Code
            </span>
            <span className="font-mono text-stone-900 font-medium">{test.methodCode}</span>
          </div>
          <div>
            <span className="text-stone-400 font-semibold uppercase tracking-wider block mb-0.5">
              Source / Lab
            </span>
            <span className="font-mono text-stone-900 font-medium">{test.sourceCode ?? 'Lab'}</span>
          </div>
          <div>
            <span className="text-stone-400 font-semibold uppercase tracking-wider block mb-0.5">
              Sampled At
            </span>
            <span>{test.sampledAt ? new Date(test.sampledAt).toLocaleString() : '—'}</span>
          </div>
          <div>
            <span className="text-stone-400 font-semibold uppercase tracking-wider block mb-0.5">
              Verification
            </span>
            <span>
              {test.verifiedAt ? (
                <span className="text-emerald-800 font-semibold flex items-center gap-1">
                  <CheckCircle2 className="h-3.5 w-3.5 text-emerald-600" />
                  <span>Verified</span>
                </span>
              ) : (
                'Pending Inspector'
              )}
            </span>
          </div>
        </div>

        {test.notes && <p className="mt-3 text-stone-500 italic">{test.notes}</p>}

        {/* Measurements List */}
        {expanded && (
          <div className="mt-5 pt-4 border-t border-stone-100">
            <div className="flex items-center justify-between mb-3">
              <h4 className="text-xs font-semibold uppercase tracking-wider text-stone-700">
                Assay Measurements ({measurementsQuery.data?.length ?? 0})
              </h4>
              {test.status !== 'VERIFIED' && (
                <button
                  onClick={onAddMeasurement}
                  className="text-xs text-emerald-800 hover:text-emerald-950 font-medium inline-flex items-center gap-1"
                >
                  <Plus className="h-3 w-3" />
                  <span>Add Metric</span>
                </button>
              )}
            </div>

            {measurementsQuery.isLoading ? (
              <LoadingState message="Loading measurements..." />
            ) : !measurementsQuery.data?.length ? (
              <p className="text-stone-400 italic text-xs py-2">
                No metric measurements added yet.
              </p>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs border-collapse">
                  <thead>
                    <tr className="border-b border-stone-100 text-stone-400 uppercase tracking-wider font-semibold text-[10px]">
                      <th className="py-2">Metric Name</th>
                      <th className="py-2">Numeric Result</th>
                      <th className="py-2">Unit</th>
                      <th className="py-2">Observation / Qualitative Note</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-stone-50">
                    {measurementsQuery.data.map((m) => (
                      <tr key={m.id}>
                        <td className="py-2.5 font-medium text-stone-900">{m.metricName}</td>
                        <td className="py-2.5 font-mono font-semibold text-emerald-900">
                          {m.numericValue ?? '—'}
                        </td>
                        <td className="py-2.5 font-mono text-stone-500">{m.unit ?? '—'}</td>
                        <td className="py-2.5 text-stone-600">{m.textValue ?? '—'}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
