"use client";

import { Check, PencilLine } from "lucide-react";
import type { Field, Option } from "@/data/builder/fields";
import { CUSTOM, type Selections } from "@/lib/builder/engine";

type Props = {
  field: Field;
  sel: Selections;
  onValue: (id: string, value: string) => void;
  onCustom: (id: string, value: string) => void;
  /** Overrides field.options (e.g. aspect ratios filtered by platform) */
  options?: Option[];
  note?: string;
};

const chip = "flex items-center gap-1.5 rounded-full border px-3.5 py-2 text-sm transition active:scale-[0.97]";
const on = "border-lux-bright bg-linear-to-b from-lux-bright to-lux-gold font-semibold text-black shadow-[0_0_14px_rgba(245,199,107,0.3)]";
const off = "border-lux-gold/35 bg-lux-ink text-stone-200 hover:border-lux-bright hover:bg-lux-gold/10";
const input =
  "w-full rounded-xl border border-lux-gold/35 bg-lux-ink px-4 py-2.5 text-white placeholder:text-stone-500 focus:border-lux-bright focus:ring-2 focus:ring-lux-bright/30 focus:outline-none";

export function FieldControl({ field, sel, onValue, onCustom, options, note }: Props) {
  const id = `f-${field.id}`;
  const value = sel.values[field.id] ?? "";
  const opts = options ?? field.options ?? [];

  return (
    <fieldset className="min-w-0">
      <legend className="mb-2.5 flex flex-wrap items-baseline gap-x-2 text-sm">
        <span className="font-semibold text-white">{field.label}</span>
        <span className="text-stone-400">{field.labelTh}</span>
      </legend>

      {field.kind === "choice" && (
        <>
          <div className="flex flex-wrap gap-2" role="radiogroup" aria-label={field.label}>
            {opts.map((o) => {
              const active = value === o.id;
              return (
                <button
                  key={o.id}
                  type="button"
                  role="radio"
                  aria-checked={active}
                  // Clicking the selected chip again clears it, so nothing unwanted ends up in the prompt
                  onClick={() => onValue(field.id, active ? "" : o.id)}
                  className={`${chip} ${active ? on : off}`}
                >
                  {active && <Check className="h-3.5 w-3.5" />}
                  {o.label}
                </button>
              );
            })}
            {field.allowCustom && (
              <button
                type="button"
                role="radio"
                aria-checked={value === CUSTOM}
                onClick={() => onValue(field.id, value === CUSTOM ? "" : CUSTOM)}
                className={`${chip} ${value === CUSTOM ? on : off}`}
              >
                <PencilLine className="h-3.5 w-3.5" /> Custom
              </button>
            )}
          </div>
          {value === CUSTOM && (
            <input
              id={id}
              autoFocus
              type={field.id === "duration" ? "number" : "text"}
              min={field.id === "duration" ? 1 : undefined}
              inputMode={field.id === "duration" ? "numeric" : undefined}
              value={sel.custom[field.id] ?? ""}
              onChange={(e) => onCustom(field.id, e.target.value)}
              placeholder={field.id === "duration" ? (field.placeholder ?? "จำนวนวินาที") : "พิมพ์ตัวเลือกของคุณ (แนะนำภาษาอังกฤษ)"}
              aria-label={`${field.label} (custom)`}
              className={`${input} mt-2.5`}
            />
          )}
        </>
      )}

      {field.kind === "text" && (
        <input
          id={id}
          type="text"
          value={value}
          onChange={(e) => onValue(field.id, e.target.value)}
          placeholder={field.placeholder}
          aria-label={field.label}
          className={input}
        />
      )}

      {field.kind === "textarea" && (
        <textarea
          id={id}
          rows={3}
          value={value}
          onChange={(e) => onValue(field.id, e.target.value)}
          placeholder={field.placeholder}
          aria-label={field.label}
          className={`${input} resize-y`}
        />
      )}

      {(note || field.help) && <p className="mt-2 text-xs leading-relaxed text-stone-500">{note ?? field.help}</p>}
    </fieldset>
  );
}
