import { Link } from "react-router-dom";

const CompraExitosa = () => {
  return (
    <div className="min-h-screen bg-[#F1E4D1] flex items-center justify-center p-4">
      <div className="bg-white shadow-md rounded-lg p-8 max-w-lg w-full text-center">
        <h2 className="text-3xl font-bold text-[#4B59E4] mb-4">¡Compra Exitosa! 🎉</h2>
        
        <p className="text-gray-700 mb-4">
          Gracias por tu compra. Hemos procesado tu pago y enviado el cupón a tu correo electrónico. 📨
        </p>

        <p className="text-gray-700 mb-4">
          También puedes consultar tu cupón en la sección <strong>Mis Cupones</strong> de tu cuenta.
        </p>

        <Link to="/mis-cupones">
          <button className="bg-[#4B59E4] hover:bg-blue-700 text-white px-6 py-2 rounded-lg mt-4">
            Ir a Mis Cupones
          </button>
        </Link>

        <Link to="/">
          <p className="text-sm text-[#4B59E4] mt-4 hover:underline">Volver al inicio</p>
        </Link>
      </div>
    </div>
  );
};

export default CompraExitosa;