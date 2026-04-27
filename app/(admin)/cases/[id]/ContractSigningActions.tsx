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
  const buttonLabel = copied
    ? lang === "zh"
      ? "已复制客户签署链接"
      : "Client Link Copied"
    : lang === "zh"
    ? "复制客户签署链接"
    : "Copy Client Signing Link";

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
    <div>
      <button
        type="button"
        onClick={handleCopy}
        className="toss-secondary-button px-4 py-2 text-sm font-semibold"
      >
        {buttonLabel}
      </button>

      <p className="mt-3 text-sm text-[#6b7684]">
        {lang === "zh"
          ? "顾问复制链接后，手动发给客户即可。系统不会自动发送邮件。"
          : "Consultants can copy this link and send it to the client manually. The system will not send an email automatically."}
      </p>
    </div>
  );
}
