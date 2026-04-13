export type ServiceOption = {
  businessLine: "global_citizenship" | "uk_toc" | "uk_tob";
  label: string;
  value: string;
  country: string;
  isLegacy?: boolean;
};

const SERVICE_TYPE_LABEL_ALIASES: Record<string, string> = {
  Student: "Student Visa",
  PSW: "Graduate Visa (PSW)",
  "Student and PSW": "Student Visa / Graduate Visa (PSW)",
  "Visitor Visa": "Standard Visitor",
  "High Potential Individual": "High Potential Individual (HPI)",
  "Skilled Worker to Settlement": "Skilled Worker Route to Settlement",
  "Spouse to Settlement": "Spouse Route to Settlement",
};

export function getServiceTypeLabel(serviceType: string) {
  return SERVICE_TYPE_LABEL_ALIASES[serviceType] || serviceType;
}

export function getServiceTypeSearchValues(query: string) {
  const keyword = query.trim().toLowerCase();

  if (!keyword) {
    return [];
  }

  const matchedValues = new Set<string>();

  SERVICE_OPTIONS.forEach((item) => {
    const searchableTexts = [
      item.value,
      item.label,
      getServiceTypeLabel(item.value),
    ];

    if (searchableTexts.some((text) => text.toLowerCase().includes(keyword))) {
      matchedValues.add(item.value);
    }
  });

  return Array.from(matchedValues);
}

export const SERVICE_OPTIONS: ServiceOption[] = [
  // Global Citizenship
  {
    businessLine: "global_citizenship",
    label: "Greece Residency",
    value: "Greece Residency",
    country: "Greece",
  },
  {
    businessLine: "global_citizenship",
    label: "Portugal Fund",
    value: "Portugal Fund",
    country: "Portugal",
  },
  {
    businessLine: "global_citizenship",
    label: "Malta Residency",
    value: "Malta Residency",
    country: "Malta",
  },
  {
    businessLine: "global_citizenship",
    label: "Hungary Residency",
    value: "Hungary Residency",
    country: "Hungary",
  },
  {
    businessLine: "global_citizenship",
    label: "Japan Business Management",
    value: "Japan Business Management",
    country: "Japan",
  },
  {
    businessLine: "global_citizenship",
    label: "Turkey Citizenship",
    value: "Turkey Citizenship",
    country: "Turkey",
  },
  {
    businessLine: "global_citizenship",
    label: "UAE Golden Visa",
    value: "UAE Golden Visa",
    country: "UAE",
  },
  {
    businessLine: "global_citizenship",
    label: "Cyprus Residency",
    value: "Cyprus Residency",
    country: "Cyprus",
  },
  {
    businessLine: "global_citizenship",
    label: "Small Country Passport",
    value: "Small Country Passport",
    country: "Other",
  },

  // UK To C
  {
    businessLine: "uk_toc",
    label: "Skilled Worker",
    value: "Skilled Worker",
    country: "UK",
  },
  {
    businessLine: "uk_toc",
    label: "Innovator Founder",
    value: "Innovator Founder",
    country: "UK",
  },
  {
    businessLine: "uk_toc",
    label: "Global Talent",
    value: "Global Talent",
    country: "UK",
  },
  {
    businessLine: "uk_toc",
    label: "High Potential Individual (HPI)",
    value: "High Potential Individual (HPI)",
    country: "UK",
  },
  {
    businessLine: "uk_toc",
    label: "High Potential Individual (HPI)",
    value: "High Potential Individual",
    country: "UK",
    isLegacy: true,
  },
  {
    businessLine: "uk_toc",
    label: "Spouse Visa",
    value: "Spouse Visa",
    country: "UK",
  },
  {
    businessLine: "uk_toc",
    label: "Student Visa",
    value: "Student Visa",
    country: "UK",
  },
  {
    businessLine: "uk_toc",
    label: "Student Visa",
    value: "Student",
    country: "UK",
    isLegacy: true,
  },
  {
    businessLine: "uk_toc",
    label: "Graduate Visa (PSW)",
    value: "Graduate Visa (PSW)",
    country: "UK",
  },
  {
    businessLine: "uk_toc",
    label: "Graduate Visa (PSW)",
    value: "PSW",
    country: "UK",
    isLegacy: true,
  },
  {
    businessLine: "uk_toc",
    label: "Student Visa / Graduate Visa (PSW)",
    value: "Student and PSW",
    country: "UK",
    isLegacy: true,
  },
  {
    businessLine: "uk_toc",
    label: "Standard Visitor",
    value: "Standard Visitor",
    country: "UK",
  },
  {
    businessLine: "uk_toc",
    label: "Standard Visitor",
    value: "Visitor Visa",
    country: "UK",
    isLegacy: true,
  },
  {
    businessLine: "uk_toc",
    label: "Settlement",
    value: "Settlement",
    country: "UK",
  },
  {
    businessLine: "uk_toc",
    label: "10 Year Long Residence",
    value: "10 Year Long Residence",
    country: "UK",
  },
  {
    businessLine: "uk_toc",
    label: "Skilled Worker Route to Settlement",
    value: "Skilled Worker Route to Settlement",
    country: "UK",
  },
  {
    businessLine: "uk_toc",
    label: "Skilled Worker Route to Settlement",
    value: "Skilled Worker to Settlement",
    country: "UK",
    isLegacy: true,
  },
  {
    businessLine: "uk_toc",
    label: "Spouse Route to Settlement",
    value: "Spouse Route to Settlement",
    country: "UK",
  },
  {
    businessLine: "uk_toc",
    label: "Spouse Route to Settlement",
    value: "Spouse to Settlement",
    country: "UK",
    isLegacy: true,
  },

  // UK To B
  {
    businessLine: "uk_tob",
    label: "Sponsor License (General)",
    value: "Sponsor License (General)",
    country: "UK",
  },
  {
    businessLine: "uk_tob",
    label: "Sponsor License (Global Movement)",
    value: "Sponsor License (Global Movement)",
    country: "UK",
  },
  {
    businessLine: "uk_tob",
    label: "CoS Issue",
    value: "CoS Issue",
    country: "UK",
  },
  {
    businessLine: "uk_tob",
    label: "Compliance Audit",
    value: "Compliance Audit",
    country: "UK",
  },
  {
    businessLine: "uk_tob",
    label: "Sole Rep Extension and Settlement",
    value: "Sole Rep Extension and Settlement",
    country: "UK",
  },
  {
    businessLine: "uk_tob",
    label: "T1E Extension and Settlement",
    value: "T1E Extension and Settlement",
    country: "UK",
  },
];

export const BUSINESS_LINE_LABELS = {
  global_citizenship: "Global Citizenship",
  uk_toc: "UK To C",
  uk_tob: "UK To B",
} as const;

export const COUNTRY_OPTIONS = Array.from(
  new Set(SERVICE_OPTIONS.map((item) => item.country))
);
