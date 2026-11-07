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
              ? "border border-[#6b3030] text-[#ff8585] hover:bg-[#351719]"
              : "bg-[#f97316] text-[#090909] hover:bg-[#fb923c]"
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
        <p aria-live="polite" className="mt-1 text-[11px] text-[#ff8585]" role="alert">
          {state.error}
        </p>
      ) : state?.success ? (
        <p aria-live="polite" className="mt-1 text-[11px] text-[#72d98d]" role="status">
          {state.success}
        </p>
      ) : null}
    </div>
  );
}
