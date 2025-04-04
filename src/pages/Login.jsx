import { useState } from "react";
import { signInWithEmailAndPassword } from "firebase/auth";
import {
  doc,
  getDoc,
  collection,
  query,
  where,
  getDocs,
} from "firebase/firestore";
import { auth, db } from "../services/firebase";
import { useNavigate } from "react-router-dom";
import { toast } from "react-toastify";

const Login = () => {
  const [email, setEmail] = useState("");
  const [clave, setClave] = useState("");
  const [error, setError] = useState("");
  const navigate = useNavigate();

  const handleLogin = async (e) => {
    e.preventDefault();
    setError("");

    try {
      // 🔐 Intentar autenticación normal para admin/empresa/cliente
      const userCredential = await signInWithEmailAndPassword(auth, email, clave);
      const uid = userCredential.user.uid;

      const docRef = doc(db, "usuarios", uid);
      const docSnap = await getDoc(docRef);

      if (docSnap.exists()) {
        const rol = docSnap.data().rol;
        if (rol === "admin") navigate("/admin");
        else if (rol === "empresa") navigate("/empresa");
        else if (rol === "cliente") navigate("/cliente");
        else setError("Rol no válido o no autorizado.");
      } else {
        // 🔍 Si no está en "usuarios", buscar en "empleados"
        try {
          const empleadosQuery = query(
            collection(db, "empleados"),
            where("correo", "==", email)
          );
          const empleadosSnap = await getDocs(empleadosQuery);
      
          if (!empleadosSnap.empty) {
            const empleadoDoc = empleadosSnap.docs[0];
            const empleadoData = empleadoDoc.data();
      
            const storedPassword = empleadoData.defaultPassword;
      
            if (clave === storedPassword) {
              localStorage.setItem("empleadoCorreo", email);
              navigate("/empleado-canje");
              
            } else {
              setError("Contraseña incorrecta.");
            }
          } else {
            setError("No se encontró el perfil del usuario.");
          }
        } catch (error) {
          console.error("Error al validar empleado:", error);
          setError("Error al verificar empleado.");
        }
      }
      
    } catch (err) {
      // 👇 Si falla, buscar si es un empleado
      if (
        err.code === "auth/user-not-found" ||
        err.code === "auth/invalid-credential"
      ) {
        try {
          const empleadosQuery = query(
            collection(db, "empleados"),
            where("correo", "==", email)
          );
          const empleadosSnap = await getDocs(empleadosQuery);

          if (!empleadosSnap.empty) {
            const empleadoDoc = empleadosSnap.docs[0];
            const empleadoData = empleadoDoc.data();
            const storedPassword = empleadoData.defaultPassword;

            if (clave === storedPassword) {
              // ✅ Simular sesión
              localStorage.setItem("empleadoCorreo", email);

              if (!empleadoData.passwordChanged) {
                navigate("/cambiarcontraseña");
              } else {
                navigate("/empleado-canje");
              }
            } else {
              setError("Contraseña incorrecta.");
            }
          } else {
            setError("El usuario no existe.");
          }
        } catch (e) {
          console.error("Error al validar empleado:", e);
          setError("Error al intentar iniciar sesión.");
        }
      } else if (err.code === "auth/wrong-password") {
        setError("Contraseña incorrecta.");
      } else {
        setError("Correo o contraseña inválidos.");
      }
    }
  };

  return (
    <div className="min-h-screen bg-[#FFF4EC] flex items-center justify-center px-4">
      <div className="bg-white shadow-md p-8 rounded-xl w-full max-w-md">
        <h2 className="text-3xl font-bold text-orange-600 mb-4 text-center">Iniciar Sesión</h2>
        {error && <p className="text-red-500 mb-4 text-sm text-center">{error}</p>}
        <form onSubmit={handleLogin} className="space-y-4">
          <div>
            <label className="block text-sm text-gray-700 mb-1">Correo electrónico</label>
            <input
              type="email"
              className="w-full border border-orange-300 rounded-lg px-4 py-2"
              placeholder="ejemplo@correo.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />
          </div>

          <div>
            <label className="block text-sm text-gray-700 mb-1">Contraseña</label>
            <input
              type="password"
              className="w-full border border-orange-300 rounded-lg px-4 py-2"
              placeholder="Tu contraseña"
              value={clave}
              onChange={(e) => setClave(e.target.value)}
              required
            />
          </div>

          <button
            type="submit"
            className="w-full bg-orange-500 hover:bg-orange-600 text-white font-semibold py-2 px-4 rounded-lg transition"
          >
            Iniciar sesión
          </button>
        </form>
      </div>
    </div>
  );
};

export default Login;