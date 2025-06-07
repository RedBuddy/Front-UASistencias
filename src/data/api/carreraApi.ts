import { Carrera } from "@/models/carrera";
import { apiUrl } from "../../../env";

export const getAllCarreras = async (token: string) => {
  const url = `${apiUrl}/carreras/`;
  const response = await fetch(url, {
    method: "GET",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
    },
  });
  if (!response.ok) throw new Error("Error al obtener las carreras");
  return response.json();
};

export const addCarrera = async (
  nombre: string,
  token: string
) => {
  const url = `${apiUrl}/carreras/`;
  const response = await fetch(url, {
    method: "POST",
    headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
    body: JSON.stringify({
      nombre,
    }),
  });
  if (!response.ok) throw new Error("Error al añadir la carrera");
  return response.json();
};

