"use client";

import { useEffect, useMemo, useState } from "react";
import { ArrowDownUp, ChevronDown, FolderOpen, Heart, Loader2, RefreshCw, Search, SearchX, X } from "lucide-react";
import type { CategorySlug } from "@/data/prompts";
import { useFavorites } from "@/lib/favorites";
import { LibraryCard, LibraryCardSkeleton } from "./library-card";
import {
  CATEGORY_FILTERS,
  categoryLabel,
  LIBRARY_DATA_URL,
  matchesQuery,
  PAGE_SIZE,
  SORT_LABELS,
  sortPrompts,
  type LibraryData,
  type LibraryPrompt,
  type SortKey,
  type Tier,
} from "./types";

type Status = "loading" | "ready" | "error";

const chipBase = "flex shrink-0 items-center gap-2 rounded-full px-4 py-2 text-sm whitespace-nowrap transition";
const chipOn = "bg-linear-to-b from-lux-bright to-lux-gold font-semibold text-black shadow-[0_0_16px_rgba(245,199,107,0.35)]";
const chipOff = "border border-lux-gold/40 text-stone-200 hover:border-lux-bright hover:bg-lux-gold/10";

type Props = {
  /** Lock the list to one category (category pages): hides the category chips. */
  lockedCategory?: CategorySlug;
};

