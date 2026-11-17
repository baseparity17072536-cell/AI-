import {
  Clapperboard,
  FilePenLine,
  Image as ImageIcon,
  Video,
  type LucideIcon,
} from "lucide-react";

export type CategorySlug = "video-editing" | "image" | "content" | "video";

export type Category = {
  slug: CategorySlug;
  title: string;
  titleTh: string;
  desc: string;
  icon: LucideIcon;
  tools: string[];
  /** Short tips shown on the category page */
  tips: string[];
};

export const categories: Category[] = [
  {
    slug: "video-editing",
    title: "Video Editing Prompts",
    titleTh: "Prompt สำหรับตัดต่อวิดีโอ",
    desc: "ให้ AI ช่วยวางแผนการตัดต่อ คิดฮุก ทำซับ และเลือกเพลง ก่อนลงมือตัดจริง",
    icon: Clapperboard,
    tools: ["ChatGPT", "Claude", "CapCut"],
    tips: [
      "ใช้กับ AI แชต เช่น ChatGPT หรือ Claude แล้วนำผลลัพธ์ไปตัดต่อใน CapCut หรือ Premiere",
      "ยิ่งบอกแพลตฟอร์มและกลุ่มคนดูชัดเจน แผนที่ได้ยิ่งตรงใจ",
      "ถ้าผลลัพธ์ยังไม่ถูกใจ พิมพ์ต่อได้เลย เช่น \"ขอแบบสนุกกว่านี้\"",
    ],
  },
  {
    slug: "image",
    title: "Image Creation Prompts",
    titleTh: "Prompt สำหรับสร้างภาพ",
    desc: "สร้างภาพสินค้า โปสเตอร์ ภาพปก และโลโก้ ด้วย AI สร้างภาพ",
    icon: ImageIcon,
    tools: ["Midjourney", "ChatGPT", "Leonardo", "Canva AI"],
    tips: [
      "Prompt สร้างภาพเขียนเป็นภาษาอังกฤษ เพราะ AI ส่วนใหญ่เข้าใจได้แม่นกว่า",
      "เปลี่ยนเฉพาะคำใน [ ] เป็นภาษาอังกฤษสั้น ๆ เช่น [your product] → coffee bottle",
      "--ar คือสัดส่วนภาพ (1:1 สี่เหลี่ยม, 4:5 โพสต์, 16:9 แนวนอน, 9:16 แนวตั้ง) ใช้ได้ใน Midjourney ถ้าใช้ AI อื่นให้ลบออกได้",
    ],
  },
  {
    slug: "content",
    title: "Content Prompts",
    titleTh: "Prompt สำหรับสร้างคอนเทนต์",
    desc: "เขียนแคปชัน สคริปต์ พาดหัว บทความ และวางแผนโพสต์ได้ในไม่กี่วินาที",
    icon: FilePenLine,
    tools: ["ChatGPT", "Claude", "Gemini"],
    tips: [
      "ใส่ข้อมูลสินค้าหรือธุรกิจให้ละเอียด AI จะเขียนได้ตรงกับแบรนด์มากขึ้น",
      "ขอหลายเวอร์ชันแล้วเลือกอันที่ชอบที่สุด",
      "อ่านทวนก่อนโพสต์เสมอ โดยเฉพาะราคา ตัวเลข และชื่อเฉพาะ",
    ],
  },
  {
    slug: "video",
    title: "Video Creation Prompts",
    titleTh: "Prompt สำหรับสร้างคลิปวิดีโอ",
    desc: "สร้างคลิปจากข้อความหรือทำภาพนิ่งให้เคลื่อนไหว ด้วย AI สร้างวิดีโอ",
    icon: Video,
    tools: ["Runway", "Pika", "Kling", "Veo"],
    tips: [
      "Prompt วิดีโอเขียนเป็นภาษาอังกฤษ และบอกการเคลื่อนกล้องด้วย เช่น slow push-in, drone shot",
      "คลิปจาก AI มักยาว 5–10 วินาที ให้สร้างหลายช็อตแล้วนำมาต่อกันใน CapCut",
      "แบบ Image to Video: อัปโหลดภาพก่อน แล้วค่อยวาง Prompt",
    ],
  },
];

export function getCategory(slug: string) {
  return categories.find((c) => c.slug === slug);
}

