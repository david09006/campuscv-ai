import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Search, MapPin, Filter, Star, Zap, Building2, Calendar, ArrowUpRight, CheckCircle2, History, Globe, Loader2, ExternalLink, AlertCircle } from 'lucide-react';
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
    <div className={`max-w-7xl mx-auto px-4 md:px-8 py-10 space-y-10 grid-bg min-h-full transition-colors ${
      isDarkMode ? 'text-white' : 'text-gray-900'
    }`}>
      {/* Search and Filters Header */}
      <div className={`flex flex-col gap-8 p-8 rounded-xl shadow-sm border transition-all ${
        isDarkMode
          ? 'bg-gray-900 shadow-none border-gray-800'
          : 'bg-white border-gray-200'
      }`}>
        {searchError && (
          <div className={`flex items-start gap-2 rounded-2xl p-4 text-sm ${
            isDarkMode ? 'bg-red-950/40 text-red-300 border border-red-900/50' : 'bg-red-50 text-red-700 border border-red-100'
          }`}>
            <AlertCircle size={16} className="shrink-0 mt-0.5" />
            <span>{searchError}</span>
          </div>
        )}
        <div className="flex flex-col md:flex-row gap-6 items-end justify-between">
          <div className="w-full md:max-w-md space-y-2">
            <h2 className={`text-3xl font-black tracking-tighter ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>{t.jobs.title}</h2>
            <p className={`${isDarkMode ? 'text-gray-400' : 'text-gray-500'} text-sm`}>{t.jobs.desc}</p>
            <div className="relative mt-4">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
              <input 
                type="text" 
                placeholder={t.jobs.searchPlaceholder} 
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className={`w-full pl-12 pr-4 py-4 rounded-2xl outline-none transition-all placeholder:text-gray-400 text-sm font-medium shadow-inner border-2 ${
                  isDarkMode 
                    ? 'bg-gray-800 border-gray-700 text-white focus:ring-primary-900/30 focus:bg-gray-900 focus:border-primary-500' 
                    : 'bg-white border-gray-200 text-gray-900 focus:ring-primary-100 focus:bg-white focus:border-primary-500'
                }`}
              />
            </div>
          </div>

          <div className="flex flex-wrap gap-2">
            <div className="flex flex-col gap-2">
              <button
                onClick={handleFetchWebJobs}
                disabled={isWebSearching || !searchTerm}
                className={`flex items-center gap-2 px-6 py-3 rounded-xl text-sm font-bold shadow-lg transition-all ${
                  isWebSearching 
                    ? (isDarkMode ? 'bg-gray-800 text-gray-500' : 'bg-gray-100 text-gray-400')
                    : 'bg-primary-600 text-white hover:bg-primary-700 shadow-primary-500/20 dark:shadow-none translate-y-0 active:translate-y-1'
                }`}
              >
                {isWebSearching ? <Loader2 size={18} className="animate-spin" /> : <Globe size={18} />}
                {isWebSearching ? t.jobs.searchingWeb : t.jobs.searchExternal}
              </button>
              <div className="flex items-center gap-1.5 px-2">
                <div className="w-1.5 h-1.5 bg-emerald-500 rounded-full animate-pulse" />
                <span className={`text-[10px] font-bold uppercase tracking-tighter ${isDarkMode ? 'text-gray-500' : 'text-emerald-600'}`}>Live Web Search Active</span>
              </div>
            </div>
            {['Internship', 'Full-time', 'Part-time'].map((type) => (
              <button
                key={type}
                onClick={() => setSelectedType(selectedType === type ? null : type)}
                className={`px-6 py-3 rounded-xl text-sm font-bold transition-all border shadow-sm ${
                  selectedType === type 
                    ? 'bg-primary-600 text-white border-primary-600 shadow-lg shadow-primary-500/20' 
                    : (isDarkMode 
                        ? 'bg-gray-800 border-gray-700 text-gray-400 hover:bg-gray-700' 
                        : 'bg-white border-gray-200 text-gray-700 hover:bg-gray-50 hover:border-primary-300')
                }`}
              >
                {type}
              </button>
            ))}
          </div>
        </div>

        <div className="flex flex-wrap gap-4 items-center pt-6 border-t border-gray-100 dark:border-gray-800 transition-colors">
          {/* Status Filter */}
          <div className="flex items-center gap-2">
            <span className={`text-xs font-black uppercase tracking-widest ${isDarkMode ? 'text-gray-500' : 'text-gray-400'}`}>{t.jobs.statusLabel}:</span>
            <div className={`flex p-1 rounded-xl border transition-colors ${isDarkMode ? 'bg-gray-800 border-gray-700' : 'bg-gray-100 border-gray-200'}`}>
              {[
                { id: 'all', label: t.jobs.statusAll, count: jobs.length },
                { id: 'applied', label: t.jobs.statusApplied, count: appliedJobs.length },
                { id: 'not_applied', label: t.jobs.statusNew, count: jobs.length - appliedJobs.length }
              ].map((s) => (
                <button
                  key={s.id}
                  onClick={() => setApplicationStatus(s.id as any)}
                  className={`px-3 py-1.5 rounded-lg text-[10px] font-bold uppercase transition-all flex items-center gap-1.5 ${
                    applicationStatus === s.id 
                      ? (isDarkMode ? 'bg-gray-700 text-blue-400 shadow-sm' : 'bg-white text-blue-600 shadow-sm')
                      : (isDarkMode ? 'text-gray-400 hover:text-gray-300' : 'text-gray-400 hover:text-blue-600 hover:bg-white')
                  }`}
                >
                  {s.label}
                  {s.count > 0 && (
                    <span className={`px-1.5 py-0.5 rounded-full text-[8px] transition-colors ${
                      applicationStatus === s.id
                        ? 'bg-blue-600 text-white'
                        : (isDarkMode ? 'bg-gray-700 text-gray-400' : 'bg-gray-200 text-gray-500')
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
            <span className={`text-xs font-black uppercase tracking-widest ${isDarkMode ? 'text-gray-500' : 'text-gray-600'}`}>{t.jobs.companyLabel}:</span>
            <select 
              value={selectedCompany || ''} 
              onChange={(e) => setSelectedCompany(e.target.value || null)}
              className={`border rounded-xl px-3 py-2 text-xs font-bold outline-none cursor-pointer transition-colors ${
                isDarkMode 
                  ? 'bg-gray-800 border-gray-700 text-gray-300 focus:ring-blue-900/30' 
                  : 'bg-gray-100 border-gray-300 text-gray-700 focus:ring-blue-100'
              }`}
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
          <div className={`hidden lg:flex items-center gap-2 border-l transition-colors pl-4 ml-2 ${isDarkMode ? 'border-gray-800' : 'border-gray-200'}`}>
            {companies.filter(c => POPULAR_COMPANIES.includes(c)).slice(0, 3).map(c => (
              <button
                key={c}
                onClick={() => setSelectedCompany(selectedCompany === c ? null : c)}
                className={`px-3 py-1.5 rounded-full text-[10px] font-black uppercase tracking-wider transition-all border ${
                  selectedCompany === c 
                    ? 'bg-blue-600 text-white border-blue-600 shadow-md shadow-blue-100 dark:shadow-none' 
                    : (isDarkMode 
                        ? 'bg-gray-800 text-gray-400 border-gray-700 hover:text-blue-400 hover:border-blue-100' 
                        : 'bg-white text-gray-500 border-gray-200 hover:text-blue-600 hover:border-blue-300 hover:bg-gray-50')
                }`}
              >
                {c}
              </button>
            ))}
          </div>

          {/* Domain Filter */}
          <div className="flex items-center gap-2">
            <span className={`text-xs font-black uppercase tracking-widest ${isDarkMode ? 'text-gray-500' : 'text-gray-600'}`}>{t.jobs.filterDomain}:</span>
            <select 
              value={selectedDomain || ''} 
              onChange={(e) => setSelectedDomain(e.target.value || null)}
              className={`border rounded-xl px-3 py-2 text-xs font-bold outline-none transition-colors ${
                isDarkMode 
                  ? 'bg-gray-800 border-gray-700 text-gray-300 focus:ring-blue-900/30' 
                  : 'bg-gray-100 border-gray-300 text-gray-700 focus:ring-blue-100'
              }`}
            >
              <option value="">{t.jobs.allDomains}</option>
              {domains.map(d => <option key={d} value={d}>{d}</option>)}
            </select>
          </div>

          {/* Date Filter */}
          <div className="flex items-center gap-2">
            <span className={`text-xs font-black uppercase tracking-widest ${isDarkMode ? 'text-gray-500' : 'text-gray-600'}`}>{t.jobs.filterDate}:</span>
            <div className={`flex p-1 rounded-xl border transition-colors ${isDarkMode ? 'bg-gray-800 border-gray-700' : 'bg-gray-200 border-gray-300'}`}>
              {[
                { id: 'all', label: t.jobs.dateAll },
                { id: 'today', label: t.jobs.dateToday },
                { id: 'week', label: t.jobs.dateWeek }
              ].map((d) => (
                <button
                  key={d.id}
                  onClick={() => setDateFilter(d.id as any)}
                  className={`px-3 py-1.5 rounded-lg text-[10px] font-bold uppercase transition-all ${
                    dateFilter === d.id 
                      ? (isDarkMode ? 'bg-gray-700 text-blue-400 shadow-sm' : 'bg-white text-blue-600 shadow-sm')
                      : (isDarkMode ? 'text-gray-400 hover:text-gray-300' : 'text-gray-500 hover:text-blue-600 hover:bg-white')
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
            className={`flex items-center gap-2 px-4 py-2 rounded-xl border transition-all text-xs font-bold ${
              remoteOnly 
                ? (isDarkMode ? 'bg-emerald-900/30 border-emerald-800 text-emerald-400' : 'bg-emerald-50 border-emerald-200 text-emerald-600')
                : (isDarkMode ? 'bg-gray-800 border-gray-700 text-gray-400 hover:bg-gray-700' : 'bg-white border-gray-200 text-gray-600 hover:bg-gray-100')
            }`}
          >
            <div className={`w-4 h-4 rounded-full border-2 flex items-center justify-center transition-all ${remoteOnly ? 'border-emerald-600 bg-emerald-600 shadow-sm' : 'border-gray-300'}`}>
              {remoteOnly && <CheckCircle2 size={10} className="text-white" />}
            </div>
            {t.jobs.filterRemote}
          </button>
          
          {(selectedType || selectedDomain || selectedCompany || remoteOnly || dateFilter !== 'all' || searchTerm || applicationStatus !== 'all') && (
            <motion.button 
              initial={{ opacity: 0, x: -10 }}
              animate={{ opacity: 1, x: 0 }}
              onClick={() => {
                setSearchTerm('');
                setSelectedType(null);
                setSelectedDomain(null);
                setSelectedCompany(null);
                setRemoteOnly(false);
                setDateFilter('all');
                setApplicationStatus('all');
              }}
              className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold transition-all ml-auto hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20 ${
                isDarkMode 
                  ? 'bg-gray-800 text-gray-500' 
                  : 'bg-gray-100 text-gray-400'
              }`}
            >
              <History size={14} className="rotate-180" />
              {t.jobs.resetFilters}
            </motion.button>
          )}
        </div>
      </div>

      {/* Stats row */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
         <StatCard label={t.jobs.statJobs} value={filteredJobs.length.toString()} icon={Zap} color="text-blue-600 dark:text-blue-400" bg="bg-blue-50 dark:bg-blue-900/30" isDarkMode={isDarkMode} />
         <StatCard label={t.jobs.statMatch} value="88%" icon={Star} color="text-amber-500 dark:text-amber-400" bg="bg-amber-50 dark:bg-amber-900/30" isDarkMode={isDarkMode} />
         <StatCard label={t.jobs.statPartners} value="156" icon={Building2} color="text-violet-600 dark:text-violet-400" bg="bg-violet-50 dark:bg-violet-900/30" isDarkMode={isDarkMode} />
         <StatCard label={t.jobs.statUpdated} value={t.jobs.statAzi} icon={Calendar} color="text-emerald-500 dark:text-emerald-400" bg="bg-emerald-50 dark:bg-emerald-900/30" isDarkMode={isDarkMode} />
      </div>

      {/* Results Grid */}
      <div className="grid md:grid-cols-2 gap-6">
        <AnimatePresence mode="popLayout">
          {filteredJobs.map((job, idx) => (
            <motion.div
              layout
              key={job.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95 }}
              transition={{ delay: idx * 0.05 }}
              className={`p-6 rounded-xl border transition-all duration-300 group flex flex-col justify-between relative overflow-hidden ${
                appliedJobs.includes(job.id)
                  ? (isDarkMode ? 'border-emerald-800 bg-emerald-950/40 shadow-none' : 'border-emerald-200 bg-emerald-50 shadow-sm')
                  : (isDarkMode ? 'bg-gray-900 border-gray-800 shadow-none' : 'bg-white border-gray-200 shadow-sm hover:shadow-md hover:-translate-y-0.5')
              }`}
            >
              {appliedJobs.includes(job.id) && (
                <motion.div 
                  initial={{ opacity: 0, scale: 0.5, rotate: -45 }}
                  animate={{ opacity: 1, scale: 1, rotate: 45 }}
                  className="absolute top-0 right-0 py-1.5 px-6 bg-emerald-500 text-white text-[10px] font-black uppercase tracking-widest translate-x-[25px] translate-y-[5px] shadow-sm z-10"
                >
                  {t.jobs.applied}
                </motion.div>
              )}
              <div>
                <div className="flex justify-between items-start mb-4">
                  <div className="flex items-center gap-3">
                    <div className={`w-12 h-12 rounded-xl flex items-center justify-center font-bold border transition-colors ${
                      appliedJobs.includes(job.id) 
                        ? (isDarkMode ? 'bg-emerald-900 border-emerald-800 text-emerald-400' : 'bg-emerald-50 border-emerald-100 text-emerald-600')
                        : (isDarkMode ? 'bg-gray-800 border-gray-700 text-gray-500' : 'bg-gray-50 border-gray-200 text-gray-400')
                    }`}>
                       {appliedJobs.includes(job.id) ? <CheckCircle2 size={24} /> : job.company.charAt(0)}
                    </div>
                    <div>
                      <h3 className={`font-bold group-hover:text-blue-600 transition-colors ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>{job.title}</h3>
                      <p className={`text-sm font-medium ${isDarkMode ? 'text-gray-500' : 'text-gray-400'}`}>{job.company}</p>
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="text-emerald-600 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-900/30 px-2 py-1 rounded-lg text-[10px] font-black uppercase tracking-wider inline-flex items-center gap-1 mb-1">
                      <Zap size={10} fill="currentColor" /> {job.matchScore}% Match
                    </div>
                    {job.source && job.source !== 'Featured' && (
                      <div className="flex items-center gap-1 text-[9px] font-black text-emerald-600 dark:text-emerald-400 uppercase tracking-tighter mt-1 justify-end">
                        <Globe size={10} /> {job.source}
                      </div>
                    )}
                    {job.source === 'Featured' && (
                      <div className={`flex items-center gap-1 text-[9px] font-bold uppercase tracking-tighter mt-1 justify-end ${isDarkMode ? 'text-gray-500' : 'text-gray-400'}`}>
                        <Star size={10} fill="currentColor" /> {t.jobs.featured}
                      </div>
                    )}
                    <p className={`text-[10px] font-bold uppercase tracking-widest mt-1 ${isDarkMode ? 'text-gray-500' : 'text-gray-400'}`}>
                      {new Date(job.postedAt).toLocaleDateString()}
                    </p>
                  </div>
                </div>

                <div className="flex flex-wrap gap-2 mb-4">
                  <Badge icon={MapPin} label={job.location} isDarkMode={isDarkMode} />
                  <Badge icon={Filter} label={job.type} isDarkMode={isDarkMode} />
                  <Badge icon={Building2} label={job.domain} color={isDarkMode ? "text-blue-400 bg-blue-500/10 border-blue-500/20" : "text-blue-600 bg-blue-50 border-blue-100"} isDarkMode={isDarkMode} />
                  {job.remote && <Badge icon={CheckCircle2} label="Remote Friendly" color={isDarkMode ? "text-emerald-400 bg-emerald-500/10 border-emerald-500/20" : "text-emerald-600 bg-emerald-50 border-emerald-100"} isDarkMode={isDarkMode} />}
                  {job.source && job.source !== 'Featured' && <Badge icon={ExternalLink} label={t.jobs.realResult} color={isDarkMode ? "text-violet-400 bg-violet-500/10 border-violet-500/20" : "text-violet-600 bg-violet-50 border-violet-100"} isDarkMode={isDarkMode} />}
                </div>

                <p className={`text-sm mb-6 leading-relaxed line-clamp-2 ${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>
                  {job.description}
                </p>
              </div>

              <div className="flex items-center justify-between pt-4 border-t border-gray-200 dark:border-gray-800 transition-colors">
                 <button 
                  onClick={() => job.url && window.open(job.url, '_blank')}
                  className="text-blue-600 dark:text-blue-400 text-sm font-bold flex items-center gap-1 hover:gap-2 transition-all"
                 >
                   {t.jobs.detailsBtn} <ArrowUpRight size={14} />
                 </button>
                 <motion.button 
                  whileTap={{ scale: 0.95 }}
                  onClick={() => handleApply(job.id, job.url)}
                  className={`px-6 py-2.5 rounded-xl font-bold text-sm transition-all ${
                    appliedJobs.includes(job.id)
                      ? (isDarkMode ? 'bg-emerald-900/30 text-emerald-400 font-bold' : 'bg-emerald-50 text-emerald-600 font-bold')
                      : (isDarkMode ? 'bg-white text-gray-900 hover:bg-gray-100 shadow-none' : 'bg-blue-600 text-white hover:bg-blue-700 shadow-md shadow-blue-200')
                  }`}
                 >
                   {appliedJobs.includes(job.id) ? (
                     <span className="flex items-center gap-2"><CheckCircle2 size={16} className="shrink-0" /> {t.jobs.applied}</span>
                   ) : t.jobs.applyBtn}
                 </motion.button>
              </div>
            </motion.div>
          ))}
        </AnimatePresence>
      </div>

      {filteredJobs.length === 0 && (
        <div className={`text-center py-20 rounded-xl border border-dashed transition-all ${
          isDarkMode ? 'bg-gray-900 border-gray-700' : 'bg-white border-gray-200'
        }`}>
           <Search size={48} className="mx-auto text-gray-300 dark:text-gray-600 mb-4" />
           <h3 className={`text-xl font-bold ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>{t.jobs.noResults}</h3>
           <p className={`${isDarkMode ? 'text-gray-400' : 'text-gray-500'} mt-2`}>{t.jobs.noResultsDesc}</p>
        </div>
      )}
    </div>
  );
}

function StatCard({ label, value, icon: Icon, color, bg, isDarkMode }: any) {
  return (
    <div className={`p-5 rounded-3xl border shadow-sm transition-all hover:border-gray-300 flex items-center gap-4 ${
      isDarkMode ? 'bg-gray-900 border-gray-800/60 shadow-[0_8px_30px_rgb(0,0,0,0.4)] hover:border-gray-700' : 'bg-white border-gray-200 shadow-blue-50/50'
    }`}>
      <div className={`${bg} ${color} w-10 h-10 rounded-xl flex items-center justify-center border border-current opacity-80`}>
        <Icon size={20} />
      </div>
      <div>
        <div className={`text-[10px] uppercase font-black tracking-widest ${isDarkMode ? 'text-gray-500' : 'text-gray-400'}`}>{label}</div>
        <div className={`text-xl font-bold ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>{value}</div>
      </div>
    </div>
  );
}

function Badge({ label, icon: Icon, color, isDarkMode }: any) {
  const defaultColor = isDarkMode ? 'text-gray-400 bg-gray-800 border-gray-700/50' : 'text-gray-700 bg-gray-100 border-gray-300';
  return (
    <span className={`px-2.5 py-1 rounded-lg text-[10px] font-bold uppercase tracking-wider inline-flex items-center gap-1.5 border transition-colors ${color || defaultColor}`}>
      {Icon && <Icon size={12} />} {label}
    </span>
  );
}
