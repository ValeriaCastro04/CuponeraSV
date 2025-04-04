import { signOut } from "firebase/auth";
import { auth } from "../../services/firebase";
import { useNavigate, NavLink } from "react-router-dom";

const SidebarAdmin = () => {
  const navigate = useNavigate();

  const handleLogout = async () => {
    await signOut(auth);
    navigate("/login");
  };

  return (
    <div className="w-64 bg-[#FAB26A] h-screen sticky top-0 flex flex-col justify-between overflow-y-auto shadow-lg">
      <div>
        <div className="p-6 text-2xl font-bold text-white tracking-wide">
          <span className="text-[#4B59E4]">Cuponera</span> SV
        </div>
        <nav className="flex flex-col gap-2 px-4">
          <NavLink
            to="/admin"
            end
            className={({ isActive }) =>
              isActive ? "bg-[#4B59E4] p-2 rounded-md" : "p-2 rounded-md hover:bg-[#FDD9B5] text-black"
            }
          >
            📊 Dashboard
          </NavLink>
          <NavLink
            to="/admin/empresas"
            className={({ isActive }) =>
              isActive ? "bg-[#4B59E4] p-2 rounded-md" : "p-2 rounded-md hover:bg-[#FDD9B5] text-black"
            }
          >
            🏢 Empresas
          </NavLink>
          <NavLink
            to="/admin/rubros"
            className={({ isActive }) =>
              isActive ? "bg-[#4B59E4] p-2 rounded-md" : "p-2 rounded-md hover:bg-[#FDD9B5] text-black"
            }
          >
            🏷️ Rubros
          </NavLink>
          <NavLink
            to="/admin/ofertas"
            className={({ isActive }) =>
              isActive ? "bg-[#4B59E4] p-2 rounded-md" : "p-2 rounded-md hover:bg-[#FDD9B5] text-black"
            }
          >
            📋 Ofertas
          </NavLink>
          <NavLink
            to="/admin/clientes"
            className={({ isActive }) =>
              isActive ? "bg-[#4B59E4] p-2 rounded-md" : "p-2 rounded-md hover:bg-[#FDD9B5] text-black"
            }
          >
            👥 Clientes
          </NavLink>
        </nav>
      </div>

      <div className="p-4">
        <button
          onClick={handleLogout}
          className="w-full p-2 bg-[#ED8294] text-white rounded-md hover:bg-red-600 transition"
        >
          Cerrar sesión
        </button>
      </div>
    </div>
  );
};

export default SidebarAdmin;