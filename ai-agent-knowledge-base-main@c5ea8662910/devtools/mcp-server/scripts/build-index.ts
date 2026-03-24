#!/usr/bin/env tsx

import { readdir, readFile, writeFile, mkdir } from 'fs/promises';
import { join, relative, sep, dirname } from 'path';
import { pipeline } from '@xenova/transformers';

interface KnowledgeEntry {
  name: string;
  description: string;
  content: string;
  category: string;
  filePath: string;
}

interface Embedding {
  name: string;
  vector: number[];
}

interface KnowledgeIndex {
  entries: KnowledgeEntry[];
  embeddings: Embedding[];
  metadata: {
    buildDate: string;
    entryCount: number;
    embeddingModel: string;
  };
}

const KB_PATH = join(process.cwd(), '..', '..', 'knowledge-base');
const OUTPUT_PATH = join(process.cwd(), 'data', 'index.json');
const EMBEDDING_MODEL = 'Xenova/all-MiniLM-L6-v2';

/**
 * Recursively find all markdown files in a directory
 */
async function findMarkdownFiles(dir: string, files: string[] = []): Promise<string[]> {
  const entries = await readdir(dir, { withFileTypes: true });
  
  for (const entry of entries) {
    const fullPath = join(dir, entry.name);
    
    if (entry.isDirectory()) {
      await findMarkdownFiles(fullPath, files);
    } else if (entry.isFile() && entry.name.endsWith('.md') && entry.name !== 'index.md') {
      files.push(fullPath);
    }
  }
  
  return files;
}

/**
 * Extract description from markdown content
 * Uses the first paragraph or heading content
 */
function extractDescription(content: string): string {
  const lines = content.split('\n').filter(line => line.trim());
  
  // Skip the main title (first # heading)
  let startIdx = 0;
  if (lines[0]?.startsWith('#')) {
    startIdx = 1;
  }
  
  // Find first non-empty, non-heading line
  for (let i = startIdx; i < lines.length; i++) {
    const line = lines[i].trim();
    if (line && !line.startsWith('#') && !line.startsWith('```')) {
      // Clean up markdown formatting
      return line
        .replace(/\*\*/g, '')
        .replace(/\*/g, '')
        .replace(/\[([^\]]+)\]\([^)]+\)/g, '$1')
        .substring(0, 200);
    }
  }
  
  return 'No description available';
}

/**
 * Derive category from file path
 */
function extractCategory(filePath: string, kbPath: string): string {
  const rel = relative(kbPath, filePath);
  const parts = rel.split(sep);
  
  // Remove 'documentation' if present and filename
  const categoryParts = parts.filter(p => p !== 'documentation' && !p.endsWith('.md'));
  
  return categoryParts.length > 0 ? categoryParts.join(' / ') : 'General';
}

/**
 * Create entry name from file path
 */
function createEntryName(filePath: string, kbPath: string): string {
  const rel = relative(kbPath, filePath);
  return rel.replace(/\.md$/, '');
}

/**
 * Process all markdown files and create knowledge entries
 */
async function buildKnowledgeEntries(): Promise<KnowledgeEntry[]> {
  console.log('📚 Scanning knowledge base...');
  const files = await findMarkdownFiles(KB_PATH);
  console.log(`Found ${files.length} markdown files`);
  
  const entries: KnowledgeEntry[] = [];
  
  for (const file of files) {
    try {
      const content = await readFile(file, 'utf-8');
      const name = createEntryName(file, KB_PATH);
      const description = extractDescription(content);
      const category = extractCategory(file, KB_PATH);
      const filePath = relative(join(process.cwd(), '..'), file);
      
      entries.push({
        name,
        description,
        content,
        category,
        filePath
      });
      
      console.log(`  ✓ ${name}`);
    } catch (error) {
      console.error(`  ✗ Failed to process ${file}:`, error);
    }
  }
  
  return entries;
}

/**
 * Generate embeddings for all entries using transformer model
 */
async function generateEmbeddings(entries: KnowledgeEntry[]): Promise<Embedding[]> {
  console.log('\n🧠 Generating embeddings...');
  console.log(`Using model: ${EMBEDDING_MODEL}`);
  
  // Load the embedding model
  const embedder = await pipeline('feature-extraction', EMBEDDING_MODEL);
  
  const embeddings: Embedding[] = [];
  
  for (let i = 0; i < entries.length; i++) {
    const entry = entries[i];
    console.log(`  [${i + 1}/${entries.length}] ${entry.name}`);
    
    // Create text to embed: combine name, description, and content (truncated)
    const textToEmbed = `${entry.name}\n${entry.description}\n${entry.content.substring(0, 1000)}`;
    
    try {
      const output = await embedder(textToEmbed, {
        pooling: 'mean',
        normalize: true
      });
      
      // Convert tensor to array
      const vector = Array.from(output.data as Float32Array);
      
      embeddings.push({
        name: entry.name,
        vector
      });
    } catch (error) {
      console.error(`  ✗ Failed to generate embedding for ${entry.name}:`, error);
    }
  }
  
  console.log(`✓ Generated ${embeddings.length} embeddings`);
  return embeddings;
}

/**
 * Build and save the complete knowledge index
 */
async function buildIndex(): Promise<void> {
  console.log('🚀 Building Knowledge Base Index\n');
  
  const entries = await buildKnowledgeEntries();
  const embeddings = await generateEmbeddings(entries);
  
  const index: KnowledgeIndex = {
    entries,
    embeddings,
    metadata: {
      buildDate: new Date().toISOString(),
      entryCount: entries.length,
      embeddingModel: EMBEDDING_MODEL
    }
  };
  
  console.log('\n💾 Saving index...');
  // Ensure the data directory exists
  await mkdir(dirname(OUTPUT_PATH), { recursive: true });
  await writeFile(OUTPUT_PATH, JSON.stringify(index, null, 2));
  console.log(`✓ Index saved to ${OUTPUT_PATH}`);
  
  console.log('\n📊 Summary:');
  console.log(`  Entries: ${index.metadata.entryCount}`);
  console.log(`  Embeddings: ${embeddings.length}`);
  console.log(`  Model: ${index.metadata.embeddingModel}`);
  console.log(`  Build Date: ${index.metadata.buildDate}`);
  console.log('\n✅ Index build complete!');
}

// Run the build
buildIndex().catch(error => {
  console.error('❌ Build failed:', error);
  process.exit(1);
});
