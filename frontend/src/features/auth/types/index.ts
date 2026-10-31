export interface UserPublic {
  id: number;
  username: string;
  full_name: string;
  email: string;
  role: "user" | "admin";
  disabled: boolean;
  created_at: string;
}

export interface UserCreate {
  username: string;
  full_name: string;
  email: string;
  password: string;
}
