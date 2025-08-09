// src/App.tsx
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './services/AuthContext';
import LoginPage from './pages/LoginPage';
import AdminPage from './pages/AdminPage';
import ClientPage from './pages/ClientPage';
import ProtectedRoute from './routes/ProtectedRoute';

export default function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <Routes>
          {/* público */}
          <Route path="/login" element={<LoginPage />} />
          <Route path="/cliente" element={<ClientPage />} />

          {/* protegido */}
          <Route
            path="/admin"
            element={
              <ProtectedRoute>
                <AdminPage />
              </ProtectedRoute>
            }
          />

          {/* default → cliente */}
          <Route path="*" element={<Navigate to="/cliente" replace />} />
        </Routes>
      </BrowserRouter>
    </AuthProvider>
  );
}
