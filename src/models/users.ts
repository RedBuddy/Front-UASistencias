import { Role } from "./user";

export interface Users {
    nombre:   string;
    apellido: string;
    username: string;
    rol_id:   number;
    id:       number;
    rol:      Role;
    carrera?:string;
}
