/**
 * Tutorials (Step 8).
 *
 * Rule for platform tutorials: every platform-specific fact must come from that
 * platform's official help/docs, listed in `sources`, with the date it was checked.
 * General prompting advice (not about a specific product) has no external source.
 * Re-check sources before changing `checkedAt`.
 */
import type { CategorySlug } from "@/data/prompts";

export type TutorialCategory =
  | "getting-started"
  | "how-to-use-crenix"
  | "video-creation"
  | "image-creation"
  | "video-editing"
  | "content-creation"
  | "runway"
  | "pika"
  | "firefly"
  | "canva";

export const TUTORIAL_CATEGORIES: { id: TutorialCategory; label: string }[] = [
  { id: "getting-started", label: "Getting Started with AI Prompts" },
  { id: "how-to-use-crenix", label: "How to Use CRENIX" },
  { id: "video-creation", label: "Video Creation" },
  { id: "image-creation", label: "Image Creation" },
  { id: "video-editing", label: "Video Editing" },
  { id: "content-creation", label: "Content Creation" },
  { id: "runway", label: "Runway" },
  { id: "pika", label: "Pika" },
  { id: "firefly", label: "Adobe Firefly" },
  { id: "canva", label: "Canva AI" },
];

export type Tutorial = {
  slug: string;
  category: TutorialCategory;
  title: string;
  summary: string;
  level: "Beginner" | "Intermediate" | "Advanced";
  minutes: number;
  premium: boolean;
  /** Category art used for the illustration */
  art: CategorySlug;
  steps: { title: string; body: string }[];
  tips?: string[];
  /** Official sources for platform facts. Empty = general guidance, no platform claims. */
  sources: { label: string; url: string }[];
  checkedAt: string;
  recommendedPrompts: string[];
};

const CHECKED = "2026-11-17";

/** Gradient colors for tutorial illustrations (shared by server and client components) */
export const ART_COLORS = {
  "video-editing": { from: "#0f172a", to: "#c6a15b" },
  image: { from: "#1c1917", to: "#f5c76b" },
  content: { from: "#151515", to: "#8a6a32" },
  video: { from: "#080808", to: "#c6a15b" },
} as const;


