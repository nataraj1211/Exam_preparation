/**
 * Document Chunking and RAG Retrieval Engine
 */

export function chunkDocument(text, chunkSize = 1500, overlap = 300) {
  if (!text || typeof text !== 'string') return [];

  const chunks = [];
  // Split by double newlines or paragraph breaks first
  const paragraphs = text.split(/\n\s*\n/);
  let currentChunk = '';
  let chunkIndex = 0;

  for (const para of paragraphs) {
    const trimmed = para.trim();
    if (!trimmed) continue;

    if ((currentChunk + '\n\n' + trimmed).length <= chunkSize) {
      currentChunk = currentChunk ? `${currentChunk}\n\n${trimmed}` : trimmed;
    } else {
      if (currentChunk) {
        chunks.push({
          id: `chunk_${chunkIndex++}`,
          text: currentChunk,
          charCount: currentChunk.length
        });
      }
      
      // If a single paragraph is longer than chunkSize, slide across it
      if (trimmed.length > chunkSize) {
        let start = 0;
        while (start < trimmed.length) {
          const slice = trimmed.slice(start, start + chunkSize);
          chunks.push({
            id: `chunk_${chunkIndex++}`,
            text: slice,
            charCount: slice.length
          });
          start += chunkSize - overlap;
        }
        currentChunk = '';
      } else {
        currentChunk = trimmed;
      }
    }
  }

  if (currentChunk.trim()) {
    chunks.push({
      id: `chunk_${chunkIndex++}`,
      text: currentChunk,
      charCount: currentChunk.length
    });
  }

  return chunks;
}

// Tokenize text for term-frequency retrieval
function tokenize(text) {
  return text
    .toLowerCase()
    .replace(/[^\w\s]/g, ' ')
    .split(/\s+/)
    .filter(token => token.length > 2 && !STOP_WORDS.has(token));
}

const STOP_WORDS = new Set([
  'the', 'is', 'at', 'which', 'on', 'and', 'a', 'an', 'in', 'to', 'for', 'of',
  'with', 'as', 'by', 'that', 'this', 'it', 'from', 'are', 'be', 'or', 'was',
  'what', 'how', 'when', 'where', 'why', 'who', 'does', 'did', 'have', 'has'
]);

/**
 * Retrieve top-K relevant chunks for a question using TF-IDF / BM25 style relevance scoring
 */
export function retrieveRelevantChunks(chunks, query, topK = 4) {
  if (!chunks || chunks.length === 0) return [];
  if (chunks.length <= topK) return chunks;

  const queryTokens = tokenize(query);
  if (queryTokens.length === 0) {
    return chunks.slice(0, topK);
  }

  // Calculate scores for each chunk
  const scoredChunks = chunks.map(chunk => {
    const chunkTokens = tokenize(chunk.text);
    const chunkTokenCounts = {};
    for (const t of chunkTokens) {
      chunkTokenCounts[t] = (chunkTokenCounts[t] || 0) + 1;
    }

    let score = 0;
    for (const qt of queryTokens) {
      if (chunkTokenCounts[qt]) {
        // Higher score for frequency and rarity
        score += chunkTokenCounts[qt] * 1.5;
      }
      // Partial / substring match bonus
      if (chunk.text.toLowerCase().includes(qt)) {
        score += 1.0;
      }
    }

    // Exact phrase match bonus
    const cleanQuery = query.toLowerCase().trim();
    if (cleanQuery.length > 4 && chunk.text.toLowerCase().includes(cleanQuery)) {
      score += 10.0;
    }

    return { ...chunk, score };
  });

  // Sort descending by relevance score
  scoredChunks.sort((a, b) => b.score - a.score);

  // Return topK chunks that have non-zero relevance, or fallback to first chunks
  const top = scoredChunks.slice(0, topK);
  return top.some(c => c.score > 0) ? top.filter(c => c.score > 0) : chunks.slice(0, topK);
}
