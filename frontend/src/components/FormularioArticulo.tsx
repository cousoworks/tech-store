import React, { useState, useEffect } from 'react';
import { inventarioApi, ApiError } from '../services/api';
import { ArticuloInventario, ArticuloInventarioCrear, ArticuloInventarioActualizar } from '../types';

interface FormularioArticuloProps {
  articulo?: ArticuloInventario | null;
  onGuardar: () => void;
  onCancelar: () => void;
}

const FormularioArticulo: React.FC<FormularioArticuloProps> = ({ articulo, onGuardar, onCancelar }) => {
  const [formData, setFormData] = useState({
    nombre: '',
    descripcion: '',
    cantidad: 0,
    precio: 0,
  });
  const [guardando, setGuardando] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (articulo) {
      setFormData({
        nombre: articulo.nombre,
        descripcion: articulo.descripcion,
        cantidad: articulo.cantidad,
        precio: articulo.precio,
      });
    } else {
      setFormData({
        nombre: '',
        descripcion: '',
        cantidad: 0,
        precio: 0,
      });
    }
  }, [articulo]);

  const manejarCambio = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: name === 'cantidad' || name === 'precio' ? parseFloat(value) || 0 : value,
    }));
  };

  const manejarEnvio = async (e: React.FormEvent) => {
    e.preventDefault();
    setGuardando(true);
    setError(null);

    try {
      if (articulo?.id) {
        // Actualizar artículo existente
        const datosActualizacion: ArticuloInventarioActualizar = formData;
        await inventarioApi.actualizarArticulo(articulo.id, datosActualizacion);
      } else {
        // Crear nuevo artículo
        const datosCreacion: ArticuloInventarioCrear = formData;
        await inventarioApi.crearArticulo(datosCreacion);
      }
      onGuardar();
    } catch (err) {
      console.error('Error al guardar artículo:', err);
      setError(err instanceof ApiError ? err.message : 'Error al guardar el artículo');
    } finally {
      setGuardando(false);
    }
  };

  const esFormularioValido = () => {
    return formData.nombre.trim() !== '' && 
           formData.descripcion.trim() !== '' && 
           formData.cantidad >= 0 && 
           formData.precio >= 0;
  };

  return (
    <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50">
      <div className="relative top-20 mx-auto p-5 border w-96 shadow-lg rounded-md bg-white">
        <div className="mt-3">
          <h3 className="text-lg font-medium text-gray-900 mb-4">
            {articulo ? 'Editar Artículo' : 'Nuevo Artículo'}
          </h3>

          {error && (
            <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
              {error}
            </div>
          )}

          <form onSubmit={manejarEnvio} className="space-y-4">
            <div>
              <label htmlFor="nombre" className="block text-sm font-medium text-gray-700 mb-1">
                Nombre *
              </label>
              <input
                type="text"
                id="nombre"
                name="nombre"
                value={formData.nombre}
                onChange={manejarCambio}
                required
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="Nombre del artículo"
              />
            </div>

            <div>
              <label htmlFor="descripcion" className="block text-sm font-medium text-gray-700 mb-1">
                Descripción *
              </label>
              <textarea
                id="descripcion"
                name="descripcion"
                value={formData.descripcion}
                onChange={manejarCambio}
                required
                rows={3}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="Descripción del artículo"
              />
            </div>

            <div>
              <label htmlFor="cantidad" className="block text-sm font-medium text-gray-700 mb-1">
                Cantidad *
              </label>
              <input
                type="number"
                id="cantidad"
                name="cantidad"
                value={formData.cantidad}
                onChange={manejarCambio}
                required
                min="0"
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="0"
              />
            </div>

            <div>
              <label htmlFor="precio" className="block text-sm font-medium text-gray-700 mb-1">
                Precio (€) *
              </label>
              <input
                type="number"
                id="precio"
                name="precio"
                value={formData.precio}
                onChange={manejarCambio}
                required
                min="0"
                step="0.01"
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="0.00"
              />
            </div>

            <div className="flex justify-end space-x-3 pt-4">
              <button
                type="button"
                onClick={onCancelar}
                className="px-4 py-2 bg-gray-300 text-gray-700 rounded-md hover:bg-gray-400 focus:outline-none focus:ring-2 focus:ring-gray-500"
                disabled={guardando}
              >
                Cancelar
              </button>
              <button
                type="submit"
                disabled={!esFormularioValido() || guardando}
                className="px-4 py-2 bg-blue-500 text-white rounded-md hover:bg-blue-600 focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:bg-gray-400 disabled:cursor-not-allowed"
              >
                {guardando ? 'Guardando...' : (articulo ? 'Actualizar' : 'Crear')}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default FormularioArticulo;
