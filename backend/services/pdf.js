import pdfParse from 'pdf-parse';

const DEFAULT_CHUNK_SIZE = 1500; // rough chars ~500 tokens
const DEFAULT_CHUNK_OVERLAP = 200;

export async function extractTextFromPdf(buffer) {
  if (!buffer?.length) {
    throw new Error('No PDF buffer received');
  }
  const data = await pdfParse(buffer);
  if (!data?.text?.trim()) {
    throw new Error('Unable to extract text from PDF');
  }
  return data.text;
}

export function chunkText(text, chunkSize = DEFAULT_CHUNK_SIZE, overlap = DEFAULT_CHUNK_OVERLAP) {
  const sanitized = text.replace(/\s+/g, ' ').trim();
  if (!sanitized) {
    throw new Error('No text provided for chunking');
  }
  const chunks = [];
  let start = 0;
  let chunkIndex = 0;
  while (start < sanitized.length) {
    const end = Math.min(start + chunkSize, sanitized.length);
    const slice = sanitized.slice(start, end).trim();
    if (slice) {
      chunks.push({
        id: chunkIndex,
        text: slice,
      });
      chunkIndex += 1;
    }
    if (end === sanitized.length) break;
    start = end - overlap;
    if (start < 0) start = 0;
  }
  return chunks;
}
