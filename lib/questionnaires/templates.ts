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

const visitorPurposeOptions: QuestionnaireFieldOption[] = [
  { value: "tourism", labelZh: "旅游", labelEn: "Tourism" },
  { value: "family_visit", labelZh: "探亲访友", labelEn: "Family or friends visit" },
  { value: "business", labelZh: "商务", labelEn: "Business" },
  { value: "other", labelZh: "其他", labelEn: "Other" },
];

const employmentStatusOptions: QuestionnaireFieldOption[] = [
  { value: "full_time", labelZh: "全职", labelEn: "Full-time employed" },
  { value: "part_time", labelZh: "兼职", labelEn: "Part-time employed" },
  { value: "self_employed", labelZh: "企业法人/个体户", labelEn: "Business owner or self-employed" },
  { value: "unemployed", labelZh: "无业", labelEn: "Unemployed" },
  { value: "retired", labelZh: "退休", labelEn: "Retired" },
  { value: "student", labelZh: "学生", labelEn: "Student" },
  { value: "family_supported", labelZh: "由配偶或家庭成员资助", labelEn: "Supported by spouse or family" },
];

const visitorPersonalSection: QuestionnaireSection = {
  id: "visitor_personal",
  titleZh: "个人与护照信息",
  titleEn: "Personal and Passport Details",
  fields: [
    ...contactFields,
    ...previousNameFields,
    { id: "chineseName", type: "text", labelZh: "中文姓名", labelEn: "Chinese name" },
    { id: "dateOfBirth", type: "date", labelZh: "出生日期", labelEn: "Date of birth" },
    { id: "nationalIdNumber", type: "text", labelZh: "身份证号码", labelEn: "National ID number" },
    { id: "birthCity", type: "text", labelZh: "出生城市", labelEn: "City of birth" },
    { id: "gender", type: "text", labelZh: "性别", labelEn: "Gender" },
    { id: "nationality", type: "text", labelZh: "现国籍", labelEn: "Current nationality" },
    { id: "otherNationalities", type: "textarea", labelZh: "是否有其他国籍？如有请说明加入时间", labelEn: "Any other nationalities? If yes, provide dates" },
    { id: "maritalStatus", type: "text", labelZh: "婚姻状况", labelEn: "Marital status" },
    { id: "currentPassportNumber", type: "text", labelZh: "现在使用的护照号码", labelEn: "Current passport number" },
    { id: "passportIssuePlace", type: "text", labelZh: "护照签发地", labelEn: "Passport place of issue" },
    { id: "passportIssueDate", type: "date", labelZh: "护照签发日期", labelEn: "Passport issue date" },
    { id: "passportExpiryDate", type: "date", labelZh: "护照有效期至", labelEn: "Passport expiry date" },
    { id: "isFirstPassport", type: "select", labelZh: "现在使用的护照是否是您的第一本护照？", labelEn: "Is your current passport your first passport?", options: yesNoOptions },
    {
      id: "previousPassports",
      type: "repeater",
      labelZh: "过去 10 年内的旧护照（如有）",
      labelEn: "Previous passports in the last 10 years, if any",
      fields: [
        { id: "passportNumber", type: "text", labelZh: "旧护照号码", labelEn: "Previous passport number" },
        { id: "issuePlace", type: "text", labelZh: "签发地", labelEn: "Place of issue" },
        { id: "issueDate", type: "date", labelZh: "签发日期", labelEn: "Issue date" },
        { id: "expiryDate", type: "date", labelZh: "有效期至", labelEn: "Expiry date" },
        { id: "currentLocation", type: "textarea", labelZh: "旧护照现在何处？如遗失或不能提供，请说明原因及出境记录", labelEn: "Where is the old passport now? If unavailable, explain why and list travel records" },
      ],
    },
  ],
};

