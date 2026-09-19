'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import {
  BarChart3,
  ClipboardList,
  Database,
  Leaf,
  LogOut,
  MapPinned,
  Menu,
  Store,
  User,
  X,
  Loader2,
} from 'lucide-react';
import { useAuth } from '@/lib/auth';
import { type Role } from '@/lib/api';

type NavItem = {
  href: string;
  label: string;
  icon: React.ComponentType<{ className?: string }>;
  roles?: Role[];
  matchPrefix?: string;
};

const NAV_ITEMS: NavItem[] = [
  { href: '/dashboard', label: 'Overview', icon: BarChart3, matchPrefix: '/dashboard' },
  {
    href: '/requirements',
    label: 'Requirements',
    icon: ClipboardList,
    roles: ['BUYER_USER', 'ADMIN'],
    matchPrefix: '/requirements',
  },
  { href: '/lots', label: 'Lots & Passports', icon: Leaf, matchPrefix: '/lots' },
  {
    href: '/supplies',
    label: 'Supply Declarations',
    icon: Database,
    roles: ['FARMER', 'FPO_USER', 'ADMIN'],
    matchPrefix: '/supplies',
  },
  { href: '/markets', label: 'Markets', icon: Store, matchPrefix: '/markets' },
  {
    href: '/market-prices',
    label: 'Market Prices',
    icon: MapPinned,
    matchPrefix: '/market-prices',
  },
];

