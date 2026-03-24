import { pipeline } from '@xenova/transformers';
import type { KnowledgeIndex, SearchResult, Embedding } from './types.js';

let embedderInstance: any = null;
const EMBEDDING_MODEL = 'Xenova/all-MiniLM-L6-v2';

/**
 * Initialize the embedding model (lazy loading)
 */
async function getEmbedder() {
  if (!embedderInstance) {
    embedderInstance = await pipeline('feature-extraction', EMBEDDING_MODEL);
  }
  return embedderInstance;
}

/**
 * Calculate cosine similarity between two vectors
 */
function cosineSimilarity(vecA: number[], vecB: number[]): number {
  if (vecA.length !== vecB.length) {
    throw new Error('Vectors must have the same length');
  }
  
  let dotProduct = 0;
  let normA = 0;
  let normB = 0;
  
  for (let i = 0; i < vecA.length; i++) {
    dotProduct += vecA[i] * vecB[i];
    normA += vecA[i] * vecA[i];
    normB += vecB[i] * vecB[i];
  }
  
  return dotProduct / (Math.sqrt(normA) * Math.sqrt(normB));
}

/**
 * Generate embedding for a query string
 */
export async function generateQueryEmbedding(query: string): Promise<number[]> {
  const embedder = await getEmbedder();
  
  const output = await embedder(query, {
    pooling: 'mean',
    normalize: true
  });
  
  return Array.from(output.data as Float32Array);
}

/**
 * Search the knowledge base using semantic similarity
 */
export async function searchKnowledgeBase(
  index: KnowledgeIndex,
  query: string,
  limit: number = 10
): Promise<SearchResult[]> {
  // Generate embedding for the query
  const queryVector = await generateQueryEmbedding(query);
  
  // Calculate similarity scores for all entries
  const scores: Array<{ name: string; score: number }> = [];
  
  for (const embedding of index.embeddings) {
    const score = cosineSimilarity(queryVector, embedding.vector);
    scores.push({ name: embedding.name, score });
  }
  
  // Sort by score descending and take top N
  scores.sort((a, b) => b.score - a.score);
  const topResults = scores.slice(0, limit);
  
  // Map to SearchResult with entry metadata and full content
  const results: SearchResult[] = topResults.map(({ name, score }) => {
    const entry = index.entries.find(e => e.name === name);
    if (!entry) {
      throw new Error(`Entry not found: ${name}`);
    }
    
    return {
      name: entry.name,
      description: entry.description,
      content: entry.content,
      category: entry.category,
      relevanceScore: Math.round(score * 100) / 100
    };
  });
  
  return results;
}

