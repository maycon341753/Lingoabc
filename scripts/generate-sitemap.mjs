import { writeFileSync, mkdirSync } from "node:fs";
import { dirname, join } from "node:path";

const siteUrlRaw = String(process.env.SITE_URL ?? process.env.VITE_SITE_URL ?? "https://lingoabc.com").replace(/\/+$/, "");
const siteUrl = siteUrlRaw || "https://lingoabc.com";

const routes = [
  "/",
  "/planos",
  "/modulos",
  "/modulos/matematica/descoberta",
  "/modulos/matematica/construcao",
  "/modulos/matematica/desenvolvimento",
  "/modulos/matematica/dominio",
  "/modulos/portugues/descoberta",
  "/modulos/portugues/construcao",
  "/modulos/portugues/desenvolvimento",
  "/modulos/portugues/dominio",
  "/modulos/ingles/descoberta",
  "/modulos/ingles/construcao",
  "/modulos/ingles/desenvolvimento",
  "/modulos/ingles/dominio",
  "/videos",
  "/sobre",
  "/blog",
  "/blog/como-ensinar-criancas-a-ler-brincando",
  "/blog/melhores-metodos-de-ensino-infantil",
  "/blog/importancia-da-educacao-gamificada",
];

const now = new Date().toISOString();

const xml =
  `<?xml version="1.0" encoding="UTF-8"?>\n` +
  `<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n` +
  routes
    .map((p) => {
      const loc = `${siteUrl}${p}`;
      return `  <url><loc>${loc}</loc><lastmod>${now}</lastmod></url>`;
    })
    .join("\n") +
  `\n</urlset>\n`;

const outPath = join(process.cwd(), "public", "sitemap.xml");
mkdirSync(dirname(outPath), { recursive: true });
writeFileSync(outPath, xml, "utf8");

console.log(`sitemap.xml gerado em: ${outPath}`);
console.log(`SITE_URL: ${siteUrl}`);

