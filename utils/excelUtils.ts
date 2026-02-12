
import { Lawyer, GreenVote } from '../types';

declare const XLSX: any;

/**
 * Normaliza un string para comparaciones (sin espacios, minúsculas, sin acentos básicos)
 */
const normalize = (str: any): string => {
  if (str === undefined || str === null) return '';
  return String(str)
    .toLowerCase()
    .trim()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "") // Quitar acentos
    .replace(/\s/g, '');
};

/**
 * Busca el índice de una columna basado en alias
 */
const findColumnIndex = (headerRow: any[], aliases: string[]): number => {
  const normalizedAliases = aliases.map(a => normalize(a));
  
  for (let i = 0; i < headerRow.length; i++) {
    const cellValue = normalize(headerRow[i]);
    if (!cellValue) continue;
    
    // Verificamos si algún alias está contenido en la celda o viceversa
    if (normalizedAliases.some(alias => cellValue.includes(alias) || alias.includes(cellValue))) {
      return i;
    }
  }
  return -1;
};

export const processExcelFile = (file: File, type: 'padron' | 'votos-verdes'): Promise<(Lawyer | GreenVote)[]> => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = (e) => {
      try {
        const data = new Uint8Array(e.target?.result as ArrayBuffer);
        const workbook = XLSX.read(data, { type: 'array' });
        
        if (!workbook.SheetNames.length) {
          throw new Error("El archivo Excel no tiene hojas.");
        }

        const firstSheetName = workbook.SheetNames[0];
        const worksheet = workbook.Sheets[firstSheetName];
        
        // Obtenemos los datos como una matriz de matrices (filas y columnas puras)
        const rows: any[][] = XLSX.utils.sheet_to_json(worksheet, { header: 1, defval: "" });

        if (rows.length === 0) {
          throw new Error("El archivo está vacío.");
        }

        // Definición de alias para las búsquedas
        const aliasTomo = ['tomo', 'libro', 'tmo', 't.', 't'];
        const aliasFolio = ['folio', 'fol', 'f.', 'pag', 'pág', 'f'];
        const aliasApellido = ['apellido', 'ape', 'apell', 'last'];
        const aliasNombre = ['nombre', 'nom', 'first'];
        const aliasReferente = ['referente', 'ref', 'puntero', 'responsable', 'lista'];

        // Intentamos encontrar la fila de cabecera (la que tiene "tomo" o "folio")
        let headerIdx = -1;
        for (let i = 0; i < Math.min(rows.length, 10); i++) {
          const row = rows[i];
          if (row.some(cell => {
            const n = normalize(cell);
            return n === 'tomo' || n === 'folio' || n === 'apellido';
          })) {
            headerIdx = i;
            break;
          }
        }

        // Si no encontramos cabecera por nombre, asumimos que empieza en la fila 0
        const headerRow = headerIdx !== -1 ? rows[headerIdx] : rows[0];
        const dataStartIdx = headerIdx !== -1 ? headerIdx + 1 : 0;

        // Mapeamos los índices de las columnas
        let idxTomo = findColumnIndex(headerRow, aliasTomo);
        let idxFolio = findColumnIndex(headerRow, aliasFolio);
        let idxApellido = findColumnIndex(headerRow, aliasApellido);
        let idxNombre = findColumnIndex(headerRow, aliasNombre);
        let idxReferente = findColumnIndex(headerRow, aliasReferente);

        // Fallback por posición si fallan los nombres (según el orden pedido por el usuario)
        // Tomo (0), Folio (1), Apellido (2), Nombre (3), Referente (4)
        if (idxTomo === -1) idxTomo = 0;
        if (idxFolio === -1) idxFolio = 1;
        if (idxApellido === -1) idxApellido = 2;
        if (idxNombre === -1) idxNombre = 3;
        if (type === 'votos-verdes' && idxReferente === -1) idxReferente = 4;

        console.log("Mapeo de columnas:", { idxTomo, idxFolio, idxApellido, idxNombre, idxReferente });

        const dataRows = rows.slice(dataStartIdx);
        
        if (type === 'padron') {
          const results: Lawyer[] = dataRows
            .map(row => ({
              tomo: String(row[idxTomo] || '').trim(),
              folio: String(row[idxFolio] || '').trim(),
              apellido: String(row[idxApellido] || '').trim(),
              nombre: String(row[idxNombre] || '').trim(),
            }))
            .filter(r => r.tomo !== '' && r.folio !== '');
          
          if (results.length === 0) {
            throw new Error("No se encontraron datos de Padrón válidos en las columnas detectadas.");
          }
          resolve(results);
        } else {
          const map = new Map<string, GreenVote>();
          
          dataRows.forEach((row) => {
            const tomo = String(row[idxTomo] || '').trim();
            const folio = String(row[idxFolio] || '').trim();
            const apellido = String(row[idxApellido] || '').trim();
            const nombre = String(row[idxNombre] || '').trim();
            const referente = String(row[idxReferente] || 'Sin Referente').trim();

            if (tomo && folio) {
              const key = `${tomo}-${folio}`;
              if (map.has(key)) {
                const existing = map.get(key)!;
                if (!existing.referentes.includes(referente)) {
                  existing.referentes.push(referente);
                }
              } else {
                map.set(key, {
                  tomo,
                  folio,
                  apellido,
                  nombre,
                  referentes: [referente]
                });
              }
            }
          });

          const finalResults = Array.from(map.values());
          if (finalResults.length === 0) {
            throw new Error("No se pudo procesar ningún Voto Verde. Verifique que el archivo tenga datos en las columnas de Tomo y Folio.");
          }
          resolve(finalResults);
        }
      } catch (err: any) {
        console.error("Error detallado de Excel:", err);
        reject(err.message || "Error al procesar el archivo Excel.");
      }
    };
    reader.onerror = () => reject("Error al leer el archivo físico.");
    reader.readAsArrayBuffer(file);
  });
};
