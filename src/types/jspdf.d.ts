declare module "jspdf" {
  export default class jsPDF {
    constructor(options?: {
      orientation?: "portrait" | "landscape";
      unit?: "mm" | "pt" | "cm" | "in";
      format?: "a4" | "letter" | string;
    });
    setFontSize(size: number): this;
    setTextColor(r: number, g: number, b: number): this;
    setDrawColor(r: number, g: number, b: number): this;
    setFillColor(r: number, g: number, b: number): this;
    setFont(fontName: string, fontStyle?: string): this;
    text(text: string, x: number, y: number, options?: { align?: "left" | "center" | "right" }): this;
    rect(x: number, y: number, w: number, h: number, style?: "S" | "F" | "FD"): this;
    line(x1: number, y1: number, x2: number, y2: number): this;
    addImage(imageData: string, format: string, x: number, y: number, w: number, h: number): this;
    save(filename: string): this;
    internal: { pageSize: { getWidth: () => number; getHeight: () => number } };
  }
}