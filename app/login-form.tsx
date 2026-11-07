"use client";

import { useActionState, useState } from "react";
import Image from "next/image";
import { signInBusiness } from "@/app/actions/auth";
import PerspectiveGrid from "@/components/ui/perspective-grid";

export default function LoginForm() {
  const [state, action, pending] = useActionState(signInBusiness, null);
  const [showPassword, setShowPassword] = useState(false);

  return (
    <main className="relative flex min-h-screen w-full items-center justify-center overflow-hidden bg-[#090909] px-5 py-8 text-[#f7f7f2] sm:px-8">
      <div className="absolute inset-0">
        <PerspectiveGrid />
      </div>
      <div className="relative z-20 grid min-h-[min(760px,calc(100vh-4rem))] w-full max-w-6xl overflow-hidden rounded-[2rem] border border-white/15 bg-white/[0.045] shadow-[0_24px_100px_rgba(0,0,0,0.6)] backdrop-blur-2xl md:grid-cols-[1.05fr_0.95fr]">
        <section className="relative flex flex-col justify-between overflow-hidden border-b border-white/10 bg-white/[0.035] p-8 text-white sm:p-12 md:border-b-0 md:border-r">
          <div className="pointer-events-none absolute -left-40 top-1/2 h-[34rem] w-[34rem] -translate-y-1/2 rounded-full bg-[#1d8cff]/20 blur-[100px]" />
          <div className="pointer-events-none absolute left-10 top-1/2 h-64 w-64 -translate-y-1/2 rounded-full bg-[#ff7918]/15 blur-[85px]" />
          <div className="pointer-events-none absolute -right-24 -top-24 h-80 w-80 rounded-full border border-white/10" />
          <div className="pointer-events-none absolute -right-8 -top-8 h-48 w-48 rounded-full border border-white/10" />

          <div className="relative flex items-center gap-3">
            <Image
              alt="Bawat Pieza"
              className="h-10 w-10 object-contain"
              height={40}
              priority
              src="/bawat-pieza-logo.png"
              width={40}
            />
            <span className="text-sm font-semibold tracking-[0.18em]">
              BAWAT PIEZA
            </span>
          </div>

          <div className="relative flex flex-1 items-center justify-center py-12 md:py-8">
            <Image
              alt="Bawat Pieza logo"
              className="h-auto w-[min(78%,25rem)] object-contain drop-shadow-[0_0_35px_rgba(29,140,255,0.35)]"
              height={1024}
              priority
              src="/bawat-pieza-logo.png"
              width={1024}
            />
          </div>

          <div className="relative max-w-md">
            <p className="text-xs font-semibold uppercase tracking-[0.24em] text-[#ffab70]">
              Business portal
            </p>
            <p className="mt-4 text-xl font-medium leading-8 tracking-[-0.02em] text-white/90 sm:text-2xl">
              &ldquo;Powering better spaces, together.&rdquo;
            </p>
            <p className="mt-3 text-xs leading-5 text-white/45">
              Secure access for authorized business users.
            </p>
          </div>
        </section>

        <section className="flex items-center justify-center bg-black/20 px-6 py-12 sm:px-12">
          <div className="w-full max-w-sm">
            <p className="text-sm font-medium text-[#9b9b93]">Welcome back</p>
            <h2 className="mt-2 text-3xl font-semibold tracking-[-0.04em]">
              Sign in to your account
            </h2>
            <p className="mt-3 text-sm leading-6 text-[#9b9b93]">
              Use the email address and password assigned to your business
              account.
            </p>

            <form action={action} className="mt-9 space-y-5">
              <div>
                <label
                  className="mb-2 block text-sm font-medium"
                  htmlFor="email"
                >
                  Business email
                </label>
                <input
                  autoComplete="username"
                  className="h-12 w-full rounded-xl border border-[#dce3dd] bg-white px-4 text-sm outline-none transition placeholder:text-[#a0aaa3] focus:border-[#3b7557] focus:ring-4 focus:ring-[#3b7557]/10"
                  id="email"
                  name="email"
                  placeholder="you@company.com"
                  required
                  type="email"
                />
              </div>

              <div>
                <label
                  className="mb-2 block text-sm font-medium"
                  htmlFor="password"
                >
                  Password
                </label>
                <div className="relative">
                  <input
                    autoComplete="current-password"
                    className="h-12 w-full rounded-xl border border-[#dce3dd] bg-white px-4 pr-12 text-sm outline-none transition placeholder:text-[#a0aaa3] focus:border-[#3b7557] focus:ring-4 focus:ring-[#3b7557]/10"
                    id="password"
                    name="password"
                    placeholder="Enter your password"
                    required
                    type={showPassword ? "text" : "password"}
                  />
                  <button
                    aria-label={showPassword ? "Hide password" : "Show password"}
                    className="absolute inset-y-0 right-0 flex w-12 items-center justify-center text-[#7d8780] transition hover:text-[#214d38] focus-visible:outline-2 focus-visible:outline-offset-[-4px] focus-visible:outline-[#214d38]"
                    onClick={() => setShowPassword((visible) => !visible)}
                    type="button"
                  >
                    {showPassword ? (
                      <svg aria-hidden="true" fill="none" height="19" viewBox="0 0 24 24" width="19">
                        <path d="M3 3l18 18M10.6 10.7a2 2 0 0 0 2.7 2.7M9.9 5.2A10.7 10.7 0 0 1 12 5c5.1 0 8.5 3.8 9.7 7a11.8 11.8 0 0 1-3.1 4.5M6.2 6.2A12.6 12.6 0 0 0 2.3 12c1.2 3.2 4.6 7 9.7 7 1.4 0 2.7-.3 3.8-.8" stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.7" />
                      </svg>
                    ) : (
                      <svg aria-hidden="true" fill="none" height="19" viewBox="0 0 24 24" width="19">
                        <path d="M2.3 12C3.5 8.8 6.9 5 12 5s8.5 3.8 9.7 7c-1.2 3.2-4.6 7-9.7 7s-8.5-3.8-9.7-7Z" stroke="currentColor" strokeLinejoin="round" strokeWidth="1.7" />
                        <circle cx="12" cy="12" r="2.8" stroke="currentColor" strokeWidth="1.7" />
                      </svg>
                    )}
                  </button>
                </div>
              </div>

              {state?.error ? (
                <p
                  aria-live="polite"
                  className="rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-800"
                  role="alert"
                >
                  {state.error}
                </p>
              ) : null}

              <button
                className="flex h-12 w-full items-center justify-center rounded-xl bg-[#214d38] px-4 text-sm font-semibold text-white transition hover:bg-[#183d2d] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#214d38] disabled:cursor-not-allowed disabled:opacity-60"
                disabled={pending}
                type="submit"
              >
                {pending ? "Signing in..." : "Sign in"}
              </button>
            </form>

            <p className="mt-8 text-center text-xs leading-5 text-[#87928b]">
              Need access? Contact your business administrator.
            </p>
          </div>
        </section>
      </div>
    </main>
  );
}
