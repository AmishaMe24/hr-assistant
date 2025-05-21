import fs from 'fs';
import path from 'path';
import { SalaryData, JobDescription } from './types';

// Load salary data from JSON file
export async function loadSalaryData(): Promise<SalaryData[]> {
  const filePath = path.join(process.cwd(), 'src', 'app', 'data', 'salaries.json');
  const fileContents = await fs.promises.readFile(filePath, 'utf8');
  return JSON.parse(fileContents);
}

// Load job description data from JSON file
export async function loadJobDescriptions(): Promise<JobDescription[]> {
  const filePath = path.join(process.cwd(), 'src', 'app', 'data', 'job-descriptions.json');
  const fileContents = await fs.promises.readFile(filePath, 'utf8');
  return JSON.parse(fileContents);
}