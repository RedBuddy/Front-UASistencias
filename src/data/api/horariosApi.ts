import { group } from "console";
import { apiUrl } from "../../../env";

export const getHorarioDiarioJefeGrupo = async (
  grupoId: number,
  dia: string,
  token: string
) => {
  const url = `${apiUrl}/horarios/${grupoId}/${dia}/`;
  console.log(url);
  const response = await fetch(url, {
    method: "GET",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
    },
  });
  if (!response.ok) throw new Error("Error al obtener el horario");
  return response.json();
};

export const getHorarioDiarioGrupos = async (
  grupoId: number,
  dia: string,
  token: string
) => {
  const url = `${apiUrl}/horarios/${grupoId}/${dia}/`;
  console.log(url);
  const response = await fetch(url, {
    method: "GET",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
    },
  });
  if (!response.ok) throw new Error("Error al obtener el horario");

  const data = await response.json();

  // Mapear los datos para incluir el nombre completo del maestro
  return data.map((horario: { maestros: { nombre: string; apellido: string } }) => ({
    ...horario,
    maestroNombreCompleto: `${horario.maestros.nombre} ${horario.maestros.apellido}`,
  }));
};


export const getGrupoIdForJefeId = async (jefeId: number, token: string) => {
  const url = `${apiUrl}/grupos/jefe/${jefeId}/`;
  const response = await fetch(url, {
    method: "GET",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
    },
  });

  if (!response.ok) throw new Error("Error al obtener el grupo del jefe");

  const data = await response.json();
  return data.id; // Retorna solo el ID del grupo
};

// Obtener el horario del maestro para un día específico
export const getHorarioMaestroDia = async (
  maestroId: number,
  dia: string,
  token: string
) => {
  const url = `${apiUrl}/maestros/horario/${maestroId}/${dia}`;
  console.log(url);

  const response = await fetch(url, {
    method: "GET",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
    },
  });

  if (!response.ok) {
    throw new Error(
      "Error al obtener el horario del maestro para el día especificado"
    );
  }

  return response.json();
};

// Obtener el horario completo de un maestro
export const getHorarioMaestro = async (maestroId, token) => {
  const url = `${apiUrl}/maestros/horario/${maestroId}`;

  const response = await fetch(url, {
    method: "GET",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
    },
  });

  if (!response.ok) {
    throw new Error("Error al obtener el horario del maestro");
  }

  return response.json();
};


export const getAsistenciasPorHora = async (
  usuarioId: number,
  fecha: string,
  hora: string,
  token: string

) => {
  const url = `${apiUrl}/asistencias/${usuarioId}/${fecha}/hora/${hora}`;
  console.log(url);

  const response = await fetch(url, {
    method: "GET",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
    },
  });

  if (!response.ok) {
    throw new Error("Error al obtener las asistencias por hora");
  }

  return response.json();

}

export const getHorarioHora = async (
  dia: string,
  hora: string,
  token: string
) => {

  const url = `${apiUrl}/horarios/${dia}/hora/${hora}`;

  const response = await fetch(url, {
    method: "GET",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
    },
  });

  if (!response.ok) {
    throw new Error("Error al obtener el horario por hora");
  }

  return response.json();

}

export const getAsistenciasPorGrupo = async (
  usuarioId: number,
  fecha: string,
  grupoId: number,
  token: string
) => {
  const url = `${apiUrl}/asistencias/${usuarioId}/${fecha}/${grupoId}`;
  console.log(url);

  const response = await fetch(url, {
    method: "GET",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
    },
  });

  if (!response.ok) {
    throw new Error("Error al obtener las asistencias por grupo");
  }

  return response.json();
};


export const addHorario = async (horario, token, grupo_id) => {
  console.log(horario);
  const url = `${apiUrl}/horarios/${grupo_id}/`;
  const response = await fetch(url, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify(horario),
  });
  return response.json();
};

export const updateHorario = async (horario, token) => {
  const url = `${apiUrl}/horarios/${horario.id}/`;
  const newHorario = {
    grupo_id: horario.grupo_id,
    materia_id: horario.materia_id,
    maestro_id: horario.maestro_id,
    dia_semana: horario.dia_semana,
    hora_inicio: horario.hora_inicio,
    hora_fin: horario.hora_fin,
  }
  const response = await fetch(url, {
    method: "PUT",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify(newHorario),
  });
  return response.json();
}

export const getAllHorarioGrupo = async (grupo_id, token) => {
  const url = `${apiUrl}/horarios/${grupo_id}/semana/all/`;
  const response = await fetch(url, {
    method: "GET",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
    },
  });
  return response.json();
};


export const deleteHorario = async (horarioId, token) => {
  const url = `${apiUrl}/horarios/${horarioId}/`;
  const response = await fetch(url, {
    method: "DELETE",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
    },
  });
  return response.json();
}