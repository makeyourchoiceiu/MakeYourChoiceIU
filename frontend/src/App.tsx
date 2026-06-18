import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from '@/shared/contexts/AuthContext';
import { useAuth } from '@/shared/hooks/useAuth';
import { AdminElectivesPage, ElectivesPage, LoginPage } from './pages';
import { Header } from '@/shared/layouts/Header';  // <-- import the external Header

function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <Routes>
          <Route path="/login" element={<LoginPage />} />
          <Route path="/*" element={<ProtectedRoutes />} />
        </Routes>
      </BrowserRouter>
    </AuthProvider>
  );
}

function ProtectedRoutes() {
  const { session, isLoading, isAdminMode, isStudentMode } = useAuth();

  if (isLoading) {
    return <div className="flex min-h-screen items-center justify-center">Loading...</div>;
  }
  if (!session) {
    return <Navigate to="/login" replace />;
  }

  if (isAdminMode) {
    return (
      <div>
        <Header />
        <AdminElectivesPage />
      </div>
    );
  }

  if (isStudentMode) {
    return (
      <div>
        <Header />
        <ElectivesPage />
      </div>
    );
  }

  return <Navigate to="/login" replace />;
}

export default App;