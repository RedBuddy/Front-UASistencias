export const mapMaestro = (data) => {
    return data.map((maestro) => ({
        id: maestro.id,
        fullName: maestro.nombre + ' ' + maestro.apellido
    }));
}