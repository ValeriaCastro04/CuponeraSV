import { jsPDF } from "jspdf";

export const descargarPDF = (cupon) => {
  const doc = new jsPDF();

  doc.setFillColor(75, 89, 228);
  doc.rect(0, 0, 210, 30, "F");

  doc.setTextColor(255, 255, 255);
  doc.setFontSize(18);
  doc.text("Cupón Digital - CuponeraSV", 105, 20, { align: "center" });

  doc.setTextColor(0, 0, 0);
  doc.setFontSize(14);
  let y = 50;

  doc.text(`Código del Cupón:`, 20, y);
  doc.setFont("helvetica", "bold");
  doc.text(`${cupon.codigo}`, 80, y);
  y += 10;

  doc.setFont("helvetica", "normal");
  doc.text(`Título:`, 20, y);
  doc.setFont("helvetica", "bold");
  doc.text(`${cupon.titulo}`, 80, y);
  y += 10;

  doc.setFont("helvetica", "normal");
  doc.text(`Descripción:`, 20, y);
  doc.setFont("helvetica", "bold");
  const descripcionDividida = doc.splitTextToSize(cupon.descripcion, 110);
  doc.text(descripcionDividida, 80, y);
  y += descripcionDividida.length * 10;

  doc.setFont("helvetica", "normal");
  doc.text(`Válido hasta:`, 20, y);
  doc.setFont("helvetica", "bold");
  doc.text(
    new Date(cupon.fecha_limite_cupon.seconds * 1000).toLocaleDateString("es-ES"),
    80,
    y
  );
  y += 20;

  doc.setFont("helvetica", "italic");
  doc.setFontSize(10);
  doc.setTextColor(100);
  doc.text("Este cupón es válido solo una vez. Preséntalo en el establecimiento participante.", 105, 280, {
    align: "center",
  });

  doc.save(`${cupon.codigo}.pdf`);
};