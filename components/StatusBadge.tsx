type StatusBadgeProps = {
  value: string | null | undefined;
};

function getStatusClasses(value: string) {
  const normalized = value.toLowerCase();

  if (
    [
      "active",
      "completed",
      "signed",
      "generated",
      "received",
      "uploaded",
    ].includes(normalized)
  ) {
    return "bg-green-500/15 text-green-300 border-green-500/20";
  }

  if (
    [
      "under_review",
      "contract_pending",
      "intake_pending",
      "sent",
      "pending",
    ].includes(normalized)
  ) {
    return "bg-yellow-500/15 text-yellow-300 border-yellow-500/20";
  }

  if (
    [
      "documents_received",
      "submitted",
      "new",
      "documents_collecting",
    ].includes(normalized)
  ) {
    return "bg-blue-500/15 text-blue-300 border-blue-500/20";
  }

  if (
    [
      "inactive",
      "archived",
      "not_started",
      "superseded",
    ].includes(normalized)
  ) {
    return "bg-white/10 text-white/60 border-white/10";
  }

  return "bg-white/10 text-white/80 border-white/10";
}

export default function StatusBadge({ value }: StatusBadgeProps) {
  const text = value ?? "-";
  const classes = getStatusClasses(text);

  return (
    <span
      className={`inline-flex items-center rounded-full border px-3 py-1 text-xs font-medium ${classes}`}
    >
      {text}
    </span>
  );
}