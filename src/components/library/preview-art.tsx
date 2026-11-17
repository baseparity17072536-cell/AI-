import { Play } from "lucide-react";
import type { LibraryPrompt } from "./types";

/**
 * Preview image for a prompt. Uses `preview.image` when provided
 * (put files in /public/previews), otherwise draws a CSS illustration
 * that matches the category.
 */
export function PreviewArt({ item }: { item: Pick<LibraryPrompt, "category" | "preview" | "title"> }) {
  const { from, to, image } = item.preview;

  if (image) {
    // eslint-disable-next-line @next/next/no-img-element
    return <img src={image} alt={item.title} className="h-full w-full object-cover" loading="lazy" />;
  }

  return (
    <div
      className="relative h-full w-full overflow-hidden"
      style={{ background: `linear-gradient(135deg, ${from} 0%, ${to} 100%)` }}
      role="img"
      aria-label={`ภาพตัวอย่าง ${item.title}`}
    >
      <div className="absolute -top-10 -right-10 h-40 w-40 rounded-full bg-white/10 blur-2xl" />
      {item.category === "video-editing" && <EditingArt />}
      {item.category === "image" && <ImageArt />}
      {item.category === "content" && <ContentArt />}
      {item.category === "video" && <VideoArt />}
    </div>
  );
}

function EditingArt() {
  return (
    <>
      <div className="absolute top-[18%] right-[8%] left-[8%] flex gap-1.5">
        {[0, 1, 2, 3].map((i) => (
          <div key={i} className="aspect-video flex-1 rounded border border-white/20 bg-black/40" />
        ))}
      </div>
      <div className="absolute right-[8%] bottom-[18%] left-[8%] space-y-1.5 rounded-md bg-black/50 p-2">
        <div className="flex gap-1">
          <div className="h-1.5 w-2/5 rounded bg-sky-400" />
          <div className="h-1.5 w-1/4 rounded bg-sky-300" />
        </div>
        <div className="flex gap-1">
          <div className="h-1.5 w-1/5 rounded bg-fuchsia-400" />
          <div className="h-1.5 w-2/5 rounded bg-violet-400" />
        </div>
        <div className="h-1.5 w-4/5 rounded bg-emerald-400" />
      </div>
      <div className="absolute top-[12%] bottom-[12%] left-[46%] w-0.5 bg-lux-bright shadow-[0_0_8px_#f5c76b]" />
    </>
  );
}

function ImageArt() {
  return (
    <>
      <div className="absolute top-[18%] right-[22%] h-10 w-10 rounded-full bg-amber-100/90 blur-[1px]" />
      <svg viewBox="0 0 200 100" preserveAspectRatio="none" className="absolute inset-x-0 bottom-0 h-3/5 w-full">
        <path d="M0 100 L40 45 L70 70 L110 15 L150 60 L175 40 L200 65 L200 100 Z" fill="rgba(0,0,0,0.45)" />
        <path d="M0 100 L30 72 L80 86 L120 58 L170 86 L200 76 L200 100 Z" fill="rgba(0,0,0,0.7)" />
      </svg>
      <div className="absolute inset-3 rounded-lg border border-white/15" />
    </>
  );
}

function ContentArt() {
  return (
    <div className="absolute top-[14%] left-1/2 w-1/2 -translate-x-1/2 rotate-[-6deg] rounded-md bg-stone-100 p-3 shadow-2xl">
      <div className="mb-2 h-2 w-1/2 rounded bg-stone-500" />
      {[92, 84, 88, 70, 80, 56].map((w, i) => (
        <div key={i} className="mb-1.5 h-1 rounded bg-stone-300" style={{ width: `${w}%` }} />
      ))}
    </div>
  );
}

function VideoArt() {
  return (
    <div className="absolute inset-0 grid place-items-center">
      <div className="absolute h-24 w-24 rounded-full bg-white/20 blur-2xl" />
      <div className="relative grid aspect-video w-2/5 place-items-center rounded-lg border-2 border-white/70 bg-black/40 shadow-[0_0_30px_rgba(255,255,255,0.35)]">
        <Play className="h-7 w-7 fill-white text-white" />
      </div>
    </div>
  );
}
