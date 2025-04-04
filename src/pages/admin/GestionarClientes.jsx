import { useEffect, useState } from "react";
import { db } from "../../services/firebase";
import { collection, getDocs, query, where } from "firebase/firestore";

const GestionarClientes = () => {
  const [clientes, setClientes] = useState([]);
  const [cuponesPorCliente, setCuponesPorCliente] = useState({});

  useEffect(() => {
    const obtenerDatos = async () => {
      try {
        const clientesSnap = await getDocs(collection(db, "clientes"));
        const clientesData = clientesSnap.docs.map((doc) => ({
          id: doc.id,
          ...doc.data(),
        }));

        setClientes(clientesData);

        // Obtener cupones por cliente
        const cuponesSnap = await getDocs(collection(db, "CuponesComprados"));
        const cuponesData = cuponesSnap.docs.map((doc) => ({
          id: doc.id,
          ...doc.data(),
        }));

        const agrupados = {};

        clientesData.forEach((cliente) => {
          agrupados[cliente.id] = {
            disponibles: [],
            canjeados: [],
            vencidos: [],
          };
        });

        const ahora = new Date();

        cuponesData.forEach((cupon) => {
          const userId = cupon.userId;
          const vencimiento = cupon.fecha_limite_cupon?.seconds
            ? new Date(cupon.fecha_limite_cupon.seconds * 1000)
            : null;

          if (!agrupados[userId]) return;

          if (cupon.canjeado) {
            agrupados[userId].canjeados.push(cupon);
          } else if (vencimiento && vencimiento < ahora) {
            agrupados[userId].vencidos.push(cupon);
          } else {
            agrupados[userId].disponibles.push(cupon);
          }
        });

        setCuponesPorCliente(agrupados);
      } catch (error) {
        console.error("Error al obtener datos de clientes o cupones:", error);
      }
    };

    obtenerDatos();
  }, []);

  return (
    <div className="ml-64 p-6 bg-[#FFF4EC] min-h-screen">
      <h1 className="text-2xl font-bold text-[#4B59E4] mb-6">Gestión de Clientes</h1>

      {clientes.length === 0 ? (
        <p className="text-gray-500">No hay clientes registrados.</p>
      ) : (
        clientes.map((cliente) => (
          <div
            key={cliente.id}
            className="bg-white p-6 rounded-lg shadow-md mb-6"
          >
            <h2 className="text-xl font-semibold mb-1">
              {cliente.nombres} {cliente.apellidos}
            </h2>
            <p className="text-sm text-gray-600">📧 {cliente.correo}</p>
            <p className="text-sm text-gray-600">📞 {cliente.telefono}</p>
            <p className="text-sm text-gray-600">🆔 DUI: {cliente.dui}</p>
            <p className="text-sm text-gray-600 mb-3">🏠 {cliente.direccion}</p>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {["disponibles", "canjeados", "vencidos"].map((estado) => (
                <div key={estado}>
                  <h3 className="font-semibold text-[#4B59E4] capitalize">
                    Cupones {estado}
                  </h3>
                  {cuponesPorCliente[cliente.id]?.[estado]?.length > 0 ? (
                    <ul className="text-sm list-disc pl-4 mt-1">
                      {cuponesPorCliente[cliente.id][estado].map((cupon) => (
                        <li key={cupon.id}>
                          <strong>{cupon.titulo}</strong> - Código: {cupon.codigo}
                        </li>
                      ))}
                    </ul>
                  ) : (
                    <p className="text-gray-400 text-sm">Ninguno</p>
                  )}
                </div>
              ))}
            </div>
          </div>
        ))
      )}
    </div>
  );
};

export default GestionarClientes;