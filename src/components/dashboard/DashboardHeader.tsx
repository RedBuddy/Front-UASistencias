
import React from "react";
import { UserCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { DatePicker } from "@/components/DatePicker";
import { useIsMobile } from "@/hooks/use-mobile";

interface DashboardHeaderProps {
  selectedDate: Date | undefined;
  setSelectedDate: (date: Date | undefined) => void;
}

const DashboardHeader = ({ selectedDate, setSelectedDate }: DashboardHeaderProps) => {
  const isMobile = useIsMobile();
  
  return (
    <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
      <div>
        <h1 className="text-2xl md:text-3xl font-bold">Dashboard</h1>
        <p className="text-sm md:text-base text-muted-foreground">Bienvenido al Sistema de Asistencia Académica</p>
      </div>
      <div className="flex items-center gap-2 mt-2 md:mt-0">
        <DatePicker 
          date={selectedDate}
          setDate={setSelectedDate}
        />
        <Button variant="outline" size="icon" className="h-8 w-8 md:h-9 md:w-9">
          <UserCircle className="h-4 w-4 md:h-5 md:w-5" />
        </Button>
      </div>
    </div>
  );
};

export default DashboardHeader;
