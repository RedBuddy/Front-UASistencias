export type Role = "Administracion" | "Jefe de Grupo" | "Jefe de Carrera" | "Checador" | "Maestro" | "Coordinacion";

export interface User {
  id?:string;
  email: string;
  username: string;
  role: Role;
  token: string;
}
