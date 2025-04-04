import { useEffect, useState } from "react";
import {
  collection,
  query,
  where,
  getDocs,
  updateDoc,
  doc,
  Timestamp,
} from "firebase/firestore";
import { db } from "../services/firebase";
import { toast } from "react-toastify";
import { useNavigate } from "react-router-dom";

const EmpleadoCanje = () => {
  const [codigo, setCodigo] = useState("");
  const [dui, setDui] = useState("");
  const [cupón, setCupon] = useState(null);
  const [empresaIdEmpleado, setEmpresaIdEmpleado] = useState(null);
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const correoEmpleado = localStorage.getItem("empleadoCorreo");

  const cargarEmpresaEmpleado = async () => {
    try {
      const q = query(
        collection(db, "empleados"),
        where("correo", "==", correoEmpleado)
      );
      const snap = await getDocs(q);

      if (!snap.empty) {
        const data = snap.docs[0].data();
        setEmpresaIdEmpleado(data.empresaId);
      } else {
        toast.error("No se encontró información del empleado.");
      }
    } catch (error) {
      console.error("Error al cargar empresa:", error);
    }
  };

  useEffect(() => {
    if (correoEmpleado) {
      cargarEmpresaEmpleado();
    }
  }, [correoEmpleado]);

  const normalizeDui = (d) => {
    if (!d || typeof d !== "string") return "";
    return d.replace(/\s+/g, "").replace(/-/g, "");
  };

  const handleBuscar = async () => {
    setCupon(null);
    setLoading(true);

    try {
      const q = query(
        collection(db, "CuponesComprados"),
        where("codigo", "==", codigo)
      );
      const snap = await getDocs(q);

      if (snap.empty) {
        toast.error("Cupón no encontrado.");
        setLoading(false);
        return;
      }

      const docCupon = snap.docs[0];
      const data = docCupon.data();

      if (!data.dui) {
        toast.error("Este cupón no tiene DUI registrado.");
        setLoading(false);
        return;
      }

      if (data.canjeado) {
        toast.error("Este cupón ya fue canjeado.");
        setLoading(false);
        return;
      }

      if (normalizeDui(data.dui) !== normalizeDui(dui)) {
        toast.error("El DUI no coincide con el del comprador.");
        setLoading(false);
        return;
      }

      if (data.empresaId !== empresaIdEmpleado) {
        toast.error("Este cupón no pertenece a tu empresa.");
        setLoading(false);
        return;
      }

      setCupon({ id: docCupon.id, ...data });
      toast.success("Cupón válido. Listo para canjear.");
    } catch (error) {
      console.error("Error al validar el cupón:", error);
      toast.error("Error al validar el cupón.");
    } finally {
      setLoading(false);
    }
  };

  const handleCanjear = async () => {
    if (!cupón) return;

    try {
      const cuponRef = doc(db, "CuponesComprados", cupón.id);
      await updateDoc(cuponRef, {
        canjeado: true,
        fechaCanje: Timestamp.now(),
        canjeadoPor: correoEmpleado,
        estado: "canjeado",
      });

      toast.success("Cupón canjeado exitosamente.");
      setCupon(null);
      setCodigo("");
      setDui("");
    } catch (error) {
      console.error("Error al canjear cupón:", error);
      toast.error("No se pudo canjear el cupón.");
    }
  };

  const handleLogout = () => {
    localStorage.removeItem("empleadoCorreo");
    navigate("/login");
  };

  return (
    <div className="min-h-screen bg-[#FFF4EC] flex flex-col items-center justify-center p-4">
      <div className="bg-white p-6 rounded-xl shadow-md w-full max-w-md space-y-4">
        <div className="flex justify-between items-center">
          <h2 className="text-2xl font-bold text-[#4B59E4]">
            Canje de Cupones
          </h2>
          <button
            onClick={handleLogout}
            className="text-sm text-red-500 hover:underline"
          >
            Cerrar sesión
          </button>
        </div>

        <input
          type="text"
          placeholder="Código del cupón"
          value={codigo}
          onChange={(e) => setCodigo(e.target.value)}
          className="w-full border border-gray-300 rounded-md px-4 py-2"
        />
        <input
          type="text"
          placeholder="DUI del comprador (ej. 12345678-9)"
          value={dui}
          onChange={(e) => setDui(e.target.value)}
          className="w-full border border-gray-300 rounded-md px-4 py-2"
        />

        <button
          onClick={handleBuscar}
          disabled={loading || !codigo || !dui}
          className="w-full bg-[#4B59E4] hover:bg-[#3c48d1] text-white font-semibold py-2 px-4 rounded-md"
        >
          {loading ? "Buscando..." : "Validar cupón"}
        </button>

        {cupón && (
          <div className="bg-gray-100 p-4 rounded-md mt-4">
            <h3 className="font-bold text-lg text-green-700">Cupón válido</h3>
            <p><strong>Cliente:</strong> {cupón.correoCliente}</p>
            <p><strong>Título:</strong> {cupón.titulo}</p>
            <p><strong>Descripción:</strong> {cupón.descripcion}</p>
            <p><strong>Fecha de compra:</strong> {cupón.fecha_compra?.toDate().toLocaleDateString()}</p>

            <button
              onClick={handleCanjear}
              className="mt-4 bg-green-600 hover:bg-green-700 text-white font-semibold py-2 px-4 rounded-md w-full"
            >
              Canjear Cupón
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

export default EmpleadoCanje;