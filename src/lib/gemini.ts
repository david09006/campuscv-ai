/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

// Client-side wrapper: calls our own /api routes. No Gemini API key or
// @google/genai import belongs here — that logic lives in server/gemini.ts.

import { CVData, Job } from "../types";

async function parseErrorMessage(res: Response, fallback: string): Promise<string> {
  try {
    const body = await res.json();
    return typeof body?.error === "string" ? body.error : fallback;
  } catch {
    return fallback;
  }
}

export async function searchExternalJobs(query: string, language: string = 'en'): Promise<Job[]> {
  const res = await fetch('/api/jobs/search', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ query, language }),
  });
  if (!res.ok) {
    throw new Error(await parseErrorMessage(res, 'Failed to search jobs.'));
  }
  return res.json();
}

export async function generateCVContent(data: Partial<CVData>, language: string = 'en'): Promise<string> {
  const res = await fetch('/api/cv/generate', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ data, language }),
  });
  if (!res.ok) {
    throw new Error(await parseErrorMessage(res, 'Failed to generate CV content.'));
  }
  const json = await res.json();
  return json.content ?? "";
}

export async function getImprovementSuggestions(section: string, content: string, language: string = 'en'): Promise<string[]> {
  const res = await fetch('/api/cv/suggestions', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ section, content, language }),
  });
  if (!res.ok) {
    throw new Error(await parseErrorMessage(res, 'Failed to get suggestions.'));
  }
  const json = await res.json();
  return json.suggestions ?? [];
}
