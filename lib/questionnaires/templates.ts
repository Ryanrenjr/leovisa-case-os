export type QuestionnaireFieldType =
  | "text"
  | "email"
  | "tel"
  | "date"
  | "month"
  | "textarea"
  | "boolean"
  | "select"
  | "repeater";

export type QuestionnaireFieldOption = {
  value: string;
  labelZh: string;
  labelEn: string;
};

export type QuestionnaireField = {
  id: string;
  type: QuestionnaireFieldType;
  labelZh: string;
  labelEn: string;
  helperZh?: string;
  helperEn?: string;
  required?: boolean;
  options?: QuestionnaireFieldOption[];
  fields?: QuestionnaireField[];
};

export type QuestionnaireSection = {
  id: string;
  titleZh: string;
  titleEn: string;
  descriptionZh?: string;
  descriptionEn?: string;
  fields: QuestionnaireField[];
};

export type QuestionnaireTemplate = {
  key: string;
  titleZh: string;
  titleEn: string;
  descriptionZh: string;
  descriptionEn: string;
  sections: QuestionnaireSection[];
};

const yesNoOptions: QuestionnaireFieldOption[] = [
  { value: "yes", labelZh: "是", labelEn: "Yes" },
  { value: "no", labelZh: "否", labelEn: "No" },
];

const ownershipOptions: QuestionnaireFieldOption[] = [
  { value: "rent", labelZh: "租用", labelEn: "Rent" },
  { value: "own", labelZh: "自有", labelEn: "Own" },
  { value: "family_or_friend", labelZh: "亲友住所", labelEn: "Family or friend" },
  { value: "hotel", labelZh: "酒店/临时住所", labelEn: "Hotel or temporary" },
  { value: "other", labelZh: "其他", labelEn: "Other" },
];

const contactFields: QuestionnaireField[] = [
  {
    id: "phone",
    type: "tel",
    labelZh: "电话号码",
    labelEn: "Phone number",
    required: true,
  },
  {
    id: "email",
    type: "email",
    labelZh: "邮箱",
    labelEn: "Email",
  },
  {
    id: "niNumber",
    type: "text",
    labelZh: "NI number（如有）",
    labelEn: "NI number, if any",
  },
];

const previousNameFields: QuestionnaireField[] = [
  {
    id: "hasPreviousNames",
    type: "select",
    labelZh: "是否有曾用名或用过其他名字？",
    labelEn: "Have you ever used any other names?",
    options: yesNoOptions,
    required: true,
  },
  {
    id: "previousNames",
    type: "textarea",
    labelZh: "如有，请列出曾用名",
    labelEn: "If yes, list the other names",
  },
];

const addressHistoryField: QuestionnaireField = {
  id: "addressHistory",
  type: "repeater",
  labelZh: "地址记录",
  labelEn: "Address history",
  helperZh: "请填写近 2 年所有地址；如适用，填写搬入和搬出年月。",
  helperEn: "Add all addresses in the last 2 years, including move-in and move-out months where applicable.",
  required: true,
  fields: [
    {
      id: "address",
      type: "textarea",
      labelZh: "详细地址",
      labelEn: "Full address",
      required: true,
    },
    {
      id: "moveIn",
      type: "month",
      labelZh: "搬入时间",
      labelEn: "Move-in month",
      required: true,
    },
    {
      id: "moveOut",
      type: "month",
      labelZh: "搬出时间（仍居住可留空）",
      labelEn: "Move-out month, leave blank if current",
    },
    {
      id: "ownership",
      type: "select",
      labelZh: "住所性质",
      labelEn: "Accommodation type",
      options: ownershipOptions,
    },
    {
      id: "monthlyCost",
      type: "text",
      labelZh: "每月房租或 mortgage 金额",
      labelEn: "Monthly rent or mortgage amount",
    },
  ],
};

