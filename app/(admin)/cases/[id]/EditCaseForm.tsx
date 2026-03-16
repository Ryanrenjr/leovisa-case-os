"use client";

import Link from "next/link";
import { useMemo, useState } from "react";
import { updateCase } from "./actions";
import { SERVICE_OPTIONS, BUSINESS_LINE_LABELS } from "../../../../lib/service-options";

type Client = {
  id: string;
  chineseName: string;
  englishName: string;
};

type Consultant = {
  id: string;
  name: string;
};

type CaseItem = {
  id: string;
  clientId: string;
  serviceType: string;
  country: string;
  assignedConsultantId: string | null;
  status: string;
  contractStatus: string;
  intakeStatus: string;
  notes: string | null;
};

type EditCaseFormProps = {
  caseItem: CaseItem;
  clients: Client[];
  consultants: Consultant[];
};

export default function EditCaseForm({
  caseItem,
  clients,
  consultants,
}: EditCaseFormProps) {
  const [clientKeyword, setClientKeyword] = useState("");

  const filteredClients = useMemo(() => {
    const keyword = clientKeyword.trim().toLowerCase();

    if (!keyword) return clients;

    return clients.filter((client) => {
      return (
        client.chineseName.toLowerCase().includes(keyword) ||
        client.englishName.toLowerCase().includes(keyword)
      );
    });
  }, [clientKeyword, clients]);

  return (
    <main className="min-h-screen bg-black text-white p-8">
      <div className="mb-6">
        <Link
          href={`/cases/${caseItem.id}`}
          className="inline-block text-sm text-white/70 underline underline-offset-4"
        >
          ← Back to Case
        </Link>
      </div>

      <div className="max-w-5xl rounded-2xl border border-white/10 bg-white/5 p-8">
        <div className="mb-8">
          <h1 className="text-4xl font-bold mb-3">Edit Case</h1>
          <p className="text-white/60">
            Update case information in LeoVisa Case OS.
          </p>
        </div>

        <form action={updateCase} className="space-y-8">
          <input type="hidden" name="caseId" value={caseItem.id} />

          <div className="rounded-xl border border-white/10 bg-black/30 p-6">
            <h2 className="text-xl font-semibold mb-4">Client Selection</h2>

            <div className="space-y-4">
              <div>
                <label className="block text-sm text-white/70 mb-2">
                  Client Search
                </label>
                <input
                  type="text"
                  value={clientKeyword}
                  onChange={(e) => setClientKeyword(e.target.value)}
                  className="w-full rounded-lg border border-white/10 bg-black/30 px-4 py-3 outline-none"
                  placeholder="Search by Chinese or English name"
                />
              </div>

              <div>
                <label className="block text-sm text-white/70 mb-2">
                  Client
                </label>
                <select
                  name="clientId"
                  defaultValue={caseItem.clientId}
                  className="w-full rounded-lg border border-white/10 bg-black/30 px-4 py-3 outline-none"
                >
                  {filteredClients.map((client) => (
                    <option key={client.id} value={client.id}>
                      {client.chineseName} / {client.englishName}
                    </option>
                  ))}
                </select>

                <p className="text-xs text-white/50 mt-2">
                  {filteredClients.length} client(s) found
                </p>
              </div>
            </div>
          </div>

          <div className="rounded-xl border border-white/10 bg-black/30 p-6">
            <h2 className="text-xl font-semibold mb-4">Case Information</h2>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm text-white/70 mb-2">
                  Service Type
                </label>
                <select
  name="serviceType"
  defaultValue={caseItem.serviceType}
  className="w-full rounded-lg border border-white/10 bg-black/30 px-4 py-3 outline-none"
>
  {Object.entries(BUSINESS_LINE_LABELS).map(([businessLine, businessLabel]) => (
    <optgroup key={businessLine} label={businessLabel}>
      {SERVICE_OPTIONS.filter(
        (item) => item.businessLine === businessLine
      ).map((item) => (
        <option key={item.value} value={item.value}>
          {item.label}
        </option>
      ))}
    </optgroup>
  ))}
</select>
              </div>

              <div>
                <label className="block text-sm text-white/70 mb-2">
                  Country
                </label>
                <select
  name="country"
  defaultValue={caseItem.country}
  className="w-full rounded-lg border border-white/10 bg-black/30 px-4 py-3 outline-none"
>
  <option value="Greece">Greece</option>
  <option value="Portugal">Portugal</option>
  <option value="Malta">Malta</option>
  <option value="Hungary">Hungary</option>
  <option value="Japan">Japan</option>
  <option value="Turkey">Turkey</option>
  <option value="UAE">UAE</option>
  <option value="Cyprus">Cyprus</option>
  <option value="UK">UK</option>
  <option value="Other">Other</option>
</select>
              </div>

              <div>
                <label className="block text-sm text-white/70 mb-2">
                  Consultant
                </label>
                <select
                  name="assignedConsultantId"
                  defaultValue={caseItem.assignedConsultantId ?? ""}
                  className="w-full rounded-lg border border-white/10 bg-black/30 px-4 py-3 outline-none"
                >
                  <option value="">Unassigned</option>
                  {consultants.map((consultant) => (
                    <option key={consultant.id} value={consultant.id}>
                      {consultant.name}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm text-white/70 mb-2">
                  Status
                </label>
                <select
                  name="status"
                  defaultValue={caseItem.status}
                  className="w-full rounded-lg border border-white/10 bg-black/30 px-4 py-3 outline-none"
                >
                  <option value="new">new</option>
                  <option value="intake_pending">intake_pending</option>
                  <option value="documents_collecting">documents_collecting</option>
                  <option value="documents_received">documents_received</option>
                  <option value="under_review">under_review</option>
                  <option value="contract_pending">contract_pending</option>
                  <option value="contract_sent">contract_sent</option>
                  <option value="signed">signed</option>
                  <option value="completed">completed</option>
                  <option value="archived">archived</option>
                </select>
              </div>

              <div>
                <label className="block text-sm text-white/70 mb-2">
                  Contract Status
                </label>
                <select
                  name="contractStatus"
                  defaultValue={caseItem.contractStatus}
                  className="w-full rounded-lg border border-white/10 bg-black/30 px-4 py-3 outline-none"
                >
                  <option value="not_started">not_started</option>
                  <option value="generated">generated</option>
                  <option value="sent">sent</option>
                  <option value="signed">signed</option>
                  <option value="superseded">superseded</option>
                </select>
              </div>

              <div>
                <label className="block text-sm text-white/70 mb-2">
                  Intake Status
                </label>
                <select
                  name="intakeStatus"
                  defaultValue={caseItem.intakeStatus}
                  className="w-full rounded-lg border border-white/10 bg-black/30 px-4 py-3 outline-none"
                >
                  <option value="pending">pending</option>
                  <option value="received">received</option>
                </select>
              </div>

              <div className="md:col-span-2">
                <label className="block text-sm text-white/70 mb-2">
                  Notes
                </label>
                <textarea
                  name="notes"
                  rows={5}
                  defaultValue={caseItem.notes ?? ""}
                  className="w-full rounded-lg border border-white/10 bg-black/30 px-4 py-3 outline-none"
                  placeholder="Case notes..."
                />
              </div>
            </div>
          </div>

          <div className="flex items-center gap-3 pt-2">
            <button
              type="submit"
              className="rounded-lg bg-white text-black px-6 py-3 font-medium"
            >
              Save Changes
            </button>

            <Link
              href={`/cases/${caseItem.id}`}
              className="rounded-lg border border-white/10 px-6 py-3 text-white/80 hover:bg-white/10"
            >
              Cancel
            </Link>
          </div>
        </form>
      </div>
    </main>
  );
}