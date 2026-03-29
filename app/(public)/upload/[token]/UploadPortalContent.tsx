"use client";

import { useMemo, useState } from "react";

type Language = "zh" | "en";

type UploadPortalContentProps = {
  clientChineseName: string;
  clientEnglishName: string;
  caseCode: string;
  serviceType: string;
  country: string;
  status: string;
  expiresAtText: string;
  token: string;
  isUnavailable: boolean;
  isSuccess: boolean;
  error: string;
};

type UploadRow = {
  id: number;
  docType: string;
};

type CopyContent = {
  portalTag: string;
  title: string;
  client: string;
  caseCode: string;
  service: string;
  linkStatus: string;
  expiresAt: string;
  unavailableTitle: string;
  unavailableDesc: string;
  successTitle: string;
  successDesc: string;
  formTitle: string;
  remarks: string;
  remarksPlaceholder: string;
  submit: string;
  langSwitch: string;
  guideTitle: string;
  guideIntro: string;
  guideItems: string[];
  guideNoteTitle: string;
  guideNote: string;
  afterSuccessTitle: string;
  afterSuccessDesc: string;
  afterSuccessHint: string;
  addRow: string;
  removeRow: string;
  docType: string;
  uploadFile: string;
  selectDocType: string;
  otherDocName: string;
  otherDocNamePlaceholder: string;
  clientAutoDetected: string;
  errorNoFiles: string;
  errorInvalidFiles: string;
  errorUnavailable: string;
  errorUploadFailed: string;
};

const copy: Record<Language, CopyContent> = {
  zh: {
    portalTag: "LeoVisa 安全上传入口",
    title: "文件上传入口",
    client: "客户",
    caseCode: "案件编号",
    service: "服务项目",
    linkStatus: "链接状态",
    expiresAt: "失效时间",
    unavailableTitle: "该上传链接当前不可用",
    unavailableDesc:
      "该链接可能已过期、已停用，或已达到使用次数上限。请联系顾问获取新的上传链接。",
    successTitle: "提交成功",
    successDesc: "您的资料提交已成功记录，顾问会尽快查看。",
    formTitle: "提交您的资料",
    remarks: "备注",
    remarksPlaceholder: "可填写想告诉顾问的内容",
    submit: "提交",
    langSwitch: "English",
    guideTitle: "上传说明",
    guideIntro: "请根据顾问要求逐项上传对应材料，每一项对应一个文件。",
    guideItems: [
      "请选择正确的文件类型后，再上传对应文件。",
      "护照：上传个人信息页，确保姓名、护照号、有效期清晰可见。",
      "签证/居留：上传当前有效签证页、BRP 或居留许可页面。",
      "银行流水：建议上传近 3-6 个月的完整流水，文件需清晰可读。",
      "其他支持文件：如在读证明、结婚证、出生证明、地址证明等。",
    ],
    guideNoteTitle: "温馨提示",
    guideNote:
      "请尽量上传清晰的 PDF、PNG 或 JPG 文件。若有多份材料，请逐项添加后统一提交。",
    afterSuccessTitle: "资料已提交",
    afterSuccessDesc:
      "我们已经收到您本次上传的资料。顾问会尽快查看并与您联系。",
    afterSuccessHint:
      "如需补充材料，请根据顾问要求继续使用此链接，或联系顾问获取新的上传链接。",
    addRow: "增加一项材料",
    removeRow: "删除这一项",
    docType: "文件类型",
    uploadFile: "上传文件",
    selectDocType: "请选择文件类型",
    otherDocName: "其他文件名称",
    otherDocNamePlaceholder: "例如：无犯罪证明翻译件",
    clientAutoDetected: "客户信息已自动识别，无需填写姓名。",
    errorNoFiles: "请至少上传一份文件。",
    errorInvalidFiles: "请检查文件类型和文件内容是否完整。",
    errorUnavailable: "该上传链接当前不可用。",
    errorUploadFailed: "提交失败，请稍后再试或联系顾问。",
  },
  en: {
    portalTag: "LeoVisa Secure Upload",
    title: "Document Upload Portal",
    client: "Client",
    caseCode: "Case Code",
    service: "Service",
    linkStatus: "Link Status",
    expiresAt: "Expires At",
    unavailableTitle: "This upload link is unavailable",
    unavailableDesc:
      "This link may be expired, inactive, or has reached its usage limit. Please contact your consultant for a new upload link.",
    successTitle: "Submission received",
    successDesc:
      "Your submission has been recorded successfully. Your consultant will review it.",
    formTitle: "Submit Your Documents",
    remarks: "Remarks",
    remarksPlaceholder: "Add any notes for your consultant",
    submit: "Submit",
    langSwitch: "中文",
    guideTitle: "Upload Guidance",
    guideIntro:
      "Please upload documents one by one. Each row should contain one document type and one file.",
    guideItems: [
      "Please choose the correct document type before uploading the file.",
      "Passport: upload the personal information page with name, passport number, and expiry date clearly visible.",
      "Visa / Residence Permit: upload the current valid visa page, BRP, or residence permit page.",
      "Bank Statement: preferably upload complete statements from the most recent 3-6 months.",
      "Other: supporting documents such as student letter, marriage certificate, birth certificate, proof of address, etc.",
    ],
    guideNoteTitle: "Important Note",
    guideNote:
      "Please use clear PDF, PNG, or JPG files whenever possible. If you have multiple documents, add them one by one and submit together.",
    afterSuccessTitle: "Documents Submitted",
    afterSuccessDesc:
      "We have received your uploaded documents. Your consultant will review them and contact you if needed.",
    afterSuccessHint:
      "If you need to provide additional documents, please continue using this link if instructed, or contact your consultant for a new upload link.",
    addRow: "Add Another Document",
    removeRow: "Remove",
    docType: "Document Type",
    uploadFile: "Upload File",
    selectDocType: "Please select a document type",
    otherDocName: "Other Document Name",
    otherDocNamePlaceholder: "e.g. Police Certificate Translation",
    clientAutoDetected:
      "Client information has been detected automatically. No need to enter your name.",
    errorNoFiles: "Please upload at least one file.",
    errorInvalidFiles:
      "Please check whether the document type and file are complete.",
    errorUnavailable: "This upload link is currently unavailable.",
    errorUploadFailed:
      "Submission failed. Please try again later or contact your consultant.",
  },
};

