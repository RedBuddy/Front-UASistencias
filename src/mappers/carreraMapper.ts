import { Carrera } from "@/models/carrera";

// 🛠 Función Mapper para convertir la respuesta en un array de Users[]
export const mapCarreras = (data: { id: number; nombre: string }[]): Carrera[] => {
  return data.map((carrera) => ({
    id: carrera.id.toString(),
    nombre: carrera.nombre,
  }));
};