const ukTravelHistoryField: QuestionnaireField = {
  id: "ukTravelHistory",
  type: "repeater",
  labelZh: "过去 10 年英国旅行/出入境记录",
  labelEn: "UK travel history in the last 10 years",
  helperZh: "请尽量精确到年月日，并说明入境原因。",
  helperEn: "Use exact dates where possible and include the reason for travel.",
  fields: [
    { id: "entryDate", type: "date", labelZh: "入境英国日期", labelEn: "UK entry date" },
    { id: "exitDate", type: "date", labelZh: "离开英国日期", labelEn: "UK exit date" },
    { id: "reason", type: "text", labelZh: "原因", labelEn: "Reason" },
  ],
};

const worldTravelHistoryField: QuestionnaireField = {
  id: "worldTravelHistory",
  type: "repeater",
  labelZh: "过去 10 年世界旅行记录",
  labelEn: "World travel history in the last 10 years",
  helperZh: "请填写国家、出入境日期和原因，例如工作、学习、中转或旅游。",
  helperEn: "Add country, dates, and reason, such as work, study, transit, or tourism.",
  fields: [
    { id: "country", type: "text", labelZh: "国家/地区", labelEn: "Country or region" },
    { id: "entryDate", type: "date", labelZh: "入境日期", labelEn: "Entry date" },
    { id: "exitDate", type: "date", labelZh: "离境日期", labelEn: "Exit date" },
    { id: "reason", type: "text", labelZh: "原因", labelEn: "Reason" },
  ],
};

const parentDetailsField: QuestionnaireField = {
  id: "parents",
  type: "repeater",
  labelZh: "父母信息",
  labelEn: "Parent details",
  helperZh: "请分别填写父亲和母亲的信息。",
  helperEn: "Add details for each parent.",
  fields: [
    { id: "relationship", type: "text", labelZh: "关系", labelEn: "Relationship" },
    { id: "fullName", type: "text", labelZh: "姓名", labelEn: "Full name" },
    { id: "dateOfBirth", type: "date", labelZh: "出生日期", labelEn: "Date of birth" },
    { id: "nationality", type: "text", labelZh: "国籍", labelEn: "Nationality" },
    {
      id: "changedNationality",
      type: "select",
      labelZh: "是否更换过国籍",
      labelEn: "Changed nationality?",
      options: yesNoOptions,
    },
  ],
};

const visaAndCharacterFields: QuestionnaireField[] = [
  {
    id: "currentUkVisa",
    type: "textarea",
    labelZh: "现在是否持有英国签证？如有请提供签证类型和有效期",
    labelEn: "Do you currently hold a UK visa? If yes, provide type and validity",
  },
  {
    id: "previousUkVisas",
    type: "textarea",
    labelZh: "之前所有英国签证类型及起止时间",
    labelEn: "Previous UK visa types and validity dates",
  },
  {
    id: "hasVisaRefusals",
    type: "select",
    labelZh: "是否有过被任何国家拒签的经历？",
    labelEn: "Have you ever been refused a visa by any country?",
    options: yesNoOptions,
    required: true,
  },
  {
    id: "visaRefusalDetails",
    type: "textarea",
    labelZh: "如有拒签，请说明国家、日期、原因",
    labelEn: "If yes, provide country, date, and reason",
  },
  {
    id: "hasCriminalOrTrafficOffence",
    type: "select",
    labelZh: "是否有任何犯罪或交通肇事/违章记录？",
    labelEn: "Any criminal, traffic, or driving offences?",
    options: yesNoOptions,
    required: true,
  },
  {
    id: "criminalOrTrafficDetails",
    type: "textarea",
    labelZh: "如有，请提供详细信息",
    labelEn: "If yes, provide details",
  },
];

