import React, { useState, useEffect } from 'react';
import { inventarioApi, ApiError } from '../services/api';
import { ArticuloInventario } from '../types';
import FormularioArticulo from './FormularioArticulo';

const ListaInventario: React.FC = () => {
  const [articulos, setArticulos] = useState<ArticuloInventario[]>([]);
  const [cargando, setCargando] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [mostrarFormulario, setMostrarFormulario] = useState(false);
  const [articuloEditando, setArticuloEditando] = useState<ArticuloInventario | null>(null);

  useEffect(() => {
    cargarArticulos();
  }, []);

  const cargarArticulos = async () => {
    try {
      setCargando(true);
      setError(null);
      const data = await inventarioApi.obtenerArticulos();
      setArticulos(data);
    } catch (err) {
      console.error('Error al cargar artículos:', err);
      setError(err instanceof ApiError ? err.message : 'Error al cargar los artículos');
    } finally {
      setCargando(false);
    }
  };

  const manejarEliminar = async (id: number) => {
    if (window.confirm('¿Estás seguro de que deseas eliminar este artículo?')) {
      try {
        await inventarioApi.eliminarArticulo(id);
        await cargarArticulos();
      } catch (err) {
        console.error('Error al eliminar artículo:', err);
        setError(err instanceof ApiError ? err.message : 'Error al eliminar el artículo');
      }
    }
  };

  const manejarEditar = (articulo: ArticuloInventario) => {
    setArticuloEditando(articulo);
    setMostrarFormulario(true);
  };

  const manejarNuevoArticulo = () => {
    setArticuloEditando(null);
    setMostrarFormulario(true);
  };

  const manejarCerrarFormulario = () => {
    setMostrarFormulario(false);
    setArticuloEditando(null);
  };

  const manejarGuardadoExitoso = async () => {
    setMostrarFormulario(false);
    setArticuloEditando(null);
    await cargarArticulos();
  };

  const formatearPrecio = (precio: number) => {
    return new Intl.NumberFormat('es-ES', {
      style: 'currency',
      currency: 'EUR'
    }).format(precio);
  };

  if (cargando) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-3xl font-bold text-gray-800">Gestión de Inventario</h1>
        <button
          onClick={manejarNuevoArticulo}
          className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded"
        >
          Nuevo Artículo
        </button>
      </div>

      {error && (
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
          {error}
        </div>
      )}

      {mostrarFormulario && (
        <FormularioArticulo
          articulo={articuloEditando}
          onGuardar={manejarGuardadoExitoso}
          onCancelar={manejarCerrarFormulario}
        />
      )}

      {articulos.length === 0 ? (
        <div className="text-center py-8">
          <p className="text-gray-500 text-lg">No hay artículos en el inventario.</p>
          <button
            onClick={manejarNuevoArticulo}
            className="mt-4 bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded"
          >
            Agregar primer artículo
          </button>
        </div>
      ) : (
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {articulos.map((articulo) => (
            <div key={articulo.id} className="bg-white rounded-lg shadow-md p-6 border">
              <div className="flex justify-between items-start mb-4">
                <h3 className="text-xl font-semibold text-gray-800">{articulo.nombre}</h3>
                <div className="flex space-x-2">
                  <button
                    onClick={() => manejarEditar(articulo)}
                    className="text-blue-500 hover:text-blue-700"
                    title="Editar"
                  >
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                    </svg>
                  </button>
                  <button
                    onClick={() => manejarEliminar(articulo.id!)}
                    className="text-red-500 hover:text-red-700"
                    title="Eliminar"
                  >
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                    </svg>
                  </button>
                </div>
              </div>
              
              <p className="text-gray-600 mb-3">{articulo.descripcion}</p>
              
              <div className="flex justify-between items-center">
                <div>
                  <p className="text-sm text-gray-500">Cantidad</p>
                  <p className="text-lg font-semibold">{articulo.cantidad}</p>
                </div>
                <div className="text-right">
                  <p className="text-sm text-gray-500">Precio</p>
                  <p className="text-lg font-semibold text-green-600">{formatearPrecio(articulo.precio)}</p>
                </div>
              </div>

              <div className="mt-4 pt-4 border-t border-gray-200">
                <p className="text-xs text-gray-400">
                  Total: {formatearPrecio(articulo.cantidad * articulo.precio)}
                </p>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default ListaInventario;
