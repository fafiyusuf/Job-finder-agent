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
      // Calculate skill match score
      const content = `${r.title || ""} ${r.content || ""} ${r.snippet || ""}`.toLowerCase();
      const skillMatches = skills.filter(skill => content.includes(skill.toLowerCase()));
      const matchScore = skillMatches.length;

      return {
        title: r.title || "Job Opening",
        url: r.url || "",
        snippet: r.content || r.snippet || "No description available",
        source: new URL(r.url || "https://example.com").hostname,
        matchedSkills: skillMatches,
        matchScore: matchScore,
        published: r.published_date || ""
      };
    });

    // Sort by skill match score descending
    return results.sort((a, b) => b.matchScore - a.matchScore);
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
      console.log("Detected job search request, proceeding directly to search...");
      
      // Perform job search with simplified query
      let searchQuery;
      if (preferences.title) {
        searchQuery = preferences.title;
      } else {
        // Build simple query based on top skills
        const topSkills = skills.slice(0, 3); // Limit to top 3 skills
        if (topSkills.includes('React') || topSkills.includes('React.js')) {
          searchQuery = 'React developer jobs';
        } else if (topSkills.includes('Python')) {
          searchQuery = 'Python developer jobs';
        } else if (topSkills.includes('Java')) {
          searchQuery = 'Java developer jobs';
        } else if (topSkills.some(s => s.toLowerCase().includes('full stack'))) {
          searchQuery = 'full stack developer jobs';
        } else {
          searchQuery = 'software developer jobs';
        }
      }
      
      console.log('Built search query:', searchQuery);
      const results = await searchJobs(searchQuery, skills, preferences, 10);

      if (results.length === 0) {
        return "I couldn't find any job openings matching your criteria. Try adjusting your search preferences or check back later.";
      }

      // Format results for display
      let response = `I found ${results.length} job opportunities that match your skills:\n\n`;
      
      results.forEach((job, idx) => {
        response += `**${idx + 1}. ${job.title}**\n`;
        response += `Company/Source: ${job.source}\n`;
        response += `Match Score: ${job.matchScore}/${skills.length} skills matched\n`;
        if (job.matchedSkills.length > 0) {
          response += `Matched Skills: ${job.matchedSkills.join(", ")}\n`;
        }
        response += `Description: ${job.snippet.substring(0, 150)}...\n`;
        response += `🔗 [Apply Here](${job.url})\n\n`;
      });

      response += "Would you like me to search for more specific roles or adjust the criteria?";
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