export function AppShell({
  children,
  requireAuth = true,
}: {
  children: React.ReactNode;
  requireAuth?: boolean;
}) {
  const { user, loading, logout, hasRole } = useAuth();
  const pathname = usePathname();
  const router = useRouter();
  const [mobileNavOpen, setMobileNavOpen] = useState(false);

  useEffect(() => {
    if (!loading && requireAuth && !user) {
      router.push('/login');
    }
  }, [user, loading, requireAuth, router]);

  if (loading) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-stone-50 text-stone-600">
        <div className="flex items-center gap-3 bg-white p-6 rounded-lg shadow-sm border border-stone-200">
          <Loader2 className="h-5 w-5 animate-spin text-emerald-800" />
          <span className="text-sm font-medium">Restoring authenticated session...</span>
        </div>
      </div>
    );
  }

  if (requireAuth && !user) {
    return null;
  }

  const visibleNav = NAV_ITEMS.filter((item) => {
    if (!item.roles) return true;
    return item.roles.some((r) => hasRole(r));
  });

  return (
    <div className="min-h-screen flex bg-stone-100 text-stone-900">
      {/* Mobile Backdrop */}
      {mobileNavOpen && (
        <div
          className="fixed inset-0 z-40 bg-stone-900/60 lg:hidden"
          onClick={() => setMobileNavOpen(false)}
          aria-hidden="true"
        />
      )}

      {/* Sidebar */}
      <aside
        className={`fixed inset-y-0 left-0 z-50 w-64 bg-[#0e4937] text-stone-100 flex flex-col transition-transform duration-200 ease-in-out lg:static lg:translate-x-0 ${
          mobileNavOpen ? 'translate-x-0' : '-translate-x-full'
        }`}
      >
        {/* Brand */}
        <div className="p-5 border-b border-emerald-900/60 flex items-center justify-between">
          <Link
            href="/dashboard"
            onClick={() => setMobileNavOpen(false)}
            className="flex items-center gap-3"
          >
            <span className="grid place-items-center w-8 h-8 rounded-full border border-emerald-400 text-amber-300 font-serif font-bold text-base bg-emerald-950">
              A
            </span>
            <div>
              <span className="block font-serif font-bold tracking-wide text-sm text-white">
                Annapurna
              </span>
              <span className="block text-[10px] text-emerald-300/80 uppercase tracking-wider font-sans">
                Procurement Network
              </span>
            </div>
          </Link>
          <button
            onClick={() => setMobileNavOpen(false)}
            className="p-1 rounded text-emerald-300 hover:text-white lg:hidden"
            aria-label="Close navigation"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Navigation Links */}
        <nav className="flex-1 px-3 py-4 space-y-1 overflow-y-auto" aria-label="Main navigation">
          {visibleNav.map((item) => {
            const Icon = item.icon;
            const isActive =
              pathname === item.href || (item.matchPrefix && pathname.startsWith(item.matchPrefix));

            return (
              <Link
                key={item.href}
                href={item.href}
                onClick={() => setMobileNavOpen(false)}
                className={`flex items-center gap-3 px-3 py-2.5 rounded-md text-xs font-medium transition-colors ${
                  isActive
                    ? 'bg-emerald-800 text-white font-semibold shadow-xs'
                    : 'text-emerald-100/80 hover:bg-emerald-900/70 hover:text-white'
                }`}
              >
                <Icon
                  className={`h-4 w-4 shrink-0 ${isActive ? 'text-amber-300' : 'text-emerald-300'}`}
                />
                <span>{item.label}</span>
              </Link>
            );
          })}
        </nav>

        {/* Connection & Footer Info */}
        <div className="p-4 border-t border-emerald-900/60 bg-emerald-950/40 text-[11px] text-emerald-300/80">
          <div className="flex items-center gap-2 mb-1">
            <span className="h-2 w-2 rounded-full bg-emerald-400 animate-pulse" />
            <span className="font-medium text-emerald-200">Spring Boot API Connected</span>
          </div>
          <span className="text-[10px] text-emerald-400/60 block">
            Version 0.1.0 · Live Endpoints
          </span>
        </div>
      </aside>

      {/* Main Container */}
      <div className="flex-1 flex flex-col min-w-0">
        {/* Top Header */}
        <header className="sticky top-0 z-30 h-16 bg-white border-b border-stone-200 px-4 sm:px-6 flex items-center justify-between shadow-2xs">
          <div className="flex items-center gap-3">
            <button
              onClick={() => setMobileNavOpen(true)}
              className="p-2 rounded-md text-stone-600 hover:text-stone-900 hover:bg-stone-100 lg:hidden"
              aria-label="Open navigation"
            >
              <Menu className="h-5 w-5" />
            </button>
            <span className="hidden sm:inline-block text-xs font-semibold text-emerald-900 bg-emerald-50 px-2.5 py-1 rounded border border-emerald-200">
              Operations Environment
            </span>
          </div>

          {/* User Session Info & Logout */}
          <div className="flex items-center gap-3">
            {user && (
              <div className="flex items-center gap-2 text-xs">
                <div className="hidden md:flex flex-col text-right">
                  <span className="font-semibold text-stone-800">
                    {user.globalRoles.length > 0 ? user.globalRoles.join(', ') : 'User'}
                  </span>
                  <span className="text-[10px] text-stone-500 font-mono">
                    ID: {user.userId.substring(0, 8)}...
                  </span>
                </div>
                <div className="h-8 w-8 rounded-full bg-emerald-100 border border-emerald-200 text-emerald-800 flex items-center justify-center font-medium text-xs">
                  <User className="h-4 w-4" />
                </div>
                <button
                  onClick={() => logout().then(() => router.push('/login'))}
                  className="inline-flex items-center gap-1 px-3 py-1.5 rounded text-xs font-medium text-stone-600 hover:text-red-700 hover:bg-red-50 border border-transparent hover:border-red-100 transition ml-2"
                  title="Sign out of current session"
                >
                  <LogOut className="h-3.5 w-3.5" />
                  <span className="hidden sm:inline">Sign out</span>
                </button>
              </div>
            )}
          </div>
        </header>

        {/* Main Content Area */}
        <main className="flex-1 p-4 sm:p-6 lg:p-8 max-w-7xl w-full mx-auto">{children}</main>
      </div>
    </div>
  );
}
