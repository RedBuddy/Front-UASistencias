import { getAllUsers } from "@/data/api/userApi";
import { mapJefesGrupo } from "@/mappers/userMapper";
export const getJefeGrupo = async (token: string) => {
  const response = await getAllUsers(token);
  return mapJefesGrupo(response);
};
