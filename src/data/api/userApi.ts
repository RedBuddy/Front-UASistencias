import { apiUrl } from "../../../env";

export const getAllUsers = async (token: string) => {
  const url = `${apiUrl}/users/`;
  const response = await fetch(url, {
    method: "GET",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
    },
  });
  if (!response.ok) throw new Error("Error al obtener los usuarios");
  return response.json();
};

export const addUser = async (
  username: string,
  rol_id: string,
  nombre: string,
  apellido: string
) => {
  const url = `${apiUrl}/auth/register/`;
  const response = await fetch(url, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      username,
      password: "1234",
      nombre,
      apellido,
      rol_id,
    }),
  });

  if (!response.ok) {
    // Intenta extraer el mensaje de error del backend
    let errorMsg = "Error al añadir el usuario";
    try {
      const errorData = await response.json();
      if (errorData.detail) {
        errorMsg = errorData.detail;
      }
    } catch {
      // Si no es JSON, deja el mensaje por defecto
    }
    throw new Error(errorMsg);
  }

  return response.json();
};

export const updateUser = async (
  username: string,
  rol_id: string,
  newNombre?: string,
  newApellido?: string
) => {
  const url = `${apiUrl}/users/${username}/admin`;
  const response = await fetch(url, {
    method: "PUT",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      nombre: newNombre,
      apellido: newApellido,
      username,
      rol_id,
    }),
  });
  if (!response.ok) throw new Error("Error al editar el usuario");
  return response.json();
};

export const getUserInfo = async (username: string, token: string) => {
  const url = `${apiUrl}/users/${username}/`;  // Utilizamos el endpoint proporcionado
  const response = await fetch(url, {
    method: "GET",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
    },
  });

  if (!response.ok) {
    throw new Error(`Error al obtener el usuario: ${response.statusText}`);
  }

  return response.json(); // Retornamos los datos del usuario en formato JSON
};

export const updateUserInfo = async (username: string, userData: object, token: string) => {
  const url = `${apiUrl}/users/${username}/`;  // Endpoint para actualizar el usuario
  const response = await fetch(url, {
    method: "PUT",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify(userData),  // Se envían los datos para actualizar
  });

  if (!response.ok) {
    throw new Error(`Error al actualizar el usuario: ${response.statusText}`);
  }

  return response.json(); // Retornamos los datos del usuario actualizado en formato JSON
}