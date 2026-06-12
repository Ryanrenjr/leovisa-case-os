import type {
  QuestionnaireSection,
  QuestionnaireTemplate,
} from "./templates";

type CasePersonForQuestionnaire = {
  id: string;
  role: string;
  relationship: string | null;
  fullName: string;
  sortOrder: number;
};

const sharedSectionIds = new Set([
  "family",
  "relationship",
  "children",
  "visitor_family",
  "visitor_trip",
  "visitor_finance",
  "visitor_additional",
  "referees",
  "additional",
]);

function getPersonTitle(person: CasePersonForQuestionnaire) {
  const roleLabel =
    person.role === "main_applicant"
      ? "Main Applicant"
      : person.relationship || "Dependant";

  return `${roleLabel} - ${person.fullName}`;
}

function cloneSectionForPerson(
  section: QuestionnaireSection,
  person: CasePersonForQuestionnaire
): QuestionnaireSection {
  const personTitle = getPersonTitle(person);

  return {
    ...JSON.parse(JSON.stringify(section)),
    id: `${person.id}_${section.id}`,
    titleZh: `${personTitle} - ${section.titleZh}`,
    titleEn: `${personTitle} - ${section.titleEn}`,
    descriptionZh: section.descriptionZh
      ? `${personTitle}: ${section.descriptionZh}`
      : undefined,
    descriptionEn: section.descriptionEn
      ? `${personTitle}: ${section.descriptionEn}`
      : undefined,
  };
}

function cloneSharedSection(section: QuestionnaireSection): QuestionnaireSection {
  return {
    ...JSON.parse(JSON.stringify(section)),
    id: `shared_${section.id}`,
    titleZh: `共同/家庭 - ${section.titleZh}`,
    titleEn: `Shared / Family - ${section.titleEn}`,
  };
}

export function scopeQuestionnaireTemplateToPeople(
  template: QuestionnaireTemplate,
  people: CasePersonForQuestionnaire[]
): QuestionnaireTemplate {
  const sortedPeople = [...people].sort(
    (a, b) => a.sortOrder - b.sortOrder || a.fullName.localeCompare(b.fullName)
  );

  if (sortedPeople.length <= 1) {
    return template;
  }

  const sections = template.sections.flatMap((section) => {
    if (sharedSectionIds.has(section.id)) {
      return [cloneSharedSection(section)];
    }

    return sortedPeople.map((person) => cloneSectionForPerson(section, person));
  });

  return {
    ...JSON.parse(JSON.stringify(template)),
    titleZh: `${template.titleZh}（按申请人分区）`,
    titleEn: `${template.titleEn}, grouped by applicant`,
    descriptionZh: `${template.descriptionZh} 已根据案件申请人自动分区，请分别填写主申请人和每位随行申请人的信息。`,
    descriptionEn: `${template.descriptionEn} This questionnaire has been grouped by applicant. Please complete the main applicant and each dependant separately.`,
    sections,
  };
}
