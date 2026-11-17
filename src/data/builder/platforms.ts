/**
 * Model Capability Profiles (Step 5).
 *
 * Rule: never guess. Each capability carries a status:
 *  - "verified"     → read in the platform's official docs on `checkedAt`
 *  - "not-verified" → docs mention it but are ambiguous, conflicting or model-dependent
 *  - "unknown"      → no official source found; the UI says so and plays safe
 *
 * Platforms change models often. Re-check the `sources` and update `checkedAt`
 * before relying on these numbers; the builder shows the check date to users.
 */
import type { CategorySlug } from "@/data/prompts";

export type CapStatus = "verified" | "not-verified" | "unknown";
export type Cap<T> = { status: CapStatus; value?: T; note?: string };

export type PlatformId = "runway" | "pika" | "firefly" | "canva" | "general";

export type PlatformProfile = {
  id: PlatformId;
  name: string;
  /** Which model/feature these numbers describe */
  model: string;
  categories: CategorySlug[];
  checkedAt: string;
  sources: { label: string; url: string }[];
  /** Seconds a single generation can last */
  clipSeconds: Cap<{ min: number; max: number; options?: number[] }>;
  aspectRatios: Cap<string[]>;
  audio: Cap<boolean>;
  voice: Cap<boolean>;
  /** Spoken languages the model is documented to support */
  languages: Cap<string[]>;
  textToVideo: Cap<boolean>;
  imageToVideo: Cap<boolean>;
};

const CHECKED = "2026-11-17";
const U = { status: "unknown" } as const;

