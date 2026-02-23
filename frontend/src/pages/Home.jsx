import { useState, useEffect, useCallback } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import {
  FaBolt, FaArrowRight, FaClipboardCheck, FaPaperPlane, FaChartBar,
  FaGraduationCap, FaCheckCircle, FaRocket, FaClock, FaShieldAlt,
  FaUsers, FaGlobe,
} from 'react-icons/fa';
import {
  ScrollReveal,
  StaggerContainer,
  StaggerItem,
  AnimatedCounter,
  ParallaxOrb,
  TiltCard,
  FadeIn,
  TypeWriter,
  motion,
  AnimatePresence,
} from '../components/animations';

const ACTIVITIES = [
  'Emma just collected 12 responses',
  'Raj earned 3 credits completing a survey',
  'Sofia posted a new psychology survey',
  'James reached 50 responses on his research',
  'Priya earned 2 credits in 5 minutes',
  'Alex just published a marketing survey',
  'Maria completed her 20th survey this week',
  'Liam got 25 responses in 3 hours',
];

export default function Home() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [activityIdx, setActivityIdx] = useState(0);
  const [heroReady, setHeroReady] = useState(false);

  useEffect(() => {
    const interval = setInterval(() => {
      setActivityIdx((prev) => (prev + 1) % ACTIVITIES.length);
    }, 3000);
    return () => clearInterval(interval);
  }, []);

  const handleCreatorCTA = () => navigate(user ? '/add-survey' : '/signup');
  const handleEarnerCTA = () => navigate(user ? '/surveys' : '/signup');
  const onTypeComplete = useCallback(() => setHeroReady(true), []);

  return (
    <div className="bg-bg">
      {/* ── HERO ── */}
      <section className="relative py-20 md:py-32 overflow-hidden">
        {/* Background gradient orbs — floating + parallax */}
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          <ParallaxOrb speed={0.3} className="absolute top-0 left-1/4 w-[600px] h-[600px] bg-primary/20 rounded-full blur-[150px] animate-float" />
          <ParallaxOrb speed={0.15} className="absolute bottom-0 right-1/4 w-[400px] h-[400px] bg-accent/10 rounded-full blur-[120px] animate-float-delayed" />
          <ParallaxOrb speed={0.1} className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[800px] bg-primary/5 rounded-full blur-[200px] animate-float" />
        </div>

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative">
          <div className="max-w-3xl mx-auto text-center">
            {/* Badge — fades in first */}
            <FadeIn>
              <div className="inline-flex items-center gap-2 bg-primary/10 border border-primary/20 rounded-full px-4 py-1.5 mb-6">
                <span className="w-2 h-2 bg-green-500 rounded-full animate-pulse" />
                <span className="text-sm text-primary font-medium">1,247 surveys completed today</span>
              </div>
            </FadeIn>

            {/* Headline — typewriter effect (fast) */}
            <h1 className="text-4xl md:text-6xl lg:text-7xl font-extrabold text-text-dark mb-6 font-[Raleway] leading-tight">
              <FadeIn delay={0.05}>
                <TypeWriter
                  text="Get Real Survey "
                  delay={0.1}
                  speed={0.025}
                  onComplete={onTypeComplete}
                />
                <span className="bg-gradient-to-r from-primary via-purple-400 to-accent bg-clip-text text-transparent animate-gradient">
                  {heroReady ? 'Responses.' : ''}
                </span>
              </FadeIn>
            </h1>

            {/* Subtitle */}
            <FadeIn delay={0.55}>
              <p className="text-lg md:text-xl text-text mb-10 max-w-2xl mx-auto leading-relaxed">
                Answer surveys, earn credits, get responses. The #1 survey exchange trusted by researchers worldwide.
              </p>
            </FadeIn>

            {/* Intent-split CTAs */}
            <FadeIn delay={0.6}>
              <div className="flex flex-col sm:flex-row gap-4 justify-center mb-8">
                <motion.button
                  onClick={handleCreatorCTA}
                  whileHover={{ scale: 1.04, boxShadow: '0 10px 40px rgba(124,92,252,0.3)' }}
                  whileTap={{ scale: 0.97 }}
                  transition={{ type: 'spring', stiffness: 400, damping: 15 }}
                  className="group flex items-center justify-center gap-2 bg-gradient-to-r from-primary to-primary-dark text-white px-8 py-3.5 rounded-xl font-semibold text-lg cursor-pointer border-none"
                >
                  I need responses
                  <FaArrowRight className="group-hover:translate-x-1 transition-transform" size={14} />
                </motion.button>
                <motion.button
                  onClick={handleEarnerCTA}
                  whileHover={{ scale: 1.04 }}
                  whileTap={{ scale: 0.97 }}
                  transition={{ type: 'spring', stiffness: 400, damping: 15 }}
                  className="group flex items-center justify-center gap-2 bg-text-dark/5 hover:bg-text-dark/10 text-text-dark px-8 py-3.5 rounded-xl font-semibold text-lg cursor-pointer border border-white/10 hover:border-white/20 transition-colors"
                >
                  <FaBolt className="text-accent" />
                  I want to earn credits
                </motion.button>
              </div>
            </FadeIn>

            <FadeIn delay={0.65}>
              <div className="flex items-center justify-center gap-6 text-text/70 text-sm flex-wrap">
                <span className="flex items-center gap-1.5"><FaCheckCircle size={12} className="text-green-500" /> Free to start</span>
                <span className="flex items-center gap-1.5"><FaCheckCircle size={12} className="text-green-500" /> No credit card</span>
                <span className="flex items-center gap-1.5"><FaCheckCircle size={12} className="text-green-500" /> 3 credits on signup</span>
              </div>
            </FadeIn>
          </div>
        </div>
      </section>

      {/* ── LIVE ACTIVITY BAR ── */}
      <section className="border-y border-border/50 py-3">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3 min-w-0">
              <span className="w-2 h-2 bg-green-500 rounded-full animate-pulse flex-shrink-0" />
              <AnimatePresence mode="wait">
                <motion.p
                  key={activityIdx}
                  initial={{ opacity: 0, y: 8 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -8 }}
                  transition={{ duration: 0.25 }}
                  className="text-sm text-text/80 truncate"
                >
                  {ACTIVITIES[activityIdx]}
                </motion.p>
              </AnimatePresence>
            </div>
            <div className="hidden sm:flex items-center gap-6 flex-shrink-0 ml-4">
              <span className="text-sm text-text/60 flex items-center gap-1.5">
                <FaClipboardCheck className="text-primary" size={12} />
                <strong className="text-text-dark">1,247</strong> today
              </span>
              <span className="text-sm text-text/60 flex items-center gap-1.5">
                <FaUsers className="text-primary" size={12} />
                <strong className="text-text-dark">342</strong> active
              </span>
            </div>
          </div>
        </div>
      </section>

      {/* ── PERSONA SPLIT ── */}
      <section className="py-20 md:py-24">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <ScrollReveal>
            <h2 className="text-3xl md:text-4xl font-bold text-center mb-3 text-text-dark">How do you want to use SurveySwap?</h2>
            <p className="text-text text-center mb-14 max-w-xl mx-auto">
              Whether you need responses or want to earn — we've got you covered.
            </p>
          </ScrollReveal>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 max-w-4xl mx-auto">
            {/* Researcher — slides from left */}
            <ScrollReveal direction="left" delay={0.05}>
              <TiltCard>
                <div className="glass-light rounded-2xl p-8 hover:border-primary/30 transition-all group glow-sm h-full">
                  <div className="w-14 h-14 bg-primary/15 rounded-2xl flex items-center justify-center mb-5 border border-primary/20">
                    <FaPaperPlane className="text-primary text-xl" />
                  </div>
                  <h3 className="text-xl font-bold mb-2 text-text-dark">I'm a Researcher</h3>
                  <p className="text-text text-sm mb-5">
                    Post your survey and get real responses from verified participants.
                  </p>
                  <div className="space-y-2.5 mb-6">
                    {['Post any survey link (Google Forms, Qualtrics, etc.)', 'Or build surveys directly in SurveySwap', 'Track responses with live dashboard'].map((t) => (
                      <div key={t} className="flex items-center gap-2 text-sm text-text/80">
                        <FaCheckCircle className="text-green-500 flex-shrink-0" size={12} />
                        {t}
                      </div>
                    ))}
                  </div>
                  <motion.button
                    onClick={handleCreatorCTA}
                    whileHover={{ scale: 1.02, boxShadow: '0 8px 30px rgba(124,92,252,0.25)' }}
                    whileTap={{ scale: 0.98 }}
                    transition={{ type: 'spring', stiffness: 400, damping: 15 }}
                    className="w-full flex items-center justify-center gap-2 bg-gradient-to-r from-primary to-primary-dark text-white py-3 rounded-xl font-semibold cursor-pointer border-none"
                  >
                    Post Your Survey <FaArrowRight size={12} />
                  </motion.button>
                </div>
              </TiltCard>
            </ScrollReveal>

            {/* Earner — slides from right */}
            <ScrollReveal direction="right" delay={0.1}>
              <TiltCard>
                <div className="glass-light rounded-2xl p-8 hover:border-accent/30 transition-all group glow-sm h-full">
                  <div className="w-14 h-14 bg-accent/15 rounded-2xl flex items-center justify-center mb-5 border border-accent/20">
                    <FaBolt className="text-accent text-xl" />
                  </div>
                  <h3 className="text-xl font-bold mb-2 text-text-dark">I Want to Earn</h3>
                  <p className="text-text text-sm mb-5">
                    Complete short surveys and earn credits for your own research.
                  </p>
                  <div className="space-y-2.5 mb-6">
                    {['Browse surveys matching your interests', 'Earn 1-3 credits per survey completed', 'Use credits when you need responses'].map((t) => (
                      <div key={t} className="flex items-center gap-2 text-sm text-text/80">
                        <FaCheckCircle className="text-green-500 flex-shrink-0" size={12} />
                        {t}
                      </div>
                    ))}
                  </div>
                  <motion.button
                    onClick={handleEarnerCTA}
                    whileHover={{ scale: 1.02, boxShadow: '0 8px 30px rgba(249,115,22,0.25)' }}
                    whileTap={{ scale: 0.98 }}
                    transition={{ type: 'spring', stiffness: 400, damping: 15 }}
                    className="w-full flex items-center justify-center gap-2 bg-gradient-to-r from-accent to-orange-500 text-white py-3 rounded-xl font-semibold cursor-pointer border-none"
                  >
                    Start Earning <FaBolt size={12} />
                  </motion.button>
                </div>
              </TiltCard>
            </ScrollReveal>
          </div>
        </div>
      </section>

      {/* ── HOW IT WORKS ── */}
      <section className="py-20 md:py-24 border-t border-border/30">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <ScrollReveal>
            <h2 className="text-3xl md:text-4xl font-bold text-center mb-3 text-text-dark">Three Steps. Real Responses.</h2>
            <p className="text-text text-center mb-14 max-w-xl mx-auto">
              From signup to data collection — it takes less than 2 minutes.
            </p>
          </ScrollReveal>
          <StaggerContainer className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-4xl mx-auto" staggerDelay={0.08}>
            {[
              { step: '01', icon: FaGraduationCap, title: 'Sign up free', desc: 'Create your account in 10 seconds. You get 3 free credits.', color: 'primary' },
              { step: '02', icon: FaClipboardCheck, title: 'Complete surveys', desc: 'Help other researchers. Each survey earns you 1-3 credits.', color: 'accent' },
              { step: '03', icon: FaChartBar, title: 'Collect responses', desc: 'Post your survey. Higher credits = higher visibility.', color: 'green-500' },
            ].map((item) => {
              const Icon = item.icon;
              return (
                <StaggerItem key={item.step}>
                  <TiltCard tiltAmount={4}>
                    <div className="text-center glass-light rounded-2xl p-8 h-full">
                      <span className="text-5xl font-extrabold bg-gradient-to-b from-white/20 to-white/5 bg-clip-text text-transparent block mb-4 font-[Raleway]">
                        {item.step}
                      </span>
                      <div className={`w-12 h-12 bg-${item.color}/15 rounded-xl flex items-center justify-center mx-auto mb-4 border border-${item.color}/20`}>
                        <Icon className={`text-${item.color} text-lg`} />
                      </div>
                      <h3 className="text-lg font-semibold mb-2 text-text-dark">{item.title}</h3>
                      <p className="text-text text-sm">{item.desc}</p>
                    </div>
                  </TiltCard>
                </StaggerItem>
              );
            })}
          </StaggerContainer>
        </div>
      </section>

      {/* ── RESPONSE ACCELERATOR ── */}
      <section className="py-20 md:py-24">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <ScrollReveal duration={0.6}>
            <div className="max-w-4xl mx-auto relative rounded-3xl overflow-hidden">
              {/* BG gradient */}
              <div className="absolute inset-0 bg-gradient-to-br from-primary/20 via-surface-light to-accent/10" />
              <ParallaxOrb speed={0.2} className="absolute top-0 right-0 w-72 h-72 bg-primary/20 rounded-full blur-[100px] animate-float pointer-events-none" />
              <ParallaxOrb speed={0.15} className="absolute bottom-0 left-0 w-64 h-64 bg-accent/10 rounded-full blur-[80px] animate-float-delayed pointer-events-none" />

              <div className="relative p-8 md:p-12 glass-light rounded-3xl">
                <div className="flex items-center gap-2 mb-4">
                  <FaRocket className="text-accent" />
                  <span className="text-accent font-semibold text-sm uppercase tracking-wider">Response Accelerator</span>
                </div>
                <h2 className="text-2xl md:text-3xl font-bold text-text-dark mb-3">
                  Need responses in hours, not days?
                </h2>
                <p className="text-text mb-8 max-w-xl">
                  Boost your survey to the top. Get guaranteed responses with accelerator packages.
                </p>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-8">
                  <motion.div
                    whileHover={{ y: -3 }}
                    transition={{ type: 'spring', stiffness: 300, damping: 20 }}
                    className="bg-text-dark/5 rounded-xl p-5 border border-white/5"
                  >
                    <div className="text-sm font-medium text-text/70 mb-2">Free (Credit Swap)</div>
                    <div className="flex items-center gap-2 text-sm text-text/60 mb-1">
                      <FaClock size={12} /> Responses in 2-5 days
                    </div>
                    <div className="flex items-center gap-2 text-sm text-text/60">
                      <FaUsers size={12} /> Based on your credit balance
                    </div>
                  </motion.div>
                  <motion.div
                    whileHover={{ y: -3, boxShadow: '0 8px 30px rgba(249,115,22,0.2)' }}
                    transition={{ type: 'spring', stiffness: 300, damping: 20 }}
                    className="bg-accent/10 rounded-xl p-5 border border-accent/20 glow-accent animate-glow-pulse"
                  >
                    <div className="text-sm font-medium text-accent mb-2">Accelerated</div>
                    <div className="flex items-center gap-2 text-sm text-text/80 mb-1">
                      <FaRocket size={12} className="text-accent" /> Responses in 12-48 hours
                    </div>
                    <div className="flex items-center gap-2 text-sm text-text/80">
                      <FaShieldAlt size={12} className="text-accent" /> Guaranteed response count
                    </div>
                  </motion.div>
                </div>

                <div className="flex flex-col sm:flex-row gap-3 items-center">
                  <motion.div whileHover={{ scale: 1.03 }} whileTap={{ scale: 0.97 }}>
                    <Link
                      to={user ? '/dashboard' : '/signup'}
                      className="inline-flex items-center gap-2 bg-gradient-to-r from-accent to-orange-500 text-white px-6 py-3 rounded-xl font-semibold no-underline hover:shadow-xl hover:shadow-accent/25 transition-shadow"
                    >
                      View Accelerator Plans
                    </Link>
                  </motion.div>
                  <span className="text-text/50 text-sm">Starting from ₹799</span>
                </div>
              </div>
            </div>
          </ScrollReveal>
        </div>
      </section>

      {/* ── TRUST ── */}
      <section className="py-16 border-t border-border/30">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <ScrollReveal>
            <p className="text-center text-xs text-text/50 mb-8 font-medium uppercase tracking-widest">
              Trusted by researchers at leading institutions
            </p>
          </ScrollReveal>
          <StaggerContainer className="flex items-center justify-center gap-8 md:gap-16 flex-wrap opacity-25 mb-14" staggerDelay={0.05}>
            {['MIT', 'Stanford', 'Oxford', 'Harvard', 'Cambridge'].map((name) => (
              <StaggerItem key={name}>
                <span className="text-xl md:text-2xl font-bold text-text-dark">{name}</span>
              </StaggerItem>
            ))}
          </StaggerContainer>

          <StaggerContainer className="grid grid-cols-2 md:grid-cols-4 gap-8 text-center max-w-3xl mx-auto" staggerDelay={0.06}>
            {[
              { icon: FaGlobe, value: '5M+', label: 'Surveys Completed' },
              { icon: FaUsers, value: '200K+', label: 'Researchers' },
              { icon: null, value: '150+', label: 'Countries' },
              { icon: null, value: '4.8/5', label: 'Average Rating' },
            ].map((s) => (
              <StaggerItem key={s.label}>
                <div>
                  <AnimatedCounter value={s.value} className="text-3xl font-bold text-text-dark mb-1 block" />
                  <div className="text-text/60 text-sm">{s.label}</div>
                </div>
              </StaggerItem>
            ))}
          </StaggerContainer>
        </div>
      </section>

      {/* ── FINAL CTA ── */}
      <section className="py-20 relative overflow-hidden">
        <div className="absolute inset-0 pointer-events-none">
          <ParallaxOrb speed={0.2} className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-primary/15 rounded-full blur-[150px] animate-float" />
        </div>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center relative">
          <ScrollReveal>
            <motion.div
              initial={{ scale: 0.95, opacity: 0 }}
              whileInView={{ scale: 1, opacity: 1 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, ease: 'easeOut' }}
            >
              <h2 className="text-3xl md:text-4xl font-bold text-text-dark mb-4">
                Join 200K+ researchers collecting data smarter
              </h2>
              <p className="text-text mb-8 max-w-lg mx-auto">
                Free to start. No credit card required. Get your first responses today.
              </p>
              <div className="flex flex-col sm:flex-row gap-4 justify-center">
                <motion.div whileHover={{ scale: 1.04 }} whileTap={{ scale: 0.97 }} transition={{ type: 'spring', stiffness: 400, damping: 15 }}>
                  <Link
                    to="/signup"
                    className="bg-gradient-to-r from-primary to-primary-dark text-white px-8 py-3.5 rounded-xl font-semibold text-lg no-underline inline-flex items-center justify-center gap-2"
                  >
                    Get Started Free <FaArrowRight size={14} />
                  </Link>
                </motion.div>
                <motion.div whileHover={{ scale: 1.04 }} whileTap={{ scale: 0.97 }} transition={{ type: 'spring', stiffness: 400, damping: 15 }}>
                  <Link
                    to="/surveys"
                    className="bg-text-dark/5 border border-white/10 text-text-dark px-8 py-3.5 rounded-xl font-semibold text-lg no-underline hover:bg-text-dark/10 transition-colors inline-flex items-center justify-center"
                  >
                    Browse Surveys
                  </Link>
                </motion.div>
              </div>
            </motion.div>
          </ScrollReveal>
        </div>
      </section>
    </div>
  );
}
