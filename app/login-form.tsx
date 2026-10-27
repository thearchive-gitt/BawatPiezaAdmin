"use client";

import { useActionState } from "react";
import { signInBusiness } from "@/app/actions/auth";

export default function LoginForm() {
  const [state, action, pending] = useActionState(signInBusiness, null);

  return (
    <main className="flex min-h-screen items-center justify-center bg-[#f4f3ed] px-5 py-12 text-[#17261e]">
      <div className="grid w-full max-w-5xl overflow-hidden rounded-[2rem] bg-white shadow-[0_24px_80px_rgba(27,46,36,0.12)] md:min-h-[620px] md:grid-cols-[1.05fr_0.95fr]">
        <section className="relative flex flex-col justify-between overflow-hidden bg-[#183d2d] p-8 text-white sm:p-12">
          <div className="absolute -right-20 -top-20 h-72 w-72 rounded-full border border-white/10" />
          <div className="absolute -right-8 -top-8 h-48 w-48 rounded-full border border-white/10" />
          <div className="relative">
            <div className="flex items-center gap-3">
              <span className="flex h-11 w-11 items-center justify-center rounded-2xl bg-[#d7e8a4] text-lg font-bold text-[#183d2d]">
                BP
              </span>
              <span className="text-sm font-semibold tracking-[0.18em]">
                BAWAT PIEZA
              </span>
            </div>
          </div>

          <div className="relative my-16 max-w-md">
            <p className="mb-5 text-xs font-semibold uppercase tracking-[0.24em] text-[#c5d995]">
              Business portal
            </p>
            <h1 className="text-4xl font-semibold leading-tight tracking-[-0.04em] sm:text-5xl">
              Powering better spaces, together.
            </h1>
            <p className="mt-6 max-w-sm text-base leading-7 text-white/70">
              Sign in to manage your business operations and energy system.
            </p>
          </div>

          <p className="relative text-xs text-white/50">
            Secure access for authorized business users.
          </p>
        </section>

        <section className="flex items-center justify-center px-6 py-12 sm:px-12">
          <div className="w-full max-w-sm">
            <p className="text-sm font-medium text-[#718078]">Welcome back</p>
            <h2 className="mt-2 text-3xl font-semibold tracking-[-0.04em]">
              Sign in to your account
            </h2>
            <p className="mt-3 text-sm leading-6 text-[#718078]">
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
                <input
                  autoComplete="current-password"
                  className="h-12 w-full rounded-xl border border-[#dce3dd] bg-white px-4 text-sm outline-none transition placeholder:text-[#a0aaa3] focus:border-[#3b7557] focus:ring-4 focus:ring-[#3b7557]/10"
                  id="password"
                  name="password"
                  placeholder="Enter your password"
                  required
                  type="password"
                />
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
