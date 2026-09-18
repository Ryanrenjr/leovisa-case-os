"use client";

import { useActionState, useState } from "react";
import { createClientCareLetterAction } from "./actions";
import {
  getDefaultCaseSummary,
  getDefaultInstructionBullets,
} from "../../../../../../lib/contracts/client-care-letter-presets";

type CreateContractFormProps = {
  caseId: string;
  reference: string;
  clientName: string;
  visaType: string;
  isCorporate: boolean;
  nationality: string;
  applicationLocation: string;
  defaultDate: string;
};

type Dependant = {
  id: string;
  type: string;
  relationship: string;
  name: string;
  nationality: string;
  dateOfBirth: string;
  passport: string;
};

const initialState = {
  error: "",
};

function createDependant(): Dependant {
  return {
    id: crypto.randomUUID(),
    type: "Dependant visa",
    relationship: "",
    name: "",
    nationality: "",
    dateOfBirth: "",
    passport: "",
  };
}

export default function CreateContractForm({
  caseId,
  reference,
  clientName,
  visaType,
  isCorporate,
  nationality,
  applicationLocation,
  defaultDate,
}: CreateContractFormProps) {
  const [state, formAction, isPending] = useActionState(
    createClientCareLetterAction,
    initialState
  );
  const [dependants, setDependants] = useState<Dependant[]>([]);

  function updateDependant(
    id: string,
    field: keyof Omit<Dependant, "id">,
    value: string
  ) {
    setDependants((current) =>
      current.map((dependant) =>
        dependant.id === id ? { ...dependant, [field]: value } : dependant
      )
    );
  }

  function addDependant() {
    setDependants((current) => [...current, createDependant()]);
  }

  function removeDependant(id: string) {
    setDependants((current) =>
      current.filter((dependant) => dependant.id !== id)
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
        <h2 className="mb-4 text-[22px] font-bold tracking-[-0.02em] text-[#191f28]">
          Basic Contract Information
        </h2>

        <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
          <div>
            <label className="toss-label mb-3 block">Reference</label>
            <input
              type="text"
              name="caseRef"
              defaultValue={reference}
              className="w-full px-4 py-3"
            />
            <p className="mt-2 text-xs font-medium text-[#8b95a1]">
              Used in the contract content and generated file name.
            </p>
          </div>

          <div>
            <label className="toss-label mb-3 block">
              {isCorporate ? "Company Name" : "Client Name"}
            </label>
            <input
              type="text"
              value={clientName}
              readOnly
              className="w-full px-4 py-3 bg-[#f8fafc]"
            />
          </div>

          {isCorporate && (
            <>
              <div>
                <label className="toss-label mb-3 block">
                  Company Representative
                </label>
                <input
                  type="text"
                  name="companyRepresentative"
                  placeholder="Full name of the authorised representative"
                  className="w-full px-4 py-3"
                  required
                />
              </div>

              <div>
                <label className="toss-label mb-3 block">
                  Company Incorporation Date
                </label>
                <input
                  type="date"
                  name="companyIncorporationDate"
                  className="w-full px-4 py-3"
                  required
                />
              </div>

              <div>
                <label className="toss-label mb-3 block">Company Number</label>
                <input
                  type="text"
                  name="companyNumber"
                  className="w-full px-4 py-3"
                  required
                />
              </div>
            </>
          )}

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
            <label className="toss-label mb-3 block">
              {isCorporate ? "Service Type" : "Visa Type"}
            </label>
            <input
              type="text"
              value={visaType}
              readOnly
              className="w-full px-4 py-3 bg-[#f8fafc]"
            />
          </div>

          {!isCorporate && (
            <div>
            <label className="toss-label mb-3 block">Application Location</label>
            <select
              name="applicationLocation"
              defaultValue={applicationLocation}
              className="w-full px-4 py-3"
            >
              <option value="outside UK">Outside UK</option>
              <option value="inside UK">Inside UK</option>
            </select>
            </div>
          )}

          {!isCorporate && (
            <div>
            <label className="toss-label mb-3 block">Nationality</label>
            <input
              type="text"
              name="nationality"
              defaultValue={nationality}
              className="w-full px-4 py-3"
            />
            </div>
          )}

          {!isCorporate && (
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
          )}

          {!isCorporate && (
            <div>
            <label className="toss-label mb-3 block">Passport Number</label>
            <input
              type="text"
              name="passport"
              className="w-full px-4 py-3"
              required
            />
            </div>
          )}

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

      {!isCorporate && (
        <div className="toss-soft-card p-6">
        <div className="mb-4 flex items-center justify-between gap-4">
          <h2 className="text-[22px] font-bold tracking-[-0.02em] text-[#191f28]">
            Dependants
          </h2>
          <button
            type="button"
            onClick={addDependant}
            className="toss-secondary-button px-4 py-2 text-sm font-semibold"
          >
            + Add Dependant
          </button>
        </div>

        {dependants.length === 0 ? (
          <p className="text-[15px] text-[#8b95a1]">
            Add dependant applicants if they should appear in the contract
            instructions.
          </p>
        ) : (
          <div className="space-y-4">
            {dependants.map((dependant, index) => (
              <div
                key={dependant.id}
                className="rounded-[20px] border border-[#eef1f4] bg-white p-4"
              >
                <div className="mb-4 flex items-center justify-between gap-3">
                  <p className="text-[16px] font-bold text-[#191f28]">
                    Dependant {index + 1}
                  </p>
                  <button
                    type="button"
                    onClick={() => removeDependant(dependant.id)}
                    className="toss-danger-button px-4 py-2 text-sm font-semibold"
                  >
                    Delete
                  </button>
                </div>

                <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                  <div>
                    <label className="toss-label mb-2 block">Application Type</label>
                    <input
                      type="text"
                      name="dependantType"
                      value={dependant.type}
                      onChange={(event) =>
                        updateDependant(dependant.id, "type", event.target.value)
                      }
                      className="w-full px-4 py-3"
                    />
                  </div>

                  <div>
                    <label className="toss-label mb-2 block">Relationship</label>
                    <input
                      type="text"
                      name="dependantRelationship"
                      value={dependant.relationship}
                      onChange={(event) =>
                        updateDependant(
                          dependant.id,
                          "relationship",
                          event.target.value
                        )
                      }
                      placeholder="e.g. daughter, spouse"
                      className="w-full px-4 py-3"
                    />
                  </div>

                  <div>
                    <label className="toss-label mb-2 block">Name</label>
                    <input
                      type="text"
                      name="dependantName"
                      value={dependant.name}
                      onChange={(event) =>
                        updateDependant(dependant.id, "name", event.target.value)
                      }
                      className="w-full px-4 py-3"
                    />
                  </div>

                  <div>
                    <label className="toss-label mb-2 block">Nationality</label>
                    <input
                      type="text"
                      name="dependantNationality"
                      value={dependant.nationality}
                      onChange={(event) =>
                        updateDependant(
                          dependant.id,
                          "nationality",
                          event.target.value
                        )
                      }
                      className="w-full px-4 py-3"
                    />
                  </div>

                  <div>
                    <label className="toss-label mb-2 block">Date of Birth</label>
                    <input
                      type="text"
                      name="dependantDateOfBirth"
                      value={dependant.dateOfBirth}
                      onChange={(event) =>
                        updateDependant(
                          dependant.id,
                          "dateOfBirth",
                          event.target.value
                        )
                      }
                      placeholder="e.g. 04/05/2023"
                      className="w-full px-4 py-3"
                    />
                  </div>

                  <div>
                    <label className="toss-label mb-2 block">Passport Number</label>
                    <input
                      type="text"
                      name="dependantPassport"
                      value={dependant.passport}
                      onChange={(event) =>
                        updateDependant(
                          dependant.id,
                          "passport",
                          event.target.value
                        )
                      }
                      className="w-full px-4 py-3"
                    />
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
        </div>
      )}

      <div className="toss-soft-card p-6">
        <h2 className="mb-4 text-[22px] font-bold tracking-[-0.02em] text-[#191f28]">
          Instructions
        </h2>
        <textarea
          name="instructions"
          rows={5}
          className="w-full px-4 py-3"
          defaultValue={getDefaultInstructionBullets(visaType).join("\n")}
          placeholder="Enter one instruction per line..."
          required
        />
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
            defaultValue={getDefaultCaseSummary(visaType)}
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
