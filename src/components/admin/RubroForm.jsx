import { useState, useEffect } from "react";

const RubroForm = ({ onSubmit, initialData }) => {
  const [nombre, setNombre] = useState("");

  useEffect(() => {
    if (initialData) setNombre(initialData.nombre);
  }, [initialData]);

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!nombre.trim()) return;
    onSubmit({ nombre });
    setNombre("");
  };

  return (
    <form onSubmit={handleSubmit} className="bg-white p-6 rounded-2xl shadow-md border border-gray-200 max-w-xl mb-6">
      <h2 className="text-xl font-bold mb-4 text-[#4B59E4]">{initialData ? "Editar Rubro" : "Agregar Rubro"}</h2>
      <div className="flex items-center gap-4">
        <input
          type="text"
          value={nombre}
          onChange={(e) => setNombre(e.target.value)}
          placeholder="Nombre del rubro (ej. restaurantes)"
          className="flex-1 border border-gray-300 rounded-lg p-2 focus:outline-none focus:ring-2 focus:ring-[#4B59E4]"
          required
        />
        <button
          type="submit"
          className="bg-[#4B59E4] text-white px-4 py-2 rounded-lg hover:bg-blue-800 transition"
        >
          {initialData ? "Actualizar" : "Agregar"}
        </button>
      </div>
    </form>
  );
};

export default RubroForm;