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
  BookOpen,
  Calendar,
  Clock,
  Edit,
  Plus,
  Search,
  CalendarDays,
  Users,
  UserPlus,
  X,
  Save,
  Pencil,
  Trash,
  RadioReceiver,
} from "lucide-react";
import { DatePicker } from "@/components/DatePicker";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogClose,
} from "@/components/ui/dialog";
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useForm } from "react-hook-form";
import { toast } from "sonner";
import { useAuth } from "@/hooks/useAuth";
import {
  addPlanEstudio,
  deletePlanEstudios,
  getAllPlanEstudio,
  updatePlanEstudio,
} from "@/core/planEstudioService";
import { getJwt, getToken } from "@/core/authService";
import { getIdCarrera } from "@/core/jefeCarreraService";
import { useToast } from "@/hooks/use-toast";
import { PlanEstudio } from "@/models/plan_estudio";
import { Materia } from "@/models/materia";
import { JefeGrupo } from "@/models/jefe_grupo";
import { getJefeGrupo } from "@/core/jefeGrupoService";
import { Grupo } from "@/models/grupo";
import {
  addGrupo,
  deleteGrupo,
  getAllGrupos,
  updateGrupo,
} from "@/core/grupoService";
import { set } from "date-fns";
import { Horario, TodosHorarios } from "@/models/horario";
import { Maestro } from "@/models/maestro";
import { getMaestro } from "@/core/maestroService";
import {
  addHorario,
  deleteHorario,
  getAllHorarioGrupo,
  updateHorario,
  
} from "@/core/horariosService";
import { Label } from "recharts";
import { de, pl, tr } from "date-fns/locale";
import { transformarHorario } from "@/mappers/horariosMapper";
import { deleteMateria, updateMaterias } from "@/core/materiaService";

interface horarioDelete {
  id: number;
  dia_semana: string;
}

