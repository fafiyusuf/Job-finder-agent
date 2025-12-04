# Job Finder Agent - Architecture Documentation

## System Overview

This is an AI-powered job matching system that uses Gemini AI and Tavily Search API to find relevant job opportunities based on a user's resume.

## Workflow Diagram

```
User Frontend (React)
       ↓
   Upload Resume (PDF)
       ↓
Server.js → /parse-resume endpoint
       ↓
extractTextFromPDF() → Extract raw text
       ↓
Gemini AI → Parse structured data (name, email, skills, education, experience)
       ↓
Return parsed data to frontend
       ↓
User clicks "Launch AI Job Hunter"
       ↓
Server.js → /chat endpoint
       ↓
jobAgent(message, skills, preferences)
       ↓
┌─────────────────────────────────┐
│      Job Agent Workflow         │
├─────────────────────────────────┤
│ 1. Detect job search intent     │
│ 2. Use Gemini to analyze ALL    │
│    skills and create optimal    │
│    search query                 │
│ 3. Call searchJobs() with       │
│    generated query              │
│ 4. Tavily API searches web      │
│ 5. Match ALL skills against     │
│    job descriptions             │
│ 6. Score and rank results       │
│ 7. Format with markdown links   │
│ 8. Return to frontend           │
└─────────────────────────────────┘
       ↓
ReactMarkdown renders formatted response with clickable links
```

## Components

### 1. Server.js (Express Backend)

**Endpoints:**
- `GET /` - Health check
- `GET /test-gemini` - Test Gemini API connection
- `POST /parse-resume` - Parse uploaded resume PDF
- `POST /chat` - Job search chat interface

**Key Flow:**
```javascript
/chat endpoint receives:
{
  message: "find me jobs",
  skills: ["React", "Node.js", "Python", ...],
  preferences: {
    title: "Senior Developer",
    location: "Remote",
    remote: true
  }
}
```

### 2. Job Agent (agents/jobAgent.js)

**Current Architecture: Direct Function Calls (Not Tool-Based)**

The agent currently uses a **simplified direct call pattern** rather than Gemini's function calling/tools API:

```javascript
async function jobAgent(message, skills, preferences) {
  // 1. Intent Detection
  const isJobSearchRequest = message.includes("job") || message.includes("find");
  
  // 2. If job search detected:
  if (isJobSearchRequest && skills.length > 0) {
    // 3. Use Gemini to create intelligent search query from ALL skills
    const searchQuery = await model.generateContent(skillAnalysisPrompt);
    
    // 4. Call Tavily search
    const results = await searchJobs(searchQuery, skills, preferences);
    
    // 5. Format and return results
    return formattedResponse;
  }
}
```

**Why Not Using Tools/Function Calling?**

The current implementation is simpler and more direct:
- ✅ Faster execution (one API call instead of multiple)
- ✅ More predictable behavior
- ✅ Easier to debug
- ❌ Less flexible for complex multi-step reasoning
- ❌ Can't dynamically choose between multiple tools

**If You Want to Add Tool-Based Architecture:**

```javascript
// Define tools for Gemini
const tools = [
  {
    functionDeclarations: [
      {
        name: "searchJobs",
        description: "Search for job openings based on skills and preferences",
        parameters: {
          type: "OBJECT",
          properties: {
            query: { type: "STRING", description: "Job search query" },
            location: { type: "STRING", description: "Job location" },
            remote: { type: "BOOLEAN", description: "Remote work preference" }
          },
          required: ["query"]
        }
      }
    ]
  }
];

// Use tool-based generation
const result = await model.generateContent({
  contents: [{ role: "user", parts: [{ text: message }] }],
  tools: tools
});

// Handle function call requests
if (result.response.functionCall) {
  const functionCall = result.response.functionCall;
  if (functionCall.name === "searchJobs") {
    const results = await searchJobs(
      functionCall.args.query,
      skills,
      preferences
    );
    // Send results back to Gemini for final formatting
  }
}
```

### 3. Search Jobs Function (agents/jobAgent.js)

**Enhanced Skill Matching Algorithm:**

