import { useState, useEffect } from 'react';
import axios from 'axios';
import { format } from 'date-fns';
import Chat from '../components/Chat';
import { Briefcase, Users, Plus, LogOut, MessageSquare, ChevronRight, Activity } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

export default function EmployerDashboard() {
  const [jobs, setJobs] = useState([]);
  const [applications, setApplications] = useState([]);
  const [showNewJob, setShowNewJob] = useState(false);
  const [newJob, setNewJob] = useState({ title: '', description: '', requiredSkills: '' });
  const [selectedJob, setSelectedJob] = useState(null);
  const [chatUser, setChatUser] = useState(null);
  
  const token = localStorage.getItem('token');
  const navigate = useNavigate();

  useEffect(() => {
    fetchJobs();
  }, []);

  const fetchJobs = async () => {
    try {
      const res = await axios.get('http://localhost:5000/api/employer/jobs', { headers: { Authorization: `Bearer ${token}` } });
      setJobs(res.data);
    } catch (err) { console.error(err); }
  };

  const fetchApplications = async (jobId) => {
    try {
      const res = await axios.get(`http://localhost:5000/api/applications/job/${jobId}`, { headers: { Authorization: `Bearer ${token}` } });
      setApplications(res.data);
      setSelectedJob(jobId);
    } catch (err) { console.error(err); }
  };

  const handlePostJob = async (e) => {
    e.preventDefault();
    try {
      await axios.post('http://localhost:5000/api/jobs', newJob, { headers: { Authorization: `Bearer ${token}` } });
      setShowNewJob(false);
      setNewJob({ title: '', description: '', requiredSkills: '' });
      fetchJobs();
    } catch (err) { console.error(err); }
  };

  const logout = () => {
    localStorage.clear();
    navigate('/login');
  };

  return (
    <div className="min-h-screen bg-background flex overflow-hidden">
      {/* Sidebar background effects */}
      <div className="absolute top-0 left-0 w-64 h-full bg-surface/80 backdrop-blur-3xl border-r border-white/5 z-0"></div>

      {/* Sidebar */}
      <div className="w-64 p-5 flex flex-col z-10">
        <div className="flex items-center gap-3 text-xl font-bold text-white mb-10 mt-2 p-2">
          <div className="h-10 w-10 rounded-xl bg-gradient-to-tr from-primary-500 to-accent-500 flex items-center justify-center shadow-lg shadow-primary-500/20">
            <Briefcase size={20} className="text-white" /> 
          </div>
          <span className="tracking-tight">Employer</span>
        </div>
        
        <button onClick={() => {setShowNewJob(true); setSelectedJob(null);}} className="flex items-center justify-center gap-2 w-full px-4 py-3.5 bg-white hover:bg-zinc-200 text-zinc-900 font-semibold rounded-xl transition-all mb-8 shadow-md">
          <Plus size={18} /> Post a Job
        </button>
        
        <div className="flex-1 overflow-y-auto pr-2 -mr-2">
          <h3 className="text-xs font-bold text-zinc-500 uppercase tracking-widest mb-4 pl-2">Active Roles</h3>
          <div className="space-y-2">
            {jobs.map(job => (
              <button 
                key={job._id} 
                onClick={() => {fetchApplications(job._id); setShowNewJob(false);}}
                className={`w-full text-left p-3 rounded-xl text-sm transition-all border ${selectedJob === job._id ? 'bg-primary-500/10 border-primary-500/30 text-primary-400 font-medium' : 'bg-transparent border-transparent text-zinc-400 hover:bg-zinc-800/50 hover:text-zinc-200'}`}
              >
                <div className="flex justify-between items-center mb-1">
                  <div className="truncate pr-2">{job.title}</div>
                  {selectedJob === job._id && <ChevronRight size={14} className="flex-shrink-0" />}
                </div>
                <div className={`text-[11px] ${selectedJob === job._id ? 'text-primary-400/70' : 'text-zinc-600'}`}>{format(new Date(job.createdAt), 'MMM d')}</div>
              </button>
            ))}
            {jobs.length === 0 && <div className="text-sm text-zinc-600 pl-2">No active postings</div>}
          </div>
        </div>
        
        <button onClick={logout} className="flex items-center justify-center gap-2 text-zinc-500 hover:text-white hover:bg-zinc-800/50 p-3 rounded-xl mt-auto transition-colors">
          <LogOut size={16} /> <span className="text-sm font-medium">Logout</span>
        </button>
      </div>
      
      {/* Main Content Area Details */}
      <div className="flex-1 relative z-10 flex flex-col items-center">
        {/* Abstract shapes for main area */}
        <div className="absolute top-20 right-20 w-96 h-96 bg-primary-600/5 rounded-full blur-[120px] pointer-events-none"></div>

        <div className="w-full max-w-5xl p-8 overflow-y-auto h-full animate-fade-in custom-scrollbar">
          {showNewJob ? (
            <div className="glass-card p-8 md:p-10 max-w-2xl mx-auto mt-10 shadow-2xl">
              <div className="flex items-center gap-3 mb-8">
                <div className="h-12 w-12 rounded-xl bg-zinc-800 flex items-center justify-center border border-zinc-700">
                  <Activity className="text-primary-400" />
                </div>
                <div>
                  <h2 className="text-2xl font-bold text-white tracking-tight">Create a New Posting</h2>
                  <p className="text-zinc-400 text-sm">Publish a role to the intelligent job network</p>
                </div>
              </div>

              <form onSubmit={handlePostJob} className="space-y-5">
                <div>
                  <label className="block text-sm font-medium text-zinc-300 mb-1.5">Position Title</label>
                  <input type="text" required className="w-full px-4 py-3 bg-zinc-900 border border-zinc-700 focus:border-primary-500 focus:ring-1 focus:ring-primary-500 rounded-xl text-white outline-none transition-all placeholder-zinc-600" placeholder="e.g. Senior Frontend Engineer" value={newJob.title} onChange={e => setNewJob({...newJob, title: e.target.value})} />
                </div>
                <div>
                  <label className="block text-sm font-medium text-zinc-300 mb-1.5">Role Description</label>
                  <textarea required rows="5" className="w-full px-4 py-3 bg-zinc-900 border border-zinc-700 focus:border-primary-500 focus:ring-1 focus:ring-primary-500 rounded-xl text-white outline-none transition-all resize-none placeholder-zinc-600" placeholder="Describe the responsibilities and requirements..." value={newJob.description} onChange={e => setNewJob({...newJob, description: e.target.value})}></textarea>
                </div>
                <div>
                  <label className="block text-sm font-medium text-zinc-300 mb-1.5">Required Skills</label>
                  <input type="text" className="w-full px-4 py-3 bg-zinc-900 border border-zinc-700 focus:border-primary-500 focus:ring-1 focus:ring-primary-500 rounded-xl text-white outline-none transition-all placeholder-zinc-600" placeholder="React, Python, AWS (Comma separated)" value={newJob.requiredSkills} onChange={e => setNewJob({...newJob, requiredSkills: e.target.value})} />
                  <p className="text-xs text-primary-400/80 mt-2 ml-1">*This data is used by our AI matching engine to find the perfect candidates.</p>
                </div>
                <div className="flex gap-3 justify-end pt-4 mt-8 border-t border-zinc-800">
                  <button type="button" onClick={() => setShowNewJob(false)} className="px-6 py-2.5 text-zinc-400 hover:text-white hover:bg-zinc-800 font-medium rounded-xl transition-colors">Cancel</button>
                  <button type="submit" className="px-6 py-2.5 bg-primary-600 hover:bg-primary-500 text-white font-medium rounded-xl shadow-lg shadow-primary-500/20 transition-all flex items-center gap-2">
                    Publish Role
                  </button>
                </div>
              </form>
            </div>
          ) : selectedJob ? (
            <div className="animate-slide-up">
              <div className="flex items-end justify-between mb-8 pb-6 border-b border-zinc-800/80">
                <div>
                  <p className="text-primary-400 text-sm font-semibold tracking-wide uppercase mb-1">Candidate Review</p>
                  <h2 className="text-3xl font-bold text-white tracking-tight">{jobs.find(j => j._id === selectedJob)?.title}</h2>
                </div>
                <div className="glass px-4 py-2 rounded-xl flex flex-col items-center justify-center min-w-[100px]">
                  <span className="text-3xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-primary-400 to-accent-400">{applications.length}</span>
                  <span className="text-xs text-zinc-400 font-medium tracking-wide">Applicants</span>
                </div>
              </div>
              
              {applications.length > 0 ? (
                <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6">
                  {applications.map(app => (
                    <div key={app._id} className="glass-card p-6 flex flex-col h-full relative group overflow-hidden">
                       <div className="absolute -right-4 -top-4 w-24 h-24 bg-gradient-to-br from-primary-500/10 to-accent-500/10 rounded-full blur-2xl opacity-0 group-hover:opacity-100 transition-opacity"></div>
                      
                      <div className="flex items-start justify-between mb-5 relative z-10">
                        <div className="flex items-center gap-3">
                          <div className="h-12 w-12 bg-zinc-800 rounded-full flex items-center justify-center text-white font-bold text-xl border border-zinc-700 shadow-inner overflow-hidden relative">
                             {/* Initials placeholder */}
                             <span className="z-10">{app.seekerId.name.charAt(0).toUpperCase()}</span>
                             <div className="absolute inset-0 bg-gradient-to-tr from-primary-600 to-accent-600 opacity-20"></div>
                          </div>
                          <div>
                            <h4 className="text-lg font-bold text-white leading-tight capitalize">{app.seekerId.name}</h4>
                            <p className="text-xs text-zinc-400 mt-0.5">{app.seekerId.email}</p>
                          </div>
                        </div>
                      </div>
                      
                      <div className="flex-1 relative z-10">
                        <h5 className="text-[10px] uppercase tracking-widest text-zinc-500 font-bold mb-3">Skill Matching Profile</h5>
                        <div className="flex flex-wrap gap-2 mb-4">
                          {app.seekerId.skills.map((skill, idx) => (
                            <span key={idx} className="bg-zinc-800/80 border border-zinc-700/50 text-zinc-300 px-2.5 py-1 rounded-md text-xs font-medium">
                              {skill}
                            </span>
                          ))}
                        </div>
                      </div>
                      
                      <div className="mt-4 pt-4 border-t border-zinc-800/60 flex justify-between items-center relative z-10">
                        <span className="text-xs text-zinc-500 font-medium">Applied {format(new Date(app.appliedAt), 'MMM d, yyyy')}</span>
                        <button onClick={() => setChatUser({ id: app.seekerId._id, name: app.seekerId.name })} className="p-2 bg-primary-500/10 hover:bg-primary-500 hover:text-white text-primary-400 rounded-lg transition-colors flex items-center gap-2 text-sm font-semibold">
                           <MessageSquare size={16} /> <span>Message</span>
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="flex flex-col items-center justify-center py-32 glass-card">
                  <div className="h-20 w-20 rounded-full bg-zinc-800/50 flex items-center justify-center mb-6 border border-zinc-700">
                    <Users className="h-8 w-8 text-zinc-500" />
                  </div>
                  <h3 className="text-xl font-bold text-zinc-200">No Applications Yet</h3>
                  <p className="text-zinc-500 text-sm mt-2 max-w-sm text-center">Your job posting is active. When candidates apply, they will appear here for your review.</p>
                </div>
              )}
            </div>
          ) : (
             <div className="flex flex-col items-center justify-center h-full max-h-[70vh] text-center animate-fade-in">
               <div className="relative mb-8 group">
                  <div className="absolute inset-0 bg-primary-500/20 blur-xl rounded-full scale-150 opacity-0 group-hover:opacity-100 transition-opacity duration-700"></div>
                  <div className="h-24 w-24 bg-zinc-800/80 glass border border-zinc-700 rounded-3xl rotate-12 flex items-center justify-center relative z-10 shadow-2xl">
                     <div className="h-12 w-12 bg-zinc-700 rounded-xl -rotate-12 flex items-center justify-center">
                        <Briefcase className="h-6 w-6 text-primary-400" />
                     </div>
                  </div>
               </div>
               <h2 className="text-4xl font-bold text-white mb-4 tracking-tight">Employer Workspace</h2>
               <p className="text-zinc-400 max-w-md mx-auto text-lg leading-relaxed">
                  Manage your active job postings, discover talented seekers matched by AI, and chat instantly with candidates.
               </p>
             </div>
          )}
        </div>
      </div>

      {/* Floating Chat Component */}
      {chatUser && <Chat otherUser={chatUser} onClose={() => setChatUser(null)} />}
    </div>
  );
}
