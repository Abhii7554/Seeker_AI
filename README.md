# AI-Powered Job Hunt and Applicant Tracking System

This is a simple, modern Job Tracking system featuring an AI "K-Nearest Neighbors" (KNN) job matching algorithm and real-time chat between Seekers and Employers.

## Tech Stack
- **Frontend**: React.js (Vite), Tailwind CSS, React Router, Socket.io-client
- **Backend**: Node.js, Express, MongoDB, Mongoose, Socket.io
- **AI Concept**: K-Nearest Neighbors (KNN) logic implemented from scratch to calculate distance/similarity between a Seeker's skills and a Job's required skills.

## Prerequisites
- Node.js installed
- MongoDB installed and running locally on port 27017 (or update the `MONGO_URI` in `backend/index.js`)

## How to Run

1. **Start the Backend server**
   Open a terminal and navigate to the backend directory:
   ```bash
   cd backend
   npm install
   node index.js
   ```
   The server will start on `http://localhost:5000`

2. **Start the Frontend portal**
   Open a new terminal and navigate to the frontend directory:
   ```bash
   cd frontend
   npm install
   npm run dev
   ```
   The portal will start on `http://localhost:5173`

## Usage Instructions
1. Open the frontend URL in your browser.
2. Register an **Employer** account.
3. Post 2-3 jobs with different required skills (e.g., "React, Node.js", "Python, Machine Learning").
4. Log out and register a **Seeker** account. Enter your skills.
5. In the Seeker Dashboard, view your **AI Top Matches** under the "For You" tab. The KNN algorithm will score and rank the jobs based on your skills.
6. Apply for a job, and use the **Chat** button to send a real-time message to the employer.
