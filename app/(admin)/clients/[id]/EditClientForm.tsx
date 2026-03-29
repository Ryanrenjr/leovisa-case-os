"use client";

import { updateClient, deleteClient } from "./actions";

type EditClientFormProps = {
  client: {
    id: string;
    chineseName: string;
    englishName: string | null;
    email: string | null;
    phone: string | null;
    wechat: string | null;
    nationality: string | null;
    notes: string | null;
  };
  lang: "en" | "zh";
};

const NATIONALITY_OPTIONS = [
  "Chinese",
  "British",
  "American",
  "Canadian",
  "Australian",
  "Japanese",
  "Korean",
  "Singaporean",
  "Malaysian",
  "Thai",
  "Indian",
  "Portuguese",
  "Greek",
  "Turkish",
  "Cypriot",
  "Hungarian",
  "UAE",
  "Other",
];

export default function EditClientForm({
  client,
  lang,
}: EditClientFormProps) {
  return (
    <main className="toss-page">
      <div className="toss-container">
        <div className="mb-8 flex items-start justify-between gap-4">
          <div>
            <a
              href={`/clients/${client.id}`}
              className="mb-4 inline-flex items-center text-sm font-semibold text-[#6b7684] hover:text-[#3182f6]"
            >
              {lang === "zh" ? "← 返回客户详情" : "← Back to Client"}
            </a>

            <h1 className="toss-title">
              {lang === "zh" ? "编辑客户" : "Edit Client"}
            </h1>
            <p className="toss-subtitle">
              {lang === "zh"
                ? "更新 LeoVisa Case OS 中的客户信息。"
                : "Update client information in LeoVisa Case OS."}
            </p>
          </div>

          <div className="flex flex-wrap gap-3">
            <a
              href={`/cases/new?clientId=${client.id}`}
              className="toss-primary-button px-5 py-3 text-sm font-semibold"
            >
              {lang === "zh"
                ? "为该客户创建案件"
                : "Create Case for This Client"}
            </a>

            <form action={deleteClient}>
              <input type="hidden" name="clientId" value={client.id} />
              <button
                type="submit"
                onClick={(e) => {
                  const ok = window.confirm(
                    lang === "zh"
                      ? "确认要删除这个客户吗？此操作无法撤销。"
                      : "Are you sure you want to delete this client? This action cannot be undone."
                  );

                  if (!ok) {
                    e.preventDefault();
                  }
                }}
                className="toss-danger-button px-5 py-3 text-sm font-semibold"
              >
                {lang === "zh" ? "删除客户" : "Delete Client"}
              </button>
            </form>
          </div>
        </div>

        <form action={updateClient} className="space-y-6">
          <input type="hidden" name="clientId" value={client.id} />

          <div className="toss-card p-7">
            <h2 className="mb-6 text-[24px] font-bold tracking-[-0.02em] text-[#191f28]">
              {lang === "zh" ? "基本信息" : "Basic Information"}
            </h2>

            <div className="grid grid-cols-1 gap-5 md:grid-cols-2">
              <div>
                <label className="toss-label mb-2 block">
                  {lang === "zh" ? "中文名" : "Chinese Name"}
                </label>
                <input
                  type="text"
                  name="chineseName"
                  defaultValue={client.chineseName}
                  className="toss-input"
                />
              </div>

              <div>
                <label className="toss-label mb-2 block">
                  {lang === "zh" ? "英文名" : "English Name"}{" "}
                  <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  name="englishName"
                  defaultValue={client.englishName ?? ""}
                  required
                  className="toss-input"
                />
                <p className="mt-2 text-xs text-[#8b95a1]">
                  {lang === "zh" ? "这是必填项。" : "This field is required."}
                </p>
              </div>

              <div>
                <label className="toss-label mb-2 block">
                  {lang === "zh" ? "邮箱" : "Email"}
                </label>
                <input
                  type="email"
                  name="email"
                  defaultValue={client.email ?? ""}
                  className="toss-input"
                />
              </div>

              <div>
                <label className="toss-label mb-2 block">
                  {lang === "zh" ? "电话" : "Phone"}
                </label>
                <input
                  type="text"
                  name="phone"
                  defaultValue={client.phone ?? ""}
                  className="toss-input"
                />
              </div>

              <div>
                <label className="toss-label mb-2 block">WeChat</label>
                <input
                  type="text"
                  name="wechat"
                  defaultValue={client.wechat ?? ""}
                  className="toss-input"
                />
              </div>

              <div>
                <label className="toss-label mb-2 block">
                  {lang === "zh" ? "国籍" : "Nationality"}
                </label>
                <input
                  type="text"
                  name="nationality"
                  list="nationality-options"
                  defaultValue={client.nationality ?? ""}
                  className="toss-input"
                  placeholder={
                    lang === "zh"
                      ? "输入或搜索国籍"
                      : "Type or search nationality"
                  }
                />
                <datalist id="nationality-options">
                  {NATIONALITY_OPTIONS.map((item) => (
                    <option key={item} value={item} />
                  ))}
                </datalist>
              </div>
            </div>
          </div>

          <div className="toss-card p-7">
            <h2 className="mb-6 text-[24px] font-bold tracking-[-0.02em] text-[#191f28]">
              {lang === "zh" ? "内部信息" : "Internal Information"}
            </h2>

            <div>
              <label className="toss-label mb-2 block">
                {lang === "zh" ? "备注" : "Notes"}
              </label>
              <textarea
                name="notes"
                rows={6}
                defaultValue={client.notes ?? ""}
                placeholder={
                  lang === "zh" ? "添加内部备注…" : "Add internal notes..."
                }
                className="toss-textarea"
              />
            </div>
          </div>

          <div className="flex items-center gap-3">
            <button
              type="submit"
              className="toss-primary-button px-6 py-3 text-sm font-semibold"
            >
              {lang === "zh" ? "保存修改" : "Save Changes"}
            </button>

            <a
              href="/clients"
              className="toss-secondary-button px-6 py-3 text-sm font-semibold"
            >
              {lang === "zh" ? "取消" : "Cancel"}
            </a>
          </div>
        </form>
      </div>
    </main>
  );
}