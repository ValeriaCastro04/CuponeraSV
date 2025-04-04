import { useEffect, useState } from "react";
import {
  collection,
  getDocs,
  query,
  where,
  Timestamp,
  doc,
  getDoc
} from "firebase/firestore";
import { db, auth } from "../../services/firebase";
import { useAuth } from "../../contexts/AuthContext";

const OfertasEmpresa = () => {
  const { usuario } = useAuth();
  const [ofertas, setOfertas] = useState({
    espera: [],
    futuras: [],
    activas: [],
    pasadas: [],
    rechazadas: [],
    descartadas: []
  });
  const [empresa, setEmpresa] = useState(null);
  const [categoriaSeleccionada, setCategoriaSeleccionada] = useState("espera");

  useEffect(() => {
    if (!usuario) return;
    const cargarOfertas = async () => {
      try {
        const empresaDoc = await getDoc(doc(db, "usuarios", usuario.uid));
        const datosEmpresa = empresaDoc.data();
        setEmpresa(datosEmpresa);

        const q = query(collection(db, "ofertas"), where("empresaId", "==", usuario.uid));
        const snapshot = await getDocs(q);

        const ahora = Timestamp.now();

        const agrupadas = {
          espera: [],
          futuras: [],
          activas: [],
          pasadas: [],
          rechazadas: [],
          descartadas: []
        };

        snapshot.forEach((doc) => {
          const data = doc.data();
          const fechaInicio = data.fechaInicio;
          const fechaFin = data.fechaFin;
          const estado = data.estado;

          let categoria = "";

          if (estado === "En espera de aprobación") categoria = "espera";
          else if (estado === "Aprobada") {
            if (fechaInicio.toDate() > new Date()) categoria = "futuras";
            else if (fechaFin.toDate() >= new Date()) categoria = "activas";
            else categoria = "pasadas";
          } else if (estado === "Rechazada") categoria = "rechazadas";
          else if (estado === "Descartada") categoria = "descartadas";

          agrupadas[categoria].push({ id: doc.id, ...data });
        });

        setOfertas(agrupadas);
      } catch (err) {
        console.error("Error al cargar ofertas:", err);
      }
    };

    cargarOfertas();
  }, [usuario]);

  const renderOferta = (oferta) => {
    const vendidos = oferta.cuponesVendidos || 0;
    const disponibles = oferta.cantidadCupones ? oferta.cantidadCupones - vendidos : "Ilimitado";
    const ingresos = vendidos * oferta.precioOferta;
    const cargo = ingresos * (empresa?.porcentajeComision || 0) / 100;

    return (
      <div key={oferta.id} className="border p-4 rounded bg-white shadow-sm mb-4">
        <h3 className="font-bold text-[#4B59E4] text-lg">{oferta.titulo}</h3>
        <p>{oferta.descripcion}</p>
        <p><strong>Vendidos:</strong> {vendidos}</p>
        <p><strong>Disponibles:</strong> {disponibles}</p>
        <p><strong>Ingresos:</strong> ${ingresos.toFixed(2)}</p>
        <p><strong>Cargo por servicio:</strong> ${cargo.toFixed(2)}</p>
      </div>
    );
  };

  const categorias = {
    espera: "En espera de aprobación",
    futuras: "Aprobadas futuras",
    activas: "Ofertas activas",
    pasadas: "Ofertas pasadas",
    rechazadas: "Rechazadas",
    descartadas: "Descartadas"
  };

  return (
    <div className="max-w-6xl mx-auto p-6 ml-64">
      <h1 className="text-3xl font-bold text-[#4B59E4] mb-6">Mis Ofertas</h1>

      <div className="flex flex-wrap gap-3 mb-6">
        {Object.entries(categorias).map(([key, label]) => (
          <button
            key={key}
            onClick={() => setCategoriaSeleccionada(key)}
            className={`px-4 py-2 rounded-full text-sm font-medium border transition ${
              categoriaSeleccionada === key ? "bg-[#4B59E4] text-white" : "bg-white border-gray-300 hover:bg-gray-100"
            }`}
          >
            {label}
          </button>
        ))}
      </div>

      {ofertas[categoriaSeleccionada]?.length === 0 ? (
        <p className="text-gray-500">No hay ofertas en esta categoría.</p>
      ) : (
        ofertas[categoriaSeleccionada].map(renderOferta)
      )}
    </div>
  );
};

export default OfertasEmpresa;
