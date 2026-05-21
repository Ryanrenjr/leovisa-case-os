"use client";

import { useActionState, useMemo, useState } from "react";
import { createInvoiceAction } from "./actions";

type InvoiceLine = {
  id: string;
  quantity: string;
  description: string;
  total: string;
};

type CreateInvoiceFormProps = {
  caseId: string;
  reference: string;
  clientName: string;
  visaType: string;
  defaultDate: string;
};

const initialState = {
  error: "",
};

function makeLine(clientName: string): InvoiceLine {
  return {
    id: crypto.randomUUID(),
    quantity: "1",
    description: `${clientName} service fee`,
    total: "",
  };
}

function parseAmount(value: string) {
  const parsed = Number.parseFloat(value.replace(/[^\d.-]/g, ""));
  return Number.isFinite(parsed) ? parsed : 0;
}

export default function CreateInvoiceForm({
  caseId,
  reference,
  clientName,
  visaType,
  defaultDate,
}: CreateInvoiceFormProps) {
  const [state, formAction, isPending] = useActionState(
    createInvoiceAction,
    initialState
  );
  const [lines, setLines] = useState<InvoiceLine[]>([makeLine(clientName)]);

  const subtotal = useMemo(
    () => lines.reduce((sum, line) => sum + parseAmount(line.total), 0),
    [lines]
  );

  function updateLine(id: string, field: keyof Omit<InvoiceLine, "id">, value: string) {
    setLines((current) =>
      current.map((line) =>
        line.id === id
          ? {
              ...line,
              [field]: value,
            }
          : line
      )
    );
  }

  function addLine() {
    setLines((current) => [...current, makeLine(clientName)]);
  }

  function removeLine(id: string) {
    setLines((current) =>
      current.length === 1 ? current : current.filter((line) => line.id !== id)
    );
  }

  return (
    <form action={formAction} className="space-y-8">
      <input type="hidden" name="caseId" value={caseId} />

      {!!state.error && (
        <div className="rounded-2xl border border-red-200 bg-red-50 p-4">
          <p className="text-sm font-semibold text-red-600">{state.error}</p>
        </div>
      )}

      <div className="toss-soft-card p-6">
        <h2 className="mb-4 text-[22px] font-bold text-[#191f28]">
          Basic Invoice Information
        </h2>

        <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
          <div>
            <label className="toss-label mb-3 block">Invoice Ref</label>
            <input
              type="text"
              name="invoiceRef"
              defaultValue={reference}
              className="w-full px-4 py-3"
              required
            />
          </div>

          <div>
            <label className="toss-label mb-3 block">Date</label>
            <input
              type="date"
              name="invoiceDate"
              defaultValue={defaultDate}
              className="w-full px-4 py-3"
              required
            />
          </div>

          <div>
            <label className="toss-label mb-3 block">Bill To</label>
            <input
              type="text"
              name="billTo"
              defaultValue={clientName}
              className="w-full px-4 py-3"
              required
            />
          </div>

          <div>
            <label className="toss-label mb-3 block">Instructions</label>
            <input
              type="text"
              name="instructions"
              defaultValue={`${visaType} service fee`}
              className="w-full px-4 py-3"
              required
            />
          </div>
        </div>
      </div>

      <div className="toss-soft-card p-6">
        <div className="mb-4 flex items-center justify-between gap-4">
          <h2 className="text-[22px] font-bold text-[#191f28]">Line Items</h2>
          <button
            type="button"
            onClick={addLine}
            className="toss-secondary-button px-4 py-2 text-sm font-semibold"
          >
            Add Row
          </button>
        </div>

        <div className="space-y-4">
          {lines.map((line, index) => (
            <div
              key={line.id}
              className="grid grid-cols-1 gap-4 rounded-[20px] border border-[#eef1f4] bg-white p-4 md:grid-cols-[110px_1fr_180px_auto]"
            >
              <div>
                <label className="toss-label mb-2 block">Quantity</label>
                <input
                  type="text"
                  name="quantity"
                  value={line.quantity}
                  onChange={(event) =>
                    updateLine(line.id, "quantity", event.target.value)
                  }
                  className="w-full px-4 py-3"
                />
              </div>

              <div>
                <label className="toss-label mb-2 block">Description</label>
                <input
                  type="text"
                  name="description"
                  value={line.description}
                  onChange={(event) =>
                    updateLine(line.id, "description", event.target.value)
                  }
                  className="w-full px-4 py-3"
                  required={index === 0}
                />
              </div>

              <div>
                <label className="toss-label mb-2 block">Total (GBP)</label>
                <input
                  type="text"
                  name="lineTotal"
                  value={line.total}
                  onChange={(event) =>
                    updateLine(line.id, "total", event.target.value)
                  }
                  placeholder="e.g. 1964"
                  className="w-full px-4 py-3"
                />
              </div>

              <div className="flex items-end">
                <button
                  type="button"
                  onClick={() => removeLine(line.id)}
                  disabled={lines.length === 1}
                  className="toss-danger-button px-4 py-3 text-sm font-semibold disabled:cursor-not-allowed disabled:opacity-40"
                >
                  Delete
                </button>
              </div>
            </div>
          ))}
        </div>

        <div className="mt-5 flex justify-end">
          <div className="rounded-[20px] border border-[#eef1f4] bg-[#fafbfc] px-5 py-4 text-right">
            <p className="toss-label mb-1">Subtotal / Total Due</p>
            <p className="text-[22px] font-bold text-[#191f28]">
              {"\u00a3"}
              {subtotal.toFixed(2)}
            </p>
          </div>
        </div>
      </div>

      <div className="flex items-center gap-3 pt-2">
        <button
          type="submit"
          disabled={isPending}
          className="toss-primary-button px-6 py-3 text-sm font-semibold disabled:opacity-60"
        >
          {isPending ? "Generating..." : "Generate Invoice"}
        </button>
      </div>
    </form>
  );
}
