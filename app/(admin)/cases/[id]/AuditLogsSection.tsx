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
        <h2 className="text-2xl font-semibold">Recent Audit Logs</h2>
        <p className="text-sm text-white/50">
  {logs.length === 0 ? "No logs" : `Latest ${logs.length} logs`}
</p>
      </div>

      {logs.length === 0 ? (
        <p className="text-white/60">No audit logs yet.</p>
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
                    <p className="text-white/50 mb-1">Action</p>
                    <p>{log.actionType}</p>
                  </div>

                  <div>
                    <p className="text-white/50 mb-1">Actor</p>
                    <p>
                      {log.actorType}
                      {log.actorId ? ` (${log.actorId})` : ""}
                    </p>
                  </div>

                  <div>
                    <p className="text-white/50 mb-1">Success</p>
                    <p>{log.success ? "Yes" : "No"}</p>
                  </div>

                  <div>
                    <p className="text-white/50 mb-1">Created At</p>
                    <p>{new Date(log.createdAt).toLocaleString()}</p>
                  </div>
                </div>

                <div className="mt-4 grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <p className="text-white/50 mb-1 text-sm">Old Value</p>
                    <pre className="whitespace-pre-wrap break-all rounded-lg border border-white/10 bg-black/30 p-3 text-xs text-white/80">
                      {renderJsonValue(log.oldValue)}
                    </pre>
                  </div>

                  <div>
                    <p className="text-white/50 mb-1 text-sm">New Value</p>
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
                {expanded ? "Show Less" : "Show More"}
              </button>
            </div>
          )}
        </>
      )}
    </div>
  );
}