const JefeCarreraPage = () => {
  const { toast } = useToast();

  const { user } = useAuth();
  const [selectedDate, setSelectedDate] = useState<Date | undefined>(
    new Date()
  );
  const [searchTerm, setSearchTerm] = useState("");

  // Dialog states
  const [horarioDialogOpen, setHorarioDialogOpen] = useState(false);
  const [planEstudioDialogOpen, setPlanEstudioDialogOpen] = useState(false);
  const [grupoDialogOpen, setGrupoDialogOpen] = useState(false);
  const [planesEstudio, setPlanesEstudio] = useState<PlanEstudio[]>([]);
  const [allMaestro, setAllMaestro] = useState<Maestro[]>([]);
  const [allGrupo, setAllGrupo] = useState<Grupo[] | null>([]);

  const [allGrupoSinHoraio, setAllGrupoSinHorario] = useState<Grupo[]>([]);

  const [nuevoPlanEstudio, setNuevoPlanEstudio] = useState({
    nombre: "",
    semestres: "",
  });

  const onChangeHorario = () => {
    setHorarioDialogOpen(!horarioDialogOpen);
    setScheduleByDay({
      Lunes: [],
      Martes: [],
      Miercoles: [],
      Jueves: [],
      Viernes: [],
    });
  };

  const onChangeEditHorario = () => {
    setHorarioDialogEditOpen(!horarioDialogOpen);
    setScheduleByDay({
      Lunes: [],
      Martes: [],
      Miercoles: [],
      Jueves: [],
      Viernes: [],
    });
  };

  const onChangeHorarioEdit = () => {
    setHorarioDialogEditOpen(!horarioDialogEditOpen);
    setScheduleByDay({
      Lunes: [],
      Martes: [],
      Miercoles: [],
      Jueves: [],
      Viernes: [],
    });
  };

  // Datos de ejemplo para la tabla de horarios
  const horarios = [
    {
      id: 1,
      grupo: "301",
      maestro: "Juan Pérez",
      materia: "Matemáticas",
      dias: "Lun, Mie, Vie",
      horario: "10:00-12:00",
      aula: "A101",
    },
    {
      id: 2,
      grupo: "502",
      maestro: "María Gómez",
      materia: "Programación",
      dias: "Mar, Jue",
      horario: "12:00-14:00",
      aula: "B202",
    },
    {
      id: 3,
      grupo: "201",
      maestro: "Carlos López",
      materia: "Física",
      dias: "Lun, Mie",
      horario: "14:00-16:00",
      aula: "A105",
    },
    {
      id: 4,
      grupo: "402",
      maestro: "Ana Rodríguez",
      materia: "Literatura",
      dias: "Mar, Jue, Vie",
      horario: "16:00-18:00",
      aula: "C303",
    },
  ];

  // Datos de ejemplo para planes de estudio

  // Filtrar horarios basado en la búsqueda

  // Filtrar grupos basado en la búsqueda
  const filteredGrupos = allGrupo.filter(
    (grupo) =>
      grupo?.numero?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      grupo?.jefe_grupo_nombre
        ?.toLowerCase()
        .includes(searchTerm.toLowerCase()) ||
      grupo?.plan_estudio_nombre
        ?.toLowerCase()
        .includes(searchTerm.toLowerCase())
  );

  // Funciones para manejar la creación de nuevos elementos
  // const handleCreateHorario = (data: any) => {
  //   console.log("Nuevo horario:", data);
  //   toast.success("Horario creado con éxito");
  //   setHorarioDialogOpen(false);
  // };

  const handleCreatePlanEstudio = (data: any) => {
    console.log("Nuevo plan de estudio:", data);
    // toast.success("Plan de estudio creado con éxito");
    setPlanEstudioDialogOpen(false);
  };

  const handleCreatePlanEstudioSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    // console.log(materias);
    const id = await getIdCarrera(getToken().id.toString(), getJwt());
    const response = await addPlanEstudio(
      nuevoPlanEstudio.nombre,
      id,
      parseInt(nuevoPlanEstudio.semestres),
      getJwt(),
      materias.map((m) => m.nombre)
    );

    setPlanesEstudio([...planesEstudio, response]);
    setMaterias([]);

    toast({
      title: "Nuevo plan de estudio creado",
      description: `${nuevoPlanEstudio.nombre} ha sido añadido correctamente.`,
    });
    setNuevoPlanEstudio(null);
  };

  // const handleCreateGrupo = (data: any) => {
  //   console.log("Nuevo grupo:", data);
  //   toast.success("Grupo creado con éxito");
  //   setGrupoDialogOpen(false);
  // };

  const [editDialogOpen, setEditDialogOpen] = useState(false);
  const [selectedHorario, setSelectedHorario] = useState(null);

  {
    /* Componente para la lista dinámica de materias */
  }

  const [materias, setMaterias] = useState<Materia[]>([{ id: 1, nombre: "" }]);
  const [materiasHorario, setMateriasHorario] = useState<Materia[]>([
    { id: 1, nombre: "" },
  ]);

  const addMateria = () => {
    if (planSeleccionado != null) {
      const newMateria = {
        id: Date.now() * -1, // Usa un id único temporal
        nombre: "",
      };
      setPlanSeleccionado((prev) => ({
        ...prev,
        materias: [...prev.materias, newMateria],
      }));
      return;
    }
    const newId = materias.length
      ? Math.max(...materias.map((m) => m.id)) + 1
      : 1;
    setMaterias([...materias, { id: newId, nombre: "" }]);
  };

  const [materiasBorradas, setMateriasBorradas] = useState<number[]>([]);

  const removeMateria = (id) => {
    if (planSeleccionado != null) {
      if (id > 0) {
        console.log(id);
        setMateriasBorradas((prev) => [...prev, id]);
      }
      if (planSeleccionado.materias.length > 0) {
        setPlanSeleccionado((prev) => ({
          ...prev,
          materias: prev.materias.filter((m) => m.id !== id),
        }));
      }
      return;
    }
    if (materias.length > 1) {
      setMaterias(materias.filter((materia) => materia.id !== id));
    }
  };

  const updateMateria = (id, value) => {
    if (planSeleccionado != null) {
      setPlanSeleccionado((prev) => ({
        ...prev,
        materias: prev.materias.map((m) =>
          m.id === id ? { ...m, nombre: value } : m
        ),
      }));
      return;
    }
    setMaterias(
      materias.map((materia) =>
        materia.id === id ? { ...materia, nombre: value } : materia
      )
    );
  };

  const handleUpdateHorario = (updatedHorario) => {
    console.log("Horario actualizado:", updatedHorario);
    // Aquí puedes agregar la lógica para actualizar el horario en tu estado global o enviar una solicitud a la API.
  };

  const handleNuevoPlanEstudioChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>
  ) => {
    const { name, value } = e.target;
    setNuevoPlanEstudio({
      ...nuevoPlanEstudio,
      [name]: value,
    });
  };

  {
    /* Modal para Nuevo Horario */
  }
  const [selectedGroup, setSelectedGroup] = useState("");
  const [selectedDay, setSelectedDay] = useState("Lunes");

  // Store schedule data for each day
  const [scheduleByDay, setScheduleByDay] = useState({
    Lunes: [],
    Martes: [],
    Miercoles: [],
    Jueves: [],
    Viernes: [],
  });

  // Add class to current day's schedule
  const addClass = () => {
    if (nuevoHorario?.grupo_id.id != null) {
      const planActual = planesEstudio.find(
        (plan) => plan.id === nuevoHorario?.grupo_id.plan_estudio_id
      );

      if (planActual) {
        setMateriasHorario(planActual.materias);
      }

      setScheduleByDay((prev) => ({
        ...prev,
        [selectedDay]: [
          ...prev[selectedDay],
          {
            id: ["nuevo", Date.now()], // ID único
            materia_id: "", // Usar IDs en lugar de nombres
            horaInicio: "",
            horaFin: "",
            maestro_id: "",
          },
        ],
      }));
    }
  };

  const [horarioDelete, setHorarioDelete] = useState<horarioDelete[]>([]);

  // Remove class from current day's schedule
  const removeClass = (id) => {
    setHorarioDelete((prev) => [
      ...prev,
      {
        id: id,
        dia_semana: selectedDay,
      },
    ]);
    setScheduleByDay((prev) => ({
      ...prev,
      [selectedDay]: prev[selectedDay].filter((item) => item.id !== id),
    }));
  };

  // Update class data for current day
  const updateClass = (id: number, field: string, value: any) => {
    setScheduleByDay((prev) => ({
      ...prev,
      [selectedDay]: prev[selectedDay].map((classItem) =>
        classItem.id === id ? { ...classItem, [field]: value } : classItem
      ),
    }));
  };
  // Generate hour options from 7am to 10pm
  const hourOptions = Array.from({ length: 16 }, (_, i) => {
    const hour = i + 7;
    return hour < 13
      ? { value: `${hour}:00`, label: `${hour}:00 AM` }
      : { value: `${hour}:00`, label: `${hour - 12}:00 PM` };
  });

  const [horarioSeleccionado, setHorarioSeleccionado] = useState(null);

  const choseHorario = (horario) => {
    // console.log(horariosTodos);
    setHorarioDialogEditOpen(true);
    setSelectedHorario(horario);
    const h = horariosTodos.find((h) => h.grupo_id === horario.id);
    setScheduleByDay(h.horarios);
    setHorarioSeleccionado(h);

    setNuevoHorario({
      id: 0,
      grupo_id: allGrupo.find((grupo) => grupo.id === h.grupo_id),
      materia_id: 0,
      maestro_id: 0,
      dia_semana: "",
      hora_inicio: "",
      hora_fin: "",
    });
  };

  const [selectedDays, setSelectedDays] = useState<string[]>([]);

  // Manejo de selección de días con checkboxes
  const toggleDay = (day: string) => {
    setSelectedDays((prev) =>
      prev.includes(day) ? prev.filter((d) => d !== day) : [...prev, day]
    );
  };

  const addClasss = () => {
    if (nuevoHorario?.grupo_id.id != null) {
      const planActual = planesEstudio.find(
        (plan) => plan.id === nuevoHorario?.grupo_id.plan_estudio_id
      );

      if (planActual) {
        setMateriasHorario(planActual.materias);
      }

      setScheduleByDay((prev) => {
        const updatedSchedule = { ...prev };

        selectedDays.forEach((day) => {
          updatedSchedule[day] = [
            ...(prev[day] || []),
            {
              id: `nuevo_${Date.now()}`, // ID único
              materia_id: null, // Inicializar correctamente
              horaInicio: "",
              horaFin: "",
              maestro_id: null,
            },
          ];
        });

        return updatedSchedule;
      });
    }
  };

  const updateClasss = (id: number, field: string, value: any) => {
    setScheduleByDay((prev) => {
      const updatedSchedule = { ...prev };
      selectedDays.forEach((day) => {
        updatedSchedule[day] = (prev[day] || []).map((classItem) =>
          classItem.id === id ? { ...classItem, [field]: value } : classItem
        );
      });
      return updatedSchedule;
    });
  };

  const removeClasss = (id: number) => {
    setHorarioDelete((prev) => [
      ...prev,
      ...selectedDays.map((day) => ({
        id,
        dia_semana: day,
      })),
    ]);

    setScheduleByDay((prev) => {
      const updatedSchedule = { ...prev };
      selectedDays.forEach((day) => {
        updatedSchedule[day] = (prev[day] || []).filter(
          (item) => item.id !== id
        );
      });
      return updatedSchedule;
    });
  };

  const handleNuevoHorarioSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const grupo_id = nuevoHorario?.grupo_id.id;
    // Convertir el horario en el formato requerido
    const nuevoFormato = selectedDays.flatMap((day) =>
      (scheduleByDay[day] || []).map((entry) => ({
        grupo_id: grupo_id,
        materia_id: parseInt(entry.materia_id),
        maestro_id: parseInt(entry.maestro_id),
        dia_semana: day,
        hora_inicio: entry.horaInicio,
        hora_fin: entry.horaFin,
      }))
    );

    const newHorario = await addHorario(nuevoFormato, getJwt(), grupo_id);
    onChangeHorario();
    addHorariosNuevosViejos(newHorario, nuevoHorario?.grupo_id.id);
    setNuevoHorario(null);
    setSelectedDays([]);
  };

  // const addHorariosNuevosViejos = (newHorario, grupo_id) => {
  //   setNuevoHorariosTodos((prevHorarios) => {
  //     return prevHorarios.map((grupo) => {
  //       // console.log(grupo);
  //       if (grupo.grupo_id === grupo_id) {
  //         // Crear una copia del objeto del grupo actual
  //         const nuevosHorariosGrupo = { ...grupo };

  //         // Obtener el día de la semana
  //         const dia = newHorario[0].dia_semana;
  //         // console.log("DIA SEMANA", dia);

  //         // Si el día no existe en el objeto, lo creamos con un array vacío
  //         if (!nuevosHorariosGrupo.horarios[dia]) {
  //           nuevosHorariosGrupo.horarios[dia] = [];
  //         }

  //         // Agregar el nuevo horario al día correspondiente
  //         nuevosHorariosGrupo.horarios[dia] = [
  //           ...nuevosHorariosGrupo.horarios[dia],
  //           newHorario[0],
  //         ];

  //         return nuevosHorariosGrupo; // Retornar el grupo actualizado
  //       }

  //       return grupo; // Mantener los otros grupos sin cambios
  //     });
  //   });
  // };

  const addHorariosNuevosViejos = (newHorario, grupo_id) => {
    setNuevoHorariosTodos((prevHorarios) => {
      return prevHorarios.map((grupo) => {
        if (grupo.grupo_id === grupo_id) {
          // Crear una copia del objeto del grupo actual
          const nuevosHorariosGrupo = { ...grupo };

          // Iterar sobre cada horario nuevo
          newHorario.forEach((horario) => {
            const dia = horario.dia_semana; // Obtener el día de cada horario

            // Si el día no existe en el objeto, lo creamos con un array vacío
            if (!nuevosHorariosGrupo.horarios[dia]) {
              nuevosHorariosGrupo.horarios[dia] = [];
            }

            // Agregar el horario al día correspondiente
            nuevosHorariosGrupo.horarios[dia] = [
              ...nuevosHorariosGrupo.horarios[dia],
              horario,
            ];
          });

          return nuevosHorariosGrupo; // Retornar el grupo actualizado
        }

        return grupo; // Mantener los otros grupos sin cambios
      });
    });
  };

  const [planSeleccionado, setPlanSeleccionado] = useState<PlanEstudio | null>(
    null
  );
  const [editarPlanOpen, setEditarPlanOpen] = useState(false);
  const handleEditarPlanEstudio = (plan: PlanEstudio) => {
    setPlanSeleccionado(plan);
    setMaterias(plan.materias);
    setEditarPlanOpen(true);
  };

  const [grupoDialogEditOpen, setGrupoDialogEditOpen] = useState(false);

  const [pasadoJefe, setPasadoJefe] = useState(null);

  const handleEditarGrupo = (grupo: Grupo) => {
    setPasadoJefe(grupo.jefe_grupo_id);
    setNuevoGrupo(grupo);
    setGrupoDialogEditOpen(true);
  };

  const handleEditarPlanChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    if (planSeleccionado) {
      setPlanSeleccionado({
        ...planSeleccionado,
        [name]: value,
      });
    }
  };

  const handleNuevoHorarioChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>
  ) => {
    const { name, value } = e.target;
    setMateriasHorario([]);
    setScheduleByDay({
      Lunes: [],
      Martes: [],
      Miercoles: [],
      Jueves: [],
      Viernes: [],
    });
    if (name === "grupo_id") {
      // console.log(value);
      const grupoSeleccionado: Grupo = JSON.parse(value);
      setNuevoHorario((prev) => ({
        ...prev!,
        grupo_id: grupoSeleccionado, // Se actualiza el objeto completo
      }));
      return;
    }
    setNuevoHorario({
      ...nuevoHorario,
      [name]: value,
    });
  };

  //crear grupos

  const [jefesGrupo, setJefeGrupo] = useState<JefeGrupo[]>([]);
  const [nuevoGrupo, setNuevoGrupo] = useState<Grupo | null>(null);
  const [nuevoHorario, setNuevoHorario] = useState<Horario | null>(null);

  const [horariosTodos, setNuevoHorariosTodos] = useState<TodosHorarios[]>([]);

  const handleNuevoGrupoChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>
  ) => {
    const { name, value } = e.target;
    setNuevoGrupo({
      ...nuevoGrupo,
      [name]: value,
    });
  };

  const handleCreateGrupoSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (nuevoGrupo != null) {
      const response = await addGrupo(
        getJwt(),
        nuevoGrupo.numero,
        nuevoGrupo.plan_estudio_id,
        nuevoGrupo.jefe_grupo_id
      );
      setGrupoDialogOpen(false);
      toast({
        title: "Grupo creado correctamente",
        description: `${nuevoGrupo.numero} ha sido añadido correctamente.`,
      });
      setNuevoGrupo(null);
      const grupoObj = {
        id: response.id,
        jefe_grupo_id: response.jefe_id,
        jefe_grupo_nombre: response.jefe_grupo.nombre,
        numero: response.nombre,
        plan_estudio_id: response.plan_estudio_id,
        plan_estudio_nombre: response.plan_estudio.nombre,
      };

      setJefeSinGrupo((prev) => {
        const jefesSinGrupo = prev.filter(
          (jefe) => jefe.id !== response.jefe_id
        );
        return jefesSinGrupo;
      });

      setAllGrupo([...allGrupo, grupoObj]);
      setAllGrupoSinHorario([...allGrupoSinHoraio, grupoObj]);
      setNuevoHorariosTodos([
        ...horariosTodos,
        {
          grupo_id: response.id,
          horarios: {
            Lunes: [],
            Martes: [],
            Miercoles: [],
            Jueves: [],
            Viernes: [],
          },
        },
      ]);
    }
  };

  //aqui useEffect
  //
  //
  //
  //
  const [horarioDialogEditOpen, setHorarioDialogEditOpen] = useState(false);

  const [jefeSinGrupo, setJefeSinGrupo] = useState<JefeGrupo[]>([]);

  useEffect(() => {
    const fetchPlanesEstudio = async () => {
      const id = await getIdCarrera(getToken().id.toString(), getJwt());
      const planes = await getAllPlanEstudio(id, getJwt());
      setPlanesEstudio(planes);
    };

    const fetchJefesGrupo = async () => {
      const jefes = await getJefeGrupo(getJwt());
      setJefeGrupo(jefes);
    };

    // Modifica fetchGrupos para que retorne los grupos
    const fetchGrupos = async () => {
      const id = await getIdCarrera(getToken().id.toString(), getJwt());
      const grupos = await getAllGrupos(getJwt(), id);
      //poner los grupos sin horarios

      setAllGrupo(grupos);
      console.log(grupos);
      return grupos; // Retornamos los datos obtenidos
    };

    const fetchMaestros = async () => {
      const maestros = await getMaestro();
      setAllMaestro(maestros);
    };

    // Usamos los grupos devueltos por fetchGrupos directamente
    const fetchTodosHorarios = async () => {
      const grupos = await fetchGrupos(); // Obtener los grupos primero

      if (grupos.length > 0) {
        const horariosPromises = grupos.map((grupo) =>
          getAllHorarioGrupo(grupo.id, getJwt())
        );
        const horarios = await Promise.all(horariosPromises);
        setNuevoHorariosTodos(horarios.flat()); // Asegurarse de aplanar los horarios correctamente
      }
    };

    // Ejecuta las funciones en el orden correcto
    const fetchData = async () => {
      await fetchTodosHorarios(); // Espera a que se completen los horarios
      await fetchMaestros();
      await fetchPlanesEstudio();
      await fetchJefesGrupo();
    };

    fetchData();
  }, []); // Asegúrate de agregar dependencias si es necesario

  useEffect(() => {
    if (allGrupo.length > 0 && horariosTodos.length > 0) {
      const gruposSinHorario = allGrupo.filter(
        (grupo) =>
          !horariosTodos.some(
            (horario) =>
              horario.grupo_id === grupo.id &&
              Object.values(horario.horarios).some((dia) => dia.length > 0) // Verifica si al menos un día tiene horarios
          )
      );

      setAllGrupoSinHorario(gruposSinHorario);
    }
  }, [allGrupo, horariosTodos]);

  useEffect(() => {
    const jefes = jefesGrupo.filter(
      (jefe) => !allGrupo.some((grupo) => grupo.jefe_grupo_id === jefe.id)
    );

    setJefeSinGrupo(jefes);
  }, [allGrupo, jefesGrupo]); // Asegúrate de incluir todas las dependencias necesarias

  useEffect(() => {
    console.log(jefeSinGrupo);
  }, [jefeSinGrupo]);

  const filteredHorarios = horariosTodos
    .filter(
      (horario) =>
        Object.values(horario.horarios).some((dia) => dia.length > 0) && // Verifica si tiene al menos un día con horarios
        allGrupo.some(
          (grupo) =>
            grupo.id === horario.grupo_id &&
            grupo.numero.toLowerCase().includes(searchTerm.toLowerCase())
        )
    )
    .map((horario) => {
      const grupo = allGrupo.find((grupo) => grupo.id === horario.grupo_id);
      return { id: grupo?.id || "", numero: grupo?.numero || "" };
    });

  const handleEditarPlanSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const id = await getIdCarrera(getToken().id.toString(), getJwt());
    const materiasNuevas = planSeleccionado?.materias
      .filter((m) => m.id < 0)
      .map((m) => m.nombre);

    const nuevoPlan = await updatePlanEstudio(
      id,
      getJwt(),
      planSeleccionado.semestres,
      planSeleccionado.nombre,
      planSeleccionado.id,
      materiasNuevas
    );

    const materiasViejas = planSeleccionado?.materias.filter((m) => m.id > 0);

    nuevoPlan.materias = [...nuevoPlan.materias, ...materiasViejas];

    setPlanesEstudio((prev) =>
      prev.map((plan) => (plan.id === nuevoPlan.id ? nuevoPlan : plan))
    );

    //materiasBorradas

    await deleteMateria(materiasBorradas, getJwt());
    await updateMaterias(materiasViejas, getJwt(), planSeleccionado.id);
    console.log(materiasViejas);

    setMateriasBorradas([]);

    setMaterias([]);
    setPlanSeleccionado(null);
  };

  // const agregarHorario = (nuevoHorario: Horario) => {
  //   setNuevoHorariosTodos(prev => {
  //     const dia = nuevoHorario.dia_semana as keyof HorariosPorDia;
  //     const grupoIndex = prev.findIndex(g => g.grupo_id === nuevoHorario.grupo_id);

  //     // Si el grupo ya existe
  //     if (grupoIndex !== -1) {
  //       const nuevosHorarios = [...prev];
  //       const horariosPorDia = { ...nuevosHorarios[grupoIndex].horarios };

  //       horariosPorDia[dia] = [...horariosPorDia[dia], nuevoHorario];

  //       nuevosHorarios[grupoIndex] = {
  //         ...nuevosHorarios[grupoIndex],
  //         horarios: horariosPorDia
  //       };

  //       return nuevosHorarios;
  //     }
  //     // Si el grupo no existe
  //     else {
  //       const nuevoHorariosPorDia: HorariosPorDia = {
  //         Lunes: [],
  //         Martes: [],
  //         Miercoles: [],
  //         Jueves: [],
  //         Viernes: [],
  //       };

  //       nuevoHorariosPorDia[dia] = [nuevoHorario];

  //       return [...prev, {
  //         grupo_id: nuevoHorario.grupo_id,
  //         horarios: nuevoHorariosPorDia
  //       }];
  //     }
  //   });
  // };

  const agregarHorario = (nuevoHorario) => {
    setNuevoHorariosTodos((prev) =>
      prev.map((horario) => {
        const horariosActualizados = {
          ...horario,
          horarios: { ...horario.horarios },
        };

        nuevoHorario.forEach((nuevo) => {
          console.log(nuevo.grupo_id, horario.grupo_id);
          if (horario.grupo_id === nuevo.grupo_id) {
            if (!horariosActualizados.horarios[nuevo.dia_semana]) {
              horariosActualizados.horarios[nuevo.dia_semana] = [];
            }
            horariosActualizados.horarios[nuevo.dia_semana] = [
              ...horariosActualizados.horarios[nuevo.dia_semana],
              nuevo,
            ];
          }
        });

        return horariosActualizados;
      })
    );
  };

  const editarHorario = (nuevoHorario) => {
    setNuevoHorariosTodos((prev) =>
      prev.map((horario) => {
        const horariosActualizados = {
          ...horario,
          horarios: { ...horario.horarios },
        };

        nuevoHorario.forEach((nuevo) => {
          if (horario.grupo_id === nuevo.grupo_id) {
            // Si existe el horario con el mismo id, lo reemplazamos completamente
            if (horariosActualizados.horarios[nuevo.dia_semana]) {
              horariosActualizados.horarios[nuevo.dia_semana] =
                horariosActualizados.horarios[nuevo.dia_semana].map((h) =>
                  h.id === nuevo.id ? nuevo : h
                );
            }
          }
        });

        return horariosActualizados;
      })
    );
  };

  const deleteGrupos = async (grupo) => {
    setAllGrupo(allGrupo.filter((g) => g.id !== grupo.id));
    await deleteGrupo(grupo.id, getJwt());
    setNuevoGrupo(null);
  };

  const eliminarHorario = () => {
    setNuevoHorariosTodos((prev) =>
      prev.map((horario) => {
        const horariosActualizados = {
          ...horario,
          horarios: { ...horario.horarios },
        };

        horarioDelete.forEach((deleteHorario) => {
          horario.horarios[deleteHorario.dia_semana].forEach((h) => {
            if (h.id === deleteHorario.id) {
              if (horariosActualizados.horarios[deleteHorario.dia_semana]) {
                horariosActualizados.horarios[deleteHorario.dia_semana] =
                  horariosActualizados.horarios[
                    deleteHorario.dia_semana
                  ].filter((h) => h.id !== deleteHorario.id);
              }
            }
          });

          // if (parseInt(horario.horarios[deleteHorario.dia_semana][0]?.id) == deleteHorario.id) {
          //   if (horariosActualizados.horarios[deleteHorario.dia_semana]) {
          //     horariosActualizados.horarios[deleteHorario.dia_semana] =
          //       horariosActualizados.horarios[deleteHorario.dia_semana].filter(
          //         (h) => h.id !== deleteHorario.id
          //       );
          //   }
          // }
        });

        return horariosActualizados;
      })
    );
  };

  const deletePlanEstudio = async (id) => {
    setPlanesEstudio((prev) => prev.filter((plan) => plan.id !== id));
    await deletePlanEstudios(id, getJwt());
  };

  const handleEditHorarioSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const grupo_id = nuevoHorario?.grupo_id.id;
    // Convertir el horario en el formato requerido
    const nuevoFormato = (scheduleByDay[selectedDay] || [])
      .filter((entry) => entry.id[0] === "nuevo") // Filtra los elementos cuyo id[0] es "nuevo"
      .map((entry) => ({
        grupo_id: grupo_id,
        materia_id: parseInt(entry.materia_id), // Convertimos a número si es necesario
        maestro_id: parseInt(entry.maestro_id),
        dia_semana: selectedDay,
        hora_inicio: entry.hora_inicio,
        hora_fin: entry.hora_fin,
      }));
    //aqui añado los nuevos
    const newHorario = await addHorario(nuevoFormato, getJwt(), grupo_id);

    const horarioTransformado = transformarHorario(newHorario);
    console.log(horarioTransformado);
    agregarHorario(horarioTransformado);

    //ocupo editar los otros
    const horariosCambiados = (scheduleByDay[selectedDay] || [])
      .filter((entry) => entry?.id[0] !== "nuevo") // Filtra los elementos cuyo id[0] es "nuevo"
      .map((entry) => ({
        grupo_id: grupo_id,
        materia_id: parseInt(entry.materia_id), // Convertimos a número si es necesario
        maestro_id: parseInt(entry.maestro_id),
        dia_semana: selectedDay,
        hora_inicio: entry.hora_inicio,
        hora_fin: entry.hora_fin,
        id: entry.id,
      }));

    console.log(horariosCambiados);

    const horarioEditado = await updateHorario(horariosCambiados, getJwt());
    editarHorario(horariosCambiados);

    onChangeHorarioEdit();
    eliminarHorario();
    await deleteHorario(horarioDelete, getJwt());
    setHorarioDelete([]);
    // addHorariosNuevosViejos(newHorario, nuevoHorario?.grupo_id.id);
    setNuevoHorario(null);
  };

  const quitarCrear = () => {
    setNuevoPlanEstudio(null);
    setPlanEstudioDialogOpen(!planEstudioDialogOpen);
    setMaterias([]);
  };

  const quitarEditar = () => {
    setEditarPlanOpen(!editarPlanOpen);
    setMaterias([]);
  };

  useEffect(() => {
    const planActual = planesEstudio.find(
      (plan) => plan.id === nuevoHorario?.grupo_id.plan_estudio_id
    );

    if (planActual) {
      setMateriasHorario(planActual.materias);
    }
  }, [nuevoHorario]);

  const handleEditGrupoSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const grupoObj = {
      id: nuevoGrupo.id,
      nombre: nuevoGrupo.numero,
      plan_estudio_id: nuevoGrupo.plan_estudio_id,
      jefe_id: nuevoGrupo.jefe_grupo_id,
    };

    console.log(jefeSinGrupo);

    const jefeGrupo = jefeSinGrupo.find(
      (jefe) => jefe.id == nuevoGrupo.jefe_grupo_id
    );

    console.log(jefeGrupo);

    let aux = false;

    if(nuevoGrupo.jefe_grupo_id == pasadoJefe) {
      aux = true;
    }

    console.log(aux);

    if (!jefeGrupo && !aux) {
      alert("El jefe de grupo ya esta con otro grupo.");
      return null;
    }

    const response = await updateGrupo(grupoObj, getJwt());
    const h = {
      id: response.id,
      jefe_grupo_id: response.jefe_id,
      jefe_grupo_nombre: response.jefe_grupo.nombre,
      numero: response.nombre,
      plan_estudio_id: response.plan_estudio_id,
      plan_estudio_nombre: response.plan_estudio.nombre,
    };
    setGrupoDialogEditOpen(false);
    setAllGrupo([
      ...allGrupo.map((grupo) => (grupo.id === nuevoGrupo.id ? h : grupo)),
    ]);
    setNuevoGrupo(null);
  };

  const limpiarNuevoHorario = () => {
  setNuevoHorario(null);
  setSelectedDays([]);
  setScheduleByDay({
    Lunes: [],
    Martes: [],
    Miercoles: [],
    Jueves: [],
    Viernes: [],
  });
  setMateriasHorario([{ id: 1, nombre: "" }]);
};

  return (
    <div className="flex-1 p-8">
      <div className="flex justify-between items-center mb-8">
        <div>
          <h1 className="text-3xl font-bold">Jefe de Carrera</h1>
          <p className="text-muted-foreground">
            Gestión de horarios, planes de estudio y grupos
          </p>
        </div>

        <div className="flex items-center gap-4">
          <DatePicker date={selectedDate} setDate={setSelectedDate} />
        </div>
      </div>

      <Tabs defaultValue="horarios" className="w-full">
        <TabsList className="mb-6">
          <TabsTrigger value="horarios">Horarios</TabsTrigger>
          <TabsTrigger value="planes">Planes de Estudio</TabsTrigger>
          <TabsTrigger value="grupos">Grupos</TabsTrigger>
        </TabsList>

        <TabsContent value="horarios" className="space-y-6">
          <Card>
            <CardHeader className="pb-3">
              <div className="flex justify-between items-center">
                <div>
                  <CardTitle>Gestión de Horarios</CardTitle>
                  <CardDescription>
                    Administra los horarios de clases por grupo y semestre
                  </CardDescription>
                </div>

                <div className="flex items-center gap-3">
                  <div className="relative w-64">
                    <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
                    <Input
                      placeholder="Buscar por grupo o maestro"
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                      className="pl-8"
                    />
                  </div>

                  <Button onClick={() => setHorarioDialogOpen(true)}>
                    <Plus className="mr-2 h-4 w-4" /> Nuevo Horario
                  </Button>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Grupo</TableHead>
                    <TableHead>Acciones</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredHorarios.map((horario) => (
                    <TableRow key={horario.id}>
                      <TableCell className="font-medium">
                        {horario.numero}
                      </TableCell>
                      <TableCell>
                        <div className="flex space-x-2">
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => {
                              setEditDialogOpen(true);
                              choseHorario(horario);
                            }}
                          >
                            <Edit className="h-4 w-4" />
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

        <TabsContent value="planes" className="space-y-6">
          <Card>
            <CardHeader className="pb-3">
              <div className="flex justify-between items-center">
                <div>
                  <CardTitle>Planes de Estudio</CardTitle>
                  <CardDescription>
                    Administración de planes de estudio
                  </CardDescription>
                </div>

                <Button onClick={() => setPlanEstudioDialogOpen(true)}>
                  <BookOpen className="mr-2 h-4 w-4" /> Nuevo Plan de Estudios
                </Button>
              </div>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Plan de Estudio</TableHead>
                    <TableHead>Semestre</TableHead>
                    <TableHead>Materias</TableHead>
                    <TableHead>Acciones</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {planesEstudio.map((plan) => (
                    <TableRow key={plan.id}>
                      <TableCell className="font-medium">
                        {plan.nombre}
                      </TableCell>
                      <TableCell>{plan.semestres}</TableCell>
                      <TableCell>{plan.materias.length}</TableCell>
                      <TableCell>
                        <div className="flex space-x-2">
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => handleEditarPlanEstudio(plan)}
                          >
                            <Edit className="h-4 w-4" />
                          </Button>
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => deletePlanEstudio(plan.id)}
                          >
                            <Trash className="h-4 w-4" />
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

        <TabsContent value="grupos" className="space-y-6">
          <Card>
            <CardHeader className="pb-3">
              <div className="flex justify-between items-center">
                <div>
                  <CardTitle>Gestión de Grupos</CardTitle>
                  <CardDescription>
                    Administración de grupos escolares y jefes de grupo
                  </CardDescription>
                </div>

                <div className="flex items-center gap-3">
                  <div className="relative w-64">
                    <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
                    <Input
                      placeholder="Buscar por grupo o jefe"
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                      className="pl-8"
                    />
                  </div>

                  <Button onClick={() => setGrupoDialogOpen(true)}>
                    <UserPlus className="mr-2 h-4 w-4" /> Nuevo Grupo
                  </Button>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Número</TableHead>
                    <TableHead>Plan de estudio</TableHead>
                    <TableHead>Jefe de Grupo</TableHead>
                    <TableHead>Acciones</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredGrupos.map((grupo) => (
                    <TableRow key={grupo?.id}>
                      <TableCell className="font-medium">
                        {grupo?.numero}
                      </TableCell>
                      <TableCell>{grupo?.plan_estudio_nombre}</TableCell>
                      <TableCell>{grupo?.jefe_grupo_nombre}</TableCell>
                      <TableCell>
                        <div className="flex space-x-2">
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => handleEditarGrupo(grupo)}
                          >
                            <Edit className="h-4 w-4" />
                          </Button>
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => deleteGrupos(grupo)}
                          >
                            <Trash className="h-4 w-4" />
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

      {/* Modal para Nuevo Horario */}
      <Dialog
        open={horarioDialogOpen}
        onOpenChange={(open) => {
          setHorarioDialogOpen(open);
          if (!open) limpiarNuevoHorario();
        }}
      >
        <DialogContent className="sm:max-w-[650px]">
          <DialogHeader>
            <DialogTitle>Crear Nuevo Horario</DialogTitle>
            <DialogDescription>
              Programa las clases para cada día de la semana.
            </DialogDescription>
          </DialogHeader>

          <form onSubmit={handleNuevoHorarioSubmit} className="space-y-4">
            <div className="space-y-4 py-4 max-h-[70vh] overflow-y-auto pr-2">
              <div className="flex items-center space-x-4">
                <div className="w-1/2 space-y-2">
                  <label htmlFor="numero" className="text-sm font-medium">
                    Grupo
                  </label>
                  <select
                    id="grupo"
                    name="grupo_id"
                    value={JSON.stringify(nuevoHorario?.grupo_id) || ""}
                    onChange={handleNuevoHorarioChange}
                    className="col-span-3 flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                    required
                  >
                    <option value="" disabled>
                      Selecciona un grupo
                    </option>
                    //allGrupoSinHoraio
                    {allGrupoSinHoraio.map((grupo) => (
                      <option key={grupo.id} value={JSON.stringify(grupo)}>
                        {grupo.numero}
                      </option>
                    ))}
                  </select>
                </div>

                <div className="w-full max-w-md bg-white rounded-lg p-4">
                  <label className="block text-gray-700 font-semibold mb-3">
                    Seleccionar Días
                  </label>
                  <div className="grid grid-cols-2 gap-3">
                    {["Lunes", "Martes", "Miércoles", "Jueves", "Viernes"].map(
                      (day) => (
                        <div key={day} className="flex items-center">
                          <input
                            type="checkbox"
                            id={day}
                            checked={selectedDays.includes(day)}
                            onChange={() => toggleDay(day)}
                            className="h-5 w-5 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                          />
                          <label
                            htmlFor={day}
                            className="ml-2 block text-sm text-gray-700 cursor-pointer hover:text-blue-600 transition-colors"
                          >
                            {day}
                          </label>
                        </div>
                      )
                    )}
                  </div>
                </div>
              </div>

              <div className="border-t pt-4">
                <div className="flex justify-between items-center mb-4">
                  <h3 className="font-medium">
                    Clases para{" "}
                    {selectedDay.charAt(0).toUpperCase() + selectedDay.slice(1)}
                  </h3>
                  <Button size="sm" onClick={addClasss}>
                    <Plus className="h-4 w-4 mr-1" /> Agregar clase
                  </Button>
                </div>

                {scheduleByDay[selectedDay]!.length === 0 ? (
                  <div className="text-center py-4 text-muted-foreground">
                    No hay clases programadas. Haga clic en "Agregar clase" para
                    comenzar.
                  </div>
                ) : (
                  <div className="space-y-3">
                    {scheduleByDay[selectedDay].map((classItem) => (
                      <div
                        key={classItem.id}
                        className="grid grid-cols-12 gap-2 items-center"
                      >
                        <div className="col-span-4">
                          <select
                            id="materia"
                            name="materia_id"
                            value={classItem.materia_id || ""}
                            onChange={(e) =>
                              updateClasss(
                                classItem.id,
                                "materia_id",
                                e.target.value
                              )
                            }
                            className="col-span-3 flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
                            required
                          >
                            <option value="" disabled>
                              Selecciona materia
                            </option>
                            {materiasHorario.map((materia) => (
                              <option key={materia.id} value={materia.id}>
                                {materia.nombre}
                              </option>
                            ))}
                          </select>
                        </div>

                        {/* Hora inicio - 2 columns */}
                        <div className="col-span-2">
                          <Select
                            value={classItem.horaInicio}
                            onValueChange={(value) =>
                              updateClasss(classItem.id, "horaInicio", value)
                            }
                          >
                            <SelectTrigger>
                              <SelectValue placeholder="Inicio" />
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

                        {/* Hora fin - 2 columns */}
                        <div className="col-span-2">
                          <Select
                            value={classItem.horaFin}
                            onValueChange={(value) =>
                              updateClasss(classItem.id, "horaFin", value)
                            }
                          >
                            <SelectTrigger>
                              <SelectValue placeholder="Fin" />
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

                        {/* Maestro - 3 columns */}
                        <div className="col-span-3">
                          <select
                            id="maestro"
                            name="maestro_id"
                            value={classItem.maestro_id || ""}
                            onChange={(e) =>
                              updateClasss(
                                classItem.id,
                                "maestro_id",
                                e.target.value
                              )
                            }
                            className="col-span-3 flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
                            required
                          >
                            <option value="" disabled>
                              Selecciona profesor
                            </option>
                            {allMaestro.map((maestro) => (
                              <option key={maestro.id} value={maestro.id}>
                                {maestro.fullName}
                              </option>
                            ))}
                          </select>
                        </div>

                        {/* Remove button - 1 column */}
                        <div className="col-span-1">
                          <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => removeClasss(classItem.id)}
                          >
                            <X className="h-4 w-4" />
                          </Button>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>

            <DialogFooter>
              <DialogClose asChild>
                <Button type="button" variant="outline">
                  Cancelar
                </Button>
              </DialogClose>
              <Button type="submit">
                <Save className="mr-2 h-4 w-4" /> Guardar
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      <Dialog open={horarioDialogEditOpen} onOpenChange={onChangeHorarioEdit}>
        <DialogContent className="sm:max-w-[650px]">
          <DialogHeader>
            <DialogTitle>Editar Nuevo Horario</DialogTitle>
            <DialogDescription>
              Programa las clases para cada día de la semana.
            </DialogDescription>
          </DialogHeader>

          <form onSubmit={handleEditHorarioSubmit}>
            <div className="space-y-4 py-4 max-h-[70vh] overflow-y-auto pr-2">
              <div className="flex items-center space-x-4">
                <div className="w-1/2 space-y-2">
                  <label htmlFor="dia" className="text-sm font-medium">
                    Día
                  </label>
                  <Select value={selectedDay} onValueChange={setSelectedDay}>
                    <SelectTrigger>
                      <SelectValue placeholder="Seleccionar día" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="Lunes">Lunes</SelectItem>
                      <SelectItem value="Martes">Martes</SelectItem>
                      <SelectItem value="Miercoles">Miércoles</SelectItem>
                      <SelectItem value="Jueves">Jueves</SelectItem>
                      <SelectItem value="Viernes">Viernes</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div className="border-t pt-4">
                <div className="flex justify-between items-center mb-4">
                  <h3 className="font-medium">
                    Clases para{" "}
                    {selectedDay.charAt(0).toUpperCase() + selectedDay.slice(1)}
                  </h3>
                  <Button size="sm" onClick={addClass}>
                    <Plus className="h-4 w-4 mr-1" /> Agregar clase
                  </Button>
                </div>

                {scheduleByDay[selectedDay]!.length === 0 ? (
                  <div className="text-center py-4 text-muted-foreground">
                    No hay clases programadas. Haga clic en "Agregar clase" para
                    comenzar.
                  </div>
                ) : (
                  <div className="space-y-3">
                    {scheduleByDay[selectedDay].map((classItem) => (
                      <div
                        key={classItem.id}
                        className="grid grid-cols-12 gap-2 items-center"
                      >
                        <div className="col-span-4">
                          <select
                            id="materia"
                            name="materia_id"
                            value={classItem.materia_id || ""}
                            onChange={(e) =>
                              updateClass(
                                classItem.id,
                                "materia_id",
                                e.target.value
                              )
                            }
                            className="col-span-3 flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
                            required
                          >
                            <option value="" disabled>
                              Selecciona materia
                            </option>
                            //aqui es we, donde tienes que hacer cosas
                            {/* {horarioSeleccionado?.horarios[selectedDay].map(
                              (materia) => (
                                // <option value={JSON.stringify(materia.materias)}>
                                //   {materia.materias.nombre}
                                // </option>
                                <option value={materia.materias.id}>
                                  {materia.materias.nombre}
                                </option>
                              )
                            )} */}
                            {materiasHorario.map((materia) => (
                              <option key={materia.id} value={materia.id}>
                                {materia.nombre}
                              </option>
                            ))}
                          </select>
                        </div>

                        <div className="col-span-2">
                          <Select
                            value={classItem.hora_inicio}
                            onValueChange={(value) =>
                              updateClass(classItem.id, "hora_inicio", value)
                            }
                          >
                            <SelectTrigger>
                              <SelectValue placeholder="Inicio" />
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

                        {/* Hora fin - 2 columns */}
                        <div className="col-span-2">
                          <Select
                            value={classItem.hora_fin || ""}
                            onValueChange={(value) =>
                              updateClass(classItem.id, "hora_fin", value)
                            }
                          >
                            <SelectTrigger>
                              <SelectValue placeholder="Fin" />
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

                        {/* Maestro - 3 columns */}
                        <div className="col-span-3">
                          <select
                            id="maestro"
                            name="maestro_id"
                            value={classItem.maestro_id || ""}
                            onChange={(e) =>
                              updateClass(
                                classItem.id,
                                "maestro_id",
                                e.target.value
                              )
                            }
                            className="col-span-3 flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
                            required
                          >
                            <option value="" disabled>
                              Selecciona profesor
                            </option>
                            {allMaestro.map((maestro) => (
                              <option key={maestro.id} value={maestro.id}>
                                {maestro.fullName}
                              </option>
                            ))}
                          </select>
                        </div>

                        {/* Remove button - 1 column */}
                        <div className="col-span-1">
                          <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => removeClass(classItem.id)}
                          >
                            <X className="h-4 w-4" />
                          </Button>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>

            <DialogFooter>
              <DialogClose asChild>
                <Button type="button" variant="outline">
                  Cancelar
                </Button>
              </DialogClose>
              <Button type="submit">
                <Save className="mr-2 h-4 w-4" /> Guardar
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      {/* <DialogFooter>
        <Save className="mr-2 h-4 w-4" /> Guardar
      </DialogFooter> */}

      {/* Modal para Nuevo Plan de Estudios */}
      <Dialog open={planEstudioDialogOpen} onOpenChange={quitarCrear}>
        <DialogContent className="sm:max-w-[500px]">
          <DialogHeader>
            <DialogTitle>Crear Nuevo Plan de Estudios</DialogTitle>
            <DialogDescription>
              Completa los detalles para crear un nuevo plan de estudios.
            </DialogDescription>
          </DialogHeader>

          <form onSubmit={handleCreatePlanEstudioSubmit}>
            <div className="space-y-4 py-4 max-h-[70vh] overflow-y-auto pr-2">
              <div className="space-y-2">
                <label htmlFor="carrera" className="text-sm font-medium">
                  Plan de Estudio
                </label>
                <Input
                  id="nombre"
                  name="nombre"
                  value={nuevoPlanEstudio?.nombre}
                  onChange={handleNuevoPlanEstudioChange}
                  className="col-span-3"
                  required
                />
              </div>

              <div className="space-y-2">
                <label htmlFor="carrera" className="text-sm font-medium">
                  Semestres
                </label>
                <Input
                  id="semestres"
                  name="semestres"
                  type="number"
                  value={nuevoPlanEstudio?.semestres}
                  onChange={handleNuevoPlanEstudioChange}
                  className="col-span-3"
                  required
                />
              </div>

              <div className="space-y-2">
                <label className="text-sm font-medium">Materias</label>

                {/* Componente dinámico para agregar materias */}
                <div className="space-y-3">
                  {materias.map((materia) => (
                    <div key={materia.id} className="flex items-center gap-2">
                      <Input
                        value={materia.nombre}
                        onChange={(e) =>
                          updateMateria(materia.id, e.target.value)
                        }
                        placeholder="Nombre de la materia"
                        className="flex-1"
                      />
                      <Button
                        type="button"
                        variant="outline"
                        size="icon"
                        onClick={() => removeMateria(materia.id)}
                      >
                        <X className="h-4 w-4" />
                      </Button>
                    </div>
                  ))}

                  <Button
                    type="button"
                    variant="outline"
                    onClick={addMateria}
                    className="w-full"
                  >
                    <Plus className="mr-2 h-4 w-4" /> Agregar Materia
                  </Button>
                </div>
              </div>
            </div>

            <DialogFooter>
              <DialogClose asChild>
                <Button type="button" variant="outline">
                  Cancelar
                </Button>
              </DialogClose>
              <Button
                type="submit"
                onClick={() => {
                  // handleCreatePlanEstudio(nuevoPlanEstudio);
                  setPlanEstudioDialogOpen(false);
                }}
              >
                <Save className="mr-2 h-4 w-4" /> Guardar
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      {/* Modal para Nuevo Grupo */}
      <Dialog open={grupoDialogOpen} onOpenChange={setGrupoDialogOpen}>
        <DialogContent className="sm:max-w-[500px]">
          <DialogHeader>
            <DialogTitle>Crear Nuevo Grupo</DialogTitle>
            <DialogDescription>
              Completa los detalles para crear un nuevo grupo escolar.
            </DialogDescription>
          </DialogHeader>

          <form onSubmit={handleCreateGrupoSubmit}>
            <div className="space-y-4 py-4">
              <div className="space-y-2">
                <label htmlFor="numero" className="text-sm font-medium">
                  Número de Grupo
                </label>
                <Input
                  id="numero"
                  name="numero"
                  value={nuevoGrupo?.numero || ""}
                  onChange={handleNuevoGrupoChange}
                  className="col-span-3"
                  required
                />
              </div>

              <div className="space-y-2">
                <label htmlFor="plan_estudio" className="text-sm font-medium">
                  Plan de Estudio
                </label>
                <select
                  id="plan_estudio"
                  name="plan_estudio_id"
                  value={nuevoGrupo?.plan_estudio_id || ""}
                  onChange={handleNuevoGrupoChange}
                  className="col-span-3 flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                  required
                >
                  <option value="">Selecciona un plan de estuio</option>
                  {planesEstudio.map((plan) => (
                    <option key={plan.id} value={plan.id}>
                      {plan.nombre}
                    </option>
                  ))}
                </select>
              </div>

              <div className="space-y-2">
                <label htmlFor="jefeGrupo" className="text-sm font-medium">
                  Jefe de Grupo
                </label>
                <select
                  id="jefeGrupo"
                  name="jefe_grupo_id"
                  value={nuevoGrupo?.jefe_grupo_id || ""}
                  onChange={handleNuevoGrupoChange}
                  className="col-span-3 flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                  required
                >
                  <option value="">Selecciona un jefe de grupo</option>
                  {jefeSinGrupo.map((jefe) => (
                    <option key={jefe.id} value={jefe.id}>
                      {jefe.fullName}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            <DialogFooter>
              <DialogClose asChild>
                <Button type="button" variant="outline">
                  Cancelar
                </Button>
              </DialogClose>
              <Button
                type="submit"
                // onClick={() => {
                //   setGrupoDialogOpen(false);
                // }}
              >
                <Save className="mr-2 h-4 w-4" /> Guardar
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      {/* Modal para Editar Grupo */}
      <Dialog open={grupoDialogEditOpen} onOpenChange={setGrupoDialogEditOpen}>
        <DialogContent className="sm:max-w-[500px]">
          <DialogHeader>
            <DialogTitle>Crear Nuevo Grupo</DialogTitle>
            <DialogDescription>
              Completa los detalles para crear un nuevo grupo escolar.
            </DialogDescription>
          </DialogHeader>

          <form onSubmit={handleEditGrupoSubmit}>
            <div className="space-y-4 py-4">
              <div className="space-y-2">
                <label htmlFor="numero" className="text-sm font-medium">
                  Número de Grupo
                </label>
                <Input
                  id="numero"
                  name="numero"
                  value={nuevoGrupo?.numero || ""}
                  onChange={handleNuevoGrupoChange}
                  className="col-span-3"
                  required
                />
              </div>

              <div className="space-y-2">
                <label htmlFor="plan_estudio" className="text-sm font-medium">
                  Plan de Estudio
                </label>
                <select
                  id="plan_estudio"
                  name="plan_estudio_id"
                  value={nuevoGrupo?.plan_estudio_id || ""}
                  onChange={handleNuevoGrupoChange}
                  className="col-span-3 flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                  required
                >
                  <option value="">Selecciona un plan de estuio</option>
                  {planesEstudio.map((plan) => (
                    <option key={plan.id} value={plan.id}>
                      {plan.nombre}
                    </option>
                  ))}
                </select>
              </div>

              <div className="space-y-2">
                <label htmlFor="jefeGrupo" className="text-sm font-medium">
                  Jefe de Grupo
                </label>
                <select
                  id="jefeGrupo"
                  name="jefe_grupo_id"
                  value={nuevoGrupo?.jefe_grupo_id || ""}
                  onChange={handleNuevoGrupoChange}
                  className="col-span-3 flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                  required
                >
                  <option value="">Selecciona un jefe de grupo</option>
                  {jefesGrupo.map((jefe) => (
                    <option key={jefe.id} value={jefe.id}>
                      {jefe.fullName}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            <DialogFooter>
              <DialogClose asChild>
                <Button type="button" variant="outline">
                  Cancelar
                </Button>
              </DialogClose>
              <Button
                type="submit"
                // onClick={() => {
                //   setGrupoDialogOpen(false);
                // }}
              >
                <Save className="mr-2 h-4 w-4" /> Guardar
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      {/* Modal para editar plan estudio */}
      <Dialog open={editarPlanOpen} onOpenChange={quitarEditar}>
        <DialogContent className="sm:max-w-[500px]">
          <DialogHeader>
            <DialogTitle>Editar Plan de Estudios</DialogTitle>
            <DialogDescription>
              Modifica los datos del plan de estudios seleccionado.
            </DialogDescription>
          </DialogHeader>

          {planSeleccionado && (
            <form onSubmit={handleEditarPlanSubmit}>
              <div className="space-y-4 py-4 max-h-[70vh] overflow-y-auto pr-2">
                <div className="space-y-2">
                  <label htmlFor="carrera" className="text-sm font-medium">
                    Plan de Estudio
                  </label>
                  <Input
                    id="nombre"
                    name="nombre"
                    value={planSeleccionado?.nombre}
                    onChange={handleEditarPlanChange}
                    className="col-span-3"
                    required
                  />
                </div>

                <div className="space-y-2">
                  <label htmlFor="carrera" className="text-sm font-medium">
                    Semestres
                  </label>
                  <Input
                    id="semestres"
                    name="semestres"
                    type="number"
                    value={planSeleccionado?.semestres}
                    onChange={handleEditarPlanChange}
                    className="col-span-3"
                    required
                  />
                </div>

                <div className="space-y-2">
                  <label className="text-sm font-medium">Materias</label>

                  {/* Componente dinámico para agregar materias */}
                  <div className="space-y-3">
                    {planSeleccionado?.materias.map((materia) => (
                      <div key={materia.id} className="flex items-center gap-2">
                        <Input
                          value={materia.nombre}
                          onChange={(e) =>
                            updateMateria(materia.id, e.target.value)
                          }
                          placeholder="Nombre de la materia"
                          className="flex-1"
                        />
                        <Button
                          type="button"
                          variant="outline"
                          size="icon"
                          onClick={() => removeMateria(materia.id)}
                        >
                          <X className="h-4 w-4" />
                        </Button>
                      </div>
                    ))}

                    <Button
                      type="button"
                      variant="outline"
                      onClick={addMateria}
                      className="w-full"
                    >
                      <Plus className="mr-2 h-4 w-4" /> Agregar Materia
                    </Button>
                  </div>
                </div>
              </div>

              <DialogFooter>
                <DialogClose asChild>
                  <Button type="button" variant="outline">
                    Cancelar
                  </Button>
                </DialogClose>
                <Button
                  type="submit"
                  onClick={() => {
                    setEditarPlanOpen(false);
                  }}
                >
                  <Save className="mr-2 h-4 w-4" /> Guardar
                </Button>
              </DialogFooter>
            </form>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default JefeCarreraPage;
