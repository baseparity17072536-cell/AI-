/**
 * Builder field definitions (Step 5). Pure data: the UI renders these and the
 * prompt engine (src/lib/builder/engine.ts) turns selections into text.
 * Every option carries its English phrase (used in the prompt) and Thai phrase
 * (used in the translation), so the two always say the same thing.
 */
import type { CategorySlug } from "@/data/prompts";

export type Mode = "beginner" | "professional" | "advanced";
export const MODES: { id: Mode; label: string; desc: string }[] = [
  { id: "beginner", label: "Beginner", desc: "ตัวเลือกจำเป็นเท่านั้น เหมาะกับมือใหม่" },
  { id: "professional", label: "Professional", desc: "ปรับแสง กล้อง เสียง ได้ละเอียดขึ้น" },
  { id: "advanced", label: "Advanced", desc: "ทุกตัวเลือก + สิ่งที่ต้องหลีกเลี่ยง + แก้ Prompt เองได้" },
];
const MODE_RANK: Record<Mode, number> = { beginner: 0, professional: 1, advanced: 2 };
export const visibleIn = (fieldLevel: Mode, mode: Mode) => MODE_RANK[fieldLevel] <= MODE_RANK[mode];

export type Option = {
  id: string;
  label: string;
  /** phrase used inside the English prompt */
  en: string;
  /** phrase used inside the Thai translation */
  th: string;
  /** seconds, for duration options */
  seconds?: number;
};

export type Field = {
  id: string;
  label: string;
  labelTh: string;
  kind: "choice" | "text" | "textarea";
  level: Mode;
  options?: Option[];
  /** Adds a "Custom" chip that reveals a text box */
  allowCustom?: boolean;
  placeholder?: string;
  /** Only show when another field has one of these values */
  showWhen?: { field: string; in: string[] };
  help?: string;
};

const o = (id: string, label: string, en: string, th: string, extra: Partial<Option> = {}): Option => ({
  id,
  label,
  en,
  th,
  ...extra,
});

/* ---------- Shared option lists ---------- */

const SUBJECTS = [
  o("product", "Product", "a product", "สินค้า"),
  o("person", "Person", "a person", "บุคคล"),
  o("food", "Food", "a food dish", "อาหาร"),
  o("vehicle", "Vehicle", "a vehicle", "ยานพาหนะ"),
  o("nature", "Nature", "a natural scene", "ธรรมชาติ"),
];

const BACKGROUNDS = [
  o("beach", "Beach", "on a beach", "บนชายหาด"),
  o("mountain", "Mountain", "in the mountains", "บนภูเขา"),
  o("waterfall", "Waterfall", "beside a waterfall", "ริมน้ำตก"),
  o("forest", "Forest", "in a forest", "ในป่า"),
  o("city", "City", "in a city", "ในเมือง"),
  o("studio", "Studio", "in a clean studio", "ในสตูดิโอ"),
  o("luxury-interior", "Luxury Interior", "in a luxury interior", "ในห้องตกแต่งหรูหรา"),
  o("nature", "Nature", "surrounded by nature", "ท่ามกลางธรรมชาติ"),
  o("space", "Space", "in outer space", "ในอวกาศ"),
];

const STYLES = [
  o("cinematic", "Cinematic", "cinematic", "แบบภาพยนตร์"),
  o("realistic", "Realistic", "photorealistic", "สมจริง"),
  o("luxury", "Luxury", "luxurious, premium", "หรูหรา พรีเมียม"),
  o("minimal", "Minimal", "minimal, clean", "มินิมอล เรียบง่าย"),
  o("commercial", "Commercial", "polished commercial", "แบบโฆษณามืออาชีพ"),
  o("3d", "3D", "3D-rendered", "แบบ 3D"),
  o("anime", "Anime", "anime-style", "สไตล์อนิเมะ"),
  o("fantasy", "Fantasy", "fantasy", "แฟนตาซี"),
];

