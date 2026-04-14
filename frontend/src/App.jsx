import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import Login from './pages/Login';
import Register from './pages/Register';
import SeekerDashboard from './pages/SeekerDashboard';
import EmployerDashboard from './pages/EmployerDashboard';

const ProtectedRoute = ({ children, allowedRole }) => {
  const token = localStorage.getItem('token');
  const role = localStorage.getItem('role');
  
  if (!token) return <Navigate to="/login" replace />;
  if (allowedRole && role !== allowedRole) return <Navigate to="/login" replace />;
  
  return children;
};

const RootRedirect = () => {
  const token = localStorage.getItem('token');
  const role = localStorage.getItem('role');
  if (token) {
    return <Navigate to={role === 'employer' ? "/employer" : "/seeker"} replace />;
  }
  return <Navigate to="/login" replace />;
};

function App() {
  return (
    <Router>
      <div className="min-h-screen bg-gray-900 text-gray-100 font-sans">
        <Routes>
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />
          
          <Route path="/seeker" element={
            <ProtectedRoute allowedRole="seeker">
              <SeekerDashboard />
            </ProtectedRoute>
          } />
          <Route path="/employer" element={
            <ProtectedRoute allowedRole="employer">
              <EmployerDashboard />
            </ProtectedRoute>
          } />
          
          {/* Default redirect */}
          <Route path="*" element={<RootRedirect />} />
        </Routes>
      </div>
    </Router>
  );
}

export default App;
