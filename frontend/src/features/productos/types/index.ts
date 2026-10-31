export interface ProductoPublic {
  id: number;
  nombre: string;
  descripcion?: string | null;
  precio_base: number;
  stock: number;
  categoria_id: number;
  imagen_url?: string | null;
  activo: boolean;
}

export interface ProductosPaginados {
  items: ProductoPublic[];
  total: number;
  skip: number;
  limit: number;
}

export interface ProductoCreate {
  nombre: string;
  descripcion?: string | null;
  precio_base: number;
  stock: number;
  categoria_id: number;
  imagen_url?: string | null;
}

export interface ProductoUpdate {
  nombre?: string | null;
  descripcion?: string | null;
  precio_base?: number | null;
  stock?: number | null;
  categoria_id?: number | null;
  imagen_url?: string | null;
}

export interface ProductoStockUpdate {
  stock: number;
  activo?: boolean | null;
}

