"use client";

import Link from "next/link";
import { useMemo, useState } from "react";
import {
  ArrowDownUp,
  Bookmark,
  Clock,
  Copy as CopyIcon,
  ExternalLink,
  FolderOpen,
  Heart,
  PencilLine,
  Plus,
  Search,
  Sparkles,
  Trash2,
  Wand2,
  X,
} from "lucide-react";
import { CopyPromptButton } from "@/components/library/prompt-actions";
import { LibraryCard } from "@/components/library/library-card";
import { builderHref, CATEGORY_FILTERS, categoryLabel, detailHref, type LibraryPrompt } from "@/components/library/types";
import { ConfirmDialog } from "@/components/ui/confirm-dialog";
import { libraryPrompts } from "@/data/library";
import type { CategorySlug } from "@/data/prompts";
import { useFavorites } from "@/lib/favorites";
import {
  deletePrompt,
  duplicatePrompt,
  recentStore,
  savedStore,
  savePrompt,
  trackRecent,
  updatePrompt,
  type SavedPrompt,
} from "@/lib/my-prompts";
import { PromptEditor, type EditorValue } from "./prompt-editor";

type Tab = "saved" | "created" | "favorites" | "recent";
type Sort = "date" | "name" | "category";

const TABS: { id: Tab; label: string; icon: typeof Bookmark; desc: string }[] = [
  { id: "saved", label: "Saved Prompts", icon: Bookmark, desc: "Prompt จากคลังที่บันทึกสำเนาไว้แก้ไข" },
  { id: "created", label: "Created Prompts", icon: Sparkles, desc: "Prompt ที่สร้างจาก Builder, Planner หรือเขียนเอง" },
  { id: "favorites", label: "Favorite Prompts", icon: Heart, desc: "Prompt ในคลังที่กดหัวใจไว้" },
  { id: "recent", label: "Recently Used", icon: Clock, desc: "Prompt ที่เปิดดู คัดลอก หรือปรับแต่งล่าสุด" },
];

const libById = new Map(libraryPrompts.map((p) => [p.id, p]));
const isCreated = (p: SavedPrompt) => p.source.type !== "library";
const sourceLibraryId = (p: SavedPrompt) =>
  p.source.type === "library" ? p.source.libraryId : p.source.type === "builder" ? p.source.libraryId : undefined;

