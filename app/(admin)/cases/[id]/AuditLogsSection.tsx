"use client";

import { useState } from "react";

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
  logs: AuditLogItem[];
  lang: "en" | "zh";
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
  logs,
  lang,
}: AuditLogsSectionProps) {
  const [expanded, setExpanded] = useState(false);

  const hasMore = logs.length > 5;
  const visibleLogs = expanded ? logs : logs.slice(0, 5);

  return (
    <div id="audit-logs-section" className="toss-card p-8">
      <div className="mb-6 flex items-center justify-between">
        <h2 className="text-[28px] font-bold tracking-[-0.02em] text-[#191f28]">
          {lang === "zh" ? "最近操作日志" : "Recent Audit Logs"}
        </h2>
        <p className="text-sm font-medium text-[#8b95a1]">
          {logs.length === 0
            ? lang === "zh"
              ? "暂无日志"
              : "No logs"
            : lang === "zh"
            ? `最新 ${logs.length} 条日志`
            : `Latest ${logs.length} logs`}
        </p>
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