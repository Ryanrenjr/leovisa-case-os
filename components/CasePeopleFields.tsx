"use client";

import { useState } from "react";

export type CasePersonFormValue = {
  id?: string;
  relationship: string | null;
  fullName: string;
  dateOfBirth: Date | string | null;
  nationality: string | null;
  passportNumber: string | null;
  email: string | null;
  phone: string | null;
  notes: string | null;
};

type CasePeopleFieldsProps = {
  initialPeople?: CasePersonFormValue[];
  lang: "en" | "zh";
};

type DraftPerson = {
  localId: string;
  id: string;
  relationship: string;
  fullName: string;
  dateOfBirth: string;
  nationality: string;
  passportNumber: string;
  email: string;
  phone: string;
  notes: string;
};

function formatDateInput(value: Date | string | null | undefined) {
  if (!value) {
    return "";
  }

  return new Date(value).toISOString().slice(0, 10);
}

function createEmptyPerson(): DraftPerson {
  return {
    localId: `person_${Date.now()}_${Math.random().toString(36).slice(2, 8)}`,
    id: "",
    relationship: "",
    fullName: "",
    dateOfBirth: "",
    nationality: "",
    passportNumber: "",
    email: "",
    phone: "",
    notes: "",
  };
}

function toDraftPerson(person: CasePersonFormValue): DraftPerson {
  return {
    localId: person.id || `person_${Date.now()}_${Math.random().toString(36).slice(2, 8)}`,
    id: person.id || "",
    relationship: person.relationship || "",
    fullName: person.fullName || "",
    dateOfBirth: formatDateInput(person.dateOfBirth),
    nationality: person.nationality || "",
    passportNumber: person.passportNumber || "",
    email: person.email || "",
    phone: person.phone || "",
    notes: person.notes || "",
  };
}

export default function CasePeopleFields({
  initialPeople = [],
  lang,
}: CasePeopleFieldsProps) {
  const [people, setPeople] = useState<DraftPerson[]>(() =>
    initialPeople.map(toDraftPerson)
  );

  function addPerson() {
    setPeople((current) => [...current, createEmptyPerson()]);
  }

  function removePerson(localId: string) {
    setPeople((current) => current.filter((person) => person.localId !== localId));
  }

  function updatePerson(
    localId: string,
    field: keyof Omit<DraftPerson, "localId">,
    value: string
  ) {
    setPeople((current) =>
      current.map((person) =>
        person.localId === localId ? { ...person, [field]: value } : person
      )
    );
  }

  return (
    <div className="md:col-span-2">
      <div className="mb-3 flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
        <div>
          <label className="toss-label block">
            {lang === "zh" ? "Dependants / 随行申请人" : "Dependants"}
          </label>
          <p className="mt-2 text-xs leading-5 text-[#8b95a1]">
            {lang === "zh"
              ? "按人添加配偶、子女或其他随行申请人。主申请人会自动从客户信息生成。"
              : "Add spouses, children, or other dependant applicants person by person. The main applicant is generated from the client automatically."}
          </p>
        </div>
        <button
          type="button"
          onClick={addPerson}
          className="toss-secondary-button px-4 py-2 text-sm font-semibold"
        >
          {lang === "zh" ? "添加家属" : "Add Dependant"}
        </button>
      </div>

      {people.length === 0 ? (
        <div className="rounded-2xl border border-dashed border-[#dfe3e8] bg-[#fafbfc] p-4 text-sm text-[#8b95a1]">
          {lang === "zh"
            ? "暂无随行申请人。"
            : "No dependant applicants yet."}
        </div>
      ) : (
        <div className="space-y-4">
          {people.map((person, index) => (
            <div
              key={person.localId}
              className="rounded-2xl border border-[#eef1f4] bg-[#fafbfc] p-4"
            >
              <input type="hidden" name="personId" value={person.id} />
              <div className="mb-4 flex items-center justify-between gap-3">
                <p className="text-sm font-semibold text-[#191f28]">
                  {lang === "zh"
                    ? `随行申请人 ${index + 1}`
                    : `Dependant ${index + 1}`}
                </p>
                <button
                  type="button"
                  onClick={() => removePerson(person.localId)}
                  className="toss-danger-button px-3 py-2 text-xs font-semibold"
                >
                  {lang === "zh" ? "删除" : "Remove"}
                </button>
              </div>

              <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                <div>
                  <label className="toss-label mb-2 block">
                    {lang === "zh" ? "关系" : "Relationship"}
                  </label>
                  <input
                    type="text"
                    name="personRelationship"
                    value={person.relationship}
                    onChange={(event) =>
                      updatePerson(person.localId, "relationship", event.target.value)
                    }
                    className="w-full px-4 py-3"
                    placeholder={lang === "zh" ? "配偶 / 子女" : "Spouse / child"}
                  />
                </div>
                <div>
                  <label className="toss-label mb-2 block">
                    {lang === "zh" ? "姓名" : "Full Name"}
                  </label>
                  <input
                    type="text"
                    name="personFullName"
                    value={person.fullName}
                    onChange={(event) =>
                      updatePerson(person.localId, "fullName", event.target.value)
                    }
                    className="w-full px-4 py-3"
                    required
                  />
                </div>
                <div>
                  <label className="toss-label mb-2 block">
                    {lang === "zh" ? "出生日期" : "Date of Birth"}
                  </label>
                  <input
                    type="date"
                    name="personDateOfBirth"
                    value={person.dateOfBirth}
                    onChange={(event) =>
                      updatePerson(person.localId, "dateOfBirth", event.target.value)
                    }
                    className="w-full px-4 py-3"
                  />
                </div>
                <div>
                  <label className="toss-label mb-2 block">
                    {lang === "zh" ? "国籍" : "Nationality"}
                  </label>
                  <input
                    type="text"
                    name="personNationality"
                    value={person.nationality}
                    onChange={(event) =>
                      updatePerson(person.localId, "nationality", event.target.value)
                    }
                    className="w-full px-4 py-3"
                  />
                </div>
                <div>
                  <label className="toss-label mb-2 block">
                    {lang === "zh" ? "护照号" : "Passport Number"}
                  </label>
                  <input
                    type="text"
                    name="personPassportNumber"
                    value={person.passportNumber}
                    onChange={(event) =>
                      updatePerson(
                        person.localId,
                        "passportNumber",
                        event.target.value
                      )
                    }
                    className="w-full px-4 py-3"
                  />
                </div>
                <div>
                  <label className="toss-label mb-2 block">
                    {lang === "zh" ? "邮箱" : "Email"}
                  </label>
                  <input
                    type="email"
                    name="personEmail"
                    value={person.email}
                    onChange={(event) =>
                      updatePerson(person.localId, "email", event.target.value)
                    }
                    className="w-full px-4 py-3"
                  />
                </div>
                <div>
                  <label className="toss-label mb-2 block">
                    {lang === "zh" ? "电话" : "Phone"}
                  </label>
                  <input
                    type="tel"
                    name="personPhone"
                    value={person.phone}
                    onChange={(event) =>
                      updatePerson(person.localId, "phone", event.target.value)
                    }
                    className="w-full px-4 py-3"
                  />
                </div>
                <div>
                  <label className="toss-label mb-2 block">
                    {lang === "zh" ? "备注" : "Notes"}
                  </label>
                  <input
                    type="text"
                    name="personNotes"
                    value={person.notes}
                    onChange={(event) =>
                      updatePerson(person.localId, "notes", event.target.value)
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
  );
}
