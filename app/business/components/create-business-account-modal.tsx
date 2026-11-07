"use client";

import { useActionState, useCallback, useEffect, useRef, useState } from "react";
import {
  createBusinessAccount,
  type CreateBusinessAccountState,
} from "@/app/actions/business-accounts";

const initialState: CreateBusinessAccountState = null;

function BusinessAccountDialog({
  onClose,
  onCreated,
}: {
  onClose: () => void;
  onCreated: (message: string) => void;
}) {
  const dialogRef = useRef<HTMLDialogElement>(null);
  const [state, action, pending] = useActionState(
    createBusinessAccount,
    initialState,
  );

  useEffect(() => {
    dialogRef.current?.showModal();
  }, []);

  useEffect(() => {
    if (state?.success) {
      onCreated(state.success);
    }
  }, [onCreated, state]);

  return (
    <dialog
      aria-labelledby="create-business-account-title"
      className="fixed inset-0 z-50 m-auto max-h-[90vh] w-[calc(100%-2rem)] max-w-2xl overflow-y-auto rounded-2xl border border-[#303030] bg-[#111] p-0 text-[#f7f7f2] shadow-2xl backdrop:bg-black/70"
      onCancel={(event) => {
        event.preventDefault();
        onClose();
      }}
      ref={dialogRef}
    >
      <form action={action} className="p-5 sm:p-7">
        <div className="flex items-start justify-between gap-4">
          <div>
            <p className="text-xs font-medium uppercase tracking-[0.14em] text-[#718078]">
              Business accounts
            </p>
            <h2
              className="mt-1 text-xl font-semibold tracking-[-0.03em]"
              id="create-business-account-title"
            >
              Create business account
            </h2>
            <p className="mt-2 max-w-lg text-xs leading-5 text-[#999]">
              Create an Auth login and active business profile. Share the
              temporary password using a separate secure channel.
            </p>
          </div>
          <button
            aria-label="Close dialog"
            className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full text-lg text-[#888] transition hover:bg-[#242424]"
            onClick={onClose}
            type="button"
          >
            ×
          </button>
        </div>

        <div className="mt-5 grid gap-3 sm:grid-cols-2">
          <label className="text-xs font-medium text-[#c8c6bd]">
            First name
            <input
              autoComplete="given-name"
              autoFocus
              className="mt-1.5 h-10 w-full rounded-lg border border-[#363636] bg-[#181818] px-3 text-sm text-[#f0efe9] outline-none focus:border-[#f97316] focus:ring-4 focus:ring-[#f97316]/20"
              maxLength={100}
              name="firstname"
              required
            />
          </label>
          <label className="text-xs font-medium text-[#c8c6bd]">
            Last name
            <input
              autoComplete="family-name"
              className="mt-1.5 h-10 w-full rounded-lg border border-[#363636] bg-[#181818] px-3 text-sm text-[#f0efe9] outline-none focus:border-[#f97316] focus:ring-4 focus:ring-[#f97316]/20"
              maxLength={100}
              name="lastname"
              required
            />
          </label>
          <label className="text-xs font-medium text-[#c8c6bd]">
            Middle name{" "}
            <span className="font-normal text-[#929c95]">Optional</span>
            <input
              autoComplete="additional-name"
              className="mt-1.5 h-10 w-full rounded-lg border border-[#363636] bg-[#181818] px-3 text-sm text-[#f0efe9] outline-none focus:border-[#f97316] focus:ring-4 focus:ring-[#f97316]/20"
              maxLength={100}
              name="middlename"
            />
          </label>
          <label className="text-xs font-medium text-[#c8c6bd]">
            Contact number{" "}
            <span className="font-normal text-[#929c95]">Optional</span>
            <input
              autoComplete="tel"
              className="mt-1.5 h-10 w-full rounded-lg border border-[#363636] bg-[#181818] px-3 text-sm text-[#f0efe9] outline-none focus:border-[#f97316] focus:ring-4 focus:ring-[#f97316]/20"
              maxLength={30}
              name="contactNo"
              type="tel"
            />
          </label>
          <label className="text-xs font-medium text-[#c8c6bd]">
            Business role
            <select
              className="mt-1.5 h-10 w-full rounded-lg border border-[#363636] bg-[#181818] px-3 text-sm text-[#f0efe9] outline-none focus:border-[#f97316] focus:ring-4 focus:ring-[#f97316]/20"
              defaultValue="staff"
              name="role"
              required
            >
              <option value="staff">Staff</option>
              <option value="admin">Admin</option>
            </select>
          </label>
          <label className="text-xs font-medium text-[#c8c6bd]">
            Email
            <input
              autoComplete="email"
              className="mt-1.5 h-10 w-full rounded-lg border border-[#363636] bg-[#181818] px-3 text-sm text-[#f0efe9] outline-none focus:border-[#f97316] focus:ring-4 focus:ring-[#f97316]/20"
              maxLength={254}
              name="email"
              required
              type="email"
            />
          </label>
          <label className="text-xs font-medium text-[#c8c6bd] sm:col-span-2">
            Temporary password
            <input
              autoComplete="new-password"
              className="mt-1.5 h-10 w-full rounded-lg border border-[#363636] bg-[#181818] px-3 text-sm text-[#f0efe9] outline-none focus:border-[#f97316] focus:ring-4 focus:ring-[#f97316]/20"
              maxLength={128}
              minLength={8}
              name="password"
              required
              type="password"
            />
            <span className="mt-1 block font-normal text-[#929c95]">
              At least 8 characters. Do not send it in an account email.
            </span>
          </label>
        </div>

        {state?.error ? (
          <p
            aria-live="polite"
            className="mt-4 rounded-lg border border-red-200 bg-red-50 px-3 py-2.5 text-xs text-red-800"
            role="alert"
          >
            {state.error}
          </p>
        ) : null}

        <div className="mt-6 flex justify-end gap-2">
          <button
            className="rounded-lg border border-[#363636] px-4 py-2.5 text-xs font-semibold text-[#c8c6bd] transition hover:bg-[#242424]"
            onClick={onClose}
            type="button"
          >
            Cancel
          </button>
          <button
            className="rounded-lg bg-[#214d38] px-4 py-2.5 text-xs font-semibold text-white transition hover:bg-[#183d2d] disabled:cursor-not-allowed disabled:opacity-60"
            disabled={pending}
            type="submit"
          >
            {pending ? "Creating account..." : "Create account"}
          </button>
        </div>
      </form>
    </dialog>
  );
}

export function CreateBusinessAccountModal() {
  const [isOpen, setIsOpen] = useState(false);
  const [success, setSuccess] = useState("");

  const handleCreated = useCallback((message: string) => {
    setSuccess(message);
    setIsOpen(false);
  }, []);

  return (
    <>
      <button
        className="rounded-lg bg-[#214d38] px-4 py-2.5 text-xs font-semibold text-white transition hover:bg-[#183d2d]"
        onClick={() => {
          setSuccess("");
          setIsOpen(true);
        }}
        type="button"
      >
        Create business account
      </button>
      {success ? (
        <p
          aria-live="polite"
          className="mt-4 rounded-lg border border-[#cce5d2] bg-[#edf8f0] px-3 py-2.5 text-xs text-[#276344]"
          role="status"
        >
          {success}
        </p>
      ) : null}
      {isOpen ? (
        <BusinessAccountDialog
          onClose={() => setIsOpen(false)}
          onCreated={handleCreated}
        />
      ) : null}
    </>
  );
}
