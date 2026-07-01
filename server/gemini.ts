/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

// Server-only module: never import this from src/ (client bundle).
// It is the sole place allowed to read GEMINI_API_KEY and call @google/genai.

import { GoogleGenAI, Type } from "@google/genai";
import { CVData, Job } from "../src/types";

let aiInstance: GoogleGenAI | null = null;

function getAI() {
  if (!aiInstance) {
    const apiKey = process.env.GEMINI_API_KEY;
    if (!apiKey) {
      throw new Error("GEMINI_API_KEY is not configured. Please add it to your secrets.");
    }
    aiInstance = new GoogleGenAI({ apiKey });
  }
  return aiInstance;
}

export async function searchExternalJobs(query: string, language: string = 'en'): Promise<Job[]> {
  const ai = getAI();
  const prompt = `
    Find 8-10 ACTUAL, CURRENTLY ACTIVE job or internship openings for "${query}" from official platforms like LinkedIn, Indeed, Glassdoor, or official company careers pages.
    DANGER: Do NOT return made-up, placeholder, or expired jobs. ONLY return real data available on the web TODAY (May 2026 context).

    For each job, search specifically for its existence on the live web.
    Return the data as a JSON array of Job objects.
    Each Job MUST have:
    - id: a unique string (ideally a hash or the source-specific ID)
    - title: the exact job title from the source listing
    - company: the official company name
    - domain: like "Tech", "Design", "Marketing", "Finance"
    - location: the specific city or "Remote"
    - type: "Internship", "Full-time", or "Junior"
    - remote: boolean
    - matchScore: a number between 70-98 representing relevance to "${query}"
    - description: a concise 2-sentence summary extracted directly from the requirements or responsibilities
    - postedAt: the actual ISO date string from the source (use today's date if very recent)
    - source: "LinkedIn", "Indeed", "Glassdoor", "Google Jobs", or the specific Company Portal name
    - url: a DIRECT, VALID, WORKING URL to the actual job posting. Do NOT provide generic URLs like "https://google.com/jobs".

    Translate titles and descriptions to ${language === 'ro' ? 'Romanian' : 'English'} but keep company names as they are.
  `;

  let text: string;
  try {
    const response = await ai.models.generateContent({
      model: "gemini-3-flash-preview",
      contents: prompt,
      config: {
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.ARRAY,
          items: {
            type: Type.OBJECT,
            properties: {
              id: { type: Type.STRING },
              title: { type: Type.STRING },
              company: { type: Type.STRING },
              domain: { type: Type.STRING },
              location: { type: Type.STRING },
              type: { type: Type.STRING },
              remote: { type: Type.BOOLEAN },
              matchScore: { type: Type.NUMBER },
              description: { type: Type.STRING },
              postedAt: { type: Type.STRING },
              source: { type: Type.STRING },
              url: { type: Type.STRING }
            },
            required: ["id", "title", "company", "domain", "location", "type", "remote", "matchScore", "description", "postedAt", "url", "source"]
          }
        },
        tools: [{ googleSearch: {} }]
      }
    });

    text = response.text?.trim() ?? "[]";
  } catch (error) {
    console.error("Error calling Gemini for job search:", error);
    return [];
  }

  try {
    const parsed = JSON.parse(text);
    if (!Array.isArray(parsed)) {
      console.error("Gemini job search response was not a JSON array:", text);
      return [];
    }
    return parsed as Job[];
  } catch (parseError) {
    console.error("Failed to parse Gemini job search response as JSON:", parseError, text);
    return [];
  }
}

export async function generateCVContent(data: Partial<CVData>, language: string = 'en'): Promise<string> {
  const ai = getAI();
  const prompt = `
    You are a professional CV consultant. Create a professional, persuasive, and clear CV content based on the following student information.
    The goal is to highlight their potential, projects, and skills for entry-level roles or internships.

    Student Data:
    ${JSON.stringify(data, null, 2)}

    Output the CV in a clear Markdown format with sections like "Professional Summary", "Experience", "Education", "Projects", and "Key Skills".
    Use strong action verbs and quantify achievements if any information was provided.
    Use ${language} language for the output.
  `;

  try {
    const response = await ai.models.generateContent({
      model: "gemini-3-flash-preview",
      contents: prompt,
    });
    return response.text ?? "";
  } catch (error) {
    console.error("Error generating CV content:", error);
    throw new Error("Failed to generate CV content via AI.");
  }
}

export async function getImprovementSuggestions(section: string, content: string, language: string = 'en'): Promise<string[]> {
  const ai = getAI();
  const languageName = language === 'ro' ? 'Romanian' : language === 'fr' ? 'French' : language === 'de' ? 'German' : 'English';
  const prompt = `
    Analyze this CV section: [${section}]
    Content: "${content}"

    Provide 3 concise, actionable suggestions to make this section more professional or impactful for a recruiter.
    Return only a JSON array of strings in ${languageName}.
  `;

  let text: string;
  try {
    const response = await ai.models.generateContent({
      model: "gemini-3-flash-preview",
      contents: prompt,
      config: {
        responseMimeType: "application/json",
      }
    });
    text = response.text?.trim() ?? "[]";
  } catch (error) {
    console.error("Error getting suggestions:", error);
    return [];
  }

  try {
    const parsed = JSON.parse(text);
    if (!Array.isArray(parsed)) {
      console.error("Gemini suggestions response was not a JSON array:", text);
      return [];
    }
    return parsed as string[];
  } catch (parseError) {
    console.error("Failed to parse Gemini suggestions response as JSON:", parseError, text);
    return [];
  }
}
