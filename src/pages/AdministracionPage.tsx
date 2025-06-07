import React, { useEffect, useState } from "react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Input } from "@/components/ui/input";
import {
  FileBarChart,
  Download,
  UserPlus,
  Search,
  Filter,
  BarChart,
  PieChart,
  FileText,
  Users as U,
  UserIcon,
  Pencil,
} from "lucide-react";
import { DatePicker } from "@/components/DatePicker";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";
import { getJwt, getToken } from "@/core/authService";
import { Users } from "@/models/users";
import { mapCarreras } from "@/mappers/carreraMapper";
import { getAllPlanEstudio } from "@/core/planEstudioService";
import { getGruposByPlan } from "@/core/grupoService";
import { addUser, getAllUsers, updateUser } from "@/core/userService";
import { addCarrera, getAllCarreras } from "@/core/carreraService";
import { Carrera } from "@/models/carrera";
import { addJefeCarrera } from "@/core/jefeCarreraService";
import { PlanEstudio } from "@/models/plan_estudio";
import { User } from "@/models/user";
import { Grupo } from "@/models/grupo";
import { set } from "date-fns";
import { generarAsistenciaGrupoPDF, generarReporteAsistenciaMaestroPDF } from "@/data/api/asistenciasApi";
import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";
import { tr } from "date-fns/locale";

