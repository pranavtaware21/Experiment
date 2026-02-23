import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import API from '../api/axios';
import { FaCheckCircle, FaArrowLeft, FaArrowRight } from 'react-icons/fa';
import {
  FadeIn,
  StaggerContainer,
  StaggerItem,
  motion,
  AnimatePresence,
} from '../components/animations';

const PLATFORMS = [
  { id: 'qualtrics', label: 'Qualtrics', icon: '📊' },
  { id: 'google-forms', label: 'Google Forms', icon: '📝' },
  { id: 'microsoft-forms', label: 'Microsoft Forms', icon: '📋' },
  { id: 'other', label: 'Other', icon: '🔗' },
  { id: 'none', label: "I don't have a survey", icon: '❓' },
];

const STEP_LABELS = ['Platform', 'Survey Link', 'Details'];

export default function AddSurvey() {
  const navigate = useNavigate();
  const [step, setStep] = useState(1);
  const [direction, setDirection] = useState(1); // 1 = forward, -1 = back
  const [platform, setPlatform] = useState('');
  const [surveyLink, setSurveyLink] = useState('');
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [duration, setDuration] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      await API.post('/surveys', {
        title,
        description,
        surveyLink,
        duration: Number(duration),
        platform,
      });
      navigate('/dashboard');
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to create survey');
    } finally {
      setLoading(false);
    }
  };

  const goNext = (nextStep) => {
    setDirection(1);
    setStep(nextStep);
  };

  const goBack = (prevStep) => {
    setDirection(-1);
    setStep(prevStep);
  };

  const canContinueStep1 = platform && platform !== 'none';
  const canContinueStep2 = surveyLink.trim().length > 0;

  const slideVariants = {
    enter: (dir) => ({ x: dir > 0 ? 80 : -80, opacity: 0 }),
    center: { x: 0, opacity: 1 },
    exit: (dir) => ({ x: dir > 0 ? -80 : 80, opacity: 0 }),
  };

  return (
    <div className="min-h-[calc(100vh-200px)] bg-bg py-8 relative overflow-hidden">
      {/* Background orbs */}
      <div className="absolute top-10 left-1/3 w-72 h-72 bg-primary/15 rounded-full blur-[120px] animate-float" />
      <div className="absolute bottom-10 right-1/4 w-56 h-56 bg-accent/10 rounded-full blur-[100px] animate-float-delayed" />

      <div className="max-w-2xl mx-auto px-4 sm:px-6 relative z-10">
        {/* Progress Indicator */}
        <FadeIn>
          <div className="flex items-center justify-center gap-2 mb-8">
            {STEP_LABELS.map((label, i) => {
              const stepNum = i + 1;
              const isActive = step === stepNum;
              const isCompleted = step > stepNum;
              return (
                <div key={label} className="flex items-center gap-2">
                  {i > 0 && (
                    <motion.div
                      className="w-12 h-0.5"
                      initial={{ scaleX: 0 }}
                      animate={{
                        scaleX: 1,
                        backgroundColor: isCompleted || isActive ? '#7C5CFC' : 'rgba(42,32,64,0.3)',
                      }}
                      transition={{ duration: 0.4, delay: i * 0.15 }}
                      style={{ originX: 0 }}
                    />
                  )}
                  <div className="flex flex-col items-center gap-1">
                    <motion.div
                      animate={{
                        scale: isActive ? 1.1 : 1,
                        backgroundColor: isCompleted || isActive ? '#7C5CFC' : 'rgba(255,255,255,0.1)',
                      }}
                      transition={{ type: 'spring', stiffness: 400, damping: 20 }}
                      className="w-8 h-8 rounded-full flex items-center justify-center text-sm font-semibold text-white"
                      style={{
                        boxShadow: isActive ? '0 4px 15px rgba(124,92,252,0.3)' : 'none',
                      }}
                    >
                      {isCompleted ? <FaCheckCircle size={14} /> : stepNum}
                    </motion.div>
                    <span
                      className={`text-xs font-medium ${
                        isActive || isCompleted ? 'text-primary' : 'text-text/40'
                      }`}
                    >
                      {label}
                    </span>
                  </div>
                </div>
              );
            })}
          </div>
        </FadeIn>

        <div className="glass-light rounded-2xl p-6 sm:p-8 glow-sm overflow-hidden">
          <AnimatePresence mode="wait" custom={direction}>
            {/* Step 1: Platform Selection */}
            {step === 1 && (
              <motion.div
                key="step1"
                custom={direction}
                variants={slideVariants}
                initial="enter"
                animate="center"
                exit="exit"
                transition={{ duration: 0.3, ease: 'easeInOut' }}
              >
                <h1 className="text-2xl font-bold mb-2 text-text-dark">What software have you used?</h1>
                <p className="text-text/60 mb-6">
                  Select the platform you used to create your survey.
                </p>

                <StaggerContainer className="grid grid-cols-1 sm:grid-cols-2 gap-3 mb-6" staggerDelay={0.06}>
                  {PLATFORMS.map((p) => (
                    <StaggerItem key={p.id}>
                      <motion.button
                        type="button"
                        onClick={() => setPlatform(p.id)}
                        whileHover={{ scale: 1.02 }}
                        whileTap={{ scale: 0.98 }}
                        className={`flex items-center gap-3 p-4 rounded-xl border-2 text-left cursor-pointer transition-all bg-transparent w-full ${
                          platform === p.id
                            ? 'border-primary bg-primary/10 shadow-lg shadow-primary/10'
                            : 'border-border/30 hover:border-primary/30 hover:bg-text-dark/[0.02]'
                        }`}
                      >
                        <span className="text-2xl">{p.icon}</span>
                        <span className="font-medium text-text-dark">{p.label}</span>
                      </motion.button>
                    </StaggerItem>
                  ))}
                </StaggerContainer>

                {/* "I don't have a survey" — navigate to builder */}
                <AnimatePresence>
                  {platform === 'none' && (
                    <motion.div
                      initial={{ opacity: 0, height: 0 }}
                      animate={{ opacity: 1, height: 'auto' }}
                      exit={{ opacity: 0, height: 0 }}
                      transition={{ duration: 0.3 }}
                      className="overflow-hidden"
                    >
                      <div className="bg-primary/10 border border-primary/20 rounded-xl p-5 mb-6">
                        <h3 className="font-semibold text-text-dark mb-3">
                          No worries! Create one right here on SurveySwap.
                        </h3>
                        <p className="text-sm text-text/60 mb-4">
                          Use our built-in survey builder to create your survey with different question types, preview it, and publish — all for free.
                        </p>
                        <motion.button
                          onClick={() => navigate('/create-survey')}
                          whileHover={{ scale: 1.03 }}
                          whileTap={{ scale: 0.97 }}
                          className="bg-gradient-to-r from-primary to-primary-dark text-white px-6 py-2.5 rounded-xl font-medium cursor-pointer border-none"
                        >
                          Open Survey Builder
                        </motion.button>
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>

                <div className="flex justify-between">
                  <motion.button
                    type="button"
                    onClick={() => navigate(-1)}
                    whileHover={{ scale: 1.03 }}
                    whileTap={{ scale: 0.97 }}
                    className="flex items-center gap-2 px-5 py-2.5 rounded-xl font-medium border border-border/30 bg-transparent text-text/60 hover:bg-text-dark/5 hover:text-text-dark transition-colors cursor-pointer"
                  >
                    <FaArrowLeft size={12} /> Back
                  </motion.button>
                  <motion.button
                    type="button"
                    disabled={!canContinueStep1}
                    onClick={() => goNext(2)}
                    whileHover={canContinueStep1 ? { scale: 1.03 } : {}}
                    whileTap={canContinueStep1 ? { scale: 0.97 } : {}}
                    className="flex items-center gap-2 bg-gradient-to-r from-primary to-primary-dark text-white px-6 py-2.5 rounded-xl font-medium disabled:opacity-40 cursor-pointer border-none"
                  >
                    Continue <FaArrowRight size={12} />
                  </motion.button>
                </div>
              </motion.div>
            )}

            {/* Step 2: Survey Link */}
            {step === 2 && (
              <motion.div
                key="step2"
                custom={direction}
                variants={slideVariants}
                initial="enter"
                animate="center"
                exit="exit"
                transition={{ duration: 0.3, ease: 'easeInOut' }}
              >
                <h1 className="text-2xl font-bold mb-2 text-text-dark">Paste your survey link</h1>
                <p className="text-text/60 mb-6">
                  Enter the URL where participants can take your survey.
                </p>

                <FadeIn delay={0.05}>
                  <div className="mb-6">
                    <label className="block text-sm font-medium text-text-dark mb-1.5">
                      Survey Link
                    </label>
                    <input
                      type="url"
                      value={surveyLink}
                      onChange={(e) => setSurveyLink(e.target.value)}
                      className="w-full px-4 py-3 bg-text-dark/5 border border-border/30 rounded-xl text-text-dark placeholder-text/30 focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary transition-colors"
                      placeholder="https://forms.google.com/..."
                      autoFocus
                    />
                  </div>
                </FadeIn>

                <div className="flex justify-between">
                  <motion.button
                    type="button"
                    onClick={() => goBack(1)}
                    whileHover={{ scale: 1.03 }}
                    whileTap={{ scale: 0.97 }}
                    className="flex items-center gap-2 px-5 py-2.5 rounded-xl font-medium border border-border/30 bg-transparent text-text/60 hover:bg-text-dark/5 hover:text-text-dark transition-colors cursor-pointer"
                  >
                    <FaArrowLeft size={12} /> Back
                  </motion.button>
                  <motion.button
                    type="button"
                    disabled={!canContinueStep2}
                    onClick={() => goNext(3)}
                    whileHover={canContinueStep2 ? { scale: 1.03 } : {}}
                    whileTap={canContinueStep2 ? { scale: 0.97 } : {}}
                    className="flex items-center gap-2 bg-gradient-to-r from-primary to-primary-dark text-white px-6 py-2.5 rounded-xl font-medium disabled:opacity-40 cursor-pointer border-none"
                  >
                    Continue <FaArrowRight size={12} />
                  </motion.button>
                </div>
              </motion.div>
            )}

            {/* Step 3: Details */}
            {step === 3 && (
              <motion.div
                key="step3"
                custom={direction}
                variants={slideVariants}
                initial="enter"
                animate="center"
                exit="exit"
                transition={{ duration: 0.3, ease: 'easeInOut' }}
              >
                <form onSubmit={handleSubmit}>
                  <h1 className="text-2xl font-bold mb-2 text-text-dark">Survey details</h1>
                  <p className="text-text/60 mb-6">
                    Tell participants about your survey.
                  </p>

                  <AnimatePresence>
                    {error && (
                      <motion.div
                        initial={{ opacity: 0, y: -10 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -10 }}
                        className="bg-red-500/10 text-red-400 border border-red-500/20 px-4 py-3 rounded-xl text-sm mb-5"
                      >
                        {error}
                      </motion.div>
                    )}
                  </AnimatePresence>

                  <StaggerContainer className="space-y-5 mb-6" staggerDelay={0.1}>
                    <StaggerItem>
                      <label className="block text-sm font-medium text-text-dark mb-1.5">
                        Survey Title
                      </label>
                      <input
                        type="text"
                        value={title}
                        onChange={(e) => setTitle(e.target.value)}
                        required
                        className="w-full px-4 py-3 bg-text-dark/5 border border-border/30 rounded-xl text-text-dark placeholder-text/30 focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary transition-colors"
                        placeholder="e.g. Student Habits Survey"
                      />
                    </StaggerItem>

                    <StaggerItem>
                      <label className="block text-sm font-medium text-text-dark mb-1.5">
                        Description
                      </label>
                      <textarea
                        value={description}
                        onChange={(e) => setDescription(e.target.value)}
                        required
                        rows={3}
                        className="w-full px-4 py-3 bg-text-dark/5 border border-border/30 rounded-xl text-text-dark placeholder-text/30 focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary transition-colors resize-none"
                        placeholder="Briefly describe what your survey is about"
                      />
                    </StaggerItem>

                    <StaggerItem>
                      <label className="block text-sm font-medium text-text-dark mb-1.5">
                        Estimated Duration (minutes)
                      </label>
                      <input
                        type="number"
                        value={duration}
                        onChange={(e) => setDuration(e.target.value)}
                        required
                        min={1}
                        max={60}
                        className="w-full px-4 py-3 bg-text-dark/5 border border-border/30 rounded-xl text-text-dark placeholder-text/30 focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary transition-colors"
                        placeholder="5"
                      />
                    </StaggerItem>
                  </StaggerContainer>

                  <div className="flex justify-between">
                    <motion.button
                      type="button"
                      onClick={() => goBack(2)}
                      whileHover={{ scale: 1.03 }}
                      whileTap={{ scale: 0.97 }}
                      className="flex items-center gap-2 px-5 py-2.5 rounded-xl font-medium border border-border/30 bg-transparent text-text/60 hover:bg-text-dark/5 hover:text-text-dark transition-colors cursor-pointer"
                    >
                      <FaArrowLeft size={12} /> Back
                    </motion.button>
                    <motion.button
                      type="submit"
                      disabled={loading}
                      whileHover={!loading ? { scale: 1.03 } : {}}
                      whileTap={!loading ? { scale: 0.97 } : {}}
                      className="flex items-center gap-2 bg-gradient-to-r from-primary to-primary-dark text-white px-6 py-2.5 rounded-xl font-semibold disabled:opacity-50 cursor-pointer border-none"
                    >
                      {loading ? 'Creating...' : 'Submit Survey'}
                    </motion.button>
                  </div>
                </form>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>
    </div>
  );
}
