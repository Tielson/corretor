/**
 * Gera a planta DEMONSTRATIVA do empreendimento "Terras do Cafezal"
 * (plan.kind = 'imagem'): um PNG para ampliar e um PDF para baixar.
 *
 * Uso: pnpm demo:planta
 * Ao receber a planta real, substitua os arquivos em public/demo/ e
 * atualize imageUrl/pdfUrl em src/data/listings/terras-do-cafezal.ts.
 */
import { writeFile } from 'node:fs/promises';
import sharp from 'sharp';
import { PDFDocument, StandardFonts, rgb } from 'pdf-lib';

const W = 1600;
const H = 1100;

// Glebas desenhadas à mão para ilustração. Não são geometria cadastrada.
const glebas = [
  { n: '1', pts: '140,190 420,170 440,470 150,500', status: 'Disponível' },
  { n: '2', pts: '420,170 700,160 715,455 440,470', status: 'Vendido' },
  { n: '3', pts: '700,160 980,165 985,450 715,455', status: 'Disponível' },
  { n: '4', pts: '980,165 1290,180 1300,440 985,450', status: 'Sob consulta' },
  { n: '5', pts: '150,600 470,575 480,900 170,930', status: 'Reservado' },
  { n: '6', pts: '470,575 800,560 810,885 480,900', status: 'Disponível' },
  { n: '7', pts: '800,560 1140,555 1160,870 810,885', status: 'Disponível' },
  { n: '8', pts: '1140,555 1460,560 1470,860 1160,870', status: 'Sob consulta' },
];

const fill = {
  'Disponível': '#e1eedd',
  'Reservado': '#f8ecc9',
  'Vendido': '#e7e2dc',
  'Sob consulta': '#dde6ee',
};

const centroid = (pts) => {
  const p = pts.split(' ').map((s) => s.split(',').map(Number));
  return [p.reduce((a, b) => a + b[0], 0) / p.length, p.reduce((a, b) => a + b[1], 0) / p.length];
};

const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="${W}" height="${H}" viewBox="0 0 ${W} ${H}">
  <rect width="100%" height="100%" fill="#fcfbf6"/>
  <g stroke="#e6d8b8" stroke-width="2" fill="none" opacity="0.9">
    ${Array.from({ length: 9 }, (_, i) => `<path d="M0 ${120 + i * 115} C 400 ${80 + i * 118}, 1000 ${170 + i * 110}, 1600 ${110 + i * 116}"/>`).join('')}
  </g>
  <path d="M60 530 C 500 520, 1100 505, 1560 515" stroke="#b9ab8a" stroke-width="46" fill="none" stroke-linecap="round"/>
  <path d="M60 530 C 500 520, 1100 505, 1560 515" stroke="#efe5cc" stroke-width="38" fill="none" stroke-linecap="round"/>
  <text x="800" y="522" font-family="Arial, sans-serif" font-size="22" fill="#59605a" text-anchor="middle">Estrada interna</text>
  ${glebas
    .map((g) => {
      const [cx, cy] = centroid(g.pts);
      return `<polygon points="${g.pts}" fill="${fill[g.status]}" stroke="#1e3a2b" stroke-width="3"/>
      <text x="${cx}" y="${cy - 6}" font-family="Arial, sans-serif" font-size="44" font-weight="700" fill="#1e3a2b" text-anchor="middle">${g.n}</text>
      <text x="${cx}" y="${cy + 30}" font-family="Arial, sans-serif" font-size="22" fill="#1b1f1c" text-anchor="middle">${g.status}</text>`;
    })
    .join('')}
  <rect x="60" y="990" width="1480" height="70" rx="10" fill="#1e3a2b"/>
  <text x="90" y="1034" font-family="Arial, sans-serif" font-size="26" fill="#fcfbf6">Terras do Cafezal · Planta demonstrativa, fora de escala. Não é levantamento técnico.</text>
  <text x="1520" y="1034" font-family="Arial, sans-serif" font-size="22" fill="#e6d8b8" text-anchor="end">N ↑</text>
  <text x="60" y="80" font-family="Arial, sans-serif" font-size="40" font-weight="700" fill="#1e3a2b">Terras do Cafezal</text>
  <text x="60" y="118" font-family="Arial, sans-serif" font-size="24" fill="#59605a">Divisão ilustrativa das 8 glebas. Situação atualizada no site.</text>
</svg>`;

const png = await sharp(Buffer.from(svg)).png({ compressionLevel: 9 }).toBuffer();
await writeFile('public/demo/planta-terras-do-cafezal.png', png);

const pdf = await PDFDocument.create();
pdf.setTitle('Terras do Cafezal: planta demonstrativa');
pdf.setSubject('Planta ilustrativa, fora de escala. Não é levantamento técnico.');
const page = pdf.addPage([W * 0.5, H * 0.5 + 40]);
const img = await pdf.embedPng(png);
page.drawImage(img, { x: 0, y: 40, width: W * 0.5, height: H * 0.5 });
const font = await pdf.embedFont(StandardFonts.Helvetica);
page.drawText('Documento demonstrativo gerado para o catalogo de exemplo. Confirme medidas no levantamento oficial.', {
  x: 20,
  y: 16,
  size: 9,
  font,
  color: rgb(0.35, 0.38, 0.35),
});
await writeFile('public/demo/planta-terras-do-cafezal.pdf', await pdf.save());

console.log('Planta demonstrativa gerada em public/demo/ (PNG + PDF).');
