import { getToken } from "@/core/authService";
import { apiUrl } from "../../../env";

export const addJefeCarrera = async (
  carrera_id: string,
  token: string,
  nombre: string,
  usuario_id?: string,
) => {
  const url = `${apiUrl}/carreras/${carrera_id}`;
  const body: Record<string, unknown> = { nombre };
  if (usuario_id) {
    body.jefe_id = usuario_id;
  }
  console.log(body);

  const response = await fetch(url, {
    method: "PUT",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify(body),
  });
  return response.json();
};


export const getIdCarrera = async (usuario_id:string, token:string) => {
  const url = `${apiUrl}/carreras/jefe/${usuario_id}`;
  const response = await fetch(url, {
    method: "GET",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
    },
  });
  if (!response.ok) throw new Error("Error al obtener la carrera");
  return response.json();
}
