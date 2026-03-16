"use client";

import Link from "next/link";
import { useMemo, useState } from "react";
import { createCase } from "./actions";

type Client = {
  id: string;
  chineseName: string;
  englishName: string;
};

type Consultant = {
  id: string;
  name: string;
};

type NewCaseFormProps = {
  clients: Client[];
  consultants: Consultant[];
  preselectedClientId?: string;
};

export default function NewCaseForm({
  clients,
  consultants,
  preselectedClientId = "",
}: NewCaseFormProps) {
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
    <main className="min-h-screen p-8">
      <div className="mb-6">
        <Link
          href="/cases"
          className="text-sm text-white/70 underline underline-offset-4"
        >
          ← Back to Cases
        </Link>
      </div>

      <div className="max-w-3xl rounded-2xl border border-white/10 bg-white/5 p-8">
        <h1 className="text-4xl font-bold mb-8">Create Case</h1>

        <form action={createCase} className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="md:col-span-2">
              <label className="block text-sm text-white/70 mb-2">
                Client Search
              </label>
              <input
                type="text"
                value={clientKeyword}
                onChange={(e) => setClientKeyword(e.target.value)}
                className="w-full rounded-lg border border-white/10 bg-black/30 px-4 py-3 outline-none mb-3"
                placeholder="Search by Chinese or English name"
              />

              <label className="block text-sm text-white/70 mb-2">Client</label>
              <select
                name="clientId"
                defaultValue={preselectedClientId}
                className="w-full rounded-lg border border-white/10 bg-black/30 px-4 py-3 outline-none"
              >
                <option value="" disabled>
                  Select client
                </option>
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

            <div>
              <label className="block text-sm text-white/70 mb-2">
                Service Type
              </label>
              <select
                name="serviceType"
                defaultValue=""
                className="w-full rounded-lg border border-white/10 bg-black/30 px-4 py-3 outline-none"
              >
                <option value="" disabled>
                  Select service type
                </option>
                <option value="UK Visa">UK Visa</option>
                <option value="UK Visitor Visa">UK Visitor Visa</option>
                <option value="Spain Golden Visa">Spain Golden Visa</option>
              </select>
            </div>

            <div>
              <label className="block text-sm text-white/70 mb-2">Country</label>
              <select
                name="country"
                defaultValue=""
                className="w-full rounded-lg border border-white/10 bg-black/30 px-4 py-3 outline-none"
              >
                <option value="" disabled>
                  Select country
                </option>
                <option value="UK">UK</option>
                <option value="Spain">Spain</option>
              </select>
            </div>

            <div>
              <label className="block text-sm text-white/70 mb-2">
                Consultant
              </label>
              <select
                name="assignedConsultantId"
                defaultValue=""
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
              <label className="block text-sm text-white/70 mb-2">Status</label>
              <select
                name="status"
                defaultValue="new"
                className="w-full rounded-lg border border-white/10 bg-black/30 px-4 py-3 outline-none"
              >
                <option value="new">new</option>
                <option value="intake_pending">intake_pending</option>
                <option value="documents_collecting">
                  documents_collecting
                </option>
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
                defaultValue="not_started"
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
                defaultValue="pending"
                className="w-full rounded-lg border border-white/10 bg-black/30 px-4 py-3 outline-none"
              >
                <option value="pending">pending</option>
                <option value="received">received</option>
              </select>
            </div>

            <div className="md:col-span-2">
              <label className="block text-sm text-white/70 mb-2">Notes</label>
              <textarea
                name="notes"
                rows={4}
                className="w-full rounded-lg border border-white/10 bg-black/30 px-4 py-3 outline-none"
                placeholder="Case notes..."
              />
            </div>
          </div>

          <div className="pt-4">
            <button
              type="submit"
              className="rounded-lg bg-white text-black px-6 py-3 font-medium"
            >
              Create Case
            </button>
          </div>
        </form>
      </div>
    </main>
  );
}
