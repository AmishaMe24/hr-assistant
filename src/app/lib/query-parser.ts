import { searchDocuments } from './vector-store';

interface QueryResult {
  jobTitle: string | null;
  jurisdiction: string | null;
  relevantData: any | null;
  topResult: any | null;
}

export async function parseQuery(query: string): Promise<QueryResult> {
  // Use vector search to find relevant documents
  const searchResults = await searchDocuments(query, 3);
  
  if (searchResults.length === 0) {
    return {
      jobTitle: null,
      jurisdiction: null,
      relevantData: null,
      topResult: null
    };
  }

  console.log(searchResults);
  
  // Get the most relevant document
  const topResult = searchResults[0];
  const metadata = topResult.metadata;
  
  // Extract job title and jurisdiction from metadata
  const jobTitle = metadata.title || null;
  const jurisdiction = metadata.jurisdiction || null;
  
  // Parse the content into a structured format
  const lines = topResult.pageContent.split('\n').map(line => line.trim()).filter(line => line);
  const relevantData = {};
  
  lines.forEach(line => {
    const colonIndex = line.indexOf(':');
    if (colonIndex > 0) {
      const key = line.substring(0, colonIndex).trim();
      const value = line.substring(colonIndex + 1).trim();
      relevantData[key] = value;
    }
  });
  
  return {
    jobTitle,
    jurisdiction,
    relevantData,
    topResult
  };
}