export function PromptLibrary({ lockedCategory }: Props = {}) {
  const [items, setItems] = useState<LibraryPrompt[]>([]);
  const [status, setStatus] = useState<Status>("loading");
  const [reloadKey, setReloadKey] = useState(0);

  const [query, setQuery] = useState("");
  const [category, setCategory] = useState<CategorySlug | "all">(lockedCategory ?? "all");
  const [tier, setTier] = useState<Tier | "all">("all");
  const [sort, setSort] = useState<SortKey>("recommended");
  const [favoritesOnly, setFavoritesOnly] = useState(false);
  const [visible, setVisible] = useState(PAGE_SIZE);

  const { ids: favoriteIds, toggle: toggleFavorite } = useFavorites();

  // Load prompts from local JSON (swap this URL for an API later)
  useEffect(() => {
    let cancelled = false;
    fetch(LIBRARY_DATA_URL)
      .then((r) => {
        if (!r.ok) throw new Error(String(r.status));
        return r.json() as Promise<LibraryData>;
      })
      .then((data) => {
        if (cancelled) return;
        setItems(data.prompts);
        setStatus("ready");
      })
      .catch(() => {
        if (!cancelled) setStatus("error");
      });
    return () => {
      cancelled = true;
    };
  }, [reloadKey]);

  const retry = () => {
    setStatus("loading");
    setReloadKey((k) => k + 1);
  };

  // Any filter change resets pagination
  const withReset =
    <T,>(setter: (v: T) => void) =>
    (v: T) => {
      setter(v);
      setVisible(PAGE_SIZE);
    };
  const changeQuery = withReset(setQuery);
  const changeCategory = withReset(setCategory);
  const changeTier = withReset(setTier);
  const changeSort = withReset(setSort);
  const changeFavoritesOnly = withReset(setFavoritesOnly);

  const resetFilters = () => {
    setQuery("");
    setCategory(lockedCategory ?? "all");
    setTier("all");
    setFavoritesOnly(false);
    setVisible(PAGE_SIZE);
  };

  const q = query.trim().toLowerCase();
  const filtered = useMemo(() => {
    const list = items.filter((p) => {
      if (category !== "all" && p.category !== category) return false;
      if (tier !== "all" && p.tier !== tier) return false;
      if (favoritesOnly && !favoriteIds.includes(p.id)) return false;
      return matchesQuery(p, q);
    });
    return sortPrompts(list, sort);
  }, [items, q, category, tier, favoritesOnly, favoriteIds, sort]);

  const shown = filtered.slice(0, visible);
  const remaining = filtered.length - shown.length;
  const countIn = (slug: CategorySlug | "all") =>
    slug === "all" ? items.length : items.filter((p) => p.category === slug).length;
  const hasActiveFilters = q !== "" || (!lockedCategory && category !== "all") || tier !== "all" || favoritesOnly;

  // Pick the right empty state
  let empty: { icon: React.ReactNode; title: string; desc: string; action: { label: string; onClick: () => void } } | null =
    null;
  if (status === "ready" && filtered.length === 0) {
    if (favoritesOnly && favoriteIds.length === 0) {
      empty = {
        icon: <Heart className="h-10 w-10 text-rose-300" />,
        title: "ยังไม่มีรายการโปรด",
        desc: "กดรูปหัวใจบนการ์ด Prompt ที่ชอบ เพื่อเก็บไว้ดูภายหลัง",
        action: { label: "ดู Prompt ทั้งหมด", onClick: resetFilters },
      };
    } else if (q) {
      empty = {
        icon: <SearchX className="h-10 w-10 text-lux-gold" />,
        title: "ไม่พบ Prompt ที่ตรงกับการค้นหา",
        desc: `ไม่พบผลลัพธ์สำหรับ "${query.trim()}" ลองใช้คำอื่น หรือล้างตัวกรอง`,
        action: { label: "ล้างการค้นหาและตัวกรอง", onClick: resetFilters },
      };
    } else if (favoritesOnly) {
      empty = {
        icon: <Heart className="h-10 w-10 text-rose-300" />,
        title: "ไม่มีรายการโปรดที่ตรงกับตัวกรองนี้",
        desc: "ลองเปลี่ยนหมวดหมู่หรือประเภท Prompt",
        action: { label: "ล้างตัวกรอง", onClick: resetFilters },
      };
    } else {
      const where = category !== "all" ? `หมวด ${categoryLabel(category)}` : "ตัวกรองนี้";
      const tierText = tier !== "all" ? ` แบบ ${tier === "free" ? "Free" : "Premium"}` : "";
      empty = {
        icon: <FolderOpen className="h-10 w-10 text-lux-gold" />,
        title: `ยังไม่มี Prompt${tierText} ใน${where}`,
        desc: "เรากำลังเพิ่ม Prompt ใหม่อย่างต่อเนื่อง ระหว่างนี้ลองดูหมวดอื่นก่อน",
        action: { label: lockedCategory ? "ล้างตัวกรอง" : "ดู Prompt ทั้งหมด", onClick: resetFilters },
      };
    }
  }

  return (
    <div>
      {/* Search */}
      <div className="relative">
        <Search className="pointer-events-none absolute top-1/2 left-5 h-5 w-5 -translate-y-1/2 text-lux-gold" />
        <input
          type="search"
          value={query}
          onChange={(e) => changeQuery(e.target.value)}
          placeholder="ค้นหาชื่อ Prompt, หมวดหมู่, คำสำคัญ หรือ AI เช่น สินค้า, Midjourney"
          aria-label="ค้นหา Prompt"
          className="w-full rounded-full border border-lux-gold/50 bg-lux-card py-3.5 pr-14 pl-13 text-base text-white shadow-[0_0_24px_rgba(198,161,91,0.12)] transition placeholder:text-stone-500 focus:border-lux-bright focus:ring-2 focus:ring-lux-bright/40 focus:outline-none [&::-webkit-search-cancel-button]:hidden"
        />
        {query && (
          <button
            type="button"
            onClick={() => changeQuery("")}
            aria-label="ล้างคำค้นหา"
            className="absolute top-1/2 right-3 grid h-9 w-9 -translate-y-1/2 place-items-center rounded-full text-stone-400 transition hover:bg-white/10 hover:text-white"
          >
            <X className="h-5 w-5" />
          </button>
        )}
      </div>

      {/* Category filter (hidden when the page is locked to one category) */}
      {!lockedCategory && (
      <div className="-mx-4 mt-5 flex gap-2 overflow-x-auto px-4 pb-2 sm:mx-0 sm:flex-wrap sm:px-0" role="group" aria-label="หมวดหมู่">
        {[{ slug: "all" as const, label: "All Prompts", icon: null }, ...CATEGORY_FILTERS].map(({ slug, label, icon: Icon }) => {
          const active = category === slug;
          return (
            <button
              key={slug}
              type="button"
              aria-pressed={active}
              onClick={() => changeCategory(slug)}
              className={`${chipBase} ${active ? chipOn : chipOff}`}
            >
              {Icon && <Icon className="h-4 w-4" />}
              {label}
              {status === "ready" && (
                <span className={`text-xs ${active ? "text-black/60" : "text-stone-500"}`}>{countIn(slug)}</span>
              )}
            </button>
          );
        })}
      </div>
      )}

      {/* Type, favorites, sort */}
      <div className="mt-3 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex flex-wrap items-center gap-2">
          <div className="flex rounded-full border border-lux-gold/40 p-1" role="radiogroup" aria-label="ประเภท Prompt">
            {(["all", "free", "premium"] as const).map((t) => (
              <button
                key={t}
                type="button"
                role="radio"
                aria-checked={tier === t}
                onClick={() => changeTier(t)}
                className={`rounded-full px-4 py-1.5 text-sm transition ${
                  tier === t ? "bg-lux-gold font-semibold text-black" : "text-stone-300 hover:text-white"
                }`}
              >
                {t === "all" ? "All" : t === "free" ? "Free" : "Premium"}
              </button>
            ))}
          </div>
          <button
            type="button"
            aria-pressed={favoritesOnly}
            onClick={() => changeFavoritesOnly(!favoritesOnly)}
            className={`flex items-center gap-2 rounded-full border px-4 py-2 text-sm transition ${
              favoritesOnly
                ? "border-rose-400 bg-rose-500/15 text-rose-300"
                : "border-lux-gold/40 text-stone-300 hover:bg-lux-gold/10"
            }`}
          >
            <Heart className={`h-4 w-4 ${favoritesOnly ? "fill-current" : ""}`} />
            รายการโปรด
            <span className="text-xs opacity-70">{favoriteIds.length}</span>
          </button>
        </div>

        <label className="relative flex items-center gap-2 text-sm text-stone-400">
          <ArrowDownUp className="h-4 w-4 text-lux-gold" />
          <span className="whitespace-nowrap">เรียงตาม</span>
          <select
            value={sort}
            onChange={(e) => changeSort(e.target.value as SortKey)}
            className="w-full cursor-pointer appearance-none rounded-full border border-lux-gold/40 bg-lux-card py-2 pr-9 pl-4 text-white focus:border-lux-bright focus:outline-none sm:w-auto"
          >
            {(Object.keys(SORT_LABELS) as SortKey[]).map((k) => (
              <option key={k} value={k}>
                {SORT_LABELS[k]}
              </option>
            ))}
          </select>
          <ChevronDown className="pointer-events-none absolute right-3 h-4 w-4 text-lux-gold" />
        </label>
      </div>

      {/* Result count */}
      <div className="mt-6 flex min-h-6 items-center justify-between text-sm text-stone-400" aria-live="polite">
        {status === "loading" && (
          <span className="flex items-center gap-2">
            <Loader2 className="h-4 w-4 animate-spin text-lux-gold" /> กำลังโหลด Prompt...
          </span>
        )}
        {status === "ready" && (
          <span>
            แสดง <b className="text-white">{shown.length}</b> จาก <b className="text-white">{filtered.length}</b> Prompt
            {filtered.length !== countIn(lockedCategory ?? "all") && (
              <span className="text-stone-500"> (ทั้งหมด {countIn(lockedCategory ?? "all")})</span>
            )}
          </span>
        )}
        {status === "ready" && hasActiveFilters && (
          <button type="button" onClick={resetFilters} className="text-lux-gold hover:text-lux-bright hover:underline">
            ล้างตัวกรอง
          </button>
        )}
      </div>

      {/* Grid / states */}
      {status === "loading" && (
        <div className="mt-4 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {Array.from({ length: 6 }).map((_, i) => (
            <LibraryCardSkeleton key={i} />
          ))}
        </div>
      )}

      {status === "error" && (
        <EmptyState
          icon={<RefreshCw className="h-10 w-10 text-lux-gold" />}
          title="โหลด Prompt ไม่สำเร็จ"
          desc="ตรวจสอบการเชื่อมต่อ แล้วลองอีกครั้ง"
          action={{ label: "ลองอีกครั้ง", onClick: retry }}
        />
      )}

      {empty && <EmptyState {...empty} />}

      {status === "ready" && shown.length > 0 && (
        <div className="mt-4 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {shown.map((p) => (
            <LibraryCard key={p.id} item={p} favorite={favoriteIds.includes(p.id)} onToggleFavorite={toggleFavorite} />
          ))}
        </div>
      )}

      {/* Load more */}
      {status === "ready" && remaining > 0 && (
        <div className="mt-10 flex flex-col items-center gap-2">
          <button
            type="button"
            onClick={() => setVisible((v) => v + PAGE_SIZE)}
            className="rounded-full border border-lux-gold px-8 py-3 font-medium text-lux-bright transition hover:bg-lux-gold hover:text-black"
          >
            Load More ({remaining} รายการ)
          </button>
          <div className="h-1 w-48 overflow-hidden rounded-full bg-white/10" aria-hidden="true">
            <div className="h-full bg-lux-gold transition-all" style={{ width: `${(shown.length / filtered.length) * 100}%` }} />
          </div>
        </div>
      )}
      {status === "ready" && remaining === 0 && filtered.length > PAGE_SIZE && (
        <p className="mt-10 text-center text-sm text-stone-500">แสดงครบทุกรายการแล้ว</p>
      )}
    </div>
  );
}

function EmptyState({
  icon,
  title,
  desc,
  action,
}: {
  icon: React.ReactNode;
  title: string;
  desc: string;
  action: { label: string; onClick: () => void };
}) {
  return (
    <div className="mt-4 flex flex-col items-center rounded-2xl border border-dashed border-lux-gold/30 bg-lux-card px-6 py-16 text-center">
      <div className="grid h-20 w-20 place-items-center rounded-full bg-lux-gold/10">{icon}</div>
      <p className="mt-5 text-lg font-semibold text-white">{title}</p>
      <p className="mt-1 max-w-md text-sm text-stone-400">{desc}</p>
      <button
        type="button"
        onClick={action.onClick}
        className="mt-6 rounded-full bg-linear-to-b from-lux-bright to-lux-gold px-6 py-2.5 font-semibold text-black transition hover:brightness-110"
      >
        {action.label}
      </button>
    </div>
  );
}
