import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { LogIn, UserPlus, Eye, EyeOff, Shield, Zap, Target, Lock, Loader2 } from 'lucide-react';
import api from '../services/api';
import { useAuth } from '../context/AuthContext';
import { useTheme } from '../context/ThemeContext';

export default function Auth() {
  const [isLogin, setIsLogin] = useState(true);
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const navigate = useNavigate();
  const { login } = useAuth();
  const { theme } = useTheme();

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!username || !password) {
      setError('Username and password are required');
      return;
    }

    setError('');
    setIsLoading(true);

    try {
      const formData = new URLSearchParams();
      formData.append('username', username);
      formData.append('password', password);

      if (isLogin) {
        const response = await api.post('/login', formData, {
          headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
        });

        const { access_token } = response.data;
        login({ username }, access_token);
        navigate('/');
      } else {
        await api.post('/signup', formData, {
          headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
        });

        // Auto login after signup
        const response = await api.post('/login', formData, {
          headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
        });

        const { access_token } = response.data;
        login({ username }, access_token);
        navigate('/');
      }
    } catch (err) {
      if (err.response?.status === 400) {
        setError(err.response.data?.detail || 'User already exists');
      } else if (err.response?.status === 401) {
        setError('Invalid username or password');
      } else {
        setError('Service unavailable. Verify backend connection.');
      }
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className={`fixed inset-0 w-screen h-screen overflow-hidden transition-colors duration-500 ${theme === 'dark' ? 'bg-slate-950' : 'bg-slate-50'}`}>
      {/* Background Gradients */}
      <div className="absolute inset-0 pointer-events-none">
        <div className={`absolute -top-32 -left-32 w-[500px] h-[500px] rounded-full blur-[120px] ${theme === 'dark' ? 'bg-indigo-500/10' : 'bg-indigo-500/5'}`}></div>
        <div className={`absolute top-1/2 -right-32 w-[600px] h-[600px] rounded-full blur-[140px] -translate-y-1/2 ${theme === 'dark' ? 'bg-blue-500/10' : 'bg-blue-500/5'}`}></div>
      </div>

      <div className="relative h-full flex items-center justify-center px-4">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className={`w-full max-w-[1000px] grid grid-cols-1 md:grid-cols-2 rounded-[40px] overflow-hidden shadow-2xl border ${theme === 'dark' ? 'bg-slate-900/40 border-slate-800/60 backdrop-blur-xl' : 'bg-white border-slate-200 shadow-slate-200/50'
            }`}
        >
          {/* Brand Panel */}
          <div className="hidden md:flex flex-col justify-between p-12 bg-indigo-600 relative overflow-hidden">
            {/* Decorative pattern */}
            <div className="absolute inset-0 opacity-10" style={{
              backgroundImage: 'radial-gradient(circle at 2px 2px, white 1px, transparent 0)',
              backgroundSize: '24px 24px'
            }} />

            <div className="relative z-10">
              <div className="flex items-center gap-3 mb-8">
                <div className="bg-white p-2 rounded-xl">
                  <Eye className="text-indigo-600 w-6 h-6" />
                </div>
                <h2 className="text-2xl font-black text-white tracking-tighter">VisionGuard AI</h2>
              </div>

              <h1 className="text-4xl font-black text-white leading-tight mb-6">
                Real-Time <br />
                <span className="text-indigo-200">AI Image Detection</span>
              </h1>

              <div className="space-y-6">
                {[
                  { icon: Zap, text: 'Ultra-low latency inference engine' },
                  { icon: Shield, text: 'Advanced AI Artifact Analysis' },
                  { icon: Lock, text: 'Enterprise-grade session security' }
                ].map((item, i) => (
                  <div key={i} className="flex items-center gap-4 text-indigo-100">
                    <div className="w-8 h-8 rounded-lg bg-white/10 flex items-center justify-center">
                      <item.icon size={16} />
                    </div>
                    <span className="text-sm font-bold uppercase tracking-widest">{item.text}</span>
                  </div>
                ))}
              </div>
            </div>

            <div className="relative z-10 pt-12">
              <div className="p-4 bg-white/10 rounded-2xl backdrop-blur-md border border-white/20">
                <p className="text-[10px] font-black text-indigo-100 uppercase tracking-widest leading-loose">
                  System Status: <span className="text-emerald-300">Operational</span> <br />
                  Core Version: <span className="text-white">v8.2.0-STABLE</span>
                </p>
              </div>
            </div>
          </div>

          {/* Form Panel */}
          <div className="p-8 md:p-12 flex flex-col justify-center">
            <div className="mb-8">
              <h2 className={`text-3xl font-black tracking-tight mb-2 ${theme === 'dark' ? 'text-white' : 'text-slate-900'}`}>
                {isLogin ? 'Access Portal' : 'Register Account'}
              </h2>
              <p className={`text-sm font-medium ${theme === 'dark' ? 'text-slate-500' : 'text-slate-400'}`}>
                Secure authentication for system administrators
              </p>
            </div>

            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="space-y-4">
                <div className="space-y-1.5">
                  <label className={`text-[10px] font-black uppercase tracking-widest ml-1 ${theme === 'dark' ? 'text-slate-500' : 'text-slate-400'}`}>
                    Identity Signature
                  </label>
                  <div className="relative">
                    <UserPlus className={`absolute left-4 top-1/2 -translate-y-1/2 ${theme === 'dark' ? 'text-slate-600' : 'text-slate-400'}`} size={18} />
                    <input
                      type="text"
                      value={username}
                      onChange={(e) => setUsername(e.target.value)}
                      placeholder="Username"
                      disabled={isLoading}
                      className={`w-full pl-12 pr-4 py-4 rounded-2xl border outline-none transition-all font-bold text-sm ${theme === 'dark'
                        ? 'bg-slate-950/50 border-slate-800 text-white focus:border-indigo-500/50 focus:bg-slate-950'
                        : 'bg-slate-50 border-slate-200 text-slate-900 focus:border-indigo-500 focus:bg-white'
                        }`}
                    />
                  </div>
                </div>

                <div className="space-y-1.5">
                  <label className={`text-[10px] font-black uppercase tracking-widest ml-1 ${theme === 'dark' ? 'text-slate-500' : 'text-slate-400'}`}>
                    Access Credential
                  </label>
                  <div className="relative">
                    <Lock className={`absolute left-4 top-1/2 -translate-y-1/2 ${theme === 'dark' ? 'text-slate-600' : 'text-slate-400'}`} size={18} />
                    <input
                      type={showPassword ? 'text' : 'password'}
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      placeholder="Password"
                      disabled={isLoading}
                      className={`w-full pl-12 pr-12 py-4 rounded-2xl border outline-none transition-all font-bold text-sm ${theme === 'dark'
                        ? 'bg-slate-950/50 border-slate-800 text-white focus:border-indigo-500/50 focus:bg-slate-950'
                        : 'bg-slate-50 border-slate-200 text-slate-900 focus:border-indigo-500 focus:bg-white'
                        }`}
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-500 hover:text-indigo-500 transition-colors"
                    >
                      {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                    </button>
                  </div>
                </div>
              </div>

              <AnimatePresence mode="wait">
                {error && (
                  <motion.div
                    initial={{ opacity: 0, x: -10 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: 10 }}
                    className="p-4 bg-red-500/10 border border-red-500/20 rounded-2xl flex items-center gap-3"
                  >
                    <div className="w-2 h-2 rounded-full bg-red-500 animate-pulse" />
                    <span className="text-xs font-bold text-red-500 uppercase tracking-widest">{error}</span>
                  </motion.div>
                )}
              </AnimatePresence>

              <button
                type="submit"
                disabled={isLoading}
                className="w-full py-4 bg-indigo-600 hover:bg-indigo-700 text-white font-black rounded-2xl shadow-xl shadow-indigo-500/20 transition-all active:scale-[0.98] disabled:opacity-50 flex items-center justify-center gap-3 group"
              >
                {isLoading ? (
                  <Loader2 className="w-5 h-5 animate-spin" />
                ) : (
                  <>
                    <span className="uppercase tracking-[0.2em] text-xs">Authorize Session</span>
                    <LogIn size={18} className="group-hover:translate-x-1 transition-transform" />
                  </>
                )}
              </button>

              <div className="pt-6 text-center">
                <button
                  type="button"
                  onClick={() => {
                    setIsLogin(!isLogin);
                    setError('');
                  }}
                  disabled={isLoading}
                  className={`text-[10px] font-black uppercase tracking-widest transition-colors ${theme === 'dark' ? 'text-slate-500 hover:text-indigo-400' : 'text-slate-400 hover:text-indigo-600'
                    }`}
                >
                  {isLogin ? "Request New Credentials" : "Return to Secure Login"}
                </button>
              </div>
            </form>
          </div>
        </motion.div>
      </div>
    </div>
  );
}
