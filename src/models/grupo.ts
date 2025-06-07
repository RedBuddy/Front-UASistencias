export interface Grupo {
    id: number;
    numero:string;
    plan_estudio_id:number;
    plan_estudio_nombre?:string;
    jefe_grupo_id:number;
    jefe_grupo_nombre?:string;
}