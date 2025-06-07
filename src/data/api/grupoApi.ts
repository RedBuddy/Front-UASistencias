import { json } from "stream/consumers";
import { apiUrl } from "../../../env";

export const addGrupo = async (
  token: string,
  nombre: string,
  plan_estudio_id: number,
  jefe_grupo_id: number
) => {
  const url = `${apiUrl}/grupos/`;
  const response = await fetch(url, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify({
      nombre,
      plan_estudio_id,
      jefe_id: jefe_grupo_id,
    }),
  });
  return response.json();
};



export const getAllGrupos = async (token: string, plan_estudio_id: number) => {
  const url = `${apiUrl}/grupos/carrera/${plan_estudio_id}`;
  const response = await fetch(url, {
    method: "GET",
    headers: { Authorization: `Bearer ${token}` },
  });
  return response.json();
};



export const getGruposByCarrera = async (token: string, carrera_id: number) => {
  const url = `${apiUrl}/grupos/plan/${carrera_id}`;
  const response = await fetch(url, {
    method: "GET",
    headers: { Authorization: `Bearer ${token}` },
  });

  if (!response.ok) {
    throw new Error(`Error fetching grupos for carrera ${carrera_id}: ${response.statusText}`);
  }

  return response.json();
};

export const updateGrupo = async (object, token) => {
  const url = `${apiUrl}/grupos/${object.id}`;
  const response = await fetch(url, {
    method: "PUT",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify({
      nombre: object.nombre,
      plan_estudio_id: object.plan_estudio_id,
      jefe_id: object.jefe_id,
    }),
  });
  return response.json();
}

export const deleteGrupo = async (grupo_id: number, token: string) => {
  console.log("Updating;")
  const url = `${apiUrl}/grupos/${grupo_id}/`;
  const response = await fetch(url, {
    method: "DELETE",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
    },
  }); 
}