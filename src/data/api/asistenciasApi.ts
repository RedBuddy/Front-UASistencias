import { apiUrl } from "../../../env";
import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";

// OBTENER ASISTENCIAS POR USUARIO Y FECHA
export const getAsistenciasPorUsuarioYFecha = async (usuario_id: number, fecha: string, token: string) => {
  const url = `${apiUrl}/asistencias/${usuario_id}/${fecha}`;

  const response = await fetch(url, {
    method: "GET",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
    },
  });

  if (!response.ok) {
    throw new Error(`Error al obtener asistencias: ${response.statusText}`);
  }

  return response.json();
};

// OBTENER ASISTENCIAS POR USUARIO
export const getAsistenciasPorUsuario = async (usuario_id: number, token: string) => {
  const url = `${apiUrl}/asistencias/${usuario_id}/`;

  const response = await fetch(url, {
    method: "GET",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
    },
  });

  if (!response.ok) {
    throw new Error(`Error al obtener asistencias: ${response.statusText}`);
  }

  return response.json();
};

// CREAR ASISTENCIA
export const createAsistencia = async (
  usuario_id: number,
  horario_id: number,
  fecha: string,
  asistencia: boolean,
  observaciones: string,
  token: string
) => {
  const url = `${apiUrl}/asistencias/`;

  const response = await fetch(url, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify({
      usuario_id,
      horario_id,
      fecha,
      asistencia,
      observaciones,
    }),
  });
  console.log(usuario_id, horario_id, fecha, asistencia, observaciones, token);
  if (!response.ok) {
    throw new Error(`Error al crear asistencia: ${response.statusText}`);
  }

  return response.json();
};

// CREAR ASISTENCIAS MÚLTIPLES (LISTA)
export const createAsistenciasList = async (
  asistencias_data: Array<{
    usuario_id: number;
    horario_id: number;
    fecha: string;
    asistencia: boolean;
    observaciones: string;
  }>,
  token: string
) => {
  const url = `${apiUrl}/asistencias/list/`;

  const response = await fetch(url, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify(asistencias_data),
  });

  if (!response.ok) {
    throw new Error(`Error al crear asistencias: ${response.statusText}`);
  }

  return response.json();
};


// MODIFICAR ASISTENCIA
export const modificarAsistencia = async (asistencia_id: number, asistenciaData: object, token: string) => {
  const url = `${apiUrl}/asistencias/${asistencia_id}/`;

  const response = await fetch(url, {
    method: "PUT",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify(asistenciaData), // Aquí es donde pasas los datos a modificar
  });

  if (!response.ok) {
    throw new Error(`Error al modificar la asistencia: ${response.statusText}`);
  }

  return response.json(); // Retorna la respuesta con la asistencia modificada
};

// export const generarReporteAsistenciaMaestro = async (maestro_id: number, fechaInicio: string, fechaFin: string, checador: boolean, maestro: boolean, jefe_grupo: boolean) => {

//   const url = `${apiUrl}/reportes/maestros/${maestro_id}/asistencia/csv?fecha_inicio=${fechaInicio}&fecha_fin=${fechaFin}&checador=${checador}&maestro=${maestro}&jefe_grupo=${jefe_grupo}`;

//   const response = await fetch(url, {
//     method: "GET",
//     headers: {
//       "Content-Type": "application/json",
//     },
//   });

//   if (!response.ok) {
//     throw new Error(`Error al generar el CSV de asistencia: ${response.statusText}`);
//   }

//   const blob = await response.blob();
//   const urlBlob = window.URL.createObjectURL(blob);
//   const a = document.createElement('a');
//   a.href = urlBlob;
//   a.download = `asistencia_maestro_${maestro_id}_${fechaInicio}_a_${fechaFin}.csv`;
//   document.body.appendChild(a);
//   a.click();
//   a.remove();
// }

// // GENERAR CSV DE ASISTENCIA PARA GRUPO
// export const generarAsistenciaGrupoCSV = async (
//   grupo_id: number,
//   fechaInicio: string,
//   fechaFin: string,
//   checador: boolean, maestro: boolean, jefe_grupo: boolean
// ) => {
//   const url = `${apiUrl}/reportes/grupos/${grupo_id}/asistencia/csv?fecha_inicio=${fechaInicio}&fecha_fin=${fechaFin}&checador=${checador}&maestro=${maestro}&jefe_grupo=${jefe_grupo}`;

//   const response = await fetch(url, {
//     method: "GET",
//     headers: {
//       "Content-Type": "application/json"
//     },
//   });

//   if (!response.ok) {
//     throw new Error(`Error al generar el CSV de asistencia: ${response.statusText}`);
//   }

