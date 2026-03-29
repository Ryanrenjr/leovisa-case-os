"use client";

import { useMemo, useState } from "react";
import ConfirmSubmitButton from "../../../../components/ConfirmSubmitButton";

type AuditLogItem = {
  id: string;
  actionType: string;
  actorType: string;
  actorId: string | null;
  success: boolean;
  createdAt: Date;
  oldValue: unknown;
  newValue: unknown;
};

type AuditLogsSectionProps = {
  caseId: string;
  logs: AuditLogItem[];
  lang: "en" | "zh";
  onDeleteAction: (formData: FormData) => void;
  onDeleteSelectedAction: (formData: FormData) => void;
};

function renderJsonValue(value: unknown) {
  if (value === null || value === undefined) {
    return "-";
  }

  try {
    return JSON.stringify(value, null, 2);
  } catch {
    return String(value);
  }
}

export default function AuditLogsSection({
  caseId,
  logs,
  lang,
  onDeleteAction,
  onDeleteSelectedAction,
}: AuditLogsSectionProps) {
  const [expanded, setExpanded] = useState(false);
  const [selectedIds, setSelectedIds] = useState<string[]>([]);

  const hasMore = logs.length > 5;
  const visibleLogs = expanded ? logs : logs.slice(0, 5);

  const visibleLogIds = useMemo(
    () => visibleLogs.map((log) => log.id),
    [visibleLogs]
  );

  const allVisibleSelected =
    visibleLogIds.length > 0 &&
    visibleLogIds.every((id) => selectedIds.includes(id));

  function toggleSelect(id: string) {
    setSelectedIds((prev) =>
      prev.includes(id) ? prev.filter((item) => item !== id) : [...prev, id]
    );
  }

  function toggleSelectAllVisible() {
    if (allVisibleSelected) {
      setSelectedIds((prev) =>
        prev.filter((id) => !visibleLogIds.includes(id))
      );
    } else {
      setSelectedIds((prev) => Array.from(new Set([...prev, ...visibleLogIds])));
    }
  }

  return (
    <div id="audit-logs-section" className="toss-card p-8">
      <div className="mb-6 flex flex-wrap items-center justify-between gap-4">
        <div>
          <h2 className="text-[28px] font-bold tracking-[-0.02em] text-[#191f28]">
            {lang === "zh" ? "最近操作日志" : "Recent Audit Logs"}
          </h2>
          <p className="mt-2 text-sm font-medium text-[#8b95a1]">
            {logs.length === 0
              ? lang === "zh"
                ? "暂无日志"
                : "No logs"
              : lang === "zh"
              ? `最新 ${logs.length} 条日志`
              : `Latest ${logs.length} logs`}
          </p>
        </div>

        {logs.length > 0 && (
          <div className="flex flex-wrap items-center gap-3">
            <button
              type="button"
              onClick={toggleSelectAllVisible}
              className="toss-secondary-button px-4 py-2 text-sm font-semibold"
            >
              {allVisibleSelected
                ? lang === "zh"
                  ? "取消全选"
                  : "Unselect All"
                : lang === "zh"
                ? "全选当前显示"
                : "Select Visible"}
            </button>

            <form action={onDeleteSelectedAction}>
              <input type="hidden" name="caseId" value={caseId} />
              {selectedIds.map((id) => (
                <input key={id} type="hidden" name="logIds" value={id} />
              ))}

              <ConfirmSubmitButton
                label={
                  lang === "zh"
                    ? `删除选中 (${selectedIds.length})`
                    : `Delete Selected (${selectedIds.length})`
                }
                confirmMessage={
                  lang === "zh"
                    ? "确认删除选中的操作日志吗？"
                    : "Are you sure you want to delete the selected audit logs?"
                }
                className="toss-danger-button px-4 py-2 text-sm font-semibold"
              />
            </form>
          </div>
        )}
      </div>

      {logs.length === 0 ? (
        <p className="text-[15px] text-[#8b95a1]">
          {lang === "zh" ? "暂无操作日志。" : "No audit logs yet."}
        </p>
      ) : (
        <>
          <div className="space-y-4">
            {visibleLogs.map((log) => (
              <div key={log.id} className="toss-soft-card p-5">
                <div className="mb-5 flex flex-wrap items-start justify-between gap-4">
                  <label className="inline-flex items-center gap-3">
                    <input
                      type="checkbox"
                      checked={selectedIds.includes(log.id)}
                      onChange={() => toggleSelect(log.id)}
                      className="h-4 w-4"
                    />
                    <span className="text-sm font-medium text-[#6b7684]">
                      {lang === "zh" ? "选择此日志" : "Select this log"}
                    </span>
                  </label>

                  <form action={onDeleteAction}>
                    <input type="hidden" name="caseId" value={caseId} />
                    <input type="hidden" name="logId" value={log.id} />

                    <ConfirmSubmitButton
                      label={lang === "zh" ? "删除" : "Delete"}
                      confirmMessage={
                        lang === "zh"
                          ? "确认删除这条操作日志吗？"
                          : "Are you sure you want to delete this audit log?"
                      }
                      className="toss-danger-button px-4 py-2 text-sm font-semibold"
                    />
                  </form>
                </div>

                <div className="grid grid-cols-1 gap-4 text-sm md:grid-cols-2">
                  <div>
                    <p className="toss-label mb-2">
                      {lang === "zh" ? "操作" : "Action"}
                    </p>
                    <p className="text-[15px] text-[#4e5968]">
                      {log.actionType}
                    </p>
                  </div>

                  <div>
                    <p className="toss-label mb-2">
                      {lang === "zh" ? "操作者" : "Actor"}
                    </p>
                    <p className="text-[15px] text-[#4e5968]">
                      {log.actorType}
                      {log.actorId ? ` (${log.actorId})` : ""}
                    </p>
                  </div>

                  <div>
                    <p className="toss-label mb-2">
                      {lang === "zh" ? "结果" : "Success"}
                    </p>
                    <p className="text-[15px] text-[#4e5968]">
                      {log.success
                        ? lang === "zh"
                          ? "成功"
                          : "Yes"
                        : lang === "zh"
                        ? "失败"
                        : "No"}
                    </p>
                  </div>

                  <div>
                    <p className="toss-label mb-2">
                      {lang === "zh" ? "时间" : "Created At"}
                    </p>
                    <p className="text-[15px] text-[#4e5968]">
                      {new Date(log.createdAt).toLocaleString()}
                    </p>
                  </div>
                </div>

                <div className="mt-5 grid grid-cols-1 gap-4 md:grid-cols-2">
                  <div>
                    <p className="toss-label mb-2 text-sm">
                      {lang === "zh" ? "修改前" : "Old Value"}
                    </p>
                    <pre className="whitespace-pre-wrap break-all rounded-[20px] border border-[#eef1f4] bg-[#fafbfc] p-4 text-xs text-[#4e5968]">
                      {renderJsonValue(log.oldValue)}
                    </pre>
                  </div>

                  <div>
                    <p className="toss-label mb-2 text-sm">
                      {lang === "zh" ? "修改后" : "New Value"}
                    </p>
                    <pre className="whitespace-pre-wrap break-all rounded-[20px] border border-[#eef1f4] bg-[#fafbfc] p-4 text-xs text-[#4e5968]">
                      {renderJsonValue(log.newValue)}
                    </pre>
                  </div>
                </div>
              </div>
            ))}
          </div>

          {hasMore && (
            <div className="mt-6">
              <button
                type="button"
                onClick={() => setExpanded((prev) => !prev)}
                className="toss-secondary-button px-4 py-2 text-sm font-semibold"
              >
                {expanded
                  ? lang === "zh"
                    ? "收起"
                    : "Show Less"
                  : lang === "zh"
                  ? "显示更多"
                  : "Show More"}
              </button>
            </div>
          )}
        </>
      )}
    </div>
  );
}