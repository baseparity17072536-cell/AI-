/**
 * The five CRENIX AI studios. Pure data shared by server and client components.
 * Connection status is NOT stored here — it is computed on the server per request
 * (src/server/ai/status.ts) so the UI never claims a tool works when it doesn't.
 */

export type StudioToolId = "image" | "video" | "audio" | "content" | "editor";

export type StudioTool = {
  id: StudioToolId;
  name: string;
  th: string;
  desc: string;
  href: string;
  features: string[];
  /** Providers planned for this tool (from the AI platform plan) */
  plannedProviders: string[];
  /** Things the user can already do today while the tool is not connected */
  availableNow: { label: string; href: string }[];
};

export const STUDIO_TOOLS: StudioTool[] = [
  {
    id: "image",
    name: "AI Image Studio",
    th: "สร้างภาพด้วย AI",
    desc: "สร้างภาพสินค้า ภาพบุคคล แฟชั่น อาหาร ภาพโฆษณา และภาพทั่วไป",
    href: "/studio/image",
    features: ["ภาพสินค้าและโฆษณา", "ภาพบุคคลและแฟชั่น", "ภาพอาหาร", "เลือกสไตล์ แสง มุมกล้อง สัดส่วนภาพ"],
    plannedProviders: ["OpenAI Image API", "Google Gemini Image"],
    availableNow: [
      { label: "สร้าง Prompt ภาพด้วย Prompt Builder", href: "/builder?category=image" },
      { label: "ดู Prompt ภาพสำเร็จรูป", href: "/prompts/image" },
    ],
  },
  {
    id: "video",
    name: "AI Video Studio",
    th: "สร้างวิดีโอด้วย AI",
    desc: "สร้างวิดีโอจากข้อความ และทำภาพนิ่งให้เคลื่อนไหว",
    href: "/studio/video",
    features: ["Text-to-Video", "Image-to-Video", "เลือกการเคลื่อนกล้อง ความยาว สัดส่วนภาพ", "วางแผนวิดีโอยาวเป็นหลายฉาก"],
    plannedProviders: ["Runway API", "Google Veo"],
    availableNow: [
      { label: "สร้าง Prompt วิดีโอด้วย Prompt Builder", href: "/builder?category=video" },
      { label: "วางแผนวิดีโอยาวด้วย Long Video Planner", href: "/planner" },
    ],
  },
  {
    id: "audio",
    name: "AI Audio Studio",
    th: "สร้างเสียงด้วย AI",
    desc: "สร้างเสียงพูด เสียงบรรยาย และเสียงประกอบ รวมถึงเสียงภาษาไทย",
    href: "/studio/audio",
    features: ["เสียงบรรยายภาษาไทย", "เลือกลักษณะเสียง", "เสียงประกอบ", "ดาวน์โหลดไฟล์เสียง"],
    plannedProviders: ["Google Cloud Text-to-Speech (th-TH)", "ElevenLabs (v3 / v4 Turbo รองรับไทย)"],
    availableNow: [{ label: "เขียนบทพูดในแต่ละฉากด้วย Long Video Planner", href: "/planner" }],
  },
  {
    id: "content",
    name: "AI Content Studio",
    th: "เขียนคอนเทนต์ด้วย AI",
    desc: "สร้าง Caption, Sales Copy, Storytelling, Script และบทความ",
    href: "/studio/content",
    features: ["แคปชันโซเชียล", "ข้อความขายของ", "เรื่องราวแบรนด์", "สคริปต์วิดีโอ", "คำอธิบายสินค้า"],
    plannedProviders: ["OpenAI", "Google Gemini"],
    availableNow: [{ label: "ดู Prompt คอนเทนต์สำเร็จรูป", href: "/prompts/content" }],
  },
  {
    id: "editor",
    name: "Video Editing Studio",
    th: "ตัดต่อวิดีโอ",
    desc: "ตัดต่อ รวมคลิป ใส่ข้อความ Subtitle และเสียง",
    href: "/studio/editor",
    features: ["รวมหลายคลิปเป็นวิดีโอเดียว", "ใส่ข้อความและ Subtitle", "ใส่เสียงพูดและเพลง", "Export ตามสัดส่วนที่เลือก"],
    plannedProviders: ["FFmpeg (server-side worker)"],
    availableNow: [
      { label: "ให้ AI วางแผนตัดต่อ (Prompt Builder: Video Editing)", href: "/builder?category=video-editing" },
      { label: "ดู Prompt ตัดต่อสำเร็จรูป", href: "/prompts/video-editing" },
    ],
  },
];

export function getStudioTool(id: string) {
  return STUDIO_TOOLS.find((t) => t.id === id);
}
