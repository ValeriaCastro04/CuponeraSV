import { Outlet } from "react-router-dom";
import SidebarEmpresa from "../../components/empresa/SidebarEmpresa";

const EmpresaDashboard = () => {
  return (
    <div className="min-h-screen flex">
      <SidebarEmpresa />
      <main className="flex-1 bg-[#FFF9F5] p-6 overflow-y-auto">
        <Outlet />
      </main>
    </div>
  );
};

export default EmpresaDashboard;