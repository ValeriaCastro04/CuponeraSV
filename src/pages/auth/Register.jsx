import { useState, useEffect } from "react";
import {
    createUserWithEmailAndPassword,
    signInWithPopup,
    sendEmailVerification,
    GoogleAuthProvider
  } from "firebase/auth";
import { setDoc, doc, serverTimestamp } from "firebase/firestore";
import { auth, provider, db } from "../../services/firebase";
import { useNavigate } from "react-router-dom";
import { toast} from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

export default function Register() {
    const [nombre, setNombre] = useState("");
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [termsAccepted, setTermsAccepted] = useState(false);
    const [error, setError] = useState("");
    const navigate = useNavigate();
  
    useEffect(() => {
      const unsubscribe = auth.onAuthStateChanged((user) => {
        if (user?.emailVerified) {
          navigate("/dashboard");
        }
      });
      return () => unsubscribe();
    }, [navigate]);
  
    const handleRegister = async (e) => {
        e.preventDefault();
        if (!termsAccepted) {
          setError("Debes aceptar los términos y servicios");
          return;
        }
      
        try {
          const userCredential = await createUserWithEmailAndPassword(auth, email, password);
          const user = userCredential.user;
          await sendEmailVerification(user);
      
          // Guardar en la colección clientes
          await setDoc(doc(db, "clientes", user.uid), {
            nombre: nombre,
            correo: email,
            creadoEn: serverTimestamp()
          });
      
          toast.success("Registro exitoso 🎉. Verifica tu correo.");
          navigate("/login");
        } catch (err) {
          if (err.code === 'auth/email-already-in-use') {
            setError("Este correo ya ha sido registrado");
          } else {
            setError("Error: " + err.message);
          }
        }
      };
      
  
    const handleGoogleLogin = async () => {
      try {
        const result = await signInWithPopup(auth, provider);
        const user = result.user;
  
        // Guardar en Firestore si es nuevo
        await setDoc(doc(db, "clientes", user.uid), {
          uid: user.uid,
          nombre: user.displayName || "Usuario Google",
          email: user.email,
          fechaRegistro: serverTimestamp()
        });
  
        toast.success("Registro con Google exitoso ✅");
        localStorage.setItem("usuarioLogueado", JSON.stringify({ uid: user.uid, email: user.email }));
        navigate("/dashboard");
      } catch (err) {
        setError("Error con Google: " + err.message);
      }
    };
  
    return (
      <div className="flex items-center justify-center min-h-screen bg-[#F1E4D1]">
        <div className="w-full max-w-md p-6 bg-white rounded-lg shadow-md mt-6 sm:mt-0">
          <h2 className="text-2xl font-bold text-center text-[#162660]">Registrarse</h2>
  
          {error && <p className="text-red-500 text-sm text-center mt-2">{error}</p>}
  
          <form onSubmit={handleRegister} className="mt-4">
            <div>
              <label className="block text-sm font-medium text-[#162660]">Nombre completo</label>
              <input
                type="text"
                className="w-full px-4 py-2 mt-1 border rounded-lg"
                placeholder="Ej. María López"
                value={nombre}
                onChange={(e) => setNombre(e.target.value)}
                required
              />
            </div>
  
            <div className="mt-4">
              <label className="block text-sm font-medium text-[#162660]">Correo Electrónico</label>
              <input
                type="email"
                className="w-full px-4 py-2 mt-1 border rounded-lg"
                placeholder="Ingresa tu correo"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
              />
            </div>
  
            <div className="mt-4">
              <label className="block text-sm font-medium text-[#162660]">Contraseña</label>
              <input
                type="password"
                className="w-full px-4 py-2 mt-1 border rounded-lg"
                placeholder="Ingresa tu contraseña"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
              />
            </div>
  
            <div className="flex items-center justify-between mt-4">
              <label className="flex items-center">
                <input 
                  type="checkbox" 
                  className="w-4 h-4 text-[#162660] border-gray-300 rounded"
                  checked={termsAccepted}
                  onChange={() => setTermsAccepted(!termsAccepted)}
                />
                <span className="ml-2 text-sm text-[#162660]">
                  Acepto <a href="https://www.youtube.com/watch?v=xvFZjo5PgG0" target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:underline">términos y servicios</a>
                </span>
              </label>
            </div>
  
            <button type="submit" className="w-full px-4 py-2 mt-4 text-[#D0E6FD] bg-[#162660] rounded-lg hover:bg-[#101A45]">
              Registrarse
            </button>
  
            <button type="button" onClick={handleGoogleLogin} className="w-full px-4 py-2 mt-2 text-white bg-red-500 rounded-lg hover:bg-red-600">
              Registrarse con Google
            </button>
          </form>
  
          <p className="mt-4 text-sm text-center text-[#162660]">
            ¿Ya tienes cuenta? <a href="/user-login" className="text-[#162660] hover:underline">Inicia sesión</a>
          </p>
        </div>
      </div>
    );
}