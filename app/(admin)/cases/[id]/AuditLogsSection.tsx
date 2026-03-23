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
    <div
      id="audit-logs-section"
      className="rounded-2xl border border-white/10 bg-white/5 p-8"
    >
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-2xl font-semibold">
          {lang === "zh" ? "最近操作日志" : "Recent Audit Logs"}
        </h2>
        <p className="text-sm text-white/50">
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
        <p className="text-white/60">
          {lang === "zh" ? "暂无操作日志。" : "No audit logs yet."}
        </p>
      ) : (
        <>
          <div className="space-y-4">
            {visibleLogs.map((log) => (
              <div
                key={log.id}
                className="rounded-xl border border-white/10 bg-black/30 p-4"
              >
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                  <div>
                    <p className="text-white/50 mb-1">
                      {lang === "zh" ? "操作" : "Action"}
                    </p>
                    <p>{log.actionType}</p>
                  </div>

                  <div>
                    <p className="text-white/50 mb-1">
                      {lang === "zh" ? "操作者" : "Actor"}
                    </p>
                    <p>
                      {log.actorType}
                      {log.actorId ? ` (${log.actorId})` : ""}
                    </p>
                  </div>

                  <div>
                    <p className="text-white/50 mb-1">
                      {lang === "zh" ? "结果" : "Success"}
                    </p>
                    <p>
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
                    <p className="text-white/50 mb-1">
                      {lang === "zh" ? "时间" : "Created At"}
                    </p>
                    <p>{new Date(log.createdAt).toLocaleString()}</p>
                  </div>
                </div>

                <div className="mt-4 grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <p className="text-white/50 mb-1 text-sm">
                      {lang === "zh" ? "修改前" : "Old Value"}
                    </p>
                    <pre className="whitespace-pre-wrap break-all rounded-lg border border-white/10 bg-black/30 p-3 text-xs text-white/80">
                      {renderJsonValue(log.oldValue)}
                    </pre>
                  </div>

                  <div>
                    <p className="text-white/50 mb-1 text-sm">
                      {lang === "zh" ? "修改后" : "New Value"}
                    </p>
                    <pre className="whitespace-pre-wrap break-all rounded-lg border border-white/10 bg-black/30 p-3 text-xs text-white/80">
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
                className="rounded-lg border border-white/10 px-4 py-2 text-white/80 hover:bg-white/10"
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