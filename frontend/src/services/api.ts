import { ArticuloInventario, ArticuloInventarioCrear, ArticuloInventarioActualizar, Usuario, UsuarioCrear, UsuarioLogin, Token, Pedido, PedidoCrear, MensajeRespuesta } from '../types';

const API_BASE_URL = process.env.REACT_APP_API_URL || 'http://localhost:8000';

class ApiError extends Error {
  constructor(public status: number, message: string) {
    super(message);
    this.name = 'ApiError';
  }
}

const handleResponse = async (response: Response) => {
  if (!response.ok) {
    let errorMessage = `Error ${response.status}: ${response.statusText}`;
    
    try {
      const errorData = await response.json();
      if (errorData.detail) {
        errorMessage = errorData.detail;
      } else if (errorData.error) {
        errorMessage = errorData.error;
      }
    } catch {
      // Si no se puede parsear JSON, usar el mensaje por defecto
      const errorText = await response.text();
      if (errorText) {
        errorMessage = errorText;
      }
    }
    
    throw new ApiError(response.status, errorMessage);
  }
  
  const contentType = response.headers.get('content-type');
  if (contentType && contentType.includes('application/json')) {
    return response.json();
  }
  return null;
};

// Obtener token de autenticación
function obtenerToken(): string | null {
  return localStorage.getItem('auth_token');
}

// Obtener headers con autenticación
function obtenerHeaders(incluirAuth: boolean = false): HeadersInit {
  const headers: HeadersInit = {
    'Content-Type': 'application/json',
  };
  
  if (incluirAuth) {
    const token = obtenerToken();
    if (token) {
      headers['Authorization'] = `Bearer ${token}`;
    }
  }
  
  return headers;
}

// Servicios de inventario
export const inventarioApi = {
  // Obtener todos los artículos
  obtenerArticulos: async (): Promise<ArticuloInventario[]> => {
    const response = await fetch(`${API_BASE_URL}/api/articulos`, {
      headers: obtenerHeaders(),
    });
    return handleResponse(response);
  },

  // Obtener un artículo por ID
  obtenerArticulo: async (id: number): Promise<ArticuloInventario> => {
    const response = await fetch(`${API_BASE_URL}/api/articulos/${id}`, {
      headers: obtenerHeaders(),
    });
    return handleResponse(response);
  },

  // Crear un nuevo artículo (solo admin)
  crearArticulo: async (articulo: ArticuloInventarioCrear): Promise<ArticuloInventario> => {
    const response = await fetch(`${API_BASE_URL}/api/articulos`, {
      method: 'POST',
      headers: obtenerHeaders(true),
      body: JSON.stringify(articulo),
    });
    return handleResponse(response);
  },

  // Actualizar un artículo (solo admin)
  actualizarArticulo: async (id: number, articulo: ArticuloInventarioActualizar): Promise<ArticuloInventario> => {
    const response = await fetch(`${API_BASE_URL}/api/articulos/${id}`, {
      method: 'PUT',
      headers: obtenerHeaders(true),
      body: JSON.stringify(articulo),
    });
    return handleResponse(response);
  },

  // Eliminar un artículo (solo admin)
  eliminarArticulo: async (id: number): Promise<MensajeRespuesta> => {
    const response = await fetch(`${API_BASE_URL}/api/articulos/${id}`, {
      method: 'DELETE',
      headers: obtenerHeaders(true),
    });
    return handleResponse(response);
  },

  // Buscar artículos
  buscarArticulos: async (termino: string): Promise<ArticuloInventario[]> => {
    const response = await fetch(`${API_BASE_URL}/api/articulos?buscar=${encodeURIComponent(termino)}`, {
      headers: obtenerHeaders(),
    });
    return handleResponse(response);
  },

  // Obtener estadísticas
  obtenerEstadisticas: async (): Promise<{ total_articulos: number; mensaje: string }> => {
    const response = await fetch(`${API_BASE_URL}/api/estadisticas`);
    return handleResponse(response);
  }
};

// Servicios de autenticación
export const authApi = {
  // Registrar usuario
  registro: async (usuario: UsuarioCrear): Promise<Token> => {
    const response = await fetch(`${API_BASE_URL}/api/auth/registro`, {
      method: 'POST',
      headers: obtenerHeaders(),
      body: JSON.stringify(usuario),
    });
    return handleResponse(response);
  },

  // Login de usuario
  login: async (credenciales: UsuarioLogin): Promise<Token> => {
    const response = await fetch(`${API_BASE_URL}/api/auth/login`, {
      method: 'POST',
      headers: obtenerHeaders(),
      body: JSON.stringify(credenciales),
    });
    return handleResponse(response);
  },

  // Obtener perfil del usuario actual
  obtenerPerfil: async (): Promise<Usuario> => {
    const response = await fetch(`${API_BASE_URL}/api/auth/perfil`, {
      headers: obtenerHeaders(true),
    });
    return handleResponse(response);
  },

  // Listar usuarios (solo admin)
  listarUsuarios: async (): Promise<Usuario[]> => {
    const response = await fetch(`${API_BASE_URL}/api/usuarios`, {
      headers: obtenerHeaders(true),
    });
    return handleResponse(response);
  }
};

// Servicios de pedidos
export const pedidosApi = {
  // Crear pedido
  crearPedido: async (pedido: PedidoCrear): Promise<Pedido> => {
    const response = await fetch(`${API_BASE_URL}/api/pedidos`, {
      method: 'POST',
      headers: obtenerHeaders(true),
      body: JSON.stringify(pedido),
    });
    return handleResponse(response);
  },

  // Obtener pedidos del usuario actual
  obtenerPedidos: async (): Promise<Pedido[]> => {
    const response = await fetch(`${API_BASE_URL}/api/pedidos`, {
      headers: obtenerHeaders(true),
    });
    return handleResponse(response);
  },

  // Obtener pedido específico
  obtenerPedido: async (id: number): Promise<Pedido> => {
    const response = await fetch(`${API_BASE_URL}/api/pedidos/${id}`, {
      headers: obtenerHeaders(true),
    });
    return handleResponse(response);
  },

  // Actualizar estado de pedido (solo admin)
  actualizarEstadoPedido: async (id: number, estado: string): Promise<Pedido> => {
    const response = await fetch(`${API_BASE_URL}/api/pedidos/${id}/estado?nuevo_estado=${estado}`, {
      method: 'PUT',
      headers: obtenerHeaders(true),
    });
    return handleResponse(response);
  }
};

// Servicios generales
export const generalApi = {
  // Verificar salud de la API
  verificarSalud: async (): Promise<{ mensaje: string; version: string }> => {
    const response = await fetch(`${API_BASE_URL}/api/salud`);
    return handleResponse(response);
  },

  // Obtener estadísticas
  obtenerEstadisticas: async (): Promise<{ total_articulos: number; mensaje: string }> => {
    const response = await fetch(`${API_BASE_URL}/api/estadisticas`);
    return handleResponse(response);
  }
};

export { ApiError };
