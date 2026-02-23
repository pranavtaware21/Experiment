import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { GoogleLogin } from '@react-oauth/google';
import { useAuth } from '../context/AuthContext';
import { FadeIn, StaggerContainer, StaggerItem, motion } from '../components/animations';

export default function Login() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const { login, googleLogin } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      await login(email, password);
      navigate('/dashboard');
    } catch (err) {
      setError(err.response?.data?.message || 'Login failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-[calc(100vh-200px)] flex items-center justify-center bg-bg px-4 py-12 relative overflow-hidden">
      {/* Background orbs */}
      <div className="absolute top-20 left-1/4 w-64 h-64 bg-primary/20 rounded-full blur-[100px] animate-float" />
      <div className="absolute bottom-20 right-1/4 w-48 h-48 bg-accent/10 rounded-full blur-[80px] animate-float-delayed" />

      <FadeIn scale className="w-full max-w-md relative z-10">
        <div className="glass-light rounded-2xl p-8 glow-sm">
          <h1 className="text-3xl font-bold text-center mb-2 text-text-dark">Welcome Back</h1>
          <p className="text-text/60 text-center mb-8">Log in to your SurveySwap account</p>

          {error && (
            <motion.div
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              className="bg-red-500/10 text-red-400 border border-red-500/20 px-4 py-3 rounded-xl mb-6 text-sm"
            >
              {error}
            </motion.div>
          )}

          <form onSubmit={handleSubmit}>
            <StaggerContainer className="space-y-5" staggerDelay={0.06} delay={0.05}>
              <StaggerItem>
                <label className="block text-sm font-medium text-text-dark mb-1.5">Email</label>
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                  className="w-full px-4 py-3 bg-text-dark/5 border border-border/30 rounded-xl text-text-dark placeholder-text/30 focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary transition-colors"
                  placeholder="you@example.com"
                />
              </StaggerItem>
              <StaggerItem>
                <label className="block text-sm font-medium text-text-dark mb-1.5">Password</label>
                <input
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                  className="w-full px-4 py-3 bg-text-dark/5 border border-border/30 rounded-xl text-text-dark placeholder-text/30 focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary transition-colors"
                  placeholder="Enter your password"
                />
              </StaggerItem>
              <StaggerItem>
                <motion.button
                  type="submit"
                  disabled={loading}
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.97 }}
                  transition={{ type: 'spring', stiffness: 400, damping: 15 }}
                  className="w-full bg-gradient-to-r from-primary to-primary-dark text-white py-3 rounded-xl font-semibold disabled:opacity-50 cursor-pointer border-none"
                >
                  {loading ? 'Logging in...' : 'Log In'}
                </motion.button>
              </StaggerItem>
            </StaggerContainer>
          </form>

          <FadeIn delay={0.2}>
            <div className="flex items-center my-6">
              <div className="flex-1 border-t border-border/30"></div>
              <span className="px-4 text-sm text-text/40">or</span>
              <div className="flex-1 border-t border-border/30"></div>
            </div>

            <div className="flex justify-center">
              <GoogleLogin
                onSuccess={async (response) => {
                  setError('');
                  try {
                    await googleLogin(response.credential);
                    navigate('/dashboard');
                  } catch (err) {
                    setError(err.response?.data?.message || 'Google login failed');
                  }
                }}
                onError={() => setError('Google login failed')}
              />
            </div>

            <p className="text-center text-text/60 mt-6">
              Don't have an account?{' '}
              <Link to="/signup" className="text-primary font-medium no-underline hover:underline">
                Sign Up
              </Link>
            </p>
          </FadeIn>
        </div>
      </FadeIn>
    </div>
  );
}
