"use client";

import { useState } from "react";

type UploadLinkActionsProps = {
  token: string;
  lang: "en" | "zh";
};

export default function UploadLinkActions({
  token,
  lang,
}: UploadLinkActionsProps) {
  const [copied, setCopied] = useState(false);

  const shareUrl = `http://localhost:3000/upload/${token}`;

  async function handleCopy() {
    try {
      await navigator.clipboard.writeText(shareUrl);
      setCopied(true);

      setTimeout(() => {
        setCopied(false);
      }, 1500);
    } catch (error) {
      console.error("Copy failed", error);
    }
  }

  return (
    <div className="shrink-0 flex gap-2">
      <a
        href={`/upload/${token}`}
        target="_blank"
        rel="noreferrer"
        className="inline-block rounded-lg bg-white text-black px-4 py-2 font-medium"
      >
        {lang === "zh" ? "打开页面" : "Open Portal"}
      </a>

      <button
        type="button"
        onClick={handleCopy}
        className="inline-block rounded-lg border border-white/10 px-4 py-2 font-medium text-white"
      >
        {copied
          ? lang === "zh"
            ? "已复制"
            : "Copied"
          : lang === "zh"
          ? "复制链接"
          : "Copy Link"}
      </button>
    </div>
  );
}