const visitorFamilySection: QuestionnaireSection = {
  id: "visitor_family",
  titleZh: "家庭信息",
  titleEn: "Family Details",
  fields: [
    parentDetailsField,
    {
      id: "spouse",
      type: "textarea",
      labelZh: "配偶信息：姓名、国籍、出生日期、是否同行、护照号码、是否同住；如不同住请提供地址",
      labelEn: "Spouse details: name, nationality, date of birth, whether travelling, passport number, whether living with you; if not, provide address",
    },
    {
      id: "children",
      type: "repeater",
      labelZh: "子女信息（如有）",
      labelEn: "Children, if any",
      fields: [
        { id: "fullName", type: "text", labelZh: "孩子姓名", labelEn: "Child's full name" },
        { id: "dateOfBirth", type: "date", labelZh: "出生日期", labelEn: "Date of birth" },
        { id: "birthPlace", type: "text", labelZh: "出生地", labelEn: "Place of birth" },
        { id: "currentAddress", type: "textarea", labelZh: "现居住地址（如不同住）", labelEn: "Current address, if not living with you" },
        { id: "livesWithApplicant", type: "select", labelZh: "目前是否同您一起居住？", labelEn: "Currently living with you?", options: yesNoOptions },
        { id: "travellingToUk", type: "select", labelZh: "是否同您一起前来英国？", labelEn: "Travelling to the UK with you?", options: yesNoOptions },
        { id: "passportNumber", type: "text", labelZh: "如同行，请填写护照号码", labelEn: "If travelling, provide passport number" },
      ],
    },
    {
      id: "otherChildrenTravelling",
      type: "repeater",
      labelZh: "是否有其他孩子跟随您一起旅游（如外甥、侄女等）",
      labelEn: "Other children travelling with you, if any",
      helperZh: "如有，通常需要提供亲属关系及委托公证书。",
      helperEn: "If yes, relationship and consent documents may be needed.",
      fields: [
        { id: "fullName", type: "text", labelZh: "孩子姓名", labelEn: "Child's full name" },
        { id: "dateOfBirth", type: "date", labelZh: "出生日期", labelEn: "Date of birth" },
        { id: "birthPlace", type: "text", labelZh: "出生地", labelEn: "Place of birth" },
        { id: "currentAddress", type: "textarea", labelZh: "孩子现居住地址", labelEn: "Child's current address" },
        { id: "relationshipToChild", type: "text", labelZh: "您与孩子的关系", labelEn: "Your relationship to the child" },
        { id: "relationshipToParents", type: "text", labelZh: "您与孩子父母的关系", labelEn: "Your relationship to the child's parents" },
      ],
    },
  ],
};

const visitorTravelSection: QuestionnaireSection = {
  id: "visitor_travel",
  titleZh: "以前申请和旅游情况",
  titleEn: "Previous Applications and Travel",
  fields: [
    ukTravelHistoryField,
    worldTravelHistoryField,
    {
      id: "hasVisaRefusals",
      type: "select",
      labelZh: "是否被任何国家拒签、驱逐或遣返？",
      labelEn: "Have you ever been refused a visa, deported, or removed by any country?",
      options: yesNoOptions,
      required: true,
    },
    {
      id: "visaRefusalDetails",
      type: "textarea",
      labelZh: "如有，请提供日期、国家和原因",
      labelEn: "If yes, provide date, country, and reason",
    },
  ],
};

const visitorTripSection: QuestionnaireSection = {
  id: "visitor_trip",
  titleZh: "本次英国行程",
  titleEn: "Current UK Trip",
  fields: [
    { id: "visitPurpose", type: "select", labelZh: "本次访问英国的主要目的", labelEn: "Main purpose of this UK visit", options: visitorPurposeOptions, required: true },
    { id: "plannedDepartureDate", type: "date", labelZh: "本次具体出发日期", labelEn: "Planned departure date" },
    { id: "plannedReturnDate", type: "date", labelZh: "计划离开英国/返回日期", labelEn: "Planned UK departure or return date" },
    { id: "itinerary", type: "textarea", labelZh: "请简要说明本次英国旅游行程安排", labelEn: "Briefly describe your UK travel itinerary" },
    { id: "hasUkFriendsOrRelatives", type: "select", labelZh: "您在英国有亲戚或朋友吗？", labelEn: "Do you have relatives or friends in the UK?", options: yesNoOptions },
    { id: "willVisitUkContacts", type: "select", labelZh: "此次英国旅游是否打算探望在英国的亲戚朋友？", labelEn: "Will you visit relatives or friends in the UK during this trip?", options: yesNoOptions },
    { id: "willStayWithUkContacts", type: "select", labelZh: "旅游期间是否住在英国亲戚或朋友家？", labelEn: "Will you stay with relatives or friends in the UK?", options: yesNoOptions },
    {
      id: "ukContacts",
      type: "repeater",
      labelZh: "英国亲戚或朋友信息（如有）",
      labelEn: "UK relatives or friends, if any",
      fields: [
        { id: "fullName", type: "text", labelZh: "姓名", labelEn: "Full name" },
        { id: "nationality", type: "text", labelZh: "国籍", labelEn: "Nationality" },
        { id: "relationship", type: "text", labelZh: "关系", labelEn: "Relationship" },
        { id: "phone", type: "tel", labelZh: "英国联系电话", labelEn: "UK phone number" },
        { id: "email", type: "email", labelZh: "邮箱", labelEn: "Email" },
        { id: "ukAddress", type: "textarea", labelZh: "在英国的地址", labelEn: "UK address" },
      ],
    },
    {
      id: "travelCompanions",
      type: "repeater",
      labelZh: "本次英国旅游是否有其他随行人员？",
      labelEn: "Other people travelling with you, if any",
      fields: [
        { id: "fullName", type: "text", labelZh: "姓名", labelEn: "Full name" },
        { id: "dateOfBirth", type: "date", labelZh: "出生日期", labelEn: "Date of birth" },
        { id: "nationality", type: "text", labelZh: "国籍", labelEn: "Nationality" },
        { id: "passportNumber", type: "text", labelZh: "护照号码", labelEn: "Passport number" },
        { id: "relationship", type: "text", labelZh: "与您的关系", labelEn: "Relationship to you" },
      ],
    },
  ],
};