export function MyPrompts() {
  const saved = savedStore.use();
  const recent = recentStore.use();
  const { ids: favoriteIds, toggle: toggleFavorite } = useFavorites();

  const [tab, setTab] = useState<Tab>("saved");
  const [query, setQuery] = useState("");
  const [category, setCategory] = useState<CategorySlug | "all">("all");
  const [collection, setCollection] = useState("");
  const [tag, setTag] = useState("");
  const [sort, setSort] = useState<Sort>("date");
  const [editing, setEditing] = useState<{ id: string | null; value: EditorValue } | null>(null);
  const [renaming, setRenaming] = useState<{ id: string; title: string } | null>(null);
  const [toDelete, setToDelete] = useState<SavedPrompt | null>(null);
  const [expanded, setExpanded] = useState<string | null>(null);

  const q = query.trim().toLowerCase();
  const collections = useMemo(() => [...new Set(saved.map((p) => p.collection).filter(Boolean))].sort(), [saved]);
  const tags = useMemo(() => [...new Set(saved.flatMap((p) => p.tags))].sort(), [saved]);

  const matchesSaved = (p: SavedPrompt) =>
    (category === "all" || p.category === category) &&
    (!collection || p.collection === collection) &&
    (!tag || p.tags.includes(tag)) &&
    (!q || [p.title, p.promptEn, p.promptTh, p.collection, categoryLabel(p.category), ...p.tags].join(" ").toLowerCase().includes(q));
  const matchesLibrary = (p: LibraryPrompt) =>
    (category === "all" || p.category === category) &&
    (!q || [p.title, p.description, categoryLabel(p.category), ...p.keywords].join(" ").toLowerCase().includes(q));

  const sortSaved = (list: SavedPrompt[]) =>
    [...list].sort((a, b) =>
      sort === "name"
        ? a.title.localeCompare(b.title, "th")
        : sort === "category"
          ? categoryLabel(a.category).localeCompare(categoryLabel(b.category)) || b.updatedAt.localeCompare(a.updatedAt)
          : b.updatedAt.localeCompare(a.updatedAt),
    );
  const sortLibrary = (list: LibraryPrompt[]) =>
    sort === "name"
      ? [...list].sort((a, b) => a.title.localeCompare(b.title, "en"))
      : sort === "category"
        ? [...list].sort((a, b) => categoryLabel(a.category).localeCompare(categoryLabel(b.category)))
        : list;

  const savedList = sortSaved(saved.filter((p) => (tab === "created" ? isCreated(p) : !isCreated(p)) && matchesSaved(p)));
  const favoriteList = sortLibrary(
    // newest favorite first for "date"
    [...favoriteIds].reverse().map((id) => libById.get(id)).filter((p): p is LibraryPrompt => !!p && matchesLibrary(p)),
  );
  const recentList = recent
    .map((r) => ({ r, lib: r.kind === "library" ? libById.get(r.id) : undefined, own: r.kind === "saved" ? saved.find((s) => s.id === r.id) : undefined }))
    .filter(({ lib, own }) => (lib ? matchesLibrary(lib) : own ? matchesSaved(own) : false));

  const counts: Record<Tab, number> = {
    saved: saved.filter((p) => !isCreated(p)).length,
    created: saved.filter(isCreated).length,
    favorites: favoriteIds.filter((id) => libById.has(id)).length,
    recent: recent.length,
  };
  const filtersActive = q !== "" || category !== "all" || collection !== "" || tag !== "";
  const clearFilters = () => {
    setQuery("");
    setCategory("all");
    setCollection("");
    setTag("");
  };

  function openNew() {
    setEditing({ id: null, value: { title: "", category: "content", promptEn: "", promptTh: "", tags: [], collection } });
  }
  function saveEditor(v: EditorValue) {
    if (editing?.id) updatePrompt(editing.id, v);
    else {
      savePrompt({ ...v, source: { type: "manual" } });
      setTab("created");
    }
    setEditing(null);
  }

  const shownCount = tab === "favorites" ? favoriteList.length : tab === "recent" ? recentList.length : savedList.length;
  const tabInfo = TABS.find((t) => t.id === tab)!;

  return (
    <div className="mx-auto max-w-7xl">
      <header className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <p className="text-xs tracking-[0.35em] text-lux-gold sm:text-sm">CRENIX</p>
          <h1 className="mt-2 bg-linear-to-b from-[#fff3c4] via-lux-bright to-lux-gold bg-clip-text text-3xl font-extrabold text-transparent sm:text-5xl">
            My Prompts
          </h1>
          <p className="mt-2 text-stone-400">พื้นที่ส่วนตัวสำหรับเก็บและจัดการ Prompt ของคุณ (บันทึกในเบราว์เซอร์นี้)</p>
        </div>
        <button
          type="button"
          onClick={openNew}
          className="flex items-center justify-center gap-2 rounded-full bg-linear-to-b from-lux-bright to-lux-gold px-5 py-3 font-semibold text-black shadow-[0_0_20px_rgba(245,199,107,0.3)] hover:brightness-110"
        >
          <Plus className="h-5 w-5" /> สร้าง Prompt ใหม่
        </button>
      </header>

      {/* Tabs */}
      <div className="-mx-4 mt-8 flex gap-2 overflow-x-auto px-4 pb-2 sm:mx-0 sm:flex-wrap sm:px-0" role="tablist" aria-label="ประเภทรายการ">
        {TABS.map(({ id, label, icon: Icon }) => (
          <button
            key={id}
            type="button"
            role="tab"
            aria-selected={tab === id}
            onClick={() => setTab(id)}
            className={`flex shrink-0 items-center gap-2 rounded-full px-4 py-2 text-sm whitespace-nowrap transition ${
              tab === id
                ? "bg-linear-to-b from-lux-bright to-lux-gold font-semibold text-black"
                : "border border-lux-gold/40 text-stone-200 hover:bg-lux-gold/10"
            }`}
          >
            <Icon className="h-4 w-4" /> {label}
            <span className={`text-xs ${tab === id ? "text-black/60" : "text-stone-500"}`}>{counts[id]}</span>
          </button>
        ))}
      </div>
      <p className="mt-2 text-sm text-stone-500">{tabInfo.desc}</p>

      {/* Search & filters */}
      <div className="mt-5 grid gap-3 lg:grid-cols-[1fr_auto_auto_auto_auto]">
        <div className="relative">
          <Search className="pointer-events-none absolute top-1/2 left-4 h-5 w-5 -translate-y-1/2 text-lux-gold" />
          <input
            type="search"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="ค้นหา Prompt ของฉัน"
            aria-label="ค้นหา Prompt ของฉัน"
            className="w-full rounded-full border border-lux-gold/40 bg-lux-card py-3 pr-11 pl-12 text-white placeholder:text-stone-500 focus:border-lux-bright focus:outline-none [&::-webkit-search-cancel-button]:hidden"
          />
          {query && (
            <button type="button" onClick={() => setQuery("")} aria-label="ล้างคำค้นหา" className="absolute top-1/2 right-3 -translate-y-1/2 text-stone-400 hover:text-white">
              <X className="h-5 w-5" />
            </button>
          )}
        </div>
        <Select label="หมวดหมู่" value={category} onChange={(v) => setCategory(v as CategorySlug | "all")}>
          <option value="all">ทุกหมวด</option>
          {CATEGORY_FILTERS.map((c) => (
            <option key={c.slug} value={c.slug}>
              {c.label}
            </option>
          ))}
        </Select>
        {(tab === "saved" || tab === "created") && (
          <>
            <Select label="คอลเลกชัน" value={collection} onChange={setCollection}>
              <option value="">ทุกคอลเลกชัน</option>
              {collections.map((c) => (
                <option key={c} value={c}>
                  {c}
                </option>
              ))}
            </Select>
            <Select label="Tag" value={tag} onChange={setTag}>
              <option value="">ทุก Tag</option>
              {tags.map((t) => (
                <option key={t} value={t}>
                  #{t}
                </option>
              ))}
            </Select>
          </>
        )}
        {tab !== "recent" && (
          <Select label="เรียงตาม" value={sort} onChange={(v) => setSort(v as Sort)} icon>
            <option value="date">วันที่</option>
            <option value="name">ชื่อ</option>
            <option value="category">หมวดหมู่</option>
          </Select>
        )}
      </div>
      <div className="mt-3 flex min-h-6 items-center justify-between text-sm text-stone-400">
        <span>พบ {shownCount} รายการ</span>
        {filtersActive && (
          <button type="button" onClick={clearFilters} className="text-lux-gold hover:underline">
            ล้างตัวกรอง
          </button>
        )}
      </div>

      {/* Content */}
      {shownCount === 0 ? (
        <Empty tab={tab} filtered={filtersActive} onClear={clearFilters} onNew={openNew} />
      ) : tab === "favorites" ? (
        <div className="mt-4 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {favoriteList.map((p) => (
            <LibraryCard key={p.id} item={p} favorite onToggleFavorite={toggleFavorite} />
          ))}
        </div>
      ) : tab === "recent" ? (
        <ul className="mt-4 space-y-3">
          {recentList.map(({ r, lib, own }) => (
            <li key={`${r.kind}:${r.id}`} className="flex flex-col gap-3 rounded-2xl border border-lux-gold/20 bg-lux-card p-4 sm:flex-row sm:items-center sm:justify-between">
              <div className="min-w-0">
                <p className="truncate font-semibold text-white">{lib?.title ?? own?.title}</p>
                <p className="text-xs text-stone-400">
                  {categoryLabel((lib ?? own)!.category)} · {r.action === "copy" ? "คัดลอก" : r.action === "customize" ? "ปรับแต่ง" : "เปิดดู"}{" "}
                  {timeAgo(r.at)} · {lib ? "Prompt Library" : "My Prompts"}
                </p>
              </div>
              <div className="flex shrink-0 flex-wrap gap-2">
                {lib ? (
                  <>
                    <CopyPromptButton text={lib.promptEn} label="Copy" variant="subtle" trackId={lib.id} />
                    <SmallLink href={detailHref(lib)} icon={<ExternalLink className="h-3.5 w-3.5" />}>
                      Open
                    </SmallLink>
                    <SmallLink href={builderHref(lib)} icon={<Wand2 className="h-3.5 w-3.5" />}>
                      Customize
                    </SmallLink>
                  </>
                ) : (
                  own && (
                    <>
                      <CopyPromptButton text={own.promptEn || own.promptTh} label="Copy" variant="subtle" />
                      <SmallButton onClick={() => (setTab(isCreated(own) ? "created" : "saved"), setExpanded(own.id))} icon={<ExternalLink className="h-3.5 w-3.5" />}>
                        Open
                      </SmallButton>
                    </>
                  )
                )}
              </div>
            </li>
          ))}
          <li className="text-right">
            <button type="button" onClick={() => recentStore.set([])} className="text-sm text-stone-500 hover:text-rose-300">
              ล้างประวัติการใช้งาน
            </button>
          </li>
        </ul>
      ) : (
        <ul className="mt-4 grid gap-4 lg:grid-cols-2">
          {savedList.map((p) => {
            const libId = sourceLibraryId(p);
            const lib = libId ? libById.get(libId) : undefined;
            const isOpen = expanded === p.id;
            return (
              <li key={p.id} className="flex flex-col rounded-2xl border border-lux-gold/25 bg-lux-card p-5">
                <div className="flex items-start justify-between gap-3">
                  <div className="min-w-0 flex-1">
                    {renaming?.id === p.id ? (
                      <form
                        onSubmit={(e) => {
                          e.preventDefault();
                          if (renaming.title.trim()) updatePrompt(p.id, { title: renaming.title.trim() });
                          setRenaming(null);
                        }}
                        className="flex gap-2"
                      >
                        <input
                          autoFocus
                          value={renaming.title}
                          maxLength={120}
                          onChange={(e) => setRenaming({ id: p.id, title: e.target.value })}
                          onKeyDown={(e) => e.key === "Escape" && setRenaming(null)}
                          aria-label="ชื่อใหม่"
                          className="min-w-0 flex-1 rounded-lg border border-lux-bright bg-lux-ink px-3 py-1.5 text-white focus:outline-none"
                        />
                        <button type="submit" className="rounded-lg bg-lux-gold px-3 text-sm font-semibold text-black">
                          OK
                        </button>
                      </form>
                    ) : (
                      <h3 className="truncate text-lg font-semibold text-white" title={p.title}>
                        {p.title}
                      </h3>
                    )}
                    <p className="mt-0.5 text-xs text-stone-400">
                      {categoryLabel(p.category)}
                      {p.collection && <> · <FolderOpen className="inline h-3 w-3" /> {p.collection}</>} · แก้ไข {timeAgo(p.updatedAt)}
                    </p>
                  </div>
                  <span className="shrink-0 rounded-full border border-white/10 px-2 py-0.5 text-[11px] text-stone-400">
                    {p.source.type === "library" ? "Library" : p.source.type === "builder" ? "Builder" : p.source.type === "planner" ? "Planner" : "Manual"}
                  </span>
                </div>

                {p.tags.length > 0 && (
                  <div className="mt-2 flex flex-wrap gap-1.5">
                    {p.tags.map((t) => (
                      <button key={t} type="button" onClick={() => setTag(t)} className="rounded-full bg-lux-gold/10 px-2 py-0.5 text-xs text-lux-bright hover:bg-lux-gold/20">
                        #{t}
                      </button>
                    ))}
                  </div>
                )}

                <button
                  type="button"
                  onClick={() => setExpanded(isOpen ? null : p.id)}
                  aria-expanded={isOpen}
                  className={`mt-3 rounded-xl bg-lux-ink p-3 text-left text-sm leading-relaxed text-stone-300 ${isOpen ? "whitespace-pre-line" : "line-clamp-3"}`}
                >
                  {p.promptEn || p.promptTh}
                </button>
                {isOpen && p.promptEn && p.promptTh && (
                  <p className="mt-2 rounded-xl bg-lux-ink p-3 text-sm leading-relaxed whitespace-pre-line text-stone-400">{p.promptTh}</p>
                )}

                <div className="mt-4 flex flex-wrap gap-2">
                  {p.promptEn && (
                    <CopyPromptButton
                      text={p.promptEn}
                      label="Copy EN"
                      variant="subtle"
                      className="[&]:min-w-0"
                    />
                  )}
                  {p.promptTh && <CopyPromptButton text={p.promptTh} label="Copy TH" variant="subtle" />}
                  <SmallButton onClick={() => setEditing({ id: p.id, value: pickEditable(p) })} icon={<PencilLine className="h-3.5 w-3.5" />}>
                    Edit
                  </SmallButton>
                  <SmallButton onClick={() => setRenaming({ id: p.id, title: p.title })} icon={<PencilLine className="h-3.5 w-3.5" />}>
                    Rename
                  </SmallButton>
                  <SmallButton onClick={() => duplicatePrompt(p.id)} icon={<CopyIcon className="h-3.5 w-3.5" />}>
                    Duplicate
                  </SmallButton>
                  {lib && (
                    <SmallLink href={detailHref(lib)} icon={<ExternalLink className="h-3.5 w-3.5" />}>
                      Open Detail
                    </SmallLink>
                  )}
                  <SmallLink
                    href={lib ? builderHref(lib) : `/builder?category=${p.category}`}
                    icon={<Wand2 className="h-3.5 w-3.5" />}
                    onClick={() => trackRecent("saved", p.id, "customize")}
                  >
                    Customize
                  </SmallLink>
                  <SmallButton danger onClick={() => setToDelete(p)} icon={<Trash2 className="h-3.5 w-3.5" />}>
                    Delete
                  </SmallButton>
                </div>
              </li>
            );
          })}
        </ul>
      )}

      <PromptEditor
        value={editing?.value ?? null}
        heading={editing?.id ? "แก้ไข Prompt" : "สร้าง Prompt ใหม่"}
        collections={collections}
        onSave={saveEditor}
        onClose={() => setEditing(null)}
      />
      <ConfirmDialog
        open={toDelete !== null}
        title={`ลบ "${toDelete?.title ?? ""}"?`}
        message="Prompt นี้จะถูกลบออกจาก My Prompts และกู้คืนไม่ได้"
        confirmLabel="ลบ Prompt"
        onCancel={() => setToDelete(null)}
        onConfirm={() => {
          if (toDelete) deletePrompt(toDelete.id);
          setToDelete(null);
        }}
      />
    </div>
  );
}