export const PLATFORMS: PlatformProfile[] = [
  {
    id: "runway",
    name: "Runway",
    model: "Gen-4 Video",
    categories: ["video"],
    checkedAt: CHECKED,
    sources: [
      { label: "Runway Help: Creating with Gen-4 Video", url: "https://help.runwayml.com/hc/en-us/articles/37327109429011-Creating-with-Gen-4-Video" },
      { label: "Runway Help: Creating with Gen-4.5", url: "https://help.runwayml.com/hc/en-us/articles/46974685288467-Creating-with-Gen-4-5" },
    ],
    clipSeconds: { status: "verified", value: { min: 5, max: 10, options: [5, 10] }, note: "Gen-4.5 รองรับ 2–10 วินาที" },
    aspectRatios: { status: "verified", value: ["16:9", "9:16", "1:1", "4:3", "3:4", "21:9"] },
    audio: { ...U, note: "ไม่พบในเอกสาร Gen-4 Video" },
    voice: U,
    languages: U,
    textToVideo: { ...U, note: "Gen-4 Video เริ่มจากภาพต้นแบบ — ยังไม่ยืนยันโหมดข้อความล้วน" },
    imageToVideo: { status: "verified", value: true },
  },
  {
    id: "pika",
    name: "Pika",
    model: "Pika H3 Flex",
    categories: ["video"],
    checkedAt: CHECKED,
    sources: [
      { label: "Pika: H3 Flex", url: "https://pika.art/pika-h3-flex" },
      { label: "Pika API: H3 Flex text-to-video", url: "https://dev.pika.art/models/pika/pika-h3-flex/text-to-video" },
      { label: "Pika API: H3 Flex image-to-video", url: "https://dev.pika.art/models/pika/pika-h3-flex/image-to-video" },
    ],
    clipSeconds: { status: "verified", value: { min: 3, max: 15 } },
    aspectRatios: {
      status: "verified",
      value: ["21:9", "16:9", "3:2", "4:3", "5:4", "1:1", "4:5", "3:4", "2:3", "9:16", "9:21"],
    },
    audio: { status: "verified", value: true, note: "ทุกคลิปมีเสียงสเตอริโอ · ผ่าน API แยก Dialogue / Music / Effects ได้" },
    voice: { status: "not-verified", value: true, note: "มีตัวอย่างบทพูด แต่ไม่ได้ระบุเป็นฟีเจอร์ชัดเจน" },
    languages: { ...U, note: "ไม่พบรายการภาษาที่รองรับ" },
    textToVideo: { status: "verified", value: true },
    imageToVideo: { status: "verified", value: true },
  },
  {
    id: "firefly",
    name: "Adobe Firefly",
    model: "Firefly Video model",
    categories: ["video", "image"],
    checkedAt: CHECKED,
    sources: [
      { label: "Adobe Help: Generate video with Firefly models", url: "https://helpx.adobe.com/firefly/web/firefly-video-editor/generate-videos/generate-video-using-firefly-models.html" },
      { label: "Adobe Help: Generate videos using partner models", url: "https://helpx.adobe.com/firefly/web/work-with-audio-and-video/work-with-video/generate-videos-using-non-adobe-models.html" },
    ],
    clipSeconds: {
      status: "not-verified",
      value: { min: 5, max: 5 },
      note: "Firefly Video model ประมาณ 5 วินาที — โมเดลพาร์ทเนอร์ยาวได้ถึง 8–15 วินาที เอกสารบางหน้าขัดกัน",
    },
    aspectRatios: {
      status: "not-verified",
      value: ["16:9", "9:16", "1:1"],
      note: "ตัวเลือกขึ้นกับโมเดลที่เลือก",
    },
    audio: { status: "not-verified", value: false, note: "เสียงมีเฉพาะบางโมเดลพาร์ทเนอร์ (เช่น Veo 3.1)" },
    voice: { status: "not-verified", value: false },
    languages: U,
    textToVideo: { status: "verified", value: true },
    imageToVideo: { status: "verified", value: true },
  },
  {
    id: "canva",
    name: "Canva",
    model: "Create a Video Clip (Veo 3)",
    categories: ["video", "image"],
    checkedAt: CHECKED,
    sources: [
      { label: "Canva Help: Create a video clip in Canva AI", url: "https://www.canva.com/help/video-clip/" },
      { label: "Canva Help: Transform your image into a video", url: "https://www.canva.com/help/image-to-video/" },
    ],
    clipSeconds: { status: "verified", value: { min: 8, max: 8, options: [8] }, note: "8 วินาทีพร้อมเสียง หรือ 6 วินาทีแบบไม่มีเสียง" },
    aspectRatios: {
      status: "not-verified",
      value: ["16:9"],
      note: "Help ระบุคลิป 16:9 แต่หน้า Canva AI มีตัวเลือก Aspect ratio — ตรวจในแอป",
    },
    audio: { status: "verified", value: true, note: "สร้างเสียงอัตโนมัติ แต่แก้ไขเสียงในคลิปเองไม่ได้" },
    voice: { status: "verified", value: true, note: "รวมบทพูดในเสียงที่สร้าง" },
    languages: { ...U, note: "ไม่พบรายการภาษาที่รองรับ" },
    textToVideo: { status: "verified", value: true },
    imageToVideo: { status: "verified", value: true, note: "Image to Video ยาว 5 วินาที ไม่มีเสียง" },
  },
  {
    id: "general",
    name: "General Prompt",
    model: "ใช้กับ AI ใดก็ได้",
    categories: ["video", "image", "video-editing", "content"],
    checkedAt: CHECKED,
    sources: [],
    clipSeconds: { ...U, note: "ขึ้นกับ AI ที่นำไปใช้" },
    aspectRatios: U,
    audio: U,
    voice: U,
    languages: U,
    textToVideo: U,
    imageToVideo: U,
  },
];

export function getPlatform(id: PlatformId) {
  return PLATFORMS.find((p) => p.id === id) ?? PLATFORMS[PLATFORMS.length - 1];
}

export function platformsFor(category: CategorySlug) {
  return PLATFORMS.filter((p) => p.categories.includes(category));
}

/** Used only when the clip limit is unknown: plan in short shots rather than assume long clips work. */
export const SAFE_CLIP_SECONDS = 10;

/** Max seconds per clip we plan around for this platform (known or documented-but-unverified). */
export function clipLimit(p: PlatformProfile) {
  return p.clipSeconds.value?.max ?? SAFE_CLIP_SECONDS;
}

/** Aspect ratios to offer: filtered only when the platform documents a list. */
export function supportedRatios(p: PlatformProfile): string[] | null {
  return p.aspectRatios.value ?? null;
}

export const STATUS_LABEL: Record<CapStatus, string> = {
  verified: "Verified",
  "not-verified": "Not Verified",
  unknown: "Unknown",
};