function commonSections(options?: {
  includeEnglish?: boolean;
  includeLifeInUk?: boolean;
  includeChinaTies?: boolean;
  includeFutureUkAddress?: boolean;
}) {
  const sections: QuestionnaireSection[] = [
    {
      id: "personal",
      titleZh: "基本信息",
      titleEn: "Personal Details",
      fields: [...contactFields, ...previousNameFields],
    },
    {
      id: "addresses",
      titleZh: "地址信息",
      titleEn: "Address Details",
      fields: [
        addressHistoryField,
        ...(options?.includeFutureUkAddress
          ? [
              {
                id: "futureUkAddress",
                type: "textarea" as const,
                labelZh: "计划抵英后的英国住址；如有酒店、朋友家等其他住址也请列出",
                labelEn: "Planned UK address after arrival, including hotels or friends' addresses if applicable",
              },
              {
                id: "plannedUkEntryDate",
                type: "date" as const,
                labelZh: "计划入境英国日期",
                labelEn: "Planned UK entry date",
              },
            ]
          : []),
      ],
    },
    {
      id: "visa_travel_character",
      titleZh: "签证、旅行与背景记录",
      titleEn: "Visa, Travel, and Background",
      fields: [...visaAndCharacterFields, ukTravelHistoryField, worldTravelHistoryField],
    },
    {
      id: "family",
      titleZh: "家庭成员",
      titleEn: "Family Details",
      fields: [
        parentDetailsField,
        {
          id: "ukFamilyMembers",
          type: "repeater",
          labelZh: "在英国的其他家人（如有）",
          labelEn: "Other family members in the UK, if any",
          fields: [
            { id: "fullName", type: "text", labelZh: "姓名", labelEn: "Full name" },
            { id: "relationship", type: "text", labelZh: "关系", labelEn: "Relationship" },
            { id: "nationality", type: "text", labelZh: "国籍", labelEn: "Nationality" },
            { id: "visaType", type: "text", labelZh: "签证类型", labelEn: "Visa type" },
          ],
        },
      ],
    },
  ];

  if (options?.includeEnglish || options?.includeLifeInUk || options?.includeChinaTies) {
    sections.push({
      id: "eligibility",
      titleZh: "资格与补充信息",
      titleEn: "Eligibility and Additional Details",
      fields: [
        ...(options.includeLifeInUk
          ? [
              {
                id: "lifeInUkReference",
                type: "text" as const,
                labelZh: "Life in the UK test reference number",
                labelEn: "Life in the UK test reference number",
              },
            ]
          : []),
        ...(options.includeEnglish
          ? [
              {
                id: "englishDegree",
                type: "select" as const,
                labelZh: "是否有英语国家教学的学位？",
                labelEn: "Do you have a degree taught in English?",
                options: yesNoOptions,
              },
              {
                id: "englishTest",
                type: "textarea" as const,
                labelZh: "是否提供英语考试（如 A1/B1）？请说明考试名称和等级",
                labelEn: "Will you provide an English test, such as A1/B1? Add test name and level",
              },
              {
                id: "languages",
                type: "text" as const,
                labelZh: "熟练说的语言",
                labelEn: "Languages spoken fluently",
              },
            ]
          : []),
        ...(options.includeChinaTies
          ? [
              {
                id: "chinaPropertyBusiness",
                type: "textarea" as const,
                labelZh: "在中国是否有房产或商业利益？请说明",
                labelEn: "Do you own property or business interests in China? Provide details",
              },
              {
                id: "chinaFamilyFriendsGroups",
                type: "textarea" as const,
                labelZh: "在中国的家人、朋友或社团联系",
                labelEn: "Family, friends, or social group connections in China",
              },
            ]
          : []),
      ],
    });
  }

  return sections;
}

