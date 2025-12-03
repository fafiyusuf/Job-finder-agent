// Simple, stable PDF text extraction with fallbacks
// This avoids pdfjs-dist path/worker issues in Node.
async function extractTextFromPDF(buffer) {
  // Primary: pdf-parse (using PDFParse class)
  try {
    const pdfModule = require("pdf-parse");
    if (pdfModule.PDFParse && typeof pdfModule.PDFParse === "function") {
      const parser = new pdfModule.PDFParse({ data: buffer });
      const result = await parser.getText();
      return result?.text || "";
    }
  } catch (err) {
    console.warn("pdf-parse PDFParse class failed:", err.message);
  }

  // Try legacy pdf-parse function approach
  try {
    const mod = require("pdf-parse");
    const fn = typeof mod === "function" ? mod : (mod && typeof mod.default === "function" ? mod.default : null);
    if (fn) {
      const data = await fn(buffer);
      return data?.text || "";
    }
  } catch (err) {
    console.warn("pdf-parse function approach failed:", err.message);
  }

  try {
    const direct = require("pdf-parse/lib/pdf-parse");
    if (typeof direct === "function") {
      const data = await direct(buffer);
      return data?.text || "";
    }
  } catch (err) {
    console.warn("pdf-parse/lib/pdf-parse failed:", err.message);
  }

  // Fallback: pdf2json
  try {
    const PDFParser = require("pdf2json");
    const parser = new PDFParser();
    const text = await new Promise((resolve, reject) => {
      parser.on("pdfParser_dataError", err => reject(err.parserError || err));
      parser.on("pdfParser_dataReady", pdfData => {
        try {
          const pages = pdfData?.formImage?.Pages || [];
          const joined = pages.map(p => (p?.Texts || []).map(t => decodeURIComponent(t.R?.[0]?.T || "")).join(" ")).join("\n");
          resolve(joined.trim());
        } catch (e) {
          resolve("");
        }
      });
      parser.parseBuffer(buffer);
    });
    return text;
  } catch (e) {
    console.error("pdf2json failed:", e.message);
    // If all fail, throw a clear error
    throw new Error("No PDF text extractor available (pdf-parse/pdf2json missing or failed)");
  }
}

module.exports = extractTextFromPDF;
