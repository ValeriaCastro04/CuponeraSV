import { useState, useEffect } from "react";
import {
  collection,
  getDocs,
  addDoc,
  doc,
  setDoc,
  deleteDoc
} from "firebase/firestore";
import { createUserWithEmailAndPassword } from "firebase/auth";
import EmpresaForm from "../../components/admin/EmpresaForm";
import { toast } from "react-toastify";
import { db, secondaryAuth } from "../../services/firebase"; // 👈 USAMOS secondaryAuth
import { sendPasswordEmail } from "../../utils/sendEmail";

const generarContraseñaTemporal = () => {
  const caracteres = "abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789";
  let pass = "";
  for (let i = 0; i < 10; i++) {
    pass += caracteres.charAt(Math.floor(Math.random() * caracteres.length));
  }
  return pass;
};

const EmpresasAdmin = () => {
  const [empresas, setEmpresas] = useState([]);
  const [rubros, setRubros] = useState([]);
  const [editData, setEditData] = useState(null);

  const cargarEmpresas = async () => {
    try {
      const snap = await getDocs(collection(db, "empresas"));
      setEmpresas(snap.docs.map((doc) => ({ id: doc.id, ...doc.data() })));
    } catch (err) {
      console.error("Error al cargar empresas:", err);
      toast.error("No se pudieron cargar las empresas");
    }
  };

  const cargarRubros = async () => {
    try {
      const snap = await getDocs(collection(db, "rubros"));
      setRubros(snap.docs.map((doc) => ({ id: doc.id, ...doc.data() })));
    } catch (err) {
      console.error("Error al cargar rubros:", err);
      toast.error("No se pudieron cargar los rubros");
    }
  };

  useEffect(() => {
    cargarEmpresas();
    cargarRubros();
  }, []);

  const guardarEmpresa = async (empresa) => {
    const contraseñaTemporal = generarContraseñaTemporal();

    try {
      // ✅ Crear usuario usando la instancia secundaria
      const userCredential = await createUserWithEmailAndPassword(
        secondaryAuth,
        empresa.correo,
        contraseñaTemporal
      );

      const nuevoUID = userCredential.user.uid;

      // ✅ Crear documento del usuario con rol empresa
      await setDoc(doc(db, "usuarios", nuevoUID), {
        correo: empresa.correo,
        nombre: empresa.nombre,
        rol: "empresa",
        primerLogin: true
      });

      // ✅ Guardar en colección de empresas
      await addDoc(collection(db, "empresas"), empresa);

      // ✅ Enviar correo con contraseña
      await sendPasswordEmail(empresa.correo, empresa.nombre, contraseñaTemporal);

      toast.success("Empresa registrada y correo enviado");
      cargarEmpresas();
    } catch (err) {
      if (err.code === "auth/email-already-in-use") {
        toast.error("Este correo ya está registrado");
      } else {
        console.error("Error al registrar empresa:", err);
        toast.error("Hubo un error al registrar la empresa");
      }
    }
  };

  const eliminarEmpresa = async (id) => {
    if (confirm("¿Seguro que deseas eliminar esta empresa?")) {
      try {
        await deleteDoc(doc(db, "empresas", id));
        toast.success("Empresa eliminada");
        cargarEmpresas();
      } catch (err) {
        console.error("Error al eliminar empresa:", err);
        toast.error("No se pudo eliminar la empresa");
      }
    }
  };

  return (
    <div className="p-6 w-full">
      <EmpresaForm
        onSubmit={guardarEmpresa}
        rubros={rubros}
        initialData={editData}
      />

      <h2 className="text-xl font-bold mb-4">Empresas Registradas</h2>

      <div className="grid gap-4">
        {empresas.map((empresa) => (
          <div
            key={empresa.id}
            className="p-4 bg-white rounded shadow flex justify-between items-center"
          >
            <div>
              <p className="font-bold">
                {empresa.nombre} ({empresa.codigo})
              </p>
              <p>
                {empresa.rubro} • {empresa.contacto} • {empresa.telefono}
              </p>
            </div>
            <div className="flex gap-2">
              <button
                onClick={() => setEditData(empresa)}
                className="text-blue-600 hover:underline"
              >
                Editar
              </button>
              <button
                onClick={() => eliminarEmpresa(empresa.id)}
                className="text-red-600 hover:underline"
              >
                Eliminar
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default EmpresasAdmin;