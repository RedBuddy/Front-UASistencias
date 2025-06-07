import {
  addGrupo as add,
  getAllGrupos as get,
  updateGrupo as update,
  deleteGrupo as remove,
} from "@/data/api/grupoApi";
import { mapGrupoByJefeCarrera } from "@/mappers/grupoMapper";
import { getGruposByCarrera as getByCarrera } from "@/data/api/grupoApi";

export const addGrupo = async (
  token: string,
  nombre: string,
  plan_estudio_id: number,
  jefe_grupo_id: number
) => {
  const response = await add(token, nombre, plan_estudio_id, jefe_grupo_id);
  return response;
};

export const getAllGrupos = async (token: string, plan_estudio_id: number) => {
  const response = await get(token, plan_estudio_id);
  return mapGrupoByJefeCarrera(response);
};

//todo: NECESITARÉ ESTEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEE
//todo: NECESITARÉ ESTEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEE
//todo: NECESITARÉ ESTEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEE
//todo: NECESITARÉ ESTEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEE

export const getGruposByPlan = async (token: string, carrera_id: number) => {
  const response = await getByCarrera(token, carrera_id);
  return mapGrupoByJefeCarrera(response);
};

export const updateGrupo = async (object: any, token: string) => {
  const response = await update(object, token);
  return response;
};

export const deleteGrupo = async (grupo_id: number, token: string) => {
  const response = await remove(grupo_id, token);
  return response;
};
