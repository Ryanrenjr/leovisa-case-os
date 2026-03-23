"use client";

import Link from "next/link";
import { updateClient } from "./actions";

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

export default function EditClientForm({
  client,
  lang,
}: EditClientFormProps) {
  return (
    <main className="toss-page">
      <div className="toss-container">
        <div className="mb-8">
          <Link
            href={`/clients/${client.id}`}
            className="mb-4 inline-flex items-center text-sm font-semibold text-[#6b7684] hover:text-[#3182f6]"
          >
            {lang === "zh" ? "← 返回客户详情" : "← Back to Client"}
          </Link>

          <h1 className="toss-title">
            {lang === "zh" ? "编辑客户" : "Edit Client"}
          </h1>
          <p className="toss-subtitle">
            {lang === "zh"
              ? "更新 LeoVisa Case OS 中的客户信息。"
              : "Update client information in LeoVisa Case OS."}
          </p>
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
                  required
                  className="toss-input"
                />
              </div>

              <div>
                <label className="toss-label mb-2 block">
                  {lang === "zh" ? "英文名" : "English Name"}
                </label>
                <input
                  type="text"
                  name="englishName"
                  defaultValue={client.englishName ?? ""}
                  className="toss-input"
                />
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
  <select
    name="nationality"
    defaultValue={client.nationality ?? ""}
    className="toss-input"
  >
    <option value="">
      {lang === "zh" ? "请选择国籍" : "Select nationality"}
    </option>
    <option value="Chinese">Chinese</option>
    <option value="British">British</option>
  </select>
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

            <Link
              href={`/clients/${client.id}`}
              className="toss-secondary-button px-6 py-3 text-sm font-semibold"
            >
              {lang === "zh" ? "取消" : "Cancel"}
            </Link>
          </div>
        </form>
      </div>
    </main>
  );
}