/**
 * jobAgent.js
 * - Uses Gemini (Google Generative AI) to orchestrate job search tool calls
 * - Uses a simple HTTP call to Tavily (or any search API) to fetch job postings
 *
 * NOTE: The Google Generative AI SDK usage here follows the example pattern used earlier.
 * If your SDK version differs, adapt `generateContent` -> `model.generateContent` calls accordingly.
 */

const { GoogleGenerativeAI } = require("@google/generative-ai");
const axios = require("axios");
require("dotenv").config();

const GEMINI_API_KEY = process.env.GEMINI_API_KEY;
const TAVILY_API_KEY = process.env.TAVILY_API_KEY;
const TAVILY_API_URL = process.env.TAVILY_API_URL || "https://api.tavily.com/search";

if (!GEMINI_API_KEY) {
  console.warn("Warning: GEMINI_API_KEY not set. Set it in .env before running.");
}
if (!TAVILY_API_KEY) {
  console.warn("Warning: TAVILY_API_KEY not set. Set it in .env before running.");
}

const genAI = new GoogleGenerativeAI(GEMINI_API_KEY);
// choose a model; change if you have other model access
const model = genAI.getGenerativeModel({ model: "gemini-2.5-flash" });

/**
 * searchJobs(query) - calls Tavily API with enhanced filters for job search
 */
async function searchJobs(query, skills = [], preferences = {}, num = 5) {
  try {
    // Keep the main query simple
    const locationFilter = preferences.location && preferences.location !== 'any' ? ` ${preferences.location}` : "";
    const remoteFilter = preferences.remote ? " remote" : "";
    
    // Build concise query (under 400 chars total)
    const baseQuery = `${query}${locationFilter}${remoteFilter}`;
    
    // Use fewer sites to keep under character limit
    const sites = " site:linkedin.com OR site:indeed.com";
    const finalQuery = `${baseQuery}${sites}`;
    
    console.log("Final query length:", finalQuery.length);
    console.log("Final query:", finalQuery);

    const searchParams = {
      query: finalQuery,
      search_depth: "basic", // Use basic instead of advanced
      include_images: false,
      include_answer: false,
      max_results: num * 2 // Get more results to filter better ones
    };

    console.log("=== TAVILY API DEBUG ===");
    console.log("API URL:", TAVILY_API_URL);
    console.log("API Key present:", !!TAVILY_API_KEY);
    console.log("API Key length:", TAVILY_API_KEY ? TAVILY_API_KEY.length : 0);
    console.log("Search params:", JSON.stringify(searchParams, null, 2));

    const res = await axios.post(TAVILY_API_URL, {
      api_key: TAVILY_API_KEY,
      ...searchParams
    }, {
      headers: {
        "Content-Type": "application/json"
      }
    });

    const results = (res.data?.results || []).slice(0, num).map((r) => {
      // Calculate skill match score - check against ALL skills
      const content = `${r.title || ""} ${r.content || ""} ${r.snippet || ""}`.toLowerCase();
      
      // Match skills - partial matching for flexibility
      const skillMatches = skills.filter(skill => {
        const skillLower = skill.toLowerCase();
        // Check for exact match or partial match (for compound skills like "React.js")
        return content.includes(skillLower) || 
               skillLower.split(/[\s\.\-\/]/).some(part => part.length > 2 && content.includes(part));
      });
      
      const matchScore = skillMatches.length;
      
      // Calculate relevance score (0-100)
      const relevanceScore = Math.min(100, (matchScore / Math.max(skills.length, 1)) * 100 + 
                                      (content.includes('developer') ? 10 : 0) +
                                      (content.includes('engineer') ? 10 : 0));

      return {
        title: r.title || "Job Opening",
        url: r.url || "",
        snippet: r.content || r.snippet || "No description available",
        source: new URL(r.url || "https://example.com").hostname,
        matchedSkills: skillMatches,
        matchScore: matchScore,
        relevanceScore: Math.round(relevanceScore),
        published: r.published_date || ""
      };
    });

    // Sort by match score first, then by relevance score
    return results.sort((a, b) => {
      if (b.matchScore !== a.matchScore) return b.matchScore - a.matchScore;
      return b.relevanceScore - a.relevanceScore;
    });
  } catch (err) {
    console.error("searchJobs error:", err.response?.data || err.message);
    return [];
  }
}

