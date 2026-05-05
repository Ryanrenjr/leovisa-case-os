"use client";

import { useMemo, useState } from "react";
import type {
  QuestionnaireField,
  QuestionnaireTemplate,
} from "../../../../lib/questionnaires/templates";

type Language = "zh" | "en";
type Answers = Record<string, Record<string, unknown>>;

type IntakeFormContentProps = {
  token: string;
  template: QuestionnaireTemplate;
  initialAnswers: unknown;
  submissionStatus: string;
  isUnavailable: boolean;
  isSaved: boolean;
  isSubmitted: boolean;
  error: string;
  clientChineseName: string;
  clientEnglishName: string;
  reference: string;
  serviceType: string;
  country: string;
  expiresAtText: string;
};

function asAnswers(value: unknown): Answers {
  if (!value || typeof value !== "object" || Array.isArray(value)) {
    return {};
  }

  return value as Answers;
}

function getFieldLabel(field: QuestionnaireField, lang: Language) {
  return lang === "zh" ? field.labelZh : field.labelEn;
}

function getFieldHelper(field: QuestionnaireField, lang: Language) {
  return lang === "zh" ? field.helperZh : field.helperEn;
}

function getDefaultValue(field: QuestionnaireField) {
  return field.type === "repeater" ? [] : "";
}

function createRepeaterRow(field: QuestionnaireField) {
  return Object.fromEntries(
    (field.fields ?? []).map((nestedField) => [
      nestedField.id,
      getDefaultValue(nestedField),
    ])
  );
}

function buildInitialAnswers(
  template: QuestionnaireTemplate,
  initialAnswers: unknown
): Answers {
  const answers = asAnswers(initialAnswers);

  for (const section of template.sections) {
    const sectionAnswers = answers[section.id] ?? {};

    for (const field of section.fields) {
      if (
        field.type === "repeater" &&
        field.required &&
        !Array.isArray(sectionAnswers[field.id])
      ) {
        sectionAnswers[field.id] = [createRepeaterRow(field)];
      }
    }

    answers[section.id] = sectionAnswers;
  }

  return answers;
}

function hasValue(value: unknown) {
  if (Array.isArray(value)) {
    return value.some((row) => {
      if (!row || typeof row !== "object" || Array.isArray(row)) {
        return false;
      }

      return Object.values(row).some(hasValue);
    });
  }

  return value !== undefined && value !== null && String(value).trim() !== "";
}

function getRequiredFieldStats(
  sectionId: string,
  fields: QuestionnaireField[],
  answers: Answers
) {
  const requiredFields = fields.filter((field) => field.required);
  const completedFields = requiredFields.filter((field) =>
    hasValue(answers[sectionId]?.[field.id])
  );

  return {
    total: requiredFields.length,
    completed: completedFields.length,
  };
}

