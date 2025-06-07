
import React from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { TabsContent } from "@/components/ui/tabs";
import StatsCards from "./StatsCards";
import RecentActivity from "./RecentActivity";
import UpcomingClasses from "./UpcomingClasses";

const TabContents = () => {
  return (
    <>
      <TabsContent value="resumen" className="space-y-4">
        <StatsCards />

        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          <RecentActivity />
          <UpcomingClasses />
        </div>
      </TabsContent>
      
      <TabsContent value="asistencia">
        <Card>
          <CardHeader>
            <CardTitle className="text-lg md:text-xl">Registro de Asistencia</CardTitle>
            <CardDescription>
              Gestiona la asistencia de profesores
            </CardDescription>
          </CardHeader>
          <CardContent>
            <p className="text-center py-6 md:py-10 text-sm md:text-base text-muted-foreground">
              Selecciona una fecha para ver o registrar la asistencia
            </p>
          </CardContent>
        </Card>
      </TabsContent>
      
      <TabsContent value="horarios">
        <Card>
          <CardHeader>
            <CardTitle className="text-lg md:text-xl">Horarios de Clase</CardTitle>
            <CardDescription>
              Administra los horarios por grupo y semestre
            </CardDescription>
          </CardHeader>
          <CardContent>
            <p className="text-center py-6 md:py-10 text-sm md:text-base text-muted-foreground">
              Aquí podrás ver y modificar los horarios
            </p>
          </CardContent>
        </Card>
      </TabsContent>
      
      <TabsContent value="reportes">
        <Card>
          <CardHeader>
            <CardTitle className="text-lg md:text-xl">Generación de Reportes</CardTitle>
            <CardDescription>
              Visualiza y exporta informes
            </CardDescription>
          </CardHeader>
          <CardContent>
            <p className="text-center py-6 md:py-10 text-sm md:text-base text-muted-foreground">
              Selecciona el tipo de reporte que deseas generar
            </p>
          </CardContent>
        </Card>
      </TabsContent>
    </>
  );
};

export default TabContents;
