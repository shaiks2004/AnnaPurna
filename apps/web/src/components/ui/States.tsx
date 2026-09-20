import React from 'react';
import Link from 'next/link';
import {
  AlertCircle,
  AlertTriangle,
  CheckCircle2,
  ChevronRight,
  Info,
  Loader2,
  RefreshCw,
} from 'lucide-react';
import { ApiError } from '@/lib/api';

export function LoadingState({
  message = 'Loading live data from backend...',
}: {
  message?: string;
}) {
  return (
    <div
      className="flex flex-col items-center justify-center py-16 px-4 text-center text-[#657169]"
      role="status"
    >
      <Loader2 className="h-6 w-6 animate-spin text-[#17633F] mb-3" />
      <p className="text-xs font-medium tracking-wide">{message}</p>
    </div>
  );
}

export function EmptyState({
  title = 'No records found',
  description = 'No available records were returned by the backend.',
  action,
}: {
  title?: string;
  description?: string;
  action?: React.ReactNode;
}) {
  return (
    <div className="flex flex-col items-center justify-center py-14 px-4 text-center border border-dashed border-[#DDE2DB] rounded-xl bg-[#F8F9F6]/80 my-2">
      <div className="rounded-full bg-[#FFFFFF] p-3 mb-3 text-[#78877E] border border-[#DDE2DB] shadow-xs">
        <Info className="h-5 w-5 text-[#17633F]" />
      </div>
      <h3 className="text-sm font-heading font-semibold text-[#26332D]">{title}</h3>
      <p className="text-xs text-[#657169] max-w-sm mt-1 mb-4 leading-relaxed">{description}</p>
      {action && <div>{action}</div>}
    </div>
  );
}

export function ErrorState({ error, onRetry }: { error: unknown; onRetry?: () => void }) {
  let message = 'An unexpected error occurred while communicating with the backend.';
  let isConcurrentConflict = false;
  let isUnauthorized = false;
  let isForbidden = false;

  if (error instanceof ApiError) {
    message = error.userFriendlyMessage;
    isConcurrentConflict = error.status === 409 && error.code === 'CONCURRENT_UPDATE';
    isUnauthorized = error.status === 401;
    isForbidden = error.status === 403;
  } else if (error instanceof Error) {
    message = error.message;
  }

  return (
    <div
      role="alert"
      className={`rounded-xl p-4 border my-4 ${
        isConcurrentConflict
          ? 'bg-[#FEF7EA] border-[#F6E3BD] text-[#96600E]'
          : isForbidden
            ? 'bg-[#FEF7EA] border-[#F6E3BD] text-[#96600E]'
            : 'bg-[#FDEEEC] border-[#F9D0CB] text-[#A82B24]'
      }`}
    >
      <div className="flex items-start gap-3">
        {isConcurrentConflict ? (
          <AlertTriangle className="h-5 w-5 text-[#96600E] shrink-0 mt-0.5" />
        ) : (
          <AlertCircle className="h-5 w-5 text-[#A82B24] shrink-0 mt-0.5" />
        )}
        <div className="flex-1 text-sm">
          <h4 className="font-heading font-semibold mb-1">
            {isConcurrentConflict
              ? 'Concurrent Update Detected'
              : isUnauthorized
                ? 'Session Expired'
                : isForbidden
                  ? 'Access Denied'
                  : 'Backend Request Failed'}
          </h4>
          <p className="text-xs leading-relaxed">{message}</p>
          {onRetry && (
            <button
              onClick={onRetry}
              className="mt-3 inline-flex items-center gap-1.5 text-xs font-semibold px-3 py-1.5 rounded-lg bg-white border border-[#DDE2DB] text-[#26332D] shadow-xs hover:bg-[#F8F9F6] transition"
            >
              <RefreshCw className="h-3.5 w-3.5 text-[#17633F]" /> Retry
            </button>
          )}
        </div>
      </div>
    </div>
  );
}

export function Badge({
  children,
  variant = 'default',
}: {
  children: React.ReactNode;
  variant?: 'default' | 'success' | 'warning' | 'danger' | 'info' | 'outline';
}) {
  const styles = {
    default: 'bg-[#F8F9F6] text-[#26332D] border-[#DDE2DB]',
    success: 'bg-[#E8F4EC] text-[#17633F] border-[#C6E2D0]',
    warning: 'bg-[#FEF7EA] text-[#96600E] border-[#F6E3BD]',
    danger: 'bg-[#FDEEEC] text-[#A82B24] border-[#F9D0CB]',
    info: 'bg-[#EEF6FA] text-[#2B5E77] border-[#CFE3EE]',
    outline: 'bg-transparent text-[#657169] border-[#DDE2DB]',
  };

  const dotColors = {
    default: 'bg-[#78877E]',
    success: 'bg-[#17633F]',
    warning: 'bg-[#96600E]',
    danger: 'bg-[#A82B24]',
    info: 'bg-[#2B5E77]',
    outline: 'bg-[#78877E]',
  };

  return (
    <span
      className={`agri-badge ${styles[variant]}`}
    >
      <span className={`badge-dot ${dotColors[variant]}`} />
      <span>{children}</span>
    </span>
  );
}

export function PageHeader({
  title,
  eyebrow,
  breadcrumbs,
  actions,
}: {
  title: string;
  eyebrow?: string;
  breadcrumbs?: Array<{ label: string; href?: string }>;
  actions?: React.ReactNode;
}) {
  return (
    <div className="pb-5 mb-6 border-b border-[#DDE2DB] flex flex-col md:flex-row md:items-end justify-between gap-4">
      <div>
        {breadcrumbs && breadcrumbs.length > 0 && (
          <nav
            aria-label="Breadcrumb"
            className="flex items-center gap-1.5 text-xs text-[#78877E] mb-2"
          >
            {breadcrumbs.map((crumb, idx) => (
              <React.Fragment key={crumb.label}>
                {idx > 0 && <ChevronRight className="h-3 w-3 text-[#DDE2DB]" />}
                {crumb.href ? (
                  <Link href={crumb.href} className="hover:text-[#17633F] transition">
                    {crumb.label}
                  </Link>
                ) : (
                  <span className="font-semibold text-[#26332D]">{crumb.label}</span>
                )}
              </React.Fragment>
            ))}
          </nav>
        )}
        {eyebrow && (
          <span className="text-[10px] font-semibold tracking-widest uppercase text-[#78877E] block mb-1">
            {eyebrow}
          </span>
        )}
        <h1 className="text-2xl sm:text-3xl font-heading font-semibold text-[#26332D] tracking-tight">{title}</h1>
      </div>
      {actions && <div className="flex items-center gap-2.5 flex-wrap">{actions}</div>}
    </div>
  );
}

export function StatusNotification({
  type,
  message,
}: {
  type: 'success' | 'error' | 'info';
  message: string;
}) {
  const styles = {
    success: 'bg-[#E8F4EC] text-[#17633F] border-[#C6E2D0]',
    error: 'bg-[#FDEEEC] text-[#A82B24] border-[#F9D0CB]',
    info: 'bg-[#EEF6FA] text-[#2B5E77] border-[#CFE3EE]',
  };

  const Icon = type === 'success' ? CheckCircle2 : type === 'error' ? AlertCircle : Info;

  return (
    <div
      className={`flex items-center gap-2.5 p-3 rounded-lg border text-xs font-medium my-3 ${styles[type]}`}
    >
      <Icon className="h-4 w-4 shrink-0" />
      <span>{message}</span>
    </div>
  );
}
