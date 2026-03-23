// lib/status-options.ts

export const CASE_STATUS_OPTIONS = [
  { value: "new", en: "new", zh: "新建" },
  { value: "intake_pending", en: "intake_pending", zh: "待收集基础信息" },
  { value: "documents_collecting", en: "documents_collecting", zh: "收集材料中" },
  { value: "documents_received", en: "documents_received", zh: "材料已收到" },
  { value: "under_review", en: "under_review", zh: "审核中" },
  { value: "contract_pending", en: "contract_pending", zh: "待出合同" },
  { value: "contract_sent", en: "contract_sent", zh: "合同已发送" },
  { value: "signed", en: "signed", zh: "已签约" },
  { value: "completed", en: "completed", zh: "已完成" },
  { value: "archived", en: "archived", zh: "已归档" },
] as const;

export const CONTRACT_STATUS_OPTIONS = [
  { value: "not_started", en: "not_started", zh: "未开始" },
  { value: "generated", en: "generated", zh: "已生成" },
  { value: "sent", en: "sent", zh: "已发送" },
  { value: "signed", en: "signed", zh: "已签署" },
  { value: "superseded", en: "superseded", zh: "已替换" },
] as const;

export const INTAKE_STATUS_OPTIONS = [
  { value: "pending", en: "pending", zh: "待处理" },
  { value: "received", en: "received", zh: "已收到" },
] as const;