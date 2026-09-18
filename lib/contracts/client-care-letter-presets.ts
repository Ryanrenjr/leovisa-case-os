const CORPORATE_SERVICE_TYPES = new Set([
  "Sponsor Licence (General)",
  "Sponsor Licence (Global Movement)",
  "CoS Issue",
  "Compliance Audit",
  "Sole Rep Extension and Settlement",
  "T1E Extension and Settlement",
]);

const CORPORATE_INSTRUCTIONS: Record<string, string[]> = {
  "Sponsor Licence (General)": [
    "Your company's application for a sponsor licence to sponsor workers under the Skilled Worker route;",
    "Your company's need for a sponsor licence in relation to the roles it intends to sponsor;",
  ],
  "Sponsor Licence (Global Movement)": [
    "Your company's application for a sponsor licence under the Global Business Mobility routes;",
    "Your company's need to sponsor eligible overseas workers for temporary assignments in the UK;",
  ],
  "CoS Issue": [
    "Your company's request for advice and assistance with assigning a Certificate of Sponsorship;",
    "The proposed sponsored role and worker's eligibility under the relevant sponsored work route;",
  ],
  "Compliance Audit": [
    "Your company's request for a sponsor compliance audit;",
    "A review of your sponsor management, right-to-work, record-keeping and reporting systems;",
  ],
  "Sole Rep Extension and Settlement": [
    "Your company's and representative's application under the Representative of an Overseas Business route;",
    "The extension or settlement requirements relevant to the sole representative and the UK branch or subsidiary;",
  ],
  "T1E Extension and Settlement": [
    "Your application for extension or settlement under the Tier 1 Entrepreneur route;",
    "The business activity, investment, job creation and residence requirements relevant to the application;",
  ],
};

const CORPORATE_CASE_SUMMARIES: Record<string, string[]> = {
  "Sponsor Licence (General)": [
    "Your company [COMPANY NAME] is a private limited company incorporated in the UK on [DATE], with company number [COMPANY NUMBER].",
    "[COMPANY NAME] is registered with Companies House and HMRC.",
    "[COMPANY NAME] has suitable HR systems to monitor sponsored workers and comply with its sponsor duties.",
    "The roles to be sponsored meet the skill, salary and genuineness requirements of the Skilled Worker route.",
  ],
  "Sponsor Licence (Global Movement)": [
    "[COMPANY NAME] is part of an overseas business group and has a UK trading presence or qualifying UK expansion plan.",
    "The overseas and UK entities have the required ownership or control relationship.",
    "[COMPANY NAME] has suitable HR systems to monitor sponsored workers and comply with its sponsor duties.",
    "The proposed assignments meet the requirements of the relevant Global Business Mobility route.",
  ],
  "CoS Issue": [
    "[COMPANY NAME] holds a valid sponsor licence under the relevant route, with licence number [LICENCE NUMBER].",
    "The proposed role is genuine and meets the applicable skill and salary requirements.",
    "The proposed worker [WORKER NAME] meets the eligibility requirements for the intended route.",
    "The company has provided the information needed to assign the Certificate of Sponsorship accurately.",
  ],
  "Compliance Audit": [
    "[COMPANY NAME] holds sponsor licence number [LICENCE NUMBER].",
    "The audit covers right-to-work checks, record keeping, reporting duties, worker monitoring and key personnel arrangements.",
    "Any compliance gaps identified during the audit will be recorded with recommended remedial actions.",
    "The company remains responsible for implementing and maintaining compliant sponsor systems.",
  ],
  "Sole Rep Extension and Settlement": [
    "[OVERSEAS COMPANY NAME] continues to have its headquarters and principal place of business outside the UK.",
    "The representative [REPRESENTATIVE NAME] remains a senior employee with authority to make operational decisions on behalf of the overseas business.",
    "The UK branch or wholly owned subsidiary has been established and is actively trading in the same type of business as the overseas company.",
    "The representative continues to meet the route's employment, ownership and residence requirements.",
  ],
  "T1E Extension and Settlement": [
    "The applicant has established, taken over or become a director of [COMPANY NAME].",
    "The required investment funds have been invested in one or more qualifying UK businesses.",
    "The business has created the required number of qualifying jobs for settled workers.",
    "The applicant meets the relevant residence, continuous residence and suitability requirements.",
  ],
};

export function isCorporateClientCareLetterService(serviceType: string) {
  return CORPORATE_SERVICE_TYPES.has(serviceType);
}

export function getDefaultInstructionBullets(serviceType: string) {
  const corporate = CORPORATE_INSTRUCTIONS[serviceType];
  if (corporate) return corporate;

  const normalized = serviceType.toLowerCase();
  if (normalized.includes("citizenship") || normalized.includes("naturalisation")) {
    return ["You want to apply for British citizenship for yourself;"];
  }

  if (normalized.includes("discretionary leave")) {
    return ["You want to apply for Discretionary Leave for yourself;"];
  }

  const applicationName =
    normalized.includes("visa") || normalized.includes("settlement")
      ? serviceType
      : `${serviceType} visa`;
  return [`You want to apply for ${applicationName} for yourself;`];
}

export function getDefaultCaseSummary(serviceType: string) {
  const corporate = CORPORATE_CASE_SUMMARIES[serviceType];
  if (corporate) return corporate.join("\n");

  const normalized = serviceType.toLowerCase();
  if (normalized.includes("skilled worker")) {
    return [
      "The company [COMPANY NAME] is a private limited company, which was incorporated in the UK on [DATE] with company number [COMPANY NUMBER].",
      "[COMPANY NAME] holds a sponsor licence, with licence number [LICENCE NUMBER].",
    ].join("\n");
  }

  if (normalized.includes("10 year") || normalized.includes("long residence")) {
    return [
      "You have been studying in the UK since [DATE].",
      "Your current visa expires on [DATE].",
      "Your visas for the last ten years have been consecutive.",
    ].join("\n");
  }

  if (normalized.includes("discretionary leave")) {
    return [
      "You currently hold or are applying for Discretionary Leave.",
      "Your application is based on [FAMILY / PRIVATE LIFE / EXCEPTIONAL CIRCUMSTANCES].",
      "Your current permission expires on [DATE].",
    ].join("\n");
  }

  if (normalized.includes("citizenship") || normalized.includes("naturalisation")) {
    return "You hold settled status or indefinite leave to remain.";
  }

  return "";
}
