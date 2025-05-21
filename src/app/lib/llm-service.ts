import { ChatOpenAI  } from '@langchain/openai';
import { StringOutputParser } from '@langchain/core/output_parsers';
import { ChatPromptTemplate } from '@langchain/core/prompts';
import { parseQuery } from './query-parser';

const llm = new ChatOpenAI({
  apiKey: process.env.OPENAI_API_KEY || '',
  model: 'gpt-4o-mini'
});

const outputParser = new StringOutputParser();

export async function processQuery(userQuery: string): Promise<string> {

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
    
    For salary questions:
    - Format the response as: "The [job title] in [jurisdiction] has a salary range from [lowest amount] to [highest amount] per hour/per month (salary grades [x] and [y])."
    - Do not include asterisks, bullet points, or any other formatting.
    - Do not explain what salary grades mean or provide additional context.
    - If the salary information is not available, respond with: "I'm sorry, I couldn't find the salary information for this job."
    
    For all other questions:
    - IMPORTANT: provide the EXACT content from the job description/sections/relevant content without summarizing.
    - Do not use bullet points or markdown formatting.
    - for multiple points make it comma separated.
    
    IMPORTANT: Use ONLY the information provided above.
  `;
  
  const prompt = ChatPromptTemplate.fromTemplate(promptTemplate);
  
  const chain = prompt.pipe(llm).pipe(outputParser);
  
  const response = await chain.invoke({
    query: userQuery,
    relevantContent: queryResult.topResult.pageContent,
  });
  
  return response;
}