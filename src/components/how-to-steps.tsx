import { ClipboardCopy, MousePointerClick, PencilLine, Send } from "lucide-react";

const steps = [
  { icon: MousePointerClick, title: "เลือก Prompt", desc: "หา Prompt ที่ตรงกับงานของคุณ" },
  { icon: ClipboardCopy, title: "กดคัดลอก", desc: "กดปุ่ม \"คัดลอก Prompt\" สีทอง" },
  { icon: PencilLine, title: "แก้คำใน [ ]", desc: "เปลี่ยนส่วนที่ไฮไลต์เป็นข้อมูลของคุณ" },
  { icon: Send, title: "วางใน AI", desc: "วางใน ChatGPT, Midjourney หรือ AI ที่ใช้ แล้วกดส่ง" },
];

export function HowToSteps() {
  return (
    <ol className="grid grid-cols-2 gap-3 lg:grid-cols-4">
      {steps.map(({ icon: Icon, title, desc }, i) => (
        <li key={title} className="gold-card flex items-start gap-3 rounded-2xl p-4">
          <span className="gold-btn grid h-8 w-8 shrink-0 place-items-center rounded-full text-sm font-bold">{i + 1}</span>
          <div>
            <p className="flex items-center gap-1.5 font-semibold">
              <Icon className="h-4 w-4 text-amber-400" /> {title}
            </p>
            <p className="mt-0.5 text-xs leading-snug text-stone-400 sm:text-sm">{desc}</p>
          </div>
        </li>
      ))}
    </ol>
  );
}
