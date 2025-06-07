import { Grupo } from "./grupo";

export interface Horario {
  id: number;
  grupo_id: Grupo;
  materia_id: number;
  maestro_id: number;
  dia_semana: string;
  hora_inicio: string;
  hora_fin: string;
}

// Interfaz para el rol
export interface Rol {
  id: number;
  nombre: string;
}

// Interfaz para el maestro o jefe de grupo
export interface Persona {
  id: number;
  nombre: string;
  apellido: string;
  username: string;
  rol_id: number;
  rol: Rol;
}

// Interfaz para la carrera
export interface Carrera {
  id: number;
  nombre: string;
  jefe_id: number;
}

// Interfaz para el plan de estudios
export interface PlanEstudio {
  id: number;
  nombre: string;
  carrera_id: number;
  semestres: number;
  carrera: Carrera;
}

// Interfaz para la materia
export interface Materia {
  id: number;
  nombre: string;
  plan_estudio_id: number;
  plan_estudio: PlanEstudio;
}

// Interfaz para el grupo
export interface Grupos {
  id: number;
  nombre: string;
  plan_estudio_id: number;
  jefe_id: number;
  plan_estudio: PlanEstudio;
  jefe_grupo: Persona;
}

// Interfaz para el horario de clase
export interface Horarios {
  id: number;
  grupo_id: number;
  materia_id: number;
  maestro_id: number;
  dia_semana: string;
  hora_inicio: string;
  hora_fin: string;
  grupo: Grupos;
  materias: Materia;
  maestros: Persona;
}

export interface HorariosPorDia {
  Lunes: Horario[];
  Martes: Horario[];
  Miercoles: Horario[];
  Jueves: Horario[];
  Viernes: Horario[];
}

export interface TodosHorarios {
  horarios: HorariosPorDia;
  grupo_id: number;
}

export const formatearHorarios = (data: any[], id: number): TodosHorarios => {
  return {
    horarios: {
      Lunes: data[0] || [],
      Martes: data[1] || [],
      Miercoles: data[2] || [],
      Jueves: data[3] || [],
      Viernes: data[4] || [],
    },
    grupo_id: id,
  };
};
