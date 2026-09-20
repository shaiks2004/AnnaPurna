'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import {
  LayoutDashboard,
  ClipboardList,
  Boxes,
  Database,
  Sprout,
  Store,
  TrendingUp,
  LogOut,
  User,
  Menu,
  X,
  Loader2,
  ShieldCheck,
  ChevronRight,
  Activity,
} from 'lucide-react';
import { useAuth } from '@/lib/auth';
import { type Role } from '@/lib/api';

type NavSection = {
  sectionTitle?: string;
  items: {
    href: string;
    label: string;
    icon: React.ComponentType<{ className?: string }>;
    roles?: Role[];
    matchPrefix?: string;
  }[];
};

const NAV_SECTIONS: NavSection[] = [
  {
    sectionTitle: 'Overview',
    items: [
      {
        href: '/dashboard',
        label: 'Dashboard',
        icon: LayoutDashboard,
        matchPrefix: '/dashboard',
      },
    ],
  },

  {
    sectionTitle: 'Market Intelligence',
    items: [
      {
        href: '/commodities',
        label: 'Commodities',
        icon: Sprout,
        matchPrefix: '/commodities',
      },
      {
        href: '/markets',
        label: 'Markets',
        icon: Store,
        matchPrefix: '/markets',
      },
      {
        href: '/market-prices',
        label: 'Market Prices',
        icon: TrendingUp,
        matchPrefix: '/market-prices',
      },
    ],
  },

  {
    sectionTitle: 'Supply',
    items: [
      {
        href: '/supplies',
        label: 'Supply Declarations',
        icon: Boxes,
        roles: ['FARMER', 'FPO_USER', 'ADMIN'],
        matchPrefix: '/supplies',
      },
      {
        href: '/lots',
        label: 'Lots & Passports',
        icon: Database,
        matchPrefix: '/lots',
      },
    ],
  },

  {
    sectionTitle: 'Procurement',
    items: [
      {
        href: '/requirements',
        label: 'Buyer Requirements',
        icon: ClipboardList,
        roles: ['BUYER_USER', 'ADMIN'],
        matchPrefix: '/requirements',
      },
    ],
  },
];

const ROLE_LABELS: Record<string, string> = {
  ADMIN: 'Administrator',
  BUYER_USER: 'Buyer',
  FARMER: 'Farmer',
  FPO_USER: 'FPO User',
  QUALITY_INSPECTOR: 'Quality Inspector',
  LOGISTICS_USER: 'Logistics',
  FINANCE_USER: 'Finance',
};

