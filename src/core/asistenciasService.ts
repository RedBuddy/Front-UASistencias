import {getAsistenciasPorUsuarioYFecha as get, createAsistencia as create} from "@/data/api/asistenciasApi";


// Función que mapea los datos de la respuesta
const mapAsistencias = (data) => {
    return data.map((asistencia) => ({
        id: asistencia.id,
      maestro: `${asistencia.horarios.maestros.nombre} ${asistencia.horarios.maestros.apellido}`,
      materia: asistencia.horarios.materias.nombre,
      grupo: asistencia.horarios.grupo.nombre,
      horario: `${asistencia.horarios.hora_inicio} - ${asistencia.horarios.hora_fin}`,
      asistencia: asistencia.asistencia,
      observaciones: asistencia.observaciones,
    }));
  };

  export const getAsistenciasPorUsuarioyFecha = async (jefeId, fecha, token) => {
    const asistencias = await get(jefeId, fecha, token);
    return mapAsistencias(asistencias);
  };

    export const createAsistencia = async (usuario_id, horario_id, fecha, asistencia, observaciones, token) => {
        return create(usuario_id, horario_id, fecha, asistencia, observaciones, token);
    };
    // src/services/AsistenciaService.js


/**
 * Servicio para gestionar los reportes de asistencia
 */
