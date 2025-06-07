import { getToken } from "@/core/authService";
import { apiUrl } from "../../../env";
export const loginApi = async (username: string, password: string) => {
  const url = `${apiUrl}/auth/login`;
  const response = await fetch(url, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ username, password }),
  });
  if (!response.ok) throw new Error("Error en el login");
  return response.json();
};

// export const registerApi = async (email, password, name) => {
//     const response = await fetch("https://mi-api.com/register", {
//         method: "POST",
//         headers: { "Content-Type": "application/json" },
//         body: JSON.stringify({ email, password, name }),
//     });
//     if (!response.ok) throw new Error("Error en el registro");
//     return response.json();
// };

// Función para hacer peticiones autenticadas
export const fetchWithAuth = async (
  url: string,
  options: { headers?: Record<string, string> } = {}
) => {
  const token = getToken();
  if (!token) throw new Error("No autenticado");

  const response = await fetch(url, {
    ...options,
    headers: {
      ...options.headers,
      Authorization: `Bearer ${token}`,
    },
  });

  if (!response.ok) throw new Error("Error en la petición");
  return response.json();
};