const visitorEmploymentSection: QuestionnaireSection = {
  id: "visitor_employment",
  titleZh: "个人经济及就业细节",
  titleEn: "Employment and Financial Details",
  fields: [
    { id: "employmentStatus", type: "select", labelZh: "您现在的工作状态", labelEn: "Current employment status", options: employmentStatusOptions, required: true },
    { id: "familySponsorDetails", type: "textarea", labelZh: "如由配偶或家庭成员资助，请说明资助人信息及与您的关系", labelEn: "If supported by spouse or family, provide sponsor details and relationship" },
    { id: "companyOrSchoolName", type: "text", labelZh: "公司/学校名称", labelEn: "Company or school name" },
    { id: "jobTitleOrMajor", type: "text", labelZh: "职务/专业", labelEn: "Job title or major" },
    { id: "jobDescription", type: "textarea", labelZh: "描述您的工作内容", labelEn: "Describe your work duties" },
    { id: "startDate", type: "date", labelZh: "入职/入学时间", labelEn: "Employment or study start date" },
    { id: "companyOrSchoolAddress", type: "textarea", labelZh: "工作/学校地址", labelEn: "Company or school address" },
    { id: "postcode", type: "text", labelZh: "邮政编码", labelEn: "Postcode" },
    { id: "phone", type: "tel", labelZh: "电话（区号+号码）", labelEn: "Phone number with area code" },
    { id: "fax", type: "text", labelZh: "传真（如有）", labelEn: "Fax, if any" },
    { id: "email", type: "email", labelZh: "电子邮件", labelEn: "Email" },
    {
      id: "sensitivePreviousEmployment",
      type: "textarea",
      labelZh: "过去是否曾从事军队、政府、司法、媒体、行政管理、公共安全等职业？如有请列明单位、职务和工作时间",
      labelEn: "Any previous military, government, judiciary, media, public administration, or public security roles? If yes, list employer, role, and dates",
    },
  ],
};

const visitorFinanceSection: QuestionnaireSection = {
  id: "visitor_finances",
  titleZh: "收支与资金来源",
  titleEn: "Income, Expenses, and Funding",
  fields: [
    { id: "monthlyNetIncome", type: "text", labelZh: "现在工作的税后月收入（企业法人请提供年收入）", labelEn: "Monthly net employment income, or annual income for business owners" },
    { id: "otherAssetIncome", type: "textarea", labelZh: "是否有其他资产收入或家庭津贴？请说明年收入", labelEn: "Any other asset income or family allowance? Provide annual amount" },
    { id: "savingsAmount", type: "text", labelZh: "存款储蓄总金额", labelEn: "Total savings amount" },
    { id: "investmentIncome", type: "textarea", labelZh: "股票、基金、分红等投资收入（请写年总收入）", labelEn: "Investment income such as stocks, funds, dividends; provide annual amount" },
    { id: "otherIncome", type: "textarea", labelZh: "是否还有其他收入？如房租或其他收入请列明年收入", labelEn: "Any other income, such as rent? Provide annual amount" },
    { id: "monthlyLivingCosts", type: "text", labelZh: "每月生活支出金额（生活费、还贷款、账单等）", labelEn: "Monthly living costs, including expenses, loans, and bills" },
    { id: "tripTotalCost", type: "text", labelZh: "此次旅游全程费用（机票、酒店、花费等）", labelEn: "Total trip cost, including flights, hotels, and spending" },
    { id: "thirdPartyFunding", type: "textarea", labelZh: "如果由他人支付全部或部分费用，请说明金额、付款人和原因", labelEn: "If someone else pays all or part of the trip, provide amount, payer, and reason" },
  ],
};

