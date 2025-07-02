import React, { useState } from 'react';
import { ProductoCarrito } from './TiendaOnline';
import { useAuth } from '../contexts/AuthContext';
import { pedidosApi, ApiError } from '../services/api';
import { PedidoCrear } from '../types';

interface CarritoComprasProps {
  carrito: ProductoCarrito[];
  onCerrar: () => void;
  onActualizarCantidad: (productoId: number, nuevaCantidad: number) => void;
  onRemoverProducto: (productoId: number) => void;
  onVaciarCarrito: () => void;
  onActualizarStock: () => void;
  total: number;
  onRequiereLogin: () => void;
}

const CarritoCompras: React.FC<CarritoComprasProps> = ({
  carrito,
  onCerrar,
  onActualizarCantidad,
  onRemoverProducto,
  onVaciarCarrito,
  onActualizarStock,
  onRequiereLogin,
  total
}) => {
  const { usuario } = useAuth();
  const [procesandoCompra, setProcesandoCompra] = useState(false);
  const [compraRealizada, setCompraRealizada] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [direccionEnvio, setDireccionEnvio] = useState('');
  const [notas, setNotas] = useState('');

  const formatearPrecio = (precio: number) => {
    return new Intl.NumberFormat('es-ES', {
      style: 'currency',
      currency: 'EUR'
    }).format(precio);
  };

  const obtenerIconoProducto = (nombre: string) => {
    const nombreLower = nombre.toLowerCase();
    if (nombreLower.includes('laptop')) return '💻';
    if (nombreLower.includes('mouse')) return '🖱️';
    if (nombreLower.includes('teclado')) return '⌨️';
    if (nombreLower.includes('monitor')) return '🖥️';
    if (nombreLower.includes('cargador')) return '🔌';
    return '📦';
  };

  const manejarCompra = async () => {
    // Verificar si el usuario está autenticado
    if (!usuario) {
      onRequiereLogin();
      return;
    }

    setError(null);
    setProcesandoCompra(true);
    
    try {
      // Preparar datos del pedido
      const pedidoData: PedidoCrear = {
        items: carrito.map(item => ({
          articulo_id: item.id!,
          cantidad: item.cantidadCarrito
        })),
        direccion_envio: direccionEnvio.trim() || undefined,
        notas: notas.trim() || undefined
      };

      // Crear el pedido
      await pedidosApi.crearPedido(pedidoData);
      
      // Marcar como compra realizada
      setCompraRealizada(true);
      
      // Vaciar carrito y actualizar stock
      onVaciarCarrito();
      onActualizarStock();
      
    } catch (err) {
      if (err instanceof ApiError) {
        setError(err.message);
      } else {
        setError('Error al procesar la compra. Inténtalo de nuevo.');
      }
    } finally {
      setProcesandoCompra(false);
    }
  };

  const obtenerTotalItems = () => {
    return carrito.reduce((total, item) => total + item.cantidadCarrito, 0);
  };

  if (compraRealizada) {
    return (
      <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
        <div className="bg-white rounded-xl shadow-2xl max-w-md w-full mx-auto p-8 text-center">
          <div className="text-6xl mb-4">🎉</div>
          <h2 className="text-2xl font-bold text-green-600 mb-4">¡Compra Realizada!</h2>
          <p className="text-gray-600 mb-6">
            Tu pedido ha sido procesado exitosamente. Recibirás un email con los detalles.
          </p>
          <div className="bg-green-50 rounded-lg p-4 mb-6">
            <div className="text-sm text-green-800">
              <div className="font-medium">Resumen del pedido:</div>
              <div>{obtenerTotalItems()} artículos por {formatearPrecio(total)}</div>
            </div>
          </div>
          <button
            onClick={onCerrar}
            className="w-full bg-blue-600 hover:bg-blue-700 text-white font-medium py-3 px-6 rounded-lg transition-colors"
          >
            Continuar comprando
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-xl shadow-2xl max-w-2xl w-full mx-auto max-h-[90vh] flex flex-col">
        {/* Header */}
        <div className="flex justify-between items-center p-6 border-b">
          <h2 className="text-2xl font-bold text-gray-900">
            🛒 Carrito de Compras
            {carrito.length > 0 && (
              <span className="ml-2 text-lg font-normal text-gray-500">
                ({obtenerTotalItems()} {obtenerTotalItems() === 1 ? 'artículo' : 'artículos'})
              </span>
            )}
          </h2>
          <button
            onClick={onCerrar}
            className="text-gray-500 hover:text-gray-700 p-2 hover:bg-gray-100 rounded-lg transition-colors"
          >
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        {/* Contenido del carrito */}
        <div className="flex-1 overflow-y-auto p-6">
          {carrito.length === 0 ? (
            <div className="text-center py-12">
              <div className="text-6xl mb-4">🛒</div>
              <h3 className="text-lg font-medium text-gray-900 mb-2">Tu carrito está vacío</h3>
              <p className="text-gray-500">Agrega algunos productos para continuar</p>
            </div>
          ) : (
            <div className="space-y-4">
              {carrito.map((producto) => (
                <div key={producto.id} className="flex items-center space-x-4 bg-gray-50 rounded-lg p-4">
                  {/* Icono del producto */}
                  <div className="flex-shrink-0">
                    <div className="w-16 h-16 bg-blue-100 rounded-lg flex items-center justify-center text-2xl">
                      {obtenerIconoProducto(producto.nombre)}
                    </div>
                  </div>

                  {/* Información del producto */}
                  <div className="flex-1 min-w-0">
                    <h4 className="text-sm font-medium text-gray-900 truncate">{producto.nombre}</h4>
                    <p className="text-sm text-gray-500">{formatearPrecio(producto.precio)} por unidad</p>
                    <p className="text-xs text-gray-400">Stock disponible: {producto.cantidad}</p>
                  </div>

                  {/* Controles de cantidad */}
                  <div className="flex items-center space-x-2">
                    <button
                      onClick={() => onActualizarCantidad(producto.id!, producto.cantidadCarrito - 1)}
                      className="w-8 h-8 rounded-full bg-gray-200 hover:bg-gray-300 flex items-center justify-center text-gray-600 transition-colors"
                    >
                      -
                    </button>
                    <span className="w-8 text-center font-medium">{producto.cantidadCarrito}</span>
                    <button
                      onClick={() => onActualizarCantidad(producto.id!, producto.cantidadCarrito + 1)}
                      disabled={producto.cantidadCarrito >= producto.cantidad}
                      className="w-8 h-8 rounded-full bg-gray-200 hover:bg-gray-300 disabled:bg-gray-100 disabled:cursor-not-allowed flex items-center justify-center text-gray-600 transition-colors"
                    >
                      +
                    </button>
                  </div>

                  {/* Precio total del producto */}
                  <div className="text-right">
                    <div className="font-medium text-gray-900">
                      {formatearPrecio(producto.precio * producto.cantidadCarrito)}
                    </div>
                  </div>

                  {/* Botón eliminar */}
                  <button
                    onClick={() => onRemoverProducto(producto.id!)}
                    className="text-red-500 hover:text-red-700 p-1 hover:bg-red-50 rounded transition-colors"
                    title="Eliminar del carrito"
                  >
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                    </svg>
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Footer con total y botón de compra */}
        {carrito.length > 0 && (
          <div className="border-t p-6 bg-gray-50">
            {/* Mostrar error si existe */}
            {error && (
              <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
                <div className="flex items-center">
                  <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                  {error}
                </div>
              </div>
            )}

            {/* Campos adicionales */}
            <div className="space-y-3 mb-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Dirección de envío (opcional)
                </label>
                <input
                  type="text"
                  value={direccionEnvio}
                  onChange={(e) => setDireccionEnvio(e.target.value)}
                  placeholder="Calle, número, ciudad..."
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Notas del pedido (opcional)
                </label>
                <textarea
                  value={notas}
                  onChange={(e) => setNotas(e.target.value)}
                  placeholder="Instrucciones especiales..."
                  rows={2}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm resize-none"
                />
              </div>
            </div>

            {/* Estado de autenticación */}
            {!usuario && (
              <div className="bg-blue-50 border border-blue-200 rounded-lg p-3 mb-4">
                <div className="flex items-center text-blue-800 text-sm">
                  <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                  Necesitas iniciar sesión para finalizar la compra
                </div>
              </div>
            )}

            {/* Resumen del pedido */}
            <div className="space-y-2 mb-4">
              <div className="flex justify-between text-sm">
                <span>Subtotal ({obtenerTotalItems()} artículos):</span>
                <span>{formatearPrecio(total)}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span>Envío:</span>
                <span className="text-green-600">Gratis</span>
              </div>
              <div className="border-t pt-2">
                <div className="flex justify-between text-lg font-bold">
                  <span>Total:</span>
                  <span className="text-green-600">{formatearPrecio(total)}</span>
                </div>
              </div>
            </div>

            {/* Botones de acción */}
            <div className="space-y-3">
              <button
                onClick={manejarCompra}
                disabled={procesandoCompra}
                className="w-full bg-green-600 hover:bg-green-700 disabled:bg-gray-400 text-white font-medium py-3 px-6 rounded-lg transition-colors flex items-center justify-center space-x-2"
              >
                {procesandoCompra ? (
                  <>
                    <svg className="animate-spin h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                    </svg>
                    <span>Procesando compra...</span>
                  </>
                ) : (
                  <>
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z" />
                    </svg>
                    <span>Finalizar Compra</span>
                  </>
                )}
              </button>
              
              <button
                onClick={onCerrar}
                className="w-full bg-gray-200 hover:bg-gray-300 text-gray-800 font-medium py-3 px-6 rounded-lg transition-colors"
              >
                Continuar comprando
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default CarritoCompras;
