import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import ProtectedRoute from './components/ProtectedRoute';
import Navbar from './components/Navbar';
import LoginPage from './pages/LoginPage';
import RegisterPage from './pages/RegisterPage';
import JobListPage from './pages/JobListPage';
import JobDetailPage from './pages/JobDetailPage';
import CandidateDashboard from './pages/CandidateDashboard';
import EmployerDashboard from './pages/EmployerDashboard';
import SavedJobs from './pages/SavedJobs';

function App() {
  return (
    <Router>
      <AuthProvider>
        <div className="min-h-screen bg-slate-50">
          <Routes>
            <Route
              path="/login"
              element={
                <ProtectedRoute requireAuth={false}>
                  <LoginPage />
                </ProtectedRoute>
              }
            />
            <Route
              path="/register"
              element={
                <ProtectedRoute requireAuth={false}>
                  <RegisterPage />
                </ProtectedRoute>
              }
            />

            <Route
              path="/jobs"
              element={
                <>
                  <Navbar />
                  <JobListPage />
                </>
              }
            />

            <Route
              path="/jobs/:id"
              element={
                <>
                  <Navbar />
                  <JobDetailPage />
                </>
              }
            />

            <Route
              path="/dashboard"
              element={
                <ProtectedRoute requireRole="Candidate">
                  <Navbar />
                  <CandidateDashboard />
                </ProtectedRoute>
              }
            />

            <Route
              path="/saved"
              element={
                <ProtectedRoute requireRole="Candidate">
                  <Navbar />
                  <SavedJobs />
                </ProtectedRoute>
              }
            />

            <Route
              path="/employer/dashboard"
              element={
                <ProtectedRoute requireRole="Employer">
                  <Navbar />
                  <EmployerDashboard />
                </ProtectedRoute>
              }
            />

            <Route path="/" element={<Navigate to="/jobs" replace />} />
            <Route path="*" element={<Navigate to="/jobs" replace />} />
          </Routes>
        </div>
      </AuthProvider>
    </Router>
  );
}

export default App;
