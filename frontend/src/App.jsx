import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import ProtectedRoute from './components/ProtectedRoute';
import Landing from './pages/Landing';
import Login from './pages/Login';
import Register from './pages/Register';
import AdminVerify from './pages/AdminVerify';
import Marketplace from './pages/Marketplace';
import InnovatorDashboard from './pages/InnovatorDashboard';
import DealRoom from './pages/DealRoom';

function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<Landing />} />
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />

          {/* Admin Routes */}
          <Route element={<ProtectedRoute allowedRoles={['ADMIN']} />}>
            <Route path="/admin" element={<AdminVerify />} />
          </Route>

          {/* Innovator Routes */}
          <Route element={<ProtectedRoute allowedRoles={['INNOVATOR', 'ADMIN']} />}>
            <Route path="/dashboard" element={<InnovatorDashboard />} />
          </Route>

          {/* Investor Routes */}
          <Route element={<ProtectedRoute allowedRoles={['INVESTOR', 'ADMIN']} />}>
            <Route path="/marketplace" element={<Marketplace />} />
          </Route>

          {/* Shared Authenticated Routes */}
          <Route element={<ProtectedRoute allowedRoles={['INVESTOR', 'INNOVATOR', 'ADMIN']} />}>
            <Route path="/listing/:id" element={<DealRoom />} />
          </Route>
        </Routes>
      </BrowserRouter>
    </AuthProvider>
  );
}

export default App;