const relationshipSection: QuestionnaireSection = {
  id: "relationship",
  titleZh: "伴侣与关系信息",
  titleEn: "Partner and Relationship",
  fields: [
    {
      id: "partnerNiNumber",
      type: "text",
      labelZh: "伴侣 NI number",
      labelEn: "Partner NI number",
    },
    {
      id: "previousPartners",
      type: "repeater",
      labelZh: "您之前的伴侣（如有）",
      labelEn: "Your previous partners, if any",
      fields: [
        { id: "fullName", type: "text", labelZh: "姓名", labelEn: "Full name" },
        { id: "dateOfBirth", type: "date", labelZh: "出生日期", labelEn: "Date of birth" },
        { id: "marriageDetails", type: "textarea", labelZh: "结婚时间地点", labelEn: "Marriage date and place" },
        { id: "divorceDetails", type: "textarea", labelZh: "离婚时间地点", labelEn: "Divorce date and place" },
      ],
    },
    {
      id: "partnerPreviousMarriages",
      type: "textarea",
      labelZh: "现任伴侣是否之前结婚过？如有请提供详情",
      labelEn: "Has your current partner been married before? Provide details",
    },
    {
      id: "firstMet",
      type: "textarea",
      labelZh: "什么时候以及在哪里第一次见到现任伴侣？何时开始交往？",
      labelEn: "When and where did you first meet your partner? When did the relationship start?",
    },
    {
      id: "startedLivingTogether",
      type: "month",
      labelZh: "你和伴侣从什么时候开始住在一起？",
      labelEn: "When did you start living together?",
    },
    {
      id: "marriageDatePlace",
      type: "textarea",
      labelZh: "结婚日期和地点",
      labelEn: "Marriage date and place",
    },
    {
      id: "plannedSharedUkAddress",
      type: "textarea",
      labelZh: "你们打算在英国哪里共同生活？",
      labelEn: "Where will you live together in the UK?",
    },
    {
      id: "sharedFinancialResponsibilities",
      type: "textarea",
      labelZh: "是否共同承担财务责任？请列出项目和每月金额",
      labelEn: "Do you share financial responsibilities? List items and monthly amounts",
    },
    {
      id: "partnerEmployment",
      type: "textarea",
      labelZh: "伴侣在英国是否有工作或 offer？请提供雇主、职位、年薪、电话和邮箱",
      labelEn: "Does your partner have UK employment or an offer? Provide employer, role, salary, phone, and email",
    },
  ],
};

const childrenSection: QuestionnaireSection = {
  id: "children",
  titleZh: "子女信息",
  titleEn: "Children",
  fields: [
    {
      id: "children",
      type: "repeater",
      labelZh: "18 岁以下子女（如有）",
      labelEn: "Children under 18, if any",
      fields: [
        { id: "fullName", type: "text", labelZh: "姓名", labelEn: "Full name" },
        { id: "dateOfBirth", type: "date", labelZh: "出生日期", labelEn: "Date of birth" },
        { id: "livesWithApplicant", type: "select", labelZh: "是否现在与您同住", labelEn: "Lives with you?", options: yesNoOptions },
        { id: "travellingToUk", type: "select", labelZh: "是否跟您一起来英国", labelEn: "Travelling to the UK with you?", options: yesNoOptions },
        { id: "travelHistory", type: "textarea", labelZh: "孩子的英国和世界旅行记录", labelEn: "Child's UK and world travel history" },
      ],
    },
  ],
};

const workerEmploymentSection: QuestionnaireSection = {
  id: "employment",
  titleZh: "工签与雇主信息",
  titleEn: "Work Visa and Employment",
  fields: [
    {
      id: "plannedUkEntryDate",
      type: "date",
      labelZh: "这次申请准备何时入境英国？",
      labelEn: "When do you plan to enter the UK for this application?",
    },
    {
      id: "ukJobDetails",
      type: "textarea",
      labelZh: "英国雇主、职位、年薪、开始日期、雇主电话和邮箱",
      labelEn: "UK employer, role, salary, start date, employer phone, and email",
    },
  ],
};

