import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './context/AuthContext';
import BottomNav from './components/BottomNav';
import Sidebar from './components/Sidebar';
import GlobalHeader from './components/GlobalHeader';
import LoadingScreen from './components/LoadingScreen';
import Home from './pages/Home';

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
import Community from './pages/Community';
import Vets from './pages/Vets';
import IoT from './pages/IoT';

const ProtectedRoute = ({ children }) => {
  const { user, isLoading } = useAuth();
  if (isLoading) return <LoadingScreen message="Authenticating..." />;
  if (!user) return <Navigate to="/login" replace />;
  return (
    <div className="app-shell" style={{ display: 'flex' }}>
      <GlobalHeader />
      <Sidebar />
      <main className="main-content" style={{ flex: 1, marginLeft: 'var(--sidebar-width)', paddingTop: '64px', minHeight: '100vh', background: 'var(--bg-base)' }}>
        <div className="page-wrapper animate-fade-in-fast" style={{ height: '100%' }}>
          {children}
        </div>
      </main>
      <BottomNav />
    </div>
  );
};

function AppRoutes() {
  return (
    <Routes>
      <Route path="/" element={<Home />} />
      <Route path="/login" element={<Login />} />
      <Route path="/register" element={<Register />} />
      <Route path="/dashboard" element={<ProtectedRoute><Dashboard /></ProtectedRoute>} />
      <Route path="/capture" element={<ProtectedRoute><Capture /></ProtectedRoute>} />
      <Route path="/medicine" element={<ProtectedRoute><Medicine /></ProtectedRoute>} />
      <Route path="/settings" element={<ProtectedRoute><Settings /></ProtectedRoute>} />
      <Route path="/herd" element={<ProtectedRoute><Herd /></ProtectedRoute>} />
      <Route path="/animal/:id" element={<ProtectedRoute><AnimalDetail /></ProtectedRoute>} />
      <Route path="/certificate/:id" element={<ProtectedRoute><Certificate /></ProtectedRoute>} />
      <Route path="/chat" element={<ProtectedRoute><Chat /></ProtectedRoute>} />
      <Route path="/heatmap" element={<ProtectedRoute><Heatmap /></ProtectedRoute>} />
      <Route path="/farm-score" element={<ProtectedRoute><FarmScore /></ProtectedRoute>} />
      <Route path="/community" element={<ProtectedRoute><Community /></ProtectedRoute>} />
      <Route path="/vets" element={<ProtectedRoute><Vets /></ProtectedRoute>} />
      <Route path="/iot" element={<ProtectedRoute><IoT /></ProtectedRoute>} />
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
