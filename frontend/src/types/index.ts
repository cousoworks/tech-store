export interface ArticuloInventario {
  id?: number;
  nombre: string;
  descripcion: string;
  cantidad: number;
  precio: number;
  fecha_creacion?: string;
  fecha_actualizacion?: string;
}

export interface ArticuloInventarioCrear {
  nombre: string;
  descripcion: string;
  cantidad: number;
  precio: number;
}

export interface ArticuloInventarioActualizar {
  nombre?: string;
  descripcion?: string;
  cantidad?: number;
  precio?: number;
}

// Interfaces para usuarios y autenticación
export interface Usuario {
  id: number;
  email: string;
  nombre: string;
  apellidos?: string;
  rol: 'admin' | 'cliente';
  activo: boolean;
  fecha_creacion: string;
  fecha_ultimo_acceso?: string;
}

export interface UsuarioCrear {
  email: string;
  nombre: string;
  apellidos?: string;
  password: string;
  rol?: 'admin' | 'cliente';
}

export interface UsuarioLogin {
  email: string;
  password: string;
}

export interface Token {
  access_token: string;
  token_type: string;
  usuario: Usuario;
}

// Interfaces para pedidos
export interface ItemPedido {
  articulo_id: number;
  cantidad: number;
}

export interface PedidoCrear {
  items: ItemPedido[];
  direccion_envio?: string;
  notas?: string;
}

export interface PedidoItem {
  articulo_id: number;
  nombre_articulo: string;
  cantidad: number;
  precio_unitario: number;
  subtotal: number;
}

export interface Pedido {
  id: number;
  usuario_id: number;
  usuario_email: string;
  total: number;
  estado: 'pendiente' | 'procesando' | 'enviado' | 'entregado' | 'cancelado';
  fecha_pedido: string;
  fecha_actualizacion?: string;
  direccion_envio?: string;
  notas?: string;
  items: PedidoItem[];
}

export interface MensajeRespuesta {
  mensaje: string;
  exito: boolean;
}

// Contexto de autenticación
export interface AuthContextType {
  usuario: Usuario | null;
  token: string | null;
  login: (credenciales: UsuarioLogin) => Promise<void>;
  registro: (usuario: UsuarioCrear) => Promise<void>;
  logout: () => void;
  loading: boolean;
}
