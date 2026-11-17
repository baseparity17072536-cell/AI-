/**
 * Long Video Planner engine (Step 6). Pure functions, no React.
 *
 * AI video models generate short clips (seconds, not minutes), so a long video is
 * planned as scenes, and each scene as several clips no longer than the platform's
 * per-clip limit. Scene times always add up to the chosen total (see rebalance()).
 */
import { BUILDER_FIELDS, type Option } from "@/data/builder/fields";
import { clipLimit, getPlatform, type PlatformId } from "@/data/builder/platforms";

export type Scene = {
  id: string;
  title: string;
  seconds: number;
  /** What we see — English is what goes into the AI prompt */
  visualEn: string;
  /** Thai version shown in the translation */
  visualTh: string;
  camera: string;
  /** Voice-over / dialogue line for this scene (any language) */
  voice: string;
  /** Sound effects / ambience */
  sfx: string;
};

export type Project = {
  id: string;
  ownerId: string;
  title: string;
  totalSeconds: number;
  topic: string;
  videoType: string;
  audience: string;
  tone: string;
  story: string;
  style: string;
  aspect: string;
  platformId: PlatformId;
  voiceLanguage: string;
  voiceCharacter: string;
  music: string;
  scenes: Scene[];
  createdAt: string;
  updatedAt: string;
};

export const TOTAL_PRESETS_MIN = [1, 5, 10, 15, 20];
export const MAX_TOTAL_SECONDS = 60 * 60;

const opts = (field: string) => BUILDER_FIELDS.video.find((f) => f.id === field)?.options ?? [];
export const VIDEO_TYPES = opts("videoType");
export const STYLES = opts("style");
export const ASPECTS = opts("aspect");
export const VOICE_LANGUAGES = opts("voiceLanguage");
export const VOICE_CHARACTERS = opts("voiceCharacter");
export const TONES: Option[] = [
  { id: "inspiring", label: "Inspiring", en: "inspiring", th: "สร้างแรงบันดาลใจ" },
  { id: "luxury", label: "Luxury", en: "luxurious and elegant", th: "หรูหรา มีระดับ" },
  { id: "warm", label: "Warm", en: "warm and heartfelt", th: "อบอุ่น จริงใจ" },
  { id: "energetic", label: "Energetic", en: "energetic and fun", th: "สนุก มีพลัง" },
  { id: "calm", label: "Calm", en: "calm and relaxing", th: "สงบ ผ่อนคลาย" },
  { id: "dramatic", label: "Dramatic", en: "dramatic and suspenseful", th: "ดราม่า น่าติดตาม" },
];
export const MUSIC: Option[] = [
  { id: "none", label: "No Music", en: "", th: "" },
  { id: "cinematic", label: "Cinematic Score", en: "a cinematic score", th: "ดนตรีแนวภาพยนตร์" },
  { id: "upbeat", label: "Upbeat", en: "upbeat music", th: "เพลงจังหวะสนุก" },
  { id: "ambient", label: "Ambient", en: "soft ambient music", th: "ดนตรีบรรยากาศเบา ๆ" },
];

export const optionOf = (list: Option[], id: string) => list.find((o) => o.id === id);

/* ---------------- time math ---------------- */

export const sumSeconds = (scenes: Scene[]) => scenes.reduce((a, s) => a + s.seconds, 0);

/** Split `total` into `n` whole-second parts that add up exactly to `total`. */
export function splitEvenly(total: number, n: number) {
  const base = Math.floor(total / n);
  const rem = total - base * n;
  return Array.from({ length: n }, (_, i) => base + (i < rem ? 1 : 0));
}

/**
 * Scale scene lengths so they add up exactly to `total`, keeping their proportions.
 * Every scene keeps at least 1 second. Uses largest-remainder rounding so the sum is exact.
 */
