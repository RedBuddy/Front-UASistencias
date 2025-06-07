import { getMaestros as get } from "@/data/api/maestroApi"
import { mapMaestro } from "@/mappers/maestroMapper";

export const getMaestro = async () => {
    const response = await get();
    return mapMaestro(response);
}