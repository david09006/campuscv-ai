import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Search, MapPin, Filter, Star, Zap, Building2, Calendar, ArrowUpRight, CheckCircle2, History, Globe, Loader2, ExternalLink, AlertCircle, Briefcase } from 'lucide-react';
import type { LucideIcon } from 'lucide-react';
import { searchExternalJobs } from '../lib/gemini';
import { Language, TRANSLATIONS } from '../lib/i18n';
import { Job } from '../types';

const POPULAR_COMPANIES = ['Google', 'Apple', 'Microsoft', 'Amazon', 'Meta', 'Netflix', 'Tesla', 'Adobe', 'Spotify', 'IBM'];

const INITIAL_JOBS: Job[] = [
  {
    id: '1',
    title: 'Frontend Developer Intern',
    company: 'Adobe',
    domain: 'Tech',
    location: 'București (Hibrid)',
    type: 'Internship',
    remote: true,
    matchScore: 98,
    postedAt: '2026-05-08T14:00:00Z',
    description: 'Work with the Adobe Experience Cloud team on modern web interfaces using React.',
    source: 'Featured'
  },
  {
    id: 'google-1',
    title: 'Software Engineering Intern',
    company: 'Google',
    domain: 'Tech',
    location: 'București / Remote',
    type: 'Internship',
    remote: true,
    matchScore: 99,
    postedAt: '2026-05-08T09:00:00Z',
    description: 'Join the Google Cloud team to build next-generation infrastructure tools.',
    source: 'Featured'
  },
  {
    id: 'ms-1',
    title: 'Junior Cloud Developer',
    company: 'Microsoft',
    domain: 'Tech',
    location: 'Remote',
    type: 'Full-time',
    remote: true,
    matchScore: 88,
    postedAt: '2026-05-07T12:00:00Z',
    description: 'Build scalable services on Azure. Junior level position for recent graduates.',
    source: 'Featured'
  },
  {
    id: '2',
    title: 'Digital Marketing Intern',
    company: 'Amazon',
    domain: 'Marketing',
    location: 'Iași',
    type: 'Internship',
    remote: false,
    matchScore: 85,
    postedAt: '2026-05-08T11:00:00Z',
    description: 'Help manage digital campaigns for AWS services across Europe.',
    source: 'Featured'
  },
  {
    id: 'apple-1',
    title: 'iOS Developer Intern',
    company: 'Apple',
    domain: 'Tech',
    location: 'București',
    type: 'Internship',
    remote: false,
    matchScore: 94,
    postedAt: '2026-05-06T10:00:00Z',
    description: 'Work on the next generation of iOS apps with our core engineering team.',
    source: 'Featured'
  }
];

