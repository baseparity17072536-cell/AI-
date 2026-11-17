"use client";

import { useEffect, useRef } from "react";
import { AlertTriangle } from "lucide-react";

type Props = {
  open: boolean;
  title: string;
  message: string;
  confirmLabel?: string;
  onConfirm: () => void;
  onCancel: () => void;
};

/** Accessible confirm dialog (native <dialog>: focus trap, Esc to cancel). Used before every delete. */
export function ConfirmDialog({ open, title, message, confirmLabel = "ลบ", onConfirm, onCancel }: Props) {
  const ref = useRef<HTMLDialogElement>(null);

  useEffect(() => {
    const d = ref.current;
    if (!d) return;
    if (open && !d.open) d.showModal();
    if (!open && d.open) d.close();
  }, [open]);

  return (
    <dialog
      ref={ref}
      onCancel={(e) => {
        e.preventDefault();
        onCancel();
      }}
      aria-labelledby="confirm-title"
      className="m-auto w-[min(92vw,420px)] rounded-2xl border border-lux-gold/40 bg-lux-card p-0 text-stone-100 backdrop:bg-black/70 backdrop:backdrop-blur-sm"
    >
      <div className="p-6">
        <div className="flex items-start gap-3">
          <span className="grid h-10 w-10 shrink-0 place-items-center rounded-full bg-rose-500/15">
            <AlertTriangle className="h-5 w-5 text-rose-300" />
          </span>
          <div>
            <h2 id="confirm-title" className="text-lg font-semibold text-white">
              {title}
            </h2>
            <p className="mt-1 text-sm leading-relaxed text-stone-400">{message}</p>
          </div>
        </div>
        <div className="mt-6 flex justify-end gap-3">
          <button
            type="button"
            autoFocus
            onClick={onCancel}
            className="rounded-full border border-lux-gold/50 px-5 py-2 text-sm text-stone-200 hover:bg-lux-gold/10"
          >
            ยกเลิก
          </button>
          <button
            type="button"
            onClick={onConfirm}
            className="rounded-full bg-rose-500 px-5 py-2 text-sm font-semibold text-white hover:bg-rose-400"
          >
            {confirmLabel}
          </button>
        </div>
      </div>
    </dialog>
  );
}
