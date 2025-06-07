import { addMaterias as add , deleteMateria as remove, updateMateria as update} from "@/data/api/materiaApi";
export const addMaterias = async (materias: string[], plan_estudio_id: number, token:string) => {
    const response = await add(materias, plan_estudio_id, token);
    return response;
};

export const deleteMateria = async (materias: number[], token:string) => {
    materias.map(async (materia_id) => {
        await remove(materia_id, token);
    });
}

export const updateMaterias = async (materias, token:string, plan_id: number) => {
    materias.map(async (materia_id) => {
        await update(materia_id.id, materia_id.nombre, token, plan_id);
    });
}