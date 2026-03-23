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
    <main className="min-h-screen bg-black text-white p-8">
      <div className="mb-6">
        <Link
          href={`/clients/${client.id}`}
          className="inline-block text-sm text-white/70 underline underline-offset-4"
        >
          {lang === "zh" ? "← 返回客户详情" : "← Back to Client"}
        </Link>
      </div>

      <div className="max-w-5xl rounded-2xl border border-white/10 bg-white/5 p-8">
        <div className="mb-8">
          <h1 className="text-4xl font-bold mb-3">
            {lang === "zh" ? "编辑客户" : "Edit Client"}
          </h1>
          <p className="text-white/60">
            {lang === "zh"
              ? "更新 LeoVisa Case OS 中的客户信息。"
              : "Update client information in LeoVisa Case OS."}
          </p>
        </div>

        <form action={updateClient} className="space-y-8">
          <input type="hidden" name="clientId" value={client.id} />

          <div className="rounded-xl border border-white/10 bg-black/30 p-6">
            <h2 className="text-xl font-semibold mb-4">
              {lang === "zh" ? "基本信息" : "Basic Information"}
            </h2>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm text-white/70 mb-2">
                  {lang === "zh" ? "中文名" : "Chinese Name"}
                </label>
                <input
                  type="text"
                  name="chineseName"
                  defaultValue={client.chineseName}
                  className="w-full rounded-lg border border-white/10 bg-black/30 px-4 py-3 outline-none"
                  required
                />
              </div>

              <div>
                <label className="block text-sm text-white/70 mb-2">
                  {lang === "zh" ? "英文名" : "English Name"}
                </label>
                <input
                  type="text"
                  name="englishName"
                  defaultValue={client.englishName ?? ""}
                  className="w-full rounded-lg border border-white/10 bg-black/30 px-4 py-3 outline-none"
                />
              </div>

              <div>
                <label className="block text-sm text-white/70 mb-2">
                  {lang === "zh" ? "邮箱" : "Email"}
                </label>
                <input
                  type="email"
                  name="email"
                  defaultValue={client.email ?? ""}
                  className="w-full rounded-lg border border-white/10 bg-black/30 px-4 py-3 outline-none"
                />
              </div>

              <div>
                <label className="block text-sm text-white/70 mb-2">
                  {lang === "zh" ? "电话" : "Phone"}
                </label>
                <input
                  type="text"
                  name="phone"
                  defaultValue={client.phone ?? ""}
                  className="w-full rounded-lg border border-white/10 bg-black/30 px-4 py-3 outline-none"
                />
              </div>

              <div>
                <label className="block text-sm text-white/70 mb-2">
                  WeChat
                </label>
                <input
                  type="text"
                  name="wechat"
                  defaultValue={client.wechat ?? ""}
                  className="w-full rounded-lg border border-white/10 bg-black/30 px-4 py-3 outline-none"
                />
              </div>

              <div>
                <label className="block text-sm text-white/70 mb-2">
                  {lang === "zh" ? "国籍" : "Nationality"}
                </label>
                <input
                  type="text"
                  name="nationality"
                  defaultValue={client.nationality ?? ""}
                  className="w-full rounded-lg border border-white/10 bg-black/30 px-4 py-3 outline-none"
                />
              </div>
            </div>
          </div>

          <div className="rounded-xl border border-white/10 bg-black/30 p-6">
            <h2 className="text-xl font-semibold mb-4">
              {lang === "zh" ? "内部信息" : "Internal Information"}
            </h2>

            <div>
              <label className="block text-sm text-white/70 mb-2">
                {lang === "zh" ? "备注" : "Notes"}
              </label>
              <textarea
                name="notes"
                rows={5}
                defaultValue={client.notes ?? ""}
                className="w-full rounded-lg border border-white/10 bg-black/30 px-4 py-3 outline-none"
                placeholder={
                  lang === "zh" ? "添加内部备注..." : "Add internal notes..."
                }
              />
            </div>
          </div>

          <div className="flex items-center gap-3 pt-2">
            <button
              type="submit"
              className="rounded-lg bg-white text-black px-6 py-3 font-medium"
            >
              {lang === "zh" ? "保存修改" : "Save Changes"}
            </button>

            <Link
              href={`/clients/${client.id}`}
              className="rounded-lg border border-white/10 px-6 py-3 text-white/80 hover:bg-white/10"
            >
              {lang === "zh" ? "取消" : "Cancel"}
            </Link>
          </div>
        </form>
      </div>
    </main>
  );
}