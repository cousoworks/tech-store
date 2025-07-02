import React, { useState } from 'react';
import './App.css';
import { AuthProvider, useAuth } from './contexts/AuthContext';
import TiendaOnline from './components/TiendaOnline';
import ListaInventario from './components/ListaInventario';

const AppContent: React.FC = () => {
  const { usuario } = useAuth();
  const [vistaActual, setVistaActual] = useState<'tienda' | 'admin'>('tienda');

  // Solo mostrar el panel de administración si el usuario es admin
  const esAdmin = usuario?.rol === 'admin';

  return (
    <div className="App min-h-screen bg-gray-100">
      {/* Navegación superior - Solo mostrar si hay usuario o está en la tienda */}
      {(usuario || vistaActual === 'tienda') && (
        <nav className="bg-white shadow-sm border-b">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex justify-between items-center h-16">
              <div className="flex items-center space-x-8">
                <h1 className="text-xl font-bold text-gray-900">TechStore</h1>
                <div className="flex space-x-4">
                  <button
                    onClick={() => setVistaActual('tienda')}
                    className={`px-3 py-2 rounded-md text-sm font-medium transition-colors ${
                      vistaActual === 'tienda'
                        ? 'bg-blue-100 text-blue-700'
                        : 'text-gray-500 hover:text-gray-700 hover:bg-gray-100'
                    }`}
                  >
                    🏪 Tienda
                  </button>
                  {esAdmin && (
                    <button
                      onClick={() => setVistaActual('admin')}
                      className={`px-3 py-2 rounded-md text-sm font-medium transition-colors ${
                        vistaActual === 'admin'
                          ? 'bg-blue-100 text-blue-700'
                          : 'text-gray-500 hover:text-gray-700 hover:bg-gray-100'
                      }`}
                    >
                      ⚙️ Administración
                    </button>
                  )}
                </div>
              </div>
              {usuario && (
                <div className="flex items-center space-x-4">
                  <span className="text-sm text-gray-600">
                    {usuario.nombre} ({usuario.rol})
                  </span>
                </div>
              )}
            </div>
          </div>
        </nav>
      )}

      {/* Contenido principal */}
      <main>
        {vistaActual === 'tienda' ? (
          <TiendaOnline />
        ) : esAdmin ? (
          <div className="max-w-7xl mx-auto py-6 px-4 sm:px-6 lg:px-8">
            <div className="bg-white rounded-lg shadow">
              <div className="px-6 py-4 border-b border-gray-200">
                <h2 className="text-lg font-medium text-gray-900">
                  Panel de Administración de Inventario
                </h2>
                <p className="mt-1 text-sm text-gray-600">
                  Gestiona los productos de tu tienda
                </p>
              </div>
              <ListaInventario />
            </div>
          </div>
        ) : (
          <div className="flex items-center justify-center min-h-screen">
            <div className="text-center">
              <h2 className="text-2xl font-bold text-gray-900 mb-4">Acceso Restringido</h2>
              <p className="text-gray-600">No tienes permisos para acceder al panel de administración.</p>
            </div>
          </div>
        )}
      </main>
    </div>
  );
};

function App() {
  return (
    <AuthProvider>
      <AppContent />
    </AuthProvider>
  );
}

export default App;
