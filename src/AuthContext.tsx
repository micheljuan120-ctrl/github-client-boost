import React, { createContext, useContext, useState, useEffect } from 'react';

interface AuthContextType {
  token: string | null;
  login: (token: string) => void;
  logout: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [token, setToken] = useState<string | null>(null);
  const [loading, setLoading] = useState(true); // Novo estado de carregamento

  useEffect(() => {
    const storedToken = localStorage.getItem('authToken');
    if (storedToken) {
      setToken(storedToken);
      console.log('AuthContext: Token carregado do localStorage', storedToken);
    } else {
      console.log('AuthContext: Nenhum token encontrado no localStorage');
    }
    setLoading(false); // Finaliza o carregamento
  }, []);

  const login = (newToken: string) => {
    setToken(newToken);
    localStorage.setItem('authToken', newToken);
    console.log('AuthContext: Token salvo no localStorage', newToken);
  };

  const logout = () => {
    setToken(null);
    localStorage.removeItem('authToken');
    console.log('AuthContext: Token removido do localStorage');
  };

  return (
    <AuthContext.Provider value={{ token, login, logout }}>
      {!loading && children} {/* Renderiza children apenas após o carregamento do token */}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
