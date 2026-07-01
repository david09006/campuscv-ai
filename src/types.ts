/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

export interface CVEducation {
  id: string;
  institution: string;
  degree: string;
  startDate: string;
  endDate: string;
  description: string;
}

export interface CVExperience {
  id: string;
  company: string;
  position: string;
  startDate: string;
  endDate: string;
  description: string;
}

export interface CVProject {
  id: string;
  name: string;
  role: string;
  technologies: string;
  description: string;
}

export interface CVSettings {
  primaryColor: string;
  fontFamily: 'sans' | 'serif' | 'mono';
  spacing: 'compact' | 'normal' | 'relaxed';
}

export interface CVLanguage {
  id: string;
  language: string;
  level: string;
}

export interface CVData {
  personalInfo: {
    fullName: string;
    email: string;
    phone: string;
    location: string;
    linkedin?: string;
    portfolio?: string;
    targetRole: string;
  };
  summary: string;
  education: CVEducation[];
  experience: CVExperience[];
  projects: CVProject[];
  skills: string[];
  languages: CVLanguage[];
  certifications: string[];
  interests: string[];
  settings: CVSettings;
}

export type CVTemplate = 'modern' | 'classic' | 'brutalist' | 'minimal' | 'europass' | 'corporate' | 'creative' | 'tech' | 'academic' | 'retro';

export interface Job {
  id: string;
  title: string;
  company: string;
  domain: string;
  location: string;
  type: string; // internship, junior, etc
  remote: boolean;
  matchScore: number;
  description: string;
  postedAt: string;
  source?: 'CampusCV' | 'LinkedIn' | 'Indeed' | 'Glassdoor' | 'Google Jobs' | 'Featured';
  url?: string;
}
