"use client";

import { useState } from "react";
import StatusBadge from "@/components/StatusBadge";
import ConfirmSubmitButton from "../../../../components/ConfirmSubmitButton";
import ContractSigningActions from "./ContractSigningActions";

type ContractItem = {
  id: string;
  templateName: string;
  versionNo: number;
  generatedBy: string | null;
  filePath: string | null;
  fileUrl: string | null;
  pdfPath: string | null;
  pdfUrl: string | null;
  signedPdfPath: string | null;
  signedPdfUrl: string | null;
  signProvider: string | null;
  signDeliveryMode: string | null;
  signerName: string | null;
  signerEmail: string | null;
  providerSigningUrl: string | null;
  providerDocumentStatus: string | null;
  providerRecipientStatus: string | null;
  signatureError: string | null;
  status: string;
  generatedAt: Date;
  sentAt: Date | null;
  openedAt: Date | null;
  completedAt: Date | null;
};

type ContractsSectionProps = {
  caseId: string;
  contracts: ContractItem[];
  onDeleteAction: (formData: FormData) => void;
  onSendSignatureAction: (formData: FormData) => void;
  lang: "en" | "zh";
};

export default function ContractsSection({
  caseId,
  contracts,
  onDeleteAction,
  onSendSignatureAction,
  lang,
}: ContractsSectionProps) {
  const [expanded, setExpanded] = useState(false);

  const hasMore = contracts.length > 3;
  const visibleContracts = expanded ? contracts : contracts.slice(0, 3);

  return (
    <div id="contracts-section" className="toss-card mb-8 p-8">
      <div className="mb-6 flex items-center justify-between">
        <h2 className="text-[28px] font-bold tracking-[-0.02em] text-[#191f28]">
          {lang === "zh" ? "合同" : "Contracts"}
        </h2>
        <p className="text-sm font-medium text-[#8b95a1]">
          {contracts.length} {lang === "zh" ? "份合同" : "contract(s)"}
        </p>
      </div>

      {contracts.length === 0 ? (
        <p className="text-[15px] text-[#8b95a1]">
          {lang === "zh" ? "暂无合同。" : "No contracts yet."}
        </p>
      ) : (
        <>
          <div className="space-y-4">
            {visibleContracts.map((contract) => (
              <div key={contract.id} className="toss-soft-card p-5">
                <div className="mb-5 flex items-start justify-between gap-4">
                  <div>
                    <p className="toss-label mb-2">
                      {lang === "zh" ? "模板名称" : "Template Name"}
                    </p>
                    <p className="break-all text-[16px] font-semibold text-[#191f28]">
                      {contract.templateName}
                    </p>
                  </div>

                  <div className="shrink-0 flex gap-2">
                    {contract.filePath || contract.fileUrl ? (
                      <a
                        href={`/cases/${caseId}/contracts/${contract.id}/open`}
                        target="_blank"
                        rel="noreferrer"
                        className="toss-primary-button px-4 py-2 text-sm font-semibold"
                      >
                        {lang === "zh" ? "打开原合同" : "Open Contract"}
                      </a>
                    ) : (
                      <span className="inline-flex items-center justify-center rounded-2xl border border-[#eef1f4] bg-white px-4 py-2 text-sm font-semibold text-[#c2c8cf]">
                        {lang === "zh" ? "无文件" : "No File"}
                      </span>
                    )}

                    {contract.signedPdfPath || contract.signedPdfUrl ? (
                      <a
                        href={`/cases/${caseId}/contracts/${contract.id}/signed`}
                        target="_blank"
                        rel="noreferrer"
                        className="toss-primary-button px-4 py-2 text-sm font-semibold"
                      >
                        {lang === "zh" ? "打开已签 PDF" : "Open Signed PDF"}
                      </a>
                    ) : null}

                    {contract.providerSigningUrl &&
                    contract.status !== "signed" &&
                    contract.status !== "rejected" &&
                    contract.status !== "cancelled" ? (
                      <ContractSigningActions
                        signingUrl={contract.providerSigningUrl}
                        lang={lang}
                      />
                    ) : null}

                    {!contract.providerSigningUrl && contract.status === "generated" ? (
                      <form action={onSendSignatureAction}>
                        <input type="hidden" name="caseId" value={caseId} />
                        <input
                          type="hidden"
                          name="contractId"
                          value={contract.id}
                        />
                        <button
                          type="submit"
                          className="toss-secondary-button px-4 py-2 text-sm font-semibold"
                        >
                          {lang === "zh"
                            ? "发送签署链接"
                            : "Send for Signature"}
                        </button>
                      </form>
                    ) : null}

                    <form action={onDeleteAction}>
                      <input type="hidden" name="caseId" value={caseId} />
                      <input
                        type="hidden"
                        name="contractId"
                        value={contract.id}
                      />

                      <ConfirmSubmitButton
                        label={lang === "zh" ? "删除合同" : "Delete Contract"}
                        confirmMessage={
                          lang === "zh"
                            ? "确认要删除这份合同吗？"
                            : "Are you sure you want to delete this contract?"
                        }
                        className="toss-danger-button px-4 py-2 text-sm font-semibold"
                      />
                    </form>
                  </div>
                </div>

                <div className="grid grid-cols-1 gap-4 text-sm md:grid-cols-2">
                  <div>
                    <p className="toss-label mb-2">
                      {lang === "zh" ? "版本号" : "Version"}
                    </p>
                    <p className="text-[15px] text-[#4e5968]">
                      {contract.versionNo}
                    </p>
                  </div>

                  <div>
                    <p className="toss-label mb-2">
                      {lang === "zh" ? "状态" : "Status"}
                    </p>
                    <StatusBadge value={contract.status} lang={lang} />
                  </div>

                  <div>
                    <p className="toss-label mb-2">
                      {lang === "zh" ? "生成者" : "Generated By"}
                    </p>
                    <p className="text-[15px] text-[#4e5968]">
                      {contract.generatedBy ?? "-"}
                    </p>
                  </div>

                  <div>
                    <p className="toss-label mb-2">
                      {lang === "zh" ? "生成时间" : "Generated At"}
                    </p>
                    <p className="text-[15px] text-[#4e5968]">
                      {new Date(contract.generatedAt).toLocaleString()}
                    </p>
                  </div>

                  <div>
                    <p className="toss-label mb-2">
                      {lang === "zh" ? "签署方式" : "Signing Method"}
                    </p>
                    <p className="text-[15px] text-[#4e5968]">
                      {contract.signDeliveryMode === "link"
                        ? lang === "zh"
                          ? "链接"
                          : "Link"
                        : "-"}
                    </p>
                  </div>

                  <div>
                    <p className="toss-label mb-2">
                      {lang === "zh" ? "签署人邮箱" : "Signer Email"}
                    </p>
                    <p className="text-[15px] text-[#4e5968]">
                      {contract.signerEmail ?? "-"}
                    </p>
                  </div>

                  <div>
                    <p className="toss-label mb-2">
                      {lang === "zh" ? "Documenso 文档状态" : "Documenso Status"}
                    </p>
                    <p className="text-[15px] text-[#4e5968]">
                      {contract.providerDocumentStatus ?? "-"}
                    </p>
                  </div>

                  <div>
                    <p className="toss-label mb-2">
                      {lang === "zh" ? "签署进度" : "Recipient Status"}
                    </p>
                    <p className="text-[15px] text-[#4e5968]">
                      {contract.providerRecipientStatus ?? "-"}
                    </p>
                  </div>

                  <div>
                    <p className="toss-label mb-2">
                      {lang === "zh" ? "发送时间" : "Sent At"}
                    </p>
                    <p className="text-[15px] text-[#4e5968]">
                      {contract.sentAt
                        ? new Date(contract.sentAt).toLocaleString()
                        : "-"}
                    </p>
                  </div>

                  <div>
                    <p className="toss-label mb-2">
                      {lang === "zh" ? "完成时间" : "Completed At"}
                    </p>
                    <p className="text-[15px] text-[#4e5968]">
                      {contract.completedAt
                        ? new Date(contract.completedAt).toLocaleString()
                        : "-"}
                    </p>
                  </div>
                </div>

                {contract.signatureError ? (
                  <div className="mt-5 rounded-2xl border border-[#ffd9de] bg-[#fff2f4] p-4">
                    <p className="text-sm font-medium text-[#e5484d]">
                      {contract.signatureError}
                    </p>
                  </div>
                ) : null}
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
                  ? `显示更多 (${contracts.length - 3})`
                  : `Show More (${contracts.length - 3})`}
              </button>
            </div>
          )}
        </>
      )}
    </div>
  );
}
