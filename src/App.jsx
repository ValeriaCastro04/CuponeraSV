import { Routes, Route, Navigate } from "react-router-dom";
import { useAuth } from "./contexts/AuthContext";
import Login from "./pages/Login";
import AdminLayout from "./layouts/AdminLayout";
import AdminDashboard from "./pages/admin/Dashboard";
import EmpresasAdmin from "./pages/admin/EmpresasAdmin";
import RubrosAdmin from "./pages/admin/RubrosAdmin";
import CambiarContraseña from "./pages/CambiarContraseña";
import EmpresaDashboard from "./pages/empresa/EmpresaDashboard";
import CrearOferta from "./pages/empresa/CrearOferta";
import InicioEmpresa from "./pages/empresa/InicioEmpresa";
import OfertasEmpresa from "./pages/empresa/OfertasEmpresa";
import GestionarEmpleados from "./pages/empresa/GestionarEmpleados";
import OfertasAdmin from "./pages/admin/OfertasAdmin";
import Home from "./pages/Home";
import EmpresasAliadas from "./pages/EmpresasAliadas";
import Header from "./components/Header";
import Register from "./pages/auth/Register";
import UserLogin from "./pages/auth/UserLogin";
import DetallesOferta from "./pages/DetallesOferta";
import CompraExitosa from "./pages/User/CompraExitosa";
import MisCupones from "./pages/User/MisCupones";
import EmpleadoCanje from "./pages/EmpleadoCanje";
import GestionarClientes from "./pages/admin/GestionarClientes";
import RecuperarContraseña from "./pages/RecuperarContraseña";

import { ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

function App() {
  const { usuario, rol, primerLogin, loading } = useAuth();

  if (loading) return <div className="p-6 text-center">Cargando...</div>;

  return (
    <>
      <Routes>
        <Route path="/login" element={<Login />} />

        {/* Rutas públicas */}
        <Route
          path="/"
          element={
            <>
              <Header user={usuario} />
              <Home />
            </>
          }
        />
        <Route
          path="/empresas-aliadas"
          element={
            <>
              <Header user={usuario} />
              <EmpresasAliadas />
            </>
          }
        />
        <Route
          path="/register"
          element={
            <>
              <Header user={usuario} />
              <Register />
            </>
          }
        />
        <Route
          path="/user-login"
          element={
            <>
              <Header user={usuario} />
              <UserLogin />
            </>
          }
        />
        <Route
          path="/detalles-oferta/:ofertaId"
          element={
            <>
              <Header user={usuario} />
              <DetallesOferta />
            </>
          }
        />
        <Route
          path="/compra-exitosa"
          element={
            <>
              <Header user={usuario} />
              <CompraExitosa />
            </>
          }
        />
        <Route
          path="/mis-cupones"
          element={
            <>
              <Header user={usuario} />
              <MisCupones />
            </>
          }
        />

        <Route path="/empleado-canje" element={<EmpleadoCanje />} />


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
          <Route path="clientes" element={<GestionarClientes />} />

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
          <Route path="crear" element={<CrearOferta />} />
          <Route path="ofertas" element={<OfertasEmpresa />} />
          <Route path="empleados" element={<GestionarEmpleados />} />
        </Route>

        <Route
          path="/recuperar-contraseña"
          element={<RecuperarContraseña />}/>
        {/* CATCH-ALL */}
        <Route path="*" element={<Navigate to="/" />} />
      </Routes>

      <ToastContainer position="top-right" autoClose={3000} />
    </>
  );
}

export default App;