import { getHorarioDiarioJefeGrupo as get } from "@/data/api/horariosApi";
import { getGrupoIdForJefeId } from "@/data/api/horariosApi"; // Importamos la función para obtener el grupoId
import {
  getHorarioMaestroDia as getMaestroHorario,
  addHorario as add,
  getAllHorarioGrupo as getAllWeekly,
  updateHorario as update,
  deleteHorario as deleted,
  getHorarioHora as getHorarioxHora,
} from "@/data/api/horariosApi"; // Importamos la función para obtener el horario del maestro
import { formatearHorarios } from "@/models/horario";

const mapHorarios = (data) => {
  return data.map((horario) => ({
    id: horario.id,
    maestro: `${horario.maestros.nombre} ${horario.maestros.apellido}`,
    materia: horario.materias.nombre,
    grupo: horario.grupo.nombre,
    horario: `${horario.hora_inicio} - ${horario.hora_fin}`,
  }));
};

export const getHorarioDiarioJefeGrupo = async (jefeId, dia, token) => {
  const grupoId = await getGrupoIdForJefeId(jefeId, token); // Obtiene el grupoId primero
  const response = await get(grupoId, dia, token); // Luego usa el grupoId para obtener el horario
  return mapHorarios(response);
};

//todo: NECESITARÉ ESTEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEE
//todo: NECESITARÉ ESTEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEE
//todo: NECESITARÉ ESTEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEE
//todo: NECESITARÉ ESTEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEE

export const getHorarioDiarioGrupos = async (grupoId, dia, token) => {
  const response = await get(grupoId, dia, token); // Usa el grupoId directamente para obtener el horario
  return mapHorarios(response);
};


export const getHorarioHora = async (dia, hora, token) => {
  const response = await getHorarioxHora(dia, hora, token); // Usa el grupoId directamente para obtener el horario
  return mapHorarios(response);
};
// Función para mapear los datos obtenidos del servicio
const mapHorarioMaestroDiario = (data) => {
  return data.map((horario) => ({
    id: horario.id,
    materia: horario.materias.nombre,
    grupo: horario.grupo.nombre,
    dia: horario.dia_semana,
    horario: `${horario.hora_inicio}-${horario.hora_fin}`,
  }));
};

// Uso del servicio con el mapeo de datos
export const getHorarioMaestroDia = async (maestroId, dia, token) => {
  const response = await getMaestroHorario(maestroId, dia, token); // Usamos la función importada para obtener los datos
  return mapHorarioMaestroDiario(response); // Mapeamos los datos antes de retornarlos
};

export const addHorario = async (horario, token, grupoId) => {
  const response = await add(horario, token, grupoId);
  return response;
};

export const updateHorario = async (horario, token) => {
  horario.forEach(async (element) => {
    const response = await update(element, token);
    console.log(response);
  });
};

export const deleteHorario = async (horario, token) => {
  horario.forEach(async (element) => {
    const response = await deleted(element.id, token);
    console.log(response);
  });
};

export const getAllHorarioGrupo = async (grupoId, token) => {
  const response = await getAllWeekly(grupoId, token);
  return formatearHorarios(response, grupoId);
};
