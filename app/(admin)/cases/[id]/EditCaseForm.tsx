"use client";

import Link from "next/link";
import { useMemo, useState } from "react";
import { updateCase } from "./actions";
import {
  SERVICE_OPTIONS,
  BUSINESS_LINE_LABELS,
} from "../../../../lib/service-options";
import {
  CASE_STATUS_OPTIONS,
  CONTRACT_STATUS_OPTIONS,
  INTAKE_STATUS_OPTIONS,
} from "../../../../lib/status-options";

type EditCaseFormProps = {
  caseItem: {
    id: string;
    reference: string;
    clientId: string;
    serviceType: string;
    country: string;
    assignedConsultantId: string | null;
    status: string;
    contractStatus: string;
    intakeStatus: string;
    notes: string | null;
  };
  clients: {
    id: string;
    chineseName: string;
    englishName: string | null;
  }[];
  consultants: {
    id: string;
    name: string;
  }[];
  error?: string;
  lang: "en" | "zh";
};

export default function EditCaseForm({
  caseItem,
  clients,
  consultants,
  error = "",
  lang,
}: EditCaseFormProps) {
  const [clientKeyword, setClientKeyword] = useState("");

  const filteredClients = useMemo(() => {
    const keyword = clientKeyword.trim().toLowerCase();

    if (!keyword) return clients;

    return clients.filter((client) => {
      return (
        client.chineseName.toLowerCase().includes(keyword) ||
        (client.englishName ?? "").toLowerCase().includes(keyword)
      );
    });
  }, [clientKeyword, clients]);

  return (
    <main className="toss-page">
      <div className="toss-container">
        <div className="mb-6">
          <Link
            href={`/cases/${caseItem.id}`}
            className="text-sm font-medium text-[#6b7684] hover:text-[#3182f6]"
          >
            {lang === "zh" ? "← 返回案件详情" : "← Back to Case"}
          </Link>
        </div>

        <div className="mb-8">
          <h1 className="toss-title">{lang === "zh" ? "编辑案件" : "Edit Case"}</h1>
          <p className="toss-subtitle">
            {lang === "zh"
              ? "更新 LeoVisa Case OS 中的案件信息。"
              : "Update case information in LeoVisa Case OS."}
          </p>
        </div>

        {error === "duplicate_reference" && (
          <div className="mb-6 rounded-2xl border border-red-200 bg-red-50 px-5 py-4">
            <p className="text-sm font-semibold text-red-600">
              {lang === "zh"
                ? "Reference 已被其他案件使用，请换一个。"
                : "This reference is already used by another case. Please choose a different one."}
            </p>
          </div>
        )}

        {error === "missing_reference" && (
          <div className="mb-6 rounded-2xl border border-red-200 bg-red-50 px-5 py-4">
            <p className="text-sm font-semibold text-red-600">
              {lang === "zh"
                ? "Reference 不能为空。"
                : "Reference is required."}
            </p>
          </div>
        )}

        <form action={updateCase} className="space-y-8">
          <input type="hidden" name="caseId" value={caseItem.id} />

          <div className="toss-card p-7">
            <h2 className="mb-5 text-[24px] font-bold tracking-[-0.02em] text-[#191f28]">
              {lang === "zh" ? "客户选择" : "Client Selection"}
            </h2>

            <div className="space-y-5">
              <div>
                <label className="toss-label mb-3 block">
                  {lang === "zh" ? "搜索客户" : "Client Search"}
                </label>
                <input
                  type="text"
                  value={clientKeyword}
                  onChange={(e) => setClientKeyword(e.target.value)}
                  className="w-full px-4 py-3"
                  placeholder={
                    lang === "zh"
                      ? "按中文名或英文名搜索"
                      : "Search by Chinese or English name"
                  }
                />
              </div>

              <div>
                <label className="toss-label mb-3 block">
                  {lang === "zh" ? "客户" : "Client"}
                </label>
                <select
                  name="clientId"
                  defaultValue={caseItem.clientId}
                  className="w-full px-4 py-3"
                >
                  {filteredClients.map((client) => (
                    <option key={client.id} value={client.id}>
                      {client.chineseName} / {client.englishName ?? "-"}
                    </option>
                  ))}
                </select>

                <p className="mt-2 text-sm font-medium text-[#8b95a1]">
                  {filteredClients.length}{" "}
                  {lang === "zh" ? "位客户可选" : "client(s) found"}
                </p>
              </div>
            </div>
          </div>

          <div className="toss-card p-7">
            <h2 className="mb-5 text-[24px] font-bold tracking-[-0.02em] text-[#191f28]">
              {lang === "zh" ? "案件信息" : "Case Information"}
            </h2>

            <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
              <div>
                <label className="toss-label mb-3 block">Reference</label>
                <input
                  type="text"
                  name="reference"
                  defaultValue={caseItem.reference}
                  required
                  className="w-full px-4 py-3"
                />
                <p className="mt-2 text-sm font-medium text-[#8b95a1]">
                  {lang === "zh"
                    ? "顾问可手动修改，对外展示优先使用这个编号。"
                    : "Consultants can edit this value. It will be used as the primary display reference."}
                </p>
              </div>

              <div>
                <label className="toss-label mb-3 block">
                  {lang === "zh" ? "业务类型" : "Service Type"}
                </label>
                <select
                  name="serviceType"
                  defaultValue={caseItem.serviceType}
                  className="w-full px-4 py-3"
                >
                  {Object.entries(BUSINESS_LINE_LABELS).map(
                    ([businessLine, businessLabel]) => (
                      <optgroup key={businessLine} label={businessLabel}>
                        {SERVICE_OPTIONS.filter(
                          (item) =>
                            item.businessLine === businessLine &&
                            (!item.isLegacy || item.value === caseItem.serviceType)
                        ).map((item) => (
                          <option key={item.value} value={item.value}>
                            {item.label}
                          </option>
                        ))}
                      </optgroup>
                    )
                  )}
                </select>
              </div>

              <div>
                <label className="toss-label mb-3 block">
                  {lang === "zh" ? "国家" : "Country"}
                </label>
                <select
                  name="country"
                  defaultValue={caseItem.country}
                  className="w-full px-4 py-3"
                >
                  <option value="Greece">Greece</option>
                  <option value="Portugal">Portugal</option>
                  <option value="Malta">Malta</option>
                  <option value="Hungary">Hungary</option>
                  <option value="Japan">Japan</option>
                  <option value="Turkey">Turkey</option>
                  <option value="UAE">UAE</option>
                  <option value="Cyprus">Cyprus</option>
                  <option value="UK">UK</option>
                  <option value="Other">Other</option>
                </select>
              </div>

              <div>
                <label className="toss-label mb-3 block">
                  {lang === "zh" ? "顾问" : "Consultant"}
                </label>
                <select
                  name="assignedConsultantId"
                  defaultValue={caseItem.assignedConsultantId ?? ""}
                  className="w-full px-4 py-3"
                >
                  <option value="">
                    {lang === "zh" ? "未分配" : "Unassigned"}
                  </option>
                  {consultants.map((consultant) => (
                    <option key={consultant.id} value={consultant.id}>
                      {consultant.name}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="toss-label mb-3 block">
                  {lang === "zh" ? "状态" : "Status"}
                </label>
                <select
                  name="status"
                  defaultValue={caseItem.status}
                  className="w-full px-4 py-3"
                >
                  {CASE_STATUS_OPTIONS.map((item) => (
                    <option key={item.value} value={item.value}>
                      {lang === "zh" ? item.zh : item.en}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="toss-label mb-3 block">
                  {lang === "zh" ? "合同状态" : "Contract Status"}
                </label>
                <select
                  name="contractStatus"
                  defaultValue={caseItem.contractStatus}
                  className="w-full px-4 py-3"
                >
                  {CONTRACT_STATUS_OPTIONS.map((item) => (
                    <option key={item.value} value={item.value}>
                      {lang === "zh" ? item.zh : item.en}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="toss-label mb-3 block">
                  {lang === "zh" ? "信息收集状态" : "Intake Status"}
                </label>
                <select
                  name="intakeStatus"
                  defaultValue={caseItem.intakeStatus}
                  className="w-full px-4 py-3"
                >
                  {INTAKE_STATUS_OPTIONS.map((item) => (
                    <option key={item.value} value={item.value}>
                      {lang === "zh" ? item.zh : item.en}
                    </option>
                  ))}
                </select>
              </div>

              <div className="md:col-span-2">
                <label className="toss-label mb-3 block">
                  {lang === "zh" ? "备注" : "Notes"}
                </label>
                <textarea
                  name="notes"
                  rows={5}
                  defaultValue={caseItem.notes ?? ""}
                  className="w-full px-4 py-3"
                  placeholder={lang === "zh" ? "案件备注..." : "Case notes..."}
                />
              </div>
            </div>
          </div>

          <div className="flex items-center gap-3 pt-1">
            <button
              type="submit"
              className="toss-primary-button px-6 py-3 text-sm font-semibold"
            >
              {lang === "zh" ? "保存修改" : "Save Changes"}
            </button>

            <Link
              href={`/cases/${caseItem.id}`}
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
