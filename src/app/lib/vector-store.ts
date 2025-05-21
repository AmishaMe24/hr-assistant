import { OpenAIEmbeddings } from "@langchain/openai";
import { Document } from "langchain/document";
import { loadJobDescriptions, loadSalaryData } from "./data-loader";
import { MemoryVectorStore } from "langchain/vectorstores/memory";
import { JobDescription, SalaryData } from "./types";

const embeddings = new OpenAIEmbeddings({
  apiKey: process.env.OPENAI_API_KEY || "",
  model: "text-embedding-3-large",
});

let vectorStore: MemoryVectorStore | null = null;
let jobDescriptions: JobDescription[] = [];

export async function initVectorStore(): Promise<MemoryVectorStore> {
  if (vectorStore) return vectorStore;

  try {
    console.log("Loading job descriptions and salary data...");
    jobDescriptions = await loadJobDescriptions();
    const salaryData: SalaryData[] = await loadSalaryData();
    
    console.log(`Loaded ${jobDescriptions.length} job descriptions and ${salaryData.length} salary records`);

    // Create a map of salary data by job code and jurisdiction for quick lookup
    const salaryMap = new Map<string, SalaryData>();
    salaryData.forEach(salary => {
      const key = `${salary.Jurisdiction.toLowerCase()}_${salary["Job Code"]}`;
      salaryMap.set(key, salary);
    });

    // Create documents for job descriptions
    const jobDocs = jobDescriptions.map((job) => {
      // Extract all sections from the description
      const sections: Record<string, string> = {};
      const description = job.description;
      
      // List of possible section headers to extract
      const sectionHeaders = [
        "Definition",
        "Distinguishing Characteristics",
        "CLASSIFICATION PURPOSE AND DISTINGUISHING CHARACTERISTICS",
        "Examples of Duties",
        "Examples Of Duties",
        "Representation Unit",
        "Salary Range",
        "Supplemental Information",
        "Qualification Guidelines",
        "Knowledge, Skills, and Abilities",
        "KNOWLEDGE, SKILLS AND ABILITIES",
        "Education and Experience",
        "EDUCATION AND/OR EXPERIENCE",
        "Education/Experience",
        "Other Requirements",
        "Recruiting Standards",
        "MINIMUM QUALIFICATIONS",
        "KNOWLEDGE AND SKILLS"
      ];
      
      // Extract each section
      for (let i = 0; i < sectionHeaders.length; i++) {
        const currentHeader = sectionHeaders[i];
        const nextHeader = sectionHeaders.find(header => 
          header !== currentHeader && 
          description.indexOf(`${header}\n`, description.indexOf(`${currentHeader}\n`) + currentHeader.length + 1) > 0
        );
        
        if (description.includes(`${currentHeader}\n`)) {
          const startIndex = description.indexOf(`${currentHeader}\n`) + currentHeader.length + 1;
          let endIndex;
          
          if (nextHeader && description.includes(`${nextHeader}\n`)) {
            endIndex = description.indexOf(`${nextHeader}\n`);
          } else {
            // Look for the next section header pattern (word followed by newline)
            const nextSectionMatch = description.substring(startIndex).match(/\n[A-Z][a-zA-Z\s]+\n/);
            if (nextSectionMatch && nextSectionMatch.index) {
              endIndex = startIndex + nextSectionMatch.index;
            } else {
              endIndex = description.length;
            }
          }
          
          if (endIndex > startIndex) {
            const sectionContent = description.substring(startIndex, endIndex).trim();
            sections[currentHeader] = sectionContent;
          }
        }
      }
      
      // Look up salary data for this job
      const salaryKey = `${job.jurisdiction.toLowerCase()}_${job.code}`;
      const salary = salaryMap.get(salaryKey);
      
      // Extract salary grades if available
      let salaryInfo = "";
      if (salary) {
        salaryInfo = Object.entries(salary)
          .filter(([key, value]) => key.startsWith("Salary grade") && value)
          .map(([key, value]) => `${key}: ${value}`)
          .join(", ");
      }
      
      // Create a structured content string with all extracted sections
      let structuredContent = `Job Title: ${job.title}\nJurisdiction: ${job.jurisdiction}\nJob Code: ${job.code}\n`;
      
      // Add salary information
      structuredContent += `\nSalary Information: ${salaryInfo || "Not available"}\n`;
      
      // Add each extracted section to the content
      Object.entries(sections).forEach(([header, content]) => {
        structuredContent += `\n${header}:\n${content}\n`;
      });
      
      return new Document({
        pageContent: structuredContent,
        metadata: {
          type: "combined",
          title: job.title,
          jurisdiction: job.jurisdiction,
          code: job.code,
          hasSalary: !!salary,
          sections: sections,
          salaryInfo: salaryInfo || "Not available"
        },
      });
    });

    console.log("Number of documents:", jobDocs.length);

    // Create the vector store
    console.log("Creating vector store...");
    console.log("Using MemoryVectorStore...");

    vectorStore = await MemoryVectorStore.fromDocuments(jobDocs, embeddings);
    console.log("MemoryVectorStore created successfully.");

    return vectorStore;
  } catch (error) {
    console.error("Error initializing vector store:", error);
    throw new Error(`Failed to initialize vector store: ${(error as Error).message}`);
  }
}

// Search for relevant documents based on a query
export async function searchDocuments(query: string, k: number = 3): Promise<Document[]> {
  try {
    const store = await initVectorStore();
    return await store.similaritySearch(query, k);
  } catch (error) {
    console.error("Error searching documents:", error);
    throw new Error(`Search failed: ${(error as Error).message}`);
  }
}

// Check if vector store is initialized
export async function isVectorStoreInitialized(): Promise<boolean> {
  return vectorStore !== null;
}