const LIGHTING = [
  o("golden-hour", "Golden Hour", "golden hour light", "แสงโกลเด้นอาวร์"),
  o("natural", "Natural Light", "natural light", "แสงธรรมชาติ"),
  o("studio", "Studio Light", "studio lighting", "แสงสตูดิโอ"),
  o("dramatic", "Dramatic Light", "dramatic, high-contrast lighting", "แสงดราม่า คอนทราสต์สูง"),
  o("soft", "Soft Light", "soft, diffused light", "แสงนุ่มนวล"),
  o("neon", "Neon", "neon lighting", "แสงนีออน"),
];

export const ASPECT_RATIOS = [
  o("9:16", "9:16", "9:16 vertical", "แนวตั้ง 9:16"),
  o("16:9", "16:9", "16:9 widescreen", "แนวนอน 16:9"),
  o("1:1", "1:1", "1:1 square", "สี่เหลี่ยมจัตุรัส 1:1"),
  o("4:5", "4:5", "4:5 portrait", "แนวตั้ง 4:5"),
  o("3:4", "3:4", "3:4 portrait", "แนวตั้ง 3:4"),
  o("21:9", "21:9", "21:9 ultra-wide", "จอกว้างพิเศษ 21:9"),
];

/** Durations up to 30 s are single-clip lengths; minutes are project lengths (→ Long Video Planner). */
export const DURATIONS = [
  ...[5, 8, 10, 15, 20, 30].map((s) => o(`${s}s`, `${s} sec`, `${s}-second`, `${s} วินาที`, { seconds: s })),
  ...[1, 5, 10, 20].map((m) => o(`${m}m`, `${m} min`, `${m}-minute`, `${m} นาที`, { seconds: m * 60 })),
];
export const MAX_SINGLE_CLIP_OPTION = 30;

const AVOID: Field = {
  id: "avoid",
  label: "Avoid",
  labelTh: "สิ่งที่ต้องหลีกเลี่ยง",
  kind: "text",
  level: "advanced",
  placeholder: "เช่น text on screen, blurry, extra fingers",
  help: "ใส่เป็นภาษาอังกฤษจะได้ผลแม่นกว่า",
};
const ADDITIONAL: Field = {
  id: "additional",
  label: "Additional Instructions",
  labelTh: "รายละเอียดเพิ่มเติม",
  kind: "textarea",
  level: "beginner",
  placeholder: "พิมพ์สิ่งที่อยากเพิ่ม เช่น ใส่โลโก้มุมขวาล่าง, โทนสีทอง-ดำ",
};

/* ---------- Per-category fields ---------- */

