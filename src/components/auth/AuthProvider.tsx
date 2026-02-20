import React, { useEffect } from 'react';
import { useAuth } from '../../hooks/useAuth';

interface AuthProviderProps {
  children: React.ReactNode;
}

const AuthProvider: React.FC<AuthProviderProps> = ({ children }) => {
  const { restoreUser } = useAuth();

  useEffect(() => {
    // Restore user state on app load
    restoreUser();
  }, [restoreUser]);

  return <>{children}</>;
};

export default AuthProvider;
