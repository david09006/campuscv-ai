import { motion } from 'framer-motion';
import { 
  FileText, Sparkles, Target, Zap, ShieldCheck, 
  Briefcase, Layout, MousePointer2, Settings, Download,
  ArrowRight, Star, Linkedin
} from 'lucide-react';
import { Language, TRANSLATIONS } from '../lib/i18n';

interface LandingProps {
  onStart: () => void;
  lang: Language;
  isDarkMode?: boolean;
}

export default function Landing({ onStart, lang, isDarkMode }: LandingProps) {
  const t = TRANSLATIONS[lang];
  
  const stepsData = [
    { id: '01', color: 'blue' },
    { id: '02', color: 'violet' },
    { id: '03', color: 'emerald' },
    { id: '04', color: 'amber' }
  ];

  return (
    <div className={`flex flex-col transition-colors duration-300 ${isDarkMode ? 'bg-gray-950 text-white' : 'bg-gray-50 text-gray-900'}`}>
      {/* Hero Section */}
      <section className={`relative overflow-hidden px-4 md:px-8 py-16 md:py-32 grid-bg border-b transition-colors ${
        isDarkMode ? 'bg-gray-950 border-gray-800/60 shadow-[inset_0_-20px_40px_rgba(37,99,235,0.02)]' : 'bg-white border-gray-300/50 shadow-sm'
      }`}>
        <div className="max-w-7xl mx-auto grid lg:grid-cols-2 gap-16 items-center">
          <motion.div
            initial={{ opacity: 0, x: -30 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.8 }}
          >
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-primary-50 dark:bg-primary-500/10 text-primary-700 dark:text-primary-400 text-[10px] font-black uppercase tracking-[0.2em] mb-8 shadow-sm border border-primary-100 dark:border-primary-500/20">
              <Zap size={14} fill="currentColor" />
              {lang === 'ro' ? 'Platforma #1 pentru studenții din România' : 'The #1 platform for ambitious students'}
            </div>
            <h1 
              className={`text-6xl md:text-8xl font-black leading-[0.85] tracking-tighter mb-8 ${isDarkMode ? 'text-white' : 'text-gray-900'}`}
              dangerouslySetInnerHTML={{ __html: t.landing.heroTitle }}
            />
            <p className={`text-xl mb-10 max-w-lg leading-relaxed font-medium ${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>
              {t.landing.heroDesc}
            </p>
            <div className="flex flex-col sm:flex-row gap-4">
              <button 
                onClick={onStart}
                className="bg-primary-600 dark:bg-primary-600 hover:bg-primary-700 dark:hover:bg-primary-500 text-white px-10 py-5 rounded-[2rem] font-black text-lg transition-all hover:-translate-y-1 active:translate-y-0 flex items-center justify-center gap-3 shadow-2xl shadow-primary-500/20 dark:shadow-primary-950/40"
              >
                {t.landing.ctaPrimary} <ArrowRight size={20} />
              </button>
              <button 
                onClick={async () => {
                  const res = await fetch('/api/auth/linkedin/url');
                  const { url } = await res.json();
                  window.open(url, 'linkedin_auth', 'width=600,height=600');
                }}
                className={`px-10 py-5 rounded-[2rem] font-bold text-lg transition-all flex items-center justify-center gap-3 active:scale-95 group ${
                  isDarkMode 
                    ? 'bg-gray-900 border-2 border-gray-800 text-gray-300 hover:border-primary-700 hover:bg-gray-800/50 shadow-none' 
                    : 'bg-white border-2 border-gray-100 text-gray-700 hover:border-primary-200 hover:bg-primary-50 shadow-lg shadow-gray-100'
                }`}
              >
                <Linkedin size={22} className="text-[#0a66c2] transition-transform group-hover:scale-110" fill="#0a66c2" />
                {lang === 'ro' ? 'Logare cu LinkedIn' : 'Login with LinkedIn'}
              </button>
            </div>
          </motion.div>

          {/* High Fidelity Dashboard Preview */}
          <motion.div
            initial={{ opacity: 0, scale: 0.9, rotate: 2 }}
            animate={{ opacity: 1, scale: 1, rotate: 0 }}
            transition={{ duration: 0.8, delay: 0.2 }}
            className="relative hidden lg:block"
          >
            <div className="relative z-10 glass p-3 rounded-[3rem] shadow-2xl rotate-1">
              <div className={`rounded-[2.2rem] overflow-hidden border aspect-[16/10] flex flex-col shadow-[0_32px_64px_-12px_rgba(0,0,0,0.1)] transition-colors ${
                isDarkMode ? 'bg-gray-950 border-gray-800 shadow-[0_32px_64px_-12px_rgba(0,0,0,0.5)]' : 'bg-white border-gray-100'
              }`}>
                <div className={`h-12 border-b flex items-center px-6 justify-between transition-colors ${
                  isDarkMode ? 'border-gray-800 bg-gray-800/80' : 'border-gray-50 bg-gray-50/50'
                }`}>
                    <div className="flex gap-2">
                      <div className="w-3 h-3 bg-red-500/80 rounded-full" />
                      <div className="w-3 h-3 bg-amber-500/80 rounded-full" />
                      <div className="w-3 h-3 bg-emerald-500/80 rounded-full" />
                    </div>
                   <div className={`text-[10px] font-black uppercase tracking-widest ${isDarkMode ? 'text-gray-500' : 'text-gray-500'}`}>CampusCV Dashboard</div>
                </div>
                <div className={`flex-1 grid grid-cols-12 ${isDarkMode ? 'bg-gray-950' : 'bg-white'}`}>
                    <div className={`col-span-4 border-r p-6 space-y-6 transition-colors ${isDarkMode ? 'border-gray-800' : 'border-gray-100/50'}`}>
                      <div className="space-y-2">
                        <div className="h-4 w-24 bg-primary-600 dark:bg-primary-500 rounded-full" />
                        <div className={`h-2 w-full rounded-full ${isDarkMode ? 'bg-gray-800' : 'bg-gray-200'}`} />
                        <div className={`h-2 w-2/3 rounded-full ${isDarkMode ? 'bg-gray-800' : 'bg-gray-200'}`} />
                      </div>
                      <div className={`p-4 rounded-2xl space-y-3 transition-colors border ${isDarkMode ? 'bg-gray-800/80 border-gray-700/30' : 'bg-gray-100/60 border-gray-200'}`}>
                         <div className={`h-2 w-full rounded-full ${isDarkMode ? 'bg-gray-700' : 'bg-gray-300'}`} />
                         <div className={`h-2 w-full rounded-full ${isDarkMode ? 'bg-gray-700' : 'bg-gray-300'}`} />
                         <div className={`h-2 w-1/2 rounded-full ${isDarkMode ? 'bg-gray-700' : 'bg-gray-300'}`} />
                      </div>
                      <div className="flex flex-wrap gap-2">
                         <div className="px-2 py-1 bg-violet-50 dark:bg-violet-500/10 text-violet-600 dark:text-violet-400 rounded-lg text-[8px] font-black uppercase tracking-widest transition-colors border border-violet-100 dark:border-violet-500/20">React</div>
                         <div className="px-2 py-1 bg-primary-50 dark:bg-primary-500/10 text-primary-600 dark:text-primary-400 rounded-lg text-[8px] font-black uppercase tracking-widest transition-colors border border-primary-100 dark:border-primary-500/20">UI Design</div>
                         <div className="px-2 py-1 bg-emerald-50 dark:bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 rounded-lg text-[8px] font-black uppercase tracking-widest transition-colors border border-emerald-100 dark:border-emerald-500/20">Node.js</div>
                      </div>
                   </div>
                   <div className="col-span-8 p-6 space-y-6 overflow-hidden">
                      <div className={`aspect-video rounded-2xl border p-6 flex flex-col justify-end relative overflow-hidden transition-colors ${
                        isDarkMode ? 'bg-gray-800/40 border-gray-800' : 'bg-gray-100 border-gray-200'
                      }`}>
                         <Sparkles className="absolute top-4 right-4 text-primary-600 dark:text-primary-400 opacity-20" size={80} />
                         <div className="space-y-4">
                            <div className={`h-8 w-48 rounded-xl ${isDarkMode ? 'bg-gray-800' : 'bg-gray-200'}`} />
                            <div className={`h-3 w-full rounded-full ${isDarkMode ? 'bg-gray-700' : 'bg-gray-300'}`} />
                            <div className={`h-3 w-3/4 rounded-full ${isDarkMode ? 'bg-gray-700' : 'bg-gray-300'}`} />
                         </div>
                      </div>
                      <div className="grid grid-cols-2 gap-4">
                         <div className={`h-24 border rounded-2xl p-4 flex flex-col justify-between transition-colors ${
                           isDarkMode ? 'border-gray-800 bg-gray-800/40' : 'border-gray-200 bg-white shadow-sm'
                         }`}>
                            <div className="w-8 h-8 bg-amber-100 dark:bg-amber-500/10 text-amber-600 dark:text-amber-400 rounded-lg flex items-center justify-center border border-amber-200/50 dark:border-amber-500/20"><Star size={18} /></div>
                            <div className={`h-2 w-1/2 rounded-full ${isDarkMode ? 'bg-gray-700' : 'bg-gray-300'}`} />
                         </div>
                         <div className={`h-24 border rounded-2xl p-4 flex flex-col justify-between transition-colors ${
                           isDarkMode ? 'border-gray-800 bg-gray-800/40' : 'border-gray-200 bg-white shadow-sm'
                         }`}>
                            <div className="w-8 h-8 bg-primary-100 dark:bg-primary-500/10 text-primary-600 dark:text-primary-400 rounded-lg flex items-center justify-center border border-primary-200/50 dark:border-primary-500/20"><Target size={18} /></div>
                            <div className={`h-2 w-2/3 rounded-full ${isDarkMode ? 'bg-gray-700' : 'bg-gray-300'}`} />
                         </div>
                      </div>
                   </div>
                </div>
              </div>
            </div>
          </motion.div>
        </div>
      </section>

      {/* Steps Section */}
      <section className={`px-4 md:px-8 py-32 relative transition-colors ${
        isDarkMode ? 'bg-[#0a0a0a]' : 'bg-gray-50/30'
      }`}>
        <div className="max-w-7xl mx-auto">
          <div className="mb-20 space-y-4">
            <h2 className={`text-5xl md:text-6xl font-black tracking-tighter ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>{t.landing.howItWorksTitle}</h2>
            <p className={`text-xl max-w-xl font-medium ${isDarkMode ? 'text-gray-400' : 'text-gray-500'}`}>{t.landing.howItWorksDesc}</p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
            {stepsData.map((step, idx) => {
              const content = t.landing.steps[idx];
              return (
                <motion.div
                  key={step.id}
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  transition={{ delay: idx * 0.1 }}
                  viewport={{ once: true }}
                  className={`p-10 rounded-[3rem] border shadow-sm hover:shadow-xl hover:-translate-y-2 transition-all duration-300 relative group overflow-hidden ${
                    isDarkMode ? 'bg-gray-900 border-gray-800' : 'bg-white border-gray-200 shadow-blue-50/50'
                  }`}
                >
                  <div className={`absolute top-0 left-0 w-2 h-full bg-${step.id === '01' ? 'blue' : step.id === '02' ? 'violet' : step.id === '03' ? 'emerald' : 'amber'}-600 opacity-0 group-hover:opacity-100 transition-opacity`} />
                  <span className={`text-6xl font-black mb-8 block transition-colors ${
                    isDarkMode 
                      ? 'text-gray-800 group-hover:text-gray-700' 
                      : 'text-gray-300 group-hover:text-blue-100'
                  }`}>
                    {step.id}
                  </span>
                  <h3 className={`text-2xl font-black mb-4 tracking-tight ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>{content.title}</h3>
                  <p className={`leading-relaxed font-medium ${isDarkMode ? 'text-gray-400' : 'text-gray-500'}`}>{content.desc}</p>
                </motion.div>
              );
            })}
          </div>
        </div>
      </section>

      {/* Features Showcase */}
      <section className={`px-4 md:px-8 py-32 transition-colors duration-300 ${
        isDarkMode ? 'bg-gray-950 text-white' : 'bg-white text-gray-900'
      }`}>
        <div className="max-w-7xl mx-auto grid md:grid-cols-2 gap-20 items-center">
           <div className="relative order-2 md:order-1">
              <div className="aspect-square bg-primary-600 rounded-[4rem] overflow-hidden shadow-2xl relative">
                  <div className="absolute inset-0 bg-[url('https://images.unsplash.com/photo-1543269865-cbf427effbad?auto=format&fit=crop&q=80&w=1000')] bg-cover bg-center mix-blend-overlay opacity-40" />
              </div>
           </div>
           
           <div className="space-y-12 order-1 md:order-2">
              <h2 
                className="text-5xl font-black text-gray-900 dark:text-white tracking-tighter leading-none"
                dangerouslySetInnerHTML={{ __html: t.landing.aiPowerTitle }}
              />
              
              <div className="space-y-10">
                 <FeatureItem 
                  icon={Sparkles} 
                  title={t.landing.aiPowerItems[0].title}
                  desc={t.landing.aiPowerItems[0].desc}
                  color="bg-primary-600"
                 />
                 <FeatureItem 
                  icon={Layout} 
                  title={t.landing.aiPowerItems[1].title}
                  desc={t.landing.aiPowerItems[1].desc}
                  color="bg-violet-600"
                 />
                 <FeatureItem 
                  icon={Settings} 
                  title={t.landing.aiPowerItems[2].title}
                  desc={t.landing.aiPowerItems[2].desc}
                  color="bg-emerald-600"
                 />
              </div>
           </div>
        </div>
      </section>

      {/* CTA Final */}
      <section className={`px-4 md:px-8 py-20 transition-colors duration-300 ${
        isDarkMode ? 'bg-gray-950' : 'bg-gray-50/50'
      }`}>
        <div className="max-w-7xl mx-auto bg-primary-600 dark:bg-primary-600 rounded-[4rem] p-16 md:p-24 text-center text-white relative overflow-hidden transition-all duration-500 shadow-2xl shadow-primary-500/20 dark:shadow-primary-950/40">
          <div className="absolute top-0 right-0 w-64 h-64 bg-white/10 rounded-full -translate-y-1/2 translate-x-1/2 blur-3xl pointer-events-none" />
          <div className="absolute bottom-0 left-0 w-64 h-64 bg-primary-400/20 rounded-full translate-y-1/2 -translate-x-1/2 blur-3xl pointer-events-none" />
          
          <h2 
            className="text-5xl md:text-7xl font-black mb-8 tracking-tighter leading-none relative z-10"
            dangerouslySetInnerHTML={{ __html: t.landing.readyTitle }}
          />
          <p className="text-primary-100 dark:text-primary-100/70 text-xl mb-12 max-w-2xl mx-auto font-medium relative z-10">
            {t.landing.readyDesc}
          </p>
          <button 
            onClick={onStart}
            className="bg-white text-primary-600 hover:bg-gray-50 px-12 py-6 rounded-[2.5rem] font-black text-2xl shadow-2xl shadow-primary-950/20 transition-all hover:scale-105 active:scale-95 relative z-10"
          >
            {t.landing.ctaFinal}
          </button>
        </div>
      </section>
    </div>
  );
}

function FeatureItem({ icon: Icon, title, desc, color }: any) {
  return (
    <div className="flex gap-6 group">
      <div className={`${color} w-16 h-16 rounded-3xl flex items-center justify-center text-white shadow-xl flex-shrink-0 group-hover:scale-110 transition-transform duration-300`}>
        <Icon size={28} />
      </div>
      <div>
        <h4 className="text-xl font-bold text-gray-900 dark:text-white mb-2">{title}</h4>
        <p className="text-gray-500 dark:text-gray-400 leading-relaxed font-medium">{desc}</p>
      </div>
    </div>
  );
}

