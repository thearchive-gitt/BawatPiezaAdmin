"use client";

import { useActionState } from "react";
import {
  setBusinessAccountActive,
  type BusinessAccountStatusState,
} from "@/app/actions/business-accounts";

const initialState: BusinessAccountStatusState = null;

export function BusinessAccountStatusButton({
  accountId,
  isActive,
}: {
  accountId: string;
  isActive: boolean;
}) {
  const [state, action, pending] = useActionState(
    setBusinessAccountActive,
    initialState,
  );
  const nextActive = !isActive;

  return (
    <div className="min-w-32">
      <form action={action}>
        <input name="accountId" type="hidden" value={accountId} />
        <input
          name="isActive"
          type="hidden"
          value={nextActive ? "true" : "false"}
        />
        <button
          className={`rounded-lg px-3 py-2 text-xs font-semibold transition disabled:cursor-not-allowed disabled:opacity-60 ${
            isActive
              ? "border border-[#efd1ce] text-[#a34339] hover:bg-[#fff1ef]"
              : "bg-[#214d38] text-white hover:bg-[#183d2d]"
          }`}
          disabled={pending}
          type="submit"
        >
          {pending
            ? "Saving..."
            : isActive
              ? "Deactivate"
              : "Activate"}
        </button>
      </form>
      {state?.error ? (
        <p aria-live="polite" className="mt-1 text-[11px] text-red-700" role="alert">
          {state.error}
        </p>
      ) : state?.success ? (
        <p aria-live="polite" className="mt-1 text-[11px] text-[#276344]" role="status">
          {state.success}
        </p>
      ) : null}
    </div>
  );
}
