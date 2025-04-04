import { useState } from "react";
import { auth, db } from "../services/firebase";
import { updatePassword } from "firebase/auth";
import { doc, updateDoc } from "firebase/firestore";
import { useNavigate } from "react-router-dom";
import { toast } from "react-toastify";

const CambiarContraseña = () => {
  const [nueva, setNueva] = useState("");
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
  
    if (!auth.currentUser) {
      toast.error("Usuario no autenticado");
      return;
    }
  
    if (nueva.length < 6) {
      toast.error("La contraseña debe tener al menos 6 caracteres");
      return;
    }
  
    try {
      setLoading(true);
  
      await updatePassword(auth.currentUser, nueva);
  
      const userRef = doc(db, "usuarios", auth.currentUser.uid);
      await updateDoc(userRef, { primerLogin: false });
  
      toast.success("¡Contraseña actualizada con éxito!");
  
      setTimeout(() => {
        navigate("/empresa");
        window.location.reload(); // Forzar recarga para refrescar el contexto
      }, 1500);
    } catch (err) {
      console.error("Error al cambiar contraseña:", err);
  
      if (err.code === "auth/requires-recent-login") {
        toast.error("Por seguridad, vuelve a iniciar sesión.");
      } else {
        toast.error("Ocurrió un error al cambiar la contraseña.");
      }
    } finally {
      setLoading(false);
    }
  };
  

  return (
    <div
      className="min-h-screen flex items-center justify-center"
      style={{
        background: "linear-gradient(135deg, #FAB26A, #FDD9B5)"
      }}
    >
      <form
        onSubmit={handleSubmit}
        className="bg-white p-10 rounded-2xl shadow-lg w-full max-w-md transition-all duration-300"
      >
        <div className="text-center mb-6">
          <h2 className="text-2xl font-bold text-[#4B59E4] mb-2">
            Cambiar Contraseña
          </h2>
          <p className="text-sm text-gray-600">
            Estás iniciando sesión por primera vez
          </p>
        </div>

        <input
          type="password"
          placeholder="Nueva contraseña"
          value={nueva}
          onChange={(e) => setNueva(e.target.value)}
          className="border border-gray-300 rounded-md px-4 py-2 w-full mb-4 focus:outline-none focus:ring-2 focus:ring-[#4B59E4]"
          required
        />

        <button
          type="submit"
          disabled={loading}
          className={`w-full py-2 rounded-md text-white font-semibold transition duration-300 ${
            loading
              ? "bg-gray-400 cursor-not-allowed"
              : "bg-[#4B59E4] hover:bg-[#3c48d1]"
          }`}
        >
          {loading ? "Guardando..." : "Guardar Contraseña"}
        </button>
      </form>
    </div>
  );
};

export default CambiarContraseña;