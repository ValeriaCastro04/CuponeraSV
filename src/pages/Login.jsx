import { useState } from "react";
import { signInWithEmailAndPassword } from "firebase/auth";
import { doc, getDoc } from "firebase/firestore";
import { auth, db } from "../services/firebase";
import { useNavigate } from "react-router-dom";

const Login = () => {
  const [email, setEmail] = useState("");
  const [clave, setClave] = useState("");
  const [error, setError] = useState("");
  const navigate = useNavigate();

  const handleLogin = async (e) => {
    e.preventDefault();
    setError(""); // Limpia errores anteriores
    try {
      // Autenticación con Firebase Auth
      const userCredential = await signInWithEmailAndPassword(auth, email, clave);
      const uid = userCredential.user.uid;

      // Consulta al documento del usuario para obtener su rol
      const docRef = doc(db, "usuarios", uid);
      const docSnap = await getDoc(docRef);

      if (docSnap.exists()) {
        const rol = docSnap.data().rol;
        console.log("Login exitoso. Rol:", rol);

        // Redirecciona según el rol
        if (rol === "admin") navigate("/admin");
        else if (rol === "empresa") navigate("/empresa");
        else if (rol === "cliente") navigate("/cliente");
        else setError("Rol no válido o no autorizado.");
      } else {
        setError("No se encontró el perfil del usuario.");
      }
    } catch (err) {
      console.error("Error al iniciar sesión:", err);
      if (err.code === "auth/user-not-found") {
        setError("El usuario no existe.");
      } else if (err.code === "auth/wrong-password") {
        setError("Contraseña incorrecta.");
      } else {
        setError("Correo o contraseña inválidos.");
      }
    }
  };

  return (
    <div className="p-6 max-w-md mx-auto">
      <h2 className="text-2xl font-bold mb-4">Iniciar sesión</h2>
      {error && <p className="text-red-500">{error}</p>}
      <form onSubmit={handleLogin} className="flex flex-col gap-4">
        <input
          type="email"
          placeholder="Correo electrónico"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          className="border p-2 rounded"
          required
        />
        <input
          type="password"
          placeholder="Contraseña"
          value={clave}
          onChange={(e) => setClave(e.target.value)}
          className="border p-2 rounded"
          required
        />
        <button className="bg-blue-600 text-white p-2 rounded hover:bg-blue-700 transition" type="submit">
          Entrar
        </button>
      </form>
    </div>
  );
};

export default Login;