import { Materia } from "./materia";

export interface PlanEstudio {
  id: number;
  nombre: string;
  semestres: number;
  carrera_id: number;
  carrera: string;
  materias?: Materia[];
}
