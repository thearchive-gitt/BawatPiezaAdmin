"use client";

import { useActionState, useEffect, useRef, useState } from "react";
import { signOutBusiness } from "@/app/actions/auth";
import {
  updateBusinessProfile,
  type UpdateBusinessProfileState,
} from "@/app/actions/business-accounts";
import { initials } from "./dashboard-primitives";

const initialState: UpdateBusinessProfileState = null;

function EditProfileDialog({
  email,
  profile,
  onClose,
}: {
  email: string;
  profile: {
    firstname: string;
    middlename: string | null;
    lastname: string | null;
    contactNo: string | null;
  };
  onClose: () => void;
}) {
  const dialogRef = useRef<HTMLDialogElement>(null);
  const [state, action, pending] = useActionState(
    updateBusinessProfile,
    initialState,
  );

  useEffect(() => {
    dialogRef.current?.showModal();
  }, []);

  return (
    <dialog
      aria-labelledby="edit-profile-title"
      className="fixed inset-0 z-[60] m-auto max-h-[90vh] w-[calc(100%-2rem)] max-w-lg overflow-y-auto rounded-2xl border border-[#e4e9e2] bg-white p-0 text-[#1d3025] shadow-2xl backdrop:bg-[#11261b]/55"
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
              Account settings
            </p>
            <h2
              className="mt-1 text-xl font-semibold tracking-[-0.03em]"
              id="edit-profile-title"
            >
              Edit profile
            </h2>
          </div>
          <button
            aria-label="Close dialog"
            className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full text-lg text-[#718078] transition hover:bg-[#f2f5f0]"
            onClick={onClose}
            type="button"
          >
            ×
          </button>
        </div>

        <div className="mt-5 grid gap-3 sm:grid-cols-2">
          <label className="text-xs font-medium text-[#526258]">
            First name
            <input
              autoComplete="given-name"
              className="mt-1.5 h-10 w-full rounded-lg border border-[#dce3dd] px-3 text-sm outline-none focus:border-[#3b7557] focus:ring-4 focus:ring-[#3b7557]/10"
              defaultValue={profile.firstname}
              maxLength={100}
              name="firstname"
              required
            />
          </label>
          <label className="text-xs font-medium text-[#526258]">
            Last name
            <input
              autoComplete="family-name"
              className="mt-1.5 h-10 w-full rounded-lg border border-[#dce3dd] px-3 text-sm outline-none focus:border-[#3b7557] focus:ring-4 focus:ring-[#3b7557]/10"
              defaultValue={profile.lastname ?? ""}
              maxLength={100}
              name="lastname"
            />
          </label>
          <label className="text-xs font-medium text-[#526258]">
            Middle name
            <input
              autoComplete="additional-name"
              className="mt-1.5 h-10 w-full rounded-lg border border-[#dce3dd] px-3 text-sm outline-none focus:border-[#3b7557] focus:ring-4 focus:ring-[#3b7557]/10"
              defaultValue={profile.middlename ?? ""}
              maxLength={100}
              name="middlename"
            />
          </label>
          <label className="text-xs font-medium text-[#526258]">
            Contact number
            <input
              autoComplete="tel"
              className="mt-1.5 h-10 w-full rounded-lg border border-[#dce3dd] px-3 text-sm outline-none focus:border-[#3b7557] focus:ring-4 focus:ring-[#3b7557]/10"
              defaultValue={profile.contactNo ?? ""}
              maxLength={30}
              name="contactNo"
              type="tel"
            />
          </label>
          <label className="text-xs font-medium text-[#526258] sm:col-span-2">
            Email
            <input
              className="mt-1.5 h-10 w-full rounded-lg border border-[#e7ebe5] bg-[#f6f8f5] px-3 text-sm text-[#849087]"
              readOnly
              value={email}
            />
            <span className="mt-1 block font-normal text-[#929c95]">
              Email changes require account verification and are not available here.
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
        {state?.success ? (
          <p
            aria-live="polite"
            className="mt-4 rounded-lg border border-[#cce5d2] bg-[#edf8f0] px-3 py-2.5 text-xs text-[#276344]"
            role="status"
          >
            {state.success}
          </p>
        ) : null}

        <div className="mt-6 flex justify-end gap-2">
          <button
            className="rounded-lg border border-[#dce3dd] px-4 py-2.5 text-xs font-semibold text-[#526258] transition hover:bg-[#f5f7f3]"
            onClick={onClose}
            type="button"
          >
            {state?.success ? "Done" : "Cancel"}
          </button>
          {!state?.success ? (
            <button
              className="rounded-lg bg-[#214d38] px-4 py-2.5 text-xs font-semibold text-white transition hover:bg-[#183d2d] disabled:cursor-not-allowed disabled:opacity-60"
              disabled={pending}
              type="submit"
            >
              {pending ? "Saving..." : "Save changes"}
            </button>
          ) : null}
        </div>
      </form>
    </dialog>
  );
}

export function ProfileDropdown({
  email,
  fullName,
  profile,
}: {
  email: string;
  fullName: string;
  profile: {
    firstname: string;
    middlename: string | null;
    lastname: string | null;
    contactNo: string | null;
  };
}) {
  const [editing, setEditing] = useState(false);

  return (
    <>
      <details className="relative">
        <summary
          aria-label="Open profile menu"
          className="flex cursor-pointer list-none items-center gap-2 rounded-full p-1 transition hover:bg-[#f3f6f1] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#3b7557]"
        >
          <span className="hidden text-right sm:block">
            <span className="block text-xs font-semibold text-[#34463a]">
              {fullName || email}
            </span>
            <span className="mt-1 block text-[10px] capitalize text-[#89948c]">
              Business account
            </span>
          </span>
          <span className="flex h-9 w-9 items-center justify-center rounded-full bg-[#dce9bd] text-xs font-bold text-[#28583b]">
            {initials(fullName || email)}
          </span>
          <span aria-hidden="true" className="pr-1 text-xs text-[#718078]">
            ▾
          </span>
        </summary>
        <div className="absolute right-0 top-full z-40 mt-2 w-64 rounded-xl border border-[#e7ebe5] bg-white p-2 shadow-xl">
          <div className="border-b border-[#edf0ec] px-3 py-2">
            <p className="truncate text-xs font-semibold text-[#34463a]">
              {fullName || "Business account"}
            </p>
            <p className="mt-1 truncate text-[11px] text-[#849087]">{email}</p>
          </div>
          <button
            className="mt-1 w-full rounded-lg px-3 py-2.5 text-left text-xs font-medium text-[#526258] transition hover:bg-[#f5f7f3]"
            onClick={(event) => {
              const details = event.currentTarget.closest("details");
              if (details) details.open = false;
              setEditing(true);
            }}
            type="button"
          >
            Edit profile
          </button>
          <form action={signOutBusiness}>
            <button
              className="w-full rounded-lg px-3 py-2.5 text-left text-xs font-medium text-[#a34339] transition hover:bg-[#fff1ef]"
              type="submit"
            >
              Log out
            </button>
          </form>
        </div>
      </details>
      {editing ? (
        <EditProfileDialog
          email={email}
          onClose={() => setEditing(false)}
          profile={profile}
        />
      ) : null}
    </>
  );
}
