
import React from "react";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import TabContents from "./TabContents";
import { useIsMobile } from "@/hooks/use-mobile";

const DashboardTabs = () => {
  const isMobile = useIsMobile();
  
  return (
    <Tabs defaultValue="resumen" className="w-full">
      <TabsList className="mb-6">
        <TabsTrigger value="resumen" className="text-xs md:text-sm">Resumen</TabsTrigger>
        <TabsTrigger value="asistencia" className="text-xs md:text-sm">Asistencia</TabsTrigger>
        <TabsTrigger value="horarios" className="text-xs md:text-sm">Horarios</TabsTrigger>
        <TabsTrigger value="reportes" className="text-xs md:text-sm">Reportes</TabsTrigger>
      </TabsList>
      
      <TabContents />
    </Tabs>
  );
};

export default DashboardTabs;
