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
              className="agri-btn-secondary"
            >
              <ArrowLeft className="h-3.5 w-3.5" />
              <span>Back to Requirement</span>
            </Link>
          </div>
        }
      />

      {/* Model Transparency & Specification Notice */}
      <div className="agri-card p-4 sm:p-5 mb-6 flex items-start gap-3.5 bg-[#F8F9F6] border-[#DDE2DB]">
        <Info className="h-5 w-5 text-[#17633F] shrink-0 mt-0.5" />
        <div className="leading-relaxed text-xs">
          <div className="flex items-center gap-2 mb-1 flex-wrap">
            <strong className="font-bold text-[#123C2C] font-heading">
              Deterministic Baseline Algorithm (v1)
            </strong>
            <span className="bg-[#E8F0E6] text-[#17633F] px-2.5 py-0.5 rounded-md text-[10px] font-mono font-bold uppercase border border-[#B8D99F]/50">
              deterministic-baseline v1
            </span>
          </div>
          <span className="text-[#657169]">
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
          <div className="text-xs text-[#657169] font-semibold pb-1 flex items-center justify-between font-heading">
            <span>Found {query.data.length} candidate lot match(es)</span>
            <span>Sorted by composite ranking score</span>
          </div>

          {query.data.map((match: MatchResult) => {
            const scorePercent = (match.score * 100).toFixed(1);

            return (
              <div
                key={match.lotId}
                className="agri-card overflow-hidden transition hover:border-[#17633F]/60"
              >
                <div className="p-5 sm:p-6 flex flex-col sm:flex-row sm:items-start justify-between gap-4 bg-white">
                  {/* Rank and Lot Info */}
                  <div className="flex items-start gap-4">
                    <div className="flex flex-col items-center justify-center w-12 h-12 rounded-xl bg-[#E8F0E6] border border-[#B8D99F]/50 text-[#123C2C] font-bold text-base shrink-0 font-heading">
                      <span className="text-[10px] font-semibold text-[#17633F] uppercase">Rank</span>
                      <span>#{match.rankedPosition}</span>
                    </div>

                    <div>
                      <div className="flex items-center gap-2 mb-1 flex-wrap">
                        <h3 className="text-base font-bold text-[#123C2C] font-mono font-heading">
                          Lot: {match.lotId}
                        </h3>
                      </div>
                      <div className="flex items-center gap-3 text-xs text-[#657169]">
                        <span>
                          Model:{' '}
                          <strong className="text-[#26332D] font-mono font-semibold">
                            {match.modelName} {match.modelVersion}
                          </strong>
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* Match Score Display */}
                  <div className="flex flex-col sm:items-end bg-[#E8F0E6]/50 p-3 rounded-xl border border-[#B8D99F]/40 sm:bg-transparent sm:p-0 sm:border-0 shrink-0">
                    <span className="text-[10px] uppercase font-bold tracking-wider text-[#657169] font-heading">
                      Composite Match Score
                    </span>
                    <div className="flex items-baseline gap-1 mt-0.5">
                      <span className="text-2xl font-bold text-[#123C2C] font-heading">
                        {scorePercent}%
                      </span>
                      <span className="text-xs text-[#78877E] font-mono">({match.score.toFixed(4)})</span>
                    </div>
                  </div>
                </div>

                {/* Match Explanations / Factors */}
                <div className="px-5 py-4 bg-[#F8F9F6] border-t border-[#DDE2DB] text-xs">
                  <span className="font-bold uppercase tracking-wider text-[#657169] text-[10px] block mb-2.5 font-heading">
                    Score Factor Explanations & Evidence
                  </span>
                  <ul className="space-y-2">
                    {match.explanation.map((reason, idx) => (
                      <li key={idx} className="flex items-start gap-2.5 text-[#26332D]">
                        <CheckCircle2 className="h-4 w-4 text-[#17633F] shrink-0 mt-0.5" />
                        <span className="leading-relaxed">{reason}</span>
                      </li>
                    ))}
                  </ul>

                  <div className="mt-4 pt-3.5 border-t border-[#DDE2DB] flex items-center justify-between flex-wrap gap-3">
                    <span className="text-[11px] text-[#78877E] italic">
                      Read-only algorithmic match. No transactions or orders are executed without
                      downstream review.
                    </span>
                    <div className="flex items-center gap-2">
                      <Link
                        href={`/lots/${match.lotId}/passport`}
                        className="agri-btn-primary bg-[#123C2C] hover:bg-[#17633F] text-xs"
                      >
                        <ShieldCheck className="h-3.5 w-3.5 text-[#B8D99F]" />
                        <span>Inspect Lot Passport</span>
                      </Link>
                      <Link
                        href={`/lots/${match.lotId}`}
                        className="agri-btn-secondary text-xs"
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
