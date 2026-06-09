"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";

type ChecklistSummaryDocument = {
  id: string;
  displayName: string | null;
  originalFilename: string;
  reviewStatus: string;
  createdAt: Date | string;
};

type ChecklistSummaryItem = {
  id: string;
  label: string;
  description: string | null;
  isRequired: boolean;
  sortOrder: number;
  documents: ChecklistSummaryDocument[];
};

type ChecklistSummaryDialogProps = {
  caseId: string;
  items: ChecklistSummaryItem[];
  lang: "en" | "zh";
};

function formatDate(value: Date | string) {
  return new Date(value).toLocaleString("en-GB", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
}

export default function ChecklistSummaryDialog({
  caseId,
  items,
  lang,
}: ChecklistSummaryDialogProps) {
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [isReordering, startReorderTransition] = useTransition();
  const [draggedItemId, setDraggedItemId] = useState("");
  const [orderedItems, setOrderedItems] = useState(() =>
    [...items].sort(
      (a, b) => a.sortOrder - b.sortOrder || a.label.localeCompare(b.label)
    )
  );
  const uploadedCount = items.filter((item) => item.documents.length > 0).length;
  const requiredCount = items.filter((item) => item.isRequired).length;
  const missingRequiredCount = items.filter(
    (item) => item.isRequired && item.documents.length === 0
  ).length;

  function persistChecklistOrder(nextItems: ChecklistSummaryItem[]) {
    startReorderTransition(async () => {
      const response = await fetch(`/cases/${caseId}/checklist/reorder`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          itemIds: nextItems.map((item) => item.id),
        }),
      });

      if (!response.ok) {
        setOrderedItems(
          [...items].sort(
            (a, b) =>
              a.sortOrder - b.sortOrder || a.label.localeCompare(b.label)
          )
        );
        return;
      }

      router.refresh();
    });
  }

  function handleDrop(targetItemId: string) {
    if (!draggedItemId || draggedItemId === targetItemId) {
      setDraggedItemId("");
      return;
    }

    const fromIndex = orderedItems.findIndex((item) => item.id === draggedItemId);
    const toIndex = orderedItems.findIndex((item) => item.id === targetItemId);

    if (fromIndex === -1 || toIndex === -1) {
      setDraggedItemId("");
      return;
    }

    const nextItems = [...orderedItems];
    const [movedItem] = nextItems.splice(fromIndex, 1);
    nextItems.splice(toIndex, 0, movedItem);
    setOrderedItems(nextItems);
    setDraggedItemId("");
    persistChecklistOrder(nextItems);
  }

  return (
    <>
      <button
        type="button"
        onClick={() => setOpen(true)}
        className="toss-secondary-button px-5 py-3 text-sm font-semibold leading-5"
      >
        {lang === "zh" ? "材料清单" : "Checklist"}
      </button>

      {open ? (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/30 px-4 py-8">
          <div className="max-h-[88vh] w-full max-w-4xl overflow-hidden rounded-[24px] bg-white shadow-[0_24px_80px_rgba(15,23,42,0.18)]">
            <div className="flex items-start justify-between gap-4 border-b border-[#eef1f4] px-6 py-5">
              <div>
                <h3 className="text-[24px] font-bold text-[#191f28]">
                  {lang === "zh" ? "材料清单进度" : "Document Checklist Progress"}
                </h3>
                <p className="mt-1 text-sm text-[#6b7684]">
                  {uploadedCount}/{items.length}{" "}
                  {lang === "zh" ? "项已有上传" : "items uploaded"} ·{" "}
                  {missingRequiredCount}{" "}
                  {lang === "zh" ? "项必传未上传" : "required missing"}
                </p>
              </div>
              <button
                type="button"
                onClick={() => setOpen(false)}
                className="toss-secondary-button px-4 py-2 text-sm font-semibold"
              >
                {lang === "zh" ? "关闭" : "Close"}
              </button>
            </div>

            <div className="grid grid-cols-1 gap-3 border-b border-[#eef1f4] bg-[#fafbfc] px-6 py-4 md:grid-cols-3">
              <div>
                <p className="text-xs font-semibold text-[#8b95a1]">
                  {lang === "zh" ? "总项数" : "Total"}
                </p>
                <p className="mt-1 text-[22px] font-bold text-[#191f28]">
                  {items.length}
                </p>
              </div>
              <div>
                <p className="text-xs font-semibold text-[#8b95a1]">
                  {lang === "zh" ? "必传项" : "Required"}
                </p>
                <p className="mt-1 text-[22px] font-bold text-[#191f28]">
                  {requiredCount}
                </p>
              </div>
              <div>
                <p className="text-xs font-semibold text-[#8b95a1]">
                  {lang === "zh" ? "已上传项" : "Uploaded"}
                </p>
                <p className="mt-1 text-[22px] font-bold text-[#191f28]">
                  {uploadedCount}
                </p>
              </div>
            </div>

            <div className="max-h-[58vh] space-y-3 overflow-auto p-6">
              {orderedItems.length === 0 ? (
                <p className="rounded-2xl border border-dashed border-[#dfe3e8] p-5 text-sm text-[#8b95a1]">
                  {lang === "zh"
                    ? "还没有配置材料清单。"
                    : "No checklist has been configured yet."}
                </p>
              ) : (
                orderedItems.map((item, index) => {
                  const uploaded = item.documents.length > 0;

                  return (
                    <div
                      key={item.id}
                      draggable
                      onDragStart={() => setDraggedItemId(item.id)}
                      onDragOver={(event) => event.preventDefault()}
                      onDrop={() => handleDrop(item.id)}
                      onDragEnd={() => setDraggedItemId("")}
                      className={`cursor-move rounded-2xl border border-[#eef1f4] bg-white p-4 transition ${
                        draggedItemId === item.id ? "opacity-60" : ""
                      }`}
                    >
                      <div className="flex flex-col gap-3 md:flex-row md:items-start md:justify-between">
                        <div>
                          <p className="text-xs font-semibold text-[#8b95a1]">
                            {index + 1}.{" "}
                            {item.isRequired
                              ? lang === "zh"
                                ? "必传"
                                : "Required"
                              : lang === "zh"
                              ? "可选"
                              : "Optional"}
                            {" · "}
                            {lang === "zh" ? "拖拽调整顺序" : "Drag to reorder"}
                            {isReordering
                              ? lang === "zh"
                                ? " · 保存中"
                                : " · saving"
                              : ""}
                          </p>
                          <p className="mt-1 text-[16px] font-semibold text-[#191f28]">
                            {item.label}
                          </p>
                          {item.description ? (
                            <p className="mt-1 whitespace-pre-wrap text-sm leading-6 text-[#6b7684]">
                              {item.description}
                            </p>
                          ) : null}
                        </div>
                        <span
                          className={`shrink-0 rounded-full px-3 py-1 text-xs font-semibold ${
                            uploaded
                              ? "bg-[#ecfdf3] text-[#16794c]"
                              : "bg-[#fff7ed] text-[#b45309]"
                          }`}
                        >
                          {uploaded
                            ? lang === "zh"
                              ? "已上传"
                              : "Uploaded"
                            : lang === "zh"
                            ? "未上传"
                            : "Missing"}
                        </span>
                      </div>

                      {uploaded ? (
                        <div className="mt-3 space-y-2">
                          {item.documents.map((document) => (
                            <div
                              key={document.id}
                              className="rounded-xl bg-[#fafbfc] px-3 py-2 text-sm text-[#4e5968]"
                            >
                              <p className="font-semibold text-[#333d4b]">
                                {document.displayName ||
                                  document.originalFilename}
                              </p>
                              <p className="mt-1 text-xs text-[#8b95a1]">
                                {document.reviewStatus} ·{" "}
                                {formatDate(document.createdAt)}
                              </p>
                            </div>
                          ))}
                        </div>
                      ) : null}
                    </div>
                  );
                })
              )}
            </div>
          </div>
        </div>
      ) : null}
    </>
  );
}
