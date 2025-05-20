import { ChatGroq } from '@langchain/groq';
import { StringOutputParser } from '@langchain/core/output_parsers';
import { ChatPromptTemplate } from '@langchain/core/prompts';
import { parseQuery } from './query-parser';

// Initialize the Groq LLM
const llm = new ChatGroq({
  apiKey: process.env.GROQ_API_KEY || '',
  model: 'meta-llama/llama-4-scout-17b-16e-instruct',
});

const outputParser = new StringOutputParser();

export async function processQuery(userQuery: string): Promise<string> {
  // Parse the query to get relevant information

  const queryResult = await parseQuery(userQuery);

  console.log(queryResult);
  
  if (!queryResult.topResult) {
    return "I'm sorry, I couldn't find any relevant information for your question. Please try asking about job descriptions, salaries, or requirements for positions in San Diego County, San Bernardino, or Ventura.";
  }
  
  // Create a general prompt that works for all query types
  const promptTemplate = `
    You are an HR assistant providing information about jobs.
    
    User Query: {query}
    
    Here is the most relevant information I found:
    {relevantContent}
    
    Based ONLY on the information provided above, answer the user's question.
    Your response must be concise and direct - one or two sentences maximum.
    
    For salary questions:
    - Format the response as: "The [job title] in [jurisdiction] has a salary range from [lowest amount] to [highest amount] per hour/per month (salary grades [x] and [y])."
    - Do not include asterisks, bullet points, or any other formatting.
    - Do not explain what salary grades mean or provide additional context.
    
    For all other questions:
    - Keep your response under 5 sentences.
    - Be direct and specific.
    - Do not use bullet points or markdown formatting.
    
    IMPORTANT: Use ONLY the information provided above. Do NOT make up or estimate salary ranges.
  `;
  
  const prompt = ChatPromptTemplate.fromTemplate(promptTemplate);
  
  // Create the chain
  const chain = prompt.pipe(llm).pipe(outputParser);
  
  // Execute the chain
  const response = await chain.invoke({
    query: userQuery,
    relevantContent: queryResult.topResult.pageContent,
  });
  
  return response;
}