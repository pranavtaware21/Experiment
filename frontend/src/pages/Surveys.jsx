import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import API from '../api/axios';
import SurveyCard from '../components/SurveyCard';
import { FaPlus, FaBolt, FaClipboardCheck, FaUsers } from 'react-icons/fa';
import {
  StaggerContainer,
  StaggerItem,
  FadeIn,
  motion,
  AnimatePresence,
} from '../components/animations';

export default function Surveys() {
  const navigate = useNavigate();
  const { user, refreshUser } = useAuth();
  const [surveys, setSurveys] = useState([]);
  const [loading, setLoading] = useState(true);
  const [completing, setCompleting] = useState(null);
  const [filter, setFilter] = useState('all');
  const [alert, setAlert] = useState(null);

  useEffect(() => { fetchSurveys(); }, []);

  const fetchSurveys = async () => {
    try {
      const res = await API.get('/surveys');
      setSurveys(res.data.surveys);
    } catch { /* ignore */ } finally { setLoading(false); }
  };

  const handleComplete = async (surveyId) => {
    setCompleting(surveyId);
    try {
      const res = await API.post(`/surveys/${surveyId}/complete`);
      setAlert({ type: 'success', message: res.data.message });
      await fetchSurveys();
      await refreshUser();
    } catch (err) {
      setAlert({ type: 'error', message: err.response?.data?.message || 'Failed to complete survey' });
    } finally {
      setCompleting(null);
      setTimeout(() => setAlert(null), 4000);
    }
  };

  const filtered = surveys.filter((s) => {
    if (filter === 'short') return s.duration <= 3;
    if (filter === 'medium') return s.duration > 3 && s.duration <= 10;
    if (filter === 'long') return s.duration > 10;
    return true;
  });

  const filters = [
    { key: 'all', label: 'All Surveys' },
    { key: 'short', label: 'Quick (1-3 min)' },
    { key: 'medium', label: 'Medium (4-10 min)' },
    { key: 'long', label: 'Detailed (10+ min)' },
  ];

  return (
    <div className="min-h-[calc(100vh-200px)] bg-bg py-6 md:py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <FadeIn>
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-6">
            <div>
              <h1 className="text-2xl md:text-3xl font-bold mb-1 text-text-dark">Earn Credits</h1>
              <p className="text-text/70 text-sm">Complete surveys to earn credits for your own research.</p>
            </div>
            {user && (
              <motion.button
                onClick={() => navigate('/add-survey')}
                whileHover={{ scale: 1.03 }}
                whileTap={{ scale: 0.97 }}
                transition={{ type: 'spring', stiffness: 400, damping: 15 }}
                className="flex items-center gap-2 bg-gradient-to-r from-primary to-primary-dark text-white px-5 py-2.5 rounded-xl font-medium border-none cursor-pointer"
              >
                <FaPlus size={12} /> Post Your Survey
              </motion.button>
            )}
          </div>
        </FadeIn>

        {/* Live stats */}
        <FadeIn delay={0.03}>
          <div className="glass-light rounded-xl p-3 flex items-center justify-between mb-5 flex-wrap gap-2">
            <div className="flex items-center gap-5 text-sm">
              <span className="flex items-center gap-1.5 text-text/60">
                <span className="w-2 h-2 bg-green-500 rounded-full animate-pulse" />
                <strong className="text-text-dark">{surveys.length}</strong> surveys active
              </span>
              <span className="hidden sm:flex items-center gap-1.5 text-text/60">
                <FaUsers className="text-primary" size={12} />
                <strong className="text-text-dark">342</strong> online
              </span>
            </div>
            {user && (
              <span className="flex items-center gap-1.5 bg-primary/15 text-primary px-3 py-1 rounded-full text-sm font-semibold border border-primary/20">
                <FaBolt size={12} /> {user.karma} credits
              </span>
            )}
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

        {/* Filter buttons with sliding active indicator */}
        <FadeIn delay={0.06}>
          <div className="flex items-center gap-2 mb-5 flex-wrap relative">
            {filters.map((f) => (
              <motion.button
                key={f.key}
                onClick={() => setFilter(f.key)}
                whileHover={{ scale: 1.04 }}
                whileTap={{ scale: 0.96 }}
                className={`px-4 py-1.5 rounded-lg text-sm font-medium border-none cursor-pointer transition-colors relative ${
                  filter === f.key
                    ? 'bg-primary text-white shadow-sm shadow-primary/20'
                    : 'bg-text-dark/5 text-text/70 hover:bg-text-dark/10 hover:text-text-dark'
                }`}
              >
                {filter === f.key && (
                  <motion.div
                    layoutId="activeFilter"
                    className="absolute inset-0 bg-primary rounded-lg"
                    style={{ zIndex: -1 }}
                    transition={{ type: 'spring', stiffness: 400, damping: 30 }}
                  />
                )}
                {f.label}
              </motion.button>
            ))}
          </div>
        </FadeIn>

        {loading ? (
          <div className="flex items-center justify-center py-20">
            <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-primary"></div>
          </div>
        ) : filtered.length === 0 ? (
          <FadeIn className="text-center py-16 glass-light rounded-2xl">
            <div className="w-14 h-14 bg-primary/15 rounded-2xl flex items-center justify-center mx-auto mb-4 border border-primary/20">
              <FaClipboardCheck className="text-primary text-xl" />
            </div>
            <p className="text-text-dark font-medium mb-2">No surveys match this filter</p>
            <p className="text-text/60 text-sm mb-4">Try a different filter or check back later.</p>
          </FadeIn>
        ) : (
          <StaggerContainer className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4" staggerDelay={0.07}>
            {filtered.map((survey) => (
              <StaggerItem key={survey._id || survey.id}>
                <SurveyCard survey={survey} onComplete={handleComplete} currentUser={user} completing={completing} />
              </StaggerItem>
            ))}
          </StaggerContainer>
        )}
      </div>
    </div>
  );
}
