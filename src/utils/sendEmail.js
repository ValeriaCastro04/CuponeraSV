import emailjs from "@emailjs/browser";

export const sendPasswordEmail = async (toEmail, empresaNombre, passwordTemporal) => {
  const templateParams = {
    email: toEmail,         // ⚠️ Estas deben coincidir con las variables del template
    empresa: empresaNombre,
    password: passwordTemporal
  };

  return await emailjs.send(
    "service_6jwr8sk",       // ✅ Tu service ID
    "template_h2rxco1",      // ✅ Tu template ID (¡clave!)
    templateParams,
    "n2WfyWZHSr9i4YLs5"      // ✅ Tu Public Key
  );
};