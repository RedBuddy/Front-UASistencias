import { apiUrl } from "../../../env";

export const addMaterias = async (materias: string[], plan_estudio_id: number, token:string) => {
    const url = `${apiUrl}/materias/list/`;

    // Create the body as an array of objects
    const body = materias.map((nombre) => ({
        nombre,
        plan_estudio_id,
    }));

    console.log(body, token);

    // Perform the POST request
    const response = await fetch(url, {
        method: "POST",
        headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(body),
    });

    if (!response.ok) {
        throw new Error(`Error: ${response.statusText}`);
    }

    return await response.json();
};


export const deleteMateria = async (materia_id: number, token:string) => {
    const url = `${apiUrl}/materias/${materia_id}/`;

    // Perform the DELETE request
    const response = await fetch(url, {
        method: "DELETE",
        headers: {
            Authorization: `Bearer ${token}`,
        },
    });

    if (!response.ok) {
        throw new Error(`Error: ${response.statusText}`);
    }

    return await response.json();
}

export const updateMateria = async (materia_id: number, nombre: string, token:string, plan_id: number) => {
    console.log(materia_id, nombre, plan_id)
    const url = `${apiUrl}/materias/materia/${materia_id}`;

    const response = await fetch(url, {
        method: "PUT",
        headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({nombre}),
    })
}