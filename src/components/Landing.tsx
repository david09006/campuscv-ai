import { motion } from 'framer-motion';
import {
  Sparkles, Target, ArrowRight, Star, Linkedin, Layout, Settings,
  type LucideIcon,
} from 'lucide-react';
import { Language, TRANSLATIONS } from '../lib/i18n';

interface LandingProps {
  onStart: () => void;
  lang: Language;
  isDarkMode?: boolean;
}

export default function Landing({ onStart, lang, isDarkMode }: LandingProps) {
  const t = TRANSLATIONS[lang];

  return (
    <div className="flex flex-col">
      {/* Hero Section */}
      <section className="border-b border-border bg-surface px-4 md:px-8 py-16 md:py-28">
        <div className="max-w-7xl mx-auto grid lg:grid-cols-2 gap-16 items-center">
          <motion.div
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.25, ease: 'easeOut' }}
          >
            <p className="text-xs font-medium uppercase tracking-[0.08em] text-clay-text mb-6">
              {lang === 'ro' ? 'Platforma #1 pentru studenții din România' : 'The #1 platform for ambitious students'}
            </p>
            <h1
              className="font-display text-[42px] md:text-[56px] font-medium leading-[1.1] tracking-tight text-ink mb-6"
              dangerouslySetInnerHTML={{ __html: t.landing.heroTitle }}
            />
            <p className="text-lg md:text-[21px] text-muted leading-relaxed max-w-lg mb-10">
              {t.landing.heroDesc}
            </p>
            <div className="flex flex-col sm:flex-row gap-4">
              <button
                onClick={onStart}
                className="inline-flex items-center justify-center gap-2 h-12 px-7 rounded-control bg-accent text-accent-contrast text-base font-semibold cursor-pointer transition-colors duration-200 hover:bg-accent-hover focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-accent active:translate-y-px disabled:opacity-50 disabled:pointer-events-none"
              >
                {t.landing.ctaPrimary} <ArrowRight size={18} />
              </button>
              <button
                onClick={async () => {
                  const res = await fetch('/api/auth/linkedin/url');
                  const { url } = await res.json();
                  window.open(url, 'linkedin_auth', 'width=600,height=600');
                }}
                className="inline-flex items-center justify-center gap-2 h-12 px-7 rounded-control border border-border bg-surface text-ink text-base font-semibold cursor-pointer transition-colors duration-200 hover:border-accent hover:text-accent focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-accent active:translate-y-px disabled:opacity-50 disabled:pointer-events-none"
              >
                <Linkedin size={22} className="text-[#0a66c2]" fill="#0a66c2" />
                {lang === 'ro' ? 'Logare cu LinkedIn' : 'Login with LinkedIn'}
              </button>
            </div>
          </motion.div>

          {/* Dashboard mockup panel */}
          <motion.div
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4, delay: 0.15, ease: 'easeOut' }}
            className="hidden lg:block"
          >
            <div className="rounded-panel border border-border bg-background shadow-card overflow-hidden aspect-[16/10] flex flex-col">
              {/* Top bar */}
              <div className="h-11 border-b border-border bg-surface flex items-center justify-between px-5">
                <span className="font-display text-sm font-medium text-ink">Ana Popescu — CV</span>
                <span className="text-xs font-medium uppercase tracking-[0.08em] text-accent">Draft saved</span>
              </div>
              {/* Body */}
              <div className="flex-1 grid grid-cols-12 bg-surface">
                {/* Left rail */}
                <div className="col-span-4 border-r border-border p-5 space-y-5 bg-background">
                  <div className="space-y-2">
                    <div className="h-3 w-24 rounded-full bg-accent" />
                    <div className="h-2 w-full rounded-full bg-border" />
                    <div className="h-2 w-2/3 rounded-full bg-border" />
                  </div>
                  <div className="rounded-card border border-border bg-surface p-3 space-y-2">
                    <div className="h-2 bg-border rounded-full" />
                    <div className="h-2 bg-border rounded-full" />
                    <div className="h-2 bg-border rounded-full" />
                  </div>
                  <div className="flex flex-wrap gap-2">
                    <span className="inline-flex items-center gap-1.5 rounded-full border border-border bg-surface px-2.5 py-1 text-[10px] font-medium text-muted">React</span>
                    <span className="inline-flex items-center gap-1.5 rounded-full border border-border bg-surface px-2.5 py-1 text-[10px] font-medium text-muted">UI Design</span>
                    <span className="inline-flex items-center gap-1.5 rounded-full border border-border bg-surface px-2.5 py-1 text-[10px] font-medium text-muted">Node.js</span>
                  </div>
                </div>
                {/* Right pane */}
                <div className="col-span-8 p-5 space-y-4">
                  <div className="rounded-card border border-accent/30 bg-accent-tint p-4 space-y-2">
                    <div className="flex items-center gap-2">
                      <Sparkles size={16} className="text-accent" />
                      <span className="text-xs font-semibold text-accent">AI suggestion</span>
                    </div>
                    <div className="h-2 w-full bg-accent/20 rounded-full" />
                    <div className="h-2 w-3/4 bg-accent/20 rounded-full" />
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div className="rounded-card border border-border bg-background p-3 space-y-3">
                      <div className="flex h-8 w-8 items-center justify-center rounded-card bg-clay-tint text-clay-text">
                        <Star size={16} />
                      </div>
                      <div className="h-2 w-1/2 bg-border rounded-full" />
                    </div>
                    <div className="rounded-card border border-border bg-background p-3 space-y-3">
                      <div className="flex h-8 w-8 items-center justify-center rounded-card bg-accent-tint text-accent">
                        <Target size={16} />
                      </div>
                      <div className="h-2 w-1/2 bg-border rounded-full" />
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </motion.div>
        </div>
      </section>

      {/* Steps Section */}
      <section className="bg-background px-4 md:px-8 py-24 md:py-32">
        <div className="max-w-7xl mx-auto">
          <div className="mb-20 space-y-4">
            <h2 className="font-display text-[33px] md:text-[42px] font-medium tracking-tight text-ink">{t.landing.howItWorksTitle}</h2>
            <p className="text-lg text-muted max-w-xl mt-4">{t.landing.howItWorksDesc}</p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
            {t.landing.steps.map((step, idx) => (
              <motion.div
                key={step.title}
                initial={{ opacity: 0, y: 12 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.2, delay: idx * 0.06, ease: 'easeOut' }}
                viewport={{ once: true }}
                className="rounded-card border border-border bg-surface p-8 transition-all duration-200 hover:border-accent/40 hover:shadow-hover"
              >
                <span className="font-display text-[33px] font-medium text-clay-text">0{idx + 1}</span>
                <span className="mt-3 block h-px w-8 bg-border" />
                <h3 className="text-[18px] font-semibold text-ink mt-6 mb-2">{step.title}</h3>
                <p className="text-sm text-muted leading-relaxed">{step.desc}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Features Showcase */}
      <section className="border-y border-border bg-surface px-4 md:px-8 py-24 md:py-32">
        <div className="max-w-7xl mx-auto grid md:grid-cols-2 gap-20 items-center">
          <div className="order-2 md:order-1">
            <div className="rounded-panel border border-border bg-background p-8 md:p-10">
              <div className="relative rounded-card border border-border bg-surface p-6 space-y-4 shadow-card">
                <div className="h-3 w-32 bg-ink rounded-full" />
                <div className="h-2 w-24 bg-border rounded-full" />
                <div className="h-px bg-border" />
                <div className="space-y-2">
                  <div className="h-2 w-full bg-border rounded-full" />
                  <div className="h-2 w-full bg-border rounded-full" />
                  <div className="h-2 w-2/3 bg-border rounded-full" />
                </div>
                <div className="space-y-2">
                  <div className="h-2 w-full bg-border rounded-full" />
                  <div className="h-2 w-full bg-border rounded-full" />
                  <div className="relative h-2 w-2/3 bg-accent/30 rounded-full">
                    <span className="absolute -right-3 top-1/2 -translate-y-1/2 translate-x-full whitespace-nowrap rounded-control border border-accent/30 bg-accent-tint px-2.5 py-1 text-[10px] font-semibold text-accent">
                      Stronger verb →
                    </span>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <div className="space-y-12 order-1 md:order-2">
            <h2
              className="font-display text-[33px] md:text-[42px] font-medium tracking-tight text-ink leading-tight"
              dangerouslySetInnerHTML={{ __html: t.landing.aiPowerTitle }}
            />

            <div className="space-y-10">
              <FeatureItem
                icon={Sparkles}
                title={t.landing.aiPowerItems[0].title}
                desc={t.landing.aiPowerItems[0].desc}
              />
              <FeatureItem
                icon={Layout}
                title={t.landing.aiPowerItems[1].title}
                desc={t.landing.aiPowerItems[1].desc}
              />
              <FeatureItem
                icon={Settings}
                title={t.landing.aiPowerItems[2].title}
                desc={t.landing.aiPowerItems[2].desc}
              />
            </div>
          </div>
        </div>
      </section>

      {/* CTA Final */}
      <section className="bg-background px-4 md:px-8 py-20 md:py-24">
        <div className="max-w-7xl mx-auto rounded-panel bg-accent px-8 py-16 md:px-20 md:py-20 text-center">
          <h2
            className="font-display text-[33px] md:text-[42px] font-medium tracking-tight text-accent-contrast leading-tight mb-5"
            dangerouslySetInnerHTML={{ __html: t.landing.readyTitle }}
          />
          <p className="text-accent-contrast/80 text-lg max-w-2xl mx-auto mb-10">
            {t.landing.readyDesc}
          </p>
          <button
            onClick={onStart}
            className="inline-flex h-12 items-center justify-center rounded-control bg-surface px-8 text-base font-semibold text-ink transition-colors hover:bg-background cursor-pointer focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-accent-contrast active:translate-y-px"
          >
            {t.landing.ctaFinal}
          </button>
        </div>
      </section>
    </div>
  );
}

interface FeatureItemProps {
  icon: LucideIcon;
  title: string;
  desc: string;
}

function FeatureItem({ icon: Icon, title, desc }: FeatureItemProps) {
  return (
    <div className="flex gap-6">
      <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-card bg-accent-tint text-accent">
        <Icon size={20} />
      </div>
      <div>
        <h4 className="text-[18px] font-semibold text-ink mb-1.5">{title}</h4>
        <p className="text-muted leading-relaxed text-[15px]">{desc}</p>
      </div>
    </div>
  );
}