/**
 * jobAgent - main agent function
 * - message: user message from client
 * - skills: array of skills from parsed resume
 * - preferences: {title, location, remote} from user input
 */
async function jobAgent(message, skills = [], preferences = {}) {
  try {
    const skillsText = Array.isArray(skills) ? skills.join(", ") : String(skills);

    // Check if this is a job search request (explicit or implicit)
    const isJobSearchRequest = 
      message.toLowerCase().includes("job") ||
      message.toLowerCase().includes("search") ||
      message.toLowerCase().includes("find") ||
      message.toLowerCase().includes("opportunities") ||
      message.toLowerCase().includes("position") ||
      message.toLowerCase().includes("based on my resume");

    // If it's clearly a job search request, go straight to search
    if (isJobSearchRequest && skills && skills.length > 0) {
      console.log("Detected job search request with skills:", skills);
      
      // Use Gemini to intelligently create search query based on ALL skills
      const skillAnalysisPrompt = `Given these skills from a resume: ${skillsText}

Analyze the skills and create a concise job search query (max 50 characters) that best represents this candidate's expertise.
Focus on the most prominent/senior skills first.

Return ONLY the search query text, nothing else. Examples:
- "Senior Full Stack Developer"
- "Python Machine Learning Engineer"
- "React Frontend Developer"
- "DevOps Engineer"

Skills: ${skillsText}
Job search query:`;

      let searchQuery = preferences.title;
      
      if (!searchQuery) {
        try {
          console.log("Using Gemini to analyze skills and create search query...");
          const queryResult = await model.generateContent(skillAnalysisPrompt);
          const queryText = queryResult.response.text().trim();
          searchQuery = queryText.replace(/['"]/g, '').substring(0, 100); // Clean and limit
          console.log("Gemini generated search query:", searchQuery);
        } catch (err) {
          console.error("Error generating query with Gemini:", err.message);
          // Fallback: use top 3 skills
          const topSkills = skills.slice(0, 3).join(" ");
          searchQuery = `${topSkills} developer jobs`;
        }
      }
      
      console.log('Final search query:', searchQuery);
      const results = await searchJobs(searchQuery, skills, preferences, 6
        
      );

      if (results.length === 0) {
        return "I couldn't find any job openings matching your criteria. Try adjusting your search preferences or check back later.";
      }

      // Format results for display with better information
      let response = `🎯 I found **${results.length} job opportunities** matching your profile!\n\n`;
      response += `📊 Analyzing against **${skills.length} skills** from your resume\n\n`;
      response += `---\n\n`;
      
      results.forEach((job, idx) => {
        response += `### ${idx + 1}. ${job.title}\n`;
        response += `**Company:** ${job.source}\n`;
        response += `**Match Score:** ${job.matchScore}/${skills.length} skills (${job.relevanceScore}% relevant)\n`;
        
        if (job.matchedSkills.length > 0) {
          response += `**✓ Matched Skills:** ${job.matchedSkills.slice(0, 5).join(", ")}`;
          if (job.matchedSkills.length > 5) {
            response += ` +${job.matchedSkills.length - 5} more`;
          }
          response += `\n`;
        }
        
        response += `**Description:** ${job.snippet.substring(0, 200)}${job.snippet.length > 200 ? '...' : ''}\n`;
        response += `🔗 [Apply Here](${job.url})\n\n`;
      });

      response += "---\n\n";
      response += "💡 **Tips:**\n";
      response += "- Jobs are ranked by skill match score\n";
      response += "- You can refine your search by setting location or job title preferences\n";
      response += "- Ask me to search for specific roles like 'Senior Frontend Developer'\n";
      
      return response;
    }

    // For non-job-search messages, provide helpful career advice
    return "Hello! I'm your Job Hunter assistant. I can help you find job opportunities based on your resume skills. Just ask me to 'find jobs' or 'search for positions' and I'll suggest relevant opportunities!";
    
  } catch (err) {
    console.error("jobAgent error:", err);
    return "I'm having trouble processing your request. Please try again.";
  }
}

module.exports = { jobAgent };
