import React, { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { DatePicker } from "@/components/DatePicker";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { 
  ClipboardCheck, 
  CheckSquare, 
  X, 
  Clock,
  Save,
  FileText
} from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Textarea } from "@/components/ui/textarea";
import { getAllCarreras } from "@/core/carreraService";
import { getAllGrupos } from "@/core/grupoService";
import { getHorarioDiarioGrupos, getHorarioHora } from "@/core/horariosService";
import { toast } from "@/components/ui/use-toast";
import { getAsistenciasPorUsuarioyFecha, createAsistencia } from "@/core/asistenciasService";
import { getAsistenciasPorGrupo, getAsistenciasPorHora } from "@/data/api/horariosApi";
import { modificarAsistencia } from "@/data/api/asistenciasApi";
import { getToken } from "@/core/authService";
import { Switch } from "@/components/ui/switch";

const ChecadorPage = () => {
  const [selectedDate, setSelectedDate] = useState(new Date());
  const [selectedTime, setSelectedTime] = useState("");
  const [dialogOpen, setDialogOpen] = useState(false);
  
  // Estado para carreras y grupos
  const [carreras, setCarreras] = useState([]);
  const [grupos, setGrupos] = useState([]);
  const [selectedCarrera, setSelectedCarrera] = useState("");
  const [selectedGrupo, setSelectedGrupo] = useState("");
  const [loading, setLoading] = useState(false);
  
  // Estado para maestros y asistencias
  const [maestros, setMaestros] = useState([]);
  const [observacionTemp, setObservacionTemp] = useState("");
  const [maestroEditId, setMaestroEditId] = useState(null);
  const [cambiosPendientes, setCambiosPendientes] = useState(false);
  const [asistenciasPendientes, setAsistenciasPendientes] = useState([]);
  const hourOptions = Array.from({ length: 16 }, (_, i) => {
    const hour = i + 7;
    return hour < 13
      ? { value: `${hour}:00`, label: `${hour}:00 AM` }
      : { value: `${hour}:00`, label: `${hour - 12}:00 PM` };
  });
  // Función para obtener el nombre del día en español
  const obtenerNombreDia = (fecha) => {
    const dias = ["Domingo", "Lunes", "Martes", "Miércoles", "Jueves", "Viernes", "Sábado"];
    return dias[fecha.getDay()];
  };

   const cargarAsistenciasPorHora = async () => {
    if (!selectedDate || !selectedTime) {
      setMaestros([]);
      return;
    }

    try {
      setLoading(true);
      const token = localStorage.getItem("auth_token");
      if (!token) {
        console.error("Token no encontrado en el local storage");
        return;
      }
      const tokenData = getToken();
      if (!tokenData) {
        console.error("No se pudo obtener el token o está inválido");
        return;
      }
      const fecha = selectedDate.toISOString().split("T")[0];
      const data = await getAsistenciasPorHora(
        tokenData.id, 
        fecha,
        selectedTime,
        token
      );
      console.log("Asistencias cargadas:", data);
      if (data && data.length > 0) {
        console.log("Asistencias cargadas:", data);
        setMaestros(data);
        setAsistenciasPendientes([]);
        setCambiosPendientes(false);
      } else {
        // Si no hay asistencias registradas, cargamos el horario
        cargarHorarioHora();
      }
      setMaestros(data || []);
    } catch (error) {
      console.error("Error al cargar asistencias por hora:", error);
      toast({
        title: "Error",
        description: "No se pudieron cargar las asistencias. Inténtelo de nuevo.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };
  

  
  const obtenerFechaDia = (fecha) => {
    return fecha.toISOString().split("T")[0];
  };

      // Función para cargar los horarios si no hay asistencias
      const cargarHorarioHora = async () => {
        try {
          const token = localStorage.getItem('auth_token');
          if (!token) {
            console.error("Token no encontrado en el local storage");
            return;
          }

          const dia = obtenerNombreDia(selectedDate);
          const hora = selectedTime;
          const horariosData = await getHorarioHora(dia, hora, token);

          // Filtra solo los horarios del grupo seleccionado y hora seleccionada
          const horariosFiltrados = horariosData.filter(
            (item) =>
              item.grupo_id === parseInt(selectedGrupo) &&
              item.hora_inicio === selectedTime
          );

          if (horariosFiltrados.length > 0) {
            const tokenData = getToken();
            if (!tokenData) {
              console.error("No se pudo obtener el token o está inválido");
              return;
            }

            // 1. Consulta asistencias existentes para ese grupo, fecha y hora
            const fecha = selectedDate.toISOString().split("T")[0];
            const asistenciasExistentes = await getAsistenciasPorHora(
              tokenData.id,
              fecha,
              selectedTime,
              token
            );

            // 2. Solo crea las asistencias que no existen
            for (const item of horariosFiltrados) {
              const yaExiste = asistenciasExistentes.some(
                (a) =>
                  a.horarios.id === item.id &&
                  a.horarios.grupo.id === item.grupo_id &&
                  a.horarios.hora_inicio === selectedTime
              );
              if (!yaExiste) {
                await createAsistencia(
                  tokenData.id,
                  item.id,
                  obtenerFechaDia(selectedDate),
                  null,
                  "",
                  token
                );
              }
            }

            // 3. Recarga asistencias y filtra por grupo y hora
            const data = await getAsistenciasPorHora(
              tokenData.id,
              fecha,
              selectedTime,
              token
            );
            const asistenciasFiltradas = data.filter(
              (a) =>
                a.horarios.grupo.id === parseInt(selectedGrupo) &&
                a.horarios.hora_inicio === selectedTime
            );
            setMaestros(asistenciasFiltradas);
          }
        } catch (error) {
          console.error("Error al cargar horario:", error);
          toast({
            title: "Error",
            description: "No se pudo cargar el horario. Inténtelo de nuevo.",
            variant: "destructive"
          });
        }
      };

 

  
  // Cargar carreras al iniciar
  useEffect(() => {
    const fetchCarreras = async () => {
      try {
        setLoading(true);
        const token = localStorage.getItem('auth_token');
        if (!token) {
          console.error("Token no encontrado en el local storage");
          return;
        }
        const carrerasData = await getAllCarreras(token);
        setCarreras(carrerasData);
      } catch (error) {
        console.error("Error al cargar carreras:", error);
        toast({
          title: "Error",
          description: "No se pudieron cargar las carreras. Inténtelo de nuevo.",
          variant: "destructive"
        });
      } finally {
        setLoading(false);
      }
    };
    
    fetchCarreras();
  }, []);
  
  // Cargar asistencias por hora cuando se selecciona hora
 useEffect(() => {
  if (selectedTime && selectedGrupo && selectedCarrera) {
    cargarAsistenciasPorHora();
  }
}, [selectedTime, selectedDate, selectedGrupo, selectedCarrera]);


  // Cargar grupos cuando se selecciona una carrera
  useEffect(() => {
    if (!selectedCarrera) {
      setGrupos([]);
      setSelectedGrupo("");
      setMaestros([]);
      return;
    }
    
    const fetchGrupos = async () => {
      try {
        setLoading(true);
        const token = localStorage.getItem('auth_token');
        if (!token) {
          console.error("Token no encontrado en el local storage");
          return;
        }
        const gruposData = await getAllGrupos(token, parseInt(selectedCarrera));
        setGrupos(gruposData);
      } catch (error) {
        console.error("Error al cargar grupos:", error);
        toast({
          title: "Error",
          description: "No se pudieron cargar los grupos. Inténtelo de nuevo.",
          variant: "destructive"
        });
      } finally {
        setLoading(false);
      }
    };
    
    fetchGrupos();
  }, [selectedCarrera]);
  
  // Cargar asistencias cuando se selecciona un grupo y fecha
  useEffect(() => {
    if (!selectedGrupo || !selectedDate) {
      setMaestros([]);
      return;
    }
    
    const cargarAsistencias = async () => {
      try {
        setLoading(true);
        const token = localStorage.getItem('auth_token');
        if (!token) {
          console.error("Token no encontrado en el local storage");
          return;
        }
        
        // Obtener el token data para el ID de usuario
        const tokenData = getToken();
        if (!tokenData) {
          console.error("No se pudo obtener el token o está inválido");
          return;
        }
        
        // Usar getAsistenciasPorGrupo en lugar de getAsistenciasPorUsuarioyFecha
        const data = await getAsistenciasPorGrupo(
          tokenData.id, 
          obtenerFechaDia(selectedDate), 
          parseInt(selectedGrupo),
          token
        );
        console.log("Asistencias cargadas:", data);
        if (data && data.length > 0) {
          console.log("Asistencias cargadas:", data);
          setMaestros(data);
          setAsistenciasPendientes([]);
          setCambiosPendientes(false);
        } else {
          // Si no hay asistencias registradas, cargamos el horario
          cargarHorario();
        }
      } catch (error) {
        console.error("Error al cargar asistencias:", error);
        toast({
          title: "Error",
          description: "No se pudieron cargar las asistencias. Inténtelo de nuevo.",
          variant: "destructive"
        });
      } finally {
        setLoading(false);
      }
    };
    
    // Función para cargar los horarios si no hay asistencias
    const cargarHorario = async () => {
      try {
        const token = localStorage.getItem('auth_token');
        if (!token) {
          console.error("Token no encontrado en el local storage");
          return;
        }
        
        const dia = obtenerNombreDia(selectedDate);
        const horariosData = await getHorarioDiarioGrupos(
          parseInt(selectedGrupo), 
          dia, 
          token
        );
        
        if (horariosData && horariosData.length > 0) {
          console.log("Horarios cargados:", horariosData);
          
          // Creamos registros de asistencia para cada horario
          const tokenData = getToken();
          if (!tokenData) {
            console.error("No se pudo obtener el token o está inválido");
            return;
          }
          
          for (const item of horariosData) {
            await createAsistencia(
              tokenData.id,
              item.id,
              obtenerFechaDia(selectedDate),
              null,
              "",
              token
            );
          }
          
          // Recargamos las asistencias usando getAsistenciasPorGrupo
          const asistenciasData = await getAsistenciasPorGrupo(
            tokenData.id,
            obtenerFechaDia(selectedDate),
            parseInt(selectedGrupo),
            token
          );
          
          setMaestros(asistenciasData || []);
        } else {
          setMaestros([]);
        }
      } catch (error) {
        console.error("Error al cargar horario:", error);
        toast({
          title: "Error",
          description: "No se pudo cargar el horario. Inténtelo de nuevo.",
          variant: "destructive"
        });
      }
    };
    
    cargarAsistencias();
  }, [selectedGrupo, selectedDate]);
  
  // Función para cambiar el estado de asistencia
  const cambiarEstadoAsistencia = async (id, estado) => {
    setMaestros((prevMaestros) =>
      prevMaestros.map((maestro) =>
        maestro.id === id ? { ...maestro, asistencia: estado } : maestro
      )
    );
  
    try {
      const token = localStorage.getItem("auth_token");
      if (!token) {
        console.error("Token no encontrado en el local storage");
        return;
      }
  
      const asistenciaData = {
        asistencia: estado,
        observaciones: maestros.find((m) => m.id === id)?.observaciones || "",
      };
  
      await modificarAsistencia(id, asistenciaData, token);
  
      toast({
        title: "Asistencia actualizada",
        description: "El estado de asistencia se ha guardado correctamente.",
        variant: "default",
      });
    } catch (error) {
      console.error("Error al guardar el estado de asistencia:", error);
      toast({
        title: "Error",
        description: "No se pudo guardar el estado de asistencia. Inténtelo de nuevo.",
        variant: "destructive",
      });
    }
  };
  
  // Función para guardar observación
  // Función para guardar observación automáticamente
const guardarObservacion = async () => {
  if (maestroEditId !== null) {
    setMaestros((prevMaestros) =>
      prevMaestros.map((maestro) =>
        maestro.id === maestroEditId
          ? { ...maestro, observaciones: observacionTemp }
          : maestro
      )
    );

    try {
      const token = localStorage.getItem("auth_token");
      if (!token) {
        console.error("Token no encontrado en el local storage");
        return;
      }

      const asistenciaData = {
        asistencia: maestros.find((m) => m.id === maestroEditId)?.asistencia,
        observaciones: observacionTemp,
      };

      await modificarAsistencia(maestroEditId, asistenciaData, token);

      toast({
        title: "Observación guardada",
        description: "La observación se ha guardado correctamente.",
        variant: "default",
      });
    } catch (error) {
      console.error("Error al guardar la observación:", error);
      toast({
        title: "Error",
        description: "No se pudo guardar la observación. Inténtelo de nuevo.",
        variant: "destructive",
      });
    } finally {
      setDialogOpen(false);
    }
  }
};
  
  // Función para preparar la edición de observaciones
  const editarObservacion = (id, observacionActual) => {
    setMaestroEditId(id);
    setObservacionTemp(observacionActual || "");
    setDialogOpen(true);
  };
  
  // Función para cancelar la edición de observaciones
  const cancelarEdicion = () => {
    setDialogOpen(false);
  };
  
  // Función para guardar todos los cambios
  const guardarCambios = async () => {
    const token = localStorage.getItem("auth_token");
    if (!token) {
      console.error("Token no encontrado en el local storage");
      return;
    }
    
    setLoading(true);
    
    try {
      // Procesar cada cambio pendiente
      for (const cambio of asistenciasPendientes) {
        const asistenciaData = {
          asistencia: cambio.asistencia,
          observaciones: cambio.observaciones
        };
        
        await modificarAsistencia(cambio.id, asistenciaData, token);
      }
      
      // Éxito - limpiar cambios pendientes
      setAsistenciasPendientes([]);
      setCambiosPendientes(false);
      
      // Notificar al usuario
      toast({
        title: "Cambios guardados",
        description: "Las asistencias han sido actualizadas correctamente",
        variant: "default"
      });
      
      // Recargar datos para asegurarnos de tener la información más reciente
      if (selectedDate && selectedGrupo) {
        const tokenData = getToken();
        if (tokenData) {
          const actualizados = await getAsistenciasPorGrupo(
            tokenData.id,
            obtenerFechaDia(selectedDate),
            parseInt(selectedGrupo),
            token
          );
          setMaestros(actualizados || []);
        }
      }
    } catch (error) {
      console.error("Error al guardar los cambios:", error);
      
      toast({
        title: "Error",
        description: "No se pudieron guardar los cambios. Inténtelo de nuevo.",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  // Función para guardar un solo cambio
  const guardarCambioIndividual = async (id) => {
    const cambio = asistenciasPendientes.find(item => item.id === id);
    if (!cambio) return;
    
    const token = localStorage.getItem("auth_token");
    if (!token) {
      console.error("Token no encontrado en el local storage");
      return;
    }
    
    setLoading(true);
    
    try {
      const asistenciaData = {
        asistencia: cambio.asistencia,
        observaciones: cambio.observaciones
      };
      
      await modificarAsistencia(id, asistenciaData, token);
      
      // Eliminar de cambios pendientes
      setAsistenciasPendientes(prev => prev.filter(item => item.id !== id));
      
      // Si no hay más cambios pendientes, actualizar el estado
      if (asistenciasPendientes.length <= 1) {
        setCambiosPendientes(false);
      }
      
      // Notificar al usuario
      toast({
        title: "Cambio guardado",
        description: "La asistencia ha sido actualizada correctamente",
        variant: "default"
      });
    } catch (error) {
      console.error("Error al guardar el cambio:", error);
      
      toast({
        title: "Error",
        description: "No se pudo guardar el cambio. Inténtelo de nuevo.",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex-1 p-8">
      <div className="flex justify-between items-center mb-8">
        <div>
          <h1 className="text-3xl font-bold">Checador</h1>
          <p className="text-muted-foreground">Gestión de asistencia docente por grupos</p>
        </div>
        
        <div className="flex items-center gap-4">
          <DatePicker 
            date={selectedDate}
            setDate={setSelectedDate}
          />
        </div>
      </div>
      
      <Tabs defaultValue="fecha" className="w-full">
        <TabsList className="mb-6">
        <TabsTrigger value="fecha">Por Fecha</TabsTrigger>
        <TabsTrigger value="hora">Por Hora</TabsTrigger>
        </TabsList>
        
        <TabsContent value="fecha" className="space-y-6">
          <Card>
            <CardHeader className="pb-3">
              <div className="flex justify-between items-center">
                <div>
                  <CardTitle>Registro de Asistencia</CardTitle>
                  <CardDescription>
                    Registra la asistencia de profesores para el día {selectedDate?.toLocaleDateString()}
                  </CardDescription>
                </div>
                
                <div className="flex space-x-4 items-center">
                  <Select
                    value={selectedCarrera}
                    onValueChange={setSelectedCarrera}
                  >
                    <SelectTrigger className="w-44">
                      <SelectValue placeholder="Seleccionar carrera" />
                    </SelectTrigger>
                    <SelectContent>
                      {carreras.map((carrera) => (
                        <SelectItem key={carrera.id} value={carrera.id.toString()}>
                          {carrera.nombre}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  
                  <Select
                    value={selectedGrupo}
                    onValueChange={setSelectedGrupo}
                    disabled={!selectedCarrera || grupos.length === 0}
                  >
                    <SelectTrigger className="w-44">
                      <SelectValue placeholder="Seleccionar grupo" />
                    </SelectTrigger>
                    <SelectContent>
                      {grupos.map((grupo) => (
                        <SelectItem key={grupo.id} value={grupo.id.toString()}>
                          {grupo.numero}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <div className="flex justify-end mb-4">
                {cambiosPendientes && (
                  <Button 
                    variant="secondary" 
                    size="sm" 
                    onClick={guardarCambios}
                    disabled={loading}
                    className="flex items-center gap-1"
                  >
                    <Save className="h-4 w-4" />
                    Guardar todos los cambios
                  </Button>
                )}
              </div>
              
              {loading ? (
                <div className="flex justify-center py-8">
                  <p>Cargando datos...</p>
                </div>
              ) : (
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Maestro</TableHead>
                      <TableHead>Materia</TableHead>
                      <TableHead>Grupo</TableHead>
                      <TableHead>Horario</TableHead>
                      <TableHead>Estado</TableHead>
                      <TableHead>Observaciones</TableHead>
                      <TableHead>Acciones</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {!selectedCarrera || !selectedGrupo ? (
                      <TableRow>
                        <TableCell colSpan={7} className="text-center py-4">
                          Seleccione una carrera y un grupo para ver los datos
                        </TableCell>
                      </TableRow>
                    ) : maestros.length === 0 ? (
                      <TableRow>
                        <TableCell colSpan={7} className="text-center py-4">
                          No hay clases programadas para este grupo en la fecha seleccionada
                        </TableCell>
                      </TableRow>
                    ) : (
                      maestros.map((maestro) => (
                        <TableRow key={maestro.id}>
                          <TableCell className="font-medium">{maestro.horarios.maestros.nombre + " " +maestro.horarios.maestros.apellido}</TableCell>
                          <TableCell>{maestro.horarios.materias.nombre}</TableCell>
                          <TableCell>{maestro.horarios.grupo.nombre}</TableCell>
                          <TableCell>{maestro.horarios.hora_inicio + " - "+maestro.horarios.hora_fin}</TableCell>
                          <TableCell>
                            <div className="flex items-center gap-2">
                              <Switch
                                checked={maestro.asistencia === true}
                                onCheckedChange={async (checked) => {
                                  await cambiarEstadoAsistencia(maestro.id, checked);
                                }}
                                disabled={loading}
                                className={
                                  maestro.asistencia === null
                                    ? "border-yellow-400 bg-yellow-100 data-[state=checked]:bg-yellow-400"
                                    : maestro.asistencia === true
                                    ? "border-green-600 bg-green-100 data-[state=checked]:bg-green-600"
                                    : "border-red-600 bg-red-100 data-[state=checked]:bg-red-600"
                                }
                              />
                              <span
                                className={
                                  "text-xs " +
                                  (maestro.asistencia === true
                                    ? "text-green-700"
                                    : maestro.asistencia === false
                                    ? "text-red-700"
                                    : "text-yellow-700")
                                }
                              >
                                {maestro.asistencia === null
                                  ? "Pendiente"
                                  : maestro.asistencia
                                  ? "Asistió"
                                  : "No asistió"}
                              </span>
                            </div>
                          </TableCell>
                          <TableCell className="max-w-[200px] truncate">{maestro.observaciones}</TableCell>
                          <TableCell>
                            <div className="flex space-x-2">
                              <Button 
                                variant="outline" 
                                size="sm" 
                                onClick={() => editarObservacion(maestro.id, maestro.observaciones)}
                              >
                                <FileText className="h-4 w-4" />
                              </Button>
                              <Button 
                                variant="outline" 
                                size="sm" 
                                onClick={() => guardarCambioIndividual(maestro.id)}
                                className={asistenciasPendientes.some(item => item.id === maestro.id) ? "text-blue-600" : "text-gray-400"}
                                disabled={!asistenciasPendientes.some(item => item.id === maestro.id)}
                              >
                                <Save className="h-4 w-4" />
                              </Button>
                            </div>
                          </TableCell>
                        </TableRow>
                      ))
                    )}
                  </TableBody>
                </Table>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="hora" className="space-y-6">
  <Card>
    <CardHeader className="pb-3">
      <div className="flex justify-between items-center">
        <div>
          <CardTitle>Registro de Asistencia - Hora</CardTitle>
          <CardDescription>
            Registra la asistencia de profesores para el día {selectedDate?.toLocaleDateString()} y hora seleccionada
          </CardDescription>
        </div>
        <div className="flex space-x-4 items-center">
          {/* Selects de carrera y grupo */}
          {/* --- Pega aquí el bloque copiado --- */}
          <Select
            value={selectedCarrera}
            onValueChange={setSelectedCarrera}
          >
            <SelectTrigger className="w-44">
              <SelectValue placeholder="Seleccionar carrera" />
            </SelectTrigger>
            <SelectContent>
              {carreras.map((carrera) => (
                <SelectItem key={carrera.id} value={carrera.id.toString()}>
                  {carrera.nombre}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          
          <Select
            value={selectedGrupo}
            onValueChange={setSelectedGrupo}
            disabled={!selectedCarrera || grupos.length === 0}
          >
            <SelectTrigger className="w-44">
              <SelectValue placeholder="Seleccionar grupo" />
            </SelectTrigger>
            <SelectContent>
              {grupos.map((grupo) => (
                <SelectItem key={grupo.id} value={grupo.id.toString()}>
                  {grupo.numero}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          {/* Select de hora */}
          <Select
            value={selectedTime}
            onValueChange={setSelectedTime}
            disabled={!selectedGrupo}
          >
            <SelectTrigger className="w-44">
              <SelectValue placeholder="Seleccionar hora" />
            </SelectTrigger>
            <SelectContent>
              {hourOptions.map((option) => (
                <SelectItem
                  key={option.value}
                  value={option.value}
                >
                  {option.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </div>
    </CardHeader>
            <CardContent>
            <div className="flex justify-end mb-4">
                {cambiosPendientes && (
                  <Button 
                    variant="secondary" 
                    size="sm" 
                    onClick={guardarCambios}
                    disabled={loading}
                    className="flex items-center gap-1"
                  >
                    <Save className="h-4 w-4" />
                    Guardar todos los cambios
                  </Button>
                )}
              </div>
              
              {loading ? (
                <div className="flex justify-center py-8">
                  <p>Cargando datos...</p>
                </div>
              ) : (
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Maestro</TableHead>
                      <TableHead>Materia</TableHead>
                      <TableHead>Grupo</TableHead>
                      <TableHead>Horario</TableHead>
                      <TableHead>Estado</TableHead>
                      <TableHead>Observaciones</TableHead>
                      <TableHead>Acciones</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {!selectedTime ? (
                      <TableRow>
                        <TableCell colSpan={7} className="text-center py-4">
                          Seleccione una hora para ver los datos
                        </TableCell>
                      </TableRow>
                    ) : maestros.length === 0 ? (
                      <TableRow>
                        <TableCell colSpan={7} className="text-center py-4">
                          No hay clases programadas para esta hora
                        </TableCell>
                      </TableRow>
                    ) : (
                      maestros.map((maestro) => (
                        <TableRow key={maestro.id}>
                          <TableCell className="font-medium">{maestro.horarios.maestros.nombre + " " + maestro.horarios.maestros.apellido}</TableCell>
                          <TableCell>{maestro.horarios.materias.nombre}</TableCell>
                          <TableCell>{maestro.horarios.grupo.nombre}</TableCell>
                          <TableCell>{maestro.horarios.hora_inicio + " - "+maestro.horarios.hora_fin}</TableCell>
                          <TableCell>
                            <div className="flex items-center gap-2">
                              <Switch
                                checked={maestro.asistencia === true}
                                onCheckedChange={async (checked) => {
                                  await cambiarEstadoAsistencia(maestro.id, checked);
                                }}
                                disabled={loading}
                                className={
                                  maestro.asistencia === null
                                    ? "border-yellow-400 bg-yellow-100 data-[state=checked]:bg-yellow-400"
                                    : maestro.asistencia === true
                                    ? "border-green-600 bg-green-100 data-[state=checked]:bg-green-600"
                                    : "border-red-600 bg-red-100 data-[state=checked]:bg-red-600"
                                }
                              />
                              <span
                                className={
                                  "text-xs " +
                                  (maestro.asistencia === true
                                    ? "text-green-700"
                                    : maestro.asistencia === false
                                    ? "text-red-700"
                                    : "text-yellow-700")
                                }
                              >
                                {maestro.asistencia === null
                                  ? "Pendiente"
                                  : maestro.asistencia
                                  ? "Asistió"
                                  : "No asistió"}
                              </span>
                            </div>
                          </TableCell>
                          <TableCell className="max-w-[200px] truncate">{maestro.observaciones}</TableCell>
                          <TableCell>
                            <div className="flex space-x-2">
                              <Button 
                                variant="outline" 
                                size="sm" 
                                onClick={() => editarObservacion(maestro.id, maestro.observaciones)}
                              >
                                <FileText className="h-4 w-4" />
                              </Button>
                              <Button 
                                variant="outline" 
                                size="sm" 
                                onClick={() => guardarCambioIndividual(maestro.id)}
                                className={asistenciasPendientes.some(item => item.id === maestro.id) ? "text-blue-600" : "text-gray-400"}
                                disabled={!asistenciasPendientes.some(item => item.id === maestro.id)}
                              >
                                <Save className="h-4 w-4" />
                              </Button>
                            </div>
                          </TableCell>
                        </TableRow>
                      ))
                    )}
                  </TableBody>
                </Table>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
      
      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Observaciones</DialogTitle>
            <DialogDescription>
              {maestroEditId !== null && 
                `Registra observaciones para ${maestros.find(m => m.id === maestroEditId)?.maestro} (${maestros.find(m => m.id === maestroEditId)?.materia})`
              }
            </DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <Textarea
              placeholder="Escribe aquí las observaciones..."
              value={observacionTemp}
              onChange={(e) => setObservacionTemp(e.target.value)}
              rows={4}
            />
          </div>
          <DialogFooter className="flex justify-between sm:justify-between">
            <Button variant="outline" onClick={cancelarEdicion}>
              Cancelar
            </Button>
            <Button onClick={guardarObservacion} type="submit">
              Guardar
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default ChecadorPage;