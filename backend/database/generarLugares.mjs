// Genera database/seed/lugares.json a partir de:
//   - frontend/data/places.js        (datos de los 10 lugares de prueba)
//   - backend/src/main/resources/corpus/*.md  (fuentes consultadas por el RAG)
// Uso, desde la raíz del repositorio:  node backend/database/generarLugares.mjs
import { readFileSync, writeFileSync, readdirSync, mkdtempSync } from 'node:fs';
import { join, dirname } from 'node:path';
import { tmpdir } from 'node:os';
import { fileURLToPath, pathToFileURL } from 'node:url';

const root = join(dirname(fileURLToPath(import.meta.url)), '..', '..');
const tmp = join(mkdtempSync(join(tmpdir(), 'retazo-')), 'places.mjs');
writeFileSync(tmp, readFileSync(join(root, 'frontend', 'data', 'places.js'), 'utf8'));
const { PLACES } = await import(pathToFileURL(tmp).href);

// Metadatos de cada fuente del corpus (encabezado entre ---).
const corpusDir = join(root, 'backend', 'src', 'main', 'resources', 'corpus');
const fuentesPorLugar = {};
for (const file of readdirSync(corpusDir).filter((f) => f.endsWith('.md')).sort()) {
  const text = readFileSync(join(corpusDir, file), 'utf8').replace(/\r\n/g, '\n');
  const meta = Object.fromEntries(
    text.split('\n---')[0].split('\n').slice(1)
      .filter((l) => l.includes(':'))
      .map((l) => [l.slice(0, l.indexOf(':')).trim(), l.slice(l.indexOf(':') + 1).trim()]),
  );
  const tipo = /wikipedia|wikiwand/i.test(meta.fuente) ? 'WEB'
    : /alcald|colombia travel|procolombia/i.test(meta.fuente) ? 'ENTIDAD'
    : 'ARTICULO';
  (fuentesPorLugar[meta.placeId] ??= []).push({
    titulo: meta.titulo, detalle: meta.fuente, tipo, url: meta.url || null, verificada: false,
  });
}

const lugares = PLACES.map((p) => ({
  id: p.id, nombre: p.nombre, sector: p.sector, ciudad: p.ciudad, pais: p.pais,
  siglo: p.siglo, epoca: p.epoca, coords: p.coords,
  imagen: p.imagen ?? null, imagenActual: p.imagenActual ?? null,
  descripcion: p.descripcion,
  fotosHistoricas: p.fotosHistoricas ?? [], historia: p.historia ?? [],
  fuentes: fuentesPorLugar[p.id] ?? [],
}));
const out = join(root, 'backend', 'database', 'seed', 'lugares.json');
writeFileSync(out, JSON.stringify(lugares, null, 2) + '\n');
console.log(`Generados ${lugares.length} lugares (${Object.values(fuentesPorLugar).flat().length} fuentes) en ${out}`);
