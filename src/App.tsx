import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route, useNavigate } from "react-router-dom";
import Navbar from "@/components/Navbar";
import { useIsMobile } from "@/hooks/use-mobile";

import Index from "./pages/Index";
import Dashboard from "./pages/Perfil";
import NotFound from "./pages/NotFound";
import JefeGrupoPage from "./pages/JefeGrupoPage";
import JefeCarreraPage from "./pages/JefeCarreraPage";
import AdministracionPage from "./pages/AdministracionPage";
import MaestroPage from "./pages/MaestroPage";
import ChecadorPage from "./pages/ChecadorPage";
import { AuthProvider } from "./context/authContext";
import ProtectedRoute from "./components/routes/ProtectedRoutes";

const queryClient = new QueryClient();

// Wrapper component that provides consistent layout with navbar
const AppLayout = ({ children }: { children: React.ReactNode }) => {
  const isMobile = useIsMobile();

  return (
    <div className="flex flex-col h-screen bg-background">
      {isMobile ? (
        <>
          <Navbar />
          <main className="flex-1 overflow-auto">{children}</main>
        </>
      ) : (
        <div className="flex flex-row h-screen">
          <Navbar />
          <main className="flex-1 overflow-auto">{children}</main>
        </div>
      )}
    </div>
  );
};

const App = () => {
  return (
    <AuthProvider>
      <QueryClientProvider client={queryClient}>
        <TooltipProvider>
          <Toaster />
          <Sonner />
          <BrowserRouter>
            <Routes>
              <Route path="/" element={<Index />} />
              <Route
                path="/perfil"
                element={
                  <ProtectedRoute
                    allowedRoles={[
                      "Administracion",
                      "Jefe de Grupo",
                      "Jefe de Carrera",
                      "Checador",
                      "Maestro",
                    ]}
                  >
                    <AppLayout>
                      <Dashboard />
                    </AppLayout>
                  </ProtectedRoute>
                }
              />
              <Route
                path="/jefe-grupo"
                element={
                  <ProtectedRoute allowedRoles={["Jefe de Grupo"]}>
                    <AppLayout>
                      <JefeGrupoPage />
                    </AppLayout>
                  </ProtectedRoute>
                }
              />
              <Route
                path="/jefe-carrera"
                element={
                  <ProtectedRoute allowedRoles={["Jefe de Carrera"]}>
                    <AppLayout>
                      <JefeCarreraPage />
                    </AppLayout>
                  </ProtectedRoute>
                }
              />
              <Route
                path="/administracion"
                element={
                  <ProtectedRoute allowedRoles={["Administracion"]}>
                    <AppLayout>
                      <AdministracionPage />
                    </AppLayout>
                  </ProtectedRoute>
                }
              />
              <Route
                path="/maestro"
                element={
                  <ProtectedRoute allowedRoles={["Maestro"]}>
                    <AppLayout>
                      <MaestroPage />
                    </AppLayout>
                  </ProtectedRoute>
                }
              />
              <Route
                path="/checador"
                element={
                  <ProtectedRoute allowedRoles={["Checador"]}>
                    <AppLayout>
                      <ChecadorPage />
                    </AppLayout>
                  </ProtectedRoute>
                }
              />
              {/* Ruta por defecto para páginas no encontradas */}
              <Route path="*" element={<NotFound />} />
            </Routes>
          </BrowserRouter>
        </TooltipProvider>
      </QueryClientProvider>
    </AuthProvider>
  );
};

export default App;
