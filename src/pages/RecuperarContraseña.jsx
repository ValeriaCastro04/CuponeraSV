import { useState } from "react";
import { auth } from "../services/firebase";
import { sendPasswordResetEmail } from "firebase/auth";
import { toast } from "react-toastify";

const RecuperarContraseña = () => {
  const [correo, setCorreo] = useState("");
  const [loading, setLoading] = useState(false);

  const handleEnviar = async (e) => {
    e.preventDefault();
    if (!correo) return toast.error("Ingresa tu correo");

    try {
      setLoading(true);
      await sendPasswordResetEmail(auth, correo);
      toast.success("Se ha enviado un enlace para restablecer tu contraseña");
      setCorreo("");
    } catch (error) {
      toast.error("Error: " + error.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-[#FFE7D1]">
      <form
        onSubmit={handleEnviar}
        className="bg-white p-8 rounded-lg shadow-md w-full max-w-sm"
      >
        <h2 className="text-xl font-bold text-center text-[#4B59E4] mb-4">
          Recuperar Contraseña
        </h2>
        <input
          type="email"
          placeholder="Tu correo electrónico"
          value={correo}
          onChange={(e) => setCorreo(e.target.value)}
          className="w-full px-4 py-2 border rounded mb-4"
          required
        />
        <button
          type="submit"
          disabled={loading}
          className={`w-full py-2 rounded text-white font-semibold ${
            loading
              ? "bg-gray-400 cursor-not-allowed"
              : "bg-[#4B59E4] hover:bg-blue-700"
          }`}
        >
          {loading ? "Enviando..." : "Enviar enlace"}
        </button>
      </form>
    </div>
  );
};

export default RecuperarContraseña;