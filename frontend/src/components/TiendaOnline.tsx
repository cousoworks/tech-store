import React, { useState, useEffect } from 'react';
import { inventarioApi, generalApi, ApiError } from '../services/api';
import { ArticuloInventario } from '../types';
import { useAuth } from '../contexts/AuthContext';
import TarjetaProducto from './TarjetaProducto';
import CarritoCompras from './CarritoCompras';
import AuthModal from './AuthModal';
import ListaInventario from './ListaInventario';

export interface ProductoCarrito extends ArticuloInventario {
  cantidadCarrito: number;
}

const TiendaOnline: React.FC = () => {
  const { usuario, logout } = useAuth();
  const [productos, setProductos] = useState<ArticuloInventario[]>([]);
  const [carrito, setCarrito] = useState<ProductoCarrito[]>([]);
  const [cargando, setCargando] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [mostrarCarrito, setMostrarCarrito] = useState(false);
  const [mostrarAuth, setMostrarAuth] = useState(false);
  const [mostrarAdmin, setMostrarAdmin] = useState(false);
  const [busqueda, setBusqueda] = useState('');
  const [estadisticas, setEstadisticas] = useState<{ total_articulos: number } | null>(null);

  useEffect(() => {
    cargarProductos();
    cargarEstadisticas();
  }, []);

  const cargarProductos = async () => {
    try {
      setCargando(true);
      setError(null);
      const data = await inventarioApi.obtenerArticulos();
      // Solo mostrar productos que tienen stock
      setProductos(data.filter(producto => producto.cantidad > 0));
    } catch (err) {
      console.error('Error al cargar productos:', err);
      setError(err instanceof ApiError ? err.message : 'Error al cargar los productos');
    } finally {
      setCargando(false);
    }
  };

  const cargarEstadisticas = async () => {
    try {
      const data = await generalApi.obtenerEstadisticas();
      setEstadisticas(data);
    } catch (err) {
      console.error('Error al cargar estadísticas:', err);
    }
  };

  const agregarAlCarrito = (producto: ArticuloInventario, cantidad: number = 1) => {
    setCarrito(carritoActual => {
      const productoExistente = carritoActual.find(item => item.id === producto.id);
      
      if (productoExistente) {
        // Si ya existe, aumentar cantidad
        return carritoActual.map(item =>
          item.id === producto.id
            ? { ...item, cantidadCarrito: Math.min(item.cantidadCarrito + cantidad, producto.cantidad) }
            : item
        );
      } else {
        // Si no existe, agregarlo
        return [...carritoActual, { ...producto, cantidadCarrito: cantidad }];
      }
    });
  };

  const removerDelCarrito = (productoId: number) => {
    setCarrito(carrito.filter(item => item.id !== productoId));
  };

  const actualizarCantidadCarrito = (productoId: number, nuevaCantidad: number) => {
    if (nuevaCantidad <= 0) {
      removerDelCarrito(productoId);
      return;
    }

    setCarrito(carritoActual =>
      carritoActual.map(item =>
        item.id === productoId
          ? { ...item, cantidadCarrito: Math.min(nuevaCantidad, item.cantidad) }
          : item
      )
    );
  };

  const obtenerTotalCarrito = () => {
    return carrito.reduce((total, item) => total + (item.precio * item.cantidadCarrito), 0);
  };

  const obtenerCantidadTotalItems = () => {
    return carrito.reduce((total, item) => total + item.cantidadCarrito, 0);
  };

  const vaciarCarrito = () => {
    setCarrito([]);
  };

  const manejarRequiereLogin = () => {
    setMostrarCarrito(false);
    setMostrarAuth(true);
  };

  const manejarLogout = () => {
    logout();
    vaciarCarrito();
  };

  const productosFiltrados = productos.filter(producto =>
    producto.nombre.toLowerCase().includes(busqueda.toLowerCase()) ||
    producto.descripcion.toLowerCase().includes(busqueda.toLowerCase())
  );

  const formatearPrecio = (precio: number) => {
    return new Intl.NumberFormat('es-ES', {
      style: 'currency',
      currency: 'EUR'
    }).format(precio);
  };

  if (cargando) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header de la tienda */}
      <header className="bg-white shadow-lg border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-6">
            <div className="flex items-center">
              <h1 className="text-3xl font-bold text-gray-900">🏪 TechStore</h1>
              <p className="ml-4 text-gray-600">Tu tienda de tecnología</p>
              {estadisticas && (
                <div className="ml-6 px-3 py-1 bg-blue-100 text-blue-800 rounded-full text-sm font-medium">
                  📦 {estadisticas.total_articulos} productos disponibles
                </div>
              )}
            </div>
            
            {/* Información del usuario y carrito */}
            <div className="flex items-center space-x-4">
              {/* Información del usuario */}
              {usuario ? (
                <div className="flex items-center space-x-3">
                  <div className="text-right">
                    <div className="text-sm font-medium text-gray-900">
                      {usuario.nombre} {usuario.apellidos}
                    </div>
                    <div className="text-xs text-gray-500 capitalize">
                      {usuario.rol}
                    </div>
                  </div>
                  
                  {/* Botón de administración (solo para admins) */}
                  {usuario.rol === 'admin' && (
                    <button
                      onClick={() => setMostrarAdmin(!mostrarAdmin)}
                      className={`p-2 rounded-lg transition-colors ${
                        mostrarAdmin 
                          ? 'bg-blue-100 text-blue-600' 
                          : 'text-gray-500 hover:text-gray-700 hover:bg-gray-100'
                      }`}
                      title="Panel de Administración"
                    >
                      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                      </svg>
                    </button>
                  )}
                  
                  <button
                    onClick={manejarLogout}
                    className="text-gray-500 hover:text-gray-700 p-2 hover:bg-gray-100 rounded-lg transition-colors"
                    title="Cerrar sesión"
                  >
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
                    </svg>
                  </button>
                </div>
              ) : (
                <button
                  onClick={() => setMostrarAuth(true)}
                  className="bg-gray-600 hover:bg-gray-700 text-white px-4 py-2 rounded-lg font-medium transition-colors"
                >
                  Iniciar Sesión
                </button>
              )}
              
              {/* Carrito */}
              <button
                onClick={() => setMostrarCarrito(true)}
                className="relative bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded-lg font-medium transition-colors duration-200 flex items-center space-x-2"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 3h2l.4 2M7 13h10l4-8H5.4m0 0L7 13m0 0l-2.5 5M7 13l2.5 5m0 0h8" />
                </svg>
                <span>Carrito</span>
                {obtenerCantidadTotalItems() > 0 && (
                  <span className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full w-6 h-6 flex items-center justify-center text-xs font-bold">
                    {obtenerCantidadTotalItems()}
                  </span>
                )}
              </button>
            </div>
          </div>
        </div>
      </header>

      {/* Barra de búsqueda */}
      <div className="bg-white border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="relative max-w-md mx-auto">
            <input
              type="text"
              placeholder="Buscar productos..."
              value={busqueda}
              onChange={(e) => setBusqueda(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
            <svg className="absolute left-3 top-2.5 h-5 w-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
            </svg>
          </div>
        </div>
      </div>

      {/* Contenido principal */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {error && (
          <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-6">
            <div className="flex items-center">
              <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              {error}
            </div>
          </div>
        )}

        {/* Estadísticas de la tienda */}
        <div className="bg-gradient-to-r from-blue-600 to-purple-600 rounded-lg p-6 mb-8 text-white">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="text-center">
              <div className="text-3xl font-bold">{productos.length}</div>
              <div className="text-blue-100">Productos disponibles</div>
            </div>
            <div className="text-center">
              <div className="text-3xl font-bold">{obtenerCantidadTotalItems()}</div>
              <div className="text-blue-100">Artículos en carrito</div>
            </div>
            <div className="text-center">
              <div className="text-3xl font-bold">{formatearPrecio(obtenerTotalCarrito())}</div>
              <div className="text-blue-100">Total del carrito</div>
            </div>
          </div>
        </div>

        {/* Grid de productos */}
        {productosFiltrados.length === 0 ? (
          <div className="text-center py-12">
            <svg className="mx-auto h-24 w-24 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M20 13V6a2 2 0 00-2-2H6a2 2 0 00-2 2v7m16 0v5a2 2 0 01-2 2H6a2 2 0 01-2 2v-5m16 0h-2.586a1 1 0 00-.707.293l-2.414 2.414a1 1 0 01-.707.293h-3.172a1 1 0 01-.707-.293l-2.414-2.414A1 1 0 006.586 13H4" />
            </svg>
            <h3 className="text-lg font-medium text-gray-900 mt-4">No hay productos disponibles</h3>
            <p className="text-gray-500 mt-2">
              {busqueda ? 'No se encontraron productos que coincidan con tu búsqueda.' : 'Vuelve pronto para ver nuestros productos.'}
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {productosFiltrados.map((producto) => (
              <TarjetaProducto
                key={producto.id}
                producto={producto}
                onAgregarCarrito={agregarAlCarrito}
                cantidadEnCarrito={carrito.find(item => item.id === producto.id)?.cantidadCarrito || 0}
              />
            ))}
          </div>
        )}
      </main>

      {/* Carrito de compras modal */}
      {mostrarCarrito && (
        <CarritoCompras
          carrito={carrito}
          onCerrar={() => setMostrarCarrito(false)}
          onActualizarCantidad={actualizarCantidadCarrito}
          onRemoverProducto={removerDelCarrito}
          onVaciarCarrito={vaciarCarrito}
          onActualizarStock={cargarProductos}
          onRequiereLogin={manejarRequiereLogin}
          total={obtenerTotalCarrito()}
        />
      )}

      {/* Modal de autenticación */}
      {mostrarAuth && (
        <AuthModal
          isOpen={mostrarAuth}
          onClose={() => setMostrarAuth(false)}
        />
      )}
    </div>
  );
};

export default TiendaOnline;
