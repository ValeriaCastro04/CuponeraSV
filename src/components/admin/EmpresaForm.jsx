import { useState, useEffect } from "react";

const EmpresaForm = ({ initialData = null, onSubmit, rubros }) => {
  const [form, setForm] = useState({
    nombre: "",
    codigo: "",
    direccion: "",
    contacto: "",
    telefono: "",
    correo: "",
    rubro: "",
    porcentajeComision: ""
  });

  useEffect(() => {
    if (initialData) {
      setForm(initialData);
    }
  }, [initialData]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    const regexCodigo = /^[A-Z]{3}\d{3}$/;
    if (!regexCodigo.test(form.codigo)) {
      alert("El código debe tener el formato ABC123");
      return;
    }

    onSubmit(form);
    setForm({
      nombre: "",
      codigo: "",
      direccion: "",
      contacto: "",
      telefono: "",
      correo: "",
      rubro: "",
      porcentajeComision: ""
    });
  };

  return (
    <form
      onSubmit={handleSubmit}
      className="bg-white p-6 rounded-2xl shadow-md border border-gray-200 max-w-4xl mx-auto mb-8"
    >
      <h2 className="text-2xl font-bold mb-6 text-[#4B59E4]">
        {initialData ? "Editar Empresa" : "Registrar Nueva Empresa"}
      </h2>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {[
          { name: "nombre", label: "Nombre de la empresa" },
          { name: "codigo", label: "Código (ABC123)" },
          { name: "direccion", label: "Dirección" },
          { name: "contacto", label: "Nombre del contacto" },
          { name: "telefono", label: "Teléfono" },
          { name: "correo", label: "Correo electrónico" },
          { name: "porcentajeComision", label: "Porcentaje de comisión (%)" }
        ].map(({ name, label }) => (
          <div key={name} className="flex flex-col">
            <label className="text-sm font-semibold text-gray-700 mb-1">{label}</label>
            <input
              type={name === "porcentajeComision" ? "number" : "text"}
              name={name}
              value={form[name]}
              onChange={handleChange}
              placeholder={label}
              className="border border-gray-300 rounded-lg p-2 focus:outline-none focus:ring-2 focus:ring-[#4B59E4]"
              required
            />
          </div>
        ))}
        <div className="flex flex-col">
          <label className="text-sm font-semibold text-gray-700 mb-1">Rubro</label>
          <select
            name="rubro"
            value={form.rubro}
            onChange={handleChange}
            className="border border-gray-300 rounded-lg p-2 focus:outline-none focus:ring-2 focus:ring-[#4B59E4]"
            required
          >
            <option value="">Selecciona un rubro</option>
            {rubros.map((r) => (
              <option key={r.id} value={r.nombre}>
                {r.nombre}
              </option>
            ))}
          </select>
        </div>
      </div>
      <div className="text-right mt-6">
        <button
          type="submit"
          className="bg-[#4B59E4] text-white px-6 py-2 rounded-lg hover:bg-blue-700 transition"
        >
          {initialData ? "Actualizar Empresa" : "Registrar Empresa"}
        </button>
      </div>
    </form>
  );
};

export default EmpresaForm;