/**
 * Field Repository — Persistent store of discovered bizevent field schemas.
 * 
 * When journeys are simulated, the additionalFields from each run are captured
 * here so Ollama can reference them instantly without querying Grail.
 * 
 * Storage: data/field-repo.json
 * Key: "companyName|journeyType" (lowercased)
 * Value: { fields[], services[], steps[], lastUpdated, runCount }
 */

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const DATA_DIR = path.join(__dirname, '..', 'data');
const REPO_FILE = path.join(DATA_DIR, 'field-repo.json');

// In-memory cache
let _repo = null;

function ensureDataDir() {
  if (!fs.existsSync(DATA_DIR)) {
    fs.mkdirSync(DATA_DIR, { recursive: true });
  }
}

function loadRepo() {
  if (_repo) return _repo;
  try {
    ensureDataDir();
    if (fs.existsSync(REPO_FILE)) {
      const raw = fs.readFileSync(REPO_FILE, 'utf-8');
      _repo = JSON.parse(raw);
    } else {
      _repo = {};
    }
  } catch (err) {
    console.warn('[field-repo] Failed to load repo, starting fresh:', err.message);
    _repo = {};
  }
  return _repo;
}

function saveRepo() {
  try {
    ensureDataDir();
    fs.writeFileSync(REPO_FILE, JSON.stringify(_repo, null, 2), 'utf-8');
  } catch (err) {
    console.error('[field-repo] Failed to save repo:', err.message);
  }
}

/**
 * Build a repo key from company + journey
 */
function repoKey(companyName, journeyType) {
  return `${(companyName || '').toLowerCase().trim()}|${(journeyType || '').toLowerCase().trim()}`;
}

/**
 * Classify a value as numeric or string
 */
function classifyValue(value) {
  if (value === null || value === undefined || value === '') return null;
  const str = String(value);
  if (str === '' || str === 'null' || str === 'undefined') return null;
  const num = Number(str);
  if (!isNaN(num) && str.trim() !== '') {
    return { type: 'numeric', sampleValue: num };
  }
  return { type: 'string', sampleValue: str };
}

/**
 * Capture field schema from a completed journey's additionalFields.
 * Called after journey simulation completes.
 * 
 * @param {string} companyName
 * @param {string} journeyType
 * @param {object} additionalFields - The additionalFields object from the journey payload
 * @param {string[]} services - Service names used in the journey
 * @param {string[]} steps - Step names in the journey
 */
export function captureFields(companyName, journeyType, additionalFields, services = [], steps = []) {
  if (!companyName || !journeyType || !additionalFields) return;

  const repo = loadRepo();
  const key = repoKey(companyName, journeyType);

  // Extract fields with type classification
  const fields = [];
  for (const [fieldName, value] of Object.entries(additionalFields)) {
    const classification = classifyValue(value);
    if (classification) {
      fields.push({
        name: fieldName,
        ...classification,
      });
    }
  }

  if (fields.length === 0) return;

  const existing = repo[key];
  const runCount = (existing?.runCount || 0) + 1;

  // Merge: keep existing fields + add any new ones from this run
  const fieldMap = new Map();
  if (existing?.fields) {
    for (const f of existing.fields) {
      fieldMap.set(f.name, f);
    }
  }
  for (const f of fields) {
    // Update with latest sample value, but don't overwrite type if already known
    const prev = fieldMap.get(f.name);
    if (prev) {
      fieldMap.set(f.name, { ...prev, sampleValue: f.sampleValue });
    } else {
      fieldMap.set(f.name, f);
    }
  }

  // Merge services and steps (unique, preserve order)
  const mergedServices = [...new Set([...(existing?.services || []), ...services])];
  const mergedSteps = [...new Set([...(existing?.steps || []), ...steps])];

  repo[key] = {
    companyName,
    journeyType,
    fields: [...fieldMap.values()],
    services: mergedServices,
    steps: mergedSteps,
    lastUpdated: new Date().toISOString(),
    runCount,
  };

  _repo = repo;

  // Debounced save — we don't need to save on every single journey if they're rapid-fire
  if (!captureFields._saveTimer) {
    captureFields._saveTimer = setTimeout(() => {
      saveRepo();
      captureFields._saveTimer = null;
      console.log(`[field-repo] 💾 Saved field repo (${Object.keys(_repo).length} entries)`);
    }, 2000);
  }
}

/**
 * Get the field schema for a company/journey from the repo.
 * Returns null if not found.
 */
export function getFields(companyName, journeyType) {
  const repo = loadRepo();
  const key = repoKey(companyName, journeyType);
  return repo[key] || null;
}

/**
 * Get all entries in the field repo.
 */
export function getAllEntries() {
  return loadRepo();
}

/**
 * Get a summary of all known company/journey combos for Ollama context.
 */
export function getRepoSummary() {
  const repo = loadRepo();
  return Object.values(repo).map(entry => ({
    companyName: entry.companyName,
    journeyType: entry.journeyType,
    fieldCount: entry.fields?.length || 0,
    numericFields: entry.fields?.filter(f => f.type === 'numeric').length || 0,
    categoricalFields: entry.fields?.filter(f => f.type === 'string').length || 0,
    services: entry.services || [],
    steps: entry.steps || [],
    runCount: entry.runCount || 0,
    lastUpdated: entry.lastUpdated,
  }));
}

// Force a save (e.g., on shutdown)
export function flushRepo() {
  if (_repo) {
    if (captureFields._saveTimer) {
      clearTimeout(captureFields._saveTimer);
      captureFields._saveTimer = null;
    }
    saveRepo();
  }
}
