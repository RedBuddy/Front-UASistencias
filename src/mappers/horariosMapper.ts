import { Horario } from "@/models/horario";

export function transformarHorario(data): Horario[] {
    return data.map(item => ({
      id: item.id,
      grupo: item.grupo,
      materia: item.materias, // Cambia `materias` a `materia`
      maestro: item.maestros, // Cambia `maestros` a `maestro`
      dia_semana: item.dia_semana,
      hora_inicio: item.hora_inicio,
      hora_fin: item.hora_fin,
      grupo_id: item.grupo.id,
      materia_id: item.materias.id,
      maestro_id: item.maestros.id
    }));
  }