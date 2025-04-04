import { useState, useEffect } from "react";
import { db } from "../services/firebase"; 
import { doc, getDoc, collection, addDoc } from "firebase/firestore";
import { useNavigate, useParams } from "react-router-dom";
import { getAuth, onAuthStateChanged } from "firebase/auth";
import { enviarCorreoCompraExitosa } from "../utils/sendEmail"; 

const DetallesOferta = () => {
  const { ofertaId } = useParams();
  const [oferta, setOferta] = useState(null);
  const [cardNumber, setCardNumber] = useState("");
  const [expiryDate, setExpiryDate] = useState("");
  const [cardholderName, setCardholderName] = useState("");
  const [cvc, setCvc] = useState("");
  const [error, setError] = useState("");
  const [user, setUser] = useState(null);
  const navigate = useNavigate();

  useEffect(() => {
    const obtenerOferta = async () => {
      try {
        const docRef = doc(db, "ofertas", ofertaId);
        const docSnap = await getDoc(docRef);
        if (docSnap.exists()) {
          setOferta(docSnap.data());
        } else {
          console.log("No se encontró la oferta.");
          navigate("/");
        }
      } catch (error) {
        console.error("Error al obtener la oferta:", error);
      }
    };

    obtenerOferta();
  }, [ofertaId, navigate]);

  useEffect(() => {
    const auth = getAuth();
    const unsubscribe = onAuthStateChanged(auth, (usuario) => {
      if (usuario) {
        setUser(usuario);
        if (!usuario.emailVerified) {
          setError("Debes verificar tu correo electrónico antes de comprar.");
        }
      } else {
        navigate("/login"); // Redirige si no está logueado
      }
    });
    return () => unsubscribe();
  }, [navigate]);

  const luhnCheck = (val) => {
    let sum = 0;
    let shouldDouble = false;
  
    for (let i = val.length - 1; i >= 0; i--) {
      let digit = parseInt(val.charAt(i));
  
      if (shouldDouble) {
        digit *= 2;
        if (digit > 9) digit -= 9;
      }
  
      sum += digit;
      shouldDouble = !shouldDouble;
    }
  
    return (sum % 10) === 0;
  };
  

  const handlePayment = async () => {
    setError("");
  
    // Validaciones básicas
    if (!cardNumber || !expiryDate || !cardholderName || !cvc) {
      setError("Todos los campos son obligatorios");
      return;
    }
  
    if (!luhnCheck(cardNumber)) {
      setError("Número de tarjeta inválido");
      return;
    }
  
    if (!user || !user.emailVerified) {
      setError("Por favor, verifica tu correo electrónico antes de realizar una compra.");
      return;
    }
  
    try {
      // 1. Obtener código de la empresa
      const empresaDoc = await getDoc(doc(db, "empresas", oferta.empresaId));
      const codigoEmpresa = empresaDoc.exists() ? empresaDoc.data().codigo : "EMP";
  
      // 2. Generar código único
      const codigoGenerado = `${codigoEmpresa}-${Math.floor(1000000 + Math.random() * 9000000)}`;
  
      // 3. Consultar datos del cliente
      const clienteDoc = await getDoc(doc(db, "clientes", user.uid));
      const cliente = clienteDoc.exists() ? clienteDoc.data() : null;
  
      if (!cliente) throw new Error("No se encontró el cliente en Firestore");
  
      // 4. Guardar cupón en Firestore
      const cupon = {
        userId: user.uid,
        ofertaId,
        titulo: oferta.titulo,
        descripcion: oferta.descripcion,
        precio_oferta: oferta.precioOferta,
        precio_regular: oferta.precioRegular,
        fecha_compra: new Date(),
        fecha_limite_cupon: oferta.fechaLimiteUso,
        codigo: codigoGenerado,
        estado: "disponible",
        correoCliente: user.email
      };
  
      await addDoc(collection(db, "CuponesComprados"), cupon);

      console.log("📧 Enviando correo a:", user.email);
      console.log("📧 Datos cliente:", clienteData);

  
      // 5. Enviar correo con EmailJS
      await enviarCorreoCompraExitosa({
        to_email: user.email,
        nombre_cliente: `${clienteData.nombres} ${clienteData.apellidos}`,
        titulo_oferta: oferta.titulo,
        descripcion: oferta.descripcion,
        precio_oferta: oferta.precioOferta,
        precio_regular: oferta.precioRegular,
        codigo_cupon: codigoGenerado,
        fecha_limite: new Date(oferta.fechaLimiteUso.seconds * 1000).toLocaleDateString("es-ES")
      });
        
      // 6. Redirigir
      navigate("/compra-exitosa");
  
    } catch (error) {
      console.error("Error al procesar la compra:", error);
      setError(`Error al procesar el pago. Intenta de nuevo. ${error.message}`);
    }
  };
  
  
  

  if (!oferta) return <div className="text-center mt-6">Cargando oferta...</div>;

  return (
    <div className="container mx-auto p-4">
      <h1 className="text-3xl font-bold text-center text-orange-600">{oferta.titulo}</h1>
      <div className="border p-4 rounded-lg shadow-md mt-4">
        <img src={oferta.imgURL} alt={oferta.titulo} className="w-full h-60 object-cover rounded-md" />
        <p className="text-gray-600 mt-4">{oferta.descripcion}</p>
        <p className="text-red-500 font-bold mt-2">
          Oferta: ${oferta.precioOferta}{" "}
          <span className="line-through text-gray-400">${oferta.precioRegular}</span>
        </p>
        <p className="text-sm text-gray-700 mt-1">
          🛒 <strong>Compra hasta:</strong>{" "}
          {new Date(oferta.fechaFin.seconds * 1000).toLocaleDateString("es-ES")}
        </p>
        <p className="text-sm text-gray-700">
          ⏳ <strong>Válido hasta:</strong>{" "}
          {new Date(oferta.fechaLimiteUso.seconds * 1000).toLocaleDateString("es-ES")}
        </p>

        {/* Inputs de pago */}
        <div className="mt-4">
          <label className="block text-sm font-medium text-[#162660]">Número de tarjeta</label>
          <input
            type="text"
            className="w-full px-4 py-2 mt-1 border rounded-lg"
            placeholder="Ingresa tu número de tarjeta"
            value={cardNumber}
            onChange={(e) => setCardNumber(e.target.value)}
          />
        </div>

        <div className="mt-4">
          <label className="block text-sm font-medium text-[#162660]">Fecha de vencimiento</label>
          <input
            type="text"
            className="w-full px-4 py-2 mt-1 border rounded-lg"
            placeholder="MM/AA"
            value={expiryDate}
            onChange={(e) => setExpiryDate(e.target.value)}
          />
        </div>

        <div className="mt-4">
          <label className="block text-sm font-medium text-[#162660]">Nombre del titular</label>
          <input
            type="text"
            className="w-full px-4 py-2 mt-1 border rounded-lg"
            placeholder="Ingresa el nombre del titular"
            value={cardholderName}
            onChange={(e) => setCardholderName(e.target.value)}
          />
        </div>

        <div className="mt-4">
          <label className="block text-sm font-medium text-[#162660]">CVC</label>
          <input
            type="text"
            className="w-full px-4 py-2 mt-1 border rounded-lg"
            placeholder="CVC"
            value={cvc}
            onChange={(e) => setCvc(e.target.value)}
          />
        </div>

        {error && <p className="text-red-500 text-sm mt-2">{error}</p>}

        <button
          onClick={handlePayment}
          className="mt-4 w-full bg-blue-500 text-white px-4 py-2 rounded-lg hover:bg-orange-300"
        >
          Pagar
        </button>
      </div>
    </div>
  );
};

export default DetallesOferta;
