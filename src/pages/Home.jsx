import { useEffect, useState } from "react";
import { db } from "../services/firebase";
import { collection, getDocs } from "firebase/firestore";
import { useNavigate } from "react-router-dom";

const Home = () => {
  const [ofertas, setOfertas] = useState([]);
  const [rubros, setRubros] = useState([]);
  const [rubroSeleccionado, setRubroSeleccionado] = useState("");
  const navigate = useNavigate();

  useEffect(() => {
    const cargarRubros = async () => {
      const snapshot = await getDocs(collection(db, "rubros"));
      const rubrosData = snapshot.docs.map((doc) => doc.data().nombre);
      setRubros(rubrosData);
      setRubroSeleccionado(rubrosData[0] || "");
    };

    const cargarOfertasActivas = async () => {
      try {
        const snapshot = await getDocs(collection(db, "ofertas"));
        const ahora = new Date();

        const ofertasFiltradas = snapshot.docs
          .map((doc) => ({ id: doc.id, ...doc.data() }))
          .filter((oferta) => {
            const inicio = oferta.fechaInicio?.toDate?.();
            const fin = oferta.fechaFin?.toDate?.();

            return (
              oferta.estado === "Aprobada" &&
              inicio &&
              fin &&
              inicio <= ahora &&
              fin >= ahora
            );
          });

        setOfertas(ofertasFiltradas);
      } catch (error) {
        console.error("Error al obtener ofertas activas:", error);
      }
    };

    cargarRubros();
    cargarOfertasActivas();
  }, []);

  const formatearFecha = (fecha) => {
    return fecha.toLocaleDateString("es-ES", {
      year: "numeric",
      month: "long",
      day: "numeric",
    });
  };

  const handleComprarCupon = (id) => {
    const logueado = localStorage.getItem("usuarioLogueado");
    if (!logueado) {
      navigate("/user-login");
    } else {
      navigate(`/detalles-oferta/${id}`);
    }
  };

  const renderOfertas = () => {
    const porRubro = ofertas.filter((o) => o.rubro === rubroSeleccionado);

    if (porRubro.length === 0)
      return <p className="text-gray-600 mt-4">No hay cupones activos en esta categoría.</p>;

    return (
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 mt-6">
        {porRubro.map((oferta) => (
          <div
            key={oferta.id}
            className="border rounded-lg shadow-md p-4 bg-white"
          >
            <img
              src={oferta.imgURL}
              alt={oferta.titulo}
              className="w-full h-52 object-cover rounded-md mb-2"
            />
            <h3 className="text-xl font-semibold text-[#4B59E4]">
              {oferta.titulo}
            </h3>
            <p className="text-gray-700 mb-2">{oferta.descripcion}</p>
            <p className="text-red-500 font-bold text-lg">
              ${oferta.precioOferta.toFixed(2)}{" "}
              <span className="line-through text-gray-400 text-sm">
                ${oferta.precioRegular?.toFixed(2)}
              </span>
            </p>
            <p className="text-sm text-gray-600 mt-1">
              🛍 Compra hasta: {formatearFecha(oferta.fechaFin.toDate())}
            </p>
            <p className="text-sm text-gray-600">
              🕓 Usa hasta: {formatearFecha(oferta.fechaLimiteUso.toDate())}
            </p>
            <button
              onClick={() => handleComprarCupon(oferta.id)}
              className="mt-3 bg-[#4B59E4] hover:bg-blue-700 text-white px-4 py-2 rounded"
            >
              Comprar Cupón
            </button>
          </div>
        ))}
      </div>
    );
  };

  return (
    <div className="container mx-auto p-6">
      <h1 className="text-3xl font-bold text-[#4B59E4] text-center mb-4">
        Cupones disponibles
      </h1>

      <div className="flex flex-wrap justify-center gap-3">
        {rubros.map((rubro) => (
          <button
            key={rubro}
            className={`px-4 py-2 rounded-full font-medium ${
              rubroSeleccionado === rubro
                ? "bg-[#4B59E4] text-white"
                : "bg-gray-200 text-gray-700"
            }`}
            onClick={() => setRubroSeleccionado(rubro)}
          >
            {rubro}
          </button>
        ))}
      </div>

      {renderOfertas()}
    </div>
  );
};

export default Home;