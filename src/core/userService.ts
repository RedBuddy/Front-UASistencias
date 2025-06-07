import {
  addUser as add,
  getAllUsers as getAll,
  updateUser as update,
} from "@/data/api/userApi";
import { mapUsers } from "@/mappers/userMapper";
import { addJefeCarrera } from "./jefeCarreraService";
import { getJwt } from "./authService";
export const addUser = async (
  username: string,
  rol_id: string,
  nombre: string,
  apellido: string,
  carrera: string
) => {
  const response = await add(username, rol_id, nombre, apellido);

  // Verificar si el usuario es jefe de carrera
  if (response.user.rol_id === 1) {
    const carreraJson = JSON.parse(carrera); // Convertir carrera a JSON
    const carrera_id = carreraJson.id; // Extraer id
    const carrera_nombre = carreraJson.nombre; // Extraer nombre

    await addJefeCarrera(
      carrera_id,
      getJwt(),
      carrera_nombre,
      response.user.id
    );
  }

  return response;
};

export const getAllUsers = async (token: string) => {
  const response = await getAll(token);
  return mapUsers(response);
};

export const updateUser = async (
  username: string,
  rol_id: string,
  newNombre?: string,
  newApellido?: string
) => {
  const response = await update(username, rol_id, newNombre, newApellido);
  return response;
};