const visitorAdditionalSection: QuestionnaireSection = {
  id: "visitor_additional",
  titleZh: "补充信息",
  titleEn: "Additional Information",
  fields: [
    { id: "additionalInfo", type: "textarea", labelZh: "您想提供给使馆的其他签证申请信息", labelEn: "Any other information you want to provide for the visa application" },
    {
      id: "businessVisitDetails",
      type: "textarea",
      labelZh: "如申请商务签证，请填写邀请人、邀请公司英文名、公司地址、电话及主营业务",
      labelEn: "For business visits, provide inviter, inviting company name, company address, phone, and main business",
    },
    {
      id: "familyVisitDetails",
      type: "textarea",
      labelZh: "如申请探亲签证，请填写亲人姓名、地址、电话、邮箱、护照号、是否住其家中、资助记录、工作单位、最后见面时间地点，以及在英国所有亲属信息",
      labelEn: "For family visits, provide relative's name, address, phone, email, passport number, accommodation, sponsorship history, employer, last meeting, and all UK relatives",
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
    key: "standard_visitor",
    titleZh: "英国旅游签问题清单",
    titleEn: "UK Standard Visitor Questionnaire",
    descriptionZh: "用于英国旅游、探亲访友或商务访问签证的信息收集。",
    descriptionEn: "Information collection for UK tourism, family/friend visit, or business visitor applications.",
    sections: [
      visitorPersonalSection,
      {
        id: "visitor_address",
        titleZh: "联络地址",
        titleEn: "Contact Address",
        fields: [addressHistoryField],
      },
      visitorFamilySection,
      visitorTravelSection,
      visitorTripSection,
      visitorEmploymentSection,
      visitorFinanceSection,
      visitorAdditionalSection,
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

const questionnaireFieldTypes = new Set<QuestionnaireFieldType>([
  "text",
  "email",
  "tel",
  "date",
  "month",
  "textarea",
  "boolean",
  "select",
  "repeater",
]);

function isPlainRecord(value: unknown): value is Record<string, unknown> {
  return Boolean(value && typeof value === "object" && !Array.isArray(value));
}

function isQuestionnaireField(value: unknown): value is QuestionnaireField {
  if (!isPlainRecord(value)) {
    return false;
  }

  if (
    typeof value.id !== "string" ||
    !questionnaireFieldTypes.has(value.type as QuestionnaireFieldType) ||
    typeof value.labelZh !== "string" ||
    typeof value.labelEn !== "string"
  ) {
    return false;
  }

  if (value.type === "repeater") {
    return Array.isArray(value.fields) && value.fields.every(isQuestionnaireField);
  }

  if (value.options !== undefined) {
    return (
      Array.isArray(value.options) &&
      value.options.every(
        (option) =>
          isPlainRecord(option) &&
          typeof option.value === "string" &&
          typeof option.labelZh === "string" &&
          typeof option.labelEn === "string"
      )
    );
  }

  return true;
}

export function isQuestionnaireTemplate(
  value: unknown
): value is QuestionnaireTemplate {
  if (!isPlainRecord(value)) {
    return false;
  }

  return (
    typeof value.key === "string" &&
    typeof value.titleZh === "string" &&
    typeof value.titleEn === "string" &&
    typeof value.descriptionZh === "string" &&
    typeof value.descriptionEn === "string" &&
    Array.isArray(value.sections) &&
    value.sections.every(
      (section) =>
        isPlainRecord(section) &&
        typeof section.id === "string" &&
        typeof section.titleZh === "string" &&
        typeof section.titleEn === "string" &&
        Array.isArray(section.fields) &&
        section.fields.every(isQuestionnaireField)
    )
  );
}

export function getQuestionnaireTemplateSnapshot(
  templateKey: string,
  customTemplate: unknown
) {
  if (isQuestionnaireTemplate(customTemplate)) {
    return customTemplate;
  }

  return getQuestionnaireTemplate(templateKey);
}
