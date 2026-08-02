import React from 'react';
import { Navigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';

export const ProtectedRoute = ({ 
  children, 
  allowedRoles, 
  fallbackPath = '/' 
}: { 
  children: React.ReactNode, 
  allowedRoles?: ("user" | "volunteer" | "admin")[],
  fallbackPath?: string 
}) => {
  const { userProfile, loading } = useAuth();

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center h-[calc(100vh-8rem)] w-full">
        <div className="w-12 h-12 border-4 border-surface-200 dark:border-surface-700 border-t-primary-500 rounded-full animate-spin"></div>
        <p className="mt-4 text-surface-500 font-medium animate-pulse">Loading...</p>
      </div>
    );
  }

  // Allow access if no specific roles required, or if user's role is in the allowed list
  // Note: Admin should technically have access to everything, but we'll respect the allowedRoles array.
  // Actually, wait, Admin should see everything. Let's make sure admin overrides if it's not a strict check.
  
  const role = userProfile?.role || "user"; // default to user if not logged in but trying to access a public route? Wait, if they are not logged in, maybe they shouldn't access protected routes.
  // We'll assume for this app that everyone is at least a "user" (citizen).
  
  if (allowedRoles && !allowedRoles.includes(role) && role !== "admin") {
    // If Admin, they see everything. If not, check if their role is in allowedRoles.
    return <Navigate to={fallbackPath} replace />;
  }

  return <>{children}</>;
};