import emailjs from "@emailjs/browser";

export const sendPasswordEmail = async (toEmail, empresaNombre, passwordTemporal) => {
  const templateParams = {
    email: toEmail,         
    empresa: empresaNombre,
    password: passwordTemporal
  };

  return await emailjs.send(
    "service_6jwr8sk",       
    "template_h2rxco1",      
    templateParams,
    "n2WfyWZHSr9i4YLs5"      
  );
};

// Email de compra exitosa
export const enviarCorreoCompraExitosa = async ({
  to_email,
  nombre_cliente,
  titulo_oferta,
  descripcion,
  precio_oferta,
  precio_regular,
  codigo_cupon,
  fecha_limite
}) => {
  if (!to_email) {
    console.warn("No se envió el correo: dirección vacía.");
    return;
  }

  const templateParams = {
    to_email,
    nombre_cliente,
    titulo_oferta,
    descripcion,
    precio_oferta,
    precio_regular,
    codigo_cupon,
    fecha_limite
  };

  return await emailjs.send(
    "service_23dlvvs",
    "template_ig4pmtu",
    templateParams,
    "n2WfyWZHSr9i4YLs5"
  );
};