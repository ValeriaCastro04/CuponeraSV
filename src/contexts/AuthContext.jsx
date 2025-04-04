import { createContext, useContext, useEffect, useState } from "react";
import { auth, db } from "../services/firebase";
import { onAuthStateChanged } from "firebase/auth";
import { doc, getDoc } from "firebase/firestore";

const AuthContext = createContext();

export function useAuth() {
  return useContext(AuthContext);
}

export function AuthProvider({ children }) {
  const [usuario, setUsuario] = useState(null);
  const [rol, setRol] = useState(null);
  const [primerLogin, setPrimerLogin] = useState(null); // ✅ NUEVO
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
            setPrimerLogin(data.primerLogin ?? false); // por si no existe el campo
          } else {
            console.warn("Usuario sin documento en Firestore.");
            setUsuario(user);
            setRol(null);
            setPrimerLogin(null);
          }
        } catch (error) {
          console.error("Error al obtener datos del usuario:", error);
        }
      } else {
        setUsuario(null);
        setRol(null);
        setPrimerLogin(null);
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