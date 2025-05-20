
// Job and salary data types
export interface SalaryData {
  Jurisdiction: string;
  "Job Code": string;
  "Salary grade 1": string;
  "Salary grade 2": string;
  "Salary grade 3"?: string;
  "Salary grade 4"?: string;
  "Salary grade 5"?: string;
  "Salary grade 6"?: string;
  "Salary grade 7"?: string;
  "Salary grade 8"?: string;
  "Salary grade 9"?: string;
  "Salary grade 10"?: string;
  "Salary grade 11"?: string;
  "Salary grade 12"?: string;
  "Salary grade 13"?: string;
  "Salary grade 14"?: string;
  "Approval Date"?: string;
  [key: string]: string | undefined;
}

export interface JobDescription {
  jurisdiction: string;
  code : string;
  title : string;
  description: string;
  [key: string]: string | undefined;
}

// Chat message types
export interface Message {
  id: string;
  content: string;
  role: 'user' | 'assistant';
  timestamp: Date;
}

export interface ChatState {
  messages: Message[];
  isLoading: boolean;
}