export const TUTORIALS: Tutorial[] = [
  {
    slug: "what-is-an-ai-prompt",
    category: "getting-started",
    title: "AI Prompt คืออะไร และเขียนอย่างไรให้ได้ผล",
    summary: "พื้นฐานสำหรับมือใหม่: Prompt คือคำสั่งที่บอก AI ว่าเราต้องการอะไร ยิ่งชัดเจน ผลลัพธ์ยิ่งตรงใจ",
    level: "Beginner",
    minutes: 4,
    premium: false,
    art: "content",
    steps: [
      { title: "บอกเป้าหมายให้ชัด", body: "เริ่มด้วยสิ่งที่ต้องการ เช่น “เขียนแคปชันขายครีมกันแดด” ดีกว่า “ช่วยเขียนอะไรหน่อย”" },
      { title: "ใส่รายละเอียดที่ AI ไม่รู้", body: "AI ไม่รู้จักสินค้า ลูกค้า หรือแบรนด์ของคุณ ให้บอกชื่อสินค้า จุดเด่น กลุ่มเป้าหมาย และโทนที่ต้องการ" },
      { title: "กำหนดรูปแบบผลลัพธ์", body: "บอกความยาว ภาษา หรือรูปแบบที่อยากได้ เช่น “ขอ 3 แบบ แต่ละแบบไม่เกิน 50 คำ”" },
      { title: "ปรับทีละนิด", body: "ถ้ายังไม่ถูกใจ ให้พิมพ์ต่อว่าอยากปรับตรงไหน เช่น “สั้นลงอีก” หรือ “เป็นกันเองมากขึ้น” ไม่ต้องเริ่มใหม่ทั้งหมด" },
      { title: "ตรวจทานก่อนใช้", body: "AI อาจให้ข้อมูลผิดได้ ตรวจราคา ตัวเลข ชื่อเฉพาะ และข้อกล่าวอ้างทุกครั้งก่อนเผยแพร่" },
    ],
    tips: ["AI สร้างภาพและวิดีโอส่วนใหญ่เข้าใจ Prompt ภาษาอังกฤษแม่นกว่า", "เก็บ Prompt ที่ได้ผลดีไว้ใน My Prompts เพื่อใช้ซ้ำ"],
    sources: [],
    checkedAt: CHECKED,
    recommendedPrompts: ["social-media-caption", "product-description"],
  },
  {
    slug: "library-to-builder",
    category: "how-to-use-crenix",
    title: "ใช้ Prompt Library และ Prompt Builder ของ CRENIX",
    summary: "หา Prompt สำเร็จรูป คัดลอกไปใช้ทันที หรือกด Customize เพื่อปรับด้วยการคลิกเลือก",
    level: "Beginner",
    minutes: 3,
    premium: false,
    art: "image",
    steps: [
      { title: "ค้นหา Prompt", body: "ไปที่ Prompt Library ค้นหาด้วยคำสำคัญ หรือกรองตามหมวด Free/Premium และเรียงลำดับตามต้องการ" },
      { title: "เปิดดูรายละเอียด", body: "กด View Prompt เพื่อดู Prompt ภาษาอังกฤษ คำแปลไทย AI ที่แนะนำ และวิธีใช้งาน" },
      { title: "คัดลอกหรือปรับแต่ง", body: "กด Copy Prompt แล้วแก้คำใน [ ] เอง หรือกด Customize This Prompt เพื่อเติมคำและเลือกสไตล์ใน Builder" },
      { title: "สร้าง Prompt ใหม่ด้วยการคลิก", body: "ใน Builder เลือกประเภทงาน เลือกโหมด Beginner / Professional / Advanced แล้วคลิกตัวเลือก ระบบจะเขียน Prompt และคำแปลให้" },
      { title: "บันทึกไว้ใช้ซ้ำ", body: "กด Save to My Prompts แล้วจัดคอลเลกชันและ Tag ได้ในหน้า My Prompts" },
    ],
    sources: [],
    checkedAt: CHECKED,
    recommendedPrompts: ["luxury-product-photography", "cinematic-color-grading"],
  },
  {
    slug: "plan-a-long-video",
    category: "how-to-use-crenix",
    title: "วางแผนวิดีโอยาวด้วย Long Video Planner",
    summary: "แบ่งวิดีโอ 1–20 นาทีเป็นฉากและคลิปสั้นตามขีดจำกัดของ AI แล้วนำไปตัดต่อรวม",
    level: "Intermediate",
    minutes: 5,
    premium: true,
    art: "video",
    steps: [
      { title: "ตั้งค่าโปรเจกต์", body: "เลือกความยาวรวม หัวข้อ ประเภทวิดีโอ โทน และแพลตฟอร์ม AI ที่จะใช้" },
      { title: "สร้างแผนฉาก", body: "กดสร้างแผนฉาก ระบบจะแบ่งเวลาให้ทุกฉากรวมกันเท่ากับความยาวที่เลือกพอดี และคำนวณจำนวนคลิปต่อฉาก" },
      { title: "แก้ไขฉาก", body: "แก้ภาพในฉาก การเคลื่อนกล้อง บทพูด และเสียงประกอบ เพิ่ม ลบ หรือเรียงลำดับฉากได้ ถ้าเวลารวมไม่ตรง กดปรับเวลาให้พอดีอัตโนมัติ" },
      { title: "คัดลอก Prompt", body: "คัดลอก Prompt รายฉาก หรือทั้งโปรเจกต์ ทั้งภาษาอังกฤษและไทย" },
      { title: "สร้างคลิปและตัดต่อ", body: "สร้างคลิปทีละฉาก ตั้งชื่อไฟล์ตามลำดับ แล้วนำไปเรียงในโปรแกรมตัดต่อ ใส่เสียงพูดและเพลงเป็นแทร็กยาวต่อเนื่อง" },
    ],
    tips: ["AI สร้างวิดีโอยังสร้างวิดีโอหลายนาทีในครั้งเดียวไม่ได้ ต้องต่อคลิปสั้นเข้าด้วยกัน"],
    sources: [],
    checkedAt: CHECKED,
    recommendedPrompts: ["cinematic-travel-video", "luxury-product-commercial"],
  },
  {
    slug: "write-video-prompts",
    category: "video-creation",
    title: "โครงสร้าง Prompt สร้างวิดีโอที่ AI เข้าใจ",
    summary: "เรียงข้อมูลเป็น ช็อต → ตัวละคร → การกระทำ → สถานที่ → สไตล์ และบอกสิ่งที่ต้องการให้เกิด",
    level: "Beginner",
    minutes: 5,
    premium: false,
    art: "video",
    steps: [
      { title: "เรียงข้อมูลตามโครงสร้าง", body: "Adobe แนะนำโครงสร้าง: ประเภทช็อต ตัวละคร การกระทำ สถานที่ และสุนทรียะ (aesthetic) เช่น “Close-up shot of a barista pouring latte art in a cozy cafe, warm cinematic look”" },
      { title: "เริ่มง่าย แล้วค่อยเพิ่ม", body: "ทั้ง Runway และ Adobe แนะนำให้เริ่มจาก Prompt สั้น ๆ แล้วเพิ่มรายละเอียดทีละอย่าง เช่น การเคลื่อนไหวของตัวแบบ การเคลื่อนกล้อง หรือสไตล์" },
      { title: "บอกสิ่งที่ต้องการให้เกิด", body: "Runway ระบุว่า Gen-4 ออกแบบให้ตีความสิ่งที่ควรเกิดขึ้น การเขียนเชิงปฏิเสธ (เช่น “no camera movement”) อาจได้ผลตรงข้าม ให้เขียนว่า “the camera remains still” แทน" },
      { title: "ใช้การกระทำที่จับต้องได้", body: "คำนามธรรมทำให้ AI เดาเอง ให้แปลงความคิดเป็นการกระทำที่ชัดเจน เช่น “she turns and smiles at the camera”" },
      { title: "ระบุการเคลื่อนกล้องให้ชัด", body: "บอกมุมและการเคลื่อนกล้องที่ต้องการ เช่น slow push-in, tracking shot, aerial drone shot" },
    ],
    sources: [
      { label: "Adobe Help: Writing effective text prompts for video generation", url: "https://helpx.adobe.com/firefly/web/work-with-audio-and-video/work-with-video/writing-effective-text-prompts-for-video-generation.html" },
      { label: "Runway Help: Gen-4 Video Prompting Guide", url: "https://help.runwayml.com/hc/en-us/articles/39789879462419-Gen-4-Video-Prompting-Guide" },
    ],
    checkedAt: CHECKED,
    recommendedPrompts: ["luxury-product-commercial", "realistic-nature-video", "social-media-advertising-video"],
  },
  {
    slug: "product-photo-prompts",
    category: "image-creation",
    title: "เขียน Prompt ภาพสินค้าให้ดูพรีเมียม",
    summary: "องค์ประกอบสำคัญของ Prompt ภาพสินค้า: ตัวสินค้า ฉาก แสง มุมกล้อง และสัดส่วนภาพ",
    level: "Beginner",
    minutes: 4,
    premium: false,
    art: "image",
    steps: [
      { title: "อธิบายสินค้าให้ละเอียด", body: "บอกรูปทรง สี วัสดุ และขนาด เช่น “a matte black glass perfume bottle with a gold cap”" },
      { title: "เลือกฉากหลัง", body: "ฉากเรียบช่วยให้สินค้าเด่น เช่น marble surface, soft beige backdrop หรือใส่ของประกอบที่เข้ากับแบรนด์" },
      { title: "กำหนดแสง", body: "แสงคือสิ่งที่ทำให้ภาพดูแพง เช่น soft studio lighting, dramatic rim light หรือ golden hour light" },
      { title: "เลือกมุมกล้องและสัดส่วน", body: "เช่น close-up, top-down flat lay และสัดส่วนตามที่จะใช้ 1:1 โพสต์ 4:5 ฟีด 9:16 สตอรี่" },
      { title: "ตรวจรายละเอียดก่อนใช้จริง", body: "ภาพจาก AI อาจมีโลโก้ ตัวอักษร หรือรายละเอียดสินค้าผิดเพี้ยน ตรวจและแก้ก่อนใช้โฆษณา" },
    ],
    sources: [],
    checkedAt: CHECKED,
    recommendedPrompts: ["luxury-product-photography", "premium-food-photography"],
  },
  {
    slug: "ai-editing-plan",
    category: "video-editing",
    title: "ให้ AI แชตช่วยวางแผนตัดต่อทีละขั้น",
    summary: "ใช้ ChatGPT, Claude หรือ Gemini วางลำดับคลิป จังหวะ เพลง และค่าสี ก่อนลงมือตัดจริง",
    level: "Beginner",
    minutes: 4,
    premium: false,
    art: "video-editing",
    steps: [
      { title: "เล่าฟุตเทจที่มี", body: "บอก AI ว่ามีคลิปอะไรบ้าง ถ่ายที่ไหน ยาวเท่าไร เพื่อให้วางแผนจากของที่มีจริง" },
      { title: "บอกโปรแกรมที่ใช้", body: "ระบุโปรแกรม เช่น CapCut หรือ DaVinci Resolve เพื่อให้ได้ขั้นตอนที่ตรงกับเมนูของโปรแกรม" },
      { title: "บอกปลายทาง", body: "ระบุแพลตฟอร์มและความยาว เช่น Reels 30 วินาที เพื่อให้จังหวะตัดเหมาะสม" },
      { title: "ขอเป็นขั้นตอนพร้อม Timestamp", body: "ขอให้ตอบเป็นข้อ ๆ พร้อมเวลา จะทำตามง่ายกว่า" },
      { title: "ตรวจกับโปรแกรมจริง", body: "ชื่อเมนูหรือค่าที่ AI แนะนำอาจไม่ตรงกับเวอร์ชันโปรแกรมของคุณ ให้ใช้เป็นแนวทางแล้วปรับตามจริง" },
    ],
    sources: [],
    checkedAt: CHECKED,
    recommendedPrompts: ["cinematic-color-grading", "social-media-reel-editing", "smooth-transition-effects"],
  },
  {
    slug: "captions-that-sell",
    category: "content-creation",
    title: "เขียนแคปชันขายของด้วย AI",
    summary: "ให้ข้อมูลสินค้า กลุ่มเป้าหมาย และ CTA ที่ชัด แล้วขอหลายเวอร์ชันมาเลือก",
    level: "Beginner",
    minutes: 3,
    premium: false,
    art: "content",
    steps: [
      { title: "ใส่ข้อมูลสินค้าจริง", body: "ชื่อ จุดเด่น ราคา และโปรโมชัน ห้ามให้ AI เดาข้อมูลเอง" },
      { title: "ระบุกลุ่มเป้าหมายและโทน", body: "เช่น ผู้หญิงวัยทำงาน โทนเป็นกันเอง หรือหรูหรา" },
      { title: "กำหนด CTA", body: "บอกสิ่งที่อยากให้ลูกค้าทำ เช่น ทักแชต กดลิงก์ หรือมาที่ร้าน" },
      { title: "ขอหลายแบบ", body: "ขอ 3–5 เวอร์ชันแล้วเลือกหรือผสมกัน" },
      { title: "ตรวจข้อกล่าวอ้าง", body: "ตรวจว่าไม่มีคำโฆษณาเกินจริงหรือข้อมูลที่ผิดกฎหมายโฆษณา โดยเฉพาะสินค้าสุขภาพและความงาม" },
    ],
    sources: [],
    checkedAt: CHECKED,
    recommendedPrompts: ["social-media-caption", "high-converting-sales-copy"],
  },
  {
    slug: "runway-gen4-basics",
    category: "runway",
    title: "เริ่มต้นใช้ Runway Gen-4 Video",
    summary: "ข้อมูลจากเอกสาร Runway: ความยาวคลิป สัดส่วนภาพ และวิธีเขียน Prompt เมื่อเริ่มจากภาพ",
    level: "Beginner",
    minutes: 5,
    premium: false,
    art: "video",
    steps: [
      { title: "เตรียมภาพเริ่มต้น", body: "Gen-4 Video เริ่มจากภาพต้นแบบ ภาพบอกตัวแบบ องค์ประกอบ สี แสง และสไตล์แล้ว Runway เตือนว่าจุดบกพร่องในภาพ (เช่น มือหรือหน้าเบลอ) อาจชัดขึ้นเมื่อกลายเป็นวิดีโอ" },
      { title: "เลือกความยาวและสัดส่วน", body: "เอกสาร Runway ระบุว่า Gen-4 สร้างได้ 5 หรือ 10 วินาที และรองรับ 16:9, 9:16, 1:1, 4:3, 3:4, 21:9" },
      { title: "เขียน Prompt เน้นการเคลื่อนไหว", body: "เมื่อใช้ภาพเริ่มต้น ให้ Prompt เน้นการเคลื่อนไหวเกือบทั้งหมด การบรรยายสิ่งที่อยู่ในภาพซ้ำอย่างละเอียดอาจทำให้ภาพเคลื่อนไหวน้อยลง" },
      { title: "เขียนเชิงบวก", body: "บอกสิ่งที่ต้องการให้เกิด ไม่ใช่สิ่งที่ไม่ต้องการ เช่นใช้ “the camera remains still” แทน “no camera movement”" },
      { title: "เริ่มง่าย แล้วเพิ่มทีละอย่าง", body: "เริ่มจาก Prompt สั้น แล้วเพิ่มการเคลื่อนไหวของตัวแบบ กล้อง ฉาก หรือสไตล์ทีละองค์ประกอบ" },
    ],
    tips: ["ต้องการวิดีโอยาวกว่า 10 วินาที ให้ใช้ Long Video Planner แบ่งเป็นหลายคลิป"],
    sources: [
      { label: "Runway Help: Creating with Gen-4 Video", url: "https://help.runwayml.com/hc/en-us/articles/37327109429011-Creating-with-Gen-4-Video" },
      { label: "Runway Help: Gen-4 Video Prompting Guide", url: "https://help.runwayml.com/hc/en-us/articles/39789879462419-Gen-4-Video-Prompting-Guide" },
      { label: "Runway Help: Image to Video Prompting Guide", url: "https://help.runwayml.com/hc/en-us/articles/48324313115155-Image-to-Video-Prompting-Guide" },
    ],
    checkedAt: CHECKED,
    recommendedPrompts: ["luxury-product-commercial", "cinematic-travel-video"],
  },
  {
    slug: "pika-h3-flex-basics",
    category: "pika",
    title: "เริ่มต้นใช้ Pika H3 Flex",
    summary: "ข้อมูลจากหน้า Pika H3 Flex: โหมดการสร้าง ความยาว สัดส่วน และเสียงในคลิป",
    level: "Beginner",
    minutes: 4,
    premium: false,
    art: "video",
    steps: [
      { title: "เลือกวิธีเริ่ม", body: "Pika ระบุว่าเริ่มได้จาก Prompt ข้อความ ภาพเฟรมแรก/เฟรมสุดท้าย หรือไฟล์อ้างอิง (Reference) แล้วสร้างหลายแบบเพื่อเลือกแบบที่ชอบ" },
      { title: "ตั้งความยาวและสัดส่วน", body: "H3 Flex สร้างได้ 3–15 วินาที (เลือกเป็นวินาทีเต็ม) ที่ 24 fps และมีสัดส่วนตั้งแต่ 21:9 ถึง 9:21 รวม 16:9, 1:1, 4:5, 9:16" },
      { title: "อธิบายการเคลื่อนกล้องด้วยภาษาธรรมดา", body: "Pika ระบุว่าบอกการเคลื่อนกล้องเป็นภาษาธรรมชาติได้ เช่น orbit, dolly, crane, tracking shot, whip pan" },
      { title: "บอกหน้าที่ของไฟล์อ้างอิง", body: "ถ้าใช้ Reference ให้บอกว่าแต่ละไฟล์ใช้ทำอะไร เช่น ภาพไหนคือตัวละคร ภาพไหนคือฉาก (ใส่ได้สูงสุด 9 ภาพ 3 วิดีโอ 3 เสียง)" },
      { title: "เรื่องเสียง", body: "ทุกคลิปมีเสียงสเตอริโอที่ซิงก์กับภาพ เอกสารไม่ได้ระบุรายการภาษาเสียงพูดที่รองรับ ถ้าต้องการเสียงพูดภาษาไทยที่แม่นยำ แนะนำสร้างเสียงแยกแล้วใส่ตอนตัดต่อ" },
    ],
    sources: [
      { label: "Pika: H3 Flex", url: "https://pika.art/pika-h3-flex" },
      { label: "Pika API: H3 Flex text-to-video", url: "https://dev.pika.art/models/pika/pika-h3-flex/text-to-video" },
    ],
    checkedAt: CHECKED,
    recommendedPrompts: ["fashion-promotional-video", "social-media-advertising-video"],
  },
  {
    slug: "firefly-generate-video",
    category: "firefly",
    title: "สร้างวิดีโอด้วย Adobe Firefly (เว็บ)",
    summary: "ขั้นตอนตามเอกสาร Adobe: เลือกโมเดล ตั้งค่ากล้อง ใส่ Prompt และสร้างวิดีโอ",
    level: "Beginner",
    minutes: 5,
    premium: false,
    art: "video",
    steps: [
      { title: "เปิดเครื่องมือ", body: "ที่หน้า Firefly เลือก Video ในแผงด้านซ้าย แล้วเลือก Generate video" },
      { title: "ตรวจโมเดลและตั้งค่า", body: "โมเดลเริ่มต้นมักเป็น Firefly Video เลือกความละเอียดและสัดส่วนภาพ (ความละเอียดมีผลต่อเครดิตที่ใช้) ค่าเริ่มต้นคือ 24 FPS และ 5 วินาที" },
      { title: "ตั้งค่ากล้อง", body: "ในส่วน Camera เลือก Shot size, Camera angle (เช่น aerial, eye level, low angle) และ Motion (เช่น zoom in/out, static, handheld) — เอกสารระบุว่าบนมือถือ โมเดลพาร์ทเนอร์ไม่รองรับตัวเลือกกล้องเหล่านี้" },
      { title: "เขียน Prompt", body: "ใช้โครงสร้าง ประเภทช็อต ตัวละคร การกระทำ สถานที่ และสุนทรียะ หรือกด Enhance prompt ให้ช่วยขยายความ" },
      { title: "สร้างและดาวน์โหลด", body: "กด Generate ดูตัวอย่าง แล้วดาวน์โหลด ถ้าอยากได้ผลใกล้เคียงเดิม ตั้งค่า Seed เดิมใน Advanced settings" },
    ],
    tips: ["ตัวเลือกบางอย่างขึ้นกับเวอร์ชันและแพ็กเกจ ตรวจเมนูจริงในแอปอีกครั้ง"],
    sources: [
      { label: "Adobe Help: Generate videos using text prompts", url: "https://helpx.adobe.com/firefly/web/work-with-audio-and-video/work-with-video/generate-videos-using-text-prompts.html" },
      { label: "Adobe Help: Generate video with Firefly models", url: "https://helpx.adobe.com/firefly/web/firefly-video-editor/generate-videos/generate-video-using-firefly-models.html" },
      { label: "Adobe Help: Writing effective text prompts for video generation", url: "https://helpx.adobe.com/firefly/web/work-with-audio-and-video/work-with-video/writing-effective-text-prompts-for-video-generation.html" },
    ],
    checkedAt: CHECKED,
    recommendedPrompts: ["realistic-nature-video", "cinematic-travel-video"],
  },
  {
    slug: "canva-video-clip",
    category: "canva",
    title: "สร้างคลิปด้วย Canva AI (Create a Video Clip)",
    summary: "ขั้นตอนตามศูนย์ช่วยเหลือ Canva: คลิป 8 วินาทีพร้อมเสียง สัดส่วน 16:9",
    level: "Beginner",
    minutes: 3,
    premium: false,
    art: "video",
    steps: [
      { title: "เปิด Video clip", body: "ที่หน้าแรก Canva เลือก Canva AI แล้วเลือก Video clip (ฟีเจอร์นี้ใช้ได้ในแพ็กเกจที่ชำระเงิน Pro, Teams, Enterprise และ Canva Nonprofit)" },
      { title: "เขียน Prompt เป็นภาษาอังกฤษ", body: "Canva ระบุว่ารองรับ Prompt ภาษาอังกฤษเท่านั้น ให้เริ่มด้วยตัวแบบหรือการกระทำหลัก แล้วใส่สไตล์ การจัดเฟรม แสง และการเคลื่อนกล้อง" },
      { title: "เลือกตัวเลือกเพิ่มเติม", body: "เลือก Style, Aspect ratio, Framing และ Lighting ได้ และแนบภาพอ้างอิงเพื่อกำหนดสไตล์หรือองค์ประกอบได้" },
      { title: "สร้างคลิป", body: "ได้คลิป 16:9 ยาวสูงสุด 8 วินาทีพร้อมเสียงที่ซิงก์ (หรือ 6 วินาทีแบบไม่มีเสียง) ครั้งละ 1 คลิป" },
      { title: "แก้ไขต่อ", body: "ดาวน์โหลด หรือเปิดใน Canva Editor เพื่อใส่ข้อความ ตัดต่อ หรือเพิ่มเพลง — เสียงที่ AI สร้างในคลิปแก้ไขเองไม่ได้" },
    ],
    tips: ["จำนวนครั้งที่สร้างได้ต่อเดือนขึ้นกับแพ็กเกจ ตรวจโควตาปัจจุบันในบัญชี Canva"],
    sources: [
      { label: "Canva Help: Create a video clip in Canva AI", url: "https://www.canva.com/help/video-clip/" },
      { label: "Canva Help: Transform your image into a video", url: "https://www.canva.com/help/image-to-video/" },
    ],
    checkedAt: CHECKED,
    recommendedPrompts: ["social-media-advertising-video", "luxury-product-commercial"],
  },
];

export function getTutorial(slug: string) {
  return TUTORIALS.find((t) => t.slug === slug);
}

export function tutorialCategoryLabel(id: TutorialCategory) {
  return TUTORIAL_CATEGORIES.find((c) => c.id === id)?.label ?? id;
}

export function relatedTutorials(t: Tutorial, n = 3) {
  const same = TUTORIALS.filter((x) => x.slug !== t.slug && x.category === t.category);
  const sameArt = TUTORIALS.filter((x) => x.slug !== t.slug && x.category !== t.category && x.art === t.art);
  return [...same, ...sameArt].slice(0, n);
}
