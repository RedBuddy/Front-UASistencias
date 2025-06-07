
import React from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Clock } from "lucide-react";

const RecentActivity = () => {
  return (
    <Card className="col-span-1 h-full">
      <CardHeader className="pb-2">
        <CardTitle className="text-lg">Actividad Reciente</CardTitle>
        <CardDescription className="text-sm">
          Últimos registros de asistencia
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="space-y-3">
          {[1, 2, 3, 4].map((i) => (
            <div key={i} className="flex items-center gap-2 pb-2 border-b text-sm">
              <div className="bg-primary/10 p-1.5 rounded-full">
                <Clock className="h-3.5 w-3.5 text-primary" />
              </div>
              <div className="flex-1 min-w-0">
                <p className="font-medium truncate">Prof. Juan Pérez</p>
                <p className="text-xs text-muted-foreground truncate">
                  Matemáticas - Grupo 301 - 10:30 AM
                </p>
              </div>
              <div className="px-1.5 py-0.5 rounded-md bg-green-100 dark:bg-green-900/20 text-green-700 dark:text-green-400 text-xs whitespace-nowrap">
                Asistió
              </div>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
};

export default RecentActivity;
