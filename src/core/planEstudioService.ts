import {
  addPlanEstudio as add,
  getAllPlanEstudio as get,
  updatePlanEstudio as update,
  deletePlanEstudio as remove
} from "@/data/api/planEstudioApi";
import { addMaterias } from "./materiaService";
import { mapPlanEsudio } from "@/mappers/planEstudioMapper";
import { materiaMapper } from "@/mappers/materiaMapper";

export const addPlanEstudio = async (
  nombre: string,
  carrera_id: string,
  semestres: number,
  token: string,
  materias: string[]
) => {
  const response = await add(nombre, carrera_id, semestres, token);
  // añadir materias con el response.id
  const responseCarreras = await addMaterias(materias, response.id, token);
  const goodResponse = {
    id: response.id,
    nombre: response.nombre,
    carrera_id: undefined,
    carrera: undefined,
    semestres: response.semestres,
    materias: materiaMapper(responseCarreras),
  };

  return goodResponse;
};

export const updatePlanEstudio = async (
  carrera_id: string,
  token: string,
  semestres: number,
  nombre: string,
  plan_id: number,
  materias: string[]
) => {
  const response = await update(carrera_id, token, semestres, nombre, plan_id);
  const responseMaterias = await addMaterias(materias, plan_id, token);
  const goodResponse = {
    id: response.id,
    nombre: response.nombre,
    carrera_id: undefined,
    carrera: undefined,
    semestres: response.semestres,
    materias: materiaMapper(responseMaterias),
  };
  console.log("update response:", response);
  console.log("responseMaterias:", responseMaterias);
  console.log("mapped materias:", materiaMapper(responseMaterias));
  return goodResponse;
};

export const getAllPlanEstudio = async (usuario_id: string, token: string) => {
  const response = await get(usuario_id, token);
  return mapPlanEsudio(response);
};

export const deletePlanEstudios = async (plan_id: number, token: string) => {
  const response = await remove(plan_id, token);
  return response;
}