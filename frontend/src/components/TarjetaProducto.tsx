import React, { useState } from 'react';
import { ArticuloInventario } from '../types';

interface TarjetaProductoProps {
  producto: ArticuloInventario;
  onAgregarCarrito: (producto: ArticuloInventario, cantidad: number) => void;
  cantidadEnCarrito: number;
}

const TarjetaProducto: React.FC<TarjetaProductoProps> = ({ 
  producto, 
  onAgregarCarrito, 
  cantidadEnCarrito 
}) => {
  const [cantidad, setCantidad] = useState(1);
  const [agregandoCarrito, setAgregandoCarrito] = useState(false);

  const formatearPrecio = (precio: number) => {
    return new Intl.NumberFormat('es-ES', {
      style: 'currency',
      currency: 'EUR'
    }).format(precio);
  };

  const manejarAgregarCarrito = async () => {
    setAgregandoCarrito(true);
    onAgregarCarrito(producto, cantidad);
    
    // Efecto visual
    setTimeout(() => {
      setAgregandoCarrito(false);
      setCantidad(1);
    }, 500);
  };

  const obtenerImagenProducto = (nombre: string) => {
    const nombreLower = nombre.toLowerCase();
    if (nombreLower.includes('laptop') || nombreLower.includes('computador')) {
      return '💻';
    } else if (nombreLower.includes('mouse') || nombreLower.includes('ratón')) {
      return '🖱️';
    } else if (nombreLower.includes('teclado')) {
      return '⌨️';
    } else if (nombreLower.includes('monitor')) {
      return '🖥️';
    } else if (nombreLower.includes('cargador') || nombreLower.includes('cable')) {
      return '🔌';
    } else if (nombreLower.includes('auricular') || nombreLower.includes('audio')) {
      return '🎧';
    } else if (nombreLower.includes('teléfono') || nombreLower.includes('móvil')) {
      return '📱';
    } else if (nombreLower.includes('tablet')) {
      return '📱';
    } else if (nombreLower.includes('impresora')) {
      return '🖨️';
    } else if (nombreLower.includes('cámara')) {
      return '📷';
    }
    return '📦';
  };

  const obtenerBadgeStock = () => {
    if (producto.cantidad === 0) {
      return <span className="bg-red-100 text-red-800 text-xs font-medium px-2.5 py-0.5 rounded">Sin stock</span>;
    } else if (producto.cantidad <= 5) {
      return <span className="bg-yellow-100 text-yellow-800 text-xs font-medium px-2.5 py-0.5 rounded">Pocas unidades</span>;
    } else {
      return <span className="bg-green-100 text-green-800 text-xs font-medium px-2.5 py-0.5 rounded">Disponible</span>;
    }
  };

  const estaDisponible = producto.cantidad > cantidadEnCarrito;
  const cantidadMaxima = Math.min(producto.cantidad - cantidadEnCarrito, 10);

  return (
    <div className="bg-white rounded-lg shadow-md hover:shadow-xl transition-all duration-300 transform hover:-translate-y-1 overflow-hidden">
      {/* Imagen/Icono del producto */}
      <div className="bg-gradient-to-br from-blue-50 to-indigo-100 p-8 flex items-center justify-center">
        <div className="text-6xl">{obtenerImagenProducto(producto.nombre)}</div>
      </div>

      {/* Contenido */}
      <div className="p-6">
        {/* Header con badge de stock */}
        <div className="flex justify-between items-start mb-3">
          <h3 className="text-lg font-semibold text-gray-900 line-clamp-2">{producto.nombre}</h3>
          {obtenerBadgeStock()}
        </div>

        {/* Descripción */}
        <p className="text-gray-600 text-sm mb-4 line-clamp-3">{producto.descripcion}</p>

        {/* Información de stock */}
        <div className="mb-4">
          <div className="flex justify-between text-sm text-gray-500">
            <span>Stock disponible:</span>
            <span className="font-medium">{producto.cantidad} unidades</span>
          </div>
          {cantidadEnCarrito > 0 && (
            <div className="flex justify-between text-sm text-blue-600 mt-1">
              <span>En tu carrito:</span>
              <span className="font-medium">{cantidadEnCarrito} unidades</span>
            </div>
          )}
        </div>

        {/* Precio */}
        <div className="mb-4">
          <div className="text-3xl font-bold text-green-600">{formatearPrecio(producto.precio)}</div>
          <div className="text-sm text-gray-500">Por unidad</div>
        </div>

        {/* Selector de cantidad y botón */}
        {estaDisponible ? (
          <div className="space-y-3">
            <div className="flex items-center space-x-2">
              <label className="text-sm font-medium text-gray-700">Cantidad:</label>
              <select
                value={cantidad}
                onChange={(e) => setCantidad(Number(e.target.value))}
                className="border border-gray-300 rounded-md px-3 py-1 text-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              >
                {Array.from({ length: cantidadMaxima }, (_, i) => i + 1).map(num => (
                  <option key={num} value={num}>{num}</option>
                ))}
              </select>
            </div>

            <button
              onClick={manejarAgregarCarrito}
              disabled={agregandoCarrito || cantidadMaxima === 0}
              className={`w-full font-medium py-3 px-4 rounded-lg transition-all duration-200 flex items-center justify-center space-x-2 ${
                agregandoCarrito
                  ? 'bg-green-500 text-white'
                  : 'bg-blue-600 hover:bg-blue-700 text-white hover:shadow-lg'
              } disabled:bg-gray-400 disabled:cursor-not-allowed`}
            >
              {agregandoCarrito ? (
                <>
                  <svg className="animate-spin h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                  </svg>
                  <span>¡Agregado!</span>
                </>
              ) : (
                <>
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 3h2l.4 2M7 13h10l4-8H5.4m0 0L7 13m0 0l-2.5 5M7 13l2.5 5m0 0h8" />
                  </svg>
                  <span>Agregar al carrito</span>
                </>
              )}
            </button>

            {/* Precio total para la cantidad seleccionada */}
            {cantidad > 1 && (
              <div className="text-center text-sm text-gray-600">
                Total: <span className="font-semibold text-green-600">{formatearPrecio(producto.precio * cantidad)}</span>
              </div>
            )}
          </div>
        ) : (
          <div className="bg-gray-100 rounded-lg p-4 text-center">
            <div className="text-gray-500 font-medium">Sin stock disponible</div>
            <div className="text-sm text-gray-400 mt-1">Todas las unidades están en tu carrito</div>
          </div>
        )}
      </div>
    </div>
  );
};

export default TarjetaProducto;