export const questionnaireTemplates: QuestionnaireTemplate[] = [
  {
    key: "settlement",
    titleZh: "Settlement 问题清单",
    titleEn: "Settlement Questionnaire",
    descriptionZh: "用于永居/settlement 申请的信息收集。",
    descriptionEn: "Information collection for settlement applications.",
    sections: commonSections({
      includeEnglish: true,
      includeLifeInUk: true,
      includeChinaTies: true,
    }),
  },
  {
    key: "spouse_visa_overseas",
    titleZh: "Spouse visa 问题清单（境外）",
    titleEn: "Spouse Visa Questionnaire, Overseas",
    descriptionZh: "用于境外配偶签证申请的信息收集。",
    descriptionEn: "Information collection for overseas spouse visa applications.",
    sections: [
      ...commonSections({
        includeEnglish: true,
        includeFutureUkAddress: true,
      }),
      relationshipSection,
      childrenSection,
    ],
  },
  {
    key: "skilled_worker",
    titleZh: "工签问题清单",
    titleEn: "Skilled Worker Questionnaire",
    descriptionZh: "用于英国工签主申请人信息收集。",
    descriptionEn: "Information collection for Skilled Worker main applicants.",
    sections: [
      ...commonSections({
        includeFutureUkAddress: true,
      }),
      workerEmploymentSection,
    ],
  },
  {
    key: "t2_dependant_partner",
    titleZh: "T2 / Skilled Worker 家属签证（配偶）",
    titleEn: "T2 / Skilled Worker Dependant Partner",
    descriptionZh: "用于工签家属配偶申请的信息收集。",
    descriptionEn: "Information collection for dependant partner applications.",
    sections: [
      ...commonSections({
        includeFutureUkAddress: true,
      }),
      {
        id: "dependant_partner",
        titleZh: "家属配偶补充问题",
        titleEn: "Dependant Partner Details",
        fields: [
          {
            id: "previousDependantVisa",
            type: "textarea",
            labelZh: "以前是否以主申请人配偶身份申请过家属签证？如有请提供详情",
            labelEn: "Have you previously applied as the main applicant's dependant partner? Provide details",
          },
          {
            id: "sameAddressAsMainApplicant",
            type: "select",
            labelZh: "现在是否和主申请人住在同一个地址？",
            labelEn: "Do you currently live at the same address as the main applicant?",
            options: yesNoOptions,
          },
          {
            id: "organizedGroupTravel",
            type: "select",
            labelZh: "是否将作为有组织团体的一部分前往英国？",
            labelEn: "Will you travel to the UK as part of an organised group?",
            options: yesNoOptions,
          },
          {
            id: "travellingWithOthers",
            type: "textarea",
            labelZh: "是否将与不是配偶或家属的人一同前往英国？如有请说明",
            labelEn: "Will you travel with anyone who is not your partner or dependant? Provide details",
          },
        ],
      },
    ],
  },
  {
    key: "t2_dependant_child",
    titleZh: "T2 / Skilled Worker 家属签证（子女）",
    titleEn: "T2 / Skilled Worker Dependant Child",
    descriptionZh: "用于工签家属子女申请的信息收集。",
    descriptionEn: "Information collection for dependant child applications.",
    sections: [
      {
        id: "child",
        titleZh: "子女基本信息",
        titleEn: "Child Details",
        fields: [...previousNameFields],
      },
      {
        id: "travel",
        titleZh: "旅行与签证记录",
        titleEn: "Travel and Visa History",
        fields: [
          ukTravelHistoryField,
          worldTravelHistoryField,
          {
            id: "previousUkVisas",
            type: "textarea",
            labelZh: "过去 10 年中是否获得过英国签证？如有请提供签证页信息",
            labelEn: "Any UK visas in the last 10 years? Provide visa page details",
          },
          {
            id: "hasVisaRefusals",
            type: "select",
            labelZh: "是否有过被任何国家拒签的经历？",
            labelEn: "Has the child ever been refused a visa by any country?",
            options: yesNoOptions,
          },
          {
            id: "visaRefusalDetails",
            type: "textarea",
            labelZh: "如有拒签，请说明国家、日期、原因",
            labelEn: "If yes, provide country, date, and reason",
          },
          {
            id: "travellingWithNonParents",
            type: "textarea",
            labelZh: "是否将与不是父母的人一同前往英国？如有请说明",
            labelEn: "Will the child travel with anyone who is not a parent? Provide details",
          },
        ],
      },
    ],
  },
];

export function getQuestionnaireTemplate(key: string) {
  return questionnaireTemplates.find((template) => template.key === key) ?? null;
}
