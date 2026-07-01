import { useState, useEffect } from 'react';
import { Layout, FileText, Briefcase, User, Bell, ChevronLeft, ChevronRight, Menu, X, Globe, Sun, Moon, Palette } from 'lucide-react';
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

  const [appColorPalette, setAppColorPalette] = useState(() => {
    if (typeof window !== 'undefined') {
      const saved = localStorage.getItem('appPalette');
      return saved || 'classic';
    }
    return 'classic';
  });

  const changePalette = (palette: string) => {
    setAppColorPalette(palette);
    localStorage.setItem('appPalette', palette);
  };

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
    <div className={`theme-${appColorPalette} min-h-screen transition-colors duration-300 flex flex-col ${isDarkMode ? 'dark bg-gray-950 text-white' : 'bg-gray-50 text-gray-900'}`}>
      {/* Navigation Header */}
      <header className={`sticky top-0 z-50 backdrop-blur-md border-b px-4 md:px-8 h-16 flex items-center justify-between transition-all ${
        isDarkMode ? 'bg-gray-900/80 border-gray-800' : 'bg-white/80 border-gray-200 shadow-sm'
      }`}>
        <div 
          className="flex items-center gap-2 cursor-pointer group"
          onClick={() => setView('landing')}
        >
          <div className="w-10 h-10 bg-primary-600 rounded-lg flex items-center justify-center text-white shadow-sm group-hover:scale-105 transition-transform duration-200">
            <FileText size={24} strokeWidth={2.5} />
          </div>
          <span className="font-bold text-xl tracking-tight hidden sm:block text-gray-900 dark:text-white">CampusCV <span className="text-primary-600">AI</span></span>
        </div>

        {/* Desktop Nav */}
        <nav className="hidden md:flex items-center gap-1">
          {navigation.map((nav) => (
            <button
              key={nav.id}
              onClick={() => setView(nav.id as View)}
              className={`px-4 py-2 rounded-lg text-sm font-medium transition-all duration-200 flex items-center gap-2 ${
                view === nav.id 
                  ? (isDarkMode ? 'bg-primary-950/40 text-primary-400 border border-primary-900/30' : 'bg-primary-50 text-primary-700')
                  : (isDarkMode ? 'text-gray-400 hover:bg-gray-800 hover:text-gray-200' : 'text-gray-500 hover:bg-primary-50 hover:text-primary-600')
              }`}
            >
              <nav.icon size={18} />
              {nav.label}
            </button>
          ))}
        </nav>

        <div className="flex items-center gap-2 md:gap-4">
          {/* User Profile / Login */}
          {user ? (
            <div className="flex items-center gap-2 bg-primary-50 dark:bg-primary-950/30 px-3 py-1.5 rounded-lg border border-primary-100 dark:border-primary-800 group cursor-pointer hover:bg-primary-100 dark:hover:bg-primary-900/50 transition-all">
               <div className="w-8 h-8 bg-primary-600 rounded-lg flex items-center justify-center text-white font-bold text-sm shadow-sm group-hover:scale-110 transition-transform">
                 {user.name?.[0] || 'U'}
               </div>
               <div className="hidden lg:block leading-tight">
                 <p className="text-[10px] font-bold text-primary-600 dark:text-primary-400 uppercase tracking-wide">Connected</p>
                 <p className="text-xs font-bold text-gray-900 dark:text-white truncate max-w-[100px]">{user.name || 'User'}</p>
               </div>
            </div>
          ) : (
            <button 
              onClick={async () => {
                const res = await fetch('/api/auth/linkedin/url');
                const { url } = await res.json();
                window.open(url, 'linkedin_auth', 'width=600,height=600');
              }}
              className="hidden lg:flex items-center gap-2 px-5 py-2.5 bg-[#0a66c2] hover:bg-[#004182] text-white rounded-lg text-xs font-bold uppercase tracking-wide transition-all shadow-sm active:scale-95"
            >
              <Briefcase size={16} fill="white" />
              Login
            </button>
          )}

          {/* Platform Theme Palette Selector */}
          <div className="hidden xl:flex items-center gap-1 p-1 rounded-xl border bg-gray-100/80 dark:bg-gray-800/50 border-gray-200 dark:border-gray-700 shadow-sm">
            {(['classic', 'emerald', 'sunset', 'amethyst', 'crimson', 'cyber'] as const).map((p) => {
              const colorsMap: Record<string, string> = {
                classic: 'bg-blue-500',
                emerald: 'bg-emerald-500',
                sunset: 'bg-orange-500',
                amethyst: 'bg-purple-500',
                crimson: 'bg-rose-500',
                cyber: 'bg-teal-500',
              };
              return (
                <button
                  key={p}
                  onClick={() => changePalette(p)}
                  className={`w-4.5 h-4.5 rounded-full ${colorsMap[p]} transition-all relative ${
                    appColorPalette === p 
                      ? 'ring-2 ring-offset-1 ring-gray-900 dark:ring-white scale-110 shadow-sm' 
                      : 'hover:scale-105 opacity-80 hover:opacity-100'
                  }`}
                  title={`Palette: ${p.toUpperCase()}`}
                >
                  {appColorPalette === p && (
                    <span className="absolute inset-0 flex items-center justify-center text-[7px] text-white font-black">✓</span>
                  )}
                </button>
              );
            })}
          </div>

          {/* Theme Toggle */}
          <button 
            onClick={() => setIsDarkMode(!isDarkMode)}
            className="p-2.5 text-gray-400 hover:text-primary-600 hover:bg-primary-50 dark:hover:bg-gray-800 rounded-xl transition-all border border-transparent hover:border-primary-100 dark:hover:border-gray-700"
            title={isDarkMode ? "Light Mode" : "Dark Mode"}
          >
            <motion.div
              initial={false}
              animate={{ rotate: isDarkMode ? 180 : 0 }}
              whileTap={{ scale: 0.8, rotate: isDarkMode ? 270 : -90 }}
            >
              {isDarkMode ? <Sun size={20} /> : <Moon size={20} />}
            </motion.div>
          </button>

          {/* Language Switcher */}
          <div className={`flex items-center gap-1 p-1 rounded-xl border backdrop-blur-sm transition-colors ${
            isDarkMode ? 'bg-gray-800/50 border-gray-700' : 'bg-gray-100/80 border-gray-200'
          }`}>
            {(['en', 'ro', 'fr', 'de'] as Language[]).map((l) => (
              <button
                key={l}
                onClick={() => setLang(l)}
                className={`px-3 py-1.5 rounded-lg text-[10px] font-black uppercase tracking-wider transition-all ${
                  lang === l 
                    ? (isDarkMode ? 'bg-gray-700 text-primary-400 shadow-sm' : 'bg-white text-primary-600 shadow-sm')
                    : (isDarkMode ? 'text-gray-500 hover:text-gray-300 hover:bg-gray-700' : 'text-gray-400 hover:text-primary-600 hover:bg-white')
                }`}
              >
                {l}
              </button>
            ))}
          </div>

          <button className={`relative p-2.5 rounded-xl transition-all border border-transparent ${
            isDarkMode 
              ? 'text-gray-400 hover:text-gray-300 hover:bg-gray-800 hover:border-gray-700' 
              : 'text-gray-500 hover:text-primary-600 hover:bg-gray-100 hover:border-gray-200 shadow-sm'
          }`}>
            <Bell size={20} />
            <span className={`absolute top-2.5 right-2.5 w-2 h-2 bg-red-500 rounded-full border-2 ${isDarkMode ? 'border-gray-900' : 'border-white'}`}></span>
          </button>
          
          <button 
            className="md:hidden p-2 text-gray-500 hover:bg-gray-50 dark:hover:bg-gray-800 rounded-lg"
            onClick={() => setIsMenuOpen(!isMenuOpen)}
          >
            {isMenuOpen ? <X size={24} /> : <Menu size={24} />}
          </button>

          <motion.button 
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            className={`hidden sm:flex px-6 py-2.5 rounded-lg font-bold text-xs uppercase tracking-wide transition-all items-center gap-2 hover:-translate-y-0.5 active:translate-y-0 ${
              isDarkMode
                ? 'bg-primary-600 hover:bg-primary-500 text-white shadow-none'
                : 'bg-primary-600 hover:bg-primary-700 text-white shadow-sm hover:shadow-md'
            }`}
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
            className={`md:hidden fixed inset-x-0 top-16 z-40 p-4 shadow-xl border-b transition-colors ${
              isDarkMode ? 'bg-gray-900 border-gray-800' : 'bg-white border-gray-100'
            }`}
          >
            <div className="flex flex-col gap-2">
              {navigation.map((nav) => (
                <button
                  key={nav.id}
                  onClick={() => {
                    setView(nav.id as View);
                    setIsMenuOpen(false);
                  }}
                  className={`flex items-center gap-3 p-3 rounded-xl text-base font-semibold transition-all ${
                    view === nav.id 
                      ? 'bg-primary-50 dark:bg-primary-950/30 text-primary-700 dark:text-primary-400' 
                      : 'text-gray-600 dark:text-gray-400 hover:bg-gray-50 dark:hover:bg-gray-800'
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
            initial={{ opacity: 0, y: 12, scale: 0.995 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -12, scale: 1.005 }}
            transition={{ 
              duration: 0.3, 
              ease: [0.4, 0, 0.2, 1], // Standard Material-style ease
              opacity: { duration: 0.2 } 
            }}
            className="flex-1 overflow-auto"
          >
            {view === 'landing' && <Landing onStart={() => setView('builder')} lang={lang} isDarkMode={isDarkMode} />}
            {view === 'builder' && <ResumeBuilder lang={lang} isDarkMode={isDarkMode} />}
            {view === 'jobs' && <JobBoard lang={lang} isDarkMode={isDarkMode} />}
            {view === 'profile' && (
              <div className="flex flex-col items-center justify-center p-12 text-center h-full">
                <div className={`w-20 h-20 rounded-full flex items-center justify-center text-gray-400 mb-4 transition-colors ${
                  isDarkMode ? 'bg-gray-800' : 'bg-gray-100'
                }`}>
                  <User size={40} />
                </div>
                <h2 className={`text-2xl font-bold tracking-tight transition-colors ${
                  isDarkMode ? 'text-white' : 'text-gray-900'
                }`}>{t.nav.profile}</h2>
                <p className="text-gray-500 dark:text-gray-400 max-w-sm mt-2">Section in development.</p>
              </div>
            )}
          </motion.div>
        </AnimatePresence>
      </main>

      <footer className={`transition-colors py-8 px-4 md:px-8 border-t ${
        isDarkMode ? 'bg-gray-900 border-gray-800' : 'bg-white border-gray-200'
      }`}>
        <div className="max-w-7xl mx-auto flex flex-col md:flex-row justify-between items-center gap-4 text-gray-500 text-sm">
          <div className="flex items-center gap-2">
            <div className="w-6 h-6 bg-primary-600 rounded flex items-center justify-center text-white">
              <FileText size={14} />
            </div>
            <span className="font-bold text-gray-900 dark:text-white">CampusCV AI</span>
          </div>
          <p className="dark:text-gray-400">© 2026 CampusCV AI - Construit pentru studenții din România.</p>
          <div className="flex items-center gap-6">
            <a href="#" className="hover:text-primary-600 transition-colors">Politica de Confidențialitate</a>
            <a href="#" className="hover:text-primary-600 transition-colors">Termeni și Condiții</a>
          </div>
        </div>
      </footer>
    </div>
  );
}

