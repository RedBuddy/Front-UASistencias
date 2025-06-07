import React, { FormEvent, useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Label } from "@/components/ui/label";
import {
  ChevronRight,
  BookOpen,
  Users,
  Calendar,
  ClipboardCheck,
} from "lucide-react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/hooks/useAuth";

const Index = () => {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const { handleLogin } = useAuth();

  const { role } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    if (role === null) return; // 🔹 No hagas nada si `role` aún no se ha definido

    switch (role) {
      case "Administracion":
        navigate("/administracion", { replace: true });
        break;
      case "Jefe de Grupo":
        navigate("/jefe-grupo", { replace: true });
        break;
      case "Jefe de Carrera":
        navigate("/jefe-carrera", { replace: true });
        break;
      case "Checador":
        navigate("/checador", { replace: true });
        break;
      case "Maestro":
        navigate("/maestro", { replace: true });
        break;
      default:
        navigate("/dashboard", { replace: true });
        break;
    }
  }, [role, navigate]);

  // const handleLogin = (e: React.FormEvent) => {
  //   e.preventDefault();
  //   console.log("Login attempt:", { username, password });
  //   navigate("/dashboard");
  // };
  const login = (e: FormEvent) => {
    e.preventDefault();
    handleLogin(username, password);
    // navigate("/dashboard");
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-50 to-gray-100 dark:from-gray-900 dark:to-gray-800 py-4 px-3 sm:py-10 sm:px-6">
      <div className="max-w-7xl mx-auto">
        <div className="flex flex-col md:flex-row gap-6 md:gap-8 items-center">
          <div className="w-full md:w-3/5 space-y-4 md:space-y-6">
            <div className="space-y-2">
              <h1 className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-bold tracking-tighter text-primary">
                UASistencia
              </h1>
              <p className="text-base sm:text-lg md:text-xl text-gray-600 dark:text-gray-300">
                Sistema integral para la gestión de asistencia de maestros
              </p>
            </div>

            
          </div>

          <div className="w-full md:w-3/5 mt-6 md:mt-15">
            <Card className="border border-gray-200 dark:border-gray-700 shadow-lg">
              <CardHeader>
                <CardTitle className="text-xl mb-2">Iniciar Sesión</CardTitle>
                <CardDescription>
                  Ingresa tus credenciales para acceder al sistema
                </CardDescription>
              </CardHeader>
              <CardContent>
                <Tabs defaultValue="login" className="w-full">
                  <TabsContent value="login">
                    <form onSubmit={login} className="space-y-4 mt-4">
                      <div className="space-y-2">
                        <Label htmlFor="username">Número de Cuenta</Label>
                        <Input
                          id="username"
                          type="text"
                          placeholder="Ingresa tu número de cuenta"
                          value={username}
                          onChange={(e) => setUsername(e.target.value)}
                          required
                        />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="password">Contraseña</Label>
                        <Input
                          id="password"
                          type="password"
                          placeholder="Ingresa tu contraseña"
                          value={password}
                          onChange={(e) => setPassword(e.target.value)}
                          required
                        />
                      </div>
                      <Button type="submit" className="w-full">
                        Ingresar <ChevronRight className="ml-2 h-4 w-4" />
                      </Button>
                    </form>
                  </TabsContent>
                </Tabs>
              </CardContent>
              <CardFooter className="flex justify-center text-xs sm:text-sm text-gray-500 dark:text-gray-400">
                <p>Sistema de Asistencia Académica © 2025</p>
              </CardFooter>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Index;
