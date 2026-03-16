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
  name: string;
  email: string;
  remarks: string;
  namePlaceholder: string;
  emailPlaceholder: string;
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
    name: "您的姓名",
    email: "您的邮箱",
    remarks: "备注",
    namePlaceholder: "请输入您的姓名",
    emailPlaceholder: "请输入您的邮箱",
    remarksPlaceholder: "可填写想告诉顾问的内容",
    submit: "提交",
    langSwitch: "English",
    guideTitle: "上传说明",
    guideIntro: "请根据顾问要求上传对应材料。支持一次提交多个文件。",
    guideItems: [
      "护照：上传个人信息页，确保姓名、护照号、有效期清晰可见。",
      "签证/居留：上传当前有效签证页、BRP 或居留许可页面。",
      "银行流水：建议上传近 3-6 个月的完整流水，文件需清晰可读。",
      "照片：请上传清晰、无遮挡的证件照或顾问要求的照片。",
      "其他：如在读证明、结婚证、出生证明、地址证明等支持材料。",
    ],
    guideNoteTitle: "温馨提示",
    guideNote:
      "单个文件请尽量使用清晰的 PDF、PNG 或 JPG 文件。如文件较多，可一次选择多个文件后统一提交。",
    afterSuccessTitle: "资料已提交",
    afterSuccessDesc:
      "我们已经收到您本次上传的资料。顾问会尽快查看并与您联系。",
    afterSuccessHint:
      "如需补充材料，请根据顾问要求继续使用此链接，或联系顾问获取新的上传链接。",
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
    name: "Your Name",
    email: "Your Email",
    remarks: "Remarks",
    namePlaceholder: "Enter your full name",
    emailPlaceholder: "Enter your email",
    remarksPlaceholder: "Add any notes for your consultant",
    submit: "Submit",
    langSwitch: "中文",
    guideTitle: "Upload Guidance",
    guideIntro:
      "Please upload the required documents based on your consultant's instructions. You can submit multiple files at once.",
    guideItems: [
      "Passport: upload the personal information page, making sure the name, passport number, and expiry date are clearly visible.",
      "Visa / Residence Permit: upload the current valid visa page, BRP, or residence permit page.",
      "Bank Statement: preferably upload complete statements from the most recent 3-6 months, clearly readable.",
      "Photo: upload a clear passport-style photo or any photo requested by your consultant.",
      "Other: supporting documents such as student letter, marriage certificate, birth certificate, proof of address, etc.",
    ],
    guideNoteTitle: "Important Note",
    guideNote:
      "Please use clear PDF, PNG, or JPG files whenever possible. If you have several files, you may select and submit them together in one upload.",
    afterSuccessTitle: "Documents Submitted",
    afterSuccessDesc:
      "We have received your uploaded documents. Your consultant will review them and contact you if needed.",
    afterSuccessHint:
      "If you need to provide additional documents, please continue using this link if instructed, or contact your consultant for a new upload link.",
  },
};

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
}: UploadPortalContentProps) {
  const [lang, setLang] = useState<Language>("zh");
  const t = useMemo(() => copy[lang], [lang]);
  const submitUrl = `/upload/${token}/submit`;

  return (
    <main className="min-h-screen bg-black text-white px-6 py-12">
      <div className="mx-auto max-w-3xl">
        <div className="flex justify-end mb-4">
          <button
            type="button"
            onClick={() => setLang(lang === "zh" ? "en" : "zh")}
            className="rounded-lg border border-white/10 bg-white/5 px-4 py-2 text-sm text-white/80 hover:bg-white/10"
          >
            {t.langSwitch}
          </button>
        </div>

        <div className="rounded-2xl border border-white/10 bg-white/5 p-8">
          <p className="text-sm text-white/50 mb-3">{t.portalTag}</p>

          <h1 className="text-4xl font-bold mb-6">{t.title}</h1>

          <div className="space-y-3 mb-8">
            <div>
              <p className="text-sm text-white/50">{t.client}</p>
              <p className="text-lg">
                {clientChineseName} / {clientEnglishName}
              </p>
            </div>

            <div>
              <p className="text-sm text-white/50">{t.caseCode}</p>
              <p className="text-lg">{caseCode}</p>
            </div>

            <div>
              <p className="text-sm text-white/50">{t.service}</p>
              <p className="text-lg">
                {serviceType} · {country}
              </p>
            </div>

            <div>
              <p className="text-sm text-white/50">{t.linkStatus}</p>
              <p className="text-lg">{status}</p>
            </div>

            <div>
              <p className="text-sm text-white/50">{t.expiresAt}</p>
              <p className="text-lg">{expiresAtText}</p>
            </div>
          </div>

          <div className="rounded-xl border border-white/10 bg-black/30 p-5 mb-8">
  <h2 className="text-xl font-semibold mb-3">{t.guideTitle}</h2>
  <p className="text-white/80 mb-4">{t.guideIntro}</p>

  <ul className="space-y-2 text-white/80 list-disc pl-5">
    {t.guideItems.map((item) => (
      <li key={item}>{item}</li>
    ))}
  </ul>

  <div className="mt-5 rounded-lg border border-white/10 bg-white/5 p-4">
    <p className="font-medium mb-2">{t.guideNoteTitle}</p>
    <p className="text-white/75">{t.guideNote}</p>
  </div>
</div>


          {isSuccess && (
            <div className="rounded-xl border border-green-500/30 bg-green-500/10 p-5 mb-6">
              <h2 className="text-xl font-semibold mb-2">{t.successTitle}</h2>
              <p className="text-white/80">{t.successDesc}</p>
            </div>
          )}

          {isUnavailable ? (
  <div className="rounded-xl border border-red-500/30 bg-red-500/10 p-5">
    <h2 className="text-xl font-semibold mb-2">
      {t.unavailableTitle}
    </h2>
    <p className="text-white/80">{t.unavailableDesc}</p>
  </div>
) : isSuccess ? (
  <div className="rounded-xl border border-white/10 bg-black/30 p-5">
    <h2 className="text-xl font-semibold mb-3">{t.afterSuccessTitle}</h2>
    <p className="text-white/80 mb-4">{t.afterSuccessDesc}</p>

    <div className="rounded-lg border border-white/10 bg-white/5 p-4">
      <p className="text-white/75">{t.afterSuccessHint}</p>
    </div>
  </div>
) : (
  <div className="rounded-xl border border-white/10 bg-black/30 p-5">
    <h2 className="text-xl font-semibold mb-6">{t.formTitle}</h2>

    <form
      action={submitUrl}
      method="POST"
      encType="multipart/form-data"
      className="space-y-5"
    >
      <input type="hidden" name="token" value={token} />

      <div>
        <label className="block text-sm text-white/70 mb-2">
          {t.name}
        </label>
        <input
          type="text"
          name="submittedByName"
          className="w-full rounded-lg border border-white/10 bg-black/30 px-4 py-3 outline-none"
          placeholder={t.namePlaceholder}
          required
        />
      </div>

      <div>
        <label className="block text-sm text-white/70 mb-2">
          {t.email}
        </label>
        <input
          type="email"
          name="submittedByEmail"
          className="w-full rounded-lg border border-white/10 bg-black/30 px-4 py-3 outline-none"
          placeholder={t.emailPlaceholder}
        />
      </div>

      <div>
        <label className="block text-sm text-white/70 mb-2">
          {lang === "zh" ? "文件类型" : "Document Type"}
        </label>
        <select
          name="docType"
          className="w-full rounded-lg border border-white/10 bg-black/30 px-4 py-3 outline-none"
          defaultValue="other"
        >
          <option value="passport">
            {lang === "zh" ? "护照" : "Passport"}
          </option>
          <option value="visa">
            {lang === "zh" ? "签证/居留" : "Visa / Residence Permit"}
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
        <label className="block text-sm text-white/70 mb-2">
          {lang === "zh" ? "上传文件" : "Upload File"}
        </label>
        <input
          type="file"
          name="files"
          multiple
          className="w-full rounded-lg border border-white/10 bg-black/30 px-4 py-3 outline-none"
          required
        />
      </div>

      <div>
        <label className="block text-sm text-white/70 mb-2">
          {t.remarks}
        </label>
        <textarea
          name="remarks"
          rows={4}
          className="w-full rounded-lg border border-white/10 bg-black/30 px-4 py-3 outline-none"
          placeholder={t.remarksPlaceholder}
        />
      </div>

      <button
        type="submit"
        className="rounded-lg bg-white text-black px-6 py-3 font-medium"
      >
        {t.submit}
      </button>
    </form>
  </div>
)}

        </div>
      </div>
    </main>
  );
}