const pickEditable = (p: SavedPrompt): EditorValue => ({
  title: p.title,
  category: p.category,
  promptEn: p.promptEn,
  promptTh: p.promptTh,
  tags: p.tags,
  collection: p.collection,
});

function timeAgo(iso: string) {
  const diff = (Date.now() - new Date(iso).getTime()) / 1000;
  if (diff < 60) return "เมื่อสักครู่";
  if (diff < 3600) return `${Math.floor(diff / 60)} นาทีที่แล้ว`;
  if (diff < 86400) return `${Math.floor(diff / 3600)} ชั่วโมงที่แล้ว`;
  return new Date(iso).toLocaleDateString("th-TH", { dateStyle: "medium" });
}

function Select({ label, value, onChange, children, icon }: { label: string; value: string; onChange: (v: string) => void; children: React.ReactNode; icon?: boolean }) {
  return (
    <label className="flex items-center gap-2 text-sm text-stone-400">
      {icon ? <ArrowDownUp className="h-4 w-4 text-lux-gold" /> : <span className="sr-only">{label}</span>}
      {icon && <span className="whitespace-nowrap">{label}</span>}
      <select
        value={value}
        onChange={(e) => onChange(e.target.value)}
        aria-label={label}
        className="w-full cursor-pointer rounded-full border border-lux-gold/40 bg-lux-card px-4 py-2.5 text-white focus:border-lux-bright focus:outline-none"
      >
        {children}
      </select>
    </label>
  );
}

