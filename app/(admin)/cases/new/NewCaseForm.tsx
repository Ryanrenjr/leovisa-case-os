"use client";

import Link from "next/link";
import { useMemo, useState } from "react";
import { createCase } from "./actions";
import {
  SERVICE_OPTIONS,
  BUSINESS_LINE_LABELS,
} from "../../../../lib/service-options";
import {
  CASE_STATUS_OPTIONS,
  CONTRACT_STATUS_OPTIONS,
  INTAKE_STATUS_OPTIONS,
} from "../../../../lib/status-options";

type Client = {
  id: string;
  chineseName: string;
  englishName: string;
};

type Consultant = {
  id: string;
  name: string;
  email?: string;
};

type NewCaseFormProps = {
  clients: Client[];
  consultants: Consultant[];
  preselectedClientId?: string;
  lang: "en" | "zh";
};

export default function NewCaseForm({
  clients,
  consultants,
  preselectedClientId = "",
  lang,
}: NewCaseFormProps) {
  const [clientKeyword, setClientKeyword] = useState("");

  const filteredClients = useMemo(() => {
    const keyword = clientKeyword.trim().toLowerCase();

    if (!keyword) return clients;

    return clients.filter((client) => {
      return (
        client.chineseName.toLowerCase().includes(keyword) ||
        client.englishName.toLowerCase().includes(keyword)
      );
    });
  }, [clientKeyword, clients]);

  return (
    <main className="toss-page">
      <div className="toss-container">
        <div className="mb-6">
          <Link
            href="/cases"
            className="inline-block text-sm font-medium text-[#6b7684] hover:text-[#3182f6]"
          >
            {lang === "zh" ? "← 返回案件列表" : "← Back to Cases"}
          </Link>
        </div>

        <div className="toss-card max-w-5xl p-8">
          <div className="mb-8">
            <h1 className="toss-title">
              {lang === "zh" ? "新建案件" : "Create Case"}
            </h1>
            <p className="toss-subtitle">
              {lang === "zh"
                ? "创建一个新案件，并关联到已有客户。"
                : "Create a new case and link it to an existing client."}
            </p>
          </div>

          <form action={createCase} className="space-y-8">
            <div className="toss-soft-card p-6">
              <h2 className="mb-4 text-[22px] font-bold tracking-[-0.02em] text-[#191f28]">
                {lang === "zh" ? "客户选择" : "Client Selection"}
              </h2>

              <div className="space-y-4">
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
                    defaultValue={preselectedClientId || ""}
                    className="w-full px-4 py-3"
                    required
                  >
                    <option value="" disabled>
                      {lang === "zh" ? "请选择客户" : "Select client"}
                    </option>
                    {filteredClients.map((client) => (
                      <option key={client.id} value={client.id}>
                        {client.chineseName || "-"} / {client.englishName || "-"}
                      </option>
                    ))}
                  </select>

                  <p className="mt-2 text-xs font-medium text-[#8b95a1]">
                    {filteredClients.length}{" "}
                    {lang === "zh" ? "位客户可选" : "client(s) found"}
                  </p>
                </div>
              </div>
            </div>

            <div className="toss-soft-card p-6">
              <h2 className="mb-4 text-[22px] font-bold tracking-[-0.02em] text-[#191f28]">
                {lang === "zh" ? "案件信息" : "Case Information"}
              </h2>

              <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
                <div>
                  <label className="toss-label mb-3 block">
                    {lang === "zh" ? "业务类型" : "Service Type"}
                  </label>
                  <select
                    name="serviceType"
                    defaultValue=""
                    className="w-full px-4 py-3"
                    required
                  >
                    <option value="" disabled>
                      {lang === "zh" ? "请选择业务类型" : "Select service type"}
                    </option>

                    {Object.entries(BUSINESS_LINE_LABELS).map(
                      ([businessLine, businessLabel]) => (
                        <optgroup key={businessLine} label={businessLabel}>
                          {SERVICE_OPTIONS.filter(
                            (item) => item.businessLine === businessLine
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
                    defaultValue=""
                    className="w-full px-4 py-3"
                    required
                  >
                    <option value="" disabled>
                      {lang === "zh" ? "请选择国家" : "Select country"}
                    </option>

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
                    defaultValue=""
                    className="w-full px-4 py-3"
                  >
                    <option value="">
                      {lang === "zh" ? "未分配" : "Unassigned"}
                    </option>
                    {consultants.map((consultant) => (
                      <option key={consultant.id} value={consultant.id}>
                        {consultant.name}
                        {consultant.email ? ` (${consultant.email})` : ""}
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
                    defaultValue="new"
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
                    defaultValue="not_started"
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
                    defaultValue="pending"
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
                    className="w-full px-4 py-3"
                    placeholder={lang === "zh" ? "案件备注..." : "Case notes..."}
                  />
                </div>
              </div>
            </div>

            <div className="flex items-center gap-3 pt-2">
              <button
                type="submit"
                className="toss-primary-button px-6 py-3 text-sm font-semibold"
              >
                {lang === "zh" ? "创建案件" : "Create Case"}
              </button>

              <Link
                href="/cases"
                className="toss-secondary-button px-6 py-3 text-sm font-semibold"
              >
                {lang === "zh" ? "取消" : "Cancel"}
              </Link>
            </div>
          </form>
        </div>
      </div>
    </main>
  );
}