import { useState, useEffect } from "react";
import { db } from "../services/firebase"; 
import { doc, getDoc, collection, addDoc } from "firebase/firestore";
import { useNavigate, useParams } from "react-router-dom";
import { getAuth, onAuthStateChanged } from "firebase/auth";

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
    for (let i = 0; i < val.length; i++) {
      let intVal = parseInt(val.substr(i, 1));
      if (i % 2 === 0) {
        intVal *= 2;
        if (intVal > 9) {
          intVal = 1 + (intVal % 10);
        }
      }
      sum += intVal;
    }
    return (sum % 10) === 0;
  };

  const handlePayment = async () => {
    setError("");
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
      const cupon = {
        userId: user.uid,
        ofertaId,
        titulo: oferta.titulo,
        descripcion: oferta.descripcion,
        precioOferta: oferta.precioOferta,
        precioRegular: oferta.precioRegular,
        fechaCompra: new Date(),
        fechaLimiteCupon: oferta.fechaLimiteUso,
        codigo: Math.random().toString(36).substr(2, 9).toUpperCase(),
      };

      await addDoc(collection(db, "CuponesComprados"), cupon);
      alert("Tu pago ha sido exitoso, puedes revisar tu cupón en la sección de 'Mis Cupones'.");
      navigate("/mis-cupones");
    } catch (error) {
      console.error("Error al generar el cupón:", error);
      setError("Hubo un error al procesar el pago. Inténtalo nuevamente.");
    }
  };

  if (!oferta) return <div className="text-center mt-6">Cargando oferta...</div>;

  return (
    <div className="container mx-auto p-4">
      <h1 className="text-3xl font-bold text-center text-red-600">{oferta.titulo}</h1>
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
          className="mt-4 w-full bg-red-500 text-white px-4 py-2 rounded-lg hover:bg-blue-600"
        >
          Pagar
        </button>
      </div>
    </div>
  );
};

export default DetallesOferta;
