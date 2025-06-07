import React from "react";
import { Link, useLocation } from "react-router-dom";
import {
  Users,
  BookOpen,
  FileBarChart,
  UserCircle,
  ClipboardCheck,
  LogOut,
  Menu,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";
import { useIsMobile } from "@/hooks/use-mobile";
import { useAuth } from "@/hooks/useAuth";
import { LogoutButton } from "./ui/log-out-button";

const Navbar = () => {
  const { role } = useAuth();
  const location = useLocation();
  const isMobile = useIsMobile();

  const isActive = (path: string) => {
    return location.pathname === path;
  };

  const NavbarContent = () => (
    <>
      <div className="p-4 border-b">
        <h2 className="text-xl font-bold">UASistencia</h2>
        <p className="text-sm text-muted-foreground">Sistema de Asistencia</p>
      </div>

      <div className="flex-1 py-6 px-3 space-y-1">
        {role === "Jefe de Grupo" && (
          <Link to="/jefe-grupo">
            <Button
              variant={isActive("/jefe-grupo") ? "default" : "ghost"}
              className="w-full justify-start"
            >
              <ClipboardCheck className="mr-2 h-4 w-4" />
              Jefe de Grupo
            </Button>
          </Link>
        )}

        {role === "Jefe de Carrera" && (
          <Link to="/jefe-carrera">
            <Button
              variant={isActive("/jefe-carrera") ? "default" : "ghost"}
              className="w-full justify-start"
            >
              <BookOpen className="mr-2 h-4 w-4" />
              Jefe de Carrera
            </Button>
          </Link>
        )}

        {role === "Administracion" && (
          <Link to="/administracion">
            <Button
              variant={isActive("/administracion") ? "default" : "ghost"}
              className="w-full justify-start"
            >
              <FileBarChart className="mr-2 h-4 w-4" />
              Administración
            </Button>
          </Link>
        )}

        {role === "Maestro" && (
          <Link to="/maestro">
            <Button
              variant={isActive("/maestro") ? "default" : "ghost"}
              className="w-full justify-start"
            >
              <UserCircle className="mr-2 h-4 w-4" />
              Maestro
            </Button>
          </Link>
        )}

        {role === "Checador" && (
          <Link to="/checador">
            <Button
              variant={isActive("/checador") ? "default" : "ghost"}
              className="w-full justify-start"
            >
              <Users className="mr-2 h-4 w-4" />
              Checador
            </Button>
          </Link>
        )}
        <Link to="/perfil">
          <Button
            variant={isActive("/perfil") ? "default" : "ghost"}
            className="w-full justify-start"
          >
            <UserCircle className="mr-2 h-4 w-4" />
            Mi perfil
          </Button>
        </Link>
      </div>

      <div className="p-4 border-t mt-auto">
        <LogoutButton></LogoutButton>
      </div>
    </>
  );

  // Mobile version with hamburger menu
  if (isMobile) {
    return (
      <div className="sticky top-0 z-50 w-full bg-background border-b p-2">
        <div className="flex items-center justify-between">
          <h2 className="text-lg font-bold">UASistencia</h2>

          <Sheet>
            <SheetTrigger asChild>
              <Button variant="ghost" size="icon">
                <Menu className="h-5 w-5" />
                <span className="sr-only">Toggle Menu</span>
              </Button>
            </SheetTrigger>
            <SheetContent side="left" className="p-0">
              <div className="h-full flex flex-col">
                <NavbarContent />
              </div>
            </SheetContent>
          </Sheet>
        </div>
      </div>
    );
  }

  // Desktop version (fixed sidebar)
  return (
    <div className="h-screen w-64 border-r bg-background flex flex-col">
      <NavbarContent />
    </div>
  );
};

export default Navbar;
