# HR Assistant Application

![image](https://github.com/user-attachments/assets/f1400592-5fc2-4030-82a5-58566505f6eb)


## Instructions for Running the Application Locally

1. **Clone the repository**
   ```bash
   git clone https://github.com/AmishaMe24/hr-assistant
   cd hr-assistant
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Set up environment variables**
   Create a `.env.local` file in the root directory with the following variables:
   ```
   OPENAI_API_KEY=your_openai_api_key
   ```

4. **Run the development server**
   ```bash
   npm run dev
   ```

5. **Access the application**
   Open your browser and navigate to `http://localhost:3000`

## Project Overview

### Approach

This HR Assistant application is designed to provide accurate information about job positions across different jurisdictions. The system uses natural language processing to understand user queries and retrieves relevant information from a structured database of job descriptions and salary data.

Key features of the approach:

1. **Section Extraction**: The application parses job descriptions to extract structured sections like "Knowledge, Skills, and Abilities", "Education and Experience", and "Examples of Duties" to provide targeted responses.

2. **Vector Search**: Implemented semantic search capabilities to find the most relevant job descriptions based on user queries.

3. **Context-Aware Responses**: The system identifies the type of query (salary, skills, education, etc.) and formats responses appropriately.

4. **Direct Information Retrieval**: For specific queries about job sections, the system returns the exact content from the job description without summarizing.

### Technologies Used

- **Next.js**: For the frontend and API routes
- **LangChain**: For building the LLM application workflow
- **OpenAI API**: For natural language processing (GPT-4o-mini model)
- **Vector Store**: For semantic search capabilities (MemoryVectorStore)
- **TypeScript**: For type-safe code

### Challenges Faced

1. **Section Extraction**: Parsing unstructured job descriptions to extract meaningful sections was challenging due to inconsistent formatting across different jurisdictions. The solution involved creating a robust parsing algorithm that could handle various section header formats.

2. **Query Understanding**: Determining the exact intent of user queries required careful keyword mapping to relevant job description sections.

3. **Response Formatting**: Ensuring that responses were formatted appropriately for different query types (especially salary information) required specific prompt engineering.

4. **Performance Optimization**: Balancing the need for comprehensive information retrieval with response time considerations was a challenge, addressed by optimizing the vector search process.

5. **Data Consistency**: Handling inconsistencies in how different jurisdictions format their job descriptions and salary information required additional data normalization steps.

The application successfully addresses these challenges by implementing a flexible architecture that can adapt to different query types and data formats while providing accurate and relevant information to users.
