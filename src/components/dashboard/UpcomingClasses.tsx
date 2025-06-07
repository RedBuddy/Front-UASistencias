
import React from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { BookOpen } from "lucide-react";

const UpcomingClasses = () => {
  return (
    <Card className="col-span-1 h-full">
      <CardHeader className="pb-2">
        <CardTitle className="text-lg">Próximas Clases</CardTitle>
        <CardDescription className="text-sm">
          Horario para hoy
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="space-y-3">
          {[1, 2, 3, 4].map((i) => (
            <div key={i} className="flex items-center gap-2 pb-2 border-b text-sm">
              <div className="bg-primary/10 p-1.5 rounded-full">
                <BookOpen className="h-3.5 w-3.5 text-primary" />
              </div>
              <div className="flex-1 min-w-0">
                <p className="font-medium truncate">Programación Avanzada</p>
                <p className="text-xs text-muted-foreground truncate">
                  Prof. María Gómez - Grupo 502 - {12 + i}:00 PM
                </p>
              </div>
              <Button size="sm" variant="outline" className="h-7 text-xs whitespace-nowrap">
                Detalles
              </Button>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
};

export default UpcomingClasses;