const AdministracionPage = () => {
  const { toast } = useToast();

  const [selectedDate, setSelectedDate] = useState<Date | undefined>(
    new Date()
  );
  const [searchTerm, setSearchTerm] = useState("");
  const [mostrarCarrera, setMostrarCarrera] = useState(false);

  const [nuevoUsuarioOpen, setNuevoUsuarioOpen] = useState(false);
  const [selectedCarrera, setSelectedCarrera] = useState<Carrera | null>(null);
  const [selectedPlanEstudio, setSelectedPlanEstudio] = useState<PlanEstudio | null>(null);
  const [selectedMaestro, setSelectedMaestro] = useState<Users | null>(null);
  const [selectedGrupo, setSelectedGrupo] = useState<Grupo | null>(null);
  const [startDate, setStartDate] = useState<Date | undefined>(new Date());
  const [endDate, setEndDate] = useState<Date | undefined>(new Date());

  const [nuevaCarreraOpen, setNuevaCarreraOpen] = useState(false);
  const [editarUsuarioOpen, setEditarUsuarioOpen] = useState(false);
  const [editarCarreraOpen, setEditarCarreraOpen] = useState(false);
  const [autoasistencia, setAutoasistencia] = useState(false);
  const [jefeGrupo, setJefeGrupo] = useState(false);
  const [checador, setChecador] = useState(false);
  const [usuarioSeleccionado, setUsuarioSeleccionado] = useState<Users | null>(
    null
  );
  const [carreraSeleccionada, setCarreraSeleccionada] =
    useState<Carrera | null>(null);
  const [nuevoUsuario, setNuevoUsuario] = useState({
    nombre: "",
    apellido: "",
    cuenta: "",
    rol: "5",
    carrera: "",
  });

  
  const [planesEstudio, setPlanesEstudio] = useState<PlanEstudio[]>([]);
  const [grupos, setGrupos] = useState<Grupo[]>([]);
  


  const [nuevaCarrera, setNuevaCarrera] = useState("");

  const [usuarios, setUsers] = useState<Users[]>([]);
  const [carreras, setCarreras] = useState<Carrera[]>([]);

  const filteredUsuarios = usuarios.filter(
    (usuario) =>
      usuario.nombre.toLowerCase().includes(searchTerm.toLowerCase()) ||
      usuario.apellido.toLowerCase().includes(searchTerm.toLowerCase()) ||
      usuario.username.toLowerCase().includes(searchTerm.toLowerCase()) ||
      usuario.rol.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const filteredCarreras = carreras.filter((carrera) =>
    carrera.nombre.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleNuevoUsuarioChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>
  ) => {
    const { name, value } = e.target;
    setNuevoUsuario({
      ...nuevoUsuario,
      [name]: value,
    });
    if (name === "rol") {
      if (value === "1") {
        setMostrarCarrera(true);
        // fetchCarreras(); // Hacer la petición al backend
      } else {
        setMostrarCarrera(false);
        setNuevoUsuario((prev) => ({ ...prev, carrera: "" })); // Limpiar la carrera seleccionada
      }
    }
  };

  const handleNuevaCarreraChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>
  ) => {
    const { value } = e.target;
    setNuevaCarrera(value);
  };
  
  const handleGenerarReporte = async () => {
    // Validar fechas
    if (!startDate || !endDate) {
      toast({
        title: "Fechas requeridas",
        description: "Debes seleccionar ambas fechas: inicio y fin.",
        variant: "destructive",
      });
      return;
    }
    if (startDate > endDate) {
      toast({
        title: "Rango de fechas inválido",
        description: "La fecha inicial no puede ser mayor que la fecha final.",
        variant: "destructive",
      });
      return;
    }

    if (!autoasistencia && !jefeGrupo && !checador) {
      toast({
        title: "Faltan opciones",
        description: "Debes seleccionar al menos una opción: Autoasistencia, Jefe de Grupo o Checador.",
        variant: "destructive",
      });
      return;
    }
    if (selectedMaestro) {
      // Generar reporte PDF para el maestro
      try {
        await generarReporteAsistenciaMaestroPDF(
          selectedMaestro.id,
          startDate?.toISOString().split('T')[0],
          endDate?.toISOString().split('T')[0],
          checador,
          autoasistencia,
          jefeGrupo
        );
        toast({
          title: "Reporte PDF generado",
          description: `Reporte de asistencia y resumen estadístico para el maestro ${selectedMaestro.nombre} ${selectedMaestro.apellido} generado correctamente.`,
        });
      } catch (error: unknown) {
        toast({
          title: "Error al generar reporte",
          description: error instanceof Error ? error.message : "Ocurrió un error desconocido.",
          variant: "destructive",
        });
      }
    } else if (selectedCarrera && selectedPlanEstudio && selectedGrupo) {
      // Generar reporte PDF para el grupo
      try {
        await generarAsistenciaGrupoPDF(
          selectedGrupo.id,
          startDate?.toISOString().split('T')[0],
          endDate?.toISOString().split('T')[0],
          checador,
          autoasistencia,
          jefeGrupo
        );
        toast({
          title: "Reporte PDF generado",
          description: `Reporte de asistencia para el grupo ${selectedGrupo.numero} generado correctamente.`,
        });
      } catch (error: unknown) {
        toast({
          title: "Error al generar reporte",
          description: error instanceof Error ? error.message : "Ocurrió un error desconocido.",
          variant: "destructive",
        });
      }
    } else {
      toast({
        title: "Faltan datos",
        description: "Por favor, selecciona un maestro o una combinación de carrera, plan y grupo.",
        variant: "destructive",
      });
    }
  };

  const handleNuevoUsuarioSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    try {
      let newUser = await addUser(
        nuevoUsuario.cuenta,
        nuevoUsuario.rol,
        nuevoUsuario.nombre,
        nuevoUsuario.apellido,
        nuevoUsuario.carrera
      );

      newUser = {
        id: newUser.user.id,
        nombre: newUser.user.nombre,
        apellido: newUser.user.apellido,
        rol: newUser.user.rol.nombre,
        rol_id: newUser.user.rol_id,
        username: newUser.user.username,
      };
      setUsers([...usuarios, newUser]);

      setNuevoUsuarioOpen(false);

      // Limpia el formulario DESPUÉS de la petición y pon Maestro como default
      setNuevoUsuario({
        nombre: "",
        apellido: "",
        cuenta: "",
        rol: "5",
        carrera: "",
      });

      toast({
        title: "Usuario creado",
        description: `${newUser.nombre} ${newUser.apellido} ha sido añadido correctamente.`,
      });
    } catch (error) {
      toast({
        title: "Error al crear usuario",
        description: error instanceof Error
          ? error.message
          : "Ocurrió un error al crear el usuario.",
        variant: "destructive",
      });
    }
  };
  const handleAllPlanEstudio = async (carrera_id) => {
    const token = getJwt();
    const allPlanEstudio = await getAllPlanEstudio(carrera_id, token);
    const planesEstudio = allPlanEstudio
    return allPlanEstudio;
  };

  const handleAllGruposPlan = async (plan_id) => {
    const token = getJwt();
    const allGrupos = await getGruposByPlan(token, plan_id);
    return allGrupos;
  };
  const handleNuevaCarreraSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    // 🛠 Aquí deberías hacer la petición POST al backend para crear un nuevo usuario

    const newCarrera = await addCarrera(nuevaCarrera, getJwt());

    setCarreras([...carreras, newCarrera]);

    setNuevaCarreraOpen(false);
    setNuevaCarrera("");

    toast({
      title: "Carrera creada correctamente",
      description: `${newCarrera.nombre}  ha sido añadido correctamente.`,
    });
  };

  const handleEditarUsuario = (usuario: Users) => {
    setUsuarioSeleccionado(usuario);
    setEditarUsuarioOpen(true);
  };

  const handleEditarUsuarioChange = (
    e: React.ChangeEvent<HTMLInputElement>
  ) => {
    const { name, value } = e.target;
    if (usuarioSeleccionado) {
      setUsuarioSeleccionado({
        ...usuarioSeleccionado,
        [name]: value,
      });
    }
  };

  const handleEditarCarreraChange = (
    e: React.ChangeEvent<HTMLInputElement>
  ) => {
    const { name, value } = e.target;
    if (carreraSeleccionada) {
      setCarreraSeleccionada({
        ...carreraSeleccionada,
        [name]: value,
      });
    }
  };


  const handleEditarUsuarioSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (usuarioSeleccionado) {
      await updateUser(
        usuarioSeleccionado.username,
        usuarioSeleccionado.rol_id.toString(),
        usuarioSeleccionado.nombre,
        usuarioSeleccionado.apellido
      );

      const updatedUsuarios = usuarios.map((u) =>
        u.id === usuarioSeleccionado.id ? usuarioSeleccionado : u
      );

      setUsers(updatedUsuarios);

      setEditarUsuarioOpen(false);
      setUsuarioSeleccionado(null);

      toast({
        title: "Usuario actualizado",
        description: `${usuarioSeleccionado.nombre} ${usuarioSeleccionado.apellido} ha sido actualizado correctamente.`,
      });
    }
  };

  const handleEditarCarreraSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (carreraSeleccionada) {
      await addJefeCarrera(
        carreraSeleccionada.id.toString(),
        getJwt(),
        carreraSeleccionada.nombre
      );

      const updatedCarrera = carreras.map((u) =>
        u.id === carreraSeleccionada.id ? carreraSeleccionada : u
      );

      // setUsers(updatedUsuarios);
      setCarreras(updatedCarrera);

      setEditarCarreraOpen(false);
      setCarreraSeleccionada(null);

      toast({
        title: "Carrera actualizada correctamente",
        description: `${carreraSeleccionada.nombre} ha sido actualizado correctamente.`,
      });
    }
  };

  const handleEditarCarrera = (carrera: Carrera) => {
    setEditarCarreraOpen(true);
    
    setCarreraSeleccionada(carrera);
    
  };
  

  useEffect(() => {
    const fetchData = async () => {
      const token = getJwt();
      const allUsers = await getAllUsers(token);
      console.log(allUsers);
      setUsers(allUsers);
      const allCarreras = await getAllCarreras(token);
      setCarreras(allCarreras);
    };

    fetchData();
  }, []);

  return (
    <div className="flex-1 p-8">
      <div className="pb-6">
        <h1 className="text-3xl font-bold">Administración</h1>
        <p className="text-muted-foreground">
          Generación de reportes y gestión de cuentas
        </p>

        <div className="flex items-center gap-4">

        </div>
      </div>
      <div className="flex justify-between items-center mb-8">
        <Tabs defaultValue="reportes" className="w-full">
          <TabsList className="mb-6">
            <TabsTrigger value="reportes">Reportes</TabsTrigger>
            <TabsTrigger value="cuentas">Gestión de Cuentas</TabsTrigger>
            <TabsTrigger value="carreras">Gestión de Carreras</TabsTrigger>
          </TabsList>
          <TabsContent value="reportes" className="space-y-6">
            <Card>
              <CardHeader className="pb-3">
                <div className="flex justify-between items-center">
                  <div>
                    <CardTitle>Generación de Reportes</CardTitle>
                    <CardDescription>
                      Genera y descarga reportes del sistema
                    </CardDescription>
                  </div>
                  
                  <div className="flex items-center gap-3">
                    <Button>
                      <FileBarChart className="mr-2 h-4 w-4" /> Nuevo Reporte
                    </Button>
                  </div>
                </div>
              </CardHeader>



              <CardContent>
                <div className="grid grid-cols-1  gap-6 mb-6">
                <Tabs
  defaultValue="grupo"
  className="w-full"
  onValueChange={(value) => {
    if (value === "grupo") {
      // Resetear valores relacionados con la pestaña de Grupo
      setSelectedCarrera(null);
      setSelectedPlanEstudio(null);
      setSelectedGrupo(null);
      setPlanesEstudio([]);
      setSelectedMaestro(null);
      
      setGrupos([]);
    } else if (value === "maestro") {
      // Resetear valores relacionados con la pestaña de Maestro
      setSelectedMaestro(null);
    }
  }}
>
                    <TabsList>
                      <TabsTrigger value="grupo">Grupo</TabsTrigger>
                      <TabsTrigger value="maestro">Maestro</TabsTrigger>
                    </TabsList>
                    <TabsContent value="grupo">
                      <Card className="bg-muted/20 p-4">
                        <CardTitle className="text-lg mb-4">Filtros de Reporte - Grupo</CardTitle>
                        <div className="space-y-4">
                          <div className="grid grid-cols-3 items-center gap-4">
                            <Label htmlFor="carrera">Carrera:</Label>
                            <div className="col-span-2">
                            <Select
  value={selectedCarrera?.nombre}
  onValueChange={async (value) => {
    const carrera = carreras.find((c) => c.nombre === value) || null;
    setSelectedCarrera(carrera);

    if (carrera) {
      // Cargar los planes de estudio de la carrera seleccionada
      const planes = await handleAllPlanEstudio(carrera.id);
      setPlanesEstudio(planes);

      // Seleccionar automáticamente el primer plan de estudio si existe
      if (planes.length > 0) {
        const primerPlan = planes[0];
        setSelectedPlanEstudio(primerPlan);

        // Cargar los grupos del primer plan de estudio
        const grupos = await handleAllGruposPlan(primerPlan.id);
        setGrupos(grupos);
      } else {
        // Si no hay planes, limpiar los estados relacionados
        setSelectedPlanEstudio(null);
        setGrupos([]);
        setSelectedGrupo(null);
      }
    } else {
      // Si no hay carrera seleccionada, limpiar los estados relacionados
      setPlanesEstudio([]);
      setSelectedPlanEstudio(null);
      setGrupos([]);
      setSelectedGrupo(null);
    }
  }}
>
<SelectTrigger>
    <SelectValue placeholder="Seleccionar carrera" />
  </SelectTrigger>
  <SelectContent>
    {carreras.map((carrera) => (
      <SelectItem key={carrera.id} value={carrera.nombre}>
        {carrera.nombre}
      </SelectItem>
    ))}
  </SelectContent>
</Select>
                            </div>
                          </div>

                          <div className="grid grid-cols-3 items-center gap-4">
                            <Label htmlFor="plan">Plan de estudio:</Label>
                            <div className="col-span-2">
                              <Select
                                value={selectedPlanEstudio?.nombre}
                                onValueChange={(value) => {
                                  const plan = planesEstudio.find((p) => p.nombre === value);
                                  if (plan) {
                                    setSelectedPlanEstudio(plan);
                                    handleAllGruposPlan(plan.id).then((grupos) =>
                                      setGrupos(grupos)
                                    );
                                  } else {
                                    setSelectedPlanEstudio(null);
                                  }
                                }}
                              >
                                <SelectTrigger>
                                  <SelectValue placeholder="Seleccionar plan" />
                                </SelectTrigger>
                                <SelectContent>
                                  {planesEstudio.map((plan) => (
                                    <SelectItem key={plan.id} value={plan.nombre}>
                                      {plan.nombre}
                                    </SelectItem>
                                  ))}
                                </SelectContent>
                              </Select>
                            </div>
                          </div>

                          <div className="grid grid-cols-3 items-center gap-4">
                            <Label htmlFor="grupo">Grupo:</Label>
                            <div className="col-span-2">
                              <Select
                                value={selectedGrupo?.numero}
                                onValueChange={(value) => {
                                  const grupo = grupos.find((g) => g.numero === value) || null;
                                  setSelectedGrupo(grupo);
                                }}
                              >
                                <SelectTrigger>
                                  <SelectValue placeholder="Seleccionar grupo" />
                                </SelectTrigger>
                                <SelectContent>
                                  {grupos.map((grupo) => (
                                    <SelectItem key={grupo.id} value={grupo.numero}>
                                      {grupo.numero}
                                    </SelectItem>
                                  ))}
                                </SelectContent>
                              </Select>
                            </div>
                          </div>

                          <div className="grid grid-cols-3 items-center gap-4">
                            <Label>Periodo desde:</Label>
                            <div className="col-span-2">
                              <DatePicker
                                date={startDate}
                                setDate={setStartDate}
                                placeholder="Fecha inicial"
                              />
                            </div>
                          </div>

                          <div className="grid grid-cols-3 items-center gap-4">
                            <Label>Periodo hasta:</Label>
                            <div className="col-span-2">
                              <DatePicker
                                date={endDate}
                                setDate={setEndDate}
                                placeholder="Fecha final"
                              />
                            </div>
                          </div>

                          <div className="grid grid-cols-3 items-center gap-4">
  <Label>Opciones:</Label>
  <div className="col-span-2 space-y-2">
    <div>
      <input
        type="checkbox"
        id="jefe-grupo"
        checked={jefeGrupo}
        onChange={(e) => setJefeGrupo(e.target.checked)}
      />
      <Label htmlFor="jefe-grupo" className="ml-2">
        Jefe de Grupo
      </Label>
    </div>
    <div>
      <input
        type="checkbox"
        id="checador"
        checked={checador}
        onChange={(e) => setChecador(e.target.checked)}
      />
      <Label htmlFor="checador" className="ml-2">
        Checador
      </Label>
    </div>
    <div>
      <input
        type="checkbox"
        id="autoasistencia"
        checked={autoasistencia}
        onChange={(e) => setAutoasistencia(e.target.checked)}
      />
      <Label htmlFor="autoasistencia" className="ml-2">
        Autoasistencia
      </Label>
    </div>
  </div>
</div>

                          <Button onClick={handleGenerarReporte} className="w-full mt-4">
                            <FileBarChart className="mr-2 h-4 w-4" /> Generar Reporte
                          </Button>
                        </div>
                      </Card>
                    </TabsContent>

                    <TabsContent value="maestro">
                      <Card className="bg-muted/20 p-4">
                        <CardTitle className="text-lg mb-4">Filtros de Reporte - Maestro</CardTitle>
                        <div className="space-y-4">
                          <div className="grid grid-cols-3 items-center gap-4">
                            <Label htmlFor="maestro">Maestro:</Label>
                            <div className="col-span-2 ">
                              <Select
                                value={selectedMaestro ? String(selectedMaestro.id) : ""}
                                onValueChange={(value) => {
                                  const maestro =
                                    filteredUsuarios.find(
                                      (u) => String(u.id) === value
                                    ) || null;
                                  setSelectedMaestro(maestro);
                                }}
                              >
                                <SelectTrigger>
                                  <SelectValue placeholder="Seleccionar maestro" />
                                </SelectTrigger>
                                <SelectContent>
                                  {filteredUsuarios
                                    .filter((u) => u.rol === "Maestro")
                                    .map((maestro) => (
                                      <SelectItem
                                        key={maestro.id}
                                        value={String(maestro.id)}
                                      >
                                        {maestro.nombre} {maestro.apellido}
                                      </SelectItem>
                                    ))}
                                </SelectContent>
                              </Select>
                            </div>
                            </div>
                            
                            <div className="grid grid-cols-3 items-center gap-4">
                              <Label>Periodo desde:</Label>
                              <div className="col-span-2">
                                <DatePicker
                                  date={startDate}
                                  setDate={setStartDate}
                                  placeholder="Fecha inicial"
                                />
                              </div>
                            </div>

                            <div className="grid grid-cols-3 items-center gap-4">
                              <Label>Periodo hasta:</Label>
                              <div className="col-span-2">
                                <DatePicker
                                  date={endDate}
                                  setDate={setEndDate}
                                  placeholder="Fecha final"
                                />
                              </div>
                            </div>

                            <div className="grid grid-cols-3 items-center gap-4">
  <Label>Opciones:</Label>
  <div className="col-span-2 space-y-2">
    <div>
      <input
        type="checkbox"
        id="jefe-grupo"
        checked={jefeGrupo}
        onChange={(e) => setJefeGrupo(e.target.checked)}
      />
      <Label htmlFor="jefe-grupo" className="ml-2">
        Jefe de Grupo
      </Label>
    </div>
    <div>
      <input
        type="checkbox"
        id="checador"
        checked={checador}
        onChange={(e) => setChecador(e.target.checked)}
      />
      <Label htmlFor="checador" className="ml-2">
        Checador
      </Label>
    </div>
    <div>
      <input
        type="checkbox"
        id="autoasistencia"
        checked={autoasistencia}
        onChange={(e) => setAutoasistencia(e.target.checked)}
      />
      <Label htmlFor="autoasistencia" className="ml-2">
        Autoasistencia
      </Label>
    </div>
  </div>
</div>
                              <Button onClick={handleGenerarReporte} className="w-full mt-4">
                                <FileBarChart className="mr-2 h-4 w-4" /> Generar Reporte
                              </Button>
                          </div>
                                </Card>
                              </TabsContent>
                            </Tabs>
                  
                  
                </div>
                
                
              </CardContent>




            </Card>
          </TabsContent>
          <TabsContent value="carreras" className="space-y-6">
            <Card>
              <CardHeader className="pb-3">
                <div className="flex justify-between items-center">
                  <div>
                    <CardTitle>Gestión de Carreras</CardTitle>
                    <CardDescription>
                      Administra las carreras existentes en el sistema
                    </CardDescription>
                  </div>

                  <div className="flex items-center gap-3">
                    <div className="relative w-64">
                      <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
                      <Input
                        placeholder="Buscar carrera"
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className="pl-8"
                      />
                    </div>

                    <Button onClick={() => setNuevaCarreraOpen(true)}>
                      <UserPlus className="mr-2 h-4 w-4" /> Nueva Carrera
                    </Button>
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Nombre de carrera</TableHead>
                      <TableHead>Acciones</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {filteredCarreras.map((carrera) => (
                      <TableRow key={carrera.id}>
                        <TableCell className="font-medium">
                          {carrera.nombre}
                        </TableCell>

                        <TableCell>
                          <div className="flex space-x-2">
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => handleEditarCarrera(carrera)}
                            >
                              <Pencil className="h-4 w-4 mr-1" />
                              Editar
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

          <TabsContent value="cuentas" className="space-y-6">
            <Card>
              <CardHeader className="pb-3">
                <div className="flex justify-between items-center">
                  <div>
                    <CardTitle>Gestión de Cuentas</CardTitle>
                    <CardDescription>
                      Administra las cuentas de usuarios del sistema
                    </CardDescription>
                  </div>

                  <div className="flex items-center gap-3">
                    <div className="relative w-64">
                      <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
                      <Input
                        placeholder="Buscar usuario"
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className="pl-8"
                      />
                    </div>

                    <Button onClick={() => setNuevoUsuarioOpen(true)}>
                      <UserPlus className="mr-2 h-4 w-4" /> Nuevo Usuario
                    </Button>
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Nombre</TableHead>
                      <TableHead>Apellido</TableHead>
                      <TableHead>Número de Cuenta</TableHead>
                      <TableHead>Rol</TableHead>
                      <TableHead>Acciones</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {filteredUsuarios.map((usuario) => (
                      <TableRow key={usuario.id}>
                        <TableCell className="font-medium">
                          {usuario.nombre}
                        </TableCell>
                        <TableCell className="font-medium">
                          {usuario.apellido}
                        </TableCell>
                        <TableCell>{usuario.username}</TableCell>
                        <TableCell>{usuario.rol}</TableCell>
                        <TableCell>
                          <div className="flex space-x-2">
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => handleEditarUsuario(usuario)}
                            >
                              <Pencil className="h-4 w-4 mr-1" />
                              Editar
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
      </div>

      <Dialog open={nuevoUsuarioOpen} onOpenChange={setNuevoUsuarioOpen}>
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle>Nuevo Usuario</DialogTitle>
            <DialogDescription>
              Ingresa los datos para crear un nuevo usuario en el sistema.
            </DialogDescription>
          </DialogHeader>

          <form onSubmit={handleNuevoUsuarioSubmit}>
            <div className="grid gap-4 py-4">
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="nombre" className="text-right">
                  Nombre
                </Label>
                <Input
                  id="nombre"
                  name="nombre"
                  value={nuevoUsuario.nombre}
                  onChange={handleNuevoUsuarioChange}
                  className="col-span-3"
                  required
                />
              </div>

              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="apellido" className="text-right">
                  Apellido
                </Label>
                <Input
                  id="apellido"
                  name="apellido"
                  value={nuevoUsuario.apellido}
                  onChange={handleNuevoUsuarioChange}
                  className="col-span-3"
                  required
                />
              </div>

              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="cuenta" className="text-right">
                  Numero de cuenta
                </Label>
                <Input
                  id="cuenta"
                  name="cuenta"
                  value={nuevoUsuario.cuenta}
                  onChange={handleNuevoUsuarioChange}
                  className="col-span-3"
                  required
                />
              </div>

              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="rol" className="text-right">
                  Rol
                </Label>
                <select
                  id="rol"
                  name="rol"
                  value={nuevoUsuario.rol}
                  onChange={handleNuevoUsuarioChange}
                  className="col-span-3 flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                  required
                >
                  <option value="5">Maestro</option>
                  <option value="3">Jefe de Grupo</option>
                  <option value="1">Jefe de Carrera</option>
                  <option value="4">Checador</option>
                  <option value="2">Administracion</option>
                </select>
              </div>
            </div>

            {mostrarCarrera && (
              <div className="grid grid-cols-4 items-center gap-4 mb-2">
                <Label htmlFor="carrera" className="text-right">
                  Carrera
                </Label>
                <select
                  id="carrera"
                  name="carrera"
                  value={nuevoUsuario.carrera || ""}
                  onChange={handleNuevoUsuarioChange}
                  className="col-span-3 flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                  required
                >
                  <option value="">Selecciona una carrera</option>
                  {carreras.map((carrera) => (
                    <option key={carrera.id} value={JSON.stringify(carrera)}>
                      {carrera.nombre}
                    </option>
                  ))}
                </select>
              </div>
            )}

            <DialogFooter>
              <Button
                type="button"
                variant="outline"
                onClick={() => setNuevoUsuarioOpen(false)}
              >
                Cancelar
              </Button>
              <Button type="submit">Guardar Usuario</Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      <Dialog open={nuevaCarreraOpen} onOpenChange={setNuevaCarreraOpen}>
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle>Nueva Carrera</DialogTitle>
            <DialogDescription>
              Ingresa los datos para crear una nueva carrera en el sistema.
            </DialogDescription>
          </DialogHeader>

          <form onSubmit={handleNuevaCarreraSubmit}>
            <div className="grid gap-4 py-4">
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="nombre" className="text-right">
                  Nombre de carrera
                </Label>
                <Input
                  id="nombre"
                  name="nombre"
                  value={nuevaCarrera}
                  onChange={handleNuevaCarreraChange}
                  className="col-span-3"
                  required
                />
              </div>
            </div>
            <DialogFooter>
              <Button
                type="button"
                variant="outline"
                onClick={() => setNuevaCarreraOpen(false)}
              >
                Cancelar
              </Button>
              <Button type="submit">Guardar Carrera</Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      <Dialog open={editarUsuarioOpen} onOpenChange={setEditarUsuarioOpen}>
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle>Editar Usuario</DialogTitle>
            <DialogDescription>
              Modifica los datos del usuario seleccionado.
            </DialogDescription>
          </DialogHeader>

          {usuarioSeleccionado && (
            <form onSubmit={handleEditarUsuarioSubmit}>
              <div className="grid gap-4 py-4">
                <div className="grid grid-cols-4 items-center gap-4">
                  <Label htmlFor="edit-nombre" className="text-right">
                    Nombre
                  </Label>
                  <Input
                    id="edit-nombre"
                    name="nombre"
                    value={usuarioSeleccionado.nombre}
                    onChange={handleEditarUsuarioChange}
                    className="col-span-3"
                    required
                  />
                </div>

                <div className="grid grid-cols-4 items-center gap-4">
                  <Label htmlFor="edit-apellido" className="text-right">
                    Apellido
                  </Label>
                  <Input
                    id="edit-apellido"
                    name="apellido"
                    value={usuarioSeleccionado.apellido}
                    onChange={handleEditarUsuarioChange}
                    className="col-span-3"
                    required
                  />
                </div>

                <div className="grid grid-cols-4 items-center gap-4">
                  <Label htmlFor="edit-rol" className="text-right">
                    Rol
                  </Label>
                  <Input
                    id="edit-rol"
                    value={usuarioSeleccionado.rol}
                    className="col-span-3"
                    disabled
                  />
                </div>
              </div>

              <DialogFooter>
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => setEditarUsuarioOpen(false)}
                >
                  Cancelar
                </Button>
                <Button type="submit">Guardar Cambios</Button>
              </DialogFooter>
            </form>
          )}
        </DialogContent>
      </Dialog>

      <Dialog open={editarCarreraOpen} onOpenChange={setEditarCarreraOpen}>
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle>Editar Carrera</DialogTitle>
            <DialogDescription>
              Modifica los datos de la carrera seleccionada.
            </DialogDescription>
          </DialogHeader>

          {carreraSeleccionada && (
            <form onSubmit={handleEditarCarreraSubmit}>
              <div className="grid gap-4 py-4">
                <div className="grid grid-cols-4 items-center gap-4">
                  <Label htmlFor="edit-nombre" className="text-right">
                    Nombre
                  </Label>
                  <Input
                    id="edit-nombre"
                    name="nombre"
                    value={carreraSeleccionada.nombre}
                    onChange={handleEditarCarreraChange}
                    className="col-span-3"
                    required
                  />
                </div>
              </div>

              <DialogFooter>
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => setEditarUsuarioOpen(false)}
                >
                  Cancelar
                </Button>
                <Button type="submit">Guardar Cambios</Button>
              </DialogFooter>
            </form>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default AdministracionPage;
