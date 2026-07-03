import React, { useState, useRef } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import {
  User, Mail, Phone, MapPin, Briefcase, GraduationCap,
  Code, Award, Heart, Plus, Trash2, Sparkles, Download,
  FileText, Layout, RotateCcw, ChevronRight, CheckCircle2,
  Target, X, ChevronLeft, Palette, Type, Ruler, Linkedin, Globe,
  AlertCircle, Loader2, type LucideIcon
} from 'lucide-react';
import { generateCVContent } from '../lib/gemini';
import { CVData, CVTemplate } from '../types';
import jsPDF from 'jspdf';
import html2canvas from 'html2canvas';

const INITIAL_DATA: CVData = {
  personalInfo: {
    fullName: '',
    email: '',
    phone: '',
    location: '',
    linkedin: '',
    portfolio: '',
    targetRole: '',
  },
  summary: '',
  education: [],
  experience: [],
  projects: [],
  skills: [],
  languages: [],
  certifications: [],
  interests: [],
  settings: {
    primaryColor: '#2563eb', // blue-600
    fontFamily: 'sans',
    spacing: 'normal',
  },
};

import { Language, TRANSLATIONS } from '../lib/i18n';

export default function ResumeBuilder({ lang = 'en', isDarkMode = false }: { lang?: Language, isDarkMode?: boolean }) {
  const [data, setData] = useState<CVData>(INITIAL_DATA);
  const [isGenerating, setIsGenerating] = useState(false);
  const [generationError, setGenerationError] = useState<string | null>(null);
  const [template, setTemplate] = useState<CVTemplate>('modern');
  const [currentStep, setCurrentStep] = useState(0);
  const previewRef = useRef<HTMLDivElement>(null);

  const t = TRANSLATIONS[lang];

  const steps = [
    { title: t.builder.personalInfo, icon: User },
    { title: t.builder.expProjects, icon: Briefcase },
    { title: t.builder.eduSkills, icon: GraduationCap },
    { title: t.builder.finalize, icon: Sparkles },
  ];

  const handlePersonalInfoChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setData(prev => ({
      ...prev,
      personalInfo: { ...prev.personalInfo, [name]: value }
    }));
  };

  type ListField = 'education' | 'experience' | 'projects' | 'languages';

  const addItem = <K extends ListField>(field: K, defaultItem: CVData[K][number]) => {
    setData(prev => ({
      ...prev,
      [field]: [...prev[field], defaultItem]
    }));
  };

  const removeItem = (field: ListField, index: number) => {
    setData(prev => ({
      ...prev,
      [field]: prev[field].filter((_, i) => i !== index)
    }));
  };

  const updateItem = <K extends ListField>(field: K, index: number, value: CVData[K][number]) => {
    setData(prev => ({
      ...prev,
      [field]: prev[field].map((item, i) => i === index ? value : item)
    }));
  };

  const handleGenerateAI = async () => {
    setIsGenerating(true);
    setGenerationError(null);
    try {
      const result = await generateCVContent(data, lang);
      setData(prev => ({ ...prev, summary: result }));
      setCurrentStep(3);
    } catch (error) {
      console.error(error);
      setGenerationError(error instanceof Error ? error.message : t.builder.generationErrorGeneric);
    } finally {
      setIsGenerating(false);
    }
  };

  const exportToPDF = async () => {
    if (!previewRef.current) return;
    const canvas = await html2canvas(previewRef.current, {
      scale: 2,
      useCORS: true,
      logging: false,
    });
    const imgData = canvas.toDataURL('image/png');
    const pdf = new jsPDF('p', 'mm', 'a4');
    const imgProps = pdf.getImageProperties(imgData);
    const pdfWidth = pdf.internal.pageSize.getWidth();
    const pdfHeight = (imgProps.height * pdfWidth) / imgProps.width;
    pdf.addImage(imgData, 'PNG', 0, 0, pdfWidth, pdfHeight);
    pdf.save(`${data.personalInfo.fullName || 'CV'}-CampusCV.pdf`);
  };

  return (
    <div className="flex flex-col lg:flex-row h-[calc(100vh-64px)] overflow-hidden bg-background text-ink">
      {/* Sidebar - Form */}
      <div className="w-full lg:w-[450px] border-r border-border bg-surface flex flex-col h-full z-10">
        <div className="p-6 border-b border-border flex items-center justify-between">
          <div>
            <h2 className="font-display text-[21px] font-medium text-ink">{t.builder.title}</h2>
            <p className="text-sm text-muted">{t.builder.step} {currentStep + 1} {t.builder.of} {steps.length}</p>
          </div>
          <button
            onClick={() => setData(INITIAL_DATA)}
            className="flex h-11 w-11 items-center justify-center rounded-control text-muted transition-colors hover:bg-destructive-tint hover:text-destructive cursor-pointer focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-accent"
            title={t.builder.reset}
          >
            <RotateCcw size={18} />
          </button>
        </div>

        {/* Steps Indicator */}
        <div className="flex px-6 pt-4 gap-2">
          {steps.map((step, idx) => (
            <div
              key={idx}
              className={`h-1.5 flex-1 rounded-full transition-all duration-300 relative ${
                idx <= currentStep ? 'bg-accent' : 'bg-border'
              }`}
            >
              <div className={`absolute -top-6 left-1/2 -translate-x-1/2 text-[10px] font-semibold transition-colors ${
                idx <= currentStep ? 'text-accent' : 'text-muted'
              }`}>
                0{idx + 1}
              </div>
            </div>
          ))}
        </div>
        <p className="px-6 pt-3 text-xs font-medium uppercase tracking-[0.08em] text-muted">{steps[currentStep].title}</p>

        <div className="flex-1 overflow-y-auto p-6 space-y-8 custom-scrollbar">
          <AnimatePresence mode="wait">
            <motion.div
              key={currentStep}
              initial={{ opacity: 0, x: 12 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -12 }}
              transition={{ duration: 0.2, ease: 'easeOut' }}
              className="space-y-6"
            >
              {currentStep === 0 && (
                <div className="space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <InputField label={t.builder.fullName} name="fullName" value={data.personalInfo.fullName} onChange={handlePersonalInfoChange} icon={User} placeholder="Popescu Ion" />
                    <InputField label={t.builder.email} name="email" value={data.personalInfo.email} onChange={handlePersonalInfoChange} icon={Mail} placeholder="ion@email.com" />
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <InputField label={t.builder.phone} name="phone" value={data.personalInfo.phone} onChange={handlePersonalInfoChange} icon={Phone} placeholder="07xx xxx xxx" />
                    <InputField label={t.builder.location} name="location" value={data.personalInfo.location} onChange={handlePersonalInfoChange} icon={MapPin} placeholder="București, RO" />
                  </div>
                  <InputField label={t.builder.targetRole} name="targetRole" value={data.personalInfo.targetRole} onChange={handlePersonalInfoChange} icon={Target} placeholder="Junior Frontend Developer" />
                  <div className="grid grid-cols-2 gap-4">
                    <InputField label={t.builder.linkedin} name="linkedin" value={data.personalInfo.linkedin} onChange={handlePersonalInfoChange} icon={Linkedin} placeholder="linkedin.com/in/username" />
                    <InputField label={t.builder.portfolio} name="portfolio" value={data.personalInfo.portfolio} onChange={handlePersonalInfoChange} icon={Globe} placeholder="github.com/username" />
                  </div>
                </div>
              )}

              {currentStep === 1 && (
                <div className="space-y-8">
                  <div>
                    <SectionHeader title={t.builder.experience} icon={Briefcase} onAdd={() => addItem('experience', { id: crypto.randomUUID(), company: '', position: '', startDate: '', endDate: '', description: '' })} />
                    <div className="space-y-4 mt-4">
                      {data.experience.length === 0 && (
                        <div className="rounded-card border border-dashed border-border px-4 py-8 text-center">
                          <Briefcase size={20} className="text-muted/60 mx-auto" />
                          <p className="text-sm text-muted mt-2">{t.builder.addBtn}</p>
                        </div>
                      )}
                      {data.experience.map((exp, idx) => (
                        <div key={exp.id} className="rounded-card border border-border bg-background p-4 space-y-3 relative group">
                          <button
                            onClick={() => removeItem('experience', idx)}
                            className="absolute -top-2 -right-2 z-10 flex h-9 w-9 items-center justify-center rounded-control border border-border bg-surface text-muted opacity-0 shadow-card transition-all group-hover:opacity-100 focus-visible:opacity-100 hover:bg-destructive-tint hover:text-destructive cursor-pointer focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-accent"
                          >
                            <Trash2 size={14} />
                          </button>
                          <div className="space-y-3">
                            <div className="grid grid-cols-2 gap-3">
                              <input
                                className="w-full h-11 rounded-control border border-border bg-surface px-3.5 text-sm text-ink placeholder:text-muted/60 outline-none transition-colors focus:border-accent focus:ring-2 focus:ring-accent/25"
                                placeholder={t.builder.company}
                                value={exp.company}
                                onChange={e => updateItem('experience', idx, { ...exp, company: e.target.value })}
                              />
                              <input
                                className="w-full h-11 rounded-control border border-border bg-surface px-3.5 text-sm text-ink placeholder:text-muted/60 outline-none transition-colors focus:border-accent focus:ring-2 focus:ring-accent/25"
                                placeholder={t.builder.position}
                                value={exp.position}
                                onChange={e => updateItem('experience', idx, { ...exp, position: e.target.value })}
                              />
                            </div>
                            <textarea
                              className="w-full h-auto rounded-control border border-border bg-surface px-3.5 py-2.5 text-sm text-ink placeholder:text-muted/60 outline-none transition-colors focus:border-accent focus:ring-2 focus:ring-accent/25 resize-none"
                              rows={3}
                              placeholder={t.builder.descPlaceholder}
                              value={exp.description}
                              onChange={e => updateItem('experience', idx, { ...exp, description: e.target.value })}
                            />
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>

                  <div>
                    <SectionHeader title={t.builder.projects} icon={Code} onAdd={() => addItem('projects', { id: crypto.randomUUID(), name: '', role: '', technologies: '', description: '' })} />
                    <div className="space-y-4 mt-4">
                      {data.projects.length === 0 && (
                        <div className="rounded-card border border-dashed border-border px-4 py-8 text-center">
                          <Code size={20} className="text-muted/60 mx-auto" />
                          <p className="text-sm text-muted mt-2">{t.builder.addBtn}</p>
                        </div>
                      )}
                      {data.projects.map((proj, idx) => (
                        <div key={proj.id} className="rounded-card border border-border bg-background p-4 space-y-3 relative group">
                           <button
                             onClick={() => removeItem('projects', idx)}
                             className="absolute -top-2 -right-2 z-10 flex h-9 w-9 items-center justify-center rounded-control border border-border bg-surface text-muted opacity-0 shadow-card transition-all group-hover:opacity-100 focus-visible:opacity-100 hover:bg-destructive-tint hover:text-destructive cursor-pointer focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-accent"
                           >
                            <Trash2 size={14} />
                          </button>
                          <div className="space-y-3">
                            <input
                              className="w-full h-11 rounded-control border border-border bg-surface px-3.5 text-sm text-ink placeholder:text-muted/60 outline-none transition-colors focus:border-accent focus:ring-2 focus:ring-accent/25"
                              placeholder={t.builder.projectName}
                              value={proj.name}
                              onChange={e => updateItem('projects', idx, { ...proj, name: e.target.value })}
                            />
                            <input
                              className="w-full h-11 rounded-control border border-border bg-surface px-3.5 text-xs font-mono text-muted placeholder:text-muted/60 outline-none transition-colors focus:border-accent focus:ring-2 focus:ring-accent/25"
                              placeholder={t.builder.techPlaceholder}
                              value={proj.technologies}
                              onChange={e => updateItem('projects', idx, { ...proj, technologies: e.target.value })}
                            />
                            <textarea
                              className="w-full h-auto rounded-control border border-border bg-surface px-3.5 py-2.5 text-sm text-ink placeholder:text-muted/60 outline-none transition-colors focus:border-accent focus:ring-2 focus:ring-accent/25 resize-none"
                              rows={2}
                              placeholder={t.builder.shortDesc}
                              value={proj.description}
                              onChange={e => updateItem('projects', idx, { ...proj, description: e.target.value })}
                            />
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              )}

              {currentStep === 2 && (
                <div className="space-y-8">
                  <div>
                    <SectionHeader title={t.builder.education} icon={GraduationCap} onAdd={() => addItem('education', { id: crypto.randomUUID(), institution: '', degree: '', startDate: '', endDate: '', description: '' })} />
                    <div className="space-y-4 mt-4">
                      {data.education.length === 0 && (
                        <div className="rounded-card border border-dashed border-border px-4 py-8 text-center">
                          <GraduationCap size={20} className="text-muted/60 mx-auto" />
                          <p className="text-sm text-muted mt-2">{t.builder.addBtn}</p>
                        </div>
                      )}
                      {data.education.map((edu, idx) => (
                        <div key={edu.id} className="rounded-card border border-border bg-background p-4 space-y-3 relative group">
                          <button
                            onClick={() => removeItem('education', idx)}
                            className="absolute -top-2 -right-2 z-10 flex h-9 w-9 items-center justify-center rounded-control border border-border bg-surface text-muted opacity-0 shadow-card transition-all group-hover:opacity-100 focus-visible:opacity-100 hover:bg-destructive-tint hover:text-destructive cursor-pointer focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-accent"
                          >
                            <Trash2 size={14} />
                          </button>
                          <div className="space-y-3">
                            <input
                              className="w-full h-11 rounded-control border border-border bg-surface px-3.5 text-sm text-ink placeholder:text-muted/60 outline-none transition-colors focus:border-accent focus:ring-2 focus:ring-accent/25"
                              placeholder={t.builder.institution}
                              value={edu.institution}
                              onChange={e => updateItem('education', idx, { ...edu, institution: e.target.value })}
                            />
                            <input
                              className="w-full h-11 rounded-control border border-border bg-surface px-3.5 text-sm text-ink placeholder:text-muted/60 outline-none transition-colors focus:border-accent focus:ring-2 focus:ring-accent/25"
                              placeholder={t.builder.degree}
                              value={edu.degree}
                              onChange={e => updateItem('education', idx, { ...edu, degree: e.target.value })}
                            />
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>

                  <div>
                     <SectionHeader title={t.builder.skills} icon={Code} />
                     <div className="mt-4 flex flex-wrap gap-2">
                        {data.skills.map((skill, idx) => (
                          <div key={skill} className="inline-flex items-center gap-1.5 rounded-full border border-accent/30 bg-accent-tint px-2.5 py-1 text-xs font-medium text-accent">
                            {skill}
                            <button onClick={() => setData(prev => ({...prev, skills: prev.skills.filter((_, i) => i !== idx)}))} className="text-accent/70 hover:text-accent transition-colors cursor-pointer focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-accent rounded-full"><X size={10} /></button>
                          </div>
                        ))}
                        <input
                          className="bg-transparent border-b border-border outline-none px-2 py-1 text-xs min-w-[80px] text-ink placeholder:text-muted/60 transition-colors focus:border-accent"
                          placeholder={`+ ${t.builder.addBtn}`}
                          onKeyDown={e => {
                            if (e.key === 'Enter') {
                              const val = e.currentTarget.value.trim();
                              if (val) {
                                setData(prev => ({...prev, skills: [...prev.skills, val]}));
                                e.currentTarget.value = '';
                              }
                            }
                          }}
                        />
                     </div>
                  </div>

                  <div>
                     <SectionHeader title={t.builder.certifications} icon={Award} />
                     <div className="mt-4 flex flex-wrap gap-2">
                        {data.certifications.map((cert, idx) => (
                          <div key={cert} className="inline-flex items-center gap-1.5 rounded-full border border-border bg-background px-2.5 py-1 text-xs font-medium text-muted">
                            {cert}
                            <button onClick={() => setData(prev => ({...prev, certifications: prev.certifications.filter((_, i) => i !== idx)}))} className="text-muted hover:text-ink transition-colors cursor-pointer focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-accent rounded-full"><X size={10} /></button>
                          </div>
                        ))}
                        <input
                          className="bg-transparent border-b border-border outline-none px-2 py-1 text-xs min-w-[80px] text-ink placeholder:text-muted/60 transition-colors focus:border-accent"
                          placeholder={`+ ${t.builder.addBtn}`}
                          onKeyDown={e => {
                            if (e.key === 'Enter') {
                              const val = e.currentTarget.value.trim();
                              if (val) {
                                setData(prev => ({...prev, certifications: [...prev.certifications, val]}));
                                e.currentTarget.value = '';
                              }
                            }
                          }}
                        />
                     </div>
                  </div>

                  <div>
                     <SectionHeader title={t.builder.interests} icon={Heart} />
                     <div className="mt-4 flex flex-wrap gap-2">
                        {data.interests.map((interest, idx) => (
                          <div key={idx} className="inline-flex items-center gap-1.5 rounded-full border border-clay/30 bg-clay-tint px-2.5 py-1 text-xs font-medium text-clay-text">
                            {interest}
                            <button onClick={() => setData(prev => ({...prev, interests: prev.interests.filter((_, i) => i !== idx)}))} className="text-clay-text/70 hover:text-clay-text transition-colors cursor-pointer focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-accent rounded-full"><X size={10} /></button>
                          </div>
                        ))}
                        <input
                          className="bg-transparent border-b border-border outline-none px-2 py-1 text-xs min-w-[80px] text-ink placeholder:text-muted/60 transition-colors focus:border-accent"
                          placeholder={`+ ${t.builder.addBtn}`}
                          onKeyDown={e => {
                            if (e.key === 'Enter') {
                              const val = e.currentTarget.value.trim();
                              if (val) {
                                setData(prev => ({...prev, interests: [...prev.interests, val]}));
                                e.currentTarget.value = '';
                              }
                            }
                          }}
                        />
                     </div>
                  </div>

                  <div>
                     <SectionHeader title={t.builder.languages} icon={Globe} onAdd={() => addItem('languages', { id: crypto.randomUUID(), language: '', level: '' })} />
                     <div className="space-y-4 mt-4">
                         {data.languages.length === 0 && (
                           <div className="rounded-card border border-dashed border-border px-4 py-8 text-center">
                             <Globe size={20} className="text-muted/60 mx-auto" />
                             <p className="text-sm text-muted mt-2">{t.builder.addBtn}</p>
                           </div>
                         )}
                         {data.languages.map((lang, idx) => (
                           <div key={lang.id} className="rounded-card border border-border bg-background p-4 relative group flex gap-3 items-center">
                             <button
                               onClick={() => removeItem('languages', idx)}
                               className="absolute -top-2 -right-2 z-10 flex h-9 w-9 items-center justify-center rounded-control border border-border bg-surface text-muted opacity-0 shadow-card transition-all group-hover:opacity-100 focus-visible:opacity-100 hover:bg-destructive-tint hover:text-destructive cursor-pointer focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-accent"
                             >
                                <Trash2 size={12} />
                             </button>
                             <div className="flex-1 grid grid-cols-2 gap-2">
                               <input
                                 className="w-full h-11 rounded-control border border-border bg-surface px-3.5 text-sm text-ink placeholder:text-muted/60 outline-none transition-colors focus:border-accent focus:ring-2 focus:ring-accent/25"
                                 placeholder={t.builder.languageName}
                                 value={lang.language}
                                 onChange={e => updateItem('languages', idx, { ...lang, language: e.target.value })}
                               />
                               <input
                                 className="w-full h-11 rounded-control border border-border bg-surface px-3.5 text-sm text-ink placeholder:text-muted/60 outline-none transition-colors focus:border-accent focus:ring-2 focus:ring-accent/25"
                                 placeholder={t.builder.proficiency}
                                 value={lang.level}
                                 onChange={e => updateItem('languages', idx, { ...lang, level: e.target.value })}
                               />
                             </div>
                          </div>
                        ))}
                     </div>
                  </div>
                </div>
              )}

              {currentStep === 3 && (
                <div className="space-y-6">
                  <div className="rounded-panel bg-accent dark:bg-accent-tint p-6">
                    <h3 className="font-display text-[18px] font-medium text-accent-contrast dark:text-ink mb-1.5">{t.builder.finalizeAI}</h3>
                    <p className="text-sm text-accent-contrast/80 dark:text-muted leading-relaxed mb-5">{t.builder.finalizeAIDesc}</p>
                    <button
                      onClick={handleGenerateAI}
                      disabled={isGenerating}
                      className="flex w-full h-11 items-center justify-center gap-2 rounded-control bg-surface text-sm font-semibold text-ink transition-colors hover:bg-background disabled:opacity-60 disabled:pointer-events-none cursor-pointer focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-accent-contrast dark:focus-visible:outline-ink"
                    >
                      {isGenerating ? (
                        <>
                          <Loader2 size={16} className="animate-spin" /> {t.builder.generateBtn}
                        </>
                      ) : (
                        t.builder.generateBtn
                      )}
                    </button>
                    {generationError && (
                      <div className="flex items-start gap-2 rounded-card border border-destructive/40 bg-surface p-3 text-sm text-destructive mt-4">
                        <AlertCircle size={16} className="shrink-0 mt-0.5" />
                        <span>{generationError}</span>
                      </div>
                    )}
                  </div>

                  <div>
                    <h4 className="text-sm font-semibold text-ink flex items-center gap-2 mb-3">
                      <Layout size={16} /> {t.builder.chooseTemplate}
                    </h4>
                    <div className="grid grid-cols-2 gap-3">
                      {(['modern', 'classic', 'brutalist', 'minimal', 'europass', 'corporate', 'creative', 'tech', 'academic', 'retro'] as CVTemplate[]).map((tmpl) => (
                        <button
                          key={tmpl}
                          onClick={() => setTemplate(tmpl)}
                          className={`p-3.5 rounded-card border text-left transition-all cursor-pointer focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-accent ${
                            template === tmpl
                              ? 'border-accent bg-accent-tint'
                              : 'border-border bg-surface hover:border-accent/40'
                          }`}
                        >
                          <span className={`text-sm capitalize block ${template === tmpl ? 'font-semibold text-accent' : 'font-medium text-ink'}`}>{tmpl}</span>
                          <span className="text-[11px] text-muted mt-0.5 block">
                            {tmpl === 'europass' || tmpl === 'corporate' ? 'Format Oficial' : tmpl === 'tech' ? 'Developer' : tmpl === 'academic' ? 'Times / Serif' : tmpl === 'creative' ? 'Modern 2-Col' : tmpl === 'retro' ? 'Vintage Warm' : 'Design optimizat'}
                          </span>
                        </button>
                      ))}
                    </div>
                  </div>

{/* Customization controls */}
<div className="rounded-card border border-border bg-surface p-5 space-y-5">
<h4 className="text-sm font-semibold text-ink flex items-center gap-2">
   <Palette size={16} /> {t.builder.customize}
</h4>

{/* Color picker */}
<div className="space-y-3">
   <label className="text-xs font-medium uppercase tracking-[0.08em] text-muted">{t.builder.primaryColor}</label>
                       <div className="flex gap-2">
                          {['#2563eb', '#1e293b', '#dc2626', '#16a34a', '#7c3aed', '#db2777'].map(color => (
                            <button
                              key={color}
                              onClick={() => setData(prev => ({...prev, settings: {...prev.settings, primaryColor: color}}))}
                              className={`w-8 h-8 rounded-full transition-all cursor-pointer focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-accent ${data.settings.primaryColor === color ? 'ring-2 ring-ink ring-offset-2 ring-offset-surface' : 'hover:ring-1 hover:ring-border'}`}
                              style={{ backgroundColor: color }}
                            />
                          ))}
                          <input
                            type="color"
                            value={data.settings.primaryColor}
                            onChange={e => setData(prev => ({...prev, settings: {...prev.settings, primaryColor: e.target.value}}))}
                            className="w-8 h-8 rounded-full overflow-hidden cursor-pointer bg-surface"
                          />
                       </div>
                    </div>

                    {/* Font picker */}
                    <div className="space-y-3">
                       <label className="text-xs font-medium uppercase tracking-[0.08em] text-muted">{t.builder.fontStyle}</label>
                       <div className="grid grid-cols-3 gap-2">
                          {(['sans', 'serif', 'mono'] as const).map(font => (
                            <button
                              key={font}
                              onClick={() => setData(prev => ({...prev, settings: {...prev.settings, fontFamily: font}}))}
                              className={`h-9 rounded-control border text-xs font-medium transition-colors cursor-pointer focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-accent ${
                                data.settings.fontFamily === font
                                  ? 'border-accent bg-accent-tint text-accent'
                                  : 'border-border text-muted hover:border-accent/40 hover:text-ink'
                              }`}
                            >
                               {font === 'sans' ? t.builder.fontSans : font === 'serif' ? t.builder.fontSerif : t.builder.fontMono}
                            </button>
                          ))}
                       </div>
                    </div>

                    {/* Spacing picker */}
                    <div className="space-y-3">
                       <label className="text-xs font-medium uppercase tracking-[0.08em] text-muted">{t.builder.spacing}</label>
                       <div className="grid grid-cols-3 gap-2">
                          {(['compact', 'normal', 'relaxed'] as const).map(sp => (
                            <button
                              key={sp}
                              onClick={() => setData(prev => ({...prev, settings: {...prev.settings, spacing: sp}}))}
                              className={`h-9 rounded-control border text-xs font-medium transition-colors cursor-pointer focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-accent ${
                                data.settings.spacing === sp
                                  ? 'border-accent bg-accent-tint text-accent'
                                  : 'border-border text-muted hover:border-accent/40 hover:text-ink'
                              }`}
                            >
                               {sp === 'compact' ? t.builder.spacingCompact : sp === 'normal' ? t.builder.spacingNormal : t.builder.spacingRelaxed}
                            </button>
                          ))}
                       </div>
                    </div>
                  </div>

                  <motion.button
                    whileTap={{ scale: 0.98 }}
                    onClick={exportToPDF}
                    className="inline-flex items-center justify-center gap-2 w-full h-12 rounded-control bg-accent text-accent-contrast text-sm font-semibold cursor-pointer transition-colors duration-200 hover:bg-accent-hover focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-accent active:translate-y-px"
                  >
                    <Download size={20} /> {t.builder.downloadPDF}
                  </motion.button>
                </div>
              )}
            </motion.div>
          </AnimatePresence>
        </div>

        {/* Footer Nav */}
        <div className="p-5 border-t border-border flex items-center justify-between bg-surface">
          <button
            onClick={() => setCurrentStep(Math.max(0, currentStep - 1))}
            disabled={currentStep === 0}
            className="flex h-11 items-center gap-2 text-sm font-medium text-muted hover:text-ink transition-colors disabled:opacity-40 cursor-pointer focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-accent"
          >
            <ChevronLeft size={18} /> {t.builder.back}
          </button>

          <button
            onClick={() => {
              if (currentStep < steps.length - 1) {
                setCurrentStep(currentStep + 1);
              }
            }}
            className="inline-flex items-center justify-center gap-2 h-11 px-6 rounded-control bg-accent text-accent-contrast text-sm font-semibold cursor-pointer transition-colors duration-200 hover:bg-accent-hover focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-accent active:translate-y-px"
          >
            {currentStep === steps.length - 1 ? t.builder.done : t.builder.continue}
            <ChevronRight size={18} />
          </button>
        </div>
      </div>

      {/* Main Preview */}
      <div className="flex-1 p-6 md:p-10 flex flex-col items-center overflow-y-auto custom-scrollbar bg-background relative">
        <div className="mb-4 flex items-center gap-4 no-print">
           <div className="px-4 py-1.5 rounded-full border border-border bg-surface text-xs font-medium text-muted flex items-center gap-2">
             <div className="w-2 h-2 bg-accent rounded-full animate-pulse" />
             {t.builder.livePreview}
           </div>
           <div className="text-xs italic text-muted">
             {t.builder.previewHint}
           </div>
        </div>

        <div
          ref={previewRef}
          className={`cv-page ${template === 'modern' || template === 'europass' || template === 'corporate' || template === 'creative' ? 'p-0' : 'p-12'}`}
        >
          {template === 'modern' ? (
            <ModernTemplate data={data} lang={lang} isDarkMode={isDarkMode} />
          ) : template === 'classic' ? (
            <ClassicTemplate data={data} lang={lang} isDarkMode={isDarkMode} />
          ) : template === 'minimal' ? (
            <MinimalTemplate data={data} lang={lang} isDarkMode={isDarkMode} />
          ) : template === 'brutalist' ? (
            <BrutalistTemplate data={data} lang={lang} isDarkMode={isDarkMode} />
          ) : template === 'europass' ? (
            <EuropassTemplate data={data} lang={lang} isDarkMode={isDarkMode} />
          ) : template === 'corporate' ? (
            <CorporateTemplate data={data} lang={lang} isDarkMode={isDarkMode} />
          ) : template === 'creative' ? (
            <CreativeTemplate data={data} lang={lang} isDarkMode={isDarkMode} />
          ) : template === 'tech' ? (
            <TechTemplate data={data} lang={lang} isDarkMode={isDarkMode} />
          ) : template === 'academic' ? (
            <AcademicTemplate data={data} lang={lang} isDarkMode={isDarkMode} />
          ) : (
            <RetroTemplate data={data} lang={lang} isDarkMode={isDarkMode} />
          )}
        </div>
      </div>
    </div>
  );
}

// Sub-components

interface InputFieldProps {
  label: string;
  name: string;
  value?: string;
  onChange: (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => void;
  icon?: LucideIcon;
  placeholder?: string;
}

function InputField({ label, name, value, onChange, icon: Icon, placeholder }: InputFieldProps) {
  return (
    <div className="space-y-1.5 flex-1">
      <label className="text-xs font-medium uppercase tracking-[0.08em] text-muted flex items-center gap-1.5">
        {Icon && <Icon size={12} className="text-accent" />} {label}
      </label>
      <input
        type="text"
        name={name}
        value={value}
        onChange={onChange}
        placeholder={placeholder}
        className="w-full h-11 rounded-control border border-border bg-surface px-3.5 text-sm text-ink placeholder:text-muted/60 outline-none transition-colors focus:border-accent focus:ring-2 focus:ring-accent/25"
      />
    </div>
  );
}

function SectionHeader({ title, icon: Icon, onAdd }: { title: string, icon: LucideIcon, onAdd?: () => void }) {
  return (
    <div className="flex items-center justify-between">
      <div className="flex items-center gap-2">
        <div className="flex h-8 w-8 items-center justify-center rounded-control bg-accent-tint text-accent">
          <Icon size={16} />
        </div>
        <h3 className="text-sm font-semibold text-ink">
          {title}
        </h3>
      </div>
      {onAdd && (
        <button
          onClick={onAdd}
          className="inline-flex items-center justify-center gap-1.5 h-9 px-3 rounded-control border border-border bg-surface text-ink text-xs font-semibold cursor-pointer transition-colors duration-200 hover:border-accent hover:text-accent focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-accent active:translate-y-px"
        >
          <Plus size={14} />
        </button>
      )}
    </div>
  );
}

// Templates

function ModernTemplate({ data, lang, isDarkMode = false }: { data: CVData, lang: Language, isDarkMode?: boolean }) {
  const t = TRANSLATIONS[lang];
  const { primaryColor, fontFamily, spacing } = data.settings;
  
  const fontClass = fontFamily === 'serif' ? 'font-serif' : fontFamily === 'mono' ? 'font-mono' : 'font-sans';
  const spacingClass = spacing === 'compact' ? 'space-y-6' : spacing === 'relaxed' ? 'space-y-14' : 'space-y-10';

  return (
    <div className={`h-full flex flex-col ${fontClass} ${isDarkMode ? 'bg-gray-950 text-gray-100' : 'bg-white text-gray-900'}`}>
      <div className="p-12 text-white" style={{ backgroundColor: primaryColor }}>
        <div className="flex justify-between items-start">
          <div className="max-w-md">
            <h1 className="text-5xl font-black tracking-tight leading-none mb-2">{data.personalInfo.fullName || t.builder.fullName}</h1>
            <h2 className="text-xl font-bold opacity-90">{data.personalInfo.targetRole || t.builder.targetRole}</h2>
            {data.summary && (
              <p className="text-white/80 text-sm mt-6 leading-relaxed line-clamp-4">
                {data.summary}
              </p>
            )}
          </div>
          <div className="text-right space-y-1 text-sm text-white/70 font-medium">
             <p>{data.personalInfo.email}</p>
             <p>{data.personalInfo.phone}</p>
             <p>{data.personalInfo.location}</p>
             {data.personalInfo.linkedin && (
               <a href={`https://${data.personalInfo.linkedin.replace(/^https?:\/\//, '')}`} target="_blank" rel="noopener noreferrer" className="opacity-100 font-bold hover:underline flex items-center justify-end gap-1">
                 <Linkedin size={12} /> {data.personalInfo.linkedin.replace(/^https?:\/\/(www\.)?linkedin\.com\/in\//, '')}
               </a>
             )}
             {data.personalInfo.portfolio && (
               <a href={`https://${data.personalInfo.portfolio.replace(/^https?:\/\//, '')}`} target="_blank" rel="noopener noreferrer" className="opacity-100 font-bold hover:underline flex items-center justify-end gap-1">
                 <Globe size={12} /> {data.personalInfo.portfolio.replace(/^https?:\/\/(www\.)?/, '')}
               </a>
             )}
          </div>
        </div>
      </div>
      
      <div className="flex-1 grid grid-cols-12">
        <div className={`col-span-8 p-12 ${spacingClass}`}>
          {data.experience.length > 0 && (
            <Section title={t.builder.experience} color={primaryColor} isDarkMode={isDarkMode}>
              {data.experience.map((exp, i) => (
                <div key={exp.id} className="mb-6 last:mb-0">
                  <div className="flex justify-between items-baseline mb-1">
                    <h4 className={`font-black ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>{exp.position || t.builder.position}</h4>
                    <span className="text-xs font-bold text-gray-400">{exp.startDate} — {exp.endDate}</span>
                  </div>
                  <div className="font-bold text-sm mb-2" style={{ color: primaryColor }}>{exp.company || t.builder.company}</div>
                  <p className={`text-sm leading-relaxed whitespace-pre-wrap ${isDarkMode ? 'text-gray-300' : 'text-gray-600'}`}>{exp.description}</p>
                </div>
              ))}
            </Section>
          )}

          {data.projects.length > 0 && (
            <Section title={t.builder.projects} color={primaryColor} isDarkMode={isDarkMode}>
              {data.projects.map((proj, i) => (
                <div key={proj.id} className={`mb-6 last:mb-0 p-4 rounded-xl border transition-colors ${isDarkMode ? 'bg-gray-900 border-gray-800' : 'bg-gray-50 border-gray-100'}`}>
                  <h4 className={`font-black ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>{proj.name || t.builder.projectName}</h4>
                  <div className="text-xs font-mono mb-3" style={{ color: primaryColor }}>{proj.technologies}</div>
                  <p className={`text-sm leading-relaxed ${isDarkMode ? 'text-gray-300' : 'text-gray-600'}`}>{proj.description}</p>
                </div>
              ))}
            </Section>
          )}
        </div>

        <div className={`col-span-4 p-12 border-l transition-colors ${isDarkMode ? 'bg-gray-900/50 border-gray-800' : 'bg-gray-50/50 border-gray-100'} ${spacingClass}`}>
          {data.education.length > 0 && (
            <Section title={t.builder.education} color={primaryColor} isDarkMode={isDarkMode}>
               {data.education.map((edu, i) => (
                <div key={edu.id} className="mb-4 last:mb-0">
                   <h4 className={`font-bold text-sm ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>{edu.degree}</h4>
                   <p className="text-xs text-gray-500 font-medium">{edu.institution}</p>
                </div>
              ))}
            </Section>
          )}

          {data.skills.length > 0 && (
            <Section title={t.builder.skills} color={primaryColor} isDarkMode={isDarkMode}>
              <div className="flex flex-wrap gap-2">
                {data.skills.map(s => <span key={s} className={`px-2.5 py-1 rounded-lg text-[10px] font-black uppercase tracking-wider border transition-colors ${isDarkMode ? 'bg-gray-800 border-gray-700 text-gray-300' : 'bg-white border-gray-200 text-gray-600'}`}>{s}</span>)}
              </div>
            </Section>
          )}

          {data.certifications.length > 0 && (
            <Section title={t.builder.certifications} color={primaryColor} isDarkMode={isDarkMode}>
              <div className="flex flex-wrap gap-2">
                {data.certifications.map(c => <span key={c} className={`px-2.5 py-1 rounded-lg text-[10px] font-black uppercase tracking-wider border transition-colors ${isDarkMode ? 'bg-emerald-950/30 border-emerald-900/50 text-emerald-400' : 'bg-emerald-50 border-emerald-100 text-emerald-700'}`}>{c}</span>)}
              </div>
            </Section>
          )}

          {data.interests.length > 0 && (
            <Section title={t.builder.interests} color={primaryColor} isDarkMode={isDarkMode}>
              <div className="flex flex-wrap gap-2">
                {data.interests.map(i => <span key={i} className={`px-2.5 py-1 rounded-lg text-[10px] font-black uppercase tracking-wider border transition-colors ${isDarkMode ? 'bg-rose-950/30 border-rose-900/50 text-rose-400' : 'bg-rose-50 border-rose-100 text-rose-700'}`}>{i}</span>)}
              </div>
            </Section>
          )}

          {data.languages.length > 0 && (
            <Section title={t.builder.languages} color={primaryColor} isDarkMode={isDarkMode}>
              <div className="space-y-1">
                {data.languages.map((l, i) => (
                  <div key={l.id} className="flex justify-between items-center text-sm">
                    <span className={`font-bold ${isDarkMode ? 'text-gray-300' : 'text-gray-700'}`}>{l.language}</span>
                    <span className="text-xs text-gray-400 italic">{l.level}</span>
                  </div>
                ))}
              </div>
            </Section>
          )}
        </div>
      </div>
    </div>
  );
}

function Section({ title, children, color, isDarkMode }: { title: string, children: React.ReactNode, color: string, isDarkMode?: boolean }) {
  return (
    <div>
      <h3 className={`text-xs font-black uppercase tracking-[0.2em] mb-6 flex items-center gap-3 ${isDarkMode ? 'text-white' : 'text-gray-900'}`} style={{ color: isDarkMode ? undefined : color }}>
        {title} <div className="h-px flex-1" style={{ backgroundColor: color, opacity: isDarkMode ? 0.3 : 0.2 }}></div>
      </h3>
      {children}
    </div>
  );
}

function ClassicTemplate({ data, lang, isDarkMode = false }: { data: CVData, lang: Language, isDarkMode?: boolean }) {
  const t = TRANSLATIONS[lang];
  const { primaryColor, fontFamily, spacing } = data.settings;
  
  const fontClass = fontFamily === 'sans' ? 'font-sans' : fontFamily === 'mono' ? 'font-mono' : 'font-serif';
  const spacingClass = spacing === 'compact' ? 'space-y-4' : spacing === 'relaxed' ? 'space-y-12' : 'space-y-8';

  const mainBg = isDarkMode ? 'bg-gray-950' : 'bg-white';
  const mainText = isDarkMode ? 'text-gray-100' : 'text-gray-900';
  const subText = isDarkMode ? 'text-gray-400' : 'text-gray-600';
  const borderColor = isDarkMode ? 'border-gray-800' : 'border-gray-200';

  return (
    <div className={`h-full ${mainBg} p-12 ${mainText} ${fontClass}`}>
      <div className={`text-center border-b pb-8 mb-8 transition-colors`} style={{ borderColor: primaryColor }}>
        <h1 className="text-4xl font-bold mb-2 uppercase tracking-wide" style={{ color: primaryColor }}>{data.personalInfo.fullName || t.builder.fullName}</h1>
        <div className={`flex justify-center gap-4 text-sm ${subText} flex-wrap`}>
          <span>{data.personalInfo.email}</span>
          <span>•</span>
          <span>{data.personalInfo.phone}</span>
          <span>•</span>
          <span>{data.personalInfo.location}</span>
          {data.personalInfo.linkedin && (
            <>
              <span>•</span>
              <a href={`https://${data.personalInfo.linkedin.replace(/^https?:\/\//, '')}`} target="_blank" rel="noopener noreferrer" className="hover:underline flex items-center gap-1" style={{ color: primaryColor }}>
                <Linkedin size={14} /> LinkedIn
              </a>
            </>
          )}
          {data.personalInfo.portfolio && (
            <>
              <span>•</span>
              <a href={`https://${data.personalInfo.portfolio.replace(/^https?:\/\//, '')}`} target="_blank" rel="noopener noreferrer" className="hover:underline flex items-center gap-1" style={{ color: primaryColor }}>
                <Globe size={14} /> Portfolio
              </a>
            </>
          )}
        </div>
      </div>

      <div className={spacingClass}>
        {data.summary && (
          <section>
            <h3 className="text-sm font-bold uppercase border-b mb-3 pb-0.5" style={{ borderColor: primaryColor }}>Summary</h3>
            <p className="text-sm leading-relaxed italic">{data.summary}</p>
          </section>
        )}

        {data.experience.length > 0 && (
          <section>
            <h3 className="text-sm font-bold uppercase border-b mb-4 pb-0.5" style={{ borderColor: primaryColor }}>{t.builder.experience}</h3>
            {data.experience.map((exp, i) => (
              <div key={exp.id} className="mb-6 last:mb-0">
                <div className="flex justify-between items-baseline font-bold mb-1">
                  <h4 className="text-base">{exp.company}</h4>
                  <span className="text-sm font-normal italic opacity-60">{exp.startDate} — {exp.endDate}</span>
                </div>
                <div className="text-sm italic mb-2 opacity-80">{exp.position}</div>
                <p className="text-sm leading-relaxed whitespace-pre-wrap opacity-90">{exp.description}</p>
              </div>
            ))}
          </section>
        )}

        {data.education.length > 0 && (
          <section>
            <h3 className="text-sm font-bold uppercase border-b mb-4 pb-0.5" style={{ borderColor: primaryColor }}>{t.builder.education}</h3>
            {data.education.map((edu, i) => (
              <div key={edu.id} className="mb-3 last:mb-0">
                <div className="flex justify-between items-baseline font-bold">
                  <h4 className="text-sm">{edu.institution}</h4>
                  <span className="text-xs font-normal italic opacity-60">{edu.startDate} — {edu.endDate}</span>
                </div>
                <p className="text-sm italic opacity-80">{edu.degree}</p>
              </div>
            ))}
          </section>
        )}

        <div className="grid grid-cols-2 gap-8">
           {data.skills.length > 0 && (
            <section>
              <h3 className="text-sm font-bold uppercase border-b mb-3 pb-0.5" style={{ borderColor: primaryColor }}>{t.builder.skills}</h3>
              <p className="text-sm opacity-90">
                {data.skills.join(', ')}
              </p>
            </section>
          )}

          {data.certifications.length > 0 && (
            <section>
              <h3 className="text-sm font-bold uppercase border-b mb-3 pb-0.5" style={{ borderColor: primaryColor }}>{t.builder.certifications}</h3>
              <p className="text-sm opacity-90">
                {data.certifications.join(', ')}
              </p>
            </section>
          )}

          {data.languages.length > 0 && (
            <section>
              <h3 className="text-sm font-bold uppercase border-b mb-3 pb-0.5" style={{ borderColor: primaryColor }}>{t.builder.languages}</h3>
              <div className="space-y-1">
                {data.languages.map((l, i) => (
                  <p key={l.id} className="text-sm opacity-90 flex justify-between">
                    <span>{l.language}</span>
                    <span className="text-xs italic opacity-60">{l.level}</span>
                  </p>
                ))}
              </div>
            </section>
          )}
        </div>

        {data.interests.length > 0 && (
          <section>
            <h3 className="text-sm font-bold uppercase border-b mb-3 pb-0.5" style={{ borderColor: primaryColor }}>{t.builder.interests}</h3>
            <p className="text-sm italic opacity-80">
              {data.interests.join(', ')}
            </p>
          </section>
        )}
      </div>
    </div>
  );
}

function MinimalTemplate({ data, lang, isDarkMode = false }: { data: CVData, lang: Language, isDarkMode?: boolean }) {
  const t = TRANSLATIONS[lang];
  const { primaryColor, fontFamily, spacing } = data.settings;
  
  const fontClass = fontFamily === 'serif' ? 'font-serif' : fontFamily === 'mono' ? 'font-mono' : 'font-sans';
  const spacingClass = spacing === 'compact' ? 'space-y-12' : spacing === 'relaxed' ? 'space-y-28' : 'space-y-20';

  const mainBg = isDarkMode ? 'bg-gray-950' : 'bg-white';
  const mainText = isDarkMode ? 'text-gray-100' : 'text-slate-900';
  const subText = isDarkMode ? 'text-gray-400' : 'text-slate-400';
  const descText = isDarkMode ? 'text-gray-400' : 'text-slate-500';

  return (
    <div className={`h-full ${mainBg} px-16 py-20 tracking-tight ${mainText} ${fontClass}`}>
      <header className="mb-20">
        <h1 className="text-6xl font-extralight mb-4 tracking-tighter" style={{ color: primaryColor }}>{data.personalInfo.fullName || t.builder.fullName}</h1>
        <p className={`text-xl ${subText} font-light mb-8`}>{data.personalInfo.targetRole || t.builder.targetRole}</p>
        <div className={`flex flex-col gap-1 text-xs ${subText} font-medium tracking-widest uppercase`}>
          <span>{data.personalInfo.email}</span>
          <span>{data.personalInfo.phone}</span>
          <span>{data.personalInfo.location}</span>
          {data.personalInfo.linkedin && (
            <a href={`https://${data.personalInfo.linkedin.replace(/^https?:\/\//, '')}`} target="_blank" rel="noopener noreferrer" className={`flex items-center gap-2 transition-colors ${isDarkMode ? 'hover:text-blue-400' : 'hover:text-slate-600'}`}>
              <Linkedin size={10} /> {data.personalInfo.linkedin.replace(/^https?:\/\/(www\.)?linkedin\.com\/in\//, '')}
            </a>
          )}
          {data.personalInfo.portfolio && (
            <a href={`https://${data.personalInfo.portfolio.replace(/^https?:\/\//, '')}`} target="_blank" rel="noopener noreferrer" className={`flex items-center gap-2 transition-colors ${isDarkMode ? 'hover:text-blue-400' : 'hover:text-slate-600'}`}>
              <Globe size={10} /> {data.personalInfo.portfolio.replace(/^https?:\/\/(www\.)?/, '')}
            </a>
          )}
        </div>
      </header>

      <div className={spacingClass}>
        {data.experience.length > 0 && (
          <section className="grid grid-cols-4 gap-8">
            <h3 className={`text-[10px] font-bold ${isDarkMode ? 'text-gray-600' : 'text-slate-300'} uppercase tracking-[0.3em] h-fit sticky top-20`}>{t.builder.experience}</h3>
            <div className="col-span-3 space-y-12">
              {data.experience.map((exp, i) => (
                <div key={exp.id} className="space-y-4">
                  <div className="space-y-1">
                    <h4 className="text-lg font-bold">{exp.position}</h4>
                    <div className="flex justify-between items-center group">
                      <span className="text-sm font-medium" style={{ color: primaryColor }}>{exp.company}</span>
                      <span className={`text-[10px] ${isDarkMode ? 'text-gray-500' : 'text-slate-300'} font-bold tracking-widest uppercase`}>{exp.startDate} / {exp.endDate}</span>
                    </div>
                  </div>
                  <p className={`text-sm ${descText} leading-relaxed font-light`}>{exp.description}</p>
                </div>
              ))}
            </div>
          </section>
        )}

        {data.education.length > 0 && (
          <section className="grid grid-cols-4 gap-8">
            <h3 className="text-[10px] font-bold text-slate-300 uppercase tracking-[0.3em] h-fit sticky top-20">{t.builder.education}</h3>
            <div className="col-span-3 space-y-8">
              {data.education.map((edu, i) => (
                <div key={edu.id} className="flex justify-between items-start">
                  <div>
                    <h4 className="font-bold text-sm tracking-normal">{edu.institution}</h4>
                    <p className="text-xs text-slate-500 font-light">{edu.degree}</p>
                  </div>
                  <span className="text-[9px] text-slate-300 font-bold uppercase tracking-widest">{edu.startDate} — {edu.endDate}</span>
                </div>
              ))}
            </div>
          </section>
        )}

        <div className="grid grid-cols-4 gap-8">
           <h3 className="text-[10px] font-bold text-slate-300 uppercase tracking-[0.3em]">Competencies</h3>
           <div className="col-span-3 flex flex-wrap gap-x-6 gap-y-3">
              {data.skills.map(s => <span key={s} className="text-sm font-medium text-slate-600">{s}</span>)}
              {data.certifications.map(s => <span key={s} className="text-sm font-medium" style={{ color: primaryColor }}>{s}</span>)}
              {data.languages.map(l => (
                <span key={l.language} className="text-sm font-medium">
                  {l.language} <span className="text-[10px] text-slate-300">({l.level})</span>
                </span>
              ))}
           </div>
        </div>
      </div>
    </div>
  );
}

function BrutalistTemplate({ data, lang, isDarkMode = false }: { data: CVData, lang: Language, isDarkMode?: boolean }) {
  const t = TRANSLATIONS[lang];
  const { primaryColor, fontFamily, spacing } = data.settings;
  
  const fontClass = fontFamily === 'sans' ? 'font-sans' : fontFamily === 'mono' ? 'font-mono' : 'font-serif';
  const spacingClass = spacing === 'compact' ? 'space-y-8' : spacing === 'relaxed' ? 'space-y-24' : 'space-y-16';

  const contrastBg = isDarkMode ? 'bg-white' : 'bg-black';
  const contrastText = isDarkMode ? 'text-black' : 'text-white';
  const mainBg = isDarkMode ? 'bg-gray-950' : 'bg-white';
  const mainText = isDarkMode ? 'text-white' : 'text-black';
  const borderColor = isDarkMode ? 'border-white' : 'border-black';
  const cardBg = isDarkMode ? 'bg-gray-900' : 'bg-white';

  return (
    <div className={`h-full ${mainBg} ${mainText} p-0 border-[16px] ${borderColor} ${fontClass}`}>
      <div className={`p-12 border-b-[8px] ${borderColor}`} style={{ backgroundColor: primaryColor }}>
        <h1 className="text-7xl font-black uppercase tracking-tighter leading-none mb-4 break-words text-white">
          {data.personalInfo.fullName || t.builder.fullName}
        </h1>
        <div className={`inline-block ${contrastBg} ${contrastText} px-4 py-2 font-black text-lg mb-6`}>
          {data.personalInfo.targetRole || t.builder.targetRole}
        </div>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-xs font-black uppercase">
          <div className={`p-2 border-2 ${borderColor} ${cardBg} truncate`}>{data.personalInfo.email}</div>
          <div className={`p-2 border-2 ${borderColor} ${cardBg}`}>{data.personalInfo.phone}</div>
          <div className={`p-2 border-2 ${borderColor} ${cardBg} truncate`}>{data.personalInfo.location}</div>
          <div className={`p-0 border-2 ${borderColor} ${cardBg} overflow-hidden flex`}>
            {data.personalInfo.linkedin ? (
               <a href={`https://${data.personalInfo.linkedin.replace(/^https?:\/\//, '')}`} target="_blank" rel="noopener noreferrer" className={`flex-1 p-2 hover:${contrastBg} hover:${contrastText} transition-colors truncate`}>
                 LI: {data.personalInfo.linkedin.replace(/^https?:\/\/(www\.)?linkedin\.com\/in\//, '')}
               </a>
            ) : (
              <div className="p-2">SOCIAL</div>
            )}
            {data.personalInfo.portfolio && (
               <a href={`https://${data.personalInfo.portfolio.replace(/^https?:\/\//, '')}`} target="_blank" rel="noopener noreferrer" className={`flex-1 p-2 border-l-2 ${borderColor} hover:${contrastBg} hover:${contrastText} transition-colors truncate`}>
                 WEB
               </a>
            )}
          </div>
        </div>
      </div>

      <div className={`p-12 grid md:grid-cols-12 gap-0 border-b-[8px] ${borderColor}`}>
        <div className={`md:col-span-8 md:border-r-[8px] ${borderColor} pr-12 pb-12 md:pb-0`}>
          {data.experience.length > 0 && (
            <div className="mb-16">
              <h3 className="text-2xl font-black uppercase mb-8 underline decoration-[12px] underline-offset-8" style={{ textDecorationColor: primaryColor }}>EXPERIENCE</h3>
              <div className="space-y-8">
                {data.experience.map((exp, i) => (
                  <div key={exp.id} className={`border-4 ${borderColor} p-6 hover:translate-x-2 hover:-translate-y-2 transition-all ${cardBg}`} style={{ boxShadow: `8px 8px 0px 0px ${primaryColor}` }}>
                    <div className="flex justify-between items-start mb-4">
                      <h4 className="text-xl font-black">{exp.position}</h4>
                      <span className={`${contrastBg} ${contrastText} px-2 py-1 text-[10px]`}>{exp.startDate} / {exp.endDate}</span>
                    </div>
                    <div className="text-lg font-black mb-4" style={{ color: primaryColor }}>{exp.company}</div>
                    <p className="text-sm leading-tight">{exp.description}</p>
                  </div>
                ))}
              </div>
            </div>
          )}

          {data.projects.length > 0 && (
            <div>
              <h3 className="text-2xl font-black uppercase mb-8 underline decoration-[12px] underline-offset-8" style={{ textDecorationColor: primaryColor }}>PROJECTS</h3>
              <div className="space-y-6">
                {data.projects.map((proj, i) => (
                  <div key={proj.id} className={`border-4 ${borderColor} p-6 ${cardBg}`} style={{ borderColor: primaryColor }}>
                    <h4 className="text-xl font-black">{proj.name}</h4>
                    <div className={`text-xs font-black mt-2 mb-4 p-1 ${contrastBg} ${contrastText} inline-block`}>{proj.technologies}</div>
                    <p className="text-sm leading-tight">{proj.description}</p>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        <div className={`md:col-span-4 pl-12 pt-12 md:pt-0 ${spacingClass}`}>
          {data.education.length > 0 && (
            <div>
              <h3 className={`text-lg font-black uppercase mb-6 ${contrastBg} ${contrastText} p-2`}>EDUCATION</h3>
              {data.education.map((edu, i) => (
                <div key={edu.id} className="mb-6 last:mb-0">
                  <h4 className="font-black text-sm">{edu.degree}</h4>
                  <p className="text-xs font-bold mt-1" style={{ color: primaryColor }}>{edu.institution}</p>
                  <p className="text-[10px] mt-1 italic">{edu.startDate} - {edu.endDate}</p>
                </div>
              ))}
            </div>
          )}

          {data.skills.length > 0 && (
            <div>
              <h3 className="text-lg font-black uppercase mb-6 text-white p-2" style={{ backgroundColor: primaryColor }}>SKILLS</h3>
              <div className="flex flex-wrap gap-2">
                {data.skills.map(s => (
                  <span key={s} className={`border-4 ${borderColor} p-2 font-black text-xs ${cardBg} hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors`}>
                    {s}
                  </span>
                ))}
              </div>
            </div>
          )}

          {data.languages.length > 0 && (
            <div className="mt-8">
              <h3 className="text-lg font-black uppercase mb-6 text-white p-2" style={{ backgroundColor: primaryColor }}>{t.builder.languages}</h3>
              <div className="space-y-2">
                {data.languages.map(l => (
                  <div key={l.language} className={`flex justify-between items-center border-b-2 ${borderColor} pb-1`}>
                    <span className="font-black text-sm">{l.language}</span>
                    <span className={`${contrastBg} ${contrastText} px-2 py-0.5 text-[10px] uppercase font-black`}>{l.level}</span>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
      
      <div className="p-8 text-center text-xs font-black uppercase italic">
        Built with CampusCV v2.0
      </div>
    </div>
  );
}

function EuropassTemplate({ data, lang, isDarkMode = false }: { data: CVData, lang: Language, isDarkMode?: boolean }) {
  const t = TRANSLATIONS[lang];
  const { primaryColor, fontFamily, spacing } = data.settings;
  
  const fontClass = fontFamily === 'serif' ? 'font-serif' : fontFamily === 'mono' ? 'font-mono' : 'font-sans';
  const spacingClass = spacing === 'compact' ? 'space-y-6' : spacing === 'relaxed' ? 'space-y-12' : 'space-y-8';

  const mainBg = isDarkMode ? 'bg-gray-950' : 'bg-white';
  const mainText = isDarkMode ? 'text-gray-100' : 'text-gray-800';
  const sidebarBg = isDarkMode ? 'bg-gray-900/50' : 'bg-gray-100';
  const borderColor = isDarkMode ? 'border-gray-800' : 'border-gray-200';

  return (
    <div className={`h-full flex flex-col ${mainBg} ${mainText} ${fontClass}`}>
      <div className={`grid grid-cols-12 border-b-4 transition-colors`} style={{ borderColor: primaryColor }}>
        <div className={`col-span-4 ${sidebarBg} p-8 flex flex-col items-center border-r ${borderColor} transition-colors`}>
           <div className={`w-32 h-32 ${isDarkMode ? 'bg-gray-800 border-gray-700 text-gray-500' : 'bg-gray-200 border-gray-300 text-gray-400'} rounded-lg mb-6 flex items-center justify-center font-bold uppercase tracking-wider text-xs border-2 border-dashed transition-colors`}>
             Foto
           </div>
           <div className="w-full space-y-4 text-xs font-medium">
              <div>
                <h4 className="font-bold uppercase mb-1" style={{ color: primaryColor }}>Contact</h4>
                <p className="opacity-80">{data.personalInfo.email}</p>
                <p className="opacity-80">{data.personalInfo.phone}</p>
                <p className="opacity-80">{data.personalInfo.location}</p>
                {data.personalInfo.linkedin && (
                  <p className="mt-1 flex items-center gap-1 opacity-80">
                    <Linkedin size={10} />
                    <a href={`https://${data.personalInfo.linkedin.replace(/^https?:\/\//, '')}`} target="_blank" rel="noopener noreferrer" className="hover:underline">
                      {data.personalInfo.linkedin.replace(/^https?:\/\/(www\.)?linkedin\.com\/in\//, '')}
                    </a>
                  </p>
                )}
                {data.personalInfo.portfolio && (
                  <p className="mt-1 flex items-center gap-1 opacity-80">
                    <Globe size={10} />
                    <a href={`https://${data.personalInfo.portfolio.replace(/^https?:\/\//, '')}`} target="_blank" rel="noopener noreferrer" className="hover:underline">
                      {data.personalInfo.portfolio.replace(/^https?:\/\/(www\.)?/, '')}
                    </a>
                  </p>
                )}
              </div>
              {data.languages.length > 0 && (
                <div>
                  <h4 className="font-bold uppercase mb-1" style={{ color: primaryColor }}>{t.builder.languages}</h4>
                  <div className="space-y-1">
                    {data.languages.map((l, i) => (
                      <div key={l.id} className="flex justify-between items-center">
                        <span className="opacity-80">{l.language}</span>
                        <span className="opacity-50 italic">{l.level}</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}
           </div>
        </div>
        <div className="col-span-8 p-10">
          <div className="mb-10">
            <h1 className="text-4xl font-light mb-1" style={{ color: primaryColor }}>{data.personalInfo.fullName || t.builder.fullName}</h1>
            <p className="text-xl opacity-50 uppercase tracking-widest">{data.personalInfo.targetRole || t.builder.targetRole}</p>
          </div>

          <div className={spacingClass}>
            {data.experience.length > 0 && (
              <div>
                <h3 className={`text-sm font-bold uppercase border-b ${borderColor} pb-1 mb-4 flex items-center gap-2 transition-colors`} style={{ color: primaryColor }}>
                  <Briefcase size={14} /> Experiență Profesională
                </h3>
                {data.experience.map((exp, i) => (
                  <div key={exp.id} className="mb-4 grid grid-cols-12 gap-4">
                    <div className="col-span-3 text-[10px] font-bold opacity-40 uppercase leading-relaxed pt-1">
                      {exp.startDate} — {exp.endDate}
                    </div>
                    <div className="col-span-9">
                      <h4 className={`font-bold ${isDarkMode ? 'text-white' : 'text-gray-950'}`}>{exp.position}</h4>
                      <p className="text-sm font-medium" style={{ color: primaryColor }}>{exp.company}</p>
                      <p className="text-xs opacity-70 mt-2 leading-relaxed">{exp.description}</p>
                    </div>
                  </div>
                ))}
              </div>
            )}

            {data.education.length > 0 && (
              <div>
                <h3 className={`text-sm font-bold uppercase border-b ${borderColor} pb-1 mb-4 flex items-center gap-2 transition-colors`} style={{ color: primaryColor }}>
                  <GraduationCap size={14} /> Educație
                </h3>
                {data.education.map((edu, i) => (
                  <div key={edu.id} className="mb-4 grid grid-cols-12 gap-4">
                    <div className="col-span-3 text-[10px] font-bold opacity-40 uppercase leading-relaxed pt-1">
                      {edu.startDate} — {edu.endDate}
                    </div>
                    <div className="col-span-9">
                      <h4 className={`font-bold ${isDarkMode ? 'text-white' : 'text-gray-950'}`}>{edu.degree}</h4>
                      <p className="text-sm opacity-70">{edu.institution}</p>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
      <div className={`p-6 ${isDarkMode ? 'bg-gray-900 text-gray-500' : 'bg-gray-50 text-gray-400'} text-[9px] text-center uppercase tracking-widest italic transition-colors`}>
        Format generat conform standardelor oficiale Europass via CampusCV
      </div>
    </div>
  );
}


function CorporateTemplate({ data, lang, isDarkMode = false }: { data: CVData, lang: Language, isDarkMode?: boolean }) {
  const t = TRANSLATIONS[lang];
  const { primaryColor, fontFamily, spacing } = data.settings;
  
  const fontClass = fontFamily === 'sans' ? 'font-sans' : fontFamily === 'mono' ? 'font-mono' : 'font-serif';
  const spacingClass = spacing === 'compact' ? 'space-y-6' : spacing === 'relaxed' ? 'space-y-16' : 'space-y-10';

  const mainBg = isDarkMode ? 'bg-gray-950' : 'bg-white';
  const mainText = isDarkMode ? 'text-gray-100' : 'text-gray-900';
  const subText = isDarkMode ? 'text-gray-400' : 'text-gray-500';

  return (
    <div className={`h-full ${mainBg} p-16 ${mainText} ${fontClass}`}>
      <div className={`border-b-2 pb-8 mb-10 flex justify-between items-end`} style={{ borderColor: primaryColor }}>
        <div>
          <h1 className="text-4xl font-bold mb-2 uppercase tracking-tight">{data.personalInfo.fullName || t.builder.fullName}</h1>
          <p className="text-xl italic" style={{ color: primaryColor }}>{data.personalInfo.targetRole || t.builder.targetRole}</p>
        </div>
        <div className={`text-right text-sm ${subText} italic space-y-0.5`}>
          <p>{data.personalInfo.email}</p>
          <p>{data.personalInfo.phone}</p>
          <p>{data.personalInfo.location}</p>
          {data.personalInfo.linkedin && (
            <a href={`https://${data.personalInfo.linkedin.replace(/^https?:\/\//, '')}`} target="_blank" rel="noopener noreferrer" className="block hover:underline" style={{ color: primaryColor }}>
              {data.personalInfo.linkedin.replace(/^https?:\/\/(www\.)?linkedin\.com\/in\//, '')} (LinkedIn)
            </a>
          )}
          {data.personalInfo.portfolio && (
            <a href={`https://${data.personalInfo.portfolio.replace(/^https?:\/\//, '')}`} target="_blank" rel="noopener noreferrer" className="block hover:underline" style={{ color: primaryColor }}>
              {data.personalInfo.portfolio.replace(/^https?:\/\/(www\.)?/, '')} (Portfolio)
            </a>
          )}
        </div>
      </div>

      <div className={spacingClass}>
        {data.summary && (
          <div className="grid grid-cols-12 gap-8">
            <div className={`col-span-3 text-xs font-bold uppercase tracking-widest ${isDarkMode ? 'text-gray-500' : 'text-gray-400'} pt-1`}>Profil Profesional</div>
            <div className={`col-span-9 text-sm leading-relaxed ${isDarkMode ? 'text-gray-300' : 'text-gray-700'} italic`}>
              "{data.summary}"
            </div>
          </div>
        )}

        {data.experience.length > 0 && (
          <div className="grid grid-cols-12 gap-8">
            <div className={`col-span-3 text-xs font-bold uppercase tracking-widest ${isDarkMode ? 'text-gray-500' : 'text-gray-400'} pt-1`}>Experiență</div>
            <div className="col-span-9 space-y-6">
              {data.experience.map((exp, i) => (
                <div key={exp.id}>
                  <div className="flex justify-between items-baseline mb-1">
                    <h4 className={`font-bold ${isDarkMode ? 'text-white' : 'text-gray-900'} text-base`}>{exp.position}</h4>
                    <span className="text-xs text-gray-400 italic">{exp.startDate} — {exp.endDate}</span>
                  </div>
                  <div className="text-sm font-bold mb-2" style={{ color: primaryColor }}>{exp.company}</div>
                  <p className={`text-sm ${isDarkMode ? 'text-gray-300' : 'text-gray-600'} leading-relaxed`}>{exp.description}</p>
                </div>
              ))}
            </div>
          </div>
        )}

        {data.skills.length > 0 && (
          <div className="grid grid-cols-12 gap-8">
            <div className={`col-span-3 text-xs font-bold uppercase tracking-widest ${isDarkMode ? 'text-gray-500' : 'text-gray-400'} pt-1`}>Competențe</div>
            <div className="col-span-9">
              <p className={`text-sm ${isDarkMode ? 'text-gray-300' : 'text-gray-700'} leading-relaxed`}>
                 {data.skills.join(' • ')}
              </p>
            </div>
          </div>
        )}

        {data.certifications.length > 0 && (
          <div className="grid grid-cols-12 gap-8">
            <div className={`col-span-3 text-xs font-bold uppercase tracking-widest ${isDarkMode ? 'text-gray-500' : 'text-gray-400'} pt-1`}>Certificări</div>
            <div className="col-span-9">
              <p className={`text-sm ${isDarkMode ? 'text-gray-300' : 'text-gray-700'} leading-relaxed`}>
                {data.certifications.join(' • ')}
              </p>
            </div>
          </div>
        )}

        {data.interests.length > 0 && (
          <div className="grid grid-cols-12 gap-8">
            <div className="col-span-3 text-xs font-bold uppercase tracking-widest text-gray-400 pt-1">Interese</div>
            <div className="col-span-9">
              <p className="text-sm text-gray-500 italic leading-relaxed">
                {data.interests.join(', ')}
              </p>
            </div>
          </div>
        )}

        {data.languages.length > 0 && (
          <div className="grid grid-cols-12 gap-8">
             <div className={`col-span-3 text-xs font-bold uppercase tracking-widest ${isDarkMode ? 'text-gray-500' : 'text-gray-400'} pt-1`}>{t.builder.languages}</div>
             <div className="col-span-9">
                <div className="grid grid-cols-2 gap-x-8 gap-y-2">
                  {data.languages.map(l => (
                    <div key={l.language} className={`flex justify-between items-center text-sm border-b ${isDarkMode ? 'border-gray-800' : 'border-gray-100'} pb-1`}>
                      <span className={`font-bold ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>{l.language}</span>
                      <span className="text-gray-400 italic text-xs">{l.level}</span>
                    </div>
                  ))}
                </div>
             </div>
          </div>
        )}
      </div>
    </div>
  );
}


function CreativeTemplate({ data, lang, isDarkMode = false }: { data: CVData, lang: Language, isDarkMode?: boolean }) {
  const t = TRANSLATIONS[lang];
  const { primaryColor, fontFamily, spacing } = data.settings;
  
  const fontClass = fontFamily === 'serif' ? 'font-serif' : fontFamily === 'mono' ? 'font-mono' : 'font-sans';
  const spacingClass = spacing === 'compact' ? 'space-y-4' : spacing === 'relaxed' ? 'space-y-8' : 'space-y-6';

  const sideBg = isDarkMode ? 'bg-gray-900' : 'bg-gray-50';
  const mainBg = isDarkMode ? 'bg-gray-950' : 'bg-white';

  return (
    <div className={`h-full grid grid-cols-12 ${fontClass} ${isDarkMode ? 'text-gray-100' : 'text-gray-800'}`}>
      {/* Left Accent Sidebar */}
      <div className={`col-span-4 p-8 border-r ${sideBg} ${isDarkMode ? 'border-gray-800' : 'border-gray-100'} flex flex-col justify-between`}>
        <div className="space-y-8">
          <div>
            <div className="w-12 h-1.5 rounded mb-4" style={{ backgroundColor: primaryColor }} />
            <h1 className="text-2xl font-black tracking-tight leading-tight mb-1" style={{ color: primaryColor }}>
              {data.personalInfo.fullName || t.builder.fullName}
            </h1>
            <h2 className="text-[10px] font-black uppercase tracking-widest text-gray-400">
              {data.personalInfo.targetRole || t.builder.targetRole}
            </h2>
          </div>

          {/* Contact Details */}
          <div className="space-y-3 text-xs font-medium">
            <h3 className="text-[10px] font-black uppercase tracking-wider text-gray-400">Contact</h3>
            <div className="space-y-1.5">
              <p className="truncate">📧 {data.personalInfo.email}</p>
              <p>📞 {data.personalInfo.phone}</p>
              <p>📍 {data.personalInfo.location}</p>
              {data.personalInfo.linkedin && (
                <p className="truncate">🔗 {data.personalInfo.linkedin.replace(/^https?:\/\/(www\.)?/, '')}</p>
              )}
            </div>
          </div>

          {/* Skills */}
          {data.skills.length > 0 && (
            <div className="space-y-3">
              <h3 className="text-[10px] font-black uppercase tracking-wider text-gray-400">{t.builder.skills}</h3>
              <div className="flex flex-wrap gap-1.5">
                {data.skills.map(s => (
                  <span key={s} className="px-2 py-0.5 rounded text-[10px] font-bold" style={{ backgroundColor: `${primaryColor}15`, color: primaryColor }}>
                    {s}
                  </span>
                ))}
              </div>
            </div>
          )}

          {/* Languages */}
          {data.languages.length > 0 && (
            <div className="space-y-3">
              <h3 className="text-[10px] font-black uppercase tracking-wider text-gray-400">{t.builder.languages}</h3>
              <div className="space-y-2">
                {data.languages.map(l => (
                  <div key={l.language} className="flex justify-between items-center text-xs">
                    <span className="font-bold">{l.language}</span>
                    <span className="text-[10px] opacity-75">{l.level}</span>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
        
        <div className="text-[9px] font-bold opacity-40 mt-6">CampusCV Creative Format</div>
      </div>

      {/* Right Main Content */}
      <div className={`col-span-8 p-10 ${mainBg} ${spacingClass}`}>
        {data.summary && (
          <div className="space-y-2">
            <h3 className="text-xs font-black uppercase tracking-widest text-gray-400">About Me</h3>
            <p className="text-sm leading-relaxed font-medium italic">{data.summary}</p>
          </div>
        )}

        {data.experience.length > 0 && (
          <div className="space-y-4">
            <h3 className="text-xs font-black uppercase tracking-widest text-gray-400">{t.builder.experience}</h3>
            <div className="space-y-4">
              {data.experience.map((exp, i) => (
                <div key={exp.id} className="border-l-2 pl-4 py-0.5" style={{ borderColor: primaryColor }}>
                  <div className="flex justify-between items-baseline">
                    <h4 className="font-bold text-sm text-gray-900 dark:text-white">{exp.position}</h4>
                    <span className="text-[10px] font-mono text-gray-400">{exp.startDate} — {exp.endDate}</span>
                  </div>
                  <div className="text-xs font-bold mb-1" style={{ color: primaryColor }}>{exp.company}</div>
                  <p className="text-xs leading-relaxed opacity-95">{exp.description}</p>
                </div>
              ))}
            </div>
          </div>
        )}

        {data.projects.length > 0 && (
          <div className="space-y-4">
            <h3 className="text-xs font-black uppercase tracking-widest text-gray-400">{t.builder.projects}</h3>
            <div className="grid grid-cols-2 gap-4">
              {data.projects.map((proj, i) => (
                <div key={proj.id} className="p-3 rounded-xl border border-gray-100 dark:border-gray-800 bg-gray-50/40 dark:bg-gray-900/30">
                  <h4 className="font-bold text-xs text-gray-900 dark:text-white mb-1">{proj.name}</h4>
                  <p className="text-[10px] font-mono mb-2" style={{ color: primaryColor }}>{proj.technologies}</p>
                  <p className="text-[11px] leading-relaxed opacity-85 line-clamp-3">{proj.description}</p>
                </div>
              ))}
            </div>
          </div>
        )}

        {data.education.length > 0 && (
          <div className="space-y-3">
            <h3 className="text-xs font-black uppercase tracking-widest text-gray-400">{t.builder.education}</h3>
            <div className="space-y-2">
              {data.education.map((edu, i) => (
                <div key={edu.id} className="flex justify-between items-center text-xs">
                  <div>
                    <span className="font-bold">{edu.degree}</span>
                    <span className="mx-2 text-gray-300">|</span>
                    <span className="opacity-80">{edu.institution}</span>
                  </div>
                  <span className="text-[10px] font-mono text-gray-400">{edu.startDate} — {edu.endDate}</span>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

function TechTemplate({ data, lang, isDarkMode = false }: { data: CVData, lang: Language, isDarkMode?: boolean }) {
  const t = TRANSLATIONS[lang];
  const { primaryColor, spacing } = data.settings;
  
  const spacingClass = spacing === 'compact' ? 'space-y-4' : spacing === 'relaxed' ? 'space-y-8' : 'space-y-6';

  return (
    <div className={`h-full font-mono p-12 ${isDarkMode ? 'bg-gray-950 text-emerald-400' : 'bg-white text-slate-800'} text-xs`}>
      {/* Header */}
      <div className="border-b border-gray-800 pb-6 mb-6">
        <div className="flex justify-between items-start">
          <div>
            <h1 className="text-2xl font-black mb-1 text-gray-900 dark:text-white">
              &gt; {data.personalInfo.fullName || t.builder.fullName}
            </h1>
            <p className="text-xs font-bold" style={{ color: primaryColor }}>
              $ cd {data.personalInfo.targetRole?.toLowerCase().replace(/\s+/g, '-') || 'developer'}
            </p>
          </div>
          <div className="text-right text-[11px] space-y-0.5 font-mono text-gray-500 dark:text-gray-400">
            <p>email: {data.personalInfo.email}</p>
            <p>phone: {data.personalInfo.phone}</p>
            <p>loc: {data.personalInfo.location}</p>
            {data.personalInfo.linkedin && <p>lnk: {data.personalInfo.linkedin}</p>}
          </div>
        </div>
      </div>

      <div className={spacingClass}>
        {data.summary && (
          <div className="space-y-2">
            <h3 className="font-black uppercase tracking-widest text-gray-900 dark:text-white" style={{ color: primaryColor }}>// PROFILE</h3>
            <p className="leading-relaxed opacity-90">{data.summary}</p>
          </div>
        )}

        {data.skills.length > 0 && (
          <div className="space-y-2">
            <h3 className="font-black uppercase tracking-widest text-gray-900 dark:text-white" style={{ color: primaryColor }}>// TECH_STACK</h3>
            <div className="flex flex-wrap gap-2">
              {data.skills.map(s => (
                <span key={s} className="px-2 py-0.5 border border-gray-800 dark:border-gray-700 bg-gray-50 dark:bg-gray-900/50 rounded text-[10px]">
                  [{s}]
                </span>
              ))}
            </div>
          </div>
        )}

        {data.experience.length > 0 && (
          <div className="space-y-3">
            <h3 className="font-black uppercase tracking-widest text-gray-900 dark:text-white" style={{ color: primaryColor }}>// EXPERIENCE</h3>
            <div className="space-y-4">
              {data.experience.map((exp, i) => (
                <div key={exp.id} className="space-y-1">
                  <div className="flex justify-between items-baseline font-bold">
                    <span className="text-gray-900 dark:text-white">{exp.position} @ {exp.company}</span>
                    <span className="text-gray-400 font-normal">{exp.startDate} - {exp.endDate}</span>
                  </div>
                  <p className="opacity-80 leading-relaxed whitespace-pre-wrap">{exp.description}</p>
                </div>
              ))}
            </div>
          </div>
        )}

        {data.projects.length > 0 && (
          <div className="space-y-3">
            <h3 className="font-black uppercase tracking-widest text-gray-900 dark:text-white" style={{ color: primaryColor }}>// DEPLOYED_PROJECTS</h3>
            <div className="space-y-3">
              {data.projects.map((proj, i) => (
                <div key={proj.id} className="border border-gray-200 dark:border-gray-800 p-3 rounded bg-gray-50/50 dark:bg-gray-900/10">
                  <div className="font-bold text-gray-900 dark:text-white">{proj.name}</div>
                  <div className="text-[10px] opacity-75 font-semibold mb-1">tech: {proj.technologies}</div>
                  <p className="opacity-80 leading-relaxed">{proj.description}</p>
                </div>
              ))}
            </div>
          </div>
        )}

        {data.education.length > 0 && (
          <div className="space-y-2">
            <h3 className="font-black uppercase tracking-widest text-gray-900 dark:text-white" style={{ color: primaryColor }}>// EDUCATION</h3>
            <div className="space-y-2">
              {data.education.map((edu, i) => (
                <div key={edu.id} className="flex justify-between">
                  <span>{edu.degree} - {edu.institution}</span>
                  <span className="text-gray-400">{edu.startDate} - {edu.endDate}</span>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

function AcademicTemplate({ data, lang, isDarkMode = false }: { data: CVData, lang: Language, isDarkMode?: boolean }) {
  const t = TRANSLATIONS[lang];
  const { spacing } = data.settings;
  
  const spacingClass = spacing === 'compact' ? 'space-y-5' : spacing === 'relaxed' ? 'space-y-10' : 'space-y-7';

  return (
    <div className={`h-full font-serif p-16 ${isDarkMode ? 'bg-gray-950 text-gray-100' : 'bg-white text-gray-900'} text-xs leading-relaxed`}>
      {/* Centered Header */}
      <div className="text-center mb-8">
        <h1 className="text-3xl font-medium tracking-wide text-gray-900 dark:text-white mb-2">{data.personalInfo.fullName || t.builder.fullName}</h1>
        <p className="text-sm tracking-widest uppercase font-sans text-gray-500 mb-4">{data.personalInfo.targetRole || t.builder.targetRole}</p>
        <div className="text-[11px] font-sans text-gray-400 space-x-2 flex justify-center flex-wrap">
          <span>{data.personalInfo.email}</span>
          <span>•</span>
          <span>{data.personalInfo.phone}</span>
          <span>•</span>
          <span>{data.personalInfo.location}</span>
          {data.personalInfo.linkedin && (
            <>
              <span>•</span>
              <span>{data.personalInfo.linkedin.replace(/^https?:\/\/(www\.)?/, '')}</span>
            </>
          )}
        </div>
      </div>

      <div className={spacingClass}>
        {data.summary && (
          <div className="space-y-1.5">
            <h3 className="text-xs uppercase font-sans tracking-widest text-gray-400 border-b pb-1 font-bold">Research Summary</h3>
            <p className="italic opacity-90">{data.summary}</p>
          </div>
        )}

        {data.experience.length > 0 && (
          <div className="space-y-2">
            <h3 className="text-xs uppercase font-sans tracking-widest text-gray-400 border-b pb-1 font-bold">Professional Experience</h3>
            <div className="space-y-4">
              {data.experience.map((exp, i) => (
                <div key={exp.id} className="space-y-1">
                  <div className="flex justify-between items-baseline font-bold text-sm">
                    <span className="text-gray-900 dark:text-white">{exp.position}</span>
                    <span className="font-sans text-[10px] text-gray-400 font-normal">{exp.startDate} — {exp.endDate}</span>
                  </div>
                  <div className="font-sans text-[11px] opacity-75">{exp.company}</div>
                  <p className="opacity-80 text-[11.5px] pl-4 border-l border-gray-200 dark:border-gray-800">{exp.description}</p>
                </div>
              ))}
            </div>
          </div>
        )}

        {data.education.length > 0 && (
          <div className="space-y-2">
            <h3 className="text-xs uppercase font-sans tracking-widest text-gray-400 border-b pb-1 font-bold">Education</h3>
            <div className="space-y-3">
              {data.education.map((edu, i) => (
                <div key={edu.id} className="flex justify-between items-start">
                  <div>
                    <span className="font-bold text-gray-900 dark:text-white">{edu.degree}</span>
                    <div className="opacity-75">{edu.institution}</div>
                  </div>
                  <span className="font-sans text-[10px] text-gray-400">{edu.startDate} — {edu.endDate}</span>
                </div>
              ))}
            </div>
          </div>
        )}

        {data.skills.length > 0 && (
          <div className="space-y-1.5">
            <h3 className="text-xs uppercase font-sans tracking-widest text-gray-400 border-b pb-1 font-bold">Areas of Expertise</h3>
            <p className="opacity-90">{data.skills.join(', ')}</p>
          </div>
        )}

        {data.certifications.length > 0 && (
          <div className="space-y-1.5">
            <h3 className="text-xs uppercase font-sans tracking-widest text-gray-400 border-b pb-1 font-bold">Certifications & Honors</h3>
            <p className="opacity-90">{data.certifications.join(' • ')}</p>
          </div>
        )}
      </div>
    </div>
  );
}

function RetroTemplate({ data, lang, isDarkMode = false }: { data: CVData, lang: Language, isDarkMode?: boolean }) {
  const t = TRANSLATIONS[lang];
  const { primaryColor, spacing } = data.settings;
  
  const spacingClass = spacing === 'compact' ? 'space-y-4' : spacing === 'relaxed' ? 'space-y-8' : 'space-y-6';

  const retroBg = isDarkMode ? 'bg-[#1e1a15] text-[#ebdcc5]' : 'bg-[#fcf9f2] text-[#3c2c1e]';
  const retroBorder = isDarkMode ? 'border-[#3c2c1e]' : 'border-[#d4c3b3]';

  return (
    <div className={`h-full p-12 ${retroBg} ${retroBorder} border-4 rounded-xl text-xs flex flex-col justify-between`}>
      <div className="space-y-6">
        {/* Double Border Retro Header */}
        <div className={`border-2 p-6 rounded ${retroBorder} flex justify-between items-center bg-[#fdfcf7]/5 dark:bg-[#15120e]/30`}>
          <div>
            <h1 className="text-3xl font-black uppercase tracking-tight mb-1" style={{ color: primaryColor }}>{data.personalInfo.fullName || t.builder.fullName}</h1>
            <h2 className="text-sm font-bold opacity-80">{data.personalInfo.targetRole || t.builder.targetRole}</h2>
          </div>
          <div className="text-right text-[11px] font-mono opacity-80 space-y-0.5">
            <p>{data.personalInfo.email}</p>
            <p>{data.personalInfo.phone}</p>
            <p>{data.personalInfo.location}</p>
          </div>
        </div>

        <div className={spacingClass}>
          {data.summary && (
            <div className="space-y-2">
              <h3 className={`text-[10px] font-black uppercase tracking-wider px-2 py-1 inline-block border rounded ${retroBorder}`} style={{ color: primaryColor }}>About Candidate</h3>
              <p className="leading-relaxed opacity-90 italic">"{data.summary}"</p>
            </div>
          )}

          {data.experience.length > 0 && (
            <div className="space-y-3">
              <h3 className={`text-[10px] font-black uppercase tracking-wider px-2 py-1 inline-block border rounded ${retroBorder}`} style={{ color: primaryColor }}>Employment History</h3>
              <div className="space-y-4">
                {data.experience.map((exp, i) => (
                  <div key={exp.id} className="space-y-1">
                    <div className="flex justify-between items-baseline font-bold text-sm">
                      <span>{exp.position}</span>
                      <span className="text-[10px] opacity-75">{exp.startDate} - {exp.endDate}</span>
                    </div>
                    <div className="font-bold opacity-80" style={{ color: primaryColor }}>{exp.company}</div>
                    <p className="opacity-90">{exp.description}</p>
                  </div>
                ))}
              </div>
            </div>
          )}

          {data.projects.length > 0 && (
            <div className="space-y-3">
              <h3 className={`text-[10px] font-black uppercase tracking-wider px-2 py-1 inline-block border rounded ${retroBorder}`} style={{ color: primaryColor }}>Selected Works</h3>
              <div className="grid grid-cols-2 gap-4">
                {data.projects.map((proj, i) => (
                  <div key={proj.id} className={`p-3 border rounded ${retroBorder} bg-black/5`}>
                    <div className="font-bold">{proj.name}</div>
                    <div className="text-[10px] opacity-70 mb-1">{proj.technologies}</div>
                    <p className="opacity-80 line-clamp-3">{proj.description}</p>
                  </div>
                ))}
              </div>
            </div>
          )}

          {data.skills.length > 0 && (
            <div className="space-y-2">
              <h3 className={`text-[10px] font-black uppercase tracking-wider px-2 py-1 inline-block border rounded ${retroBorder}`} style={{ color: primaryColor }}>Skills</h3>
              <div className="flex flex-wrap gap-2">
                {data.skills.map(s => (
                  <span key={s} className={`px-2.5 py-1 border rounded ${retroBorder} bg-white/20 text-[10px] font-bold uppercase`}>
                    {s}
                  </span>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>

      <div className="border-t pt-4 flex justify-between items-center opacity-50 text-[9px] font-mono mt-6">
        <span>CampusCV Vintage Template</span>
        <span>Est. 2026</span>
      </div>
    </div>
  );
}

