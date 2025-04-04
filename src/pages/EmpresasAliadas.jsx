import { Link } from "react-router-dom";

const EmpresasAliadas = () => {
  return (
    <div className="px-6 py-12 max-w-4xl mx-auto text-center">
      <h2 className="text-3xl font-bold text-[#4B59E4] mb-6">¿Eres dueño de una empresa?</h2>
      <p className="text-lg text-gray-700 mb-6">
        Únete a Cuponera SV y comienza a promocionar tus productos o servicios con cupones irresistibles. 
        Aumenta tus ventas y gana visibilidad de forma fácil y gratuita.
      </p>
      <p className="text-md text-gray-600 mb-10">¿Ya estás asociado con nosotros?</p>
      <Link
        to="/login"
        className="inline-block bg-[#4B59E4] text-white px-6 py-3 rounded font-semibold hover:bg-blue-700"
      >
        Inicia sesión aquí
      </Link>
    </div>
  );
};

export default EmpresasAliadas;