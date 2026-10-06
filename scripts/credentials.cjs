// Genera material imprimible a partir de los mismos datos ficticios de la app.
const fs = require("node:fs");
const path = require("node:path");
const QRCode = require("qrcode");
const { demoState, credentialValidity } = require("../src/domain.cjs");
(async () => {
  const cards = await Promise.all(
    demoState().students.map(
      async (s) =>
        `<article><header><img src="assets/ucc-logo.svg" alt="Universidad Cristóbal Colón" style="width:160px;display:block;margin-bottom:12px">AccesoUni<span>DEMO · NO OFICIAL</span></header><h2>${s.name}</h2><p>${s.career}<br>Semestre: ${s.semester}<br>Vigencia: ${credentialValidity(s)}</p><div class="qr">${await QRCode.toString("ACCESOUNI:" + s.id, { type: "svg", margin: 4, errorCorrectionLevel: "M" })}</div><h3>${s.id}</h3><p>${s.plate} · ${s.vehicle}</p><b>${s.active ? "HABILITADO" : "DESHABILITADO"}</b></article>`,
    ),
  );
  const html = `<!doctype html><html lang="es"><meta charset="utf-8"><meta name="viewport" content="width=device-width, initial-scale=1"><title>Credenciales de prueba · AccesoUni</title><style>*{box-sizing:border-box}body{margin:32px;background:#f3f7fa;color:#063e55;font-family:Arial,sans-serif}h1{font-size:32px}p{color:#636466;line-height:1.6}main{display:flex;flex-wrap:wrap;gap:24px}article{width:320px;padding:24px;background:white;border:1px solid #dce5eb;border-radius:20px;break-inside:avoid}header{font-size:24px;font-weight:900}header span{display:block;font-size:10px;letter-spacing:2px;color:#007faf;margin-top:12px}h2{font-size:22px;margin-bottom:4px}h3{text-align:center;letter-spacing:3px;font-size:24px}.qr{max-width:240px;margin:auto}.qr svg{width:100%}b{color:#007faf;font-size:12px}@media print{body{margin:8mm;background:white}main{gap:6mm}article{width:80mm;padding:5mm}h1{font-size:22px}}</style><h1>Credenciales para la exposición</h1><p>Datos ficticios. Abre esta página en otra pantalla o imprímela. En el teléfono: Control de acceso → Entrada → Activar lector. Compara los datos y confirma.</p><main>${cards.join("")}</main><p>Para probar una matrícula desconocida escribe 99999999. Estos códigos no son credenciales de la universidad.</p></html>`;
  fs.writeFileSync(path.join(__dirname, "../CREDENCIALES.html"), html);
  console.log("CREDENCIALES.html generado con tres QR de demostración.");
})();
