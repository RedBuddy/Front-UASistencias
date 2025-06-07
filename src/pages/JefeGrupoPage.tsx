import React, { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { DatePicker } from "@/components/DatePicker";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Input } from "@/components/ui/input";
import { getAsistenciasPorUsuarioYFecha, modificarAsistencia } from "@/data/api/asistenciasApi";
import { 
  ClipboardCheck, 
  CheckSquare, 
  X, 
  Search,
  Clock,
  Save,
  FileText
} from "lucide-react";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Textarea } from "@/components/ui/textarea";
import { getHorarioDiarioJefeGrupo } from "@/core/horariosService";
import { getAsistenciasPorUsuarioyFecha, createAsistencia } from "@/core/asistenciasService";
import { getToken } from "@/core/authService";
import { toast } from "@/components/ui/use-toast"; // Asumiendo que tienes un componente toast
import { Switch } from "@/components/ui/switch"; // Asegúrate de tener un componente Switch

const JefeGrupoPage = () => {
  const [selectedDate, setSelectedDate] = useState<Date | undefined>(new Date());
  const [searchTerm, setSearchTerm] = useState("");
  const [dialogOpen, setDialogOpen] = useState(false);
  const [maestros, setMaestros] = useState([]);
  const [observacionTemp, setObservacionTemp] = useState("");
  const [maestroEditId, setMaestroEditId] = useState<number | null>(null);
  const [cambiosPendientes, setCambiosPendientes] = useState(false);
  const [asistenciasPendientes, setAsistenciasPendientes] = useState([]); // Para almacenar los cambios pendientes

  // Función para obtener el nombre del día en español
  const obtenerNombreDia = (fecha: Date): string => {
    const dias = ["Domingo", "Lunes", "Martes", "Miércoles", "Jueves", "Viernes", "Sábado"];
    return dias[fecha.getDay()];
  };
  
  const obtenerFechaDia = (fecha: Date): string => {
    return fecha.toISOString().split("T")[0];
  }

  // Función para cargar las asistencias del jefe de grupo
  const cargarAsistencias = async (fecha: Date) => {
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
    const jefeId = tokenData.id;

    try {
      const data = await getAsistenciasPorUsuarioyFecha(jefeId, obtenerFechaDia(fecha), token);
      if (data.length === 0) {
        cargarHorario(fecha);
      } else {
        console.log("Asistencias: ", data);
        setMaestros(data);
        setAsistenciasPendientes([]); // Reinicia los cambios pendientes
        setCambiosPendientes(false);
      }
    } catch (error) {
      console.error("Error al cargar las asistencias:", error);
    }
  };

  // Función para cargar los datos del horario
  const cargarHorario = async (fecha: Date) => {
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
    const jefeId = tokenData.id;

    try {
      const data = await getHorarioDiarioJefeGrupo(jefeId, dia, token);
      console.log("Horario: ", data);
      // Después de crear las asistencias en cargarHorario
for (const item of data) {
  await createAsistencia(jefeId, item.id, obtenerFechaDia(fecha), null, "", token);
}
// Aquí deberías volver a cargar las asistencias:
const asistencias = await getAsistenciasPorUsuarioyFecha(jefeId, obtenerFechaDia(fecha), token);
setMaestros(asistencias);
    } catch (error) {
      console.error("Error al cargar el horario:", error);
    }
  };

  // useEffect para cargar el horario al cambiar la fecha seleccionada
  useEffect(() => {
    if (selectedDate) {
      cargarAsistencias(selectedDate);
    }
  }, [selectedDate]);

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
  const editarObservacion = (id: number, observacionActual: string) => {
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
    
    // Mostrar indicador de carga (podrías usar un estado loading si tienes un componente para eso)
    
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
  const guardarCambioIndividual = async (id: number) => {
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
          <h1 className="text-3xl font-bold">Jefe de Grupo</h1>
          <p className="text-muted-foreground">Gestión de asistencia docente</p>
        </div>
        
        <div className="flex items-center gap-4">
          <DatePicker 
            date={selectedDate}
            setDate={setSelectedDate}
          />
        </div>
      </div>
      
      <Tabs defaultValue="asistencia" className="w-full">
        <TabsList className="mb-6">
          <TabsTrigger value="asistencia">Registro de Asistencia</TabsTrigger>
        </TabsList>
        
        <TabsContent value="asistencia" className="space-y-6">
          <Card>
            <CardHeader className="pb-3">
              <div className="flex justify-between items-center">
                <div>
                  <CardTitle>Registro de Asistencia</CardTitle>
                  <CardDescription>
                    Registra la asistencia de profesores para el día {selectedDate?.toLocaleDateString()}
                  </CardDescription>
                </div>
                
              </div>
            </CardHeader>
            <CardContent>
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
                  {maestros
                    .filter(maestro =>
                      maestro.maestro.toLowerCase().includes(searchTerm.toLowerCase()) ||
                      maestro.materia.toLowerCase().includes(searchTerm.toLowerCase()) ||
                      maestro.grupo.toLowerCase().includes(searchTerm.toLowerCase())
                    )
                    .map(maestro => (
                      <TableRow key={maestro.id}>
                        <TableCell className="font-medium">{maestro.maestro}</TableCell>
                        <TableCell>{maestro.materia}</TableCell>
                        <TableCell>{maestro.grupo}</TableCell>
                        <TableCell>{maestro.horario}</TableCell>
                        <TableCell>
  <div className="flex items-center gap-2">
    <Switch
      checked={maestro.asistencia === true}
      onCheckedChange={async (checked) => {
        await cambiarEstadoAsistencia(maestro.id, checked);
      }}
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

export default JefeGrupoPage;