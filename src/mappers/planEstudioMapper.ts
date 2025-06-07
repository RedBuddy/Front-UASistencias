import { PlanEstudio } from "@/models/plan_estudio";

export const mapPlanEsudio = (data): PlanEstudio[] => {
  return data.map((planEstudio) => ({
    id: planEstudio.id,
    nombre: planEstudio.nombre,
    carrera_id: planEstudio.carrera_id,
    carrera: planEstudio.carrera,
    semestres: planEstudio.semestres,
    materias: planEstudio.materias.map((materia) => ({
        id: materia.id,
        nombre: materia.nombre,
    })),
  }));
};
