from datetime import datetime
from sqlmodel import SQLModel, Field
from pydantic import EmailStr


class UserCreate(SQLModel):
    """
    DTO para el registro de nuevos usuarios.
    Valida que los datos recibidos desde el cliente cumplan con los requisitos mínimos.
    """
    username: str = Field(min_length=3, max_length=50)
    full_name: str = Field(min_length=2, max_length=100)
    email: EmailStr
    password: str = Field(
        min_length=8,
        description="Contraseña en texto plano. Se exige un mínimo de 8 caracteres."
    )


class UserPublic(SQLModel):
    """
    DTO para exponer información pública de un usuario.
    Se utiliza como respuesta en el registro, login (/me) y administración.
    NUNCA expone el campo hashed_password.
    """
    id: int
    username: str
    full_name: str
    email: str
    role: str
    disabled: bool
    created_at: datetime

