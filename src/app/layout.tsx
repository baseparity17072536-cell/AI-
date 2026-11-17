import type { Metadata } from "next";
import { Geist_Mono, Kanit } from "next/font/google";
import "./globals.css";
import { SITE_NAME, SITE_URL } from "@/lib/site";

const kanit = Kanit({
  variable: "--font-kanit",
  subsets: ["thai", "latin"],
  weight: ["300", "400", "500", "600", "700", "800"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

const description =
  "คลัง Prompt สำเร็จรูป พร้อมใช้งาน ช่วยให้คุณสร้างภาพ ตัดต่อวิดีโอ ทำคอนเทนต์ และผลิตคลิปวิดีโอได้ง่ายขึ้น";

export const metadata: Metadata = {
  metadataBase: new URL(SITE_URL),
  title: "CRENIX Technology — Ready-to-Use Prompts",
  description,
  openGraph: { type: "website", siteName: SITE_NAME, locale: "th_TH", title: "CRENIX Technology — Ready-to-Use Prompts", description },
  twitter: { card: "summary_large_image" },
};

const jsonLd = {
  "@context": "https://schema.org",
  "@type": "WebSite",
  name: SITE_NAME,
  url: SITE_URL,
  inLanguage: "th",
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html
      lang="th"
      className={`${kanit.variable} ${geistMono.variable} h-full antialiased scroll-smooth`}
    >
      <body className="min-h-full flex flex-col">
        <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd).replace(/</g, "\\u003c") }} />
        {children}
      </body>
    </html>
  );
}
