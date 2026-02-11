// utils/defaultPhoto.ts

export async function defaultPhotoFile(): Promise<File> {
  return svgToPngFile("/defaultPetAvatar.svg", "defaultPetAvatar.png");
}

/* ---------- helpers ---------- */
function svgToPngFile(
  svgUrl: string,
  fileName: string,
  width = 400,
  height = 400
): Promise<File> {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.src = svgUrl;
    img.onload = () => {
      const canvas = document.createElement("canvas");
      canvas.width = width;
      canvas.height = height;
      const ctx = canvas.getContext("2d")!;
      ctx.drawImage(img, 0, 0, width, height);
      canvas.toBlob((blob) => {
        if (!blob) return reject("Error al convertir SVG a PNG");
        resolve(new File([blob], fileName, { type: "image/png" }));
      }, "image/png");
    };
    img.onerror = () => reject("No se pudo cargar el SVG");
  });
}