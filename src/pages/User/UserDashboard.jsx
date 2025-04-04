import { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { auth } from "../../services/firebase";

const UserDashboard = () => {
  const navigate = useNavigate();

  useEffect(() => {
    const usuario = auth.currentUser;

    if (!usuario || !usuario.emailVerified) {
      alert("Tu correo aún no ha sido verificado. Revisa tu bandeja de entrada.");
      navigate("/login"); // o a una ruta que explique el proceso
    }
  }, [navigate]);

  return (
    <div className="container mx-auto p-6">
      <h2 className="text-2xl font-bold text-center">Bienvenido al Dashboard</h2> 
      <p className="text-center mt-4">Aquí podrás gestionar tus cupones y ver tus ofertas</p>
    </div>
  );
};

export default UserDashboard;