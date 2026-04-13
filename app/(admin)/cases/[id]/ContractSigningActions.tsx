"use client";

import { useState } from "react";

type ContractSigningActionsProps = {
  signingUrl: string;
  lang: "en" | "zh";
};

export default function ContractSigningActions({
  signingUrl,
  lang,
}: ContractSigningActionsProps) {
  const [copied, setCopied] = useState(false);

  async function handleCopy() {
    try {
      await navigator.clipboard.writeText(signingUrl);
      setCopied(true);

      setTimeout(() => {
        setCopied(false);
      }, 1500);
    } catch (error) {
      console.error("Copy failed", error);
    }
  }

  return (
    <button
      type="button"
      onClick={handleCopy}
      className="toss-secondary-button px-4 py-2 text-sm font-semibold"
    >
      {copied
        ? lang === "zh"
          ? "已复制"
          : "Copied"
        : lang === "zh"
        ? "复制签署链接"
        : "Copy Signing Link"}
    </button>
  );
}
