import { useAuth } from "@/hooks/useAuth";
import { useNavigate } from "react-router-dom";
import { Button } from "./button";
import { LogOut } from "lucide-react";

export function LogoutButton() {
    const { handleLogout } = useAuth();
    const navigate = useNavigate();
  
    return (
      <div className="p-4 border-t mt-auto">
        <Button 
          variant="outline" 
          className="w-full justify-start"
          onClick={() => {
            handleLogout();
            navigate("/");
          }}
        >
          <LogOut className="mr-2 h-4 w-4" />
          Cerrar Sesión
        </Button>
      </div>
    );
  }