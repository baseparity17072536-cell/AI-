"use client";

import { useRouter } from "next/navigation";
import { Builder } from "@/components/builder/builder-entry";

/** AI Content Studio: the content Prompt Builder plus server-side AI generation. */
export function ContentStudio() {
  const router = useRouter();
  return (
    <Builder
      category="content"
      onChangeCategory={() => router.push("/studio")}
      studio={{ title: "AI Content Studio", backLabel: "กลับไป Creative Dashboard" }}
    />
  );
}
