import { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import API from '../api/axios';
import { FaBolt, FaClipboardCheck, FaCalendar } from 'react-icons/fa';
import {
  StaggerContainer,
  StaggerItem,
  AnimatedCounter,
  FadeIn,
  motion,
  AnimatePresence,
} from '../components/animations';

export default function Profile() {
  const { user, refreshUser } = useAuth();
  const [name, setName] = useState(user?.name || '');
  const [email, setEmail] = useState(user?.email || '');
  const [loading, setLoading] = useState(false);
  const [alert, setAlert] = useState(null);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setAlert(null);
    try {
      await API.put('/users/profile', { name, email });
      await refreshUser();
      setAlert({ type: 'success', message: 'Profile updated successfully' });
    } catch (err) {
      setAlert({ type: 'error', message: err.response?.data?.message || 'Failed to update profile' });
    } finally {
      setLoading(false);
      setTimeout(() => setAlert(null), 4000);
    }
  };

  const memberSince = user?.createdAt
    ? new Date(user.createdAt).toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })
    : '';

  return (
    <div className="min-h-[calc(100vh-200px)] bg-bg py-8">
      <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8">
        <FadeIn>
          <h1 className="text-3xl font-bold mb-8 text-text-dark">Profile</h1>
        </FadeIn>

        <AnimatePresence>
          {alert && (
            <motion.div
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              className={`mb-6 px-4 py-3 rounded-xl text-sm font-medium ${
                alert.type === 'success'
                  ? 'bg-green-500/10 text-green-400 border border-green-500/20'
                  : 'bg-red-500/10 text-red-400 border border-red-500/20'
              }`}
            >
              {alert.message}
            </motion.div>
          )}
        </AnimatePresence>

        {/* Stats */}
        <StaggerContainer className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-8" staggerDelay={0.1}>
          {[
            { icon: <FaBolt className="text-accent text-lg" />, iconBg: 'bg-accent/15 border-accent/20', value: user?.karma || 0, label: 'Credit Balance' },
            { icon: <FaClipboardCheck className="text-green-400 text-lg" />, iconBg: 'bg-green-500/15 border-green-500/20', value: user?.surveysCompleted || 0, label: 'Surveys Completed' },
            { icon: <FaBolt className="text-primary text-lg" />, iconBg: 'bg-primary/15 border-primary/20', value: user?.totalKarmaEarned || 0, label: 'Total Credits Earned' },
          ].map((stat) => (
            <StaggerItem key={stat.label}>
              <motion.div
                whileHover={{ y: -3 }}
                transition={{ type: 'spring', stiffness: 300, damping: 20 }}
                className="glass-light rounded-2xl p-5 text-center"
              >
                <div className={`w-10 h-10 ${stat.iconBg} rounded-xl flex items-center justify-center mx-auto mb-2 border`}>
                  {stat.icon}
                </div>
                <AnimatedCounter value={stat.value} className="text-2xl font-bold text-text-dark block" />
                <div className="text-text/50 text-sm">{stat.label}</div>
              </motion.div>
            </StaggerItem>
          ))}
        </StaggerContainer>

        {/* Edit Form */}
        <FadeIn delay={0.1}>
          <div className="glass-light rounded-2xl p-6 mb-8">
            <h2 className="text-xl font-bold mb-6 text-text-dark">Edit Profile</h2>
            <form onSubmit={handleSubmit} className="space-y-5">
              <div>
                <label className="block text-sm font-medium text-text-dark mb-1.5">Name</label>
                <input
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  required
                  className="w-full px-4 py-3 bg-text-dark/5 border border-border/30 rounded-xl text-text-dark placeholder-text/30 focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary transition-colors"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-text-dark mb-1.5">Email</label>
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                  className="w-full px-4 py-3 bg-text-dark/5 border border-border/30 rounded-xl text-text-dark placeholder-text/30 focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary transition-colors"
                />
              </div>
              <motion.button
                type="submit"
                disabled={loading}
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.97 }}
                transition={{ type: 'spring', stiffness: 400, damping: 15 }}
                className="bg-gradient-to-r from-primary to-primary-dark text-white px-6 py-3 rounded-xl font-semibold disabled:opacity-50 cursor-pointer border-none"
              >
                {loading ? 'Saving...' : 'Save Changes'}
              </motion.button>
            </form>
          </div>
        </FadeIn>

        {/* Account Info */}
        <FadeIn delay={0.15}>
          <div className="glass-light rounded-2xl p-6">
            <h2 className="text-xl font-bold mb-4 text-text-dark">Account Info</h2>
            <div className="flex items-center gap-2 text-text/60">
              <FaCalendar className="text-text/30" />
              <span>Member since {memberSince}</span>
            </div>
          </div>
        </FadeIn>
      </div>
    </div>
  );
}
