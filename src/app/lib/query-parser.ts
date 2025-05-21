import { searchDocuments } from './vector-store';

interface QueryResult {
  jobTitle: string | null;
  jurisdiction: string | null;
  relevantData: any | null;
  topResult: any | null;
}

export async function parseQuery(query: string): Promise<QueryResult> {
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
  
  const topResult = searchResults[0];
  const metadata = topResult.metadata;
  
  const jobTitle = metadata.title || null;
  const jurisdiction = metadata.jurisdiction || null;
  
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
  
  const lowerQuery = query.toLowerCase();
  let relevantContent = topResult.pageContent;
  
  if (metadata.sections) {
    const sectionKeywords = {
      "duties": ["Examples of Duties", "Examples Of Duties"],
      "responsibilities": ["Examples of Duties", "Examples Of Duties"],
      "skills": ["Knowledge, Skills, and Abilities", "KNOWLEDGE, SKILLS AND ABILITIES", "KNOWLEDGE AND SKILLS"],
      "abilities": ["Knowledge, Skills, and Abilities", "KNOWLEDGE, SKILLS AND ABILITIES", "KNOWLEDGE AND SKILLS"],
      "knowledge": ["Knowledge, Skills, and Abilities", "KNOWLEDGE, SKILLS AND ABILITIES", "KNOWLEDGE AND SKILLS"],
      "education": ["Education and Experience", "EDUCATION AND/OR EXPERIENCE", "Education/Experience", "MINIMUM QUALIFICATIONS"],
      "experience": ["Education and Experience", "EDUCATION AND/OR EXPERIENCE", "Education/Experience", "MINIMUM QUALIFICATIONS"],
      "qualifications": ["Qualification Guidelines", "MINIMUM QUALIFICATIONS"],
      "requirements": ["Other Requirements", "Supplemental Information"],
      "definition": ["Definition"],
      "characteristics": ["Distinguishing Characteristics", "CLASSIFICATION PURPOSE AND DISTINGUISHING CHARACTERISTICS"],
      "purpose": ["CLASSIFICATION PURPOSE AND DISTINGUISHING CHARACTERISTICS"],
      "classification": ["CLASSIFICATION PURPOSE AND DISTINGUISHING CHARACTERISTICS"]
    };
    
    const matchingSections: string[] = [];
    Object.entries(sectionKeywords).forEach(([keyword, headers]) => {
      if (lowerQuery.includes(keyword)) {
        headers.forEach(header => {
          if (metadata.sections[header] && !matchingSections.includes(header)) {
            matchingSections.push(header);
          }
        });
      }
    });
    
    if (matchingSections.length > 0) {
      relevantContent = `Job Title: ${metadata.title}\nJurisdiction: ${metadata.jurisdiction}\nJob Code: ${metadata.code}\n\n`;
      matchingSections.forEach(section => {
        relevantContent += `${section}:\n${metadata.sections[section]}\n\n`;
      });
    }
  }
  
  return {
    jobTitle,
    jurisdiction,
    relevantData,
    topResult
  };
}