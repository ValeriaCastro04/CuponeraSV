import { useState, useEffect } from "react";
import { db } from "../../services/firebase";
import {
  collection,
  addDoc,
  getDocs,
  updateDoc,
  deleteDoc,
  doc
} from "firebase/firestore";
import RubroForm from "../../components/admin/RubroForm";
import { toast } from "react-toastify";

const RubrosAdmin = () => {
  const [rubros, setRubros] = useState([]);
  const [editData, setEditData] = useState(null);

  const cargarRubros = async () => {
    try {
      const snap = await getDocs(collection(db, "rubros"));
      setRubros(snap.docs.map((d) => ({ id: d.id, ...d.data() })));
    } catch (err) {
      console.error("Error al cargar rubros:", err);
      toast.error("No se pudieron cargar los rubros");
    }
  };

  useEffect(() => {
    cargarRubros();
  }, []);

  const guardarRubro = async (rubro) => {
    if (!rubro.nombre.trim()) {
      toast.error("El nombre del rubro no puede estar vacío");
      return;
    }

    const nombreLower = rubro.nombre.trim().toLowerCase();

    const duplicado = rubros.some(
      (r) =>
        r.nombre.trim().toLowerCase() === nombreLower &&
        (!editData || r.id !== editData.id)
    );

    if (duplicado) {
      toast.warning("Este rubro ya existe");
      return;
    }

    try {
      if (editData) {
        await updateDoc(doc(db, "rubros", editData.id), rubro);
        toast.success("Rubro actualizado");
      } else {
        await addDoc(collection(db, "rubros"), rubro);
        toast.success("Rubro creado");
      }
      setEditData(null);
      cargarRubros();
    } catch (err) {
      console.error("Error al guardar el rubro:", err);
      toast.error("No se pudo guardar el rubro");
    }
  };

  const eliminarRubro = async (id) => {
    if (confirm("¿Seguro que deseas eliminar este rubro?")) {
      try {
        await deleteDoc(doc(db, "rubros", id));
        toast.success("Rubro eliminado");
        cargarRubros();
      } catch (err) {
        console.error("Error al eliminar rubro:", err);
        toast.error("No se pudo eliminar el rubro");
      }
    }
  };

  return (
    <div className="p-6 w-full">
      <RubroForm onSubmit={guardarRubro} initialData={editData} />
      <h2 className="text-xl font-bold mb-4">Rubros Registrados</h2>
      <div className="grid gap-3">
        {rubros.map((rubro) => (
          <div
            key={rubro.id}
            className="p-4 bg-white rounded-xl shadow flex justify-between items-center"
          >
            <p className="text-lg font-medium text-[#333]">{rubro.nombre}</p>
            <div className="flex gap-3">
              <button
                onClick={() => setEditData(rubro)}
                className="text-blue-600 hover:underline"
              >
                Editar
              </button>
              <button
                onClick={() => eliminarRubro(rubro.id)}
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

export default RubrosAdmin;