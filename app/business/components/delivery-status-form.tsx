"use client";

import { useActionState, useEffect, useRef, useState } from "react";
import { updateDeliveryStatus } from "@/app/actions/orders";

type DeliveryStatus = "received" | "preparing" | "pickup" | "delivered" | "cancelled";

type DeliveryStatusFormProps = {
  orderId: string;
  deliveryStatus: DeliveryStatus;
  onStatusUpdated?: (orderId: string, deliveryStatus: DeliveryStatus) => void;
};

const initialState: { success?: string; error?: string } = {};

export function DeliveryStatusForm({ orderId, deliveryStatus, onStatusUpdated }: DeliveryStatusFormProps) {
  const [state, action, pending] = useActionState(updateDeliveryStatus, initialState);
  const [selectedStatus, setSelectedStatus] = useState(deliveryStatus);
  const dialogRef = useRef<HTMLDialogElement>(null);

  useEffect(() => {
    if (state.success) {
      onStatusUpdated?.(orderId, selectedStatus);
      dialogRef.current?.showModal();
    }
  }, [onStatusUpdated, orderId, selectedStatus, state.success]);

  return (
    <>
      <form action={action} className="flex items-center gap-2">
        <input name="orderId" type="hidden" value={orderId} />
        <select
          className="rounded-lg border border-[#363636] bg-[#191919] px-2 py-2 text-[10px] text-[#f7f7f2]"
          value={selectedStatus}
          name="deliveryStatus"
          disabled={pending}
          onChange={(event) => setSelectedStatus(event.target.value as DeliveryStatus)}
        >
          <option value="received">Order received</option>
          <option value="preparing">Preparing order</option>
          <option value="pickup">Courier pickup</option>
          <option value="delivered">Delivered</option>
          <option value="cancelled">Cancelled</option>
        </select>
        <button className="rounded-lg bg-[#f97316] px-2.5 py-2 text-[10px] font-semibold text-white hover:bg-[#ea580c] disabled:cursor-wait disabled:opacity-60" disabled={pending} type="submit">
          {pending ? "Saving..." : "Update"}
        </button>
      </form>
      {state.error && <p className="mt-2 text-[10px] text-[#ff8585]" role="alert">{state.error}</p>}
      <dialog
        aria-labelledby={`delivery-status-success-${orderId}`}
        className="fixed inset-0 z-50 m-auto w-[calc(100%-2rem)] max-w-sm rounded-2xl border border-[#383838] bg-[#171717] p-6 text-[#f7f7f2] shadow-2xl backdrop:bg-black/70"
        ref={dialogRef}
      >
        <div className="text-center">
          <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-[#173b26] text-2xl text-[#72d98d]" aria-hidden="true">✓</div>
          <h2 className="mt-4 text-lg font-semibold" id={`delivery-status-success-${orderId}`}>Status updated</h2>
          <p className="mt-2 text-sm text-[#aaa]">{state.success}</p>
          <button className="mt-5 rounded-lg bg-[#f97316] px-5 py-2 text-sm font-semibold text-white hover:bg-[#ea580c]" onClick={() => dialogRef.current?.close()} type="button">Done</button>
        </div>
      </dialog>
    </>
  );
}
