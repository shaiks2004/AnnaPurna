'use client';

import React from 'react';
import { useParams } from 'next/navigation';
import Link from 'next/link';
import { useQuery } from '@tanstack/react-query';
import { ShieldCheck, ExternalLink, Info, ArrowLeft, CheckCircle2 } from 'lucide-react';
import { AppShell } from '@/components/layout/AppShell';
import { PageHeader, LoadingState, ErrorState, EmptyState } from '@/components/ui/States';
import { listMatches, getRequirement, type MatchResult } from '@/lib/api';

export default function RequirementMatchesPage() {
  const params = useParams<{ id: string }>();
  const id = params?.id;

  const reqQuery = useQuery({
    queryKey: ['requirement', id],
    queryFn: () => getRequirement(id!),
    enabled: !!id,
  });

  const query = useQuery({
    queryKey: ['matches', id],
    queryFn: () => listMatches(id!, 20),
    enabled: !!id,
  });

  return (
    <AppShell>
      <PageHeader
        title="Ranked Lot Matches"
        eyebrow="Matching Engine Results"
        breadcrumbs={[
          { label: 'Dashboard', href: '/dashboard' },
          { label: 'Requirements', href: '/requirements' },
          {
            label: reqQuery.data ? `Req #${reqQuery.data.id.substring(0, 8)}` : 'Requirement',
            href: `/requirements/${id}`,
          },
          { label: 'Matches' },
        ]}
        actions={
          <div className="flex items-center gap-2">
            <Link
              href={`/requirements/${id}`}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-md border border-stone-300 hover:bg-stone-50 text-stone-700 text-xs font-medium transition"
            >
              <ArrowLeft className="h-3.5 w-3.5" />
              <span>Back to Requirement</span>
            </Link>
          </div>
        }
      />

      {/* Model Transparency & Specification Notice */}
      <div className="p-4 bg-stone-50 border border-stone-200 rounded-lg text-xs text-stone-700 mb-6 flex items-start gap-3">
        <Info className="h-5 w-5 text-emerald-800 shrink-0 mt-0.5" />
        <div className="leading-relaxed">
          <div className="flex items-center gap-2 mb-0.5">
            <strong className="font-semibold text-stone-900">
              Deterministic Baseline Algorithm (v1)
            </strong>
            <span className="bg-stone-200/80 text-stone-700 px-2 py-0.5 rounded text-[10px] font-mono font-semibold uppercase">
              deterministic-baseline v1
            </span>
          </div>
          <span>
            Rankings are mathematically computed from multi-dimensional factors: Commodity
            Compatibility (35%), Quantity Coverage (30%), Verified Quality Assay (20%), Geospatial
            Proximity (10%), and Harvest/Delivery Availability (5%). This is a deterministic
            rule-based model, not unverified machine learning.
          </span>
        </div>
      </div>

      {query.isLoading ? (
        <LoadingState message="Executing deterministic matching algorithm across active inventory lots..." />
      ) : query.error ? (
        <ErrorState error={query.error} onRetry={() => query.refetch()} />
      ) : !query.data?.length ? (
        <EmptyState
          title="No matching lots available"
          description="No available physical lots satisfied the baseline matching criteria for this requirement."
        />
      ) : (
        <div className="space-y-4 max-w-4xl">
          <div className="text-xs text-stone-500 font-medium pb-1 flex items-center justify-between">
            <span>Found {query.data.length} candidate lot match(es)</span>
            <span>Sorted by composite ranking score</span>
          </div>

          {query.data.map((match: MatchResult) => {
            const scorePercent = (match.score * 100).toFixed(1);

            return (
              <div
                key={match.lotId}
                className="bg-white rounded-lg border border-stone-200 shadow-2xs overflow-hidden transition hover:border-emerald-700/60"
              >
                <div className="p-5 sm:p-6 flex flex-col sm:flex-row sm:items-start justify-between gap-4">
                  {/* Rank and Lot Info */}
                  <div className="flex items-start gap-4">
                    <div className="flex flex-col items-center justify-center w-12 h-12 rounded-lg bg-stone-100 border border-stone-200 text-stone-800 font-bold text-base shrink-0">
                      <span className="text-[10px] font-normal text-stone-500 uppercase">Rank</span>
                      <span>#{match.rankedPosition}</span>
                    </div>

                    <div>
                      <div className="flex items-center gap-2 mb-1 flex-wrap">
                        <h3 className="text-base font-semibold text-stone-900 font-mono">
                          Lot: {match.lotId}
                        </h3>
                      </div>
                      <div className="flex items-center gap-3 text-xs text-stone-500">
                        <span>
                          Model:{' '}
                          <strong className="text-stone-700 font-mono">
                            {match.modelName} {match.modelVersion}
                          </strong>
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* Match Score Display */}
                  <div className="flex flex-col sm:items-end bg-emerald-50/60 p-3 rounded-lg border border-emerald-100 sm:bg-transparent sm:p-0 sm:border-0 shrink-0">
                    <span className="text-[10px] uppercase font-semibold tracking-wider text-stone-500">
                      Composite Match Score
                    </span>
                    <div className="flex items-baseline gap-1 mt-0.5">
                      <span className="text-2xl font-bold text-emerald-900 font-sans">
                        {scorePercent}%
                      </span>
                      <span className="text-xs text-stone-500">({match.score.toFixed(4)})</span>
                    </div>
                  </div>
                </div>

                {/* Match Explanations / Factors */}
                <div className="px-5 py-4 bg-stone-50/70 border-t border-stone-100 text-xs">
                  <span className="font-semibold uppercase tracking-wider text-stone-500 text-[10px] block mb-2">
                    Score Factor Explanations & Evidence
                  </span>
                  <ul className="space-y-1.5">
                    {match.explanation.map((reason, idx) => (
                      <li key={idx} className="flex items-start gap-2 text-stone-700">
                        <CheckCircle2 className="h-3.5 w-3.5 text-emerald-700 shrink-0 mt-0.5" />
                        <span className="leading-relaxed">{reason}</span>
                      </li>
                    ))}
                  </ul>

                  <div className="mt-4 pt-3 border-t border-stone-200/60 flex items-center justify-between flex-wrap gap-2">
                    <span className="text-[11px] text-stone-400">
                      Read-only algorithmic match. No transactions or orders are executed without
                      downstream review.
                    </span>
                    <div className="flex items-center gap-2">
                      <Link
                        href={`/lots/${match.lotId}/passport`}
                        className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-emerald-800 hover:bg-emerald-900 text-white font-semibold rounded text-xs shadow-2xs transition"
                      >
                        <ShieldCheck className="h-3.5 w-3.5 text-amber-300" />
                        <span>Inspect Lot Passport</span>
                      </Link>
                      <Link
                        href={`/lots/${match.lotId}`}
                        className="inline-flex items-center gap-1 px-3 py-1.5 border border-stone-300 hover:bg-stone-100 text-stone-700 font-medium rounded text-xs transition"
                      >
                        <span>Lot Details</span>
                        <ExternalLink className="h-3 w-3" />
                      </Link>
                    </div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </AppShell>
  );
}
