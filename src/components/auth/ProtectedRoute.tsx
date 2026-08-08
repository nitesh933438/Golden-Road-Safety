import React from 'react';
import { useAuth, AppRole } from '../../context/AuthContext';
import { AccessDenied } from '../../pages/AccessDenied';

export const ProtectedRoute = ({ 
  children, 
  allowedRoles
}: { 
  children: React.ReactNode, 
  allowedRoles?: AppRole[]
}) => {
  const { userProfile, loading, isAdmin } = useAuth();

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center h-[calc(100vh-8rem)] w-full">
        <div className="w-12 h-12 border-4 border-surface-200 dark:border-surface-700 border-t-amber-500 rounded-full animate-spin"></div>
        <p className="mt-4 text-surface-400 font-medium animate-pulse">Checking authorization...</p>
      </div>
    );
  }

  const role = userProfile?.role || "user";
  
  // Admin has access to all routes; otherwise check if role is in allowedRoles
  if (allowedRoles && !allowedRoles.includes(role) && !isAdmin) {
    return <AccessDenied requiredRoles={allowedRoles} />;
  }

  return <>{children}</>;
};