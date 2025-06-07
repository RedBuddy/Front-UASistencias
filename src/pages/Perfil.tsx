import React, { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Eye, EyeOff, User } from "lucide-react";
import { getUserInfo, updateUserInfo } from "../data/api/userApi";
import { useToast } from "@/components/ui/use-toast";

const UserProfile = () => {
  const [userData, setUserData] = useState({
    nombre: "",
    apellido: "",
    rolNombre: "",
    username: ""
  });
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [newPassword, setNewPassword] = useState("");
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const { toast } = useToast();

  // Obtener el token del almacenamiento local
  const getToken = () => {
    return localStorage.getItem("auth_token");
  };

  // Obtener el nombre de usuario del almacenamiento local o del contexto
  const getUsername = () => {
    // Decodificar el token JWT para obtener el username
    try {
      const token = getToken();
      if (token) {
        const base64Url = token.split('.')[1];
        const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
        const jsonPayload = decodeURIComponent(atob(base64).split('').map(function(c) {
          return '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2);
        }).join(''));

        const payload = JSON.parse(jsonPayload);
        return payload.sub || localStorage.getItem("username") || "usuario_actual";
      }
    } catch (error) {
      console.error("Error al decodificar el token:", error);
    }
    
    return localStorage.getItem("username") || "usuario_actual";
  };

  // Cargar datos del usuario al montar el componente
  useEffect(() => {
    const loadUserData = async () => {
      try {
        setIsLoading(true);
        const token = getToken();
        const username = getUsername();
        
        if (!token) {
          throw new Error("No se encontró el token de autenticación");
        }
        
        const data = await getUserInfo(username, token);
        console.log("Datos recibidos:", data); // Para depuración
        
        setUserData({
          nombre: data.nombre || "",
          apellido: data.apellido || "",
          rolNombre: data.rol && data.rol.nombre ? data.rol.nombre : "",
          username: data.username || username
        });
        setIsLoading(false);
      } catch (err) {
        console.error("Error al cargar datos del usuario:", err);
        setError(err.message);
        setIsLoading(false);
        toast({
          title: "Error",
          description: "No se pudieron cargar los datos del usuario",
          variant: "destructive"
        });
      }
    };

    loadUserData();
  }, []);

  const handlePasswordChange = async () => {
    if (isEditing) {
      try {
        if (!newPassword) {
          toast({
            title: "Error",
            description: "La contraseña no puede estar vacía",
            variant: "destructive"
          });
          return;
        }

        const token = getToken();
        const username = getUsername();
        
        if (!token) {
          throw new Error("No se encontró el token de autenticación");
        }

        // Actualizar contraseña en el servidor
        await updateUserInfo(username, { password: newPassword }, token);
        
        // Actualizar el estado local
        setPassword(newPassword);
        setIsEditing(false);
        setNewPassword("");
        
        toast({
          title: "Éxito",
          description: "Contraseña actualizada correctamente",
          variant: "default"
        });
      } catch (err) {
        console.error("Error al actualizar la contraseña:", err);
        toast({
          title: "Error",
          description: `No se pudo actualizar la contraseña: ${err.message}`,
          variant: "destructive"
        });
      }
    } else {
      setIsEditing(true);
      setNewPassword("");
    }
  };

  if (isLoading) {
    return (
      <div className="flex justify-center items-center h-64">
        <p>Cargando información del usuario...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex justify-center items-center h-64">
        <p className="text-red-500">Error: {error}</p>
      </div>
    );
  }

  return (
    <div className="flex-1 overflow-auto p-3 md:p-8">
      <div className="max-w-3xl mx-auto">
        <Card>
          <CardHeader className="pb-6">
            <div className="flex items-center gap-4">
              <div className="flex items-center justify-center w-16 h-16 rounded-full bg-gray-100">
                <User className="w-8 h-8 text-gray-500" />
              </div>
              <CardTitle>Perfil de Usuario</CardTitle>
            </div>
          </CardHeader>
          
          <CardContent className="space-y-6">
            {/* Nombre */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-2">
                <Label htmlFor="nombre">Nombre:</Label>
                <Input 
                  id="nombre" 
                  value={userData.nombre} 
                  readOnly 
                  className="bg-gray-50"
                />
              </div>
              
              {/* Apellido */}
              <div className="space-y-2">
                <Label htmlFor="apellido">Apellido:</Label>
                <Input 
                  id="apellido" 
                  value={userData.apellido} 
                  readOnly 
                  className="bg-gray-50"
                />
              </div>
            </div>
            
            {/* Nombre de usuario */}
            <div className="space-y-2">
              <Label htmlFor="username">Nombre de usuario:</Label>
              <Input 
                id="username" 
                value={userData.username} 
                readOnly 
                className="bg-gray-50"
              />
            </div>
            
            {/* Rol */}
            <div className="space-y-2">
              <Label htmlFor="rol">Rol:</Label>
              <Input 
                id="rol" 
                value={userData.rolNombre} 
                readOnly 
                className="bg-gray-50"
              />
            </div>
            
            {/* Contraseña */}
            <div className="space-y-2">
              <Label htmlFor="password">
                {isEditing ? "Nueva Contraseña:" : "Contraseña:"}
              </Label>
              <div className="relative">
                <Input 
                  id="password" 
                  type={showPassword ? "text" : "password"} 
                  value={isEditing ? newPassword : password}
                  onChange={(e) => setNewPassword(e.target.value)}
                  readOnly={!isEditing}
                  placeholder={isEditing ? "Ingrese nueva contraseña" : "••••••••"}
                  className={isEditing ? "" : "bg-gray-50"}
                />
                <button 
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 transform -translate-y-1/2"
                >
                  {showPassword ? (
                    <EyeOff className="h-5 w-5 text-gray-500" />
                  ) : (
                    <Eye className="h-5 w-5 text-gray-500" />
                  )}
                </button>
              </div>
            </div>
            
            {/* Botón para cambiar contraseña */}
            <div className="flex justify-end">
              <Button 
                onClick={handlePasswordChange}
                disabled={isEditing && !newPassword}
              >
                {isEditing ? "Confirmar Cambio" : "Cambiar Contraseña"}
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default UserProfile;