export function rebalance(scenes: Scene[], total: number): Scene[] {
  if (scenes.length === 0) return scenes;
  if (total < scenes.length) total = scenes.length;
  const current = sumSeconds(scenes) || scenes.length;
  const spare = total - scenes.length; // seconds left after the 1-second minimum
  const raw = scenes.map((s) => (Math.max(s.seconds, 0) / current) * spare);
  const floors = raw.map(Math.floor);
  let left = spare - floors.reduce((a, b) => a + b, 0);
  const order = raw.map((r, i) => [r - Math.floor(r), i] as const).sort((a, b) => b[0] - a[0]);
  for (const [, i] of order) {
    if (left <= 0) break;
    floors[i] += 1;
    left -= 1;
  }
  return scenes.map((s, i) => ({ ...s, seconds: floors[i] + 1 }));
}

export function clipsFor(seconds: number, limit: number) {
  return Math.max(1, Math.ceil(seconds / limit));
}

export function formatDuration(total: number) {
  const m = Math.floor(total / 60);
  const s = total % 60;
  return m ? (s ? `${m} นาที ${s} วินาที` : `${m} นาที`) : `${s} วินาที`;
}

export const timecode = (sec: number) => `${Math.floor(sec / 60)}:${String(sec % 60).padStart(2, "0")}`;

/* ---------------- scene generation ---------------- */

/** How many scenes to suggest for a total length: roughly one per minute, plus intro and outro. */
export function suggestedSceneCount(total: number) {
  return Math.min(24, Math.max(3, Math.round(total / 60) + 2));
}

type Beat = { title: string; en: (topic: string) => string; th: (topic: string) => string; camera: string };

const OPENING: Beat = {
  title: "Opening Hook",
  en: (t) => `A striking opening shot that instantly introduces ${t}`,
  th: (t) => `ช็อตเปิดที่สะดุดตา แนะนำ ${t} ทันที`,
  camera: "slow push-in",
};
const INTRO: Beat = {
  title: "Introduction",
  en: (t) => `Establishing shots that set the scene and context for ${t}`,
  th: (t) => `ช็อตเปิดฉากที่ปูบริบทของ ${t}`,
  camera: "wide establishing shot",
};
const BODY: Beat[] = [
  { title: "Detail", en: (t) => `Close-up details that show the key features of ${t}`, th: (t) => `ภาพระยะใกล้แสดงจุดเด่นของ ${t}`, camera: "macro close-up" },
  { title: "In Action", en: (t) => `${t} in use, natural movement and real moments`, th: (t) => `${t} ขณะใช้งานจริง เคลื่อนไหวเป็นธรรมชาติ`, camera: "tracking shot" },
  { title: "Story Moment", en: (t) => `An emotional story moment connected to ${t}`, th: (t) => `ช่วงเล่าเรื่องที่สื่ออารมณ์เกี่ยวกับ ${t}`, camera: "medium shot" },
  { title: "Wide View", en: (t) => `A sweeping wide view that shows the scale of ${t}`, th: (t) => `ภาพมุมกว้างแสดงความยิ่งใหญ่ของ ${t}`, camera: "aerial drone shot" },
];
const HIGHLIGHT: Beat = {
  title: "Highlight",
  en: (t) => `The most impressive moment of ${t}, the visual peak of the video`,
  th: (t) => `ช่วงไฮไลต์ที่น่าประทับใจที่สุดของ ${t}`,
  camera: "orbit around the subject",
};
const CLOSING: Beat = {
  title: "Closing",
  en: (t) => `A memorable closing shot of ${t} with space for a logo or call to action`,
  th: (t) => `ช็อตปิดท้ายของ ${t} เว้นพื้นที่ใส่โลโก้หรือ CTA`,
  camera: "slow zoom out",
};

export function generateScenes(total: number, topic: string, makeId: () => string): Scene[] {
  const n = suggestedSceneCount(total);
  const beats: Beat[] = [OPENING];
  if (n >= 4) beats.push(INTRO);
  const bodyCount = n - beats.length - (n >= 5 ? 2 : 1);
  for (let i = 0; i < bodyCount; i++) beats.push(BODY[i % BODY.length]);
  if (n >= 5) beats.push(HIGHLIGHT);
  beats.push(CLOSING);

  const t = topic.trim() || "the subject";
  const tTh = topic.trim() || "หัวข้อหลัก";
  const secs = splitEvenly(total, beats.length);
  const count: Record<string, number> = {};
  return beats.map((b, i) => {
    count[b.title] = (count[b.title] ?? 0) + 1;
    const repeat = BODY.includes(b) && bodyCount > BODY.length ? ` ${Math.ceil(count[b.title])}` : "";
    return {
      id: makeId(),
      title: `${b.title}${repeat}`,
      seconds: secs[i],
      visualEn: b.en(t),
      visualTh: b.th(tTh),
      camera: b.camera,
      voice: "",
      sfx: "",
    };
  });
}

