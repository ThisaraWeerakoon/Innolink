import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import ProtectedRoute from './components/ProtectedRoute';
import Navbar from './components/Navbar';
import Landing from './pages/Landing';
import Login from './pages/Login';
import Register from './pages/Register';
import AdminVerify from './pages/AdminVerify';
import CreateMandate from './pages/CreateMandate';
import InvestorDashboard from './pages/InvestorDashboard';
import Dashboard from './pages/Dashboard';
import CreateDeal from './pages/CreateDeal';
import DealRoom from './pages/DealRoom';

function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <Navbar />
        <Routes>
          <Route path="/" element={<Landing />} />
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />

          {/* Admin Routes */}
          <Route element={<ProtectedRoute allowedRoles={['ADMIN']} />}>
            <Route path="/admin" element={<AdminVerify />} />
            <Route path="/admin/verify" element={<AdminVerify />} />
          </Route>

          {/* Innovator Routes */}
          <Route element={<ProtectedRoute allowedRoles={['INNOVATOR', 'ADMIN']} />}>
            <Route path="/create-deal" element={<CreateDeal />} />
          </Route>

          {/* Investor Routes */}
          <Route element={<ProtectedRoute allowedRoles={['INVESTOR', 'ADMIN']} />}>
            <Route path="/marketplace" element={<InvestorDashboard />} />
            <Route path="/create-mandate" element={<CreateMandate />} />
          </Route>

          {/* Shared Authenticated Routes */}
          <Route element={<ProtectedRoute allowedRoles={['INVESTOR', 'INNOVATOR', 'ADMIN']} />}>
            <Route path="/dashboard" element={<Dashboard />} />
            <Route path="/listing/:id" element={<DealRoom />} />
          </Route>
        </Routes>
      </BrowserRouter>
    </AuthProvider>
  );
}

export default App;
