import { useState, useEffect } from "react";
import { auth, signInWithEmailAndPassword, signInWithPopup } from "../../services/firebase";
import { provider } from "../../services/firebase";
import { useNavigate } from "react-router-dom";
import { sendPasswordResetEmail } from "firebase/auth";

export default function UserLogin() {
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [error, setError] = useState("");
    const navigate = useNavigate();
  
    // Verifica si el usuario ya está logueado y su correo está verificado
    useEffect(() => {
      const unsubscribe = auth.onAuthStateChanged((user) => {
        if (user && user.emailVerified) {
          navigate("/dashboard");
        }
      });
  
      return () => unsubscribe();
    }, [navigate]);
  
    const handleLogin = async (e) => {
      e.preventDefault();
      setError("");
      try {
        const userCredential = await signInWithEmailAndPassword(auth, email, password);
        const user = userCredential.user;
  
        if (!user.emailVerified) {
          alert("Por favor, verifica tu correo electrónico antes de continuar.");
          return;
        }
  
        alert("Inicio de sesión exitoso 🎉");
        localStorage.setItem("usuarioLogueado", JSON.stringify({ uid: user.uid, email: user.email }));
        navigate("/dashboard");
      } catch (err) {
        if (err.code === 'auth/invalid-credential' || err.code === 'auth/user-not-found' || err.code === 'auth/wrong-password') {
          setError("Credenciales inválidas");
        } else {
          setError("Error: " + err.message);
        }
      }
    };
  
    const handleGoogleLogin = async () => {
      try {
        const result = await signInWithPopup(auth, provider);
        const user = result.user;
  
        if (!user.emailVerified) {
          alert("Debes verificar tu correo electrónico de Google.");
          return;
        }
  
        alert("Inicio de sesión con Google exitoso ✅");
        localStorage.setItem("usuarioLogueado", JSON.stringify({ uid: user.uid, email: user.email }));
        navigate("/dashboard");
      } catch (err) {
        setError("Error con Google: " + err.message);
      }
    };
  
    const handlePasswordReset = async () => {
      if (!email) {
        setError("Por favor, ingresa tu correo electrónico para restablecer la contraseña.");
        return;
      }
      try {
        await sendPasswordResetEmail(auth, email);
        alert("Correo de restablecimiento enviado. Revisa tu bandeja de entrada.");
      } catch (err) {
        setError("Error al enviar el correo: " + err.message);
      }
    };
  
    return (
      <div className="flex items-center justify-center min-h-screen bg-[#F1E4D1]">
        <div className="w-full max-w-md p-6 bg-white rounded-lg shadow-md">
          <h2 className="text-2xl font-bold text-center text-[#162660]">Iniciar sesión</h2>
  
          {error && <p className="text-red-500 text-sm text-center mt-2">{error}</p>}
  
          <form onSubmit={handleLogin} className="mt-4">
            <div>
              <label className="block text-sm font-medium text-[#162660]">Correo Electrónico</label>
              <input
                type="email"
                className="w-full px-4 py-2 mt-1 border rounded-lg focus:outline-none focus:ring-2 focus:ring-[#162660]"
                placeholder="Ingresa tu correo"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
              />
            </div>
  
            <div className="mt-4">
              <label className="block text-sm font-medium text-[#162660]">Contraseña</label>
              <input
                type="password"
                className="w-full px-4 py-2 mt-1 border rounded-lg focus:outline-none focus:ring-2 focus:ring-[#162660]"
                placeholder="Ingresa tu contraseña"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
              />
            </div>
  
            <div className="flex items-center justify-between mt-4">
              <label className="flex items-center">
                <input type="checkbox" className="w-4 h-4 text-[#162660] border-gray-300 rounded" />
                <span className="ml-2 text-sm text-[#162660]">Recuérdame</span>
              </label>
              <button type="button" onClick={handlePasswordReset} className="text-sm text-[#162660] hover:underline">¿Olvidaste tu contraseña?</button>
            </div>
  
            <button type="submit" className="w-full px-4 py-2 mt-4 text-[#D0E6FD] bg-[#162660] rounded-lg hover:bg-[#101A45]">
              Ingresar
            </button>
  
            <button type="button" onClick={handleGoogleLogin} className="w-full px-4 py-2 mt-2 text-white bg-red-500 rounded-lg hover:bg-red-600">
              Iniciar sesión con Google
            </button>
          </form>
  
          <p className="mt-4 text-sm text-center text-[#162660]">
            ¿No tienes cuenta? <a href="/register" className="text-[#162660] hover:underline">Regístrate</a>
          </p>
        </div>
      </div>
    );
}