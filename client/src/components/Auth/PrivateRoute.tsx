import React from 'react';
import { Navigate, Outlet } from 'react-router-dom';
import { useAuth } from '@/hooks/useAuth';

export const PrivateRoute: React.FC = () => {
  const { isAuthenticated, loading } = useAuth();

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-bg-base px-4">
        <div className="w-full max-w-sm rounded-xl border border-border bg-bg-surface p-5 animate-pulse">
          <div className="h-4 w-1/2 rounded bg-bg-elevated" />
          <div className="mt-3 h-3 w-full rounded bg-bg-elevated" />
          <div className="mt-2 h-3 w-5/6 rounded bg-bg-elevated" />
        </div>
      </div>
    );
  }

  return isAuthenticated ? <Outlet /> : <Navigate to="/login" replace />;
};
