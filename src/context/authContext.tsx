import { createContext, useState, useEffect } from "react";
import { login, logout, getToken } from "../core/authService";
import { Role, User } from "@/models/user";

interface AuthContextType {
  role: Role | null;
  user: User | null;
  isLoading: boolean;
  handleLogin: (username: string, password: string) => Promise<void>;
  handleLogout: () => void;
}

export const AuthContext = createContext<AuthContextType>({
  role: null,
  user: null,
  isLoading: true,
  handleLogin: async () => {},
  handleLogout: () => {},
});

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [role, setRole] = useState(null); // 🔹 Inicializamos como `null`
  const [isLoading, setIsLoading] = useState(true); // Nuevo estado

  //   useEffect(() => {
  //     const token = getToken();
  //     try {
  //       // Decodificar el token y extraer el rol
  //       const decodedUser = token;
  //       setRole(decodedUser.rol); // 🔹 Asegurar que `role` siempre tenga un valor
  //     } catch (error) {
  //       console.error("Error al decodificar el token:", error);
  //       setRole(null);
  //     }
  //   }, []);

  useEffect(() => {
    const token = getToken();
    const checkAuth = async () => {
      setIsLoading(true);
      try {
        if (token) {
            console.log(token.rol)
          // Decodificar el token
          const decodedUser = token;

          setRole(decodedUser.rol);
        }
      } catch (error) {
        console.error("Error decodificando token:", error);
        logout();
      } finally {
        setIsLoading(false);
      }
    };

    checkAuth();
  }, []);

  const handleLogin = async (username, password) => {
    try {
      const userData = await login(username, password);
      setRole(userData.rol || null);
    } catch (error) {
      console.error("Error en login:", error.message);
    }
  };

  const handleLogout = () => {
    logout();
    setUser(null);
    setRole(null);
  };

  return (
    <AuthContext.Provider value={{ user, role, isLoading,  handleLogin, handleLogout }}>
      {!isLoading ? children : <div>Cargando...</div>}
    </AuthContext.Provider>
  );
};
