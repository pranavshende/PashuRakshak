import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './context/AuthContext';
import Login from './pages/Login';
import Register from './pages/Register';
import Dashboard from './pages/Dashboard';
import Capture from './pages/Capture';
import Medicine from './pages/Medicine';
import Settings from './pages/Settings';
import Herd from './pages/Herd';
import AnimalDetail from './pages/AnimalDetail';
import Certificate from './pages/Certificate';
import Chat from './pages/Chat';
import Heatmap from './pages/Heatmap';
import FarmScore from './pages/FarmScore';

// Protected Route Wrapper
const ProtectedRoute = ({ children }) => {
  const { user, isLoading } = useAuth();
  
  if (isLoading) return <div className="loading-screen"><div className="spinner"></div></div>;
  if (!user) return <Navigate to="/login" replace />;
  
  return children;
};

function AppRoutes() {
  return (
    <Routes>
      <Route path="/login" element={<Login />} />
      <Route path="/register" element={<Register />} />
      <Route path="/" element={<ProtectedRoute><Dashboard /></ProtectedRoute>} />
      <Route path="/capture" element={<ProtectedRoute><Capture /></ProtectedRoute>} />
      <Route path="/medicine" element={<ProtectedRoute><Medicine /></ProtectedRoute>} />
      <Route path="/settings" element={<ProtectedRoute><Settings /></ProtectedRoute>} />
      <Route path="/herd" element={<ProtectedRoute><Herd /></ProtectedRoute>} />
      <Route path="/animal/:id" element={<ProtectedRoute><AnimalDetail /></ProtectedRoute>} />
      <Route path="/certificate/:id" element={<ProtectedRoute><Certificate /></ProtectedRoute>} />
      <Route path="/chat" element={<ProtectedRoute><Chat /></ProtectedRoute>} />
      <Route path="/heatmap" element={<ProtectedRoute><Heatmap /></ProtectedRoute>} />
      <Route path="/farm-score" element={<ProtectedRoute><FarmScore /></ProtectedRoute>} />
    </Routes>
  );
}

export default function App() {
  return (
    <AuthProvider>
      <Router>
        <AppRoutes />
      </Router>
    </AuthProvider>
  );
}
