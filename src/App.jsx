import { Routes, Route, Navigate } from "react-router-dom";
import { useAuth } from "./contexts/AuthContext";
import Login from "./pages/Login";
import AdminLayout from "./layouts/AdminLayout";
import AdminDashboard from "./pages/admin/Dashboard";
import EmpresasAdmin from "./pages/admin/EmpresasAdmin";
import RubrosAdmin from "./pages/admin/RubrosAdmin";
import CambiarContraseña from "./pages/CambiarContraseña";
import EmpresaDashboard from "./pages/empresa/EmpresaDashboard"; 
import { ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import CrearOferta from "./pages/empresa/CrearOferta";
import InicioEmpresa from "./pages/empresa/InicioEmpresa";
import OfertasEmpresa from "./pages/empresa/OfertasEmpresa";
import GestionarEmpleados from "./pages/empresa/GestionarEmpleados";
import OfertasAdmin from "./pages/admin/OfertasAdmin";

function App() {
  const { usuario, rol, primerLogin, loading } = useAuth();

  // ✅ Esperamos a que cargue sesión y rol
  if (loading) return <div className="p-6 text-center">Cargando...</div>;

  return (
    <>
    <Routes>
      {/* Login disponible para todos */}
      <Route path="/login" element={<Login />} />

      {/* ADMIN */}
      <Route
        path="/admin"
        element={
          usuario && rol === "admin" ? <AdminLayout /> : <Navigate to="/login" />
        }
      >
        <Route index element={<AdminDashboard />} />
        <Route path="empresas" element={<EmpresasAdmin />} />
        <Route path="rubros" element={<RubrosAdmin />} />
        <Route path="ofertas" element={<OfertasAdmin />} />
      </Route>

      {/* EMPRESA */}
      <Route
        path="/empresa"
        element={
          usuario && rol === "empresa" ? (
            primerLogin ? (
              <CambiarContraseña />
            ) : (
              <EmpresaDashboard />
            )
          ) : (
            <Navigate to="/login" />
          )
        }
      >
      <Route index element={<InicioEmpresa />} />
      <Route path="crear" element={<CrearOferta />}/>
      <Route path="ofertas" element={<OfertasEmpresa />}/>
      <Route path="empleados" element={<GestionarEmpleados />}/>
      </Route>
      {/* RUTA POR DEFECTO */}
      <Route path="*" element={<Navigate to="/login" />} />
    </Routes>
    <ToastContainer position="top-right" autoClose={3000} />
    </>
  );
}

export default App;