const smallCls = "flex items-center gap-1.5 rounded-full border px-3 py-1.5 text-xs font-semibold transition";

function SmallButton({ onClick, icon, children, danger }: { onClick: () => void; icon: React.ReactNode; children: React.ReactNode; danger?: boolean }) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={`${smallCls} ${danger ? "border-rose-400/40 text-rose-300 hover:bg-rose-500/10" : "border-lux-gold/50 text-stone-200 hover:border-lux-bright hover:text-white"}`}
    >
      {icon} {children}
    </button>
  );
}

function SmallLink({ href, icon, children, onClick }: { href: string; icon: React.ReactNode; children: React.ReactNode; onClick?: () => void }) {
  return (
    <Link href={href} onClick={onClick} className={`${smallCls} border-lux-gold/50 text-stone-200 hover:border-lux-bright hover:text-white`}>
      {icon} {children}
    </Link>
  );
}

function Empty({ tab, filtered, onClear, onNew }: { tab: Tab; filtered: boolean; onClear: () => void; onNew: () => void }) {
  const msg: Record<Tab, [string, string, React.ReactNode]> = {
    saved: ["ยังไม่มี Prompt ที่บันทึก", "เปิด Prompt ในคลังแล้วกด Save to My Prompts เพื่อเก็บสำเนาไว้แก้ไข", <Link key="l" href="/prompts" className="rounded-full bg-lux-gold px-6 py-2.5 font-semibold text-black">ไปที่ Prompt Library</Link>],
    created: ["ยังไม่มี Prompt ที่สร้างเอง", "สร้างด้วย Prompt Builder หรือกดสร้าง Prompt ใหม่", <span key="b" className="flex flex-wrap justify-center gap-3"><Link href="/builder" className="rounded-full bg-lux-gold px-6 py-2.5 font-semibold text-black">เปิด Prompt Builder</Link><button type="button" onClick={onNew} className="rounded-full border border-lux-gold/60 px-6 py-2.5 text-stone-200">สร้าง Prompt ใหม่</button></span>],
    favorites: ["ยังไม่มีรายการโปรด", "กดรูปหัวใจบน Prompt ที่ชอบใน Prompt Library", <Link key="l" href="/prompts" className="rounded-full bg-lux-gold px-6 py-2.5 font-semibold text-black">ไปที่ Prompt Library</Link>],
    recent: ["ยังไม่มีประวัติการใช้งาน", "Prompt ที่คุณเปิดดู คัดลอก หรือปรับแต่ง จะแสดงที่นี่", <Link key="l" href="/prompts" className="rounded-full bg-lux-gold px-6 py-2.5 font-semibold text-black">ไปที่ Prompt Library</Link>],
  };
  const [title, desc, action] = filtered
    ? ["ไม่พบรายการที่ตรงกับตัวกรอง", "ลองใช้คำค้นอื่น หรือล้างตัวกรอง", <button key="c" type="button" onClick={onClear} className="rounded-full bg-lux-gold px-6 py-2.5 font-semibold text-black">ล้างตัวกรอง</button>]
    : msg[tab];
  return (
    <div className="mt-4 flex flex-col items-center rounded-2xl border border-dashed border-lux-gold/30 bg-lux-card px-6 py-14 text-center">
      <p className="text-lg font-semibold text-white">{title}</p>
      <p className="mt-1 max-w-md text-sm text-stone-400">{desc}</p>
      <div className="mt-6">{action}</div>
    </div>
  );
}
