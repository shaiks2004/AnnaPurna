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
      className="flex flex-col items-center justify-center py-14 px-4 text-center text-stone-500"
      role="status"
    >
      <Loader2 className="h-7 w-7 animate-spin text-emerald-800 mb-3" />
      <p className="text-sm font-medium">{message}</p>
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
    <div className="flex flex-col items-center justify-center py-14 px-4 text-center border border-dashed border-stone-200 rounded-lg bg-stone-50/50">
      <div className="rounded-full bg-stone-100 p-3 mb-3 text-stone-400">
        <Info className="h-6 w-6" />
      </div>
      <h3 className="text-sm font-semibold text-stone-800">{title}</h3>
      <p className="text-xs text-stone-500 max-w-sm mt-1 mb-4">{description}</p>
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
      className={`rounded-md p-4 border my-4 ${
        isConcurrentConflict
          ? 'bg-amber-50 border-amber-200 text-amber-900'
          : isForbidden
            ? 'bg-orange-50 border-orange-200 text-orange-900'
            : 'bg-red-50 border-red-200 text-red-900'
      }`}
    >
      <div className="flex items-start gap-3">
        {isConcurrentConflict ? (
          <AlertTriangle className="h-5 w-5 text-amber-600 shrink-0 mt-0.5" />
        ) : (
          <AlertCircle className="h-5 w-5 text-red-600 shrink-0 mt-0.5" />
        )}
        <div className="flex-1 text-sm">
          <h4 className="font-semibold mb-1">
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
              className="mt-3 inline-flex items-center gap-1.5 text-xs font-medium px-3 py-1.5 rounded bg-white border shadow-sm hover:bg-stone-50 transition"
            >
              <RefreshCw className="h-3.5 w-3.5" /> Retry
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
    default: 'bg-stone-100 text-stone-800 border-stone-200',
    success: 'bg-emerald-50 text-emerald-800 border-emerald-200',
    warning: 'bg-amber-50 text-amber-800 border-amber-200',
    danger: 'bg-red-50 text-red-800 border-red-200',
    info: 'bg-sky-50 text-sky-800 border-sky-200',
    outline: 'bg-transparent text-stone-700 border-stone-300',
  };

  return (
    <span
      className={`inline-flex items-center px-2 py-0.5 rounded text-xs font-medium border ${styles[variant]}`}
    >
      {children}
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
    <div className="pb-5 mb-6 border-b border-stone-200 flex flex-col md:flex-row md:items-end justify-between gap-4">
      <div>
        {breadcrumbs && breadcrumbs.length > 0 && (
          <nav
            aria-label="Breadcrumb"
            className="flex items-center gap-1.5 text-xs text-stone-500 mb-2"
          >
            {breadcrumbs.map((crumb, idx) => (
              <React.Fragment key={crumb.label}>
                {idx > 0 && <ChevronRight className="h-3 w-3 text-stone-400" />}
                {crumb.href ? (
                  <Link href={crumb.href} className="hover:text-emerald-800 transition">
                    {crumb.label}
                  </Link>
                ) : (
                  <span className="font-semibold text-stone-800">{crumb.label}</span>
                )}
              </React.Fragment>
            ))}
          </nav>
        )}
        {eyebrow && (
          <span className="text-[11px] font-semibold tracking-wider uppercase text-stone-500">
            {eyebrow}
          </span>
        )}
        <h1 className="text-2xl sm:text-3xl font-semibold text-stone-900 mt-0.5">{title}</h1>
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
    success: 'bg-emerald-50 text-emerald-900 border-emerald-200',
    error: 'bg-red-50 text-red-900 border-red-200',
    info: 'bg-sky-50 text-sky-900 border-sky-200',
  };

  const Icon = type === 'success' ? CheckCircle2 : type === 'error' ? AlertCircle : Info;

  return (
    <div
      className={`flex items-center gap-2.5 p-3 rounded-md border text-xs font-medium my-3 ${styles[type]}`}
    >
      <Icon className="h-4 w-4 shrink-0" />
      <span>{message}</span>
    </div>
  );
}