export default function IntakeFormContent({
  token,
  template,
  initialAnswers,
  submissionStatus,
  isUnavailable,
  isSaved,
  isSubmitted,
  error,
  clientChineseName,
  clientEnglishName,
  reference,
  serviceType,
  country,
  expiresAtText,
}: IntakeFormContentProps) {
  const [lang, setLang] = useState<Language>("zh");
  const [answers, setAnswers] = useState<Answers>(() =>
    buildInitialAnswers(template, initialAnswers)
  );
  const [activeSectionId, setActiveSectionId] = useState(
    template.sections[0]?.id ?? ""
  );
  const [isSaving, setIsSaving] = useState(false);
  const [hasUnsavedChanges, setHasUnsavedChanges] = useState(false);
  const [validationError, setValidationError] = useState("");
  const [saveMessage, setSaveMessage] = useState("");
  const activeSection =
    template.sections.find((section) => section.id === activeSectionId) ??
    template.sections[0];
  const isLocked = submissionStatus === "submitted" || isSubmitted;
  const clientDisplay =
    [clientEnglishName?.trim(), clientChineseName?.trim()]
      .filter(Boolean)
      .join(" / ") || "-";
  const completion = useMemo(() => {
    const stats = template.sections.map((section) =>
      getRequiredFieldStats(section.id, section.fields, answers)
    );

    return {
      total: stats.reduce((sum, item) => sum + item.total, 0),
      completed: stats.reduce((sum, item) => sum + item.completed, 0),
    };
  }, [answers, template.sections]);

  function updateAnswer(sectionId: string, fieldId: string, value: unknown) {
    setAnswers((prev) => ({
      ...prev,
      [sectionId]: {
        ...(prev[sectionId] ?? {}),
        [fieldId]: value,
      },
    }));
    setSaveMessage("");
    setValidationError("");
    setHasUnsavedChanges(true);
  }

  function getSectionAnswers(sectionId: string) {
    return answers[sectionId] ?? {};
  }

  function addRepeaterRow(sectionId: string, field: QuestionnaireField) {
    const sectionAnswers = getSectionAnswers(sectionId);
    const currentRows = Array.isArray(sectionAnswers[field.id])
      ? (sectionAnswers[field.id] as Record<string, unknown>[])
      : [];
    const row = createRepeaterRow(field);

    updateAnswer(sectionId, field.id, [...currentRows, row]);
  }

  function updateRepeaterRow(
    sectionId: string,
    field: QuestionnaireField,
    rowIndex: number,
    nestedFieldId: string,
    value: unknown
  ) {
    const sectionAnswers = getSectionAnswers(sectionId);
    const currentRows = Array.isArray(sectionAnswers[field.id])
      ? (sectionAnswers[field.id] as Record<string, unknown>[])
      : [];
    const nextRows = currentRows.map((row, index) =>
      index === rowIndex ? { ...row, [nestedFieldId]: value } : row
    );

    updateAnswer(sectionId, field.id, nextRows);
  }

  function removeRepeaterRow(
    sectionId: string,
    field: QuestionnaireField,
    rowIndex: number
  ) {
    const sectionAnswers = getSectionAnswers(sectionId);
    const currentRows = Array.isArray(sectionAnswers[field.id])
      ? (sectionAnswers[field.id] as Record<string, unknown>[])
      : [];

    updateAnswer(
      sectionId,
      field.id,
      currentRows.filter((_, index) => index !== rowIndex)
    );
  }

  function validateBeforeSubmit() {
    for (const section of template.sections) {
      for (const field of section.fields) {
        if (field.required && !hasValue(answers[section.id]?.[field.id])) {
          setActiveSectionId(section.id);
          setValidationError(
            lang === "zh"
              ? `请先填写必填项：${field.labelZh}`
              : `Please complete required field: ${field.labelEn}`
          );
          return false;
        }
      }
    }

    return true;
  }

  async function save(action: "draft" | "submit") {
    if (isSaving || isLocked) {
      return;
    }

    if (action === "submit" && !validateBeforeSubmit()) {
      return;
    }

    setIsSaving(true);
    setValidationError("");
    setSaveMessage("");

    try {
      const response = await fetch(`/intake/${token}/save`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          action,
          answers,
        }),
      });
      const payload = await response.json().catch(() => null);

      if (!response.ok) {
        throw new Error(payload?.error || "save_failed");
      }

      if (action === "submit") {
        window.location.assign(`/intake/${token}?submitted=1`);
        return;
      }

      setHasUnsavedChanges(false);
      setSaveMessage(lang === "zh" ? "草稿已保存。" : "Draft saved.");
    } catch {
      setValidationError(
        lang === "zh"
          ? "保存失败，请稍后再试或联系顾问。"
          : "Save failed. Please try again later or contact your consultant."
      );
    } finally {
      setIsSaving(false);
    }
  }

  function renderField(sectionId: string, field: QuestionnaireField) {
    const value = answers[sectionId]?.[field.id] ?? getDefaultValue(field);
    const helper = getFieldHelper(field, lang);

    if (field.type === "repeater") {
      const rows = Array.isArray(value) ? (value as Record<string, unknown>[]) : [];

      return (
        <div className="rounded-2xl border border-[#e8edf3] bg-white p-5">
          <div className="mb-4 flex flex-col gap-3 md:flex-row md:items-start md:justify-between">
            <div>
              <label className="block text-sm font-semibold text-[#191f28]">
                {getFieldLabel(field, lang)}
                {field.required ? <span className="text-[#f04452]"> *</span> : null}
              </label>
              {!!helper && (
                <p className="mt-2 text-[13px] leading-6 text-[#8b95a1]">
                  {helper}
                </p>
              )}
            </div>
            {!isLocked && (
              <button
                type="button"
                onClick={() => addRepeaterRow(sectionId, field)}
                className="toss-secondary-button px-4 py-2 text-sm font-semibold"
              >
                {lang === "zh" ? "新增一条" : "Add Entry"}
              </button>
            )}
          </div>

          {rows.length === 0 ? (
            <div className="rounded-2xl border border-dashed border-[#dfe3e8] bg-[#fafbfc] p-4">
              <p className="mb-3 text-sm text-[#8b95a1]">
                {lang === "zh"
                  ? "暂无记录。如有相关信息，请点击下方按钮新增。"
                  : "No entries yet. Add an entry if this applies."}
              </p>
              {!isLocked && (
                <button
                  type="button"
                  onClick={() => addRepeaterRow(sectionId, field)}
                  className="toss-secondary-button px-4 py-2 text-sm font-semibold"
                >
                  {lang === "zh" ? "新增第一条" : "Add First Entry"}
                </button>
              )}
            </div>
          ) : (
            <div className="space-y-4">
              {rows.map((row, rowIndex) => (
                <div
                  key={rowIndex}
                  className="rounded-2xl border border-[#eef1f4] bg-[#fafbfc] p-4"
                >
                  <div className="mb-4 flex items-center justify-between gap-3">
                    <p className="text-sm font-semibold text-[#191f28]">
                      {lang === "zh" ? `第 ${rowIndex + 1} 条` : `Entry ${rowIndex + 1}`}
                    </p>
                    {!isLocked && (
                      <button
                        type="button"
                        onClick={() => removeRepeaterRow(sectionId, field, rowIndex)}
                        className="toss-danger-button px-3 py-2 text-xs font-semibold"
                      >
                        {lang === "zh" ? "删除" : "Remove"}
                      </button>
                    )}
                  </div>

                  <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                    {(field.fields ?? []).map((nestedField) => (
                      <div
                        key={nestedField.id}
                        className={nestedField.type === "textarea" ? "md:col-span-2" : ""}
                      >
                        {renderInput({
                          field: nestedField,
                          value: row[nestedField.id] ?? "",
                          onChange: (nextValue) =>
                            updateRepeaterRow(
                              sectionId,
                              field,
                              rowIndex,
                              nestedField.id,
                              nextValue
                            ),
                        })}
                      </div>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      );
    }

    return renderInput({
      field,
      value,
      onChange: (nextValue) => updateAnswer(sectionId, field.id, nextValue),
    });
  }

  function renderInput({
    field,
    value,
    onChange,
  }: {
    field: QuestionnaireField;
    value: unknown;
    onChange: (value: string) => void;
  }) {
    const label = getFieldLabel(field, lang);
    const helper = getFieldHelper(field, lang);
    const stringValue = typeof value === "string" ? value : "";

    return (
      <label className="block">
        <span className="mb-2 block text-sm font-semibold text-[#4e5968]">
          {label}
          {field.required ? <span className="text-[#f04452]"> *</span> : null}
        </span>
        {field.type === "textarea" ? (
          <textarea
            value={stringValue}
            onChange={(event) => onChange(event.target.value)}
            disabled={isLocked}
            rows={4}
            className="w-full px-4 py-3 text-[15px] leading-7"
          />
        ) : field.type === "select" || field.type === "boolean" ? (
          <select
            value={stringValue}
            onChange={(event) => onChange(event.target.value)}
            disabled={isLocked}
            className="w-full px-4 py-3 text-[15px]"
          >
            <option value="">
              {lang === "zh" ? "请选择" : "Please select"}
            </option>
            {(field.options ?? []).map((option) => (
              <option key={option.value} value={option.value}>
                {lang === "zh" ? option.labelZh : option.labelEn}
              </option>
            ))}
          </select>
        ) : (
          <input
            type={field.type}
            value={stringValue}
            onChange={(event) => onChange(event.target.value)}
            disabled={isLocked}
            className="w-full px-4 py-3 text-[15px]"
          />
        )}
        {!!helper && (
          <span className="mt-2 block text-[13px] leading-6 text-[#8b95a1]">
            {helper}
          </span>
        )}
      </label>
    );
  }

  return (
    <main className="min-h-screen bg-[#f4f6f8] px-5 py-8 text-[#191f28] md:px-8 md:py-12">
      <div className="mx-auto max-w-6xl">
        <div className="mb-4 flex justify-end">
          <button
            type="button"
            onClick={() => setLang(lang === "zh" ? "en" : "zh")}
            className="inline-flex items-center justify-center rounded-2xl border border-[#e5e8eb] bg-white px-4 py-2 text-sm font-semibold text-[#4e5968] shadow-sm hover:bg-[#f8fafc]"
          >
            {lang === "zh" ? "English" : "中文"}
          </button>
        </div>

        <div className="rounded-[28px] border border-[#e8edf3] bg-white p-6 shadow-[0_12px_40px_rgba(15,23,42,0.06)] md:p-8">
          <p className="mb-3 text-sm font-medium text-[#8b95a1]">
            {lang === "zh" ? "LeoVisa 线上申请表" : "LeoVisa Online Questionnaire"}
          </p>
          <h1 className="text-[32px] font-extrabold tracking-[-0.03em] text-[#191f28] md:text-[40px]">
            {lang === "zh" ? template.titleZh : template.titleEn}
          </h1>
          <p className="mt-3 max-w-3xl text-[15px] leading-7 text-[#6b7684]">
            {lang === "zh" ? template.descriptionZh : template.descriptionEn}
          </p>

          <div className="mt-8 grid grid-cols-1 gap-4 md:grid-cols-4">
            {[
              [lang === "zh" ? "客户" : "Client", clientDisplay],
              [lang === "zh" ? "Reference" : "Reference", reference],
              [lang === "zh" ? "服务项目" : "Service", `${serviceType} · ${country}`],
              [lang === "zh" ? "失效时间" : "Expires At", expiresAtText],
            ].map(([label, value]) => (
              <div
                key={label}
                className="rounded-2xl border border-[#eef1f4] bg-[#fafbfc] p-4"
              >
                <p className="mb-2 text-sm font-medium text-[#8b95a1]">{label}</p>
                <p className="text-[15px] font-semibold text-[#191f28]">{value}</p>
              </div>
            ))}
          </div>

          {isUnavailable ? (
            <div className="mt-8 rounded-2xl border border-red-200 bg-red-50 p-5">
              <h2 className="mb-2 text-[22px] font-bold text-red-700">
                {lang === "zh" ? "该申请表链接当前不可用" : "This questionnaire link is unavailable"}
              </h2>
              <p className="text-[15px] leading-7 text-red-700">
                {lang === "zh"
                  ? "该链接可能已过期或已停用。请联系顾问获取新的链接。"
                  : "This link may be expired or inactive. Please contact your consultant for a new link."}
              </p>
            </div>
          ) : (
            <>
              {(isSaved || isSubmitted || !!saveMessage || !!validationError || !!error) && (
                <div
                  className={`mt-8 rounded-2xl border p-5 ${
                    validationError || error
                      ? "border-red-200 bg-red-50 text-red-700"
                      : "border-green-200 bg-green-50 text-green-700"
                  }`}
                >
                  <p className="text-[15px] font-semibold">
                    {validationError ||
                      (error
                        ? lang === "zh"
                          ? "操作失败，请稍后再试。"
                          : "Action failed. Please try again later."
                        : saveMessage ||
                          (isSubmitted
                            ? lang === "zh"
                              ? "申请表已提交。"
                              : "Questionnaire submitted."
                            : lang === "zh"
                            ? "草稿已保存。"
                            : "Draft saved."))}
                  </p>
                </div>
              )}

              {hasUnsavedChanges && !isLocked && (
                <div className="mt-8 rounded-2xl border border-[#ffe7b8] bg-[#fff8e8] p-5">
                  <p className="text-[15px] font-semibold text-[#b78103]">
                    {lang === "zh"
                      ? "有未保存的修改。离开页面前请点击“保存草稿”。"
                      : "You have unsaved changes. Save the draft before leaving this page."}
                  </p>
                </div>
              )}

              {isLocked && (
                <div className="mt-8 rounded-2xl border border-[#eef1f4] bg-[#fafbfc] p-5">
                  <p className="text-[15px] leading-7 text-[#4e5968]">
                    {lang === "zh"
                      ? "这份申请表已经提交。如需修改，请联系顾问重新开放。"
                      : "This questionnaire has been submitted. Contact your consultant if changes are needed."}
                  </p>
                </div>
              )}

              <div className="mt-8 grid grid-cols-1 gap-6 lg:grid-cols-[280px_1fr]">
                <aside className="rounded-2xl border border-[#eef1f4] bg-[#fafbfc] p-4 lg:self-start">
                  <p className="mb-4 text-sm font-semibold text-[#8b95a1]">
                    {lang === "zh" ? "填写进度" : "Progress"}
                  </p>
                  <div className="mb-5 h-2 overflow-hidden rounded-full bg-[#edf2f7]">
                    <div
                      className="h-full rounded-full bg-[#3182f6]"
                      style={{
                        width:
                          completion.total > 0
                            ? `${Math.round((completion.completed / completion.total) * 100)}%`
                            : "100%",
                      }}
                    />
                  </div>
                  <p className="mb-5 text-sm text-[#6b7684]">
                    {completion.completed} / {completion.total}{" "}
                    {lang === "zh" ? "个必填项" : "required fields"}
                  </p>

                  <div className="space-y-2">
                    {template.sections.map((section, index) => (
                      (() => {
                        const stats = getRequiredFieldStats(
                          section.id,
                          section.fields,
                          answers
                        );

                        return (
                          <button
                            key={section.id}
                            type="button"
                            onClick={() => setActiveSectionId(section.id)}
                            className={`w-full rounded-2xl px-4 py-3 text-left text-sm font-semibold ${
                              activeSectionId === section.id
                                ? "bg-[#3182f6] text-white"
                                : "border border-[#e5e8eb] bg-white text-[#4e5968]"
                            }`}
                          >
                            <span className="block">
                              {index + 1}.{" "}
                              {lang === "zh" ? section.titleZh : section.titleEn}
                            </span>
                            {stats.total > 0 && (
                              <span className="mt-1 block text-xs opacity-80">
                                {stats.completed}/{stats.total}{" "}
                                {lang === "zh" ? "必填" : "required"}
                              </span>
                            )}
                          </button>
                        );
                      })()
                    ))}
                  </div>
                </aside>

                <section className="rounded-2xl border border-[#eef1f4] bg-[#fafbfc] p-5 md:p-6">
                  <h2 className="mb-2 text-[24px] font-bold tracking-[-0.02em] text-[#191f28]">
                    {lang === "zh" ? activeSection.titleZh : activeSection.titleEn}
                  </h2>
                  {(activeSection.descriptionZh || activeSection.descriptionEn) && (
                    <p className="mb-6 text-[15px] leading-7 text-[#6b7684]">
                      {lang === "zh"
                        ? activeSection.descriptionZh
                        : activeSection.descriptionEn}
                    </p>
                  )}

                  <div className="grid grid-cols-1 gap-5 md:grid-cols-2">
                    {activeSection.fields.map((field) => (
                      <div
                        key={field.id}
                        className={
                          field.type === "textarea" || field.type === "repeater"
                            ? "md:col-span-2"
                            : ""
                        }
                      >
                        {renderField(activeSection.id, field)}
                      </div>
                    ))}
                  </div>

                  <div className="mt-8 flex flex-wrap gap-3">
                    {!isLocked && (
                      <>
                        <button
                          type="button"
                          onClick={() => save("draft")}
                          disabled={isSaving}
                          className="toss-secondary-button px-5 py-3 text-sm font-semibold"
                        >
                          {isSaving
                            ? lang === "zh"
                              ? "保存中..."
                              : "Saving..."
                            : lang === "zh"
                            ? "保存草稿"
                            : "Save Draft"}
                        </button>
                        <button
                          type="button"
                          onClick={() => save("submit")}
                          disabled={isSaving}
                          className="toss-primary-button px-6 py-3 text-sm font-semibold"
                        >
                          {isSaving
                            ? lang === "zh"
                              ? "提交中..."
                              : "Submitting..."
                            : lang === "zh"
                            ? "提交申请表"
                            : "Submit Questionnaire"}
                        </button>
                      </>
                    )}

                    {template.sections.map((section, index) => {
                      if (section.id !== activeSection.id) {
                        return null;
                      }

                      const previousSection = template.sections[index - 1];
                      const nextSection = template.sections[index + 1];

                      return (
                        <div key={section.id} className="ml-auto flex gap-3">
                          {previousSection && (
                            <button
                              type="button"
                              onClick={() => setActiveSectionId(previousSection.id)}
                              className="toss-secondary-button px-5 py-3 text-sm font-semibold"
                            >
                              {lang === "zh" ? "上一页" : "Previous"}
                            </button>
                          )}
                          {nextSection && (
                            <button
                              type="button"
                              onClick={() => setActiveSectionId(nextSection.id)}
                              className="toss-secondary-button px-5 py-3 text-sm font-semibold"
                            >
                              {lang === "zh" ? "下一页" : "Next"}
                            </button>
                          )}
                        </div>
                      );
                    })}
                  </div>
                </section>
              </div>
            </>
          )}
        </div>
      </div>
    </main>
  );
}
