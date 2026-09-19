'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { ShieldCheck, ArrowRight, Loader2, AlertCircle } from 'lucide-react';
import { useAuth } from '@/lib/auth';

export default function LoginPage() {
  const { user, login, loading: authLoading } = useAuth();
  const router = useRouter();

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  useEffect(() => {
    if (!authLoading && user) {
      router.push('/dashboard');
    }
  }, [user, authLoading, router]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg(null);
    setSubmitting(true);
    try {
      await login(email.trim(), password);
      router.push('/dashboard');
    } catch (err) {
      setErrorMsg(
        err instanceof Error ? err.message : 'Authentication failed. Please check credentials.',
      );
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen grid lg:grid-cols-2 bg-stone-100">
      {/* Brand Hero Panel */}
      <div className="bg-[#0e4937] text-white p-8 sm:p-12 lg:p-16 flex flex-col justify-between">
        <div>
          <div className="flex items-center gap-3">
            <span className="grid place-items-center w-10 h-10 rounded-full border border-emerald-400 text-amber-300 font-serif font-bold text-xl bg-emerald-950">
              A
            </span>
            <div>
              <span className="block font-serif font-bold tracking-wide text-lg text-white">
                Annapurna
              </span>
              <span className="block text-xs text-emerald-300 uppercase tracking-widest font-sans">
                Operations Platform
              </span>
            </div>
          </div>

          <div className="mt-16 max-w-lg">
            <span className="text-xs font-semibold uppercase tracking-widest text-emerald-300 block mb-2">
              Verified Agricultural Procurement
            </span>
            <h1 className="text-3xl sm:text-4xl lg:text-5xl font-serif font-medium leading-tight">
              A transparent view of agricultural trade & quality.
            </h1>
            <p className="mt-5 text-sm sm:text-base text-emerald-100/90 leading-relaxed">
              Connect to real backend records: trade commodities, verify physical lot passports,
              manage market prices, and execute model-driven procurement matching.
            </p>
          </div>
        </div>

        <div className="mt-12 pt-6 border-t border-emerald-800/80 text-xs text-emerald-300/80 flex items-center gap-2">
          <ShieldCheck className="h-4 w-4 text-emerald-400" />
          <span>Server-authorized access · Spring Boot JWT Foundation</span>
        </div>
      </div>

      {/* Login Form Panel */}
      <div className="flex items-center justify-center p-6 sm:p-12">
        <div className="w-full max-w-md bg-white rounded-lg border border-stone-200 shadow-md p-8">
          <div className="mb-6">
            <span className="text-xs font-semibold uppercase tracking-widest text-stone-500 block">
              Identity & Access
            </span>
            <h2 className="text-2xl font-semibold text-stone-900 mt-1">Sign In</h2>
            <p className="text-xs text-stone-600 mt-1">
              Enter your provisioned user credentials to access the operational workspace.
            </p>
          </div>

          {errorMsg && (
            <div
              className="mb-5 p-3.5 bg-red-50 border border-red-200 rounded-md text-red-900 text-xs flex items-start gap-2.5"
              role="alert"
            >
              <AlertCircle className="h-4 w-4 text-red-600 shrink-0 mt-0.5" />
              <div>
                <strong className="font-semibold block mb-0.5">Sign in failed</strong>
                <span>{errorMsg}</span>
              </div>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label
                className="block text-xs font-semibold uppercase tracking-wider text-stone-600 mb-1.5"
                htmlFor="email-input"
              >
                Email Address
              </label>
              <input
                id="email-input"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="e.g. admin@annapurna.com"
                required
                autoComplete="email"
                className="w-full px-3.5 py-2.5 text-sm border border-stone-300 rounded-md focus:outline-none focus:ring-2 focus:ring-emerald-700/20 focus:border-emerald-700 text-stone-900"
              />
            </div>

            <div>
              <label
                className="block text-xs font-semibold uppercase tracking-wider text-stone-600 mb-1.5"
                htmlFor="password-input"
              >
                Password
              </label>
              <input
                id="password-input"
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••••••"
                required
                autoComplete="current-password"
                className="w-full px-3.5 py-2.5 text-sm border border-stone-300 rounded-md focus:outline-none focus:ring-2 focus:ring-emerald-700/20 focus:border-emerald-700 text-stone-900"
              />
            </div>

            <button
              type="submit"
              disabled={submitting}
              className="w-full mt-2 inline-flex items-center justify-center gap-2 px-4 py-2.5 bg-[#0e4937] hover:bg-[#135f48] text-white text-sm font-medium rounded-md shadow-xs transition disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {submitting ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin" />
                  <span>Authenticating...</span>
                </>
              ) : (
                <>
                  <span>Sign In</span>
                  <ArrowRight className="h-4 w-4" />
                </>
              )}
            </button>
          </form>

          <div className="mt-8 pt-5 border-t border-stone-100 text-[11px] text-stone-500">
            <span className="font-semibold block text-stone-700 mb-1">Local Environment Note:</span>
            <span>
              Local test accounts are provisioned via PostgreSQL database seeders. Supported roles
              include FARMER, BUYER_USER, QUALITY_INSPECTOR, and ADMIN.
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}
