import { Users } from "@/models/users";
import { JefeGrupo } from "@/models/jefe_grupo";
// 🛠 Función Mapper para convertir la respuesta en un array de Users[]
export const mapUsers = (data): Users[] => {
  return data.map((user) => ({
    nombre: user.nombre,
    apellido: user.apellido,
    username: user.username,
    rol_id: user.rol_id,
    id: user.id,
    rol: user.rol.nombre,
  }));
};

export const mapJefesGrupo = (data): JefeGrupo[] => {
  return data
    .filter((jefe) => jefe.rol_id === 3)
    .map((jefe) => ({
      id: jefe.id,
      fullName: `${jefe.nombre} ${jefe.apellido}`,
    }));
};
