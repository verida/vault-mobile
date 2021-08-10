import React, { createContext, FC, useCallback, useContext, useMemo, useState } from 'react';
import { isAuthorized } from 'api';

type AuthContextState = {
  initialize: () => Promise<boolean>,
  authenticated: boolean,
  loaded: boolean
}

const AuthContext = createContext<AuthContextState>({
  initialize: async () => false,
  authenticated: false,
  loaded: false
});

export const AuthProvider: FC = ({ children }) => {
  const [authenticated, setAuthenticated] = useState(false);
  const [loaded, setLoaded] = useState(false);

  const initialize = useCallback(async () => {
    const authorized = await isAuthorized();
    setLoaded(true);
    setAuthenticated(authorized);
    return authorized;
  }, []);

  const context = useMemo(() => ({
    initialize,
    authenticated,
    loaded
  }), [initialize, authenticated, loaded]);

  return (
    <AuthContext.Provider value={context}>
      {children}
    </AuthContext.Provider>
  );
};

export function useAuth() {
  return useContext(AuthContext);
}
