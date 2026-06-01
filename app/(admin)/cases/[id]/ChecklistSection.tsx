"use client";

import { useMemo, useState } from "react";
import ConfirmSubmitButton from "../../../../components/ConfirmSubmitButton";
import {
  documentChecklistTemplates,
  flattenDocumentChecklistTemplate,
  type EditableChecklistTemplateItem,
} from "../../../../lib/checklists/templates";

type ChecklistItem = {
  id: string;
  label: string;
  description: string | null;
  isRequired: boolean;
  sortOrder: number;
  _count: {
    documents: number;
  };
};

type ChecklistSectionProps = {
  caseId: string;
  items: ChecklistItem[];
  lang: "en" | "zh";
  defaultExpanded?: boolean;
  onCreateAction: (formData: FormData) => void;
  onApplyTemplateAction: (formData: FormData) => void;
  onUpdateAction: (formData: FormData) => void;
  onDeleteAction: (formData: FormData) => void;
  onMoveUpAction: (formData: FormData) => void;
  onMoveDownAction: (formData: FormData) => void;
};

function cloneTemplateItems(templateKey: string) {
  const template =
    documentChecklistTemplates.find((item) => item.key === templateKey) ??
    documentChecklistTemplates[0]!;

  return flattenDocumentChecklistTemplate(template).map((item) => ({ ...item }));
}

function makeCustomTemplateItem(): EditableChecklistTemplateItem {
  return {
    id: `custom_${Date.now()}_${Math.random().toString(36).slice(2, 8)}`,
    sectionTitleZh: "自定义",
    sectionTitleEn: "Custom",
    label: "",
    description: "",
    isRequired: true,
  };
}

