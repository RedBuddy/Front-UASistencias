import React, { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Textarea } from "@/components/ui/textarea";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { 
  UserCircle, 
  BookOpen, 
  Calendar, 
  Save, 
  CheckSquare,
  ClipboardCheck,
  Clock,
  X,
  Edit,
  FileText
} from "lucide-react";
import { DatePicker } from "@/components/DatePicker";
import { toast } from "@/components/ui/use-toast";
import { getToken } from "@/core/authService";
import { getAsistenciasPorUsuarioyFecha, createAsistencia } from "@/core/asistenciasService";
import { getHorarioMaestroDia } from "@/core/horariosService";
import { modificarAsistencia } from "@/data/api/asistenciasApi";

const MaestroPage = () => {
  const [selectedDate, setSelectedDate] = useState(new Date());
  const [clases, setClases] = useState([]);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [observacionTemp, setObservacionTemp] = useState("");
  const [claseEditId, setClaseEditId] = useState(null);
  const [cambiosPendientes, setCambiosPendientes] = useState(false);
  const [asistenciasPendientes, setAsistenciasPendientes] = useState([]);

  // Función para obtener el nombre del día en español
  const obtenerNombreDia = (fecha) => {
    const dias = ["Domingo", "Lunes", "Martes", "Miércoles", "Jueves", "Viernes", "Sábado"];
    return dias[fecha.getDay()];
  };
  
  const obtenerFechaDia = (fecha) => {
    return fecha.toISOString().split("T")[0];
  };

  // Función para cargar las asistencias del maestro
  const cargarAsistencias = async (fecha) => {
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
    const maestroId = tokenData.id;

    try {
      const data = await getAsistenciasPorUsuarioyFecha(maestroId, obtenerFechaDia(fecha), token);
      if (data.length === 0) {
        cargarHorario(fecha);
      } else {
        console.log("Asistencias: ", data);
        setClases(data);
        setAsistenciasPendientes([]);
        setCambiosPendientes(false);
      }
    } catch (error) {
      console.error("Error al cargar las asistencias:", error);
      toast({
        title: "Error",
        description: "No se pudieron cargar las asistencias. Inténtelo de nuevo.",
        variant: "destructive"
      });
    }
  };

  // Función para cargar los datos del horario
  const cargarHorario = async (fecha) => {
    const token = localStorage.getItem("auth_token");
    if (!token) {
      console.error("Token no encontrado en el local storage");
      return;
    }

    const dia = obtenerNombreDia(fecha);
    const tokenData = getToken();
    if (!tokenData) {
      console.error("No se pudo obtener el token o está inválido");
      return;
    }
    const maestroId = tokenData.id;

    try {
      const data = await getHorarioMaestroDia(maestroId, dia, token);
      console.log("Horario: ", data);
      
      // Crear asistencias para cada elemento del horario
      for (const item of data) {
        await createAsistencia(maestroId, item.id, obtenerFechaDia(fecha), null, "", token);
      }
      
      // Recargar las asistencias después de crearlas
      const asistenciasData = await getAsistenciasPorUsuarioyFecha(maestroId, obtenerFechaDia(fecha), token);
      setClases(asistenciasData);
    } catch (error) {
      console.error("Error al cargar el horario:", error);
      toast({
        title: "Error",
        description: "No se pudo cargar el horario. Inténtelo de nuevo.",
        variant: "destructive"
      });
    }
  };

  // useEffect para cargar el horario al cambiar la fecha seleccionada
  useEffect(() => {
    if (selectedDate) {
      cargarAsistencias(selectedDate);
    }
  }, [selectedDate]);
  const cambiarEstadoAsistencia = async (id, estado) => {
    setClases((prevMaestros) =>
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
        observaciones: clases.find((m) => m.id === id)?.observaciones || "",
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
  
  // Función para guardar observación automáticamente
  const guardarObservacion = async () => {
    if (claseEditId !== null) {
      setClases((prevMaestros) =>
        prevMaestros.map((maestro) =>
          maestro.id === claseEditId
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
          asistencia: clases.find((m) => m.id === claseEditId)?.asistencia,
          observaciones: observacionTemp,
        };
  
        await modificarAsistencia(claseEditId, asistenciaData, token);
  
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
    setClaseEditId(id);
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
      if (selectedDate) {
        cargarAsistencias(selectedDate);
      }
    } catch (error) {
      console.error("Error al guardar los cambios:", error);
      
      // Notificar al usuario del error
      toast({
        title: "Error",
        description: "No se pudieron guardar los cambios. Inténtelo de nuevo.",
        variant: "destructive"
      });
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
      
      // Notificar al usuario del error
      toast({
        title: "Error",
        description: "No se pudo guardar el cambio. Inténtelo de nuevo.",
        variant: "destructive"
      });
    }
  };

  return (
    <div className="flex-1 p-8">
      <div className="flex justify-between items-center mb-8">
        <div>
          <h1 className="text-3xl font-bold">Portal del Maestro</h1>
          <p className="text-muted-foreground">Gestión de asistencia y horarios</p>
        </div>
        
        <div className="flex items-center gap-4">
          <DatePicker 
            date={selectedDate}
            setDate={setSelectedDate}
          />
          {cambiosPendientes && (
            <Button 
              onClick={guardarCambios}
              variant="default"
              className="ml-2"
            >
              <Save className="mr-2 h-4 w-4" />
              Guardar Cambios
            </Button>
          )}
        </div>
      </div>
      
      <Tabs defaultValue="asistencia" className="w-full">
        <TabsList className="mb-6">
          <TabsTrigger value="asistencia">Mi Asistencia</TabsTrigger>
          <TabsTrigger value="horario">Mi Horario</TabsTrigger>
        </TabsList>
        
        <TabsContent value="asistencia" className="space-y-6">
          <Card>
            <CardHeader className="pb-3">
              <div className="flex justify-between items-center">
                <div>
                  <CardTitle>Registro de Autoevaluación</CardTitle>
                  <CardDescription>
                    Registra tu asistencia a clases para el día {selectedDate?.toLocaleDateString()}
                  </CardDescription>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Materia</TableHead>
                    <TableHead>Grupo</TableHead>
                    <TableHead>Horario</TableHead>
                    <TableHead>Estado</TableHead>
                    <TableHead>Observaciones</TableHead>
                    <TableHead>Acciones</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {clases.map((clase) => (
                    <TableRow key={clase.id}>
                      <TableCell className="font-medium">{clase.materia}</TableCell>
                      <TableCell>{clase.grupo}</TableCell>
                      <TableCell>{clase.horario}</TableCell>
                      <TableCell>
                        {clase.asistencia === null ? (
                          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-yellow-100 text-yellow-800">
                            <Clock className="mr-1 h-3 w-3" /> Pendiente
                          </span>
                        ) : clase.asistencia ? (
                          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
                            <CheckSquare className="mr-1 h-3 w-3" /> Asistí
                          </span>
                        ) : (
                          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-red-100 text-red-800">
                            <X className="mr-1 h-3 w-3" /> No Asistí
                          </span>
                        )}
                      </TableCell>
                      <TableCell className="max-w-[200px] truncate">{clase.observaciones}</TableCell>
                      <TableCell>
                            <div className="flex space-x-2">
                              <DropdownMenu>
                                <DropdownMenuTrigger asChild>
                                  <Button variant="outline" size="sm">
                                    <ClipboardCheck className="h-4 w-4" />
                                  </Button>
                                </DropdownMenuTrigger>
                                <DropdownMenuContent align="end">
                                  <DropdownMenuItem onClick={() => cambiarEstadoAsistencia(clase.id, true)}>
                                    <CheckSquare className="mr-2 h-4 w-4 text-green-600" />
                                    <span>Asistió</span>
                                  </DropdownMenuItem>
                                  <DropdownMenuItem onClick={() => cambiarEstadoAsistencia(clase.id, false)}>
                                    <X className="mr-2 h-4 w-4 text-red-600" />
                                    <span>No asistió</span>
                                  </DropdownMenuItem>
                                  <DropdownMenuItem onClick={() => cambiarEstadoAsistencia(clase.id, null)}>
                                    <Clock className="mr-2 h-4 w-4 text-yellow-600" />
                                    <span>Pendiente</span>
                                  </DropdownMenuItem>
                                </DropdownMenuContent>
                              </DropdownMenu>
                              <Button 
                                variant="outline" 
                                size="sm" 
                                onClick={() => editarObservacion(clase.id, clase.observaciones)}
                              >
                                <FileText className="h-4 w-4" />
                              </Button>
                              <Button 
                                variant="outline" 
                                size="sm" 
                                onClick={() => guardarCambioIndividual(clase.id)}
                                className={asistenciasPendientes.some(item => item.id === clase.id) ? "text-blue-600" : "text-gray-400"}
                                disabled={!asistenciasPendientes.some(item => item.id === clase.id)}
                              >
                                <Save className="h-4 w-4" />
                              </Button>
                            </div>
                          </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </TabsContent>
        
        <TabsContent value="horario">
          <Card>
            <CardHeader>
              <CardTitle>Mi Horario de Clases</CardTitle>
              <CardDescription>
                Vista general de tu horario semanal
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Día</TableHead>
                    <TableHead>Materia</TableHead>
                    <TableHead>Grupo</TableHead>
                    <TableHead>Horario</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {clases.map((clase) => (
                    <TableRow key={clase.id}>
                      <TableCell>{obtenerNombreDia(selectedDate)}</TableCell>
                      <TableCell>{clase.materia}</TableCell>
                      <TableCell>{clase.grupo}</TableCell>
                      <TableCell>{clase.horario}</TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
      
      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Observaciones</DialogTitle>
            <DialogDescription>
              {claseEditId !== null && 
                `Registra observaciones para la clase de ${clases.find(c => c.id === claseEditId)?.materia} (${clases.find(c => c.id === claseEditId)?.grupo})`
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

export default MaestroPage;