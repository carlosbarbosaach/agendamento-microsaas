import { Navigate } from 'react-router-dom';
import { useAuth } from '../services/AuthContext';
import type { ReactElement } from 'react';

interface Props {
  children: ReactElement; // em vez de JSX.Element
}

export default function ProtectedRoute({ children }: Props) {
  const { user } = useAuth();
  if (!user) return <Navigate to="/login" replace />;
  return children;
}