export default function ChecklistSection({
  caseId,
  items,
  lang,
  defaultExpanded = false,
  onCreateAction,
  onApplyTemplateAction,
  onUpdateAction,
  onDeleteAction,
  onMoveUpAction,
  onMoveDownAction,
}: ChecklistSectionProps) {
  const [selectedTemplateKey, setSelectedTemplateKey] = useState(
    documentChecklistTemplates[0]?.key ?? ""
  );
  const [editableTemplateItems, setEditableTemplateItems] = useState<
    EditableChecklistTemplateItem[]
  >(() => cloneTemplateItems(documentChecklistTemplates[0]?.key ?? ""));
  const [templateMode, setTemplateMode] = useState<"append" | "replace">(
    "append"
  );
  const requiredCount = items.filter((item) => item.isRequired).length;
  const uploadedCount = items.filter((item) => item._count.documents > 0).length;
  const visibleItems = items.slice(0, 3);
  const hiddenItems = items.slice(3);
  const selectedTemplate = useMemo(
    () =>
      documentChecklistTemplates.find(
        (template) => template.key === selectedTemplateKey
      ) ?? documentChecklistTemplates[0]!,
    [selectedTemplateKey]
  );
  const templatePayload = useMemo(
    () =>
      JSON.stringify(
        editableTemplateItems
          .map((item) => ({
            label: item.label.trim(),
            description: item.description?.trim() || "",
            isRequired: item.isRequired ?? true,
          }))
          .filter((item) => item.label)
      ),
    [editableTemplateItems]
  );

  function selectTemplate(templateKey: string) {
    setSelectedTemplateKey(templateKey);
    setEditableTemplateItems(cloneTemplateItems(templateKey));
  }

  function updateTemplateItem(
    id: string,
    field: "label" | "description" | "isRequired",
    value: string | boolean
  ) {
    setEditableTemplateItems((prev) =>
      prev.map((item) => (item.id === id ? { ...item, [field]: value } : item))
    );
  }

  function removeTemplateItem(id: string) {
    setEditableTemplateItems((prev) => prev.filter((item) => item.id !== id));
  }

  function addTemplateItem() {
    setEditableTemplateItems((prev) => [...prev, makeCustomTemplateItem()]);
  }

  function renderChecklistItem(item: ChecklistItem, index: number) {
    const preserveExpanded = defaultExpanded || index >= 3;
    const isFirst = index === 0;
    const isLast = index === items.length - 1;

    return (
      <div key={item.id} className="toss-soft-card p-5">
        <div className="mb-5 flex items-start justify-between gap-4">
          <div>
            <p className="toss-label mb-2">
              {lang === "zh" ? `清单项 ${index + 1}` : `Checklist Item ${index + 1}`}
            </p>
            <p className="text-[18px] font-semibold text-[#191f28]">
              {item.label}
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-2">
            <form action={onMoveUpAction}>
              <input type="hidden" name="caseId" value={caseId} />
              <input type="hidden" name="itemId" value={item.id} />
              <input
                type="hidden"
                name="preserveExpanded"
                value={preserveExpanded ? "1" : ""}
              />
              <button
                type="submit"
                disabled={isFirst}
                className="inline-flex items-center justify-center rounded-2xl border border-[#eef1f4] bg-white px-3 py-2 text-sm font-semibold text-[#4e5968] disabled:cursor-not-allowed disabled:text-[#c2c8cf]"
              >
                {lang === "zh" ? "上移" : "Up"}
              </button>
            </form>
            <form action={onMoveDownAction}>
              <input type="hidden" name="caseId" value={caseId} />
              <input type="hidden" name="itemId" value={item.id} />
              <input
                type="hidden"
                name="preserveExpanded"
                value={preserveExpanded ? "1" : ""}
              />
              <button
                type="submit"
                disabled={isLast}
                className="inline-flex items-center justify-center rounded-2xl border border-[#eef1f4] bg-white px-3 py-2 text-sm font-semibold text-[#4e5968] disabled:cursor-not-allowed disabled:text-[#c2c8cf]"
              >
                {lang === "zh" ? "下移" : "Down"}
              </button>
            </form>
            <span className="inline-flex items-center justify-center rounded-2xl border border-[#eef1f4] bg-white px-4 py-2 text-sm font-semibold text-[#4e5968]">
              {item._count.documents}{" "}
              {lang === "zh" ? "个上传文件" : "uploaded file(s)"}
            </span>
            <span
              className={`inline-flex items-center justify-center rounded-2xl px-4 py-2 text-sm font-semibold ${
                item.isRequired
                  ? "border border-[#dbe7ff] bg-[#eef4ff] text-[#3563e9]"
                  : "border border-[#eef1f4] bg-white text-[#6b7684]"
              }`}
            >
              {item.isRequired
                ? lang === "zh"
                  ? "必传"
                  : "Required"
                : lang === "zh"
                ? "可选"
                : "Optional"}
            </span>
          </div>
        </div>

        <form action={onUpdateAction} className="space-y-4">
          <input type="hidden" name="caseId" value={caseId} />
          <input type="hidden" name="itemId" value={item.id} />
          <input
            type="hidden"
            name="preserveExpanded"
            value={preserveExpanded ? "1" : ""}
          />

          <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
            <div>
              <label className="toss-label mb-3 block">
                {lang === "zh" ? "材料名称" : "Item Label"}
              </label>
              <input
                type="text"
                name="label"
                defaultValue={item.label}
                className="w-full px-4 py-3"
                required
              />
            </div>

            <div className="flex items-end">
              <label className="inline-flex items-center gap-3 rounded-2xl border border-[#e5e8eb] bg-white px-4 py-3 text-sm font-semibold text-[#191f28]">
                <input
                  type="checkbox"
                  name="isRequired"
                  defaultChecked={item.isRequired}
                />
                <span>{lang === "zh" ? "设为必传项" : "Mark as required"}</span>
              </label>
            </div>
          </div>

          <div>
            <label className="toss-label mb-3 block">
              {lang === "zh" ? "说明" : "Instructions"}
            </label>
            <textarea
              name="description"
              defaultValue={item.description ?? ""}
              rows={3}
              className="w-full px-4 py-3"
            />
          </div>

          <div className="flex flex-wrap justify-end gap-3">
            <button
              type="submit"
              className="toss-secondary-button px-4 py-3 text-sm font-semibold"
            >
              {lang === "zh" ? "保存清单项" : "Save Item"}
            </button>
          </div>
        </form>

        <div className="mt-4 flex justify-end">
          <form action={onDeleteAction}>
            <input type="hidden" name="caseId" value={caseId} />
            <input type="hidden" name="itemId" value={item.id} />
            <input
              type="hidden"
              name="preserveExpanded"
              value={preserveExpanded ? "1" : ""}
            />

            <ConfirmSubmitButton
              label={lang === "zh" ? "删除清单项" : "Delete Item"}
              confirmMessage={
                lang === "zh"
                  ? "确认要删除这个清单项吗？已上传的文件会保留，但不会再关联到这个清单项。"
                  : "Delete this checklist item? Existing uploaded documents will remain, but they will no longer be linked to this checklist item."
              }
              className="toss-danger-button px-4 py-3 text-sm font-semibold"
            />
          </form>
        </div>
      </div>
    );
  }

  return (
    <div id="document-checklist-section" className="toss-card mb-8 p-8">
      <div className="mb-6 flex items-center justify-between gap-4">
        <div>
          <h2 className="text-[28px] font-bold tracking-[-0.02em] text-[#191f28]">
            {lang === "zh" ? "材料清单" : "Document Checklist"}
          </h2>
          <p className="mt-2 text-[15px] text-[#6b7684]">
            {lang === "zh"
              ? "先选择材料模板并按案件删改，再让客户按照清单逐项上传。"
              : "Choose a document template, tailor it for the case, then let the client upload against the checklist."}
          </p>
        </div>

        <div className="text-right text-sm font-medium text-[#8b95a1]">
          <p>
            {items.length} {lang === "zh" ? "项清单" : "item(s)"}
          </p>
          <p>
            {uploadedCount}/{items.length}{" "}
            {lang === "zh" ? "项已有上传" : "with uploads"}
          </p>
        </div>
      </div>

      <div className="mb-6 grid grid-cols-1 gap-4 md:grid-cols-3">
        <div className="rounded-2xl border border-[#eef1f4] bg-[#fafbfc] p-5">
          <p className="mb-2 text-sm font-medium text-[#8b95a1]">
            {lang === "zh" ? "总清单项" : "Total Items"}
          </p>
          <p className="text-[22px] font-bold text-[#191f28]">{items.length}</p>
        </div>

        <div className="rounded-2xl border border-[#eef1f4] bg-[#fafbfc] p-5">
          <p className="mb-2 text-sm font-medium text-[#8b95a1]">
            {lang === "zh" ? "必传项" : "Required"}
          </p>
          <p className="text-[22px] font-bold text-[#191f28]">{requiredCount}</p>
        </div>

        <div className="rounded-2xl border border-[#eef1f4] bg-[#fafbfc] p-5">
          <p className="mb-2 text-sm font-medium text-[#8b95a1]">
            {lang === "zh" ? "已上传项" : "Uploaded"}
          </p>
          <p className="text-[22px] font-bold text-[#191f28]">{uploadedCount}</p>
        </div>
      </div>

      <div className="mb-6 rounded-[24px] border border-[#eef1f4] bg-[#fafbfc] p-6">
        <div className="mb-5 flex flex-col gap-3 xl:flex-row xl:items-start xl:justify-between">
          <div>
            <h3 className="text-[20px] font-bold tracking-[-0.02em] text-[#191f28]">
              {lang === "zh" ? "从材料模板生成" : "Create From Template"}
            </h3>
            <p className="mt-1 text-sm leading-6 text-[#6b7684]">
              {lang === "zh"
                ? selectedTemplate.descriptionZh
                : selectedTemplate.descriptionEn}
            </p>
          </div>

          <div className="flex flex-col gap-3 md:min-w-[420px] md:flex-row">
            <select
              value={selectedTemplateKey}
              onChange={(event) => selectTemplate(event.target.value)}
              className="w-full px-4 py-3 text-sm md:min-w-[280px]"
            >
              {documentChecklistTemplates.map((template) => (
                <option key={template.key} value={template.key}>
                  {lang === "zh" ? template.titleZh : template.titleEn}
                </option>
              ))}
            </select>
            <button
              type="button"
              onClick={() => selectTemplate(selectedTemplateKey)}
              className="toss-secondary-button px-4 py-3 text-sm font-semibold"
            >
              {lang === "zh" ? "重置" : "Reset"}
            </button>
          </div>
        </div>

        <div className="grid grid-cols-1 gap-5 xl:grid-cols-[1fr_320px]">
          <div className="max-h-[520px] space-y-3 overflow-auto rounded-2xl border border-[#e8edf3] bg-white p-4">
            {editableTemplateItems.map((templateItem, index) => (
              <div
                key={templateItem.id}
                className="rounded-xl border border-[#eef1f4] bg-[#fafbfc] p-4"
              >
                <div className="mb-3 flex flex-col gap-3 md:flex-row md:items-start md:justify-between">
                  <div>
                    <p className="text-xs font-semibold text-[#8b95a1]">
                      {index + 1}.{" "}
                      {lang === "zh"
                        ? templateItem.sectionTitleZh
                        : templateItem.sectionTitleEn}
                    </p>
                  </div>
                  <div className="flex shrink-0 flex-wrap items-center gap-3">
                    <label className="inline-flex items-center gap-2 text-sm font-semibold text-[#4e5968]">
                      <input
                        type="checkbox"
                        checked={templateItem.isRequired ?? true}
                        onChange={(event) =>
                          updateTemplateItem(
                            templateItem.id,
                            "isRequired",
                            event.target.checked
                          )
                        }
                      />
                      {lang === "zh" ? "必传" : "Required"}
                    </label>
                    <button
                      type="button"
                      onClick={() => removeTemplateItem(templateItem.id)}
                      className="toss-danger-button px-3 py-2 text-xs font-semibold"
                    >
                      {lang === "zh" ? "删除" : "Remove"}
                    </button>
                  </div>
                </div>

                <div className="space-y-3">
                  <input
                    value={templateItem.label}
                    onChange={(event) =>
                      updateTemplateItem(
                        templateItem.id,
                        "label",
                        event.target.value
                      )
                    }
                    placeholder={
                      lang === "zh" ? "材料名称" : "Document item label"
                    }
                    className="w-full px-4 py-3 text-sm"
                  />
                  <textarea
                    value={templateItem.description ?? ""}
                    onChange={(event) =>
                      updateTemplateItem(
                        templateItem.id,
                        "description",
                        event.target.value
                      )
                    }
                    rows={2}
                    placeholder={
                      lang === "zh"
                        ? "说明、格式要求或备注"
                        : "Instructions, format requirements, or notes"
                    }
                    className="w-full px-4 py-3 text-sm"
                  />
                </div>
              </div>
            ))}

            {editableTemplateItems.length === 0 ? (
              <p className="rounded-xl border border-dashed border-[#dfe3e8] px-4 py-3 text-sm text-[#8b95a1]">
                {lang === "zh"
                  ? "当前模板没有保留任何材料项。"
                  : "No document items remain in this template."}
              </p>
            ) : null}
          </div>

          <div className="rounded-2xl border border-[#e8edf3] bg-white p-4 xl:self-start">
            <p className="mb-3 text-sm font-bold text-[#191f28]">
              {lang === "zh" ? "应用方式" : "Apply Mode"}
            </p>
            <div className="space-y-3">
              <label className="flex items-start gap-3 rounded-xl border border-[#eef1f4] p-3 text-sm text-[#4e5968]">
                <input
                  type="radio"
                  checked={templateMode === "append"}
                  onChange={() => setTemplateMode("append")}
                />
                <span>
                  <strong className="block text-[#191f28]">
                    {lang === "zh" ? "添加到当前清单" : "Append to current list"}
                  </strong>
                  {lang === "zh"
                    ? "保留已有清单项和上传关联。"
                    : "Keep existing items and upload links."}
                </span>
              </label>
              <label className="flex items-start gap-3 rounded-xl border border-[#eef1f4] p-3 text-sm text-[#4e5968]">
                <input
                  type="radio"
                  checked={templateMode === "replace"}
                  onChange={() => setTemplateMode("replace")}
                />
                <span>
                  <strong className="block text-[#191f28]">
                    {lang === "zh" ? "替换当前清单" : "Replace current list"}
                  </strong>
                  {lang === "zh"
                    ? "已有上传文件会保留，但会解除原清单项关联。"
                    : "Uploaded files stay, but their old checklist links are cleared."}
                </span>
              </label>
            </div>

            <button
              type="button"
              onClick={addTemplateItem}
              className="toss-secondary-button mt-4 w-full px-4 py-3 text-sm font-semibold"
            >
              {lang === "zh" ? "新增材料项" : "Add Item"}
            </button>

            <form
              action={onApplyTemplateAction}
              className="mt-3"
              onSubmit={(event) => {
                if (
                  templateMode === "replace" &&
                  !window.confirm(
                    lang === "zh"
                      ? "确认替换当前材料清单吗？已上传文件会保留，但会解除原清单项关联。"
                      : "Replace the current checklist? Uploaded files will stay, but their old checklist links will be cleared."
                  )
                ) {
                  event.preventDefault();
                }
              }}
            >
              <input type="hidden" name="caseId" value={caseId} />
              <input type="hidden" name="templateKey" value={selectedTemplateKey} />
              <input type="hidden" name="templateMode" value={templateMode} />
              <input type="hidden" name="templateItems" value={templatePayload} />
              <input
                type="hidden"
                name="preserveExpanded"
                value={defaultExpanded ? "1" : ""}
              />
              <button
                type="submit"
                disabled={editableTemplateItems.length === 0}
                className="toss-primary-button w-full px-4 py-3 text-sm font-semibold disabled:cursor-not-allowed disabled:opacity-50"
              >
                {lang === "zh" ? "应用到材料清单" : "Apply to Checklist"}
              </button>
            </form>
          </div>
        </div>
      </div>

      <div className="mb-6 rounded-[24px] border border-[#eef1f4] bg-[#fafbfc] p-6">
        <h3 className="mb-4 text-[20px] font-bold tracking-[-0.02em] text-[#191f28]">
          {lang === "zh" ? "手动新增材料项" : "Add Checklist Item"}
        </h3>

        <form action={onCreateAction} className="space-y-4">
          <input type="hidden" name="caseId" value={caseId} />
          <input
            type="hidden"
            name="preserveExpanded"
            value={defaultExpanded ? "1" : ""}
          />

          <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
            <div>
              <label className="toss-label mb-3 block">
                {lang === "zh" ? "材料名称" : "Item Label"}
              </label>
              <input
                type="text"
                name="label"
                className="w-full px-4 py-3"
                placeholder={
                  lang === "zh" ? "例如：护照首页" : "e.g. Passport Bio Page"
                }
                required
              />
            </div>

            <div className="flex items-end">
              <label className="inline-flex items-center gap-3 rounded-2xl border border-[#e5e8eb] bg-white px-4 py-3 text-sm font-semibold text-[#191f28]">
                <input type="checkbox" name="isRequired" defaultChecked />
                <span>{lang === "zh" ? "设为必传项" : "Mark as required"}</span>
              </label>
            </div>
          </div>

          <div>
            <label className="toss-label mb-3 block">
              {lang === "zh" ? "说明" : "Instructions"}
            </label>
            <textarea
              name="description"
              rows={3}
              className="w-full px-4 py-3"
              placeholder={
                lang === "zh"
                  ? "可填写格式要求、日期范围或其他备注"
                  : "Optional notes such as format, date range, or specific pages"
              }
            />
          </div>

          <div className="flex justify-end">
            <button
              type="submit"
              className="toss-primary-button px-6 py-3 text-sm font-semibold"
            >
              {lang === "zh" ? "添加清单项" : "Add Checklist Item"}
            </button>
          </div>
        </form>
      </div>

      {items.length === 0 ? (
        <p className="text-[15px] text-[#8b95a1]">
          {lang === "zh"
            ? "还没有配置材料清单。未配置时，客户门户仍然显示通用上传模式。"
            : "No checklist has been configured yet. Until then, the client portal will stay in generic upload mode."}
        </p>
      ) : (
        <div className="space-y-4">
          {visibleItems.map((item, index) => renderChecklistItem(item, index))}

          {hiddenItems.length > 0 ? (
            <details
              open={defaultExpanded}
              className="rounded-[24px] border border-[#eef1f4] bg-[#fafbfc] p-5"
            >
              <summary className="cursor-pointer list-none text-sm font-semibold text-[#3563e9] [&::-webkit-details-marker]:hidden">
                {lang === "zh"
                  ? `显示更多（还有 ${hiddenItems.length} 项）`
                  : `Show More (${hiddenItems.length} more)`}
              </summary>

              <div className="mt-4 space-y-4">
                {hiddenItems.map((item, index) =>
                  renderChecklistItem(item, visibleItems.length + index)
                )}
              </div>
            </details>
          ) : null}
        </div>
      )}
    </div>
  );
}
