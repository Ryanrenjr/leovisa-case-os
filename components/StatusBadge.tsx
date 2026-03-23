type StatusBadgeProps = {
  value: string;
  lang?: "en" | "zh";
};

const BADGE_LABELS = {
  en: {
    new: "New",
    intake_pending: "Intake Pending",
    documents_collecting: "Documents Collecting",
    documents_received: "Documents Received",
    under_review: "Under Review",
    contract_pending: "Contract Pending",
    contract_sent: "Contract Sent",
    signed: "Signed",
    completed: "Completed",
    archived: "Archived",

    not_started: "Not Started",
    generated: "Generated",
    sent: "Sent",
    superseded: "Superseded",

    pending: "Pending",
    received: "Received",

    uploaded: "Uploaded",
    approved: "Approved",
    rejected: "Rejected",
    needs_resubmission: "Needs Resubmission",

    active: "Active",
    inactive: "Inactive",
    expired: "Expired",
    used: "Used",
  },
  zh: {
    new: "新建",
    intake_pending: "待收集基础信息",
    documents_collecting: "收集材料中",
    documents_received: "材料已收到",
    under_review: "审核中",
    contract_pending: "待出合同",
    contract_sent: "合同已发送",
    signed: "已签约",
    completed: "已完成",
    archived: "已归档",

    not_started: "未开始",
    generated: "已生成",
    sent: "已发送",
    superseded: "已替换",

    pending: "待处理",
    received: "已收到",

    uploaded: "已上传",
    approved: "已通过",
    rejected: "已拒绝",
    needs_resubmission: "需重新提交",

    active: "有效",
    inactive: "无效",
    expired: "已过期",
    used: "已使用",
  },
} as const;

function getBadgeClass(value: string) {
  switch (value) {
    case "completed":
    case "approved":
    case "received":
    case "signed":
    case "active":
    case "generated":
      return "bg-green-500/15 text-green-300 border-green-500/20";

    case "under_review":
    case "documents_received":
    case "contract_pending":
    case "contract_sent":
    case "uploaded":
    case "pending":
    case "sent":
      return "bg-yellow-500/15 text-yellow-300 border-yellow-500/20";

    case "rejected":
    case "archived":
    case "inactive":
    case "expired":
    case "superseded":
      return "bg-red-500/15 text-red-300 border-red-500/20";

    case "documents_collecting":
    case "intake_pending":
    case "new":
    case "not_started":
    case "needs_resubmission":
    default:
      return "bg-white/10 text-white/80 border-white/10";
  }
}

export default function StatusBadge({
  value,
  lang = "en",
}: StatusBadgeProps) {
  const labels = BADGE_LABELS[lang];
  const label =
    labels[value as keyof typeof labels] ?? value.replaceAll("_", " ");

  return (
    <span
      className={`inline-flex rounded-full border px-3 py-1 text-xs font-medium ${getBadgeClass(
        value
      )}`}
    >
      {label}
    </span>
  );
}