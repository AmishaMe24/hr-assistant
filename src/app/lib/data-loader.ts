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

// Get all job titles with jurisdictions for query matching
export async function getJobTitlesWithJurisdictions(): Promise<Map<string, string[]>> {
  const jobDescriptions = await loadJobDescriptions();
  console.log("Job Descriptions", jobDescriptions)
  const jobTitleMap = new Map<string, string[]>();
  
  jobDescriptions.forEach(job => {
    const title = job.title.toLowerCase();
    if (!jobTitleMap.has(title)) {
      jobTitleMap.set(title, []);
    }
    jobTitleMap.get(title)?.push(job.jurisdiction.toLowerCase());
  });
  
  return jobTitleMap;
}