function getErrorMessage(error: string, t: CopyContent) {
  switch (error) {
    case "no_files":
      return t.errorNoFiles;
    case "invalid_files":
      return t.errorInvalidFiles;
    case "link_unavailable":
      return t.errorUnavailable;
    case "upload_failed":
      return t.errorUploadFailed;
    default:
      return "";
  }
}

export default function UploadPortalContent({
  clientChineseName,
  clientEnglishName,
  caseCode,
  serviceType,
  country,
  status,
  expiresAtText,
  token,
  isUnavailable,
  isSuccess,
  error,
}: UploadPortalContentProps) {
  const [lang, setLang] = useState<Language>("zh");
  const [rows, setRows] = useState<UploadRow[]>([{ id: 0, docType: "passport" }]);
  const t = useMemo(() => copy[lang], [lang]);
  const submitUrl = `/upload/${token}/submit`;

  const clientDisplay =
    [clientEnglishName?.trim(), clientChineseName?.trim()]
      .filter(Boolean)
      .join(" / ") || "-";

  function addRow() {
    setRows((prev) => [
      ...prev,
      {
        id: Date.now(),
        docType: "other",
      },
    ]);
  }

  function removeRow(id: number) {
    setRows((prev) => {
      if (prev.length === 1) {
        return prev;
      }
      return prev.filter((row) => row.id !== id);
    });
  }

  function updateRowDocType(id: number, value: string) {
    setRows((prev) =>
      prev.map((row) => (row.id === id ? { ...row, docType: value } : row))
    );
  }

  return (
    <main className="min-h-screen bg-[#f4f6f8] px-6 py-12 text-[#191f28]">
      <div className="mx-auto max-w-4xl">
        <div className="mb-4 flex justify-end">
          <button
            type="button"
            onClick={() => setLang(lang === "zh" ? "en" : "zh")}
            className="inline-flex items-center justify-center rounded-2xl border border-[#e5e8eb] bg-white px-4 py-2 text-sm font-semibold text-[#4e5968] shadow-sm hover:bg-[#f8fafc]"
          >
            {t.langSwitch}
          </button>
        </div>

        <div className="rounded-[28px] border border-[#e8edf3] bg-white p-8 shadow-[0_12px_40px_rgba(15,23,42,0.06)]">
          <p className="mb-3 text-sm font-medium text-[#8b95a1]">{t.portalTag}</p>

          <h1 className="mb-6 text-[40px] font-extrabold tracking-[-0.04em] text-[#191f28]">
            {t.title}
          </h1>

          <div className="mb-8 grid grid-cols-1 gap-4 md:grid-cols-2">
            <div className="rounded-2xl border border-[#eef1f4] bg-[#fafbfc] p-5">
              <p className="mb-2 text-sm font-medium text-[#8b95a1]">{t.client}</p>
              <p className="text-[18px] font-semibold text-[#191f28]">{clientDisplay}</p>
            </div>

            <div className="rounded-2xl border border-[#eef1f4] bg-[#fafbfc] p-5">
              <p className="mb-2 text-sm font-medium text-[#8b95a1]">{t.caseCode}</p>
              <p className="text-[18px] font-semibold text-[#191f28]">{caseCode}</p>
            </div>

            <div className="rounded-2xl border border-[#eef1f4] bg-[#fafbfc] p-5">
              <p className="mb-2 text-sm font-medium text-[#8b95a1]">{t.service}</p>
              <p className="text-[18px] font-semibold text-[#191f28]">
                {serviceType} · {country}
              </p>
            </div>

            <div className="rounded-2xl border border-[#eef1f4] bg-[#fafbfc] p-5">
              <p className="mb-2 text-sm font-medium text-[#8b95a1]">{t.expiresAt}</p>
              <p className="text-[18px] font-semibold text-[#191f28]">{expiresAtText}</p>
            </div>
          </div>

          <div className="mb-8 rounded-2xl border border-[#eef1f4] bg-[#fafbfc] p-6">
            <h2 className="mb-3 text-[22px] font-bold tracking-[-0.02em] text-[#191f28]">
              {t.guideTitle}
            </h2>
            <p className="mb-4 text-[15px] leading-7 text-[#4e5968]">{t.guideIntro}</p>

            <ul className="list-disc space-y-2 pl-5 text-[15px] leading-7 text-[#4e5968]">
              {t.guideItems.map((item) => (
                <li key={item}>{item}</li>
              ))}
            </ul>

            <div className="mt-5 rounded-2xl border border-[#eef1f4] bg-white p-4">
              <p className="mb-2 text-sm font-semibold text-[#191f28]">{t.guideNoteTitle}</p>
              <p className="text-[14px] leading-6 text-[#6b7684]">{t.guideNote}</p>
            </div>
          </div>

          {isSuccess && (
            <div className="mb-6 rounded-2xl border border-green-200 bg-green-50 p-5">
              <h2 className="mb-2 text-[22px] font-bold text-green-700">{t.successTitle}</h2>
              <p className="text-[15px] text-green-700">{t.successDesc}</p>
            </div>
          )}

          {!!error && !isSuccess && (
            <div className="mb-6 rounded-2xl border border-red-200 bg-red-50 p-5">
              <p className="text-[15px] font-semibold text-red-600">
                {getErrorMessage(error, t)}
              </p>
            </div>
          )}

          {isUnavailable ? (
            <div className="rounded-2xl border border-red-200 bg-red-50 p-5">
              <h2 className="mb-2 text-[22px] font-bold text-red-700">
                {t.unavailableTitle}
              </h2>
              <p className="text-[15px] leading-7 text-red-700">{t.unavailableDesc}</p>
            </div>
          ) : isSuccess ? (
            <div className="rounded-2xl border border-[#eef1f4] bg-[#fafbfc] p-6">
              <h2 className="mb-3 text-[24px] font-bold tracking-[-0.02em] text-[#191f28]">
                {t.afterSuccessTitle}
              </h2>
              <p className="mb-4 text-[15px] leading-7 text-[#4e5968]">
                {t.afterSuccessDesc}
              </p>

              <div className="rounded-2xl border border-[#eef1f4] bg-white p-4">
                <p className="text-[14px] leading-6 text-[#6b7684]">
                  {t.afterSuccessHint}
                </p>
              </div>
            </div>
          ) : (
            <div className="rounded-2xl border border-[#eef1f4] bg-[#fafbfc] p-6">
              <h2 className="mb-2 text-[24px] font-bold tracking-[-0.02em] text-[#191f28]">
                {t.formTitle}
              </h2>
              <p className="mb-6 text-[14px] text-[#6b7684]">
                {t.clientAutoDetected}
              </p>

              <form
                action={submitUrl}
                method="POST"
                encType="multipart/form-data"
                className="space-y-5"
              >
                <input type="hidden" name="token" value={token} />
                <input type="hidden" name="rowCount" value={rows.length} />

                {rows.map((row, index) => (
                  <div
                    key={row.id}
                    className="rounded-2xl border border-[#e8edf3] bg-white p-5"
                  >
                    <div className="grid grid-cols-1 gap-4 md:grid-cols-[1fr_1.4fr_auto] md:items-end">
                      <div>
                        <label className="mb-2 block text-sm font-medium text-[#6b7684]">
                          {t.docType}
                        </label>
                        <select
                          name={`docType_${index}`}
                          value={row.docType}
                          onChange={(e) => updateRowDocType(row.id, e.target.value)}
                          className="w-full rounded-2xl border border-[#dfe3e8] bg-white px-4 py-3 text-[15px] text-[#191f28] outline-none"
                          required
                        >
                          <option value="" disabled>
                            {t.selectDocType}
                          </option>
                          <option value="passport">
                            {lang === "zh" ? "护照" : "Passport"}
                          </option>
                          <option value="visa">
                            {lang === "zh" ? "签证 / 居留" : "Visa / Residence Permit"}
                          </option>
                          <option value="bank_statement">
                            {lang === "zh" ? "银行流水" : "Bank Statement"}
                          </option>
                          <option value="photo">
                            {lang === "zh" ? "照片" : "Photo"}
                          </option>
                          <option value="other">
                            {lang === "zh" ? "其他" : "Other"}
                          </option>
                        </select>
                      </div>

                      <div>
                        <label className="mb-2 block text-sm font-medium text-[#6b7684]">
                          {t.uploadFile}
                        </label>
                        <input
                          type="file"
                          name={`file_${index}`}
                          className="w-full rounded-2xl border border-[#dfe3e8] bg-white px-4 py-3 text-[15px] text-[#191f28] outline-none"
                          required
                        />
                      </div>

                      <div>
                        <button
                          type="button"
                          onClick={() => removeRow(row.id)}
                          className="inline-flex items-center justify-center rounded-2xl border border-[#e5e8eb] bg-white px-4 py-3 text-sm font-semibold text-[#6b7684] hover:bg-[#f8fafc]"
                        >
                          {t.removeRow}
                        </button>
                      </div>
                    </div>

                    {row.docType === "other" && (
                      <div className="mt-4">
                        <label className="mb-2 block text-sm font-medium text-[#6b7684]">
                          {t.otherDocName}
                        </label>
                        <input
                          type="text"
                          name={`otherName_${index}`}
                          className="w-full rounded-2xl border border-[#dfe3e8] bg-white px-4 py-3 text-[15px] text-[#191f28] outline-none"
                          placeholder={t.otherDocNamePlaceholder}
                          required
                        />
                      </div>
                    )}
                  </div>
                ))}

                <div className="flex flex-wrap gap-3 pt-2">
                  <button
                    type="button"
                    onClick={addRow}
                    className="inline-flex items-center justify-center rounded-2xl border border-[#dbe7ff] bg-[#eef4ff] px-5 py-3 text-sm font-semibold text-[#3563e9] hover:bg-[#e8f0ff]"
                  >
                    {t.addRow}
                  </button>

                  <button
                    type="submit"
                    className="inline-flex items-center justify-center rounded-2xl bg-[#3182f6] px-6 py-3 text-sm font-semibold text-white shadow-[0_8px_24px_rgba(49,130,246,0.28)] hover:opacity-95"
                  >
                    {t.submit}
                  </button>
                </div>

                <div className="rounded-2xl border border-[#eef1f4] bg-white p-4">
                  <p className="text-sm font-medium text-[#8b95a1]">
                    {t.linkStatus}: <span className="text-[#191f28]">{status}</span>
                  </p>
                </div>
              </form>
            </div>
          )}
        </div>
      </div>
    </main>
  );
}