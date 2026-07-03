import { useState, useEffect } from 'react';
import { Layout, FileText, Briefcase, User, Bell, ChevronLeft, ChevronRight, Menu, X, Globe, Sun, Moon } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import ResumeBuilder from './components/ResumeBuilder';
import JobBoard from './components/JobBoard';
import Landing from './components/Landing';
import { Language, TRANSLATIONS } from './lib/i18n';

type View = 'landing' | 'builder' | 'jobs' | 'profile';

// Shape of the raw LinkedIn OAuth payload relayed by server.ts's postMessage.
// Note: the callback currently forwards the token-exchange response as-is
// (access_token, id_token, etc.) rather than a fetched user profile, so
// `name` is generally undefined today — the UI falls back to 'User' for now.
interface LinkedInAuthUser {
  name?: string;
  access_token?: string;
  id_token?: string;
  [key: string]: unknown;
}

export default function App() {
  const [view, setView] = useState<View>('landing');
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [lang, setLang] = useState<Language>('en');
  const [user, setUser] = useState<LinkedInAuthUser | null>(null);
  const [isDarkMode, setIsDarkMode] = useState(() => {
    if (typeof window !== 'undefined') {
      const saved = localStorage.getItem('theme');
      if (saved) return saved === 'dark';
      return window.matchMedia('(prefers-color-scheme: dark)').matches;
    }
    return false;
  });

  useEffect(() => {
    const root = window.document.documentElement;
    if (isDarkMode) {
      root.classList.add('dark');
      localStorage.setItem('theme', 'dark');
    } else {
      root.classList.remove('dark');
      localStorage.setItem('theme', 'light');
    }
  }, [isDarkMode]);

  useEffect(() => {
    const handleMessage = (event: MessageEvent) => {
      // Validate origin: the OAuth popup is only ever opened by this app,
      // so its own origin is the only legitimate sender.
      if (event.origin !== window.location.origin) {
        return;
      }
      if (event.data?.type === 'OAUTH_AUTH_SUCCESS' && event.data?.provider === 'linkedin') {
        setUser(event.data.data);
        console.log('LinkedIn Login Success:', event.data.data);
      }
    };
    window.addEventListener('message', handleMessage);
    return () => window.removeEventListener('message', handleMessage);
  }, []);

  const t = TRANSLATIONS[lang];

  const navigation = [
    { id: 'landing', label: t.nav.home, icon: Layout },
    { id: 'builder', label: t.nav.builder, icon: FileText },
    { id: 'jobs', label: t.nav.jobs, icon: Briefcase },
    { id: 'profile', label: t.nav.profile, icon: User },
  ];

  const currentNav = navigation.find(n => n.id === view);

  return (
    <div className="min-h-screen bg-background text-ink flex flex-col transition-colors duration-300">
      {/* Navigation Header */}
      <header className="sticky top-0 z-50 h-16 flex items-center justify-between border-b border-border bg-surface px-4 md:px-8">
        <button
          type="button"
          className="flex items-center gap-2 cursor-pointer text-left bg-transparent border-0 p-0 focus-visible:outline-2 focus-visible:-outline-offset-2 focus-visible:outline-accent rounded-control"
          onClick={() => setView('landing')}
        >
          <span className="font-display text-[21px] font-semibold tracking-tight text-ink">CampusCV<span className="text-accent">.</span></span>
        </button>

        {/* Desktop Nav */}
        <nav className="hidden md:flex items-center gap-1">
          {navigation.map((nav) => (
            <button
              key={nav.id}
              onClick={() => setView(nav.id as View)}
              className={`relative flex items-center gap-2 px-3 h-16 text-sm font-medium transition-colors cursor-pointer focus-visible:outline-2 focus-visible:-outline-offset-2 focus-visible:outline-accent ${
                view === nav.id ? 'text-ink' : 'text-muted hover:text-ink'
              }`}
            >
              <nav.icon size={16} />
              {nav.label}
              {view === nav.id && <span className="absolute inset-x-3 bottom-0 h-0.5 bg-accent" />}
            </button>
          ))}
        </nav>

        <div className="flex items-center gap-2 md:gap-4">
          {/* User Profile / Login */}
          {user ? (
            <div className="flex items-center gap-2 rounded-control border border-border bg-surface px-2.5 py-1.5">
               <div className="h-8 w-8 rounded-full bg-accent text-accent-contrast flex items-center justify-center text-sm font-semibold">
                 {user.name?.[0] || 'U'}
               </div>
               <div className="hidden lg:block leading-tight">
                 <p className="text-xs font-medium uppercase tracking-[0.08em] text-muted">Connected</p>
                 <p className="text-xs font-medium text-ink truncate max-w-[100px]">{user.name || 'User'}</p>
               </div>
            </div>
          ) : (
            <button
              onClick={async () => {
                const res = await fetch('/api/auth/linkedin/url');
                const { url } = await res.json();
                window.open(url, 'linkedin_auth', 'width=600,height=600');
              }}
              className="hidden lg:inline-flex items-center justify-center gap-2 h-11 px-4 rounded-control border border-border bg-surface text-ink text-sm font-semibold cursor-pointer transition-colors duration-200 hover:border-accent hover:text-accent focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-accent active:translate-y-px disabled:opacity-50 disabled:pointer-events-none"
            >
              <Briefcase size={16} className="text-[#0a66c2]" fill="#0a66c2" />
              Login
            </button>
          )}

          {/* Theme Toggle */}
          <button
            onClick={() => setIsDarkMode(!isDarkMode)}
            className="flex h-11 w-11 items-center justify-center rounded-control text-muted transition-colors hover:bg-accent-tint hover:text-ink cursor-pointer focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-accent"
            title={isDarkMode ? "Light Mode" : "Dark Mode"}
          >
            <motion.div
              initial={false}
              animate={{ rotate: isDarkMode ? 180 : 0 }}
              whileTap={{ scale: 0.98, rotate: isDarkMode ? 270 : -90 }}
            >
              {isDarkMode ? <Sun size={20} /> : <Moon size={20} />}
            </motion.div>
          </button>

          {/* Language Switcher */}
          <div className="flex items-center gap-0.5 rounded-control border border-border bg-background p-0.5">
            {(['en', 'ro', 'fr', 'de'] as Language[]).map((l) => (
              <button
                key={l}
                onClick={() => setLang(l)}
                className={`h-8 px-2.5 rounded-[4px] text-xs font-medium uppercase transition-colors cursor-pointer focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-accent ${
                  lang === l ? 'bg-surface text-ink shadow-card' : 'text-muted hover:text-ink'
                }`}
              >
                {l}
              </button>
            ))}
          </div>

          <button className="relative flex h-11 w-11 items-center justify-center rounded-control text-muted transition-colors hover:bg-accent-tint hover:text-ink cursor-pointer focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-accent">
            <Bell size={20} />
            <span className="absolute top-2 right-2 w-2 h-2 bg-clay rounded-full border-2 border-surface"></span>
          </button>

          <button
            className="md:hidden flex h-11 w-11 items-center justify-center rounded-control text-muted transition-colors hover:bg-accent-tint hover:text-ink cursor-pointer focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-accent"
            onClick={() => setIsMenuOpen(!isMenuOpen)}
          >
            {isMenuOpen ? <X size={24} /> : <Menu size={24} />}
          </button>

          <motion.button
            whileTap={{ scale: 0.98 }}
            className="hidden sm:inline-flex items-center justify-center gap-2 h-11 px-5 rounded-control bg-accent text-accent-contrast text-sm font-semibold cursor-pointer transition-colors duration-200 hover:bg-accent-hover focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-accent active:translate-y-px disabled:opacity-50 disabled:pointer-events-none"
            onClick={() => setView('builder')}
          >
            {t.nav.newCV}
          </motion.button>
        </div>
      </header>

      {/* Mobile Menu */}
      <AnimatePresence>
        {isMenuOpen && (
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            transition={{ duration: 0.2, ease: 'easeOut' }}
            className="md:hidden fixed inset-x-0 top-16 z-40 p-4 bg-surface border-b border-border shadow-overlay"
          >
            <div className="flex flex-col gap-2">
              {navigation.map((nav) => (
                <button
                  key={nav.id}
                  onClick={() => {
                    setView(nav.id as View);
                    setIsMenuOpen(false);
                  }}
                  className={`flex items-center gap-3 rounded-control p-3 text-base font-medium cursor-pointer focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-accent ${
                    view === nav.id
                      ? 'bg-accent-tint text-accent'
                      : 'text-muted hover:bg-background hover:text-ink'
                  }`}
                >
                  <nav.icon size={20} />
                  {nav.label}
                </button>
              ))}
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Main Content Area */}
      <main className="flex-1 flex flex-col pt-4 overflow-hidden">
        <AnimatePresence mode="wait" initial={false}>
          <motion.div
            key={view}
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -8 }}
            transition={{ duration: 0.2, ease: 'easeOut' }}
            className="flex-1 overflow-auto"
          >
            {view === 'landing' && <Landing onStart={() => setView('builder')} lang={lang} isDarkMode={isDarkMode} />}
            {view === 'builder' && <ResumeBuilder lang={lang} isDarkMode={isDarkMode} />}
            {view === 'jobs' && <JobBoard lang={lang} isDarkMode={isDarkMode} />}
            {view === 'profile' && (
              <div className="flex flex-col items-center justify-center p-12 text-center h-full">
                <div className="flex h-16 w-16 items-center justify-center rounded-full bg-accent-tint text-accent">
                  <User size={28} />
                </div>
                <h2 className="font-display text-[26px] font-medium text-ink mt-5">{t.nav.profile}</h2>
                <p className="text-muted mt-2 max-w-sm">Section in development.</p>
              </div>
            )}
          </motion.div>
        </AnimatePresence>
      </main>

      <footer className="border-t border-border bg-surface py-10 px-4 md:px-8">
        <div className="max-w-7xl mx-auto flex flex-col md:flex-row justify-between items-center gap-4 text-sm text-muted">
          <div className="flex items-center gap-2">
            <span className="font-display text-base font-semibold tracking-tight text-ink">CampusCV<span className="text-accent">.</span></span>
          </div>
          <p>© 2026 CampusCV AI - Construit pentru studenții din România.</p>
          <div className="flex items-center gap-6">
            <a href="#" className="hover:text-accent transition-colors">Politica de Confidențialitate</a>
            <a href="#" className="hover:text-accent transition-colors">Termeni și Condiții</a>
          </div>
        </div>
      </footer>
    </div>
  );
}

