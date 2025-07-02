import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { Usuario, UsuarioLogin, UsuarioCrear, Token, AuthContextType } from '../types';
import { authApi, ApiError } from '../services/api';

const AuthContext = createContext<AuthContextType | undefined>(undefined);

interface AuthProviderProps {
  children: ReactNode;
}

export const AuthProvider: React.FC<AuthProviderProps> = ({ children }) => {
  const [usuario, setUsuario] = useState<Usuario | null>(null);
  const [token, setToken] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  // Inicializar el contexto al cargar la aplicación
  useEffect(() => {
    const tokenGuardado = localStorage.getItem('auth_token');
    const usuarioGuardado = localStorage.getItem('auth_usuario');

    if (tokenGuardado && usuarioGuardado) {
      try {
        const usuarioData = JSON.parse(usuarioGuardado);
        setToken(tokenGuardado);
        setUsuario(usuarioData);
        
        // Verificar que el token aún sea válido
        verificarToken(tokenGuardado);
      } catch (error) {
        console.error('Error al cargar datos de autenticación:', error);
        logout();
      }
    }
    
    setLoading(false);
  }, []);

  // Verificar si el token aún es válido
  const verificarToken = async (tokenAVerificar: string) => {
    try {
      await authApi.obtenerPerfil();
    } catch (error) {
      console.warn('Token expirado o inválido, cerrando sesión');
      logout();
    }
  };

  // Función de login
  const login = async (credenciales: UsuarioLogin): Promise<void> => {
    try {
      setLoading(true);
      const response: Token = await authApi.login(credenciales);
      
      // Guardar token y usuario
      localStorage.setItem('auth_token', response.access_token);
      localStorage.setItem('auth_usuario', JSON.stringify(response.usuario));
      
      setToken(response.access_token);
      setUsuario(response.usuario);
    } catch (error) {
      throw error;
    } finally {
      setLoading(false);
    }
  };

  // Función de registro
  const registro = async (usuarioData: UsuarioCrear): Promise<void> => {
    try {
      setLoading(true);
      const response: Token = await authApi.registro(usuarioData);
      
      // Guardar token y usuario
      localStorage.setItem('auth_token', response.access_token);
      localStorage.setItem('auth_usuario', JSON.stringify(response.usuario));
      
      setToken(response.access_token);
      setUsuario(response.usuario);
    } catch (error) {
      throw error;
    } finally {
      setLoading(false);
    }
  };

  // Función de logout
  const logout = (): void => {
    localStorage.removeItem('auth_token');
    localStorage.removeItem('auth_usuario');
    setToken(null);
    setUsuario(null);
  };

  const value: AuthContextType = {
    usuario,
    token,
    login,
    registro,
    logout,
    loading
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};

// Hook personalizado para usar el contexto de autenticación
export const useAuth = (): AuthContextType => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth debe ser usado dentro de un AuthProvider');
  }
  return context;
};

export default AuthContext;
