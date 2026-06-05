"use client";

import { useEffect, useMemo, useState } from "react";

type CasePageSectionsControllerProps = {
  initialTab?: string;
  lang: "en" | "zh";
  counts: {
    documents: number;
    forms: number;
    contracts: number;
    invoices: number;
    audit: number;
  };
};

const sectionGroups = {
  overview: ["case-overview-stats", "case-status-section"],
  documents: [
    "document-checklist-section",
    "upload-links-section",
    "submissions-section",
    "documents-section",
  ],
  forms: ["questionnaires-section"],
  contracts: ["contracts-section"],
  invoices: ["invoices-section", "payment-records-section"],
  audit: ["audit-logs-section"],
} as const;

const hashToTab: Record<string, keyof typeof sectionGroups> = {
  "case-overview-stats": "overview",
  "case-status-section": "overview",
  "documents-section": "documents",
  "document-checklist-section": "documents",
  "upload-links-section": "documents",
  "submissions-section": "documents",
  "questionnaires-section": "forms",
  "contracts-section": "contracts",
  "invoices-section": "invoices",
  "payment-records-section": "invoices",
  "audit-logs-section": "audit",
};

function getTabFromHash(hash: string) {
  return hashToTab[hash.replace(/^#/, "")] ?? null;
}

function getInitialLocationTab(
  fallbackTab: string,
  validTabIds: Set<string>
) {
  if (typeof window === "undefined") {
    return validTabIds.has(fallbackTab) ? fallbackTab : "overview";
  }

  const hashTab = getTabFromHash(window.location.hash);
  const searchTab = new URLSearchParams(window.location.search).get("tab");
  const nextTab = hashTab || searchTab || fallbackTab;

  return validTabIds.has(nextTab) ? nextTab : "overview";
}

export default function CasePageSectionsController({
  initialTab = "overview",
  lang,
  counts,
}: CasePageSectionsControllerProps) {
  const tabs = useMemo(
    () => [
      { id: "overview", label: lang === "zh" ? "概览" : "Overview" },
      {
        id: "documents",
        label: lang === "zh" ? "文件" : "Documents",
        count: counts.documents,
      },
      {
        id: "forms",
        label: lang === "zh" ? "申请表" : "Forms",
        count: counts.forms,
      },
      {
        id: "contracts",
        label: lang === "zh" ? "合同" : "Contracts",
        count: counts.contracts,
      },
      { id: "invoices", label: "Invoice", count: counts.invoices },
      {
        id: "audit",
        label: lang === "zh" ? "日志" : "Audit",
        count: counts.audit,
      },
    ],
    [counts, lang]
  );
  const validTabIds = useMemo(() => new Set(tabs.map((tab) => tab.id)), [tabs]);
  const [activeTab, setActiveTab] = useState(() =>
    getInitialLocationTab(initialTab, validTabIds)
  );

  useEffect(() => {
    function applyVisibility(tabId: string) {
      Object.entries(sectionGroups).forEach(([groupId, sectionIds]) => {
        sectionIds.forEach((sectionId) => {
          const element = document.getElementById(sectionId);

          if (element) {
            element.style.display = groupId === tabId ? "" : "none";
          }
        });
      });
    }

    applyVisibility(activeTab);
  }, [activeTab]);

  useEffect(() => {
    function syncFromLocation() {
      const hashTab = getTabFromHash(window.location.hash);
      const searchTab = new URLSearchParams(window.location.search).get("tab");
      const nextTab = hashTab || searchTab || initialTab;

      if (validTabIds.has(nextTab)) {
        setActiveTab(nextTab);
      }

      if (hashTab) {
        window.setTimeout(() => {
          document
            .getElementById(window.location.hash.replace(/^#/, ""))
            ?.scrollIntoView({ behavior: "smooth", block: "start" });
        }, 50);
      }
    }

    syncFromLocation();
    window.addEventListener("hashchange", syncFromLocation);

    return () => window.removeEventListener("hashchange", syncFromLocation);
  }, [initialTab, validTabIds]);

  function selectTab(tabId: string) {
    setActiveTab(tabId);

    const url = new URL(window.location.href);
    url.searchParams.set("tab", tabId);
    url.hash = "";
    window.history.replaceState(null, "", url.toString());
    document
      .getElementById("case-workspace-tabs")
      ?.scrollIntoView({ behavior: "smooth", block: "start" });
  }

  return (
    <div id="case-workspace-tabs" className="sticky top-0 z-30 mb-8 bg-[#f7f8fa]/95 py-3 backdrop-blur">
      <div className="flex gap-2 overflow-x-auto rounded-[20px] border border-[#eef1f4] bg-white p-2 shadow-[0_8px_24px_rgba(15,23,42,0.04)]">
        {tabs.map((tab) => {
          const selected = tab.id === activeTab;

          return (
            <button
              key={tab.id}
              type="button"
              onClick={() => selectTab(tab.id)}
              className={`flex min-h-[48px] shrink-0 items-center gap-3 rounded-2xl px-4 py-2 text-sm font-bold transition ${
                selected
                  ? "bg-[#3182f6] text-white shadow-[0_8px_20px_rgba(49,130,246,0.24)]"
                  : "bg-white text-[#4e5968] hover:bg-[#f8fafc]"
              }`}
            >
              <span>{tab.label}</span>
              {typeof tab.count === "number" ? (
                <span
                  className={`rounded-full px-2 py-1 text-xs ${
                    selected
                      ? "bg-white/20 text-white"
                      : "bg-[#f2f4f6] text-[#8b95a1]"
                  }`}
                >
                  {tab.count}
                </span>
              ) : null}
            </button>
          );
        })}
      </div>
    </div>
  );
}
