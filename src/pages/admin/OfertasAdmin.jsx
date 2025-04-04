import { useEffect, useState } from "react";
import {
  collection,
  getDocs,
  doc,
  updateDoc,
  getDoc,
  query,
  where
} from "firebase/firestore";
import { db } from "../../services/firebase";
import { toast } from "react-toastify";

const filtrosDisponibles = [
  { key: "espera", label: "En espera de aprobación" },
  { key: "futuras", label: "Aprobadas futuras" },
  { key: "activas", label: "Ofertas activas" },
  { key: "pasadas", label: "Ofertas pasadas" },
  { key: "rechazadas", label: "Rechazadas" },
  { key: "descartadas", label: "Descartadas" }
];

const OfertasAdmin = () => {
  const [ofertasPorEmpresa, setOfertasPorEmpresa] = useState({});
  const [empresas, setEmpresas] = useState({});
  const [filtroActivo, setFiltroActivo] = useState("espera");
  const [empresaSeleccionada, setEmpresaSeleccionada] = useState("todas");

  // 🔁 Función para cargar las ofertas actualizada
  const cargarOfertas = async (empresasMap = {}) => {
    try {
      const snapshot = await getDocs(collection(db, "ofertas"));
      const agrupadas = {};

      for (const docSnap of snapshot.docs) {
        const data = docSnap.data();
        const empresaId = data.empresaId;
        const nombreEmpresa = empresasMap[empresaId] || "Empresa desconocida";
        const porcentajeComision = 0;

        if (!agrupadas[empresaId]) {
          agrupadas[empresaId] = {
            nombre: nombreEmpresa,
            porcentajeComision,
            ofertas: {
              espera: [],
              futuras: [],
              activas: [],
              pasadas: [],
              rechazadas: [],
              descartadas: []
            }
          };
        }

        const ahora = new Date();
        const estado = data.estado;
        const inicio = data.fechaInicio?.toDate();
        const fin = data.fechaFin?.toDate();

        let categoria = "";
        if (estado === "En espera de aprobación") categoria = "espera";
        else if (estado === "Aprobada") {
          if (inicio > ahora) categoria = "futuras";
          else if (fin >= ahora) categoria = "activas";
          else categoria = "pasadas";
        } else if (estado === "Rechazada") categoria = "rechazadas";
        else if (estado === "Descartada") categoria = "descartadas";

        agrupadas[empresaId].ofertas[categoria].push({
          id: docSnap.id,
          ...data
        });
      }

      setOfertasPorEmpresa(agrupadas);
    } catch (error) {
      toast.error("Error al cargar las ofertas");
    }
  };

  useEffect(() => {
    const cargarTodo = async () => {
      const q = query(
        collection(db, "usuarios"),
        where("rol", "==", "empresa")
      );
      const snapshot = await getDocs(q);
      const empresasData = {};
      snapshot.forEach((doc) => {
        empresasData[doc.id] = doc.data().nombre;
      });
      setEmpresas(empresasData);
      await cargarOfertas(empresasData);
    };

    cargarTodo();
  }, []);

  const cambiarEstado = async (id, nuevoEstado, justificacion = "") => {
    try {
      const ofertaRef = doc(db, "ofertas", id);
      await updateDoc(ofertaRef, { estado: nuevoEstado, justificacion });
      toast.success(`Oferta ${nuevoEstado.toLowerCase()}`);
      await cargarOfertas(empresas); // ✅ Recargar ofertas automáticamente
    } catch (error) {
      toast.error("Error al actualizar estado");
    }
  };

  // Solo parte modificada dentro del renderOferta

const renderOferta = (oferta, empresa) => {
  const vendidos = oferta.cuponesVendidos || 0;
  const disponibles = oferta.cantidadCupones
    ? oferta.cantidadCupones - vendidos
    : "Ilimitado";
  const ingresos = vendidos * oferta.precioOferta;
  const cargo = (ingresos * empresa.porcentajeComision) / 100;

  return (
    <div
  key={oferta.id}
  className="border bg-white p-4 mb-3 rounded shadow text-sm"
>
    {oferta.imgURL ? (
      <img
        src={oferta.imgURL}
        alt={`Imagen de ${oferta.titulo}`}
        className="w-full h-48 object-cover rounded mb-3"
      />
    ) : (
      <div className="w-full h-48 bg-gray-200 rounded mb-3 flex items-center justify-center text-gray-500 text-sm italic">
        Imagen no disponible
      </div>
    )}

  <h4 className="font-bold text-base">{oferta.titulo}</h4>
  <p className="mb-2">{oferta.descripcion}</p>

  {filtroActivo === "espera" && (
    <div className="mb-2 text-gray-700">
      <p><strong>Dirección:</strong> {oferta.direccion}</p>
      <p><strong>Contacto:</strong> {oferta.nombreContacto}</p>
      <p><strong>Teléfono:</strong> {oferta.telefono}</p>
      <p><strong>Correo electrónico:</strong> {oferta.correo}</p>
      <p><strong>Rubro:</strong> {oferta.rubro}</p>
      <p><strong>Precio regular:</strong> ${oferta.precioRegular}</p>
      <p><strong>Precio oferta:</strong> ${oferta.precioOferta}</p>
      <p><strong>Fecha inicio:</strong> {oferta.fechaInicio?.toDate().toLocaleDateString()}</p>
      <p><strong>Fecha fin:</strong> {oferta.fechaFin?.toDate().toLocaleDateString()}</p>
    </div>
  )}

  <p><strong>Vendidos:</strong> {vendidos}</p>
  <p><strong>Disponibles:</strong> {disponibles}</p>
  <p><strong>Ingresos:</strong> ${ingresos.toFixed(2)}</p>
  <p><strong>Cargo por servicio:</strong> ${cargo.toFixed(2)}</p>

  {filtroActivo === "espera" && (
    <div className="mt-2 flex gap-2">
      <button
        onClick={() => cambiarEstado(oferta.id, "Aprobada")}
        className="bg-green-500 text-white px-4 py-1 rounded"
      >
        Aprobar
      </button>
      <button
        onClick={() => {
          const justificacion = prompt("Justificación del rechazo:");
          if (justificacion)
            cambiarEstado(oferta.id, "Rechazada", justificacion);
        }}
        className="bg-red-500 text-white px-4 py-1 rounded"
      >
        Rechazar
      </button>
    </div>
  )}
</div>

  );
};


  return (
    <div className="ml-10 max-w-6xl mx-auto p-6">
      <h1 className="text-3xl font-bold text-[#4B59E4] mb-6">
        Gestor de Ofertas
      </h1>

      <div className="flex flex-wrap gap-3 mb-6">
        {filtrosDisponibles.map(({ key, label }) => (
          <button
            key={key}
            onClick={() => setFiltroActivo(key)}
            className={`px-4 py-2 rounded-full font-medium ${
              filtroActivo === key
                ? "bg-[#4B59E4] text-white"
                : "bg-gray-200 text-gray-800"
            }`}
          >
            {label}
          </button>
        ))}
      </div>

      <div className="mb-6">
        <label className="font-medium mr-2">Filtrar por empresa:</label>
        <select
          value={empresaSeleccionada}
          onChange={(e) => setEmpresaSeleccionada(e.target.value)}
          className="p-2 border rounded"
        >
          <option value="todas">Todas</option>
          {Object.entries(empresas).map(([id, nombre]) => (
            <option key={id} value={id}>
              {nombre}
            </option>
          ))}
        </select>
      </div>

      {Object.entries(ofertasPorEmpresa)
        .filter(
          ([id, empresa]) =>
            (empresaSeleccionada === "todas" || empresaSeleccionada === id) &&
            empresa.ofertas[filtroActivo]?.length > 0
        )
        .map(([id, empresa]) => (
          <div key={id} className="mb-10">
            {empresaSeleccionada === "todas" && (
              <h2 className="text-lg font-bold text-[#ED8294] mb-2">
                {empresas[id] || "Empresa"}
              </h2>
            )}
            {empresa.ofertas[filtroActivo].map((oferta) =>
              renderOferta(oferta, empresa)
            )}
          </div>
        ))}

      {Object.entries(ofertasPorEmpresa).every(
        ([id, empresa]) =>
          (empresaSeleccionada === "todas" || empresaSeleccionada === id) &&
          empresa.ofertas[filtroActivo]?.length === 0
      ) && (
        <p className="text-gray-500 mb-4 mt-4">
          No hay ofertas en esta categoría para mostrar.
        </p>
      )}
    </div>
  );
};

export default OfertasAdmin;