```javascript
async function searchJobs(query, skills, preferences, num) {
  // 1. Build Tavily search query
  const finalQuery = `${query} ${location} ${remote} site:linkedin.com OR site:indeed.com`;
  
  // 2. Call Tavily API
  const response = await axios.post(TAVILY_API_URL, {
    api_key: TAVILY_API_KEY,
    query: finalQuery,
    max_results: num * 2
  });
  
  // 3. Match against ALL skills (enhanced)
  const results = response.data.results.map(job => {
    const content = `${job.title} ${job.content} ${job.snippet}`.toLowerCase();
    
    // Partial matching for compound skills
    const skillMatches = skills.filter(skill => {
      const skillLower = skill.toLowerCase();
      return content.includes(skillLower) || 
             skillLower.split(/[\s\.\-\/]/).some(part => 
               part.length > 2 && content.includes(part)
             );
    });
    
    // Calculate relevance score
    const relevanceScore = (skillMatches.length / skills.length) * 100;
    
    return {
      title: job.title,
      url: job.url,
      snippet: job.snippet,
      matchedSkills: skillMatches,
      matchScore: skillMatches.length,
      relevanceScore: Math.round(relevanceScore)
    };
  });
  
  // 4. Sort by match score and relevance
  return results.sort((a, b) => {
    if (b.matchScore !== a.matchScore) return b.matchScore - a.matchScore;
    return b.relevanceScore - a.relevanceScore;
  });
}
```

## Key Improvements Made

### 1. ✅ Uses ALL Skills Now (Not Just First One)

**Before:**
```javascript
if (topSkills.includes('React')) {
  searchQuery = 'React developer jobs'; // Only searches React!
}
```

**After:**
```javascript
// Gemini analyzes ALL skills: "React, Node.js, Python, MongoDB, AWS..."
// Creates query: "Full Stack Developer React Node.js"
const queryResult = await model.generateContent(skillAnalysisPrompt);
```

### 2. ✅ Enhanced Skill Matching

**Features:**
- Partial matching (e.g., "React.js" matches "React")
- Compound skill splitting (e.g., "Full Stack" → ["Full", "Stack"])
- Relevance scoring (0-100%)
- Multi-criteria sorting

### 3. ✅ Better Response Formatting

**Markdown Features:**
- Bold headers with emojis
- Skill match percentage
- Clickable links: `[Apply Here](url)`
- Tips section
- Professional layout

### 4. ✅ AI-Driven Query Generation

Instead of hard-coded logic, Gemini analyzes the skill set and creates optimal search queries.

## Environment Variables Required

```env
GEMINI_API_KEY=your_gemini_api_key
TAVILY_API_KEY=your_tavily_api_key
TAVILY_API_URL=https://api.tavily.com/search
PORT=5000
FRONTEND_ORIGIN=http://localhost:5173
```

## API Flow Example

### Request:
```json
POST /chat
{
  "message": "find me jobs",
  "skills": ["React", "Node.js", "TypeScript", "MongoDB", "AWS"],
  "preferences": {
    "location": "Remote",
    "remote": true
  }
}
```

### Processing:
1. **Gemini analyzes skills** → "Full Stack JavaScript Developer"
2. **Tavily searches** → `"Full Stack JavaScript Developer Remote site:linkedin.com"`
3. **Match against 5 skills** → Each job scored by matched skills
4. **Sort by relevance** → Jobs with most matched skills first

### Response:
```markdown
🎯 I found **10 job opportunities** matching your profile!

📊 Analyzing against **5 skills** from your resume

---

### 1. Senior Full Stack Developer
**Company:** linkedin.com
**Match Score:** 4/5 skills (80% relevant)
**✓ Matched Skills:** React, Node.js, TypeScript, MongoDB
**Description:** We're looking for a Full Stack Developer with React...
🔗 [Apply Here](https://linkedin.com/jobs/123)

### 2. React Developer
**Company:** indeed.com
**Match Score:** 3/5 skills (60% relevant)
**✓ Matched Skills:** React, TypeScript, AWS
...
```

## Future Enhancements

### 1. Add Tool-Based Architecture
- Implement Gemini function calling
- Add multiple tools (search, filter, sort)
- Enable multi-step reasoning

### 2. Add More Tools
- Company research tool
- Salary estimation tool
- Resume optimization suggestions
- Interview preparation tool

### 3. Improve Matching
- Use vector embeddings for semantic matching
- Add job category classification
- Consider experience level
- Match location preferences better

### 4. Add Caching
- Cache Tavily results
- Rate limiting
- Result deduplication

## Debugging

Enable debug logs:
```javascript
console.log("Skills being analyzed:", skills);
console.log("Generated query:", searchQuery);
console.log("Tavily results count:", results.length);
console.log("Top matched job:", results[0]);
```

## Testing

Test the chat endpoint:
```bash
curl -X POST http://localhost:5000/chat \
  -H "Content-Type: application/json" \
  -d '{
    "message": "find me jobs",
    "skills": ["React", "Node.js"],
    "preferences": {"remote": true}
  }'
```
