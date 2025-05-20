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

export async function initVectorStore(): Promise<MemoryVectorStore> {
  if (vectorStore) return vectorStore;

  try {
    console.log("Loading job descriptions and salary data...");
    const jobDescriptions: JobDescription[] = await loadJobDescriptions();
    const salaryData: SalaryData[] = await loadSalaryData();
    
    console.log(`Loaded ${jobDescriptions.length} job descriptions and ${salaryData.length} salary records`);

    const salaryMap = new Map<string, SalaryData>();
    salaryData.forEach(salary => {
      const key = `${salary.Jurisdiction.toLowerCase()}_${salary["Job Code"]}`;
      salaryMap.set(key, salary);
    });

    const combinedDocs: Document[] = [];

    jobDescriptions.forEach(job => {
      const salaryKey = `${job.jurisdiction.toLowerCase()}_${job.code}`;
      const salary = salaryMap.get(salaryKey);
      
      let salaryInfo = "";
      if (salary) {
        salaryInfo = Object.entries(salary)
          .filter(([key, value]) => key.startsWith("Salary grade") && value)
          .map(([key, value]) => `${key}: ${value}`)
          .join(", ");
      }

      // Create a document with combined information
      combinedDocs.push(new Document({
        pageContent: `
          Job Title: ${job.title}
          Jurisdiction: ${job.jurisdiction}
          Job Code: ${job.code}
          Job Description: ${job.description}
          Salary Information: ${salaryInfo || "Not available"}
        `,
        metadata: {
          type: "combined",
          title: job.title,
          jurisdiction: job.jurisdiction,
          code: job.code,
          hasSalary: !!salary
        },
      }));
    });

    console.log("Number of documents:", combinedDocs.length);

    // Create the vector store
    console.log("Creating vector store...");
    console.log("Using MemoryVectorStore...");

    // Use MemoryVectorStore (more reliable, no external dependencies)
    vectorStore = await MemoryVectorStore.fromDocuments(combinedDocs, embeddings);
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