import pdfParse from 'pdf-parse';

const DEFAULT_CHUNK_SIZE = Number(process.env.CHUNK_SIZE ?? 1500);
const DEFAULT_CHUNK_OVERLAP = Number(process.env.CHUNK_OVERLAP ?? 200);

export async function extractTextFromPdf(buffer: Buffer) {
  const parsed = await pdfParse(buffer);
  return parsed.text ?? '';
}

export function chunkText(text: string, chunkSize = DEFAULT_CHUNK_SIZE, overlap = DEFAULT_CHUNK_OVERLAP) {
  const normalized = text.replace(/\s+/g, ' ').trim();
  const chunks: { id: string; text: string }[] = [];
  let start = 0;
  let id = 0;
  while (start < normalized.length) {
    const end = Math.min(start + chunkSize, normalized.length);
    const slice = normalized.slice(start, end).trim();
    if (slice) {
      chunks.push({ id: `${id}`, text: slice });
      id += 1;
    }
    if (end === normalized.length) break;
    start = Math.max(0, end - overlap);
  }
  return chunks;
}
