
const express = require("express");
const multer = require("multer");
const cors = require("cors");
require("dotenv").config();

const extractTextFromPDF = require("./parser/extractText");
const { jobAgent } = require("./agents/jobAgent");

// Fallback text extraction functions
function extractNameFromText(text) {
  const nameMatch = text.match(/name[:\s]*([^\n,]+)/i);
  return nameMatch ? nameMatch[1].trim() : "";
}

function extractEmailFromText(text) {
  const emailMatch = text.match(/([a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,})/);
  return emailMatch ? emailMatch[1] : "";
}

function extractSkillsFromText(text) {
  const skillsMatch = text.match(/skills[:\s]*([^\n]+)/i);
  if (skillsMatch) {
    return skillsMatch[1].split(/[,;|]/).map(s => s.trim()).filter(Boolean);
  }
  return [];
}

// configure
const PORT = process.env.PORT || 5000;
const upload = multer();

const app = express();
app.use(cors({
  origin: process.env.FRONTEND_ORIGIN || "http://localhost:5173",
  credentials: true
}));
app.use(express.json({ limit: "1mb" }));

// health
app.get("/", (req, res) => res.send("Resume Agent backend running"));

// Test Gemini API endpoint
app.get("/test-gemini", async (req, res) => {
  try {
    console.log("=== TESTING GEMINI API ===");
    const { GoogleGenerativeAI } = require("@google/generative-ai");
    const gen = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
    const model = gen.getGenerativeModel({ model: "gemini-2.5-flash" });

    const testPrompt = "Return just the number 42 as JSON: {\"number\": 42}";
    console.log("Test prompt:", testPrompt);
    
    const result = await model.generateContent(testPrompt);
    console.log("Gemini test response:", result);
    
    const response = result.response;
    const text = response.text();
    console.log("Test response text:", text);
    
    res.json({ 
      success: true, 
      response: text,
      message: "Gemini API is working"
    });
  } catch (error) {
    console.error("Gemini API test failed:", error);
    res.status(500).json({ 
      success: false, 
      error: error.message,
      stack: error.stack
    });
  }
});

