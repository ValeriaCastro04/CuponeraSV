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
  return emailjs.send(
    "service_23dlvvs", 
    "template_ig4pmtu", 
    {
      to_email,
      nombre_cliente,
      titulo_oferta,
      descripcion,
      precio_oferta,
      precio_regular,
      codigo_cupon,
      fecha_limite
    },
    "n2WfyWZHSr9i4YLs5"
  );
};