//   const blob = await response.blob();
//   const urlBlob = window.URL.createObjectURL(blob);
//   const a = document.createElement('a');
//   a.href = urlBlob;
//   a.download = `asistencia_grupo_${grupo_id}_${fechaInicio}_a_${fechaFin}.csv`;
//   document.body.appendChild(a);
//   a.click();
//   a.remove();
// };

export const generarAsistenciaGrupoPDF = async (
  grupo_id: number,
  fechaInicio: string,
  fechaFin: string,
  checador: boolean,
  maestro: boolean,
  jefe_grupo: boolean
) => {
  const url = `${apiUrl}/reportes/grupos/${grupo_id}/asistencia/json?fecha_inicio=${fechaInicio}&fecha_fin=${fechaFin}&checador=${checador}&maestro=${maestro}&jefe_grupo=${jefe_grupo}`;

  const response = await fetch(url, {
    method: "GET",
    headers: {
      "Content-Type": "application/json"
    },
  });

  if (!response.ok) {
    // Intenta leer el mensaje de error del backend
    let errorMsg = `Error al generar el reporte de asistencia: ${response.statusText}`;
    try {
      const errorData = await response.json();
      if (errorData.detail) {
        errorMsg = errorData.detail;
      }
    } catch {
      // Si no es JSON, deja el mensaje por defecto
    }
    throw new Error(errorMsg);
  }

  const data = await response.json();

  if (!Array.isArray(data) || data.length === 0) {
    throw new Error("No hay registros de asistencia para los filtros especificados");
  }

  const doc = new jsPDF();
  doc.text(`Reporte de Asistencia Grupo ${grupo_id}`, 14, 16);

  autoTable(doc, {
    head: [[
      "ID", "Fecha", "Día", "Grupo", "Maestro", "Materia",
      "Hora Inicio", "Hora Fin", "Estado", "Observaciones", "Registrado por"
    ]],
    body: (data as AsistenciaReporte[]).map((row) => [
      row.ID,
      row.Fecha,
      row.Día,
      row.Grupo,
      row.Maestro,
      row.Materia,
      row["Hora Inicio"],
      row["Hora Fin"],
      row.Estado,
      row.Observaciones,
      row["Registrado por"]
    ]),
    startY: 24,
    styles: { fontSize: 7 },
    headStyles: { fillColor: [22, 160, 133] }
  });

  doc.save(`asistencia_grupo_${grupo_id}_${fechaInicio}_a_${fechaFin}.pdf`);
};

export const generarReporteAsistenciaMaestroPDF = async (
  maestro_id: number,
  fechaInicio: string,
  fechaFin: string,
  checador: boolean,
  maestro: boolean,
  jefe_grupo: boolean
) => {
  const url = `${apiUrl}/reportes/maestros/${maestro_id}/asistencia/json?fecha_inicio=${fechaInicio}&fecha_fin=${fechaFin}&checador=${checador}&maestro=${maestro}&jefe_grupo=${jefe_grupo}`;

  const response = await fetch(url, {
    method: "GET",
    headers: {
      "Content-Type": "application/json",
    },
  });

  if (!response.ok) {
    let errorMsg = `Error al generar el reporte de asistencia: ${response.statusText}`;
    try {
      const errorData = await response.json();
      if (errorData.detail) {
        errorMsg = errorData.detail;
      }
    } catch {
      // Si no es JSON, deja el mensaje por defecto
    }
    throw new Error(errorMsg);
  }

  const data = await response.json();

  if (!Array.isArray(data) || data.length === 0) {
    throw new Error("No hay registros de asistencia para los filtros especificados");
  }

  const doc = new jsPDF();
  doc.text(`Reporte de Asistencia Maestro ${maestro_id}`, 14, 16);

  autoTable(doc, {
    head: [[
      "ID", "Fecha", "Día", "Grupo", "Maestro", "Materia",
      "Hora Inicio", "Hora Fin", "Estado", "Observaciones", "Registrado por"
    ]],
    body: (data as AsistenciaReporte[]).map((row) => [
      row.ID,
      row.Fecha,
      row.Día,
      row.Grupo,
      row.Maestro,
      row.Materia,
      row["Hora Inicio"],
      row["Hora Fin"],
      row.Estado,
      row.Observaciones,
      row["Registrado por"]
    ]),
    startY: 24,
    styles: { fontSize: 7 },
    headStyles: { fillColor: [22, 160, 133] }
  });

  doc.save(`asistencia_maestro_${maestro_id}_${fechaInicio}_a_${fechaFin}.pdf`);
};

type AsistenciaReporte = {
  ID: number;
  Fecha: string;
  Día: string;
  Grupo: string;
  Maestro: string;
  Materia: string;
  "Hora Inicio": string;
  "Hora Fin": string;
  Estado: string;
  Observaciones: string;
  "Registrado por": string;
};

