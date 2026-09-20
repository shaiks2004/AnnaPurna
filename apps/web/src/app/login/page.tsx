'use client';

import React, { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import {
  ArrowRight,
  Loader2,
  AlertCircle,
  Sprout,
  Store,
  FlaskConical,
  Building2,
  UserRound,
  LockKeyhole,
  Mail,
  ShieldCheck,
} from 'lucide-react';
import { useAuth } from '@/lib/auth';

type DemoUser = {
  roleName: string;
  email: string;
  icon: React.ComponentType<{ className?: string }>;
};

const DEMO_USERS: DemoUser[] = [
  {
    roleName: 'Buyer',
    email: 'buyer@annapurna.com',
    icon: UserRound,
  },
  {
    roleName: 'Farmer',
    email: 'farmer@annapurna.com',
    icon: Sprout,
  },
  {
    roleName: 'Admin',
    email: 'admin@annapurna.com',
    icon: Building2,
  },
  {
    roleName: 'Inspector',
    email: 'inspector@annapurna.com',
    icon: FlaskConical,
  },
  {
    roleName: 'FPO',
    email: 'fpo@annapurna.com',
    icon: Store,
  },
];

export default function LoginPage() {
  const { user, login, loading: authLoading } = useAuth();
  const router = useRouter();

  const [email, setEmail] = useState('buyer@annapurna.com');
  const [password, setPassword] = useState('password123');
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
        err instanceof Error
          ? err.message
          : 'Authentication failed. Please check your credentials.',
      );
    } finally {
      setSubmitting(false);
    }
  };

  const handleSelectDemoUser = (demoEmail: string) => {
    setEmail(demoEmail);
    setPassword('password123');
    setErrorMsg(null);
  };

  /* =========================================================
     LOADING
     ========================================================= */

  if (authLoading) {
    return (
      <main className="min-h-screen flex items-center justify-center bg-[#F4F1E8]">
        <div className="flex items-center gap-3 text-[#17633F]">
          <Loader2 className="h-5 w-5 animate-spin" />
          <span className="text-sm font-medium">
            Loading workspace...
          </span>
        </div>
      </main>
    );
  }

  /* =========================================================
     LOGIN PAGE
     ========================================================= */

  return (
    <main className="min-h-screen bg-[#F4F1E8] flex items-center justify-center px-4 py-8 sm:px-6 lg:px-10">

      {/* =====================================================
          MAIN CARD
          ===================================================== */}

      <div
        className="
          w-full
          max-w-[1180px]
          min-h-[680px]
          bg-white
          border
          border-[#D9DED9]
          rounded-[20px]
          overflow-hidden
          shadow-[0_12px_40px_rgba(18,60,44,0.08)]
          grid
          grid-cols-1
          lg:grid-cols-[0.95fr_1.05fr]
        "
      >

        {/* ===================================================
            LEFT BRAND PANEL
            =================================================== */}

        <section
          className="
            relative
            bg-[#123C2C]
            text-white
            px-8
            py-9
            sm:px-12
            sm:py-11
            lg:px-14
            lg:py-12
            flex
            flex-col
          "
        >

          {/* Subtle grid — deliberately very light */}

          <div
            className="
              absolute
              inset-0
              opacity-[0.025]
              pointer-events-none
            "
            style={{
              backgroundImage: `
                linear-gradient(#FFFFFF 1px, transparent 1px),
                linear-gradient(90deg, #FFFFFF 1px, transparent 1px)
              `,
              backgroundSize: '44px 44px',
            }}
          />

          <div className="relative z-10 flex flex-col h-full">

            {/* -------------------------------------------------
                BRAND
                ------------------------------------------------- */}

            <div className="flex items-center gap-3">

              <div
                className="
                  h-11
                  w-11
                  shrink-0
                  rounded-[11px]
                  bg-[#17633F]
                  border
                  border-[#B8D99F]/30
                  flex
                  items-center
                  justify-center
                  text-[#B8D99F]
                  font-heading
                  font-bold
                  text-xl
                "
              >
                A
              </div>

              <div>
                <div
                  className="
                    font-heading
                    text-[18px]
                    font-semibold
                    tracking-[0.01em]
                    text-white
                    leading-none
                  "
                >
                  ANNAPURNA
                </div>

                <div
                  className="
                    mt-1.5
                    text-[9px]
                    uppercase
                    tracking-[0.16em]
                    font-semibold
                    text-[#B8D99F]
                  "
                >
                  Smart Agricultural Network
                </div>
              </div>

            </div>

            {/* -------------------------------------------------
                MAIN MESSAGE
                ------------------------------------------------- */}

            <div className="mt-auto mb-auto pt-20 lg:pt-24">

              <div
                className="
                  inline-flex
                  items-center
                  gap-2
                  px-3
                  py-1.5
                  rounded-full
                  border
                  border-[#B8D99F]/25
                  bg-white/[0.05]
                  text-[#B8D99F]
                  text-[10px]
                  font-heading
                  font-semibold
                  uppercase
                  tracking-[0.12em]
                "
              >
                <span className="h-1.5 w-1.5 rounded-full bg-[#B8D99F]" />

                Agricultural Procurement Network
              </div>

              <h1
                className="
                  mt-7
                  max-w-[500px]
                  font-heading
                  text-[36px]
                  sm:text-[42px]
                  lg:text-[46px]
                  font-semibold
                  leading-[1.08]
                  tracking-[-0.025em]
                  text-white
                "
              >
                Better visibility.
                <br />

                <span className="text-[#B8D99F]">
                  Better procurement.
                </span>
              </h1>

              <p
                className="
                  mt-6
                  max-w-[500px]
                  text-[14px]
                  sm:text-[15px]
                  leading-7
                  text-white/70
                "
              >
                Connect agricultural supply with buyer requirements using
                market intelligence, verified physical lots, quality evidence,
                and transparent procurement matching.
              </p>

              {/* -------------------------------------------------
                  CORE CAPABILITIES
                  ------------------------------------------------- */}

              <div className="mt-10 grid grid-cols-3 gap-3 max-w-[520px]">

                <Capability
                  icon={Store}
                  title="Market"
                  description="Price intelligence"
                />

                <Capability
                  icon={Sprout}
                  title="Supply"
                  description="Physical lots"
                />

                <Capability
                  icon={FlaskConical}
                  title="Quality"
                  description="Verified evidence"
                />

              </div>

            </div>

            {/* -------------------------------------------------
                BOTTOM STATUS
                ------------------------------------------------- */}

            <div
              className="
                pt-5
                border-t
                border-white/10
                flex
                items-center
                justify-between
                gap-4
              "
            >

              <div className="flex items-center gap-2.5">

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
                  <ShieldCheck className="h-3.5 w-3.5 text-[#B8D99F]" />
                </div>

                <div>
                  <div
                    className="
                      text-[10px]
                      font-heading
                      font-semibold
                      text-white
                    "
                  >
                    Secure application environment
                  </div>

                  <div className="text-[9px] text-white/40 mt-0.5">
                    Role-based access
                  </div>
                </div>

              </div>

              <span
                className="
                  hidden
                  sm:block
                  text-[10px]
                  font-mono
                  text-[#B8D99F]
                "
              >
                PostgreSQL · PostGIS
              </span>

            </div>

          </div>
        </section>

        {/* ===================================================
            RIGHT LOGIN PANEL
            =================================================== */}

        <section
          className="
            bg-white
            px-7
            py-9
            sm:px-12
            sm:py-12
            lg:px-16
            lg:py-14
            flex
            items-center
          "
        >

          <div className="w-full max-w-[500px] mx-auto">

            {/* -------------------------------------------------
                HEADER
                ------------------------------------------------- */}

            <div className="mb-8">

              <div
                className="
                  text-[10px]
                  font-heading
                  font-semibold
                  uppercase
                  tracking-[0.14em]
                  text-[#78877E]
                "
              >
                Workspace Access
              </div>

              <h2
                className="
                  mt-2
                  font-heading
                  text-[30px]
                  sm:text-[34px]
                  font-semibold
                  tracking-[-0.025em]
                  leading-tight
                  text-[#123C2C]
                "
              >
                Sign in to Annapurna
              </h2>

              <p
                className="
                  mt-3
                  text-[13px]
                  sm:text-[14px]
                  leading-6
                  text-[#657169]
                  max-w-[440px]
                "
              >
                Access your procurement workspace and role-specific
                agricultural intelligence.
              </p>

            </div>

            {/* -------------------------------------------------
                DEMO ROLE SELECTOR
                ------------------------------------------------- */}

            <div className="mb-7">

              <div
                className="
                  mb-2.5
                  text-[10px]
                  font-heading
                  font-semibold
                  uppercase
                  tracking-[0.12em]
                  text-[#657169]
                "
              >
                Demo account
              </div>

              <div
                className="
                  grid
                  grid-cols-5
                  gap-1
                  p-1
                  bg-[#F8F9F6]
                  border
                  border-[#D9DED9]
                  rounded-[10px]
                "
              >

                {DEMO_USERS.map((demo) => {

                  const Icon = demo.icon;

                  const isSelected =
                    email === demo.email;

                  return (
                    <button
                      key={demo.email}
                      type="button"
                      onClick={() =>
                        handleSelectDemoUser(demo.email)
                      }
                      className={`
                        min-h-[48px]
                        px-1
                        rounded-[7px]
                        flex
                        flex-col
                        items-center
                        justify-center
                        gap-1
                        font-heading
                        text-[10px]
                        transition-colors
                        ${
                          isSelected
                            ? `
                              bg-white
                              text-[#17633F]
                              border
                              border-[#D9DED9]
                              shadow-sm
                            `
                            : `
                              text-[#657169]
                              border
                              border-transparent
                              hover:bg-white/70
                              hover:text-[#17633F]
                            `
                        }
                      `}
                    >

                      <Icon className="h-3.5 w-3.5" />

                      <span className="font-semibold">
                        {demo.roleName}
                      </span>

                    </button>
                  );
                })}

              </div>
            </div>

            {/* -------------------------------------------------
                ERROR
                ------------------------------------------------- */}

            {errorMsg && (
              <div
                className="
                  mb-6
                  flex
                  items-start
                  gap-3
                  rounded-[10px]
                  border
                  border-[#F1C8C3]
                  bg-[#FDEEEC]
                  px-3.5
                  py-3
                  text-[#7F211C]
                "
                role="alert"
              >

                <AlertCircle className="h-4 w-4 shrink-0 mt-0.5" />

                <div className="text-[12px] leading-5">
                  <div className="font-heading font-semibold">
                    Sign in failed
                  </div>

                  <div className="mt-0.5">
                    {errorMsg}
                  </div>
                </div>

              </div>
            )}

            {/* -------------------------------------------------
                LOGIN FORM
                ------------------------------------------------- */}

            <form
              onSubmit={handleSubmit}
              className="space-y-5"
            >

              {/* EMAIL */}

              <div>

                <label
                  htmlFor="email-input"
                  className="
                    block
                    mb-2
                    text-[11px]
                    font-heading
                    font-semibold
                    uppercase
                    tracking-[0.08em]
                    text-[#26332D]
                  "
                >
                  Email address
                </label>

                <div className="relative">

                  <Mail
                    className="
                      absolute
                      left-3.5
                      top-1/2
                      -translate-y-1/2
                      h-4
                      w-4
                      text-[#78877E]
                      pointer-events-none
                      z-10
                    "
                  />

                  <input
                    id="email-input"
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="buyer@annapurna.com"
                    required
                    autoComplete="email"
                    className="
                      w-full
                      h-[46px]
                      rounded-[9px]
                      border
                      border-[#D9DED9]
                      bg-white
                      pl-[42px]
                      pr-4
                      text-[13px]
                      text-[#26332D]
                      placeholder:text-[#98A19B]
                      outline-none
                      transition
                      focus:border-[#17633F]
                      focus:ring-[3px]
                      focus:ring-[#17633F]/10
                      hover:border-[#C8D0CA]
                    "
                  />

                </div>

              </div>

              {/* PASSWORD */}

              <div>

                <div className="flex items-center justify-between mb-2">

                  <label
                    htmlFor="password-input"
                    className="
                      text-[11px]
                      font-heading
                      font-semibold
                      uppercase
                      tracking-[0.08em]
                      text-[#26332D]
                    "
                  >
                    Password
                  </label>

                </div>

                <div className="relative">

                  <LockKeyhole
                    className="
                      absolute
                      left-3.5
                      top-1/2
                      -translate-y-1/2
                      h-4
                      w-4
                      text-[#78877E]
                      pointer-events-none
                      z-10
                    "
                  />

                  <input
                    id="password-input"
                    type="password"
                    value={password}
                    onChange={(e) =>
                      setPassword(e.target.value)
                    }
                    placeholder="Enter your password"
                    required
                    autoComplete="current-password"
                    className="
                      w-full
                      h-[46px]
                      rounded-[9px]
                      border
                      border-[#D9DED9]
                      bg-white
                      pl-[42px]
                      pr-4
                      text-[13px]
                      text-[#26332D]
                      placeholder:text-[#98A19B]
                      outline-none
                      transition
                      focus:border-[#17633F]
                      focus:ring-[3px]
                      focus:ring-[#17633F]/10
                      hover:border-[#C8D0CA]
                    "
                  />

                </div>

              </div>

              {/* SUBMIT */}

              <button
                type="submit"
                disabled={submitting}
                className="
                  w-full
                  h-[46px]
                  mt-2
                  rounded-[9px]
                  bg-[#17633F]
                  border
                  border-[#17633F]
                  text-white
                  flex
                  items-center
                  justify-center
                  gap-2
                  font-heading
                  text-[13px]
                  font-semibold
                  transition
                  hover:bg-[#124D31]
                  hover:border-[#124D31]
                  active:translate-y-px
                  disabled:opacity-60
                  disabled:cursor-not-allowed
                "
              >

                {submitting ? (
                  <>
                    <Loader2 className="h-4 w-4 animate-spin" />
                    <span>Signing in...</span>
                  </>
                ) : (
                  <>
                    <span>Enter workspace</span>
                    <ArrowRight className="h-4 w-4" />
                  </>
                )}

              </button>

            </form>

            {/* -------------------------------------------------
                DEMO INFORMATION
                ------------------------------------------------- */}

            <div
              className="
                mt-8
                pt-5
                border-t
                border-[#E5E8E4]
              "
            >

              <div className="flex items-start gap-3">

                <div
                  className="
                    h-8
                    w-8
                    shrink-0
                    rounded-md
                    bg-[#EAF3EC]
                    text-[#17633F]
                    flex
                    items-center
                    justify-center
                  "
                >
                  <ShieldCheck className="h-4 w-4" />
                </div>

                <div>

                  <div
                    className="
                      text-[11px]
                      font-heading
                      font-semibold
                      text-[#26332D]
                    "
                  >
                    Demonstration environment
                  </div>

                  <p
                    className="
                      mt-1
                      text-[11px]
                      leading-5
                      text-[#78877E]
                    "
                  >
                    Use the demo roles above to explore the
                    Annapurna procurement workflows.
                  </p>

                  <div className="mt-2 flex items-center gap-2">

                    <span className="text-[10px] text-[#78877E]">
                      Password
                    </span>

                    <code
                      className="
                        px-1.5
                        py-0.5
                        rounded
                        bg-[#F8F9F6]
                        border
                        border-[#D9DED9]
                        text-[10px]
                        text-[#26332D]
                        font-mono
                      "
                    >
                      password123
                    </code>

                  </div>

                </div>

              </div>

            </div>

          </div>

        </section>
      </div>
    </main>
  );
}

/* ===========================================================
   CAPABILITY CARD
   =========================================================== */

function Capability({
  icon: Icon,
  title,
  description,
}: {
  icon: React.ComponentType<{ className?: string }>;
  title: string;
  description: string;
}) {
  return (
    <div
      className="
        min-h-[88px]
        rounded-[10px]
        border
        border-white/10
        bg-white/[0.045]
        px-3
        py-3
      "
    >

      <Icon className="h-4 w-4 text-[#B8D99F] mb-3" />

      <div
        className="
          text-[11px]
          font-heading
          font-semibold
          text-white
        "
      >
        {title}
      </div>

      <div
        className="
          mt-0.5
          text-[9px]
          text-white/45
        "
      >
        {description}
      </div>

    </div>
  );
}