import { addJefeCarrera as add, getIdCarrera as get } from "@/data/api/jefeCarreraApi";
export const addJefeCarrera = async (
  carrera_id: string,
  token: string,
  carrera_nombre: string,
  usuario_id?: string
) => {
  const response = await add(carrera_id, token, carrera_nombre, usuario_id);
  return response;
};

export const getIdCarrera = async (usuario_id: string, token: string) => {
  const response = await get(usuario_id, token);
  return response.id;
}