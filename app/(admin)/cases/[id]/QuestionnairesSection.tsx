"use client";

import { useMemo, useState } from "react";
import ConfirmSubmitButton from "@/components/ConfirmSubmitButton";
import StatusBadge from "@/components/StatusBadge";
import {
  getQuestionnaireTemplateSnapshot,
  questionnaireTemplates,
  type QuestionnaireField,
  type QuestionnaireFieldType,
  type QuestionnaireSection,
  type QuestionnaireTemplate,
} from "../../../../lib/questionnaires/templates";
import { formatDateTime } from "../../../../lib/format-date";

type QuestionnaireSubmissionItem = {
  id: string;
  templateKey: string;
  status: string;
  answers: unknown;
  submittedAt: Date | string | null;
  updatedAt: Date | string;
};

type QuestionnaireLinkItem = {
  id: string;
  token: string;
  templateKey: string;
  customTemplate?: unknown;
  status: string;
  expiresAt: Date | string | null;
  currentUses: number;
  submissions: QuestionnaireSubmissionItem[];
};

type QuestionnairesSectionProps = {
  caseId: string;
  links: QuestionnaireLinkItem[];
  lang: "en" | "zh";
  onGenerateAction: (formData: FormData) => void;
  onDeactivateAction: (formData: FormData) => void;
  onDeleteAction: (formData: FormData) => void;
  onReopenAction: (formData: FormData) => void;
};

function getLabel(field: QuestionnaireField, lang: "en" | "zh") {
  return lang === "zh" ? field.labelZh : field.labelEn;
}

function getTemplateLabel(template: QuestionnaireTemplate, lang: "en" | "zh") {
  return lang === "zh" ? template.titleZh : template.titleEn;
}

const customQuestionTypes: {
  value: QuestionnaireFieldType | "yes_no";
  labelZh: string;
  labelEn: string;
}[] = [
  { value: "text", labelZh: "短文本", labelEn: "Short Text" },
  { value: "textarea", labelZh: "长文本", labelEn: "Long Text" },
  { value: "date", labelZh: "日期", labelEn: "Date" },
  { value: "month", labelZh: "年月", labelEn: "Month" },
  { value: "email", labelZh: "邮箱", labelEn: "Email" },
  { value: "tel", labelZh: "电话", labelEn: "Phone" },
  { value: "yes_no", labelZh: "是/否", labelEn: "Yes/No" },
];

const yesNoOptions = [
  { value: "yes", labelZh: "是", labelEn: "Yes" },
  { value: "no", labelZh: "否", labelEn: "No" },
];

function cloneTemplate(template: QuestionnaireTemplate): QuestionnaireTemplate {
  return JSON.parse(JSON.stringify(template)) as QuestionnaireTemplate;
}

function getTemplateByKey(templateKey: string) {
  return (
    questionnaireTemplates.find((template) => template.key === templateKey) ??
    questionnaireTemplates[0]!
  );
}

function createCustomField(
  section: QuestionnaireSection,
  labelZh: string,
  labelEn: string,
  type: QuestionnaireFieldType | "yes_no",
  required: boolean
): QuestionnaireField {
  const normalizedType: QuestionnaireFieldType =
    type === "yes_no" ? "select" : type;

  return {
    id: `custom_${section.id}_${Date.now()}_${Math.random()
      .toString(36)
      .slice(2, 8)}`,
    type: normalizedType,
    labelZh,
    labelEn,
    required,
    ...(type === "yes_no" ? { options: yesNoOptions } : {}),
  };
}

function getLinkDisplayStatus(link: QuestionnaireLinkItem) {
  if (
    link.status === "active" &&
    link.expiresAt &&
    new Date(link.expiresAt) < new Date()
  ) {
    return "expired";
  }

  return link.status;
}

function asRecord(value: unknown): Record<string, unknown> {
  if (value && typeof value === "object" && !Array.isArray(value)) {
    return value as Record<string, unknown>;
  }

  return {};
}

function formatValue(value: unknown, lang: "en" | "zh") {
  if (value === null || value === undefined || value === "") {
    return "-";
  }

  if (value === "yes") {
    return lang === "zh" ? "是" : "Yes";
  }

  if (value === "no") {
    return lang === "zh" ? "否" : "No";
  }

  if (typeof value === "string" || typeof value === "number") {
    return String(value);
  }

  return JSON.stringify(value);
}

