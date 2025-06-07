import { loginApi } from "../data/api/authApi";
import { jwtDecode } from "jwt-decode";

const TOKEN_KEY = "auth_token"; // Clave para almacenar el token

export const login = async (username: string, password: string): Promise<JwtPayload | null> => {
  const response = await loginApi(username, password);
  if (response.token) {
    localStorage.setItem(TOKEN_KEY, response.token); // Guardar token en localStorage
    return jwtDecode<JwtPayload>(response.token); // Decodificar y retornar token
  }
  return null;
};

// export const register = async (email, password, name) => {
//     const response = await registerApi(email, password, name);
//     if (response.token) {
//         localStorage.setItem(TOKEN_KEY, response.token); // Guardar token
//     }
//     return response.user;
// };

export const logout = () => {
  localStorage.removeItem(TOKEN_KEY); // Eliminar token al cerrar sesión
};

interface JwtPayload {
  sub: string;
  rol: string;
  exp: number;
  id: number;
}

export const getToken = (): JwtPayload | null => {
  const token = localStorage.getItem(TOKEN_KEY);
  if (!token) return null;
  return jwtDecode<JwtPayload>(token);
};

export const getJwt = () => localStorage.getItem(TOKEN_KEY);