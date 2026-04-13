import ConfirmSubmitButton from "../../../../components/ConfirmSubmitButton";

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
  onUpdateAction: (formData: FormData) => void;
  onDeleteAction: (formData: FormData) => void;
  onMoveUpAction: (formData: FormData) => void;
  onMoveDownAction: (formData: FormData) => void;
};

export default function ChecklistSection({
  caseId,
  items,
  lang,
  defaultExpanded = false,
  onCreateAction,
  onUpdateAction,
  onDeleteAction,
  onMoveUpAction,
  onMoveDownAction,
}: ChecklistSectionProps) {
  const requiredCount = items.filter((item) => item.isRequired).length;
  const uploadedCount = items.filter((item) => item._count.documents > 0).length;
  const visibleItems = items.slice(0, 3);
  const hiddenItems = items.slice(3);

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
                {lang === "zh" ? "文件名称" : "Item Label"}
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
            {lang === "zh" ? "文件清单" : "Document Checklist"}
          </h2>
          <p className="mt-2 text-[15px] text-[#6b7684]">
            {lang === "zh"
              ? "顾问先配置文件清单，客户再按照该清单上传。"
              : "Create the required document list first, then let the client upload against it."}
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
        <h3 className="mb-4 text-[20px] font-bold tracking-[-0.02em] text-[#191f28]">
          {lang === "zh" ? "新增清单项" : "Add Checklist Item"}
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
                {lang === "zh" ? "文件名称" : "Item Label"}
              </label>
              <input
                type="text"
                name="label"
                className="w-full px-4 py-3"
                placeholder={
                  lang === "zh"
                    ? "例如：护照首页"
                    : "e.g. Passport Bio Page"
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
                  ? "可填写格式要求、页数要求或其他备注"
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
            ? "还没有配置文件清单。未配置时，客户门户仍然显示通用上传模式。"
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
