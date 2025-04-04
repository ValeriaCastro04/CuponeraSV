import { useEffect, useState } from "react";
import { db } from "../../services/firebase";
import { collection, getDocs, query, where } from "firebase/firestore";
import { useNavigate } from "react-router-dom";
import { jsPDF } from "jspdf"; // ✅ Importación correcta
import { toast } from "react-toastify";
import { descargarPDF } from "../../utils/descargarPDF";

const MisCupones = () => {
  const [cupones, setCupones] = useState({ disponibles: [], canjeados: [], vencidos: [] });
  const [filtro, setFiltro] = useState("todos");
  const navigate = useNavigate();

  useEffect(() => {
    const obtenerCupones = async () => {
      const usuario = JSON.parse(localStorage.getItem("usuarioLogueado"));
      if (!usuario) return navigate("/user-login");

      const snapshot = await getDocs(
        query(collection(db, "CuponesComprados"), where("userId", "==", usuario.uid))
      );

      const ahora = new Date();
      const nuevos = { disponibles: [], canjeados: [], vencidos: [] };

      snapshot.docs.forEach((doc) => {
        const datos = doc.data();
        const fechaUso = datos.fechaUso;
        const vencimiento = datos.fecha_limite_cupon?.seconds
          ? new Date(datos.fecha_limite_cupon.seconds * 1000)
          : null;

        if (fechaUso) nuevos.canjeados.push({ id: doc.id, ...datos });
        else if (vencimiento && vencimiento < ahora) nuevos.vencidos.push({ id: doc.id, ...datos });
        else nuevos.disponibles.push({ id: doc.id, ...datos });
      });

      setCupones(nuevos);
    };

    obtenerCupones();
  }, [navigate]);

  const renderCupones = (lista, tipo) => (
    <div>
      <h2 className="text-xl font-bold text-[#4B59E4] mt-6 mb-3 capitalize">{tipo}</h2>
      {lista.length === 0 ? (
        <p className="text-gray-500">No hay cupones {tipo}.</p>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {lista.map((cupon) => (
            <div key={cupon.id} className="bg-white p-4 border rounded shadow">
              <h3 className="font-bold">{cupon.titulo}</h3>
              <p className="text-sm">{cupon.descripcion}</p>
              <p className="text-sm text-gray-600">Código: {cupon.codigo}</p>
              <p className="text-sm text-gray-600">
                Válido hasta:{" "}
                {new Date(cupon.fecha_limite_cupon.seconds * 1000).toLocaleDateString()}
              </p>
              {tipo === "disponibles" && (
                <button
                  onClick={() => descargarPDF(cupon)}
                  className="mt-2 bg-[#4B59E4] text-white px-3 py-1 rounded hover:bg-blue-700"
                >
                  Descargar PDF
                </button>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );

  return (
    <div className="container mx-auto p-6">
      <h1 className="text-3xl font-bold text-center text-[#4B59E4] mb-6">Mis Cupones</h1>

      {/* 🔹 Filtros de visualización */}
      <div className="flex justify-center gap-4 mb-6">
        {["todos", "disponibles", "canjeados", "vencidos"].map((tipo) => (
          <button
            key={tipo}
            className={`px-4 py-2 rounded-full border font-medium ${
              filtro === tipo
                ? "bg-[#4B59E4] text-white"
                : "bg-gray-200 text-gray-700 hover:bg-gray-300"
            }`}
            onClick={() => setFiltro(tipo)}
          >
            {tipo.charAt(0).toUpperCase() + tipo.slice(1)}
          </button>
        ))}
      </div>

      {/* 🔹 Visualización de cupones según filtro */}
      {filtro === "todos" && (
        <>
          {renderCupones(cupones.disponibles, "disponibles")}
          {renderCupones(cupones.canjeados, "canjeados")}
          {renderCupones(cupones.vencidos, "vencidos")}
        </>
      )}
      {filtro !== "todos" && renderCupones(cupones[filtro], filtro)}
    </div>
  );
};

export default MisCupones;