function AnswerField({
  field,
  value,
  lang,
}: {
  field: QuestionnaireField;
  value: unknown;
  lang: "en" | "zh";
}) {
  if (field.type === "repeater") {
    const rows = Array.isArray(value) ? value : [];

    return (
      <div className="rounded-2xl border border-[#eef1f4] bg-white p-4">
        <p className="mb-3 text-sm font-semibold text-[#191f28]">
          {getLabel(field, lang)}
        </p>

        {rows.length === 0 ? (
          <p className="text-sm text-[#8b95a1]">-</p>
        ) : (
          <div className="space-y-3">
            {rows.map((row, index) => {
              const rowRecord = asRecord(row);

              return (
                <div
                  key={index}
                  className="rounded-2xl border border-[#f0f2f5] bg-[#fafbfc] p-4"
                >
                  <p className="mb-3 text-xs font-semibold text-[#8b95a1]">
                    {lang === "zh" ? `第 ${index + 1} 条` : `Entry ${index + 1}`}
                  </p>

                  <div className="grid grid-cols-1 gap-3 md:grid-cols-2">
                    {(field.fields ?? []).map((nestedField) => (
                      <div key={nestedField.id}>
                        <p className="mb-1 text-xs font-semibold text-[#8b95a1]">
                          {getLabel(nestedField, lang)}
                        </p>
                        <p className="whitespace-pre-wrap text-sm leading-6 text-[#333d4b]">
                          {formatValue(rowRecord[nestedField.id], lang)}
                        </p>
                      </div>
                    ))}
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    );
  }

  return (
    <div>
      <p className="mb-1 text-xs font-semibold text-[#8b95a1]">
        {getLabel(field, lang)}
      </p>
      <p className="whitespace-pre-wrap text-sm leading-6 text-[#333d4b]">
        {formatValue(value, lang)}
      </p>
    </div>
  );
}

function SubmissionAnswers({
  submission,
  template,
  lang,
}: {
  submission: QuestionnaireSubmissionItem;
  template: QuestionnaireTemplate;
  lang: "en" | "zh";
}) {
  const answers = asRecord(submission.answers);

  return (
    <div className="space-y-5">
      {template.sections.map((section) => {
        const sectionAnswers = asRecord(answers[section.id]);

        return (
          <div
            key={section.id}
            className="rounded-2xl border border-[#eef1f4] bg-[#fafbfc] p-5"
          >
            <h4 className="mb-4 text-[18px] font-bold text-[#191f28]">
              {lang === "zh" ? section.titleZh : section.titleEn}
            </h4>

            <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
              {section.fields.map((field) => (
                <div
                  key={field.id}
                  className={field.type === "repeater" ? "md:col-span-2" : ""}
                >
                  <AnswerField
                    field={field}
                    value={sectionAnswers[field.id]}
                    lang={lang}
                  />
                </div>
              ))}
            </div>
          </div>
        );
      })}
    </div>
  );
}

export default function QuestionnairesSection({
  caseId,
  links,
  lang,
  onGenerateAction,
  onDeactivateAction,
  onDeleteAction,
  onReopenAction,
}: QuestionnairesSectionProps) {
  const [expandedSubmissionId, setExpandedSubmissionId] = useState("");
  const [showAllLinks, setShowAllLinks] = useState(false);
  const [copiedToken, setCopiedToken] = useState("");
  const [selectedTemplateKey, setSelectedTemplateKey] = useState(
    questionnaireTemplates[0]?.key ?? ""
  );
  const [editableTemplate, setEditableTemplate] = useState<QuestionnaireTemplate>(
    () => cloneTemplate(questionnaireTemplates[0]!)
  );
  const [newQuestionSectionId, setNewQuestionSectionId] = useState(
    questionnaireTemplates[0]?.sections[0]?.id ?? ""
  );
  const [newQuestionLabelZh, setNewQuestionLabelZh] = useState("");
  const [newQuestionLabelEn, setNewQuestionLabelEn] = useState("");
  const [newQuestionType, setNewQuestionType] =
    useState<QuestionnaireFieldType | "yes_no">("text");
  const [newQuestionRequired, setNewQuestionRequired] = useState(false);
  const baseUrl =
    typeof window === "undefined"
      ? process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000"
      : window.location.origin;
  const latestSubmissions = useMemo(
    () =>
      links.flatMap((link) =>
        link.submissions.map((submission) => ({
          ...submission,
          linkId: link.id,
          linkToken: link.token,
          linkTemplate: link.customTemplate,
        }))
      ),
    [links]
  );
  const hasMoreLinks = links.length > 3;
  const visibleLinks = showAllLinks ? links : links.slice(0, 3);
  const editableQuestionCount = editableTemplate.sections.reduce(
    (sum, section) => sum + section.fields.length,
    0
  );

  function getShareUrl(token: string) {
    const origin =
      typeof window === "undefined" ? baseUrl : window.location.origin;

    return `${origin}/intake/${token}`;
  }

  async function copyLink(token: string) {
    const url = getShareUrl(token);
    await navigator.clipboard.writeText(url);
    setCopiedToken(token);
  }

  function selectTemplate(templateKey: string) {
    const template = getTemplateByKey(templateKey);

    setSelectedTemplateKey(template.key);
    setEditableTemplate(cloneTemplate(template));
    setNewQuestionSectionId(template.sections[0]?.id ?? "");
  }

  function removeQuestion(sectionId: string, fieldId: string) {
    setEditableTemplate((prev) => ({
      ...prev,
      sections: prev.sections.map((section) =>
        section.id === sectionId
          ? {
              ...section,
              fields: section.fields.filter((field) => field.id !== fieldId),
            }
          : section
      ),
    }));
  }

  function addCustomQuestion() {
    const labelZh = newQuestionLabelZh.trim();
    const labelEn = newQuestionLabelEn.trim() || labelZh;

    if (!labelZh || !newQuestionSectionId) {
      return;
    }

    setEditableTemplate((prev) => ({
      ...prev,
      sections: prev.sections.map((section) =>
        section.id === newQuestionSectionId
          ? {
              ...section,
              fields: [
                ...section.fields,
                createCustomField(
                  section,
                  labelZh,
                  labelEn,
                  newQuestionType,
                  newQuestionRequired
                ),
              ],
            }
          : section
      ),
    }));
    setNewQuestionLabelZh("");
    setNewQuestionLabelEn("");
    setNewQuestionRequired(false);
  }

  return (
    <div id="questionnaires-section" className="toss-card mb-8 p-8">
      <div className="mb-6 flex flex-col gap-4 xl:flex-row xl:items-start xl:justify-between">
        <div>
          <h2 className="text-[28px] font-bold tracking-[-0.02em] text-[#191f28]">
            {lang === "zh" ? "线上申请表" : "Online Questionnaires"}
          </h2>
          <p className="mt-2 text-[15px] leading-7 text-[#6b7684]">
            {lang === "zh"
              ? "生成客户可在线填写的问题清单链接，客户可以保存草稿并提交。"
              : "Generate questionnaire links clients can complete online, save as draft, and submit."}
          </p>
        </div>

        <form
          id="questionnaire-generator-form"
          action={onGenerateAction}
          className="flex w-full flex-col gap-3 md:w-auto md:min-w-[420px] md:flex-row"
        >
          <input type="hidden" name="caseId" value={caseId} />
          <input
            type="hidden"
            name="customTemplate"
            value={JSON.stringify(editableTemplate)}
          />
          <select
            name="templateKey"
            className="w-full px-4 py-3 text-sm md:min-w-[280px]"
            required
            value={selectedTemplateKey}
            onChange={(event) => selectTemplate(event.target.value)}
          >
            {questionnaireTemplates.map((template) => (
              <option key={template.key} value={template.key}>
                {getTemplateLabel(template, lang)}
              </option>
            ))}
          </select>
          <button
            type="submit"
            className="toss-primary-button px-5 py-3 text-sm font-semibold"
          >
            {lang === "zh" ? "生成表单链接" : "Generate Link"}
          </button>
        </form>
      </div>

      <div className="mb-6 rounded-2xl border border-[#eef1f4] bg-[#fafbfc] p-5">
        <div className="mb-4 flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
          <div>
            <h3 className="text-[20px] font-bold text-[#191f28]">
              {lang === "zh" ? "发送前编辑问题" : "Edit Questions Before Sending"}
            </h3>
            <p className="mt-1 text-sm text-[#6b7684]">
              {lang === "zh"
                ? "选择模板后，可以删除不需要的问题，也可以添加顾问自己的问题。生成链接时会保存当前版本。"
                : "After choosing a template, remove questions you do not need or add your own. The generated link keeps this version."}
            </p>
          </div>
          <div className="flex flex-wrap items-center gap-3">
            <span className="rounded-full bg-white px-4 py-2 text-sm font-semibold text-[#4e5968]">
              {lang === "zh"
                ? `${editableQuestionCount} 个问题`
                : `${editableQuestionCount} questions`}
            </span>
            <button
              type="button"
              onClick={() => selectTemplate(selectedTemplateKey)}
              className="toss-secondary-button px-4 py-2 text-sm font-semibold"
            >
              {lang === "zh" ? "重置" : "Reset"}
            </button>
          </div>
        </div>

        <div className="grid grid-cols-1 gap-5 xl:grid-cols-[1fr_360px]">
          <div className="max-h-[520px] space-y-4 overflow-auto rounded-2xl border border-[#e8edf3] bg-white p-4">
            {editableTemplate.sections.map((section) => (
              <div key={section.id}>
                <h4 className="mb-2 text-sm font-bold text-[#191f28]">
                  {lang === "zh" ? section.titleZh : section.titleEn}
                </h4>
                {section.fields.length === 0 ? (
                  <p className="rounded-xl border border-dashed border-[#dfe3e8] px-3 py-2 text-sm text-[#8b95a1]">
                    {lang === "zh"
                      ? "该分组暂无问题"
                      : "No questions in this section"}
                  </p>
                ) : (
                  <div className="space-y-2">
                    {section.fields.map((field) => (
                      <div
                        key={field.id}
                        className="flex items-start justify-between gap-3 rounded-xl border border-[#eef1f4] bg-[#fafbfc] px-3 py-2"
                      >
                        <div>
                          <p className="text-sm font-semibold text-[#333d4b]">
                            {getLabel(field, lang)}
                            {field.required ? (
                              <span className="text-[#f04452]"> *</span>
                            ) : null}
                          </p>
                          <p className="mt-1 text-xs text-[#8b95a1]">
                            {field.type === "repeater"
                              ? lang === "zh"
                                ? "可重复问题组"
                                : "Repeating group"
                              : field.type}
                          </p>
                        </div>
                        <button
                          type="button"
                          onClick={() => removeQuestion(section.id, field.id)}
                          className="toss-danger-button shrink-0 px-3 py-2 text-xs font-semibold"
                        >
                          {lang === "zh" ? "删除" : "Remove"}
                        </button>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            ))}
          </div>

          <div className="rounded-2xl border border-[#e8edf3] bg-white p-4 xl:self-start">
            <p className="mb-3 text-sm font-bold text-[#191f28]">
              {lang === "zh" ? "新增问题" : "Add Question"}
            </p>
            <div className="space-y-3">
              <select
                value={newQuestionSectionId}
                onChange={(event) => setNewQuestionSectionId(event.target.value)}
                className="w-full px-4 py-3 text-sm"
              >
                {editableTemplate.sections.map((section) => (
                  <option key={section.id} value={section.id}>
                    {lang === "zh" ? section.titleZh : section.titleEn}
                  </option>
                ))}
              </select>
              <select
                value={newQuestionType}
                onChange={(event) =>
                  setNewQuestionType(
                    event.target.value as QuestionnaireFieldType | "yes_no"
                  )
                }
                className="w-full px-4 py-3 text-sm"
              >
                {customQuestionTypes.map((type) => (
                  <option key={type.value} value={type.value}>
                    {lang === "zh" ? type.labelZh : type.labelEn}
                  </option>
                ))}
              </select>
              <input
                value={newQuestionLabelZh}
                onChange={(event) => setNewQuestionLabelZh(event.target.value)}
                placeholder={lang === "zh" ? "中文问题" : "Chinese question"}
                className="w-full px-4 py-3 text-sm"
              />
              <input
                value={newQuestionLabelEn}
                onChange={(event) => setNewQuestionLabelEn(event.target.value)}
                placeholder={
                  lang === "zh" ? "英文问题（可选）" : "English question, optional"
                }
                className="w-full px-4 py-3 text-sm"
              />
              <label className="inline-flex items-center gap-2 text-sm font-semibold text-[#4e5968]">
                <input
                  type="checkbox"
                  checked={newQuestionRequired}
                  onChange={(event) =>
                    setNewQuestionRequired(event.target.checked)
                  }
                />
                {lang === "zh" ? "设为必填" : "Required"}
              </label>
              <button
                type="button"
                onClick={addCustomQuestion}
                className="toss-secondary-button w-full px-4 py-2 text-sm font-semibold"
              >
                {lang === "zh" ? "添加问题" : "Add Question"}
              </button>
            </div>
          </div>
        </div>

        <div className="mt-5 flex justify-end">
          <button
            type="submit"
            form="questionnaire-generator-form"
            className="toss-primary-button px-5 py-3 text-sm font-semibold"
          >
            {lang === "zh" ? "生成并准备发送给客户" : "Generate Link for Client"}
          </button>
        </div>
      </div>

      {links.length === 0 ? (
        <div className="rounded-2xl border border-dashed border-[#dfe3e8] bg-[#fafbfc] p-5">
          <p className="text-[15px] text-[#8b95a1]">
            {lang === "zh"
              ? "暂无线上申请表链接。请选择模板后生成链接。"
              : "No questionnaire links yet. Choose a template and generate a link."}
          </p>
        </div>
      ) : (
        <div className="space-y-4">
          {visibleLinks.map((link) => {
            const template = getQuestionnaireTemplateSnapshot(
              link.templateKey,
              link.customTemplate
            );
            const displayStatus = getLinkDisplayStatus(link);
            const shareUrl = getShareUrl(link.token);

            return (
              <div key={link.id} className="toss-soft-card p-5">
                <div className="mb-5 flex flex-col gap-4 xl:flex-row xl:items-start xl:justify-between">
                  <div>
                    <p className="toss-label mb-2">
                      {lang === "zh" ? "表单链接" : "Questionnaire URL"}
                    </p>
                    <p
                      suppressHydrationWarning
                      className="break-all text-[15px] font-semibold text-[#191f28]"
                    >
                      {shareUrl}
                    </p>
                    <p className="mt-2 text-sm text-[#6b7684]">
                      {template
                        ? getTemplateLabel(template, lang)
                        : link.templateKey}
                    </p>
                  </div>

                  <div className="flex shrink-0 flex-wrap gap-2">
                    <a
                      href={`/intake/${link.token}`}
                      target="_blank"
                      rel="noreferrer"
                      className="toss-secondary-button px-4 py-2 text-sm font-semibold"
                    >
                      {lang === "zh" ? "打开" : "Open"}
                    </a>

                    <button
                      type="button"
                      onClick={() => copyLink(link.token)}
                      className="toss-secondary-button px-4 py-2 text-sm font-semibold"
                    >
                      {copiedToken === link.token
                        ? lang === "zh"
                          ? "已复制"
                          : "Copied"
                        : lang === "zh"
                        ? "复制链接"
                        : "Copy Link"}
                    </button>

                    {displayStatus === "active" ? (
                      <form action={onDeactivateAction}>
                        <input type="hidden" name="caseId" value={caseId} />
                        <input type="hidden" name="linkId" value={link.id} />
                        <button
                          type="submit"
                          className="toss-danger-button px-4 py-2 text-sm font-semibold"
                        >
                          {lang === "zh" ? "停用" : "Deactivate"}
                        </button>
                      </form>
                    ) : (
                      <div className="inline-flex items-center justify-center rounded-2xl border border-[#eef1f4] bg-white px-4 py-2 text-sm font-semibold text-[#c2c8cf]">
                        {lang === "zh" ? "已停用" : "Inactive"}
                      </div>
                    )}

                    <form action={onDeleteAction}>
                      <input type="hidden" name="caseId" value={caseId} />
                      <input type="hidden" name="linkId" value={link.id} />
                      <ConfirmSubmitButton
                        label={lang === "zh" ? "删除" : "Delete"}
                        confirmMessage={
                          lang === "zh"
                            ? "确认删除这个申请表链接吗？该链接下的草稿和提交记录也会被删除。"
                            : "Delete this questionnaire link? Drafts and submitted responses under this link will also be deleted."
                        }
                        className="toss-secondary-button px-4 py-2 text-sm font-semibold"
                      />
                    </form>
                  </div>
                </div>

                <div className="grid grid-cols-1 gap-4 text-sm md:grid-cols-4">
                  <div>
                    <p className="toss-label mb-2">
                      {lang === "zh" ? "状态" : "Status"}
                    </p>
                    <StatusBadge value={displayStatus} lang={lang} />
                  </div>
                  <div>
                    <p className="toss-label mb-2">
                      {lang === "zh" ? "过期时间" : "Expires At"}
                    </p>
                    <p className="text-[15px] text-[#4e5968]">
                      {formatDateTime(link.expiresAt)}
                    </p>
                  </div>
                  <div>
                    <p className="toss-label mb-2">
                      {lang === "zh" ? "打开次数" : "Opened"}
                    </p>
                    <p className="text-[15px] text-[#4e5968]">
                      {link.currentUses}
                    </p>
                  </div>
                  <div>
                    <p className="toss-label mb-2">
                      {lang === "zh" ? "保存/提交记录" : "Drafts/Submissions"}
                    </p>
                    <p className="text-[15px] text-[#4e5968]">
                      {link.submissions.length}
                    </p>
                  </div>
                </div>
              </div>
            );
          })}

          {hasMoreLinks && (
            <button
              type="button"
              onClick={() => setShowAllLinks((prev) => !prev)}
              className="toss-secondary-button px-4 py-2 text-sm font-semibold"
            >
              {showAllLinks
                ? lang === "zh"
                  ? "收起旧链接"
                  : "Show Fewer Links"
                : lang === "zh"
                ? `显示全部链接 (${links.length})`
                : `Show All Links (${links.length})`}
            </button>
          )}
        </div>
      )}

      {latestSubmissions.length > 0 && (
        <div className="mt-8">
          <h3 className="mb-4 text-[22px] font-bold text-[#191f28]">
            {lang === "zh" ? "客户填写记录" : "Client Responses"}
          </h3>

          <div className="space-y-4">
            {latestSubmissions.map((submission) => {
              const template = getQuestionnaireTemplateSnapshot(
                submission.templateKey,
                submission.linkTemplate
              );
              const expanded = expandedSubmissionId === submission.id;

              return (
                <div key={submission.id} className="rounded-2xl border border-[#eef1f4] bg-white p-5">
                  <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
                    <div>
                      <p className="font-semibold text-[#191f28]">
                        {template
                          ? getTemplateLabel(template, lang)
                          : submission.templateKey}
                      </p>
                      <p className="mt-1 text-sm text-[#6b7684]">
                        {lang === "zh" ? "更新时间：" : "Updated: "}
                        {formatDateTime(submission.updatedAt)}
                        {submission.submittedAt
                          ? ` · ${lang === "zh" ? "提交时间：" : "Submitted: "}${formatDateTime(
                              submission.submittedAt
                            )}`
                          : ""}
                      </p>
                    </div>

                    <div className="flex flex-wrap items-center gap-2">
                      <StatusBadge value={submission.status} lang={lang} />
                      <button
                        type="button"
                        onClick={() =>
                          setExpandedSubmissionId(expanded ? "" : submission.id)
                        }
                        className="toss-secondary-button px-4 py-2 text-sm font-semibold"
                      >
                        {expanded
                          ? lang === "zh"
                            ? "收起"
                            : "Hide"
                          : lang === "zh"
                          ? "查看答案"
                          : "View Answers"}
                      </button>
                      {submission.status === "submitted" && (
                        <form action={onReopenAction}>
                          <input type="hidden" name="caseId" value={caseId} />
                          <input type="hidden" name="submissionId" value={submission.id} />
                          <button
                            type="submit"
                            className="toss-secondary-button px-4 py-2 text-sm font-semibold"
                          >
                            {lang === "zh" ? "重新开放" : "Reopen"}
                          </button>
                        </form>
                      )}
                    </div>
                  </div>

                  {expanded && template && (
                    <div className="mt-5">
                      <SubmissionAnswers
                        submission={submission}
                        template={template}
                        lang={lang}
                      />
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}