/* ---------------- prompts ---------------- */

export function scenePrompt(p: Project, scene: Scene, index: number) {
  const limit = clipLimit(getPlatform(p.platformId));
  const clips = clipsFor(scene.seconds, limit);
  const perClip = Math.min(limit, Math.ceil(scene.seconds / clips));
  const type = optionOf(VIDEO_TYPES, p.videoType);
  const style = optionOf(STYLES, p.style);
  const tone = optionOf(TONES, p.tone);
  const aspect = optionOf(ASPECTS, p.aspect);
  const lang = optionOf(VOICE_LANGUAGES, p.voiceLanguage);
  const character = optionOf(VOICE_CHARACTERS, p.voiceCharacter);
  const music = optionOf(MUSIC, p.music);

  const en = [
    `Scene ${index + 1} of a ${[style?.en, type?.en ?? "video"].filter(Boolean).join(" ")}${p.topic ? ` about ${p.topic}` : ""}.`,
    `${cap(scene.visualEn.trim())}${/[.!?]$/.test(scene.visualEn.trim()) ? "" : "."}`,
    scene.camera && `Camera: ${scene.camera}.`,
    tone && `Mood: ${tone.en}.`,
    aspect && `Aspect ratio ${aspect.en}.`,
    scene.sfx && `Sound: ${scene.sfx}.`,
    `Generate as ${clips} clip${clips > 1 ? "s" : ""} of about ${perClip} seconds each, keeping the same look, lighting and characters between clips.`,
  ]
    .filter(Boolean)
    .join(" ");

  const th = [
    `ฉากที่ ${index + 1} ของวิดีโอ${type?.th ?? ""}${style ? ` ${style.th}` : ""}${p.topic ? ` เรื่อง ${p.topic}` : ""}`,
    scene.visualTh.trim(),
    scene.camera && `กล้อง: ${scene.camera}`,
    tone && `อารมณ์: ${tone.th}`,
    aspect && `สัดส่วนภาพ${aspect.th}`,
    scene.sfx && `เสียงประกอบ: ${scene.sfx}`,
    `สร้างเป็น ${clips} คลิป คลิปละประมาณ ${perClip} วินาที ให้ภาพ แสง และตัวละครต่อเนื่องกันทุกคลิป`,
  ]
    .filter(Boolean)
    .join(" · ");

  const voice = scene.voice.trim()
    ? `${lang?.label ?? "Voice"}${character ? ` (${character.label})` : ""}: ${scene.voice.trim()}`
    : "";
  return { en, th, voice, clips, perClip, music: music?.en ?? "" };
}

export function projectText(p: Project, lang: "en" | "th") {
  let t = 0;
  const lines: string[] = [
    `${p.title} — ${formatDuration(p.totalSeconds)} (${getPlatform(p.platformId).name})`,
    p.story ? (lang === "en" ? `Story: ${p.story}` : `เรื่องราว: ${p.story}`) : "",
    p.audience ? (lang === "en" ? `Audience: ${p.audience}` : `กลุ่มเป้าหมาย: ${p.audience}`) : "",
    "",
  ];
  p.scenes.forEach((s, i) => {
    const sp = scenePrompt(p, s, i);
    lines.push(`[${timecode(t)}–${timecode(t + s.seconds)}] ${s.title} (${s.seconds}s)`);
    lines.push(lang === "en" ? sp.en : sp.th);
    if (sp.voice) lines.push(`${lang === "en" ? "Voice-over" : "เสียงพูด"} — ${sp.voice}`);
    lines.push("");
    t += s.seconds;
  });
  return lines.join("\n").replace(/\n{3,}/g, "\n\n").trim();
}

const cap = (s: string) => s.charAt(0).toUpperCase() + s.slice(1);
