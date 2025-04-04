import { useEffect, useState } from "react";
import {
  collection,
  addDoc,
  getDocs,
  doc,
  updateDoc,
  deleteDoc,
  query,
  where,
  getFirestore,
  setDoc
} from "firebase/firestore";
import { getAuth, createUserWithEmailAndPassword } from "firebase/auth";
import { secondaryAuth } from "../../services/firebase";
import { toast } from "react-toastify";
import { sendPasswordEmail } from "../../utils/sendEmail"; 

const GestionarEmpleados = () => {
  const [empleados, setEmpleados] = useState([]);
  const [form, setForm] = useState({ nombres: "", apellidos: "", correo: "" });
  const [editandoId, setEditandoId] = useState(null);

  const db = getFirestore();
  const auth = getAuth();

  const generateTemporaryPassword = (length = 8) => {
    const chars = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";
    return Array.from({ length }, () => chars[Math.floor(Math.random() * chars.length)]).join('');
  };

  const obtenerEmpleados = async () => {
    try {
      const empresasSnapshot = await getDocs(collection(db, "empresas"));
      const empresaDoc = empresasSnapshot.docs.find(
        (doc) => doc.data().correo === auth.currentUser.email
      );

      if (!empresaDoc) {
        toast.error("Empresa no encontrada");
        return;
      }

      const empresaId = empresaDoc.id;

      const empleadosRef = collection(db, "empleados");
      const q = query(empleadosRef, where("empresaId", "==", empresaId));
      const snapshot = await getDocs(q);

      const empleadosData = snapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
      }));

      setEmpleados(empleadosData);
    } catch (error) {
      console.error("Error al obtener empleados:", error);
    }
  };

  useEffect(() => {
    obtenerEmpleados();
  }, []);

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
  
    try {
      if (editandoId) {
        await updateDoc(doc(db, "empleados", editandoId), form);
        toast.success("Empleado actualizado correctamente");
        setEditandoId(null);
      } else {
        const empresasSnapshot = await getDocs(collection(db, "empresas"));
        const empresaDoc = empresasSnapshot.docs.find(
          (doc) => doc.data().correo === auth.currentUser.email
        );
  
        if (!empresaDoc) {
          toast.error("No se encontró la empresa asociada.");
          return;
        }
  
        const empresaFirestoreId = empresaDoc.id;
        const tempPassword = generateTemporaryPassword();
  
        // ✅ Crear empleado en Firebase Auth usando secondaryAuth
        const userCredential = await createUserWithEmailAndPassword(
          secondaryAuth,
          form.correo,
          tempPassword
        );
  
        const empleadoUID = userCredential.user.uid;
  
        await setDoc(doc(db, "empleados", empleadoUID), {
          ...form,
          empresaId: empresaFirestoreId,
          passwordChanged: false,
          defaultPassword: tempPassword, // 👈 esta es la que luego se usará para login manual
        });
  
        // ✅ Enviar correo con la contraseña
        await sendPasswordEmail(form.correo, tempPassword);
  
        toast.success("Empleado registrado y correo enviado correctamente");
  
        // ✅ Cerrar sesión secundaria (opcional, buena práctica)
        await secondaryAuth.signOut();
      }
  
      setForm({ nombres: "", apellidos: "", correo: "" });
      obtenerEmpleados();
    } catch (error) {
      console.error("Error al registrar empleado:", error);
  
      if (error.code === "auth/email-already-in-use") {
        toast.error("Este correo ya está registrado.");
      } else {
        toast.error("Hubo un error al registrar el empleado.");
      }
    }
  };
  

  const handleEditar = (empleado) => {
    setForm({
      nombres: empleado.nombres,
      apellidos: empleado.apellidos,
      correo: empleado.correo,
    });
    setEditandoId(empleado.id);
  };

  const handleEliminar = async (id) => {
    try {
      await deleteDoc(doc(db, "empleados", id));
      toast.success("Empleado eliminado");
      obtenerEmpleados();
    } catch (error) {
      console.error("Error al eliminar empleado:", error);
      toast.error("No se pudo eliminar el empleado");
    }
  };

  return (
    <div className="ml-64 p-6 min-h-screen bg-[#FFF4EC]">
      <h2 className="text-2xl font-bold text-[#4B59E4] mb-2">Gestión de Empleados</h2>

      <form
        onSubmit={handleSubmit}
        className="bg-white shadow p-6 rounded-lg grid grid-cols-1 md:grid-cols-3 gap-4"
      >
        <input
          type="text"
          name="nombres"
          placeholder="Nombres"
          value={form.nombres}
          onChange={handleChange}
          required
          className="border border-gray-300 rounded px-4 py-2"
        />
        <input
          type="text"
          name="apellidos"
          placeholder="Apellidos"
          value={form.apellidos}
          onChange={handleChange}
          required
          className="border border-gray-300 rounded px-4 py-2"
        />
        <input
          type="email"
          name="correo"
          placeholder="Correo electrónico"
          value={form.correo}
          onChange={handleChange}
          required
          className="border border-gray-300 rounded px-4 py-2"
        />
        <button
          type="submit"
          className="col-span-full bg-[#4B59E4] text-white py-2 rounded hover:bg-blue-700"
        >
          {editandoId ? "Actualizar Empleado" : "Registrar Empleado"}
        </button>
      </form>

      <div className="mt-8">
        <h3 className="text-xl font-semibold mb-4">Empleados Registrados</h3>
        {empleados.length === 0 ? (
          <p className="text-gray-500">No hay empleados registrados.</p>
        ) : (
          <ul className="space-y-4">
            {empleados.map((emp) => (
              <li
                key={emp.id}
                className="bg-white p-4 rounded shadow flex justify-between items-center"
              >
                <div>
                  <p className="font-bold">
                    {emp.nombres} {emp.apellidos}
                  </p>
                  <p className="text-sm text-gray-600">{emp.correo}</p>
                </div>
                <div className="space-x-2">
                  <button
                    onClick={() => handleEditar(emp)}
                    className="text-blue-600 hover:underline"
                  >
                    Editar
                  </button>
                  <button
                    onClick={() => handleEliminar(emp.id)}
                    className="text-red-600 hover:underline"
                  >
                    Eliminar
                  </button>
                </div>
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  );
};

export default GestionarEmpleados;