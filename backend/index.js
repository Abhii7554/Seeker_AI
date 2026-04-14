require('dotenv').config();
const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const { Server } = require('socket.io');
const http = require('http');

const { User, Job, Application, Message } = require('./models');

const app = express();
app.use(express.json());
app.use(cors());

const server = http.createServer(app);
const io = new Server(server, {
  cors: { origin: '*', methods: ['GET', 'POST'] }
});

mongoose.connect(process.env.MONGO_URI || 'mongodb://127.0.0.1:27017/ai-job-system')
  .then(() => console.log('MongoDB Connected'))
  .catch(err => console.log('Failed to connect to MongoDB', err));

// Auth Middleware
const authenticateToken = (req, res, next) => {
  const token = req.header('Authorization')?.split(' ')[1];
  if (!token) return res.status(401).json({ message: 'Access Denied' });

  jwt.verify(token, process.env.JWT_SECRET || 'supersecret', (err, user) => {
    if (err) return res.status(403).json({ message: 'Invalid Token' });
    req.user = user;
    next();
  });
};

// Auth Routes
app.post('/api/register', async (req, res) => {
  try {
    const { name, email, password, role, skills } = req.body;
    const existing = await User.findOne({ email });
    if (existing) return res.status(400).json({ message: 'Email already exists' });
    
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);
    
    // parse skills properly if sent as string with commas
    const skillsArray = typeof skills === 'string' ? skills.split(',').map(s => s.trim()).filter(s => s) : (skills || []);

    const user = new User({ name, email, password: hashedPassword, role, skills: skillsArray });
    await user.save();
    res.status(201).json({ message: 'User created' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.post('/api/login', async (req, res) => {
  try {
    const { email, password } = req.body;
    const user = await User.findOne({ email });
    if (!user) return res.status(400).json({ message: 'Invalid credentials' });
    
    const isMatch = await bcrypt.compare(password, user.password);
    console.log("LOGIN ATTEMPT", {email, pwdLength: password.length, isMatch});
    if (!isMatch) return res.status(400).json({ message: 'Invalid credentials' });
    
    const token = jwt.sign({ id: user._id, role: user.role }, process.env.JWT_SECRET || 'supersecret', { expiresIn: '1d' });
    res.json({ token, user: { id: user._id, name: user.name, role: user.role, skills: user.skills } });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Jobs Routes
app.post('/api/jobs', authenticateToken, async (req, res) => {
  if (req.user.role !== 'employer') return res.status(403).json({ message: 'Employer only' });
  try {
    const { title, description, requiredSkills } = req.body;
    const skillsArray = typeof requiredSkills === 'string' ? requiredSkills.split(',').map(s => s.trim()).filter(s => s) : (requiredSkills || []);
    const job = new Job({ title, description, requiredSkills: skillsArray, employerId: req.user.id });
    await job.save();
    res.status(201).json(job);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.get('/api/jobs', async (req, res) => {
  try {
    const jobs = await Job.find().populate('employerId', 'name email').sort('-createdAt');
    res.json(jobs);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.get('/api/employer/jobs', authenticateToken, async (req, res) => {
  try {
    const jobs = await Job.find({ employerId: req.user.id }).sort('-createdAt');
    res.json(jobs);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.get('/api/applications/me', authenticateToken, async (req, res) => {
  try {
    const apps = await Application.find({ seekerId: req.user.id }).populate('jobId');
    res.json(apps);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// KNN Job Recommendations
app.get('/api/jobs/recommendations', authenticateToken, async (req, res) => {
  if (req.user.role !== 'seeker') return res.status(403).json({ message: 'Seeker only' });
  
  try {
    const user = await User.findById(req.user.id);
    const allJobs = await Job.find().populate('employerId', 'name email');
    
    // KNN implementation based on skill overlap
    const userSkills = user.skills.map(s => s.toLowerCase().trim());
    
    const scoredJobs = allJobs.map(job => {
      const jobSkills = job.requiredSkills.map(s => s.toLowerCase().trim());
      let matchCount = 0;
      jobSkills.forEach(js => { 
        if(userSkills.some(us => us.includes(js) || js.includes(us))) matchCount++; 
      });
      // Score metric
      const score = jobSkills.length ? (matchCount / jobSkills.length) : 0;
      return { job, score };
    });
    
    // Sort descending by score
    scoredJobs.sort((a, b) => b.score - a.score);
    
    // Top K nearest neighbors
    const K = 5;
    const topJobs = scoredJobs.slice(0, K).map(item => ({ ...item.job._doc, matchScore: item.score }));
    res.json(topJobs);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Applications
app.post('/api/applications', authenticateToken, async (req, res) => {
  if (req.user.role !== 'seeker') return res.status(403).json({ message: 'Seeker only' });
  try {
    const { jobId } = req.body;
    const existing = await Application.findOne({ jobId, seekerId: req.user.id });
    if(existing) return res.status(400).json({ message: 'Already applied' });
    
    const app = new Application({ jobId, seekerId: req.user.id });
    await app.save();
    res.status(201).json(app);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// For employers
app.get('/api/applications/job/:jobId', authenticateToken, async (req, res) => {
  try {
    const apps = await Application.find({ jobId: req.params.jobId }).populate('seekerId', 'name email skills');
    res.json(apps);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Messages
app.get('/api/messages/:userId', authenticateToken, async (req, res) => {
  try {
    const messages = await Message.find({
      $or: [
        { senderId: req.user.id, receiverId: req.params.userId },
        { senderId: req.params.userId, receiverId: req.user.id }
      ]
    }).sort('timestamp');
    res.json(messages);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.post('/api/messages', authenticateToken, async (req, res) => {
  try {
    const { receiverId, content } = req.body;
    const msg = new Message({ senderId: req.user.id, receiverId, content });
    await msg.save();
    
    // Emit via socket
    io.to(receiverId).emit('newMessage', msg);
    res.status(201).json(msg);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.get('/api/users/me', authenticateToken, async (req, res) => {
  try {
    const user = await User.findById(req.user.id).select('-password');
    res.json(user);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.put('/api/users/skills', authenticateToken, async (req, res) => {
  if (req.user.role !== 'seeker') return res.status(403).json({ message: 'Seeker only' });
  try {
    const { skills } = req.body;
    const skillsArray = typeof skills === 'string' ? skills.split(',').map(s => s.trim()).filter(s => s) : (skills || []);
    
    const user = await User.findById(req.user.id);
    user.skills = skillsArray;
    await user.save();
    
    res.json({ message: 'Skills updated successfully', skills: user.skills });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.get('/api/users', async (req, res) => {
  try {
    const users = await User.find({}, 'name role email');
    res.json(users);
  } catch(err) {
    res.status(500).json({ error: err.message });
  }
});

app.get('/', (req, res) => res.send('API Running'));

// NOTE: Socket.io logic for real-time chat can go here if needed
io.on('connection', (socket) => {
  console.log('A user connected:', socket.id);
  // Join a personal room for simple direct messaging
  socket.on('join', (userId) => {
    socket.join(userId);
  });
  
  socket.on('disconnect', () => {
    console.log('User disconnected:', socket.id);
  });
});

const PORT = process.env.PORT || 5000;
server.listen(PORT, () => console.log(`Server running on port ${PORT}`));
const cors = require("cors");
app.use(cors());