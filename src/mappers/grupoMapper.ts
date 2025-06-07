export const mapGrupos = (data) => {
  return data.map((grupo) => ({
    id: grupo.id,
    nombre: grupo.nombre,
    plan_estudio_id: grupo.plan_estudio.id,
    plan_estudio_nombre: grupo.plan_estudio.nombre,
    jefe_grupo_id: grupo.jefe_id,
    jefe_grupo: grupo.jefe_grupo,
  }));
};

export const mapGrupoByJefeCarrera = (data) => {
  return data.map((grupo) => ({
    id: grupo.id,
    numero: grupo.nombre,
    plan_estudio_id: grupo.plan_estudio.id,
    plan_estudio_nombre: grupo.plan_estudio.nombre,
    jefe_grupo_id: grupo.jefe_grupo.id,
    jefe_grupo_nombre: grupo.jefe_grupo.nombre,
  })); 
}