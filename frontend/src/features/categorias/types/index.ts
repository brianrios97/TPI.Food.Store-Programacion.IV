export interface CategoriaPublic {
  id: number;
  nombre: string;
  descripcion?: string | null;
  activo: boolean;
}

export interface CategoriaCreate {
  nombre: string;
  descripcion?: string | null;
}

export interface CategoriaUpdate {
  nombre?: string | null;
  descripcion?: string | null;
}
