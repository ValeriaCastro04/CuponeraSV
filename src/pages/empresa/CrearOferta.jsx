import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { db } from "../../services/firebase";
import { addDoc, collection, Timestamp } from "firebase/firestore";
import { auth } from "../../services/firebase";
import { toast } from "react-toastify";

const CrearOferta = () => {
  const [form, setForm] = useState({
    titulo: "",
    descripcion: "",
    precioRegular: "",
    precioOferta: "",
    fechaInicio: "",
    fechaFin: "",
    fechaLimiteUso: "",
    cantidadCupones: "",
    otrosDetalles: "",
    rubro: "",
    imgURL: ""
  });

  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    const {
      titulo,
      descripcion,
      precioRegular,
      precioOferta,
      fechaInicio,
      fechaFin,
      fechaLimiteUso
    } = form;

    if (
      !titulo ||
      !descripcion ||
      !precioRegular ||
      !precioOferta ||
      !fechaInicio ||
      !fechaFin ||
      !fechaLimiteUso
    ) {
      toast.error("Por favor completa todos los campos requeridos.");
      return;
    }

    try {
      setLoading(true);

      await addDoc(collection(db, "ofertas"), {
        ...form,
        precioRegular: parseFloat(form.precioRegular),
        precioOferta: parseFloat(form.precioOferta),
        cantidadCupones: form.cantidadCupones
          ? parseInt(form.cantidadCupones)
          : null,
        fechaInicio: Timestamp.fromDate(new Date(form.fechaInicio)),
        fechaFin: Timestamp.fromDate(new Date(form.fechaFin)),
        fechaLimiteUso: Timestamp.fromDate(new Date(form.fechaLimiteUso)),
        estado: "En espera de aprobación",
        empresaId: auth.currentUser.uid,
        fechaCreacion: Timestamp.now()
      });

      toast.success("Oferta creada correctamente.");
      navigate("/empresa/ofertas");
    } catch (error) {
      console.error("Error al crear oferta:", error);
      toast.error("Hubo un error al registrar la oferta.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto bg-white p-8 rounded-lg shadow mt-4 ml-100">
      <h2 className="text-2xl font-bold text-[#4B59E4] mb-6">
        Crear Nueva Oferta
      </h2>
            <form className="grid grid-cols-1 md:grid-cols-2 gap-4" onSubmit={handleSubmit}>
        {/* Título de la oferta */}
        <div className="flex flex-col">
            <label className="font-medium text-gray-700 mb-1">Título de la oferta</label>
            <input
            name="titulo"
            onChange={handleChange}
            value={form.titulo}
            className="border p-2 rounded"
            required
            />
        </div>

        {/* Rubro */}
        <div className="flex flex-col">
            <label className="font-medium text-gray-700 mb-1">Rubro (ej. Restaurantes)</label>
            <input
            name="rubro"
            onChange={handleChange}
            value={form.rubro}
            className="border p-2 rounded"
            required
            />
        </div>

        {/* Precio regular */}
        <div className="flex flex-col">
            <label className="font-medium text-gray-700 mb-1">Precio regular ($)</label>
            <input
            name="precioRegular"
            onChange={handleChange}
            value={form.precioRegular}
            type="number"
            className="border p-2 rounded"
            required
            />
        </div>

        {/* Precio de oferta */}
        <div className="flex flex-col">
            <label className="font-medium text-gray-700 mb-1">Precio con descuento ($)</label>
            <input
            name="precioOferta"
            onChange={handleChange}
            value={form.precioOferta}
            type="number"
            className="border p-2 rounded"
            required
            />
        </div>

        {/* Fecha inicio */}
        <div className="flex flex-col">
            <label className="font-medium text-gray-700 mb-1">📅 Fecha de inicio de venta</label>
            <input
            name="fechaInicio"
            onChange={handleChange}
            value={form.fechaInicio}
            type="date"
            className="border p-2 rounded"
            required
            />
        </div>

        {/* Fecha fin */}
        <div className="flex flex-col">
            <label className="font-medium text-gray-700 mb-1">📅 Fecha fin de venta</label>
            <input
            name="fechaFin"
            onChange={handleChange}
            value={form.fechaFin}
            type="date"
            className="border p-2 rounded"
            required
            />
        </div>

        {/* Fecha límite para usar */}
        <div className="flex flex-col">
            <label className="font-medium text-gray-700 mb-1">⏳ Fecha límite para usar el cupón</label>
            <input
            name="fechaLimiteUso"
            onChange={handleChange}
            value={form.fechaLimiteUso}
            type="date"
            className="border p-2 rounded"
            required
            />
        </div>

        {/* Cantidad límite */}
        <div className="flex flex-col">
            <label className="font-medium text-gray-700 mb-1">Cantidad límite de cupones (opcional)</label>
            <input
            name="cantidadCupones"
            onChange={handleChange}
            value={form.cantidadCupones}
            type="number"
            className="border p-2 rounded"
            />
        </div>

        {/* URL imagen */}
        <div className="flex flex-col col-span-2">
            <label className="font-medium text-gray-700 mb-1">URL de imagen</label>
            <input
            name="imgURL"
            onChange={handleChange}
            value={form.imgURL}
            className="border p-2 rounded"
            />
        </div>

        {/* Descripción */}
        <div className="flex flex-col col-span-2">
            <label className="font-medium text-gray-700 mb-1">Descripción de la oferta</label>
            <textarea
            name="descripcion"
            onChange={handleChange}
            value={form.descripcion}
            className="border p-2 rounded"
            required
            />
        </div>

        {/* Otros detalles */}
        <div className="flex flex-col col-span-2">
            <label className="font-medium text-gray-700 mb-1">Otros detalles (opcional)</label>
            <textarea
            name="otrosDetalles"
            onChange={handleChange}
            value={form.otrosDetalles}
            className="border p-2 rounded"
            />
        </div>

        {/* Botón */}
        <button
            type="submit"
            disabled={loading}
            className="bg-[#4B59E4] text-white py-2 px-6 rounded hover:bg-blue-800 col-span-2"
        >
            {loading ? "Guardando..." : "Guardar Oferta"}
        </button>
        </form>


    </div>
  );
};

export default CrearOferta;