export default function JobBoard({ lang = 'en', isDarkMode = false }: { lang?: Language, isDarkMode?: boolean }) {
  // isDarkMode retained for signature compatibility; dark mode now handled via CSS tokens.
  const [jobs, setJobs] = useState<Job[]>(INITIAL_JOBS);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedType, setSelectedType] = useState<string | null>(null);
  const [selectedDomain, setSelectedDomain] = useState<string | null>(null);
  const [selectedCompany, setSelectedCompany] = useState<string | null>(null);
  const [remoteOnly, setRemoteOnly] = useState(false);
  const [dateFilter, setDateFilter] = useState<'all' | 'today' | 'week'>('all');
  const [applicationStatus, setApplicationStatus] = useState<'all' | 'applied' | 'not_applied'>('all');
  const [isWebSearching, setIsWebSearching] = useState(false);
  const [hasSearched, setHasSearched] = useState(false);
  const [searchError, setSearchError] = useState<string | null>(null);
  const [appliedJobs, setAppliedJobs] = useState<string[]>(() => {
    if (typeof window !== 'undefined') {
      const saved = localStorage.getItem('appliedJobs');
      return saved ? JSON.parse(saved) : [];
    }
    return [];
  });

  useEffect(() => {
    localStorage.setItem('appliedJobs', JSON.stringify(appliedJobs));
  }, [appliedJobs]);

  // Fetch some real initial jobs on mount
  useEffect(() => {
    const fetchInitial = async () => {
      setIsWebSearching(true);
      try {
        const initialQuery = lang === 'ro' ? 'internship software romania 2026' : 'software engineering internship 2026';
        const webJobs = await searchExternalJobs(initialQuery, lang);
        if (webJobs.length > 0) {
          setJobs(prev => {
            const existingIds = new Set(prev.map(j => j.id));
            const newJobs = webJobs.filter(j => !existingIds.has(j.id));
            return [...prev, ...newJobs];
          });
        }
      } catch (e) {
        console.error("Initial fetch failed", e);
        setSearchError(e instanceof Error ? e.message : TRANSLATIONS[lang].jobs.searchErrorGeneric);
      } finally {
        setIsWebSearching(false);
      }
    };
    fetchInitial();
  }, [lang]);

  const t = TRANSLATIONS[lang];

  const domains = Array.from(new Set(jobs.map(j => j.domain))).sort();
  const companies = Array.from(new Set(jobs.map(j => j.company))).sort((a, b) => {
    const aIndex = POPULAR_COMPANIES.indexOf(a);
    const bIndex = POPULAR_COMPANIES.indexOf(b);

    const aPop = aIndex !== -1;
    const bPop = bIndex !== -1;

    if (aPop && bPop) return aIndex - bIndex;
    if (aPop && !bPop) return -1;
    if (!aPop && bPop) return 1;
    return a.localeCompare(b);
  });

  const filteredJobs = jobs.filter(job => {
    const isApplied = appliedJobs.includes(job.id);
    const matchesApplied = applicationStatus === 'all' ||
                          (applicationStatus === 'applied' && isApplied) ||
                          (applicationStatus === 'not_applied' && !isApplied);

    const matchesSearch = job.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                          job.company.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesType = !selectedType || job.type === selectedType;
    const matchesDomain = !selectedDomain || job.domain === selectedDomain;
    const matchesCompany = !selectedCompany || job.company === selectedCompany;
    const matchesRemote = !remoteOnly || job.remote;

    const now = new Date();
    const jobDate = new Date(job.postedAt);
    const diffHours = (now.getTime() - jobDate.getTime()) / (1000 * 60 * 60);

    let matchesDate = true;
    if (dateFilter === 'today') matchesDate = diffHours <= 24;
    else if (dateFilter === 'week') matchesDate = diffHours <= 168;

    return matchesApplied && matchesSearch && matchesType && matchesDomain && matchesCompany && matchesRemote && matchesDate;
  });

  const handleFetchWebJobs = async () => {
    if (!searchTerm) {
      alert("Please enter a search term first.");
      return;
    }
    setIsWebSearching(true);
    setHasSearched(true);
    setSearchError(null);
    try {
      const webJobs = await searchExternalJobs(searchTerm, lang);
      const existingIds = new Set(jobs.map(j => j.id));
      const newJobs = webJobs.filter(j => !existingIds.has(j.id));
      setJobs(prev => [...prev, ...newJobs]);
    } catch (error) {
      console.error(error);
      setSearchError(error instanceof Error ? error.message : TRANSLATIONS[lang].jobs.searchErrorGeneric);
    } finally {
      setIsWebSearching(false);
    }
  };

  const handleApply = (id: string, url?: string) => {
    if (url) {
      window.open(url, '_blank');
    }
    if (appliedJobs.includes(id)) return;
    setAppliedJobs([...appliedJobs, id]);
  };

  return (
    <div className="max-w-7xl mx-auto px-4 md:px-8 py-10 space-y-8 min-h-full bg-background text-ink">
      {/* Search and Filters Header */}
      <div className="flex flex-col gap-6 rounded-panel border border-border bg-surface p-6 md:p-8">
        {searchError && (
          <div className="flex items-start gap-2 rounded-card border border-destructive/30 bg-destructive-tint p-3 text-sm text-destructive">
            <AlertCircle size={16} className="shrink-0 mt-0.5" />
            <span>{searchError}</span>
          </div>
        )}
        <div className="flex flex-col md:flex-row gap-6 items-end justify-between">
          <div className="w-full md:max-w-md space-y-2">
            <h2 className="font-display text-[26px] md:text-[33px] font-medium tracking-tight text-ink">{t.jobs.title}</h2>
            <p className="text-sm text-muted">{t.jobs.desc}</p>
            <div className="relative mt-4">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-muted" size={18} />
              <input
                type="text"
                placeholder={t.jobs.searchPlaceholder}
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full h-12 pl-11 rounded-control border border-border bg-surface px-3.5 text-sm text-ink placeholder:text-muted/60 outline-none transition-colors focus:border-accent focus:ring-2 focus:ring-accent/25"
              />
            </div>
          </div>

          <div className="flex flex-wrap gap-2">
            <div className="flex flex-col gap-2">
              <button
                onClick={handleFetchWebJobs}
                disabled={isWebSearching || !searchTerm}
                className="inline-flex items-center justify-center gap-2 h-11 px-5 rounded-control bg-accent text-accent-contrast text-sm font-semibold cursor-pointer transition-colors duration-200 hover:bg-accent-hover focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-accent active:translate-y-px disabled:opacity-50 disabled:pointer-events-none"
              >
                {isWebSearching ? <Loader2 size={18} className="animate-spin" /> : <Globe size={18} />}
                {isWebSearching ? t.jobs.searchingWeb : t.jobs.searchExternal}
              </button>
              <div className="flex items-center gap-1.5 px-2">
                <div className="h-1.5 w-1.5 rounded-full bg-accent animate-pulse" />
                <span className="text-xs font-medium uppercase tracking-[0.08em] text-accent">Live Web Search Active</span>
              </div>
            </div>
            {['Internship', 'Full-time', 'Part-time'].map((type) => (
              <button
                key={type}
                onClick={() => setSelectedType(selectedType === type ? null : type)}
                className={`h-11 px-5 rounded-control border text-sm font-medium transition-colors cursor-pointer focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-accent ${
                  selectedType === type
                    ? 'border-accent bg-accent text-accent-contrast'
                    : 'border-border bg-surface text-muted hover:border-accent/40 hover:text-ink'
                }`}
              >
                {type}
              </button>
            ))}
          </div>
        </div>

        <div className="flex flex-wrap gap-4 items-center pt-6 border-t border-border">
          {/* Status Filter */}
          <div className="flex items-center gap-2">
            <span className="text-xs font-medium uppercase tracking-[0.08em] text-muted">{t.jobs.statusLabel}:</span>
            <div className="flex rounded-control border border-border bg-background p-0.5">
              {[
                { id: 'all', label: t.jobs.statusAll, count: jobs.length },
                { id: 'applied', label: t.jobs.statusApplied, count: appliedJobs.length },
                { id: 'not_applied', label: t.jobs.statusNew, count: jobs.length - appliedJobs.length }
              ].map((s) => (
                <button
                  key={s.id}
                  onClick={() => setApplicationStatus(s.id as any)}
                  className={`h-9 px-3 rounded-[4px] text-xs font-medium transition-colors flex items-center gap-1.5 cursor-pointer focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-accent ${
                    applicationStatus === s.id
                      ? 'bg-surface text-ink shadow-card'
                      : 'text-muted hover:text-ink'
                  }`}
                >
                  {s.label}
                  {s.count > 0 && (
                    <span className={`px-1.5 py-0.5 rounded-full text-[10px] transition-colors ${
                      applicationStatus === s.id
                        ? 'bg-accent text-accent-contrast'
                        : 'bg-border text-muted'
                    }`}>
                      {s.count}
                    </span>
                  )}
                </button>
              ))}
            </div>
          </div>

          {/* Company Filter */}
          <div className="flex items-center gap-2">
            <span className="text-xs font-medium uppercase tracking-[0.08em] text-muted">{t.jobs.companyLabel}:</span>
            <select
              value={selectedCompany || ''}
              onChange={(e) => setSelectedCompany(e.target.value || null)}
              className="h-11 w-auto rounded-control border border-border bg-surface px-3 text-xs text-ink outline-none transition-colors cursor-pointer focus:border-accent focus:ring-2 focus:ring-accent/25"
            >
              <option value="">{t.jobs.allCompanies}</option>
              <optgroup label={t.jobs.popularCompanies}>
                {companies.filter(c => POPULAR_COMPANIES.includes(c)).map(c => (
                  <option key={c} value={c}>{c}</option>
                ))}
              </optgroup>
              <optgroup label={t.jobs.alphabeticalLabel}>
                {companies.filter(c => !POPULAR_COMPANIES.includes(c)).map(c => (
                  <option key={c} value={c}>{c}</option>
                ))}
              </optgroup>
            </select>
          </div>

          {/* Quick Filter chips for popular companies if they have jobs */}
          <div className="hidden lg:flex items-center gap-2 border-l border-border pl-4 ml-2">
            {companies.filter(c => POPULAR_COMPANIES.includes(c)).slice(0, 3).map(c => (
              <button
                key={c}
                onClick={() => setSelectedCompany(selectedCompany === c ? null : c)}
                className={`inline-flex items-center gap-1.5 rounded-full border px-2.5 py-1 text-xs font-medium cursor-pointer transition-colors focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-accent ${
                  selectedCompany === c
                    ? 'border-accent/30 bg-accent-tint text-accent'
                    : 'border-border bg-surface text-muted hover:border-accent/40 hover:text-ink'
                }`}
              >
                {c}
              </button>
            ))}
          </div>

          {/* Domain Filter */}
          <div className="flex items-center gap-2">
            <span className="text-xs font-medium uppercase tracking-[0.08em] text-muted">{t.jobs.filterDomain}:</span>
            <select
              value={selectedDomain || ''}
              onChange={(e) => setSelectedDomain(e.target.value || null)}
              className="h-11 w-auto rounded-control border border-border bg-surface px-3 text-xs text-ink outline-none transition-colors cursor-pointer focus:border-accent focus:ring-2 focus:ring-accent/25"
            >
              <option value="">{t.jobs.allDomains}</option>
              {domains.map(d => <option key={d} value={d}>{d}</option>)}
            </select>
          </div>

          {/* Date Filter */}
          <div className="flex items-center gap-2">
            <span className="text-xs font-medium uppercase tracking-[0.08em] text-muted">{t.jobs.filterDate}:</span>
            <div className="flex rounded-control border border-border bg-background p-0.5">
              {[
                { id: 'all', label: t.jobs.dateAll },
                { id: 'today', label: t.jobs.dateToday },
                { id: 'week', label: t.jobs.dateWeek }
              ].map((d) => (
                <button
                  key={d.id}
                  onClick={() => setDateFilter(d.id as any)}
                  className={`h-9 px-3 rounded-[4px] text-xs font-medium transition-colors cursor-pointer focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-accent ${
                    dateFilter === d.id
                      ? 'bg-surface text-ink shadow-card'
                      : 'text-muted hover:text-ink'
                  }`}
                >
                  {d.label}
                </button>
              ))}
            </div>
          </div>

          {/* Remote Toggle */}
          <button
            onClick={() => setRemoteOnly(!remoteOnly)}
            className={`flex items-center gap-2 h-11 px-4 rounded-control border transition-colors text-xs font-medium cursor-pointer focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-accent ${
              remoteOnly
                ? 'border-accent/30 bg-accent-tint text-accent'
                : 'border-border bg-surface text-muted hover:border-accent/40 hover:text-ink'
            }`}
          >
            <div className={`w-4 h-4 rounded-full border flex items-center justify-center transition-colors ${remoteOnly ? 'border-accent bg-accent' : 'border-border'}`}>
              {remoteOnly && <CheckCircle2 size={10} className="text-accent-contrast" />}
            </div>
            {t.jobs.filterRemote}
          </button>

          {(selectedType || selectedDomain || selectedCompany || remoteOnly || dateFilter !== 'all' || searchTerm || applicationStatus !== 'all') && (
            <motion.button
              initial={{ opacity: 0, x: -10 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.2, ease: 'easeOut' }}
              onClick={() => {
                setSearchTerm('');
                setSelectedType(null);
                setSelectedDomain(null);
                setSelectedCompany(null);
                setRemoteOnly(false);
                setDateFilter('all');
                setApplicationStatus('all');
              }}
              className="flex items-center gap-2 h-11 px-4 rounded-control text-xs font-medium text-muted transition-colors ml-auto cursor-pointer hover:text-destructive focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-accent"
            >
              <History size={14} className="rotate-180" />
              {t.jobs.resetFilters}
            </motion.button>
          )}
        </div>
      </div>

      {/* Stats row */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
         <StatCard label={t.jobs.statJobs} value={filteredJobs.length.toString()} icon={Zap} />
         <StatCard label={t.jobs.statMatch} value="88%" icon={Star} />
         <StatCard label={t.jobs.statPartners} value="156" icon={Building2} />
         <StatCard label={t.jobs.statUpdated} value={t.jobs.statAzi} icon={Calendar} />
      </div>

      {/* Results Grid */}
      <div className="grid md:grid-cols-2 gap-6">
        <AnimatePresence mode="popLayout">
          {filteredJobs.map((job, idx) => {
            const applied = appliedJobs.includes(job.id);
            return (
              <motion.div
                layout
                key={job.id}
                initial={{ opacity: 0, y: 12 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0 }}
                transition={{ duration: 0.2, ease: 'easeOut', delay: idx * 0.03 }}
                className="rounded-card border border-border bg-surface p-6 transition-all duration-200 hover:border-accent/40 hover:shadow-hover flex flex-col justify-between"
              >
                <div>
                  <div className="flex justify-between items-start mb-4">
                    <div className="flex items-center gap-3">
                      <div className={`w-11 h-11 rounded-card flex items-center justify-center font-semibold border transition-colors shrink-0 ${
                        applied
                          ? 'bg-accent-tint border-accent/30 text-accent'
                          : 'bg-background border-border text-muted'
                      }`}>
                         {applied ? <CheckCircle2 size={20} /> : job.company.charAt(0)}
                      </div>
                      <div>
                        <h3 className="text-[18px] font-semibold text-ink">{job.title}</h3>
                        <p className="text-sm text-muted">{job.company}</p>
                      </div>
                    </div>
                    <div className="text-right">
                      {applied && (
                        <Badge icon={CheckCircle2} label={t.jobs.applied} variant="accent" />
                      )}
                      <div className="inline-flex items-center gap-1 rounded-full border border-accent/30 bg-accent-tint px-2 py-1 text-[10px] font-semibold uppercase tracking-wider text-accent mb-1 mt-1">
                        <Zap size={10} fill="currentColor" /> {job.matchScore}% Match
                      </div>
                      {job.source && job.source !== 'Featured' && (
                        <div className="flex items-center gap-1 text-[10px] font-medium text-clay-text uppercase tracking-wider mt-1 justify-end">
                          <Globe size={10} /> {job.source}
                        </div>
                      )}
                      {job.source === 'Featured' && (
                        <div className="flex items-center gap-1 text-[10px] font-medium text-muted uppercase tracking-wider mt-1 justify-end">
                          <Star size={10} fill="currentColor" /> {t.jobs.featured}
                        </div>
                      )}
                      <p className="text-[10px] font-medium text-muted uppercase tracking-wider mt-1">
                        {new Date(job.postedAt).toLocaleDateString()}
                      </p>
                    </div>
                  </div>

                  <div className="flex flex-wrap gap-2 mb-4">
                    <Badge icon={MapPin} label={job.location} variant="neutral" />
                    <Badge icon={Filter} label={job.type} variant="neutral" />
                    <Badge icon={Building2} label={job.domain} variant="neutral" />
                    {job.remote && <Badge icon={CheckCircle2} label="Remote Friendly" variant="accent" />}
                    {job.source && job.source !== 'Featured' && <Badge icon={ExternalLink} label={t.jobs.realResult} variant="clay" />}
                  </div>

                  <p className="text-sm text-muted leading-relaxed line-clamp-2 mb-6">
                    {job.description}
                  </p>
                </div>

                <div className="flex items-center justify-between pt-4 border-t border-border">
                   <button
                    onClick={() => job.url && window.open(job.url, '_blank')}
                    className="inline-flex items-center justify-center gap-2 h-11 px-4 rounded-control border border-border bg-surface text-ink text-sm font-semibold cursor-pointer transition-colors duration-200 hover:border-accent hover:text-accent focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-accent active:translate-y-px"
                   >
                     {t.jobs.detailsBtn} <ArrowUpRight size={14} />
                   </button>
                   <motion.button
                    whileTap={{ scale: 0.98 }}
                    onClick={() => handleApply(job.id, job.url)}
                    className={`inline-flex items-center justify-center gap-2 h-11 px-4 rounded-control text-sm font-semibold cursor-pointer transition-colors duration-200 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-accent active:translate-y-px ${
                      applied
                        ? 'border border-accent/30 bg-accent-tint text-accent'
                        : 'bg-accent text-accent-contrast hover:bg-accent-hover'
                    }`}
                   >
                     {applied ? (
                       <span className="flex items-center gap-2"><CheckCircle2 size={16} className="shrink-0" /> {t.jobs.applied}</span>
                     ) : t.jobs.applyBtn}
                   </motion.button>
                </div>
              </motion.div>
            );
          })}
        </AnimatePresence>
      </div>

      {filteredJobs.length === 0 && (
        <div className="rounded-card border border-dashed border-border py-16 text-center">
           <Briefcase size={24} className="mx-auto text-muted/60" />
           <h3 className="text-base font-semibold text-ink mt-4">{t.jobs.noResults}</h3>
           <p className="text-sm text-muted mt-3">{t.jobs.noResultsDesc}</p>
        </div>
      )}
    </div>
  );
}

function StatCard({ label, value, icon: Icon }: { label: string; value: string; icon: LucideIcon }) {
  return (
    <div className="rounded-card border border-border bg-surface p-5 flex items-center gap-4">
      <div className="flex h-10 w-10 items-center justify-center rounded-card bg-accent-tint text-accent shrink-0">
        <Icon size={18} />
      </div>
      <div>
        <div className="font-display text-[26px] font-medium text-ink leading-none">{value}</div>
        <div className="text-xs font-medium uppercase tracking-[0.08em] text-muted mt-1.5">{label}</div>
      </div>
    </div>
  );
}

function Badge({ label, icon: Icon, variant = 'neutral' }: { label: string; icon?: LucideIcon; variant?: 'neutral' | 'accent' | 'clay' }) {
  const variantClasses: Record<string, string> = {
    neutral: 'border-border bg-surface text-muted',
    accent: 'border-accent/30 bg-accent-tint text-accent',
    clay: 'border-clay/30 bg-clay-tint text-clay-text',
  };
  return (
    <span className={`inline-flex items-center gap-1.5 rounded-full border px-2.5 py-1 text-xs font-medium ${variantClasses[variant]}`}>
      {Icon && <Icon size={12} />} {label}
    </span>
  );
}
