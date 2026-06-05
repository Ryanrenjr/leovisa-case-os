"use client";

import { useState } from "react";

type UploadLinkActionsProps = {
  token: string;
  clientInstructionItems: string[];
  lang: "en" | "zh";
};

export default function UploadLinkActions({
  token,
  clientInstructionItems,
  lang,
}: UploadLinkActionsProps) {
  const [copied, setCopied] = useState(false);
  const [instructionCopied, setInstructionCopied] = useState(false);

  const baseUrl = process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000";
  const shareUrl = `${baseUrl}/upload/${token}`;
  const materialList =
    clientInstructionItems.length > 0
      ? clientInstructionItems.join(lang === "zh" ? "、" : ", ")
      : lang === "zh"
      ? "顾问要求的材料"
      : "the documents requested by your consultant";
  const clientInstruction =
    lang === "zh"
      ? `请重新上传以下材料：${materialList}\n上传链接：${shareUrl}`
      : `Please upload or re-upload the following documents: ${materialList}\nUpload link: ${shareUrl}`;

  async function copyText(text: string, onCopied: (value: boolean) => void) {
    try {
      await navigator.clipboard.writeText(text);
      onCopied(true);

      setTimeout(() => {
        onCopied(false);
      }, 1500);
    } catch (error) {
      console.error("Copy failed", error);
    }
  }

  return (
    <div className="shrink-0 flex flex-wrap gap-2">
      <a
        href={`/upload/${token}`}
        target="_blank"
        rel="noreferrer"
        className="toss-primary-button px-4 py-2 text-sm font-semibold"
      >
        {lang === "zh" ? "打开页面" : "Open Portal"}
      </a>

      <button
        type="button"
        onClick={() => copyText(shareUrl, setCopied)}
        className="toss-secondary-button px-4 py-2 text-sm font-semibold"
      >
        {copied
          ? lang === "zh"
            ? "已复制"
            : "Copied"
          : lang === "zh"
          ? "复制链接"
          : "Copy Link"}
      </button>

      <button
        type="button"
        onClick={() => copyText(clientInstruction, setInstructionCopied)}
        className="toss-secondary-button px-4 py-2 text-sm font-semibold"
      >
        {instructionCopied
          ? lang === "zh"
            ? "说明已复制"
            : "Instruction Copied"
          : lang === "zh"
          ? "复制客户说明"
          : "Copy Client Note"}
      </button>
    </div>
  );
}
