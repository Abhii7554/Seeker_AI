import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import axios from 'axios';
import { User, Mail, Lock, Tags, Briefcase, User as UserIcon, ArrowRight, Check } from 'lucide-react';

export default function Register() {
  const [formData, setFormData] = useState({ name: '', email: '', password: '', role: 'seeker', skills: '' });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleRegister = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      await axios.post('http://localhost:5000/api/register', formData);
      navigate('/login');
    } catch (err) {
      setError(err.response?.data?.message || 'Registration failed');
      setLoading(false);
    }
  };

  return (
    <div className="relative flex items-center justify-center min-h-screen py-10 bg-background overflow-hidden">
      {/* Abstract Background */}
      <div className="absolute inset-0 z-0">
        <div className="absolute inset-0 bg-grid-pattern opacity-30 mix-blend-overlay"></div>
        <div className="absolute top-[-10%] right-[-10%] w-[50%] h-[50%] bg-primary-600/10 rounded-full blur-[120px]"></div>
        <div className="absolute bottom-[-10%] left-[-10%] w-[50%] h-[50%] bg-accent-600/10 rounded-full blur-[120px]"></div>
      </div>

      <div className="z-10 w-full max-w-md p-8 m-4 rounded-3xl glass animate-slide-up">
        <div className="text-center mb-10">
          <div className="inline-flex items-center justify-center h-16 w-16 rounded-2xl bg-zinc-800/50 border border-white/10 mb-6 shadow-2xl">
             <div className="h-8 w-8 bg-gradient-to-tr from-accent-500 to-primary-500 rounded-xl rotate-12 flex items-center justify-center">
                <div className="h-3 w-3 bg-white rounded-sm -rotate-12"></div>
             </div>
          </div>
          <h1 className="text-3xl font-bold text-white tracking-tight mb-2">Create Account</h1>
          <p className="text-zinc-400">Join the intelligent job network</p>
        </div>
        
        {error && (
          <div className="bg-red-500/10 border border-red-500/20 text-red-400 px-4 py-3 rounded-xl mb-6 text-sm flex items-center gap-2">
            <div className="h-1.5 w-1.5 rounded-full bg-red-500"></div>{error}
          </div>
        )}
        
        <form onSubmit={handleRegister} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-zinc-300 mb-1.5 ml-1">Full Name</label>
            <div className="relative group">
              <User className="absolute left-3.5 top-1/2 -translate-y-1/2 text-zinc-500 h-5 w-5 group-focus-within:text-accent-400 transition-colors" />
              <input type="text" required
                className="w-full pl-11 pr-4 py-3 bg-zinc-900/50 border border-zinc-700/50 rounded-xl focus:ring-1 focus:ring-accent-500 focus:border-accent-500 text-white placeholder-zinc-600 outline-none transition-all"
                placeholder="Jane Doe" value={formData.name} onChange={e => setFormData({...formData, name: e.target.value})}
              />
            </div>
          </div>
          
          <div>
            <label className="block text-sm font-medium text-zinc-300 mb-1.5 ml-1">Email</label>
            <div className="relative group">
              <Mail className="absolute left-3.5 top-1/2 -translate-y-1/2 text-zinc-500 h-5 w-5 group-focus-within:text-accent-400 transition-colors" />
              <input type="email" required
                className="w-full pl-11 pr-4 py-3 bg-zinc-900/50 border border-zinc-700/50 rounded-xl focus:ring-1 focus:ring-accent-500 focus:border-accent-500 text-white placeholder-zinc-600 outline-none transition-all"
                placeholder="you@example.com" value={formData.email} onChange={e => setFormData({...formData, email: e.target.value})}
              />
            </div>
          </div>
          
          <div>
            <label className="block text-sm font-medium text-zinc-300 mb-1.5 ml-1">Password</label>
            <div className="relative group">
              <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 text-zinc-500 h-5 w-5 group-focus-within:text-accent-400 transition-colors" />
              <input type="password" required
                className="w-full pl-11 pr-4 py-3 bg-zinc-900/50 border border-zinc-700/50 rounded-xl focus:ring-1 focus:ring-accent-500 focus:border-accent-500 text-white placeholder-zinc-600 outline-none transition-all"
                placeholder="••••••••" value={formData.password} onChange={e => setFormData({...formData, password: e.target.value})}
              />
            </div>
          </div>

          <div className="pt-2">
            <label className="block text-sm font-medium text-zinc-300 mb-2 ml-1">I want to...</label>
            <div className="grid grid-cols-2 gap-3">
              <button type="button" 
                onClick={() => setFormData({...formData, role: 'seeker'})}
                className={`relative py-3 px-4 rounded-xl border flex flex-col items-center justify-center gap-1 transition-all ${
                  formData.role === 'seeker' 
                  ? 'bg-zinc-800/80 border-accent-500 shadow-[0_0_15px_rgba(168,85,247,0.15)]' 
                  : 'bg-zinc-900/30 border-zinc-700/50 text-zinc-400 hover:bg-zinc-800/50'
                }`}>
                {formData.role === 'seeker' && <div className="absolute top-2 right-2 h-4 w-4 bg-accent-500 rounded-full flex items-center justify-center"><Check size={10} className="text-white"/></div>}
                <UserIcon className={`h-5 w-5 ${formData.role === 'seeker' ? 'text-accent-400' : ''}`}/> 
                <span className={`text-sm font-medium ${formData.role === 'seeker' ? 'text-white' : ''}`}>Find a Job</span>
              </button>
              
              <button type="button" 
                onClick={() => setFormData({...formData, role: 'employer'})}
                className={`relative py-3 px-4 rounded-xl border flex flex-col items-center justify-center gap-1 transition-all ${
                  formData.role === 'employer' 
                  ? 'bg-zinc-800/80 border-primary-500 shadow-[0_0_15px_rgba(99,102,241,0.15)]' 
                  : 'bg-zinc-900/30 border-zinc-700/50 text-zinc-400 hover:bg-zinc-800/50'
                }`}>
                {formData.role === 'employer' && <div className="absolute top-2 right-2 h-4 w-4 bg-primary-500 rounded-full flex items-center justify-center"><Check size={10} className="text-white"/></div>}
                <Briefcase className={`h-5 w-5 ${formData.role === 'employer' ? 'text-primary-400' : ''}`}/> 
                <span className={`text-sm font-medium ${formData.role === 'employer' ? 'text-white' : ''}`}>Hire Talent</span>
              </button>
            </div>
          </div>

          {formData.role === 'seeker' && (
            <div className="animate-fade-in pt-2">
              <label className="block text-sm font-medium text-zinc-300 mb-1.5 ml-1">My Skills</label>
              <div className="relative group">
                <Tags className="absolute left-3.5 top-3.5 text-zinc-500 h-5 w-5 group-focus-within:text-accent-400 transition-colors" />
                <textarea 
                  className="w-full pl-11 pr-4 py-3 bg-zinc-900/50 border border-zinc-700/50 rounded-xl focus:ring-1 focus:ring-accent-500 focus:border-accent-500 text-white placeholder-zinc-600 outline-none transition-all resize-none"
                  placeholder="React, Node.js, Python, Marketing (Comma separated)" 
                  rows="2"
                  value={formData.skills} onChange={e => setFormData({...formData, skills: e.target.value})}
                ></textarea>
              </div>
            </div>
          )}
          
          <button type="submit" disabled={loading} className="w-full flex items-center justify-center gap-2 bg-white hover:bg-zinc-200 text-zinc-900 font-semibold py-3 rounded-xl transition-all mt-6">
            {loading ? <div className="h-5 w-5 border-2 border-zinc-400 border-t-zinc-900 rounded-full animate-spin"></div> : <>Create Account <ArrowRight size={18} /></>}
          </button>
        </form>
        
        <p className="mt-8 text-center text-zinc-400 text-sm">
          Already have an account? <Link to="/login" className="text-white hover:text-accent-400 transition-colors font-medium">Log in</Link>
        </p>
      </div>
    </div>
  );
}
