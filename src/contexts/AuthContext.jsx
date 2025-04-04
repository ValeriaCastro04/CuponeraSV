import { createContext, useContext, useEffect, useState } from "react";
import { auth, db } from "../services/firebase";
import { onAuthStateChanged } from "firebase/auth";
import {
  doc,
  getDoc,
  collection,
  query,
  where,
  getDocs,
} from "firebase/firestore";

const AuthContext = createContext();

export function useAuth() {
  return useContext(AuthContext);
}

export function AuthProvider({ children }) {
  const [usuario, setUsuario] = useState(null);
  const [rol, setRol] = useState(null);
  const [primerLogin, setPrimerLogin] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      if (user) {
        try {
          const docRef = doc(db, "usuarios", user.uid);
          const docSnap = await getDoc(docRef);

          if (docSnap.exists()) {
            const data = docSnap.data();
            setUsuario(user);
            setRol(data.rol);
            setPrimerLogin(data.primerLogin ?? false);
          } else {
            // Usuario autenticado, pero no está en "usuarios"
            setUsuario(user);
            setRol(null);
            setPrimerLogin(null);
          }
        } catch (error) {
          console.error("Error al obtener datos del usuario:", error);
        }
      } else {
        // ⚠️ No autenticado por Firebase, verificar sesión simulada de empleado
        const empleadoCorreo = localStorage.getItem("empleadoCorreo");

        if (empleadoCorreo) {
          try {
            const empleadosQuery = query(
              collection(db, "empleados"),
              where("correo", "==", empleadoCorreo)
            );
            const empleadosSnap = await getDocs(empleadosQuery);

            if (!empleadosSnap.empty) {
              const empleadoDoc = empleadosSnap.docs[0];
              const empleadoData = empleadoDoc.data();

              setUsuario({ email: empleadoCorreo }); // Simular usuario
              setRol("empleado");
              setPrimerLogin(false); // Para no disparar lógica de cambio de contraseña

            } else {
              setUsuario(null);
              setRol(null);
              setPrimerLogin(null);
            }
          } catch (error) {
            console.error("Error al buscar sesión simulada de empleado:", error);
            setUsuario(null);
            setRol(null);
            setPrimerLogin(null);
          }
        } else {
          setUsuario(null);
          setRol(null);
          setPrimerLogin(null);
        }
      }

      setLoading(false);
    });

    return unsubscribe;
  }, []);

  return (
    <AuthContext.Provider value={{ usuario, rol, primerLogin, loading }}>
      {!loading && children}
    </AuthContext.Provider>
  );
}