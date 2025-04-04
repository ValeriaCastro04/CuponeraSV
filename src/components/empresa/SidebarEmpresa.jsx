import { NavLink, useNavigate } from "react-router-dom";
import logo from "/logo.png";

const SidebarEmpresa = () => {
  const navigate = useNavigate();

  const handleLogout = () => {
    navigate("/login");
  };

  return (
    <div className="w-64 bg-[#FAB26A] text-black min-h-screen flex flex-col z-10 fixed top-0 left-0">
      {/* Logo */}
      <div className="p-6 flex items-center justify-center bg-[#FDD9B5]">
        <img src={logo} alt="Logo" className="h-16" />
      </div>

      {/* Navegación */}
      <nav className="flex-1 flex flex-col gap-1 p-4 overflow-y-auto">
        <NavLink
          to="crear"
          className={({ isActive }) =>
            `px-4 py-2 rounded-lg text-lg font-medium transition flex items-center gap-2 ${
              isActive ? "bg-[#4B59E4] text-white" : "hover:bg-[#ED8294]"
            }`
          }
        >
          <span>📝</span> Crear Oferta
        </NavLink>

        <NavLink
          to="ofertas"
          className={({ isActive }) =>
            `px-4 py-2 rounded-lg text-lg font-medium transition flex items-center gap-2 ${
              isActive ? "bg-[#4B59E4] text-white" : "hover:bg-[#ED8294]"
            }`
          }
        >
          <span>📦</span> Ver Ofertas
        </NavLink>

        <NavLink
          to="empleados"
          className={({ isActive }) =>
            `px-4 py-2 rounded-lg text-lg font-medium transition flex items-center gap-2 ${
              isActive ? "bg-[#4B59E4] text-white" : "hover:bg-[#ED8294]"
            }`
          }
        >
          <span>👥</span> Gestionar Empleados
        </NavLink>
      </nav>

      {/* Cerrar sesión */}
      <div className="p-4 mt-auto">
        <button
          onClick={handleLogout}
          className="w-full bg-[#4B59E4] text-white py-2 rounded-lg hover:bg-blue-700 transition"
        >
          🔒 Cerrar sesión
        </button>
      </div>
    </div>
  );
};

export default SidebarEmpresa;