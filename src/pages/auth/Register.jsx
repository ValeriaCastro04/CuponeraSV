import { useState } from "react";
import {
  auth,
  db,
  createUserWithEmailAndPassword,
  sendEmailVerification,
  doc,
  setDoc,
} from "../../services/firebase";
import { useNavigate } from "react-router-dom";
import { toast } from "react-toastify";

export default function Register() {
  const [form, setForm] = useState({
    nombres: "",
    apellidos: "",
    telefono: "",
    correo: "",
    direccion: "",
    dui: "",
    password: "",
  });

  const [error, setError] = useState("");
  const [termsAccepted, setTermsAccepted] = useState(false);
  const navigate = useNavigate();

  const validarCampos = () => {
    const telefonoRegex = /^[0-9]{8}$/;
    const duiRegex = /^[0-9]{8}-[0-9]$/;

    if (!telefonoRegex.test(form.telefono)) {
      setError("El teléfono debe tener 8 dígitos numéricos.");
      return false;
    }

    if (!duiRegex.test(form.dui)) {
      setError("El DUI debe tener el formato 12345678-9.");
      return false;
    }

    if (form.password.length < 6) {
      setError("La contraseña debe tener al menos 6 caracteres.");
      return false;
    }

    return true;
  };

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleRegister = async (e) => {
    e.preventDefault();
    setError("");

    if (!termsAccepted) {
      setError("Debes aceptar los términos y servicios");
      return;
    }

    if (!validarCampos()) return;

    try {
      const userCredential = await createUserWithEmailAndPassword(
        auth,
        form.correo,
        form.password
      );
      const user = userCredential.user;

      await sendEmailVerification(user);

      await setDoc(doc(db, "clientes", user.uid), {
        nombres: form.nombres,
        apellidos: form.apellidos,
        correo: form.correo,
        telefono: form.telefono,
        direccion: form.direccion,
        dui: form.dui,
        creadoEn: new Date(),
      });

      toast.success("Registro exitoso. Verifica tu correo antes de iniciar sesión.");
      navigate("/user-login");
    } catch (err) {
      if (err.code === "auth/email-already-in-use") {
        setError("Este correo ya ha sido registrado");
      } else {
        setError("Error: " + err.message);
      }
    }
  };

  return (
    <div className="flex items-center justify-center min-h-screen bg-[#F1E4D1]">
      <div className="w-full max-w-md p-6 bg-white rounded-lg shadow-md mt-6 sm:mt-0">
        <h2 className="text-2xl font-bold text-center text-[#162660]">Registrarse</h2>

        {error && <p className="text-red-500 text-sm text-center mt-2">{error}</p>}

        <form onSubmit={handleRegister} className="mt-4 space-y-4">
          <input
            name="nombres"
            placeholder="Nombres"
            value={form.nombres}
            onChange={handleChange}
            required
            className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-[#162660]"
          />
          <input
            name="apellidos"
            placeholder="Apellidos"
            value={form.apellidos}
            onChange={handleChange}
            required
            className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-[#162660]"
          />
          <input
            name="telefono"
            placeholder="Teléfono"
            value={form.telefono}
            onChange={handleChange}
            required
            maxLength={8}
            className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-[#162660]"
          />
          <input
            type="email"
            name="correo"
            placeholder="Correo electrónico"
            value={form.correo}
            onChange={handleChange}
            required
            className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-[#162660]"
          />
          <input
            type="password"
            name="password"
            placeholder="Contraseña"
            value={form.password}
            onChange={handleChange}
            required
            minLength={6}
            className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-[#162660]"
          />
          <input
            name="direccion"
            placeholder="Dirección"
            value={form.direccion}
            onChange={handleChange}
            required
            className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-[#162660]"
          />
          <input
            name="dui"
            placeholder="DUI (formato 12345678-9)"
            value={form.dui}
            onChange={handleChange}
            required
            maxLength={10}
            className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-[#162660]"
          />

          <div className="flex items-center justify-between mt-4">
            <label className="flex items-center">
              <input
                type="checkbox"
                className="w-4 h-4 text-[#162660] border-gray-300 rounded"
                checked={termsAccepted}
                onChange={() => setTermsAccepted(!termsAccepted)}
              />
              <span className="ml-2 text-sm text-[#162660]">
                Acepto{" "}
                <a
                  href="https://www.youtube.com/watch?v=xvFZjo5PgG0"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-blue-600 hover:underline"
                >
                  términos y servicios
                </a>
              </span>
            </label>
          </div>

          <button
            type="submit"
            className="w-full px-4 py-2 text-[#D0E6FD] bg-[#162660] rounded-lg hover:bg-[#101A45]"
          >
            Registrarse
          </button>
        </form>

        <p className="mt-4 text-sm text-center text-[#162660]">
          ¿Ya tienes cuenta?{" "}
          <a href="/user-login" className="text-[#162660] hover:underline">
            Inicia sesión
          </a>
        </p>
      </div>
    </div>
  );
}