export const BUILDER_FIELDS: Record<CategorySlug, Field[]> = {
  video: [
    {
      id: "videoType",
      label: "Video Type",
      labelTh: "ประเภทวิดีโอ",
      kind: "choice",
      level: "beginner",
      allowCustom: true,
      options: [
        o("product-commercial", "Product Commercial", "product commercial", "โฆษณาสินค้า"),
        o("cinematic", "Cinematic", "cinematic short film", "หนังสั้นแนวภาพยนตร์"),
        o("travel", "Travel", "travel video", "วิดีโอท่องเที่ยว"),
        o("fashion", "Fashion", "fashion film", "วิดีโอแฟชั่น"),
        o("lifestyle", "Lifestyle", "lifestyle video", "วิดีโอไลฟ์สไตล์"),
        o("storytelling", "Storytelling", "storytelling video", "วิดีโอเล่าเรื่อง"),
        o("social-media", "Social Media", "social media video", "วิดีโอโซเชียลมีเดีย"),
        o("animation", "Animation", "animated video", "วิดีโอแอนิเมชัน"),
      ],
    },
    { id: "subject", label: "Subject", labelTh: "ตัวแบบหลัก", kind: "choice", level: "beginner", allowCustom: true, options: SUBJECTS },
    {
      id: "subjectDetail",
      label: "Subject Details",
      labelTh: "รายละเอียดตัวแบบหรือสินค้า",
      kind: "text",
      level: "beginner",
      placeholder: "เช่น ขวดน้ำหอมทรงเหลี่ยมสีทอง / ผู้หญิงผมยาวใส่ชุดขาว",
    },
    { id: "background", label: "Background", labelTh: "ฉากหลัง", kind: "choice", level: "beginner", allowCustom: true, options: BACKGROUNDS },
    { id: "style", label: "Visual Style", labelTh: "สไตล์ภาพ", kind: "choice", level: "beginner", options: STYLES },
    { id: "lighting", label: "Lighting", labelTh: "แสง", kind: "choice", level: "professional", options: LIGHTING },
    {
      id: "camera",
      label: "Camera Movement",
      labelTh: "การเคลื่อนกล้อง",
      kind: "choice",
      level: "professional",
      allowCustom: true,
      options: [
        o("zoom-in", "Zoom In", "a slow zoom in", "ซูมเข้าช้า ๆ"),
        o("zoom-out", "Zoom Out", "a slow zoom out", "ซูมออกช้า ๆ"),
        o("tracking", "Tracking Shot", "a smooth tracking shot", "กล้องติดตามแบบนุ่มนวล"),
        o("drone", "Drone Shot", "an aerial drone shot", "มุมโดรนจากด้านบน"),
        o("pan-left", "Pan Left", "a slow pan to the left", "แพนกล้องไปทางซ้าย"),
        o("pan-right", "Pan Right", "a slow pan to the right", "แพนกล้องไปทางขวา"),
        o("orbit", "Orbit", "an orbit around the subject", "กล้องหมุนรอบตัวแบบ"),
        o("static", "Static", "a static locked-off camera", "กล้องนิ่ง"),
      ],
    },
    {
      id: "duration",
      label: "Duration",
      labelTh: "ความยาว",
      kind: "choice",
      level: "beginner",
      allowCustom: true,
      options: DURATIONS,
      placeholder: "จำนวนวินาที เช่น 12",
      help: "5–30 วินาที = ความยาวต่อคลิป · 1 นาทีขึ้นไป = ความยาวทั้งโปรเจกต์ (ใช้ Long Video Planner)",
    },
    { id: "aspect", label: "Aspect Ratio", labelTh: "สัดส่วนภาพ", kind: "choice", level: "beginner", options: ASPECT_RATIOS },
    {
      id: "audio",
      label: "Voice & Audio",
      labelTh: "เสียง",
      kind: "choice",
      level: "professional",
      options: [
        o("none", "No Audio", "no audio", "ไม่มีเสียง"),
        o("music", "Music", "background music", "เพลงประกอบ"),
        o("ambient", "Ambient Sound", "ambient sound", "เสียงบรรยากาศ"),
        o("natural", "Natural Sound", "natural sound effects", "เสียงธรรมชาติ"),
        o("voice-over", "Voice Over", "a voice-over", "เสียงบรรยาย"),
        o("dialogue", "Dialogue", "spoken dialogue", "บทสนทนา"),
      ],
    },
    {
      id: "voiceLanguage",
      label: "Voice Language",
      labelTh: "ภาษาเสียงพูด",
      kind: "choice",
      level: "professional",
      showWhen: { field: "audio", in: ["voice-over", "dialogue"] },
      options: [
        o("th", "Thai", "Thai", "ภาษาไทย"),
        o("en", "English", "English", "ภาษาอังกฤษ"),
        o("zh", "Chinese", "Chinese", "ภาษาจีน"),
        o("ja", "Japanese", "Japanese", "ภาษาญี่ปุ่น"),
        o("ko", "Korean", "Korean", "ภาษาเกาหลี"),
      ],
    },
    {
      id: "voiceCharacter",
      label: "Voice Character",
      labelTh: "ลักษณะเสียง",
      kind: "choice",
      level: "professional",
      showWhen: { field: "audio", in: ["voice-over", "dialogue"] },
      options: [
        o("female", "Female", "female", "เสียงผู้หญิง"),
        o("male", "Male", "male", "เสียงผู้ชาย"),
        o("soft", "Soft", "soft, gentle", "นุ่มนวล"),
        o("professional", "Professional", "professional", "มืออาชีพ"),
        o("energetic", "Energetic", "energetic", "มีพลัง สดใส"),
        o("luxury", "Luxury Commercial", "luxury-commercial", "แบบโฆษณาหรู"),
      ],
    },
    {
      id: "script",
      label: "Script",
      labelTh: "บทพูด",
      kind: "textarea",
      level: "professional",
      showWhen: { field: "audio", in: ["voice-over", "dialogue"] },
      placeholder: "พิมพ์บทพูดที่ต้องการ",
    },
    AVOID,
    ADDITIONAL,
  ],

  image: [
    {
      id: "imageType",
      label: "Image Type",
      labelTh: "ประเภทภาพ",
      kind: "choice",
      level: "beginner",
      allowCustom: true,
      options: [
        o("product", "Product Photo", "product photograph", "ภาพถ่ายสินค้า"),
        o("portrait", "Portrait", "portrait photograph", "ภาพพอร์ตเทรต"),
        o("fashion", "Fashion Editorial", "fashion editorial photograph", "ภาพแฟชั่นเอดิทอเรียล"),
        o("food", "Food Photo", "food photograph", "ภาพถ่ายอาหาร"),
        o("landscape", "Landscape", "landscape photograph", "ภาพวิว"),
        o("poster", "Poster", "promotional poster", "โปสเตอร์โปรโมชัน"),
      ],
    },
    { id: "subject", label: "Subject", labelTh: "ตัวแบบหลัก", kind: "choice", level: "beginner", allowCustom: true, options: SUBJECTS },
    {
      id: "subjectDetail",
      label: "Subject Details",
      labelTh: "รายละเอียดตัวแบบหรือสินค้า",
      kind: "text",
      level: "beginner",
      placeholder: "เช่น แก้วกาแฟเซรามิกสีดำ มีไอร้อนลอยขึ้น",
    },
    { id: "background", label: "Background", labelTh: "ฉากหลัง", kind: "choice", level: "beginner", allowCustom: true, options: BACKGROUNDS },
    { id: "style", label: "Visual Style", labelTh: "สไตล์ภาพ", kind: "choice", level: "beginner", options: STYLES },
    { id: "lighting", label: "Lighting", labelTh: "แสง", kind: "choice", level: "professional", options: LIGHTING },
    {
      id: "shot",
      label: "Camera Angle",
      labelTh: "มุมกล้อง",
      kind: "choice",
      level: "professional",
      options: [
        o("close-up", "Close-up", "close-up shot", "ภาพระยะใกล้"),
        o("medium", "Medium Shot", "medium shot", "ภาพระยะกลาง"),
        o("wide", "Wide Shot", "wide shot", "ภาพมุมกว้าง"),
        o("top-down", "Top-down", "top-down flat lay", "มุมมองจากด้านบน"),
        o("low-angle", "Low Angle", "low-angle shot", "มุมต่ำ"),
        o("macro", "Macro", "macro shot", "ภาพมาโคร"),
      ],
    },
    { id: "aspect", label: "Aspect Ratio", labelTh: "สัดส่วนภาพ", kind: "choice", level: "beginner", options: ASPECT_RATIOS },
    AVOID,
    ADDITIONAL,
  ],

  "video-editing": [
    {
      id: "editType",
      label: "Editing Task",
      labelTh: "งานตัดต่อ",
      kind: "choice",
      level: "beginner",
      allowCustom: true,
      options: [
        o("color", "Color Grading", "a color grading plan", "แผนการเกรดสี"),
        o("travel", "Travel Edit", "a travel video edit plan", "แผนตัดต่อวิดีโอท่องเที่ยว"),
        o("product", "Product Edit", "a product video edit plan", "แผนตัดต่อวิดีโอสินค้า"),
        o("transitions", "Transitions", "a transition plan", "แผนการใส่ทรานซิชัน"),
        o("reel", "Reel Edit", "a short-form reel edit plan", "แผนตัดต่อคลิปสั้น"),
      ],
    },
    {
      id: "footage",
      label: "Footage",
      labelTh: "ฟุตเทจที่มี",
      kind: "textarea",
      level: "beginner",
      placeholder: "เล่าสั้น ๆ ว่ามีคลิปอะไรบ้าง เช่น คลิปทะเล 12 คลิป ถ่ายตอนเย็น ด้วยมือถือ",
    },
    {
      id: "software",
      label: "Editing Software",
      labelTh: "โปรแกรมตัดต่อ",
      kind: "choice",
      level: "beginner",
      allowCustom: true,
      options: [
        o("capcut", "CapCut", "CapCut", "CapCut"),
        o("premiere", "Premiere Pro", "Adobe Premiere Pro", "Adobe Premiere Pro"),
        o("davinci", "DaVinci Resolve", "DaVinci Resolve", "DaVinci Resolve"),
        o("fcp", "Final Cut Pro", "Final Cut Pro", "Final Cut Pro"),
      ],
    },
    { id: "style", label: "Mood / Style", labelTh: "อารมณ์และสไตล์", kind: "choice", level: "beginner", options: STYLES },
    {
      id: "pacing",
      label: "Pacing",
      labelTh: "จังหวะการตัด",
      kind: "choice",
      level: "professional",
      options: [
        o("slow", "Slow", "slow, relaxed pacing", "จังหวะช้า ผ่อนคลาย"),
        o("medium", "Medium", "medium pacing", "จังหวะปานกลาง"),
        o("fast", "Fast", "fast, punchy pacing", "จังหวะเร็ว กระชับ"),
      ],
    },
    {
      id: "platform",
      label: "Publish To",
      labelTh: "แพลตฟอร์มที่จะลง",
      kind: "choice",
      level: "beginner",
      options: [
        o("tiktok", "TikTok", "TikTok", "TikTok"),
        o("reels", "Instagram Reels", "Instagram Reels", "Instagram Reels"),
        o("shorts", "YouTube Shorts", "YouTube Shorts", "YouTube Shorts"),
        o("youtube", "YouTube", "YouTube", "YouTube"),
        o("facebook", "Facebook", "Facebook", "Facebook"),
      ],
    },
    {
      id: "duration",
      label: "Final Length",
      labelTh: "ความยาววิดีโอที่ตัดเสร็จ",
      kind: "choice",
      level: "beginner",
      allowCustom: true,
      options: DURATIONS,
      placeholder: "จำนวนวินาที เช่น 45",
    },
    {
      id: "music",
      label: "Music & Sound",
      labelTh: "เพลงและเสียง",
      kind: "choice",
      level: "professional",
      options: [
        o("upbeat", "Upbeat Music", "upbeat music cues", "เพลงจังหวะสนุก"),
        o("cinematic", "Cinematic Score", "a cinematic score", "ดนตรีแนวภาพยนตร์"),
        o("ambient", "Ambient", "ambient sound design", "เสียงบรรยากาศ"),
        o("sfx", "Sound Effects", "sound effect suggestions", "เอฟเฟกต์เสียง"),
      ],
    },
    AVOID,
    ADDITIONAL,
  ],

  content: [
    {
      id: "contentType",
      label: "Content Type",
      labelTh: "ประเภทคอนเทนต์",
      kind: "choice",
      level: "beginner",
      allowCustom: true,
      options: [
        o("caption", "Social Caption", "a social media caption", "แคปชันโซเชียลมีเดีย"),
        o("sales", "Sales Copy", "high-converting sales copy", "ข้อความขายของ"),
        o("story", "Brand Story", "a brand story", "เรื่องราวแบรนด์"),
        o("product", "Product Description", "a product description", "คำอธิบายสินค้า"),
        o("script", "Video Script", "a short video script", "สคริปต์วิดีโอสั้น"),
      ],
    },
    {
      id: "productDetail",
      label: "Product / Brand",
      labelTh: "ข้อมูลสินค้าหรือแบรนด์",
      kind: "textarea",
      level: "beginner",
      placeholder: "ชื่อสินค้า จุดเด่น ราคา หรือโปรโมชัน",
    },
    {
      id: "audience",
      label: "Target Audience",
      labelTh: "กลุ่มเป้าหมาย",
      kind: "text",
      level: "beginner",
      placeholder: "เช่น ผู้หญิงวัยทำงาน 25–35 ปี",
    },
    {
      id: "tone",
      label: "Tone",
      labelTh: "โทนการเขียน",
      kind: "choice",
      level: "beginner",
      options: [
        o("luxury", "Luxury", "luxurious and elegant", "หรูหรา มีระดับ"),
        o("friendly", "Friendly", "friendly and warm", "เป็นกันเอง อบอุ่น"),
        o("professional", "Professional", "professional and trustworthy", "มืออาชีพ น่าเชื่อถือ"),
        o("energetic", "Energetic", "energetic and fun", "สนุก มีพลัง"),
        o("minimal", "Minimal", "short and minimal", "สั้น กระชับ"),
      ],
    },
    {
      id: "language",
      label: "Output Language",
      labelTh: "ภาษาที่ต้องการ",
      kind: "choice",
      level: "beginner",
      options: [
        o("th", "Thai", "Thai", "ภาษาไทย"),
        o("en", "English", "English", "ภาษาอังกฤษ"),
        o("both", "Thai + English", "both Thai and English", "ทั้งภาษาไทยและอังกฤษ"),
      ],
    },
    {
      id: "platform",
      label: "Platform",
      labelTh: "แพลตฟอร์ม",
      kind: "choice",
      level: "professional",
      options: [
        o("facebook", "Facebook", "Facebook", "Facebook"),
        o("instagram", "Instagram", "Instagram", "Instagram"),
        o("tiktok", "TikTok", "TikTok", "TikTok"),
        o("line", "LINE OA", "LINE Official Account", "LINE OA"),
        o("website", "Website", "a website", "เว็บไซต์"),
      ],
    },
    {
      id: "length",
      label: "Length",
      labelTh: "ความยาว",
      kind: "choice",
      level: "professional",
      options: [
        o("short", "Short", "short (under 60 words)", "สั้น (ไม่เกิน 60 คำ)"),
        o("medium", "Medium", "medium length (about 120 words)", "ปานกลาง (ประมาณ 120 คำ)"),
        o("long", "Long", "long-form (about 300 words)", "ยาว (ประมาณ 300 คำ)"),
      ],
    },
    {
      id: "cta",
      label: "Call to Action",
      labelTh: "คำกระตุ้นให้ลงมือ (CTA)",
      kind: "text",
      level: "professional",
      placeholder: "เช่น ทักแชตสั่งซื้อ / กดลิงก์ในไบโอ",
    },
    AVOID,
    ADDITIONAL,
  ],
};

export const BUILDER_CATEGORIES: { slug: CategorySlug; label: string; th: string; desc: string }[] = [
  { slug: "video", label: "Video Creation", th: "สร้างคลิปวิดีโอ", desc: "Prompt สำหรับ AI สร้างวิดีโอ เช่น Runway, Pika" },
  { slug: "image", label: "Image Creation", th: "สร้างภาพ", desc: "Prompt สำหรับ AI สร้างภาพ" },
  { slug: "video-editing", label: "Video Editing", th: "วางแผนตัดต่อ", desc: "ให้ AI แชตช่วยวางแผนตัดต่อทีละขั้น" },
  { slug: "content", label: "Content Creation", th: "เขียนคอนเทนต์", desc: "แคปชัน ข้อความขาย สคริปต์" },
];