function getRoleLabel(roles: string[]) {
  if (!roles.length) {
    return 'Procurement User';
  }

  const firstRole = roles[0];

  return ROLE_LABELS[firstRole] ?? 'Procurement User';
}

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

  /* =========================================================
     AUTH LOADING
     ========================================================= */

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#F4F1E8]">
        <div className="flex items-center gap-3 px-5 py-4 bg-white border border-[#D9DED9] rounded-xl shadow-sm">
          <Loader2 className="h-5 w-5 animate-spin text-[#17633F]" />

          <span className="text-xs font-semibold font-heading text-[#26332D]">
            Restoring authenticated session...
          </span>
        </div>
      </div>
    );
  }

  /* =========================================================
     AUTH REDIRECT
     ========================================================= */

  if (requireAuth && !user) {
    return null;
  }

  const roleLabel = user
    ? getRoleLabel(user.globalRoles)
    : 'Procurement User';

  return (
    <div className="min-h-screen flex bg-[#F4F1E8] text-[#26332D]">

      {/* =====================================================
          MOBILE BACKDROP
          ===================================================== */}

      {mobileNavOpen && (
        <div
          className="fixed inset-0 z-40 bg-[#123C2C]/55 lg:hidden"
          onClick={() => setMobileNavOpen(false)}
          aria-hidden="true"
        />
      )}

      {/* =====================================================
          SIDEBAR
          ===================================================== */}

      <aside
        className={`
          fixed inset-y-0 left-0 z-50
          w-[250px]
          bg-[#123C2C]
          text-white
          flex flex-col
          border-r border-white/10
          transition-transform duration-200 ease-out
          lg:static lg:translate-x-0
          ${
            mobileNavOpen
              ? 'translate-x-0 shadow-2xl'
              : '-translate-x-full'
          }
        `}
      >

        {/* ===================================================
            BRAND
            =================================================== */}

        <div className="h-[70px] px-4 border-b border-white/10 flex items-center justify-between shrink-0">

          <Link
            href="/dashboard"
            onClick={() => setMobileNavOpen(false)}
            className="flex items-center gap-3 min-w-0"
          >

            {/* Logo */}

            <div
              className="
                h-9
                w-9
                shrink-0
                rounded-lg
                bg-[#17633F]
                border
                border-[#B8D99F]/30
                flex
                items-center
                justify-center
                text-[#B8D99F]
                font-heading
                font-bold
                text-lg
              "
            >
              A
            </div>

            {/* Brand text */}

            <div className="min-w-0">

              <div
                className="
                  font-heading
                  font-semibold
                  text-[15px]
                  tracking-wide
                  leading-none
                  text-white
                "
              >
                ANNAPURNA
              </div>

              <div
                className="
                  mt-1.5
                  text-[8px]
                  font-semibold
                  text-[#B8D99F]
                  uppercase
                  tracking-[0.16em]
                  whitespace-nowrap
                "
              >
                Agricultural Network
              </div>

            </div>
          </Link>

          {/* Mobile close */}

          <button
            onClick={() => setMobileNavOpen(false)}
            className="
              lg:hidden
              p-1.5
              rounded-md
              text-white/60
              hover:text-white
              hover:bg-white/10
            "
            aria-label="Close navigation"
          >
            <X className="h-4 w-4" />
          </button>

        </div>

        {/* ===================================================
            NAVIGATION
            =================================================== */}

        <nav
          className="
            flex-1
            px-3
            py-4
            overflow-y-auto
          "
          aria-label="Main navigation"
        >

          <div className="space-y-5">

            {NAV_SECTIONS.map((section, sectionIndex) => {

              /* ---------------------------------------------
                 ROLE FILTERING
                 --------------------------------------------- */

              const visibleItems = section.items.filter((item) => {

                if (!item.roles) {
                  return true;
                }

                return item.roles.some((role) => hasRole(role));
              });

              if (!visibleItems.length) {
                return null;
              }

              return (
                <div key={sectionIndex}>

                  {/* Section heading */}

                  {section.sectionTitle && (
                    <div
                      className="
                        px-3
                        mb-1.5
                        text-[9px]
                        font-heading
                        font-semibold
                        uppercase
                        tracking-[0.12em]
                        text-[#B8D99F]
                      "
                    >
                      {section.sectionTitle}
                    </div>
                  )}

                  {/* Section items */}

                  <div className="space-y-1">

                    {visibleItems.map((item) => {

                      const Icon = item.icon;

                      const isActive =
                        pathname === item.href ||
                        (!!item.matchPrefix &&
                          pathname.startsWith(item.matchPrefix));

                      return (
                        <Link
                          key={item.href}
                          href={item.href}
                          onClick={() => setMobileNavOpen(false)}
                          className={`
                            group
                            flex
                            items-center
                            justify-between
                            w-full
                            min-h-[40px]
                            px-3
                            rounded-md
                            font-heading
                            text-[12px]
                            transition-all
                            duration-150

                            ${
                              isActive
                                ? `
                                  bg-[#17633F]
                                  text-[#FFFFFF]
                                  font-semibold
                                  shadow-sm
                                `
                                : `
                                  text-[#FFFFFF]
                                  font-medium
                                  hover:bg-[#17633F]/60
                                  hover:text-[#FFFFFF]
                                `
                            }
                          `}
                        >

                          {/* Icon + label */}

                          <div
                            className="
                              flex
                              items-center
                              gap-3
                              min-w-0
                            "
                          >

                            <Icon
                              className={`
                                h-[17px]
                                w-[17px]
                                shrink-0
                                transition-colors

                                ${
                                  isActive
                                    ? 'text-[#B8D99F]'
                                    : 'text-[#FFFFFF]/75 group-hover:text-[#B8D99F]'
                                }
                              `}
                            />

                            <span className="truncate">
                              {item.label}
                            </span>

                          </div>

                          {/* Active indicator */}

                          {isActive && (
                            <ChevronRight
                              className="
                                h-3.5
                                w-3.5
                                shrink-0
                                text-[#B8D99F]
                              "
                            />
                          )}

                        </Link>
                      );
                    })}

                  </div>
                </div>
              );
            })}

          </div>
        </nav>

        {/* ===================================================
            SYSTEM STATUS
            =================================================== */}

        <div className="px-4 py-4 border-t border-white/10 shrink-0">

          <div className="flex items-center gap-2.5">

            {/* Status icon */}

            <div
              className="
                h-7
                w-7
                rounded-md
                bg-white/[0.06]
                border
                border-white/10
                flex
                items-center
                justify-center
              "
            >
              <Activity className="h-3.5 w-3.5 text-[#B8D99F]" />
            </div>

            {/* Status text */}

            <div>

              <div
                className="
                  text-[10px]
                  font-heading
                  font-semibold
                  text-white/85
                "
              >
                System operational
              </div>

              <div
                className="
                  text-[9px]
                  text-white/40
                  mt-0.5
                "
              >
                Secure application session
              </div>

            </div>

          </div>
        </div>

      </aside>

      {/* =====================================================
          MAIN APPLICATION
          ===================================================== */}

      <div className="flex-1 flex flex-col min-w-0">

        {/* ===================================================
            TOP HEADER
            =================================================== */}

        <header
          className="
            sticky
            top-0
            z-30
            h-[68px]
            bg-white
            border-b
            border-[#D9DED9]
            px-4
            sm:px-6
            lg:px-8
            flex
            items-center
            justify-between
          "
        >

          {/* -------------------------------------------------
              HEADER LEFT
              ------------------------------------------------- */}

          <div className="flex items-center gap-3">

            {/* Mobile menu */}

            <button
              onClick={() => setMobileNavOpen(true)}
              className="
                lg:hidden
                p-2
                rounded-md
                text-[#657169]
                hover:text-[#26332D]
                hover:bg-[#F8F9F6]
              "
              aria-label="Open navigation"
            >
              <Menu className="h-5 w-5" />
            </button>

            {/* Environment indicator */}

            <div
              className="
                hidden
                sm:flex
                items-center
                gap-2
                px-2.5
                py-1.5
                rounded-md
                bg-[#EAF3EC]
                border
                border-[#C9DFCE]
                text-[#17633F]
              "
            >

              <ShieldCheck className="h-3.5 w-3.5" />

              <span className="text-[10px] font-heading font-semibold">
                Verified Environment
              </span>

            </div>

          </div>

          {/* -------------------------------------------------
              HEADER RIGHT
              ------------------------------------------------- */}

          {user && (
            <div className="flex items-center gap-3">

              {/* User role */}

              <div className="hidden md:flex flex-col items-end">

                <span
                  className="
                    text-[12px]
                    font-heading
                    font-semibold
                    text-[#26332D]
                  "
                >
                  {roleLabel}
                </span>

                <span
                  className="
                    text-[10px]
                    text-[#78877E]
                  "
                >
                  {user.userId.substring(0, 8)}...
                </span>

              </div>

              {/* User avatar */}

              <div
                className="
                  h-9
                  w-9
                  rounded-full
                  bg-[#EAF3EC]
                  border
                  border-[#C9DFCE]
                  text-[#17633F]
                  flex
                  items-center
                  justify-center
                "
              >
                <User className="h-4 w-4" />
              </div>

              {/* Logout */}

              <button
                onClick={() =>
                  logout().then(() => router.push('/login'))
                }
                className="
                  inline-flex
                  items-center
                  gap-2
                  px-2.5
                  py-1.5
                  rounded-md
                  text-[11px]
                  font-heading
                  font-semibold
                  text-[#657169]
                  hover:text-[#A82B24]
                  hover:bg-[#FDEEEC]
                  transition-colors
                "
                title="Sign out"
              >

                <LogOut className="h-3.5 w-3.5" />

                <span className="hidden sm:inline">
                  Sign out
                </span>

              </button>

            </div>
          )}

        </header>

        {/* ===================================================
            PAGE CONTENT
            =================================================== */}

        <main
          className="
            flex-1
            w-full
            max-w-[1480px]
            mx-auto
            px-4
            sm:px-6
            lg:px-8
            py-6
            lg:py-7
          "
        >
          {children}
        </main>

      </div>
    </div>
  );
}