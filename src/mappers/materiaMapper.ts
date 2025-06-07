export const materiaMapper =  ( data ) => {
    return data.map((materia) => ({
        nombre: materia.nombre,
        id: materia.id
    }));
}