// Parse resume endpoint
app.post("/parse-resume", upload.single("file"), async (req, res) => {
  try {
    if (!req.file) return res.status(400).json({ error: "No file uploaded" });

    // Extract text from PDF buffer (we only handle PDF here; you can extend to DOCX)
    const text = await extractTextFromPDF(req.file.buffer);
    
    // Check if we got text from the PDF
    if (!text || text.trim().length === 0) {
      return res.status(400).json({ error: "Could not extract text from PDF. Please ensure the file is readable." });
    }
    
    console.log("Extracted text length:", text.length);
    console.log("First 200 characters:", text.substring(0, 200));

    // Call Gemini to parse structured fields
    const { GoogleGenerativeAI } = require("@google/generative-ai");
    const gen = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
    const model = gen.getGenerativeModel({ model: "gemini-2.5-flash" });

    // Truncate text if it's too long (Gemini has token limits)
    const maxTextLength = 8000; // Approximately 2000 tokens
    const truncatedText = text.length > maxTextLength ? text.substring(0, maxTextLength) + "..." : text;

    const prompt = `Parse this resume and return only JSON:

{"name":"","email":"","skills":[],"education":[],"experience":[]}

Resume: ${truncatedText}`;

    console.log("=== GEMINI API DEBUG START ===");
    console.log("API Key present:", !!process.env.GEMINI_API_KEY);
    console.log("API Key length:", process.env.GEMINI_API_KEY ? process.env.GEMINI_API_KEY.length : 0);
    console.log("API Key prefix:", process.env.GEMINI_API_KEY ? process.env.GEMINI_API_KEY.substring(0, 10) + "..." : "NONE");
    console.log("Model name:", "gemini-2.5-flash");
    console.log("Prompt length:", prompt.length);
    console.log("Text length before truncation:", text.length);
    console.log("Truncated text length:", truncatedText.length);
    console.log("First 200 chars of extracted text:", text.substring(0, 200));
    console.log("=== CALLING GEMINI API ===");

    const parseRes = await model.generateContent({
      contents: [{ role: "user", parts: [{ text: prompt }] }],
      generationConfig: {
        temperature: 0.0,
        maxOutputTokens: 1024
      }
    });

    console.log("=== GEMINI API RESPONSE DEBUG ===");
    console.log("parseRes exists:", !!parseRes);
    console.log("parseRes.response exists:", !!parseRes?.response);
    console.log("parseRes type:", typeof parseRes);
    console.log("parseRes keys:", parseRes ? Object.keys(parseRes) : "none");
    
    if (parseRes?.response) {
      console.log("response keys:", Object.keys(parseRes.response));
      console.log("response.candidates exists:", !!parseRes.response.candidates);
      console.log("response.candidates length:", parseRes.response.candidates ? parseRes.response.candidates.length : 0);
    }

    // Extract text from parseRes (using correct Gemini API response structure)
    let parsedText = "";
    try {
      console.log("Attempting to extract text...");
      if (parseRes?.response?.text) {
        console.log("Method 1: Using parseRes.response.text()");
        parsedText = parseRes.response.text();
      } else if (parseRes?.response?.candidates?.[0]?.content?.parts?.[0]?.text) {
        console.log("Method 2: Using candidates[0].content.parts[0].text");
        parsedText = parseRes.response.candidates[0].content.parts[0].text;
      } else {
        console.log("Method 3: Converting parseRes to string");
        parsedText = String(parseRes);
      }
      console.log("Text extraction successful, length:", parsedText.length);
    } catch (e) {
      console.error("Error extracting text from Gemini response:", e.message);
      console.error("Error stack:", e.stack);
      parsedText = String(parseRes);
    }

    console.log("Raw Gemini response length:", parsedText.length);
    console.log("Raw Gemini response:", parsedText);
    console.log("Response is empty:", !parsedText || parsedText.trim() === "");
    console.log("=== END GEMINI DEBUG ===");

    // Try to parse JSON. If it fails, return raw text too.
    let parsed = { name: "", email: "", skills: [], education: [], experience: [] };
    try {
      // Clean the response text
      let cleanedText = parsedText.trim();
      
      // Remove markdown code blocks if present
      if (cleanedText.includes('```')) {
        cleanedText = cleanedText.replace(/```json\s*/g, '').replace(/```\s*/g, '');
      }
      
      // Extract JSON object - look for the first complete JSON object
      const jsonMatch = cleanedText.match(/\{[\s\S]*\}/);
      if (!jsonMatch) {
        throw new Error("No JSON object found in response");
      }
      
      const jsonStr = jsonMatch[0];
      console.log("Extracted JSON string:", jsonStr); // Debug log
      
      parsed = JSON.parse(jsonStr);
      console.log("Successfully parsed JSON:", parsed); // Debug log
      
    } catch (err) {
      console.warn("Failed to parse JSON from model:", err.message);
      console.warn("Raw response was:", parsedText);
      
      // Fallback: create structured data from text analysis
      parsed = {
        name: extractNameFromText(parsedText),
        email: extractEmailFromText(parsedText),
        skills: extractSkillsFromText(parsedText),
        education: [],
        experience: []
      };
      
      return res.json({ 
        parsed, 
        fallback: true, 
        raw: parsedText,
        note: "Used fallback extraction due to JSON parsing failure"
      });
    }

    // Normalize fields
    parsed.skills = Array.isArray(parsed.skills) ? parsed.skills : (typeof parsed.skills === "string" ? parsed.skills.split(/,|\n/).map(s => s.trim()).filter(Boolean) : []);
    parsed.education = Array.isArray(parsed.education) ? parsed.education : [];
    parsed.experience = Array.isArray(parsed.experience) ? parsed.experience : [];

    res.json({ parsed });
  } catch (err) {
    console.error("parse-resume error:", err);
    res.status(500).json({ error: err.message || String(err) });
  }
});

// Chat endpoint - Job Hunter
app.post("/chat", async (req, res) => {
  try {
    const { message, skills, preferences, autoSuggest } = req.body || {};
    if (!message) return res.status(400).json({ error: "message is required" });

    // For auto-suggestions, provide better context
    let contextMessage = message;
    if (autoSuggest && skills && skills.length > 0) {
      contextMessage = `Based on my resume with skills: ${skills.join(", ")}, find and suggest relevant job opportunities for me.`;
    }

    const reply = await jobAgent(contextMessage, skills || [], preferences || {});
    res.json({ reply });
  } catch (err) {
    console.error("chat error:", err);
    res.status(500).json({ error: err.message || String(err) });
  }
});

app.listen(PORT, () => console.log(`Server running on http://localhost:${PORT}`));
