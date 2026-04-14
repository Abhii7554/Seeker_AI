import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import axios from 'axios';
import { Mail, Lock, LogIn, ArrowRight } from 'lucide-react';

export default function Login() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleLogin = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    try {
      const res = await axios.post('http://localhost:5000/api/login', { email, password });
      localStorage.setItem('token', res.data.token);
      localStorage.setItem('userId', res.data.user.id);
      localStorage.setItem('role', res.data.user.role);
      
      setTimeout(() => {
        if (res.data.user.role === 'employer') {
          navigate('/employer');
        } else {
          navigate('/seeker');
        }
      }, 400); // slight delay for smooth transition feel
    } catch (err) {
      setError(err.response?.data?.message || 'Login failed');
      setLoading(false);
    }
  };

  return (
    <div className="relative flex items-center justify-center min-h-screen bg-background overflow-hidden">
      {/* Abstract Background */}
      <div className="absolute inset-0 z-0">
        <div className="absolute inset-0 bg-grid-pattern opacity-30 mix-blend-overlay"></div>
        <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] bg-primary-600/20 rounded-full blur-[120px]"></div>
        <div className="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] bg-accent-600/20 rounded-full blur-[120px]"></div>
      </div>

      <div className="z-10 w-full max-w-md p-8 m-4 rounded-3xl glass animate-slide-up">
        <div className="text-center mb-10">
          <div className="inline-flex items-center justify-center h-16 w-16 rounded-2xl bg-zinc-800/50 border border-white/10 mb-6 shadow-2xl">
            <div className="h-8 w-8 bg-gradient-to-tr from-primary-500 to-accent-500 rounded-xl rotate-12 flex items-center justify-center">
              <div className="h-3 w-3 bg-white rounded-sm -rotate-12"></div>
            </div>
          </div>
          <h1 className="text-3xl font-bold text-white tracking-tight mb-2">Welcome Back</h1>
          <p className="text-zinc-400">Sign in to the AI Job Network</p>
        </div>
        
        {error && (
          <div className="bg-red-500/10 border border-red-500/20 text-red-400 px-4 py-3 rounded-xl mb-6 text-sm flex items-center gap-2">
            <div className="h-1.5 w-1.5 rounded-full bg-red-500"></div>
            {error}
          </div>
        )}
        
        <form onSubmit={handleLogin} className="space-y-5">
          <div>
            <label className="block text-sm font-medium text-zinc-300 mb-1.5 ml-1">Email Address</label>
            <div className="relative group">
              <Mail className="absolute left-3.5 top-1/2 -translate-y-1/2 text-zinc-500 h-5 w-5 group-focus-within:text-primary-400 transition-colors" />
              <input 
                type="email" required
                className="w-full pl-11 pr-4 py-3 bg-zinc-900/50 border border-zinc-700/50 rounded-xl focus:ring-1 focus:ring-primary-500 focus:border-primary-500 text-white placeholder-zinc-600 transition-all outline-none"
                placeholder="you@example.com"
                value={email} onChange={e => setEmail(e.target.value)}
              />
            </div>
          </div>
          
          <div>
            <label className="block text-sm font-medium text-zinc-300 mb-1.5 ml-1 flex justify-between">
              Password
            </label>
            <div className="relative group">
              <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 text-zinc-500 h-5 w-5 group-focus-within:text-primary-400 transition-colors" />
              <input 
                type="password" required
                className="w-full pl-11 pr-4 py-3 bg-zinc-900/50 border border-zinc-700/50 rounded-xl focus:ring-1 focus:ring-primary-500 focus:border-primary-500 text-white placeholder-zinc-600 transition-all outline-none"
                placeholder="••••••••"
                value={password} onChange={e => setPassword(e.target.value)}
              />
            </div>
          </div>
          
          <button 
            type="submit" disabled={loading}
            className="w-full flex items-center justify-center gap-2 bg-zinc-100 hover:bg-white text-zinc-900 font-semibold py-3 rounded-xl transition-all mt-4 disabled:opacity-70 disabled:cursor-not-allowed group relative overflow-hidden"
          >
            {loading ? (
              <div className="h-5 w-5 border-2 border-zinc-400 border-t-zinc-900 rounded-full animate-spin"></div>
            ) : (
              <>
                Sign In
                <ArrowRight className="h-4 w-4 group-hover:translate-x-1 transition-transform" />
              </>
            )}
          </button>
        </form>
        
        <p className="mt-8 text-center text-zinc-400 text-sm">
          New to the network? <Link to="/register" className="text-white hover:text-primary-400 transition-colors font-medium">Create an account</Link>
        </p>
      </div>
    </div>
  );
}
