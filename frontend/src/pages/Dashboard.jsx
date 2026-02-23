import { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import API from '../api/axios';
import SurveyCard from '../components/SurveyCard';
import {
  FaBolt, FaClipboardCheck, FaChartLine, FaPlusCircle, FaTrash,
  FaToggleOn, FaToggleOff, FaRocket, FaClock, FaArrowRight,
  FaFire, FaTrophy, FaEye, FaLink,
} from 'react-icons/fa';
import {
  ScrollReveal,
  StaggerContainer,
  StaggerItem,
  AnimatedCounter,
  FadeIn,
  motion,
  AnimatePresence,
} from '../components/animations';

export default function Dashboard() {
  const { user, refreshUser } = useAuth();
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState('creator');
  const [mySurveys, setMySurveys] = useState([]);
  const [availableSurveys, setAvailableSurveys] = useState([]);
  const [loading, setLoading] = useState(true);
  const [loadingAvailable, setLoadingAvailable] = useState(true);
  const [alert, setAlert] = useState(null);
  const [completing, setCompleting] = useState(null);

  useEffect(() => { fetchMySurveys(); fetchAvailableSurveys(); }, []);

  const fetchMySurveys = async () => {
    try { const res = await API.get('/surveys/my'); setMySurveys(res.data.surveys); }
    catch {} finally { setLoading(false); }
  };

  const fetchAvailableSurveys = async () => {
    try { const res = await API.get('/surveys'); setAvailableSurveys(res.data.surveys); }
    catch {} finally { setLoadingAvailable(false); }
  };

  const toggleSurvey = async (id) => {
    try { const res = await API.patch(`/surveys/${id}/toggle`); setMySurveys(mySurveys.map((s) => ((s._id || s.id) === id ? res.data.survey : s))); }
    catch { showAlert('error', 'Failed to toggle survey'); }
  };

  const deleteSurvey = async (id) => {
    if (!window.confirm('Delete this survey?')) return;
    try { await API.delete(`/surveys/${id}`); setMySurveys(mySurveys.filter((s) => (s._id || s.id) !== id)); showAlert('success', 'Survey deleted'); }
    catch { showAlert('error', 'Failed to delete survey'); }
  };

  const handleComplete = async (surveyId) => {
    setCompleting(surveyId);
    try { const res = await API.post(`/surveys/${surveyId}/complete`); showAlert('success', res.data.message); await fetchAvailableSurveys(); await refreshUser(); }
    catch (err) { showAlert('error', err.response?.data?.message || 'Failed'); }
    finally { setCompleting(null); }
  };

  const showAlert = (type, message) => { setAlert({ type, message }); setTimeout(() => setAlert(null), 4000); };

  const totalResponses = mySurveys.reduce((sum, s) => sum + s.responses, 0);
  const activeSurveys = mySurveys.filter((s) => s.isActive).length;
  const earnableSurveys = availableSurveys.filter((s) => s.ownerId !== user?.id && s.owner?.id !== user?.id);

  return (
    <div className="min-h-[calc(100vh-200px)] bg-bg py-6 md:py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Welcome */}
        <FadeIn>
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-6">
            <div>
              <h1 className="text-2xl md:text-3xl font-bold mb-1 text-text-dark">
                Welcome back, {user?.name?.split(' ')[0]}
              </h1>
              <p className="text-text/60 text-sm">Here's what's happening with your surveys.</p>
            </div>
            <motion.button
              onClick={() => navigate('/add-survey')}
              whileHover={{ scale: 1.03, boxShadow: '0 8px 30px rgba(124,92,252,0.2)' }}
              whileTap={{ scale: 0.97 }}
              transition={{ type: 'spring', stiffness: 400, damping: 15 }}
              className="flex items-center gap-2 bg-gradient-to-r from-primary to-primary-dark text-white px-5 py-2.5 rounded-xl font-medium border-none cursor-pointer"
            >
              <FaPlusCircle size={14} /> Post New Survey
            </motion.button>
          </div>
        </FadeIn>

        <AnimatePresence>
          {alert && (
            <motion.div
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              className={`mb-5 px-4 py-3 rounded-xl text-sm font-medium ${
                alert.type === 'success' ? 'bg-green-500/10 text-green-400 border border-green-500/20' : 'bg-red-500/10 text-red-400 border border-red-500/20'
              }`}
            >
              {alert.message}
            </motion.div>
          )}
        </AnimatePresence>

        {/* Stats */}
        <StaggerContainer className="grid grid-cols-2 lg:grid-cols-4 gap-3 mb-6" staggerDelay={0.08}>
          {[
            { icon: <FaBolt className="text-primary" />, bg: 'bg-primary/15 border-primary/20', label: 'Credits', value: user?.karma || 0 },
            { icon: <FaPlusCircle className="text-accent" />, bg: 'bg-accent/15 border-accent/20', label: 'Active Surveys', value: activeSurveys },
            { icon: <FaChartLine className="text-green-400" />, bg: 'bg-green-500/15 border-green-500/20', label: 'Total Responses', value: totalResponses },
            { icon: <FaClipboardCheck className="text-purple-400" />, bg: 'bg-purple-500/15 border-purple-500/20', label: 'Completed', value: user?.surveysCompleted || 0 },
          ].map((s) => (
            <StaggerItem key={s.label}>
              <motion.div
                whileHover={{ y: -2 }}
                transition={{ type: 'spring', stiffness: 300, damping: 20 }}
                className="glass-light rounded-xl p-4"
              >
                <div className="flex items-center gap-2.5 mb-1.5">
                  <div className={`w-8 h-8 ${s.bg} rounded-lg flex items-center justify-center border`}>{s.icon}</div>
                  <span className="text-text/50 text-xs">{s.label}</span>
                </div>
                <AnimatedCounter value={s.value} className="text-2xl font-bold text-text-dark" />
              </motion.div>
            </StaggerItem>
          ))}
        </StaggerContainer>

        {/* Tabs */}
        <FadeIn delay={0.1}>
          <div className="flex gap-1 glass-light rounded-xl p-1 mb-6 max-w-sm">
            {[
              { key: 'creator', label: 'My Surveys', activeClass: 'bg-primary text-white shadow-lg shadow-primary/20' },
              { key: 'earner', label: 'Earn Credits', activeClass: 'bg-accent text-white shadow-lg shadow-accent/20' },
            ].map((tab) => (
              <button
                key={tab.key}
                onClick={() => setActiveTab(tab.key)}
                className={`flex-1 py-2.5 px-4 rounded-lg text-sm font-semibold transition-all cursor-pointer border-none relative ${
                  activeTab === tab.key ? tab.activeClass : 'bg-transparent text-text/60 hover:text-text-dark'
                }`}
              >
                {tab.label}
              </button>
            ))}
          </div>
        </FadeIn>

        {/* ── TAB CONTENT with AnimatePresence ── */}
        <AnimatePresence mode="wait">
          {/* ── CREATOR TAB ── */}
          {activeTab === 'creator' && (
            <motion.div
              key="creator"
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: 20 }}
              transition={{ duration: 0.3, ease: 'easeInOut' }}
              className="grid grid-cols-1 lg:grid-cols-3 gap-6"
            >
              <div className="lg:col-span-2">
                <div className="glass-light rounded-2xl">
                  <div className="flex items-center justify-between p-5 border-b border-border/30">
                    <h2 className="text-lg font-bold text-text-dark">My Surveys</h2>
                    <span className="text-xs text-text/40">{mySurveys.length} total</span>
                  </div>

                  {loading ? (
                    <div className="flex justify-center py-12">
                      <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
                    </div>
                  ) : mySurveys.length === 0 ? (
                    <FadeIn className="text-center py-12 px-6">
                      <div className="w-16 h-16 bg-primary/15 rounded-2xl flex items-center justify-center mx-auto mb-4 border border-primary/20">
                        <FaPlusCircle className="text-primary text-2xl" />
                      </div>
                      <h3 className="font-semibold mb-2 text-text-dark">No surveys yet</h3>
                      <p className="text-text/60 text-sm mb-4">Post your first survey to start collecting responses.</p>
                      <motion.button
                        onClick={() => navigate('/add-survey')}
                        whileHover={{ scale: 1.03 }}
                        whileTap={{ scale: 0.97 }}
                        className="bg-gradient-to-r from-primary to-primary-dark text-white px-5 py-2.5 rounded-xl text-sm font-medium border-none cursor-pointer"
                      >
                        Post Your First Survey
                      </motion.button>
                    </FadeIn>
                  ) : (
                    <div className="divide-y divide-border/20">
                      {mySurveys.map((survey, i) => {
                        const id = survey._id || survey.id;
                        return (
                          <motion.div
                            key={id}
                            initial={{ opacity: 0, y: 10 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: i * 0.05, duration: 0.3 }}
                            className="p-4 hover:bg-text-dark/[0.02] transition-colors"
                          >
                            <div className="flex items-start justify-between gap-3">
                              <div className="flex-1 min-w-0">
                                <h4 className="font-medium text-text-dark text-sm truncate">{survey.title}</h4>
                                <div className="flex items-center gap-3 mt-1.5 text-xs text-text/50">
                                  <span className="flex items-center gap-1"><FaChartLine size={10} /> {survey.responses} responses</span>
                                  <span className="flex items-center gap-1"><FaClock size={10} /> {survey.duration} min</span>
                                  <span className={`font-medium ${survey.isActive ? 'text-green-400' : 'text-text/30'}`}>
                                    {survey.isActive ? 'Active' : 'Paused'}
                                  </span>
                                </div>
                                <div className="mt-2.5">
                                  <div className="h-1.5 bg-text-dark/5 rounded-full overflow-hidden">
                                    <motion.div
                                      className="h-full bg-gradient-to-r from-primary to-accent rounded-full"
                                      initial={{ width: 0 }}
                                      animate={{ width: `${Math.min((survey.responses / 50) * 100, 100)}%` }}
                                      transition={{ duration: 0.8, delay: 0.1 + i * 0.05, ease: 'easeOut' }}
                                    />
                                  </div>
                                  <p className="text-xs text-text/40 mt-1">{survey.responses}/50 responses</p>
                                </div>
                              </div>
                              <div className="flex items-center gap-1.5 flex-shrink-0">
                                {survey.isBuiltIn && (
                                  <>
                                    <button
                                      onClick={() => navigate(`/survey/${id}/responses`)}
                                      className="bg-transparent border-none cursor-pointer p-1.5 hover:bg-primary/10 rounded-lg transition-colors text-text/30 hover:text-primary"
                                      title="View Responses"
                                    >
                                      <FaEye size={12} />
                                    </button>
                                    <button
                                      onClick={() => {
                                        const url = `${window.location.origin}/survey/${id}`;
                                        navigator.clipboard.writeText(url);
                                        showAlert('success', 'Survey link copied to clipboard!');
                                      }}
                                      className="bg-transparent border-none cursor-pointer p-1.5 hover:bg-accent/10 rounded-lg transition-colors text-text/30 hover:text-accent"
                                      title="Copy Link"
                                    >
                                      <FaLink size={12} />
                                    </button>
                                  </>
                                )}
                                <button onClick={() => toggleSurvey(id)} className="bg-transparent border-none cursor-pointer p-1.5 hover:bg-text-dark/5 rounded-lg transition-colors" title={survey.isActive ? 'Pause' : 'Activate'}>
                                  {survey.isActive ? <FaToggleOn className="text-green-400 text-lg" /> : <FaToggleOff className="text-text/30 text-lg" />}
                                </button>
                                <button onClick={() => deleteSurvey(id)} className="bg-transparent border-none cursor-pointer p-1.5 hover:bg-red-500/10 rounded-lg transition-colors text-text/30 hover:text-red-400" title="Delete">
                                  <FaTrash size={12} />
                                </button>
                              </div>
                            </div>
                          </motion.div>
                        );
                      })}
                    </div>
                  )}
                </div>
              </div>

              {/* Sidebar */}
              <div className="space-y-5">
                {/* Accelerator */}
                <ScrollReveal direction="right" delay={0.05}>
                  <div className="relative rounded-2xl overflow-hidden">
                    <div className="absolute inset-0 bg-gradient-to-br from-primary/20 to-accent/10" />
                    <div className="absolute top-0 right-0 w-32 h-32 bg-primary/20 rounded-full blur-[60px] animate-float" />
                    <div className="relative glass-light rounded-2xl p-5">
                      <div className="flex items-center gap-2 mb-3">
                        <FaRocket className="text-accent" />
                        <span className="text-xs font-semibold text-accent uppercase tracking-wider">Accelerator</span>
                      </div>
                      <h3 className="font-bold text-text-dark mb-1 text-sm">Get responses faster</h3>
                      <p className="text-text/50 text-xs mb-4">Boost your survey to the top.</p>
                      <div className="space-y-2 mb-4">
                        {[
                          { credits: 25, price: '₹799', label: 'Starter' },
                          { credits: 75, price: '₹1,599', label: 'Growth', popular: true },
                          { credits: 200, price: '₹2,999', label: 'Pro' },
                        ].map((pkg) => (
                          <motion.div
                            key={pkg.credits}
                            onClick={() => showAlert('success', `Mock: ${pkg.credits} credits for ${pkg.price}. Coming soon.`)}
                            whileHover={{ scale: 1.02, y: -1 }}
                            whileTap={{ scale: 0.98 }}
                            className={`flex items-center justify-between p-2.5 rounded-lg cursor-pointer transition-all ${
                              pkg.popular ? 'bg-accent/15 border border-accent/20 hover:bg-accent/20' : 'bg-text-dark/5 hover:bg-text-dark/10 border border-white/5'
                            }`}
                          >
                            <div>
                              <span className="text-sm font-medium text-text-dark">{pkg.credits} credits</span>
                              {pkg.popular && <span className="ml-1.5 text-[10px] bg-accent text-white px-1.5 py-0.5 rounded-full font-bold">BEST</span>}
                            </div>
                            <span className="text-sm font-semibold text-text-dark">{pkg.price}</span>
                          </motion.div>
                        ))}
                      </div>
                      <p className="text-[10px] text-text/30 text-center">Payments mock only — coming soon.</p>
                    </div>
                  </div>
                </ScrollReveal>

                {/* Quick earn */}
                <ScrollReveal direction="right" delay={0.1}>
                  <div className="glass-light rounded-2xl p-5">
                    <div className="flex items-center gap-2 mb-3">
                      <FaFire className="text-accent" />
                      <h3 className="font-bold text-sm text-text-dark">Need more credits?</h3>
                    </div>
                    <p className="text-text/50 text-xs mb-3">Complete surveys from other researchers to earn credits free.</p>
                    <motion.button
                      onClick={() => setActiveTab('earner')}
                      whileHover={{ scale: 1.02 }}
                      whileTap={{ scale: 0.98 }}
                      className="w-full flex items-center justify-center gap-2 bg-accent/10 text-accent py-2.5 rounded-xl text-sm font-semibold border border-accent/20 cursor-pointer hover:bg-accent/15 transition-colors"
                    >
                      Browse Surveys <FaArrowRight size={10} />
                    </motion.button>
                  </div>
                </ScrollReveal>
              </div>
            </motion.div>
          )}

          {/* ── EARNER TAB ── */}
          {activeTab === 'earner' && (
            <motion.div
              key="earner"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              transition={{ duration: 0.3, ease: 'easeInOut' }}
            >
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.1 }}
                className="glass-light rounded-2xl p-5 mb-6 flex flex-col sm:flex-row items-center justify-between gap-4"
              >
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 bg-accent/15 rounded-xl flex items-center justify-center border border-accent/20">
                    <FaTrophy className="text-accent text-lg" />
                  </div>
                  <div>
                    <p className="text-sm text-text/50">Your earnings</p>
                    <p className="text-2xl font-bold text-text-dark">
                      <AnimatedCounter value={user?.totalKarmaEarned || 0} /> credits earned
                    </p>
                  </div>
                </div>
                <div className="text-sm text-text/50">
                  <span className="font-semibold text-accent">{earnableSurveys.length}</span> surveys available
                </div>
              </motion.div>

              {loadingAvailable ? (
                <div className="flex justify-center py-12">
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-accent"></div>
                </div>
              ) : earnableSurveys.length === 0 ? (
                <FadeIn className="glass-light rounded-2xl p-12 text-center">
                  <p className="text-text-dark mb-2">No surveys available right now.</p>
                  <p className="text-text/50 text-sm">Check back soon.</p>
                </FadeIn>
              ) : (
                <StaggerContainer className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4" staggerDelay={0.08}>
                  {earnableSurveys.map((survey) => (
                    <StaggerItem key={survey._id || survey.id}>
                      <SurveyCard survey={survey} onComplete={handleComplete} currentUser={user} completing={completing} />
                    </StaggerItem>
                  ))}
                </StaggerContainer>
              )}
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}
