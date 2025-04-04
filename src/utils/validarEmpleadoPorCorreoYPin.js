import { collection, query, where, getDocs } from "firebase/firestore";
import { db } from "../services/firebase";

export const validarEmpleadoPorCorreoYPin = async (correo, pin) => {
  const q = query(collection(db, "empleados"), where("correo", "==", correo));
  const snapshot = await getDocs(q);

  if (snapshot.empty) return { valido: false, mensaje: "Empleado no encontrado." };

  const empleado = snapshot.docs[0].data();
  if (empleado.pin == pin) {
    return { valido: true, empleado };
  } else {
    return { valido: false, mensaje: "PIN incorrecto." };
  }
};
