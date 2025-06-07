import { apiUrl } from "../../../env";

export const addPlanEstudio = async (
  nombre: string,
  carrera_id: string,
  semestres: number,
  token: string
) => {
  const url = `${apiUrl}/planes/`;
  const response = await fetch(url, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify({
      nombre,
      carrera_id,
      semestres,
    }),
  });
  if (!response.ok) throw new Error("Error al crear plan de estudio");
  return response.json();
};

export const getAllPlanEstudio = async (carrera_id: string, token: string) => {
  const url = `${apiUrl}/planes/${carrera_id}/`;
  const response = await fetch(url, {
    method: "GET",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
    },
  });
  if (!response.ok) throw new Error("Error al conseguir planes de carrera");
  return response.json();
};

export const updatePlanEstudio = async (carrera_id: string, token: string, semestres: number, nombre: string, plan_id:number) => {
  const url = `${apiUrl}/materias/${plan_id}`;
  const response = await fetch(url, {
    method: "PUT",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify({
      semestres,
      nombre,
      carrera_id
    }),
  });
  if (!response.ok) throw new Error("Error al actualizar plan de estudio");
  return response.json();
} 

export const deletePlanEstudio = async (plan_id: number, token: string) => {
  const url = `${apiUrl}/planes/${plan_id}/`;
  const response = await fetch(url, {
    method: "DELETE",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
    },
  });
  if (!response.ok) throw new Error("Error al eliminar plan de estudio");
  return response.json();
}