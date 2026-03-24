/**
 * Represents a knowledge base entry with metadata
 */
export interface KnowledgeEntry {
  /** Unique identifier for the entry (file path based) */
  name: string;
  /** Brief description of the entry content */
  description: string;
  /** Full markdown content */
  content: string;
  /** Category/domain of the entry */
  category: string;
  /** File path relative to knowledge-base directory */
  filePath: string;
}

/**
 * Vector embedding for semantic search
 */
export interface Embedding {
  /** Entry name this embedding belongs to */
  name: string;
  /** Vector representation of the entry */
  vector: number[];
}

/**
 * Index containing all entries and embeddings
 */
export interface KnowledgeIndex {
  /** All knowledge base entries */
  entries: KnowledgeEntry[];
  /** Pre-computed embeddings for semantic search */
  embeddings: Embedding[];
  /** Metadata about the index */
  metadata: {
    buildDate: string;
    entryCount: number;
    embeddingModel: string;
  };
}

/**
 * Search result with relevance score and full content
 */
export interface SearchResult {
  name: string;
  description: string;
  content: string;
  category: string;
  relevanceScore: number;
}
