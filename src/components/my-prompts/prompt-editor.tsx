"use client";

import { useEffect, useRef, useState } from "react";
import { X } from "lucide-react";
import { CATEGORY_FILTERS } from "@/components/library/types";
import type { CategorySlug } from "@/data/prompts";
import type { SavedPrompt } from "@/lib/my-prompts";

export type EditorValue = Pick<SavedPrompt, "title" | "category" | "promptEn" | "promptTh" | "tags" | "collection">;

type Props = {
  /** null = closed */
  value: EditorValue | null;
  heading: string;
  collections: string[];
  onSave: (v: EditorValue) => void;
  onClose: () => void;
};

const input =
  "w-full rounded-xl border border-lux-gold/35 bg-lux-ink px-3.5 py-2.5 text-white placeholder:text-stone-500 focus:border-lux-bright focus:ring-2 focus:ring-lux-bright/30 focus:outline-none";

/** Create / edit dialog for a saved prompt (title, category, both prompt texts, collection, tags). */
export function PromptEditor({ value, heading, collections, onSave, onClose }: Props) {
  const ref = useRef<HTMLDialogElement>(null);
  const open = value !== null;

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
        onClose();
      }}
      aria-labelledby="editor-title"
      className="m-auto max-h-[90vh] w-[min(94vw,640px)] overflow-y-auto rounded-2xl border border-lux-gold/40 bg-lux-card p-0 text-stone-100 backdrop:bg-black/70 backdrop:backdrop-blur-sm"
    >
      {/* Remount the form for each opened item so it starts from that item's values */}
      {value && <EditorForm key={JSON.stringify(value)} initial={value} heading={heading} collections={collections} onSave={onSave} onClose={onClose} />}
    </dialog>
  );
}

function EditorForm({ initial, heading, collections, onSave, onClose }: Omit<Props, "value"> & { initial: EditorValue }) {
  const [v, setV] = useState(initial);
  const [tagText, setTagText] = useState(initial.tags.join(", "));
  const [error, setError] = useState<string | null>(null);

  function submit(e: React.FormEvent) {
    e.preventDefault();
    if (!v.title.trim()) return setError("กรุณาใส่ชื่อ Prompt");
    if (!v.promptEn.trim() && !v.promptTh.trim()) return setError("กรุณาใส่ข้อความ Prompt อย่างน้อยหนึ่งภาษา");
    const tags = [...new Set(tagText.split(",").map((t) => t.trim()).filter(Boolean))].slice(0, 20);
    onSave({ ...v, title: v.title.trim(), collection: v.collection.trim(), tags });
  }

  return (
    <form onSubmit={submit} className="p-6" noValidate>
      <div className="flex items-center justify-between gap-3">
        <h2 id="editor-title" className="text-xl font-bold text-white">
          {heading}
        </h2>
        <button type="button" onClick={onClose} aria-label="ปิด" className="rounded-full p-1.5 text-stone-400 hover:bg-white/10 hover:text-white">
          <X className="h-5 w-5" />
        </button>
      </div>

      <div className="mt-5 space-y-4">
        <label className="block">
          <span className="text-sm font-semibold text-white">ชื่อ Prompt</span>
          <input className={`${input} mt-1.5`} value={v.title} maxLength={120} onChange={(e) => setV({ ...v, title: e.target.value })} required />
        </label>
        <div className="grid gap-4 sm:grid-cols-2">
          <label className="block">
            <span className="text-sm font-semibold text-white">หมวดหมู่</span>
            <select
              className={`${input} mt-1.5`}
              value={v.category}
              onChange={(e) => setV({ ...v, category: e.target.value as CategorySlug })}
            >
              {CATEGORY_FILTERS.map((c) => (
                <option key={c.slug} value={c.slug}>
                  {c.label}
                </option>
              ))}
            </select>
          </label>
          <label className="block">
            <span className="text-sm font-semibold text-white">คอลเลกชัน</span>
            <input
              className={`${input} mt-1.5`}
              list="collections"
              value={v.collection}
              maxLength={60}
              onChange={(e) => setV({ ...v, collection: e.target.value })}
              placeholder="เช่น ลูกค้าร้านกาแฟ"
            />
            <datalist id="collections">
              {collections.map((c) => (
                <option key={c} value={c} />
              ))}
            </datalist>
          </label>
        </div>
        <label className="block">
          <span className="text-sm font-semibold text-white">Prompt (English)</span>
          <textarea rows={5} className={`${input} mt-1.5 resize-y`} value={v.promptEn} onChange={(e) => setV({ ...v, promptEn: e.target.value })} />
        </label>
        <label className="block">
          <span className="text-sm font-semibold text-white">คำแปลภาษาไทย</span>
          <textarea rows={4} className={`${input} mt-1.5 resize-y`} value={v.promptTh} onChange={(e) => setV({ ...v, promptTh: e.target.value })} />
        </label>
        <label className="block">
          <span className="text-sm font-semibold text-white">Tags</span>
          <input className={`${input} mt-1.5`} value={tagText} onChange={(e) => setTagText(e.target.value)} placeholder="คั่นด้วยจุลภาค เช่น สินค้า, โฆษณา" />
        </label>
      </div>

      {error && (
        <p className="mt-4 rounded-xl border border-rose-400/50 bg-rose-500/10 px-3 py-2 text-sm text-rose-200" role="alert">
          {error}
        </p>
      )}

      <div className="mt-6 flex justify-end gap-3">
        <button type="button" onClick={onClose} className="rounded-full border border-lux-gold/50 px-5 py-2.5 text-sm text-stone-200 hover:bg-lux-gold/10">
          ยกเลิก
        </button>
        <button type="submit" className="rounded-full bg-linear-to-b from-lux-bright to-lux-gold px-6 py-2.5 text-sm font-semibold text-black hover:brightness-110">
          บันทึก
        </button>
      </div>
    </form>
  );
}
