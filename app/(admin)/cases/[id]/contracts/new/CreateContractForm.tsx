"use client";

import { useActionState } from "react";
import { createClientCareLetterAction } from "./actions";

type CreateContractFormProps = {
  caseId: string;
  caseCode: string;
  clientName: string;
  visaType: string;
  nationality: string;
  defaultDate: string;
};

const initialState = {
  error: "",
};

export default function CreateContractForm({
  caseId,
  caseCode,
  clientName,
  visaType,
  nationality,
  defaultDate,
}: CreateContractFormProps) {
  const [state, formAction, isPending] = useActionState(
    createClientCareLetterAction,
    initialState
  );

  return (
    <form action={formAction} className="space-y-8">
      <input type="hidden" name="caseId" value={caseId} />

      {!!state.error && (
        <div className="rounded-2xl border border-red-200 bg-red-50 p-4">
          <p className="text-sm font-semibold text-red-600">{state.error}</p>
        </div>
      )}

      <div className="toss-soft-card p-6">
        <h2 className="mb-4 text-[22px] font-bold tracking-[-0.02em] text-[#191f28]">
          Basic Contract Information
        </h2>

        <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
          <div>
            <label className="toss-label mb-3 block">Case Ref</label>
            <input
              type="text"
              value={caseCode}
              readOnly
              className="w-full px-4 py-3 bg-[#f8fafc]"
            />
          </div>

          <div>
            <label className="toss-label mb-3 block">Client Name</label>
            <input
              type="text"
              value={clientName}
              readOnly
              className="w-full px-4 py-3 bg-[#f8fafc]"
            />
          </div>

          <div>
            <label className="toss-label mb-3 block">Date</label>
            <input
              type="date"
              name="date"
              defaultValue={defaultDate}
              className="w-full px-4 py-3"
              required
            />
          </div>

          <div>
            <label className="toss-label mb-3 block">Visa Type</label>
            <input
              type="text"
              value={visaType}
              readOnly
              className="w-full px-4 py-3 bg-[#f8fafc]"
            />
          </div>

          <div>
            <label className="toss-label mb-3 block">Nationality</label>
            <input
              type="text"
              value={nationality}
              readOnly
              className="w-full px-4 py-3 bg-[#f8fafc]"
            />
          </div>

          <div>
            <label className="toss-label mb-3 block">Date of Birth</label>
            <input
              type="text"
              name="dateOfBirth"
              placeholder="e.g. 15 January 2003"
              className="w-full px-4 py-3"
              required
            />
          </div>

          <div>
            <label className="toss-label mb-3 block">Passport Number</label>
            <input
              type="text"
              name="passport"
              className="w-full px-4 py-3"
              required
            />
          </div>

          <div>
            <label className="toss-label mb-3 block">Total Fee (£)</label>
            <input
              type="text"
              name="totalFee"
              className="w-full px-4 py-3"
              required
            />
          </div>

          <div>
            <label className="toss-label mb-3 block">Deposit (£)</label>
            <input
              type="text"
              name="deposit"
              className="w-full px-4 py-3"
              required
            />
          </div>

          <div>
            <label className="toss-label mb-3 block">Balance (£)</label>
            <input
              type="text"
              name="balance"
              className="w-full px-4 py-3"
              required
            />
          </div>
        </div>
      </div>

      <div className="toss-soft-card p-6">
        <h2 className="mb-4 text-[22px] font-bold tracking-[-0.02em] text-[#191f28]">
          Case Summary
        </h2>

        <div>
          <label className="toss-label mb-3 block">
            Key elements of your case
          </label>
          <textarea
            name="caseSummary"
            rows={8}
            className="w-full px-4 py-3"
            placeholder="Write the key elements of the case here..."
          />
        </div>
      </div>

      <div className="flex items-center gap-3 pt-2">
        <button
          type="submit"
          disabled={isPending}
          className="toss-primary-button px-6 py-3 text-sm font-semibold disabled:opacity-60"
        >
          {isPending ? "Generating..." : "Generate Contract"}
        </button>
      </div>
    </form>
  );
}