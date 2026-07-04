export type ProductFormatId =
  | "ebook"
  | "recorded_course"
  | "live_course"
  | "individual_mentoring"
  | "group_mentoring"
  | "workshop"
  | "community"
  | "consulting"
  | "template"
  | "checklist"
  | "spreadsheet"
  | "challenge"
  | "gpt_agent"
  | "mini_saas"
  | "service";

export type ProductFormatStep = {
  name: string;
  objective: string;
};

export type ProductFormatMethodology = {
  id: ProductFormatId;
  name: string;
  structureType: string;
  idealQuantity: number;
  positioningLogic: string;
  aliases: string[];
  steps: ProductFormatStep[];
};
