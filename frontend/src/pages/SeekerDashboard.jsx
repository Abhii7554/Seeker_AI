import { useState, useEffect } from 'react';
import axios from 'axios';
import { format } from 'date-fns';
import { Briefcase, Sparkles, CheckCircle, Search, Clock, LogOut, MessageSquare, Flame, User } from 'lucide-react';
import Chat from '../components/Chat';
import { useNavigate } from 'react-router-dom';

export default function SeekerDashboard() {
  const [activeTab, setActiveTab] = useState('recommendations');
  const [jobs, setJobs] = useState([]);
  const [recommendedJobs, setRecommendedJobs] = useState([]);
  const [applications, setApplications] = useState([]);
  const [chatUser, setChatUser] = useState(null);
  const [animateCards, setAnimateCards] = useState(true);
  const [userProfile, setUserProfile] = useState(null);
  const [isEditingSkills, setIsEditingSkills] = useState(false);
  const [newSkillsInput, setNewSkillsInput] = useState('');
  
  const token = localStorage.getItem('token');
  const navigate = useNavigate();

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      const [jobsRes, recsRes, appsRes, userRes] = await Promise.all([
        axios.get('http://localhost:5000/api/jobs', { headers: { Authorization: `Bearer ${token}` } }),
        axios.get('http://localhost:5000/api/jobs/recommendations', { headers: { Authorization: `Bearer ${token}` } }),
        axios.get('http://localhost:5000/api/applications/me', { headers: { Authorization: `Bearer ${token}` } }),
        axios.get('http://localhost:5000/api/users/me', { headers: { Authorization: `Bearer ${token}` } })
      ]);
      
      setJobs(jobsRes.data);
      setRecommendedJobs(recsRes.data);
      setApplications(appsRes.data);
      setUserProfile(userRes.data);
      setNewSkillsInput(userRes.data.skills?.join(', ') || '');
    } catch (err) {
      console.error('Error fetching dashboard data', err);
    }
  };

  const handleApply = async (jobId) => {
    try {
      await axios.post('http://localhost:5000/api/applications', { jobId }, { headers: { Authorization: `Bearer ${token}` } });
      const appsRes = await axios.get('http://localhost:5000/api/applications/me', { headers: { Authorization: `Bearer ${token}` } });
      setApplications(appsRes.data);
    } catch (err) {
      alert(err.response?.data?.message || 'Failed to apply');
    }
  };

  const hasApplied = (jobId) => applications.some(app => app.jobId?._id === jobId);

  const handleUpdateSkills = async () => {
    try {
      const res = await axios.put('http://localhost:5000/api/users/skills', { skills: newSkillsInput }, { headers: { Authorization: `Bearer ${token}` } });
      setUserProfile({ ...userProfile, skills: res.data.skills });
      setIsEditingSkills(false);
      
      // Refresh recommendations based on new skills
      const recsRes = await axios.get('http://localhost:5000/api/jobs/recommendations', { headers: { Authorization: `Bearer ${token}` } });
      setRecommendedJobs(recsRes.data);
    } catch (err) {
      alert(err.response?.data?.error || 'Failed to update skills');
    }
  };

  const switchTab = (tab) => {
    setAnimateCards(false);
    setTimeout(() => {
       setActiveTab(tab);
       setAnimateCards(true);
    }, 50);
  };

  const renderJobCard = (job, isRecommended = false, idx = 0) => (
    <div key={job._id} style={{ animationDelay: `${idx * 0.1}s` }} className={`glass-card p-6 flex flex-col relative group overflow-hidden ${animateCards ? 'animate-slide-up opacity-0' : ''} ${isRecommended ? 'border-accent-500/30 shadow-[0_4px_30px_rgba(168,85,247,0.1)]' : ''}`}>
      {isRecommended && (
        <div className="absolute top-0 right-0 bg-gradient-to-bl from-accent-500/20 via-primary-500/5 to-transparent p-6 w-full h-full opacity-40 group-hover:opacity-60 transition-opacity pointer-events-none rounded-2xl"></div>
      )}
      
      <div className="flex justify-between items-start mb-5 relative z-10">
        <div>
          <h3 className="text-xl font-bold text-white tracking-tight mb-1 group-hover:text-primary-400 transition-colors">{job.title}</h3>
          <p className="text-sm text-zinc-400 font-medium">{job.employerId?.name || 'Unknown Company'}</p>
        </div>
        {isRecommended && job.matchScore > 0 && (
           <div className="flex items-center gap-1.5 bg-accent-500/10 text-accent-400 px-3 py-1.5 rounded-xl text-xs font-bold border border-accent-500/20 shadow-[0_0_15px_rgba(168,85,247,0.15)] whitespace-nowrap">
             <Flame size={14} className={job.matchScore >= 0.8 ? 'animate-pulse text-orange-400' : ''}/> 
             {Math.round(job.matchScore * 100)}% Match
           </div>
        )}
      </div>
      
      <p className="text-zinc-300 text-sm mb-6 line-clamp-3 leading-relaxed relative z-10">{job.description}</p>
      
      <div className="mb-6 relative z-10 flex-1">
        <h5 className="text-[10px] uppercase font-bold tracking-widest text-zinc-500 mb-3">Required Capabilities</h5>
        <div className="flex flex-wrap gap-2">
          {job.requiredSkills.map((skill, i) => (
            <span key={i} className="bg-zinc-800/80 border border-zinc-700/50 text-zinc-300 px-2.5 py-1 rounded-md text-xs font-medium shadow-sm">
              {skill}
            </span>
          ))}
        </div>
      </div>
      
      <div className="flex items-center justify-between border-t border-zinc-800/80 pt-5 mt-auto relative z-10">
        <span className="text-xs font-medium text-zinc-500 flex items-center gap-1.5"><Clock size={14}/> {format(new Date(job.createdAt), 'MMM d')}</span>
        
        <div className="flex items-center gap-3">
           <button 
             onClick={() => setChatUser({ id: job.employerId._id, name: job.employerId.name })}
             className="h-9 w-9 bg-zinc-800 hover:bg-zinc-700 text-zinc-300 rounded-xl flex items-center justify-center transition-all border border-zinc-700/50 hover:text-white"
             title="Chat with Employer"
           >
             <MessageSquare size={16} />
           </button>
           {hasApplied(job._id) ? (
             <div className="px-4 py-2 bg-success/10 text-success border border-success/20 rounded-xl text-sm font-bold flex items-center gap-2">
               <CheckCircle size={16} /> Applied
             </div>
           ) : (
             <button onClick={() => handleApply(job._id)} className="px-5 py-2 bg-white hover:bg-zinc-200 text-zinc-900 rounded-xl text-sm font-bold transition-transform hover:scale-[1.02] shadow-lg flex items-center gap-2">
               Fast Apply
             </button>
           )}
        </div>
      </div>
    </div>
  );

  return (
    <div className="min-h-screen bg-background flex flex-col overflow-x-hidden selection:bg-primary-500/30">
        {/* Decorative Grid */}
        <div className="fixed inset-0 z-0 bg-grid-pattern opacity-40 pointer-events-none mix-blend-overlay"></div>

      {/* Header */}
      <header className="bg-surface/80 backdrop-blur-2xl border-b border-white/5 sticky top-0 z-40 transition-all">
        <div className="max-w-7xl mx-auto px-6 lg:px-8 h-20 flex items-center justify-between">
          <div className="flex items-center gap-3 font-extrabold text-2xl tracking-tighter">
            <div className="h-10 w-10 bg-gradient-to-tr from-accent-500 to-primary-500 rounded-xl flex items-center justify-center text-white shadow-lg shadow-primary-500/20 group cursor-pointer transition-transform hover:rotate-12">
               <span className="text-xl rotate-[-12px] group-hover:rotate-0 transition-transform">∞</span>
            </div>
            <span className="bg-gradient-to-r from-zinc-100 to-zinc-400 text-transparent bg-clip-text">Seeker</span>
          </div>
          
          <nav className="hidden md:flex items-center gap-1.5 p-1.5 glass rounded-2xl">
            <button onClick={() => switchTab('recommendations')} className={`px-5 py-2 rounded-xl text-sm font-semibold transition-all flex items-center gap-2 ${activeTab === 'recommendations' ? 'bg-zinc-800/80 text-white shadow-xl scale-100 border border-zinc-700/50' : 'text-zinc-500 hover:text-white hover:bg-zinc-800/40'}`}>
              <Sparkles size={16} className={activeTab === 'recommendations' ? 'text-accent-400' : ''} /> AI Picks
            </button>
            <button onClick={() => switchTab('all')} className={`px-5 py-2 rounded-xl text-sm font-semibold transition-all flex items-center gap-2 ${activeTab === 'all' ? 'bg-zinc-800/80 text-white shadow-xl scale-100 border border-zinc-700/50' : 'text-zinc-500 hover:text-white hover:bg-zinc-800/40'}`}>
              <Search size={16} className={activeTab === 'all' ? 'text-primary-400' : ''} /> Directory
            </button>
            <button onClick={() => switchTab('applications')} className={`px-5 py-2 rounded-xl text-sm font-semibold transition-all flex items-center gap-2 ${activeTab === 'applications' ? 'bg-zinc-800/80 text-white shadow-xl scale-100 border border-zinc-700/50' : 'text-zinc-500 hover:text-white hover:bg-zinc-800/40'}`}>
              <Briefcase size={16} /> Applications
            </button>
            <button onClick={() => switchTab('profile')} className={`px-5 py-2 rounded-xl text-sm font-semibold transition-all flex items-center gap-2 ${activeTab === 'profile' ? 'bg-zinc-800/80 text-white shadow-xl scale-100 border border-zinc-700/50' : 'text-zinc-500 hover:text-white hover:bg-zinc-800/40'}`}>
              <User size={16} /> Profile
            </button>
          </nav>
          
          <button onClick={() => { localStorage.clear(); navigate('/login'); }} className="h-10 w-10 rounded-xl bg-zinc-800/50 hover:bg-zinc-800 text-zinc-400 hover:text-white flex items-center justify-center transition-all border border-zinc-700/50">
            <LogOut size={16} />
          </button>
        </div>
      </header>
      
      {/* Mobile nav */}
      <div className="md:hidden glass mx-4 mt-4 p-1 rounded-xl flex z-10 sticky top-24">
         <button onClick={() => switchTab('recommendations')} className={`flex-1 py-3 text-xs font-bold rounded-lg flex justify-center items-center gap-1 ${activeTab === 'recommendations' ? 'bg-zinc-800 text-white' : 'text-zinc-500'}`}><Sparkles size={14}/> Picks</button>
         <button onClick={() => switchTab('all')} className={`flex-1 py-3 text-xs font-bold rounded-lg flex justify-center items-center gap-1 ${activeTab === 'all' ? 'bg-zinc-800 text-white' : 'text-zinc-500'}`}><Search size={14}/> Jobs</button>
         <button onClick={() => switchTab('applications')} className={`flex-1 py-3 text-xs font-bold rounded-lg flex justify-center items-center gap-1 ${activeTab === 'applications' ? 'bg-zinc-800 text-white' : 'text-zinc-500'}`}><Briefcase size={14}/> Apps</button>
         <button onClick={() => switchTab('profile')} className={`flex-1 py-3 text-xs font-bold rounded-lg flex justify-center items-center gap-1 ${activeTab === 'profile' ? 'bg-zinc-800 text-white' : 'text-zinc-500'}`}><User size={14}/> Profile</button>
      </div>

      <main className="flex-1 w-full max-w-7xl mx-auto px-6 lg:px-8 pt-8 pb-20 relative z-10">
        
        {/* Glow Effects corresponding to active tab */}
        <div className={`absolute top-0 right-[20%] w-[600px] h-[400px] rounded-full blur-[150px] -z-10 transition-colors duration-1000 ${activeTab === 'recommendations' ? 'bg-accent-600/10' : activeTab === 'all' ? 'bg-primary-600/10' : 'bg-success/5'}`}></div>
        <div className={`absolute top-[40%] left-[10%] w-[400px] h-[400px] rounded-full blur-[120px] -z-10 transition-colors duration-1000 ${activeTab === 'recommendations' ? 'bg-primary-600/10' : activeTab === 'all' ? 'bg-accent-600/10' : 'bg-blue-600/5'}`}></div>

        {activeTab === 'recommendations' && (
          <div className="w-full">
            <div className="mb-10 lg:w-2/3">
              <span className="text-accent-400 font-bold tracking-widest text-xs uppercase mb-2 block">KNN Intelligence Engine</span>
              <h1 className="text-4xl sm:text-5xl font-extrabold text-white tracking-tight mb-4 leading-tight">Your Custom <br/><span className="text-gradient">Matches</span></h1>
              <p className="text-zinc-400 text-lg sm:text-xl">Jobs highly aligned with your exact skill profile, ranked instantly by our K-Nearest Neighbors matching algorithm.</p>
            </div>
            
            {recommendedJobs.length > 0 ? (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {recommendedJobs.map((job, idx) => renderJobCard(job, true, idx))}
              </div>
            ) : (
              <div className="glass-card max-w-2xl mx-auto py-24 px-8 text-center animate-fade-in mt-12 bg-zinc-900/40">
                <div className="h-24 w-24 bg-gradient-to-tr from-accent-500/20 to-primary-500/20 rounded-full mx-auto flex items-center justify-center mb-6 border border-white/5">
                   <Sparkles className="h-10 w-10 text-accent-400" />
                </div>
                <h3 className="text-2xl font-bold text-white mb-2">Refining your model</h3>
                <p className="text-zinc-400 text-lg mb-8 max-w-lg mx-auto">We couldn't construct a strong match vector yet. Add more specific skills to your profile to improve the algorithm's accuracy.</p>
                <button onClick={() => switchTab('all')} className="bg-white hover:bg-zinc-200 text-zinc-900 px-8 py-3 rounded-xl font-bold shadow-xl transition-all hover:-translate-y-1">
                   Explore Directory
                </button>
              </div>
            )}
          </div>
        )}

        {activeTab === 'all' && (
          <div className="w-full">
            <div className="flex flex-col md:flex-row md:items-end justify-between mb-10 pb-6 border-b border-zinc-800">
               <div>
                 <span className="text-primary-400 font-bold tracking-widest text-xs uppercase mb-2 block">World Class Roles</span>
                 <h2 className="text-4xl font-extrabold text-white tracking-tight">System Directory</h2>
               </div>
               <div className="mt-4 md:mt-0 text-zinc-500 font-medium">Showing {jobs.length} total roles</div>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {jobs.map((job, idx) => renderJobCard(job, false, idx))}
            </div>
          </div>
        )}

        {activeTab === 'applications' && (
          <div className="max-w-4xl mx-auto">
            <div className="mb-10 text-center md:text-left">
                 <span className="text-zinc-400 font-bold tracking-widest text-xs uppercase mb-2 block">Application History</span>
                 <h2 className="text-4xl font-extrabold text-white tracking-tight">Active Pipelines</h2>
            </div>
            
            {applications.length > 0 ? (
              <div className="space-y-4">
                {applications.map((app, idx) => (
                  <div key={app._id} style={{ animationDelay: `${idx * 0.1}s` }} className="glass-card p-6 flex flex-col md:flex-row items-start md:items-center justify-between gap-6 hover:translate-x-1 transition-transform animate-slide-up opacity-0 relative overflow-hidden group">
                    <div className="absolute left-0 top-0 bottom-0 w-1.5 bg-success rounded-l-2xl group-hover:w-2 transition-all"></div>
                    <div className="pl-4">
                      <h3 className="text-xl font-bold text-white tracking-tight mb-1">{app.jobId?.title || 'Closed Position'}</h3>
                      <div className="flex items-center gap-3">
                         <span className="text-sm text-zinc-400">Status: <span className="text-success font-bold capitalize">{app.status}</span></span>
                         <span className="w-1.5 h-1.5 rounded-full bg-zinc-700"></span>
                         <span className="text-sm font-medium text-zinc-500 flex items-center gap-1.5"><Clock size={14}/> {format(new Date(app.appliedAt), 'MMMM d, yyyy')}</span>
                      </div>
                    </div>
                    
                    <button onClick={() => app.jobId && setChatUser({ id: app.jobId.employerId, name: 'Employer' })} className="hidden md:flex h-12 px-6 bg-zinc-800 hover:bg-zinc-700 text-white rounded-xl items-center justify-center transition-all border border-zinc-700 gap-2 font-medium shrink-0 ml-auto">
                      <MessageSquare size={16} className="text-primary-400"/> Ping Recruiter
                    </button>
                  </div>
                ))}
              </div>
            ) : (
              <div className="glass-card py-24 text-center border-dashed border-zinc-700/50">
                <Briefcase className="mx-auto h-16 w-16 text-zinc-600 mb-6" />
                <h3 className="text-2xl font-bold text-white mb-2">No active pipelines</h3>
                <p className="text-zinc-500 max-w-sm mx-auto">You haven't applied to any roles yet. The perfect role is waiting for you in the directory.</p>
              </div>
            )}
          </div>
        )}

        {activeTab === 'profile' && userProfile && (
          <div className="max-w-4xl mx-auto">
            <div className="mb-10 text-center md:text-left">
                 <span className="text-zinc-400 font-bold tracking-widest text-xs uppercase mb-2 block">My Profile</span>
                 <h2 className="text-4xl font-extrabold text-white tracking-tight">{userProfile.name}</h2>
                 <p className="text-zinc-400 mt-2">{userProfile.email} &bull; {userProfile.role}</p>
            </div>
            
            <div className="glass-card p-8 relative">
                <div className="flex justify-between items-center mb-6">
                    <h3 className="text-2xl font-bold text-white">My Skills</h3>
                    {!isEditingSkills && (
                        <button onClick={() => setIsEditingSkills(true)} className="px-4 py-2 bg-zinc-800 hover:bg-zinc-700 text-white rounded-xl text-sm font-bold transition-all border border-zinc-700">
                            Edit Skills
                        </button>
                    )}
                </div>
                
                {isEditingSkills ? (
                    <div className="animate-fade-in">
                        <textarea 
                            className="w-full p-4 bg-zinc-900/50 border border-zinc-700/50 rounded-xl focus:ring-1 focus:ring-accent-500 focus:border-accent-500 text-white outline-none transition-all resize-none"
                            placeholder="React, Node.js, Python (comma separated)"
                            rows="3"
                            value={newSkillsInput}
                            onChange={(e) => setNewSkillsInput(e.target.value)}
                        />
                        <div className="flex gap-3 mt-4">
                            <button onClick={handleUpdateSkills} className="px-6 py-2 bg-accent-600 hover:bg-accent-500 text-white rounded-xl font-bold transition-all shadow-lg shadow-accent-500/20">
                                Save Skills
                            </button>
                            <button onClick={() => {setIsEditingSkills(false); setNewSkillsInput(userProfile.skills.join(', '));}} className="px-6 py-2 bg-zinc-800 hover:bg-zinc-700 text-zinc-300 rounded-xl font-bold transition-all border border-zinc-700">
                                Cancel
                            </button>
                        </div>
                    </div>
                ) : (
                    <div className="flex flex-wrap gap-3">
                        {userProfile.skills && userProfile.skills.length > 0 ? (
                            userProfile.skills.map((skill, idx) => (
                                <span key={idx} className="bg-zinc-800 border border-zinc-700 text-zinc-200 px-4 py-2 rounded-xl text-sm font-medium shadow-sm flex items-center gap-2">
                                    <Flame size={14} className="text-accent-400" /> {skill}
                                </span>
                            ))
                        ) : (
                            <p className="text-zinc-500 italic">No skills added yet. Add some skills to get better AI matches!</p>
                        )}
                    </div>
                )}
            </div>
          </div>
        )}
      </main>

      {/* Floating Chat Wrapper */}
      {chatUser && <Chat otherUser={chatUser} onClose={() => setChatUser(null)} />}
    </div>
  );
}
