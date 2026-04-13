/**
 * System Maintenance API — Cross-platform disk health & auto-cleanup
 * 
 * DESIGN: Zero-intervention disk management for any VM / cloud / OS.
 * - Runs cleanup every 15 minutes (not just on boot)
 * - Three tiers: NORMAL (<75%), WARNING (75-89%), CRITICAL (90%+)
 * - At WARNING: cleans safe items (caches, temp, logs)
 * - At CRITICAL: cleans everything including aggressive targets
 * - Scans all known cache/temp/log locations across Linux, macOS, Windows
 * - Never deletes user data, source code, node_modules, or .git
 */
import express from 'express';
import { execSync } from 'child_process';
import fs from 'fs';
import path from 'path';
import os from 'os';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const PROJECT_DIR = path.resolve(__dirname, '..');

const router = express.Router();

// ── Thresholds ──────────────────────────────────────────────
const WARN_PERCENT = 75;   // Start cleaning safe items
const CRIT_PERCENT = 90;   // Clean aggressively
const CHECK_INTERVAL_MS = 15 * 60 * 1000; // 15 minutes

// ── Helpers ─────────────────────────────────────────────────

function getDirectorySize(dirPath) {
  let total = 0;
  try {
    if (!fs.existsSync(dirPath)) return 0;
    const entries = fs.readdirSync(dirPath, { withFileTypes: true });
    for (const entry of entries) {
      const fullPath = path.join(dirPath, entry.name);
      try {
        if (entry.isDirectory()) {
          total += getDirectorySize(fullPath);
        } else if (entry.isFile()) {
          total += fs.statSync(fullPath).size;
        }
      } catch { /* permission errors, symlink loops, etc */ }
    }
  } catch { /* inaccessible directories */ }
  return total;
}

function formatBytes(bytes) {
  if (bytes === 0) return '0 B';
  const units = ['B', 'KB', 'MB', 'GB', 'TB'];
  const i = Math.floor(Math.log(bytes) / Math.log(1024));
  return `${(bytes / Math.pow(1024, i)).toFixed(1)} ${units[i]}`;
}

function getDiskUsage() {
  const platform = os.platform();
  try {
    if (platform === 'win32') {
      // PowerShell: get disk info for the drive containing the project
      const drive = PROJECT_DIR.charAt(0).toUpperCase();
      const raw = execSync(
        `powershell -Command "Get-PSDrive ${drive} | Select-Object Used,Free | ConvertTo-Json"`,
        { encoding: 'utf8', timeout: 10000 }
      );
      const info = JSON.parse(raw);
      const used = Number(info.Used);
      const free = Number(info.Free);
      const total = used + free;
      return { total, used, free, percent: Math.round((used / total) * 100), drive: `${drive}:` };
    } else {
      // Linux / macOS: df command
      const raw = execSync(`df -B1 "${PROJECT_DIR}" | tail -1`, { encoding: 'utf8', timeout: 10000 });
      const parts = raw.trim().split(/\s+/);
      // df -B1 output: Filesystem 1B-blocks Used Available Use% Mounted
      const total = parseInt(parts[1]);
      const used = parseInt(parts[2]);
      const free = parseInt(parts[3]);
      const percent = parseInt(parts[4]);
      return { total, used, free, percent, mount: parts[5] };
    }
  } catch (e) {
    return { total: 0, used: 0, free: 0, percent: 0, error: e.message };
  }
}

function findCleanableItems() {
  const items = [];
  const homeDir = os.homedir();
  const platform = os.platform();

  // Helper: add item if path exists and has meaningful size
  const addIfExists = (id, label, dirPath, minBytes, safe, category = 'cache') => {
    try {
      if (fs.existsSync(dirPath)) {
        const size = getDirectorySize(dirPath);
        if (size > minBytes) {
          items.push({ id, label, path: dirPath, size, category, safe });
        }
      }
    } catch { /* permission */ }
  };

  // Helper: add if command output reveals reclaimable bytes (e.g. docker, journalctl)
  const addCmd = (id, label, estimateSize, safe, category = 'system') => {
    if (estimateSize > 0) {
      items.push({ id, label, path: '', size: estimateSize, category, safe, isCommand: true });
    }
  };

  // ── 1. PROJECT CACHES ──
  addIfExists('project-logs', 'Server logs', path.join(PROJECT_DIR, 'logs'), 1024, true, 'logs');
  addIfExists('nm-cache', 'node_modules/.cache', path.join(PROJECT_DIR, 'node_modules', '.cache'), 10240, true);

  // ── 2. NPM / YARN / PNPM CACHES ──
  const npmDir = path.join(homeDir, '.npm');
  for (const sub of ['_npx', '_logs', '_cacache', '_update-notifier-last-checked']) {
    addIfExists(`npm-${sub}`, `npm ${sub}`, path.join(npmDir, sub), 10240, true);
  }
  addIfExists('yarn-cache', 'Yarn cache', path.join(homeDir, '.yarn', 'cache'), 10240, true);
  addIfExists('pnpm-cache', 'pnpm store', path.join(homeDir, '.pnpm-store'), 10240, true);

  // ── 3. TEMP FILES (>24h old) ──
  const tmpDir = os.tmpdir();
  try {
    let tmpCleanable = 0;
    for (const entry of fs.readdirSync(tmpDir, { withFileTypes: true })) {
      try {
        const fp = path.join(tmpDir, entry.name);
        const stat = fs.statSync(fp);
        if (Date.now() - stat.mtimeMs > 86400000) {
          tmpCleanable += entry.isDirectory() ? getDirectorySize(fp) : stat.size;
        }
      } catch { /* permission */ }
    }
    if (tmpCleanable > 10240) {
      items.push({ id: 'temp-files', label: 'Temp files (>24h old)', path: tmpDir, size: tmpCleanable, category: 'temp', safe: true });
    }
  } catch { /* tmpdir inaccessible */ }

  // ── 4. VS CODE SERVER (remote dev) ──
  if (platform === 'linux') {
    addIfExists('vscode-logs', 'VS Code Server logs', path.join(homeDir, '.vscode-server', 'data', 'logs'), 10240, true, 'logs');
    addIfExists('vscode-cacheddata', 'VS Code CachedData', path.join(homeDir, '.vscode-server', 'data', 'CachedData'), 10240, true);
    // Old VS Code workspace storage (can grow huge)
    addIfExists('vscode-workspace-storage', 'VS Code workspace storage', path.join(homeDir, '.vscode-server', 'data', 'User', 'workspaceStorage'), 50 * 1024 * 1024, true);
  }

  // ── 5. PYTHON CACHES (pip, __pycache__) ──
  addIfExists('pip-cache', 'pip cache', path.join(homeDir, '.cache', 'pip'), 10240, true);
  addIfExists('pip-local', 'pip local packages', path.join(homeDir, '.local', 'lib'), 50 * 1024 * 1024, false);

  // ── 6. GO / RUST / MISC DEV CACHES ──
  addIfExists('go-cache', 'Go build cache', path.join(homeDir, '.cache', 'go-build'), 10240, true);
  addIfExists('go-mod', 'Go module cache', path.join(homeDir, 'go', 'pkg', 'mod', 'cache'), 10240, true);
  addIfExists('cargo-cache', 'Cargo registry cache', path.join(homeDir, '.cargo', 'registry', 'cache'), 10240, true);

  // ── 7. CLOUD SDK / CLI CACHES ──
  addIfExists('gcloud-logs', 'gcloud logs', path.join(homeDir, '.config', 'gcloud', 'logs'), 10240, true, 'logs');
  addIfExists('gcloud-cache', 'gcloud cache', path.join(homeDir, '.config', 'gcloud', 'cache'), 10240, true);
  addIfExists('aws-cli-cache', 'AWS CLI cache', path.join(homeDir, '.aws', 'cli', 'cache'), 10240, true);

  // ── 8. DOCKER (if installed) ──
  try {
    const dockerDf = execSync('docker system df --format "{{.Reclaimable}}" 2>/dev/null', { encoding: 'utf8', timeout: 10000 });
    // Parse reclaimable bytes — docker outputs human-readable like "1.2GB"
    const match = dockerDf.match(/([\d.]+)\s*(B|KB|MB|GB|TB)/i);
    if (match) {
      const units = { B: 1, KB: 1024, MB: 1024 ** 2, GB: 1024 ** 3, TB: 1024 ** 4 };
      const reclaimable = parseFloat(match[1]) * (units[match[2].toUpperCase()] || 1);
      if (reclaimable > 50 * 1024 * 1024) { // > 50MB
        addCmd('docker-prune', 'Docker system prune', reclaimable, true, 'docker');
      }
    }
  } catch { /* docker not installed or not running */ }

  // ── 9. GIT GC (compact git objects in project) ──
  try {
    const gitDir = path.join(PROJECT_DIR, '.git');
    if (fs.existsSync(gitDir)) {
      const gitSize = getDirectorySize(gitDir);
      if (gitSize > 100 * 1024 * 1024) { // > 100MB
        items.push({ id: 'git-gc', label: 'Git garbage collection', path: gitDir, size: Math.floor(gitSize * 0.3), category: 'git', safe: true, isCommand: true, note: 'Runs git gc --aggressive' });
      }
    }
  } catch { /* no git */ }

  // ── 10. SYSTEM LOGS (Linux — journald, audit) ──
  if (platform === 'linux') {
    try {
      const journalSize = parseInt(execSync('journalctl --disk-usage 2>/dev/null | grep -oP "\\d+\\.?\\d*[KMGT]"', { encoding: 'utf8', timeout: 5000 }).trim().replace(/[^0-9.]/g, '')) || 0;
      if (journalSize > 50) { // > 50MB
        addCmd('sys-journal', 'System journal logs', journalSize * 1024 * 1024, true, 'system-logs');
      }
    } catch { /* no journalctl or no permission */ }
  }

  // ── 11. macOS SPECIFIC ──
  if (platform === 'darwin') {
    addIfExists('mac-derived-data', 'Xcode DerivedData', path.join(homeDir, 'Library', 'Developer', 'Xcode', 'DerivedData'), 100 * 1024 * 1024, true);
    addIfExists('mac-caches', 'macOS Caches', path.join(homeDir, 'Library', 'Caches'), 100 * 1024 * 1024, false);
  }

  return items;
}

function cleanItem(item) {
  const results = { id: item.id, success: false, freed: 0, message: '' };
  try {
    // ── Command-based cleanups ──
    if (item.isCommand) {
      switch (item.id) {
        case 'docker-prune':
          try {
            execSync('docker system prune -f 2>/dev/null', { timeout: 30000 });
            results.success = true;
            results.freed = item.size;
            results.message = `Docker system prune (${formatBytes(item.size)})`;
          } catch (e) { results.message = `Docker prune failed: ${e.message}`; }
          break;
        case 'git-gc':
          try {
            execSync('git gc --aggressive --prune=now 2>/dev/null', { cwd: PROJECT_DIR, timeout: 120000 });
            results.success = true;
            results.freed = item.size;
            results.message = `Git gc freed ~${formatBytes(item.size)}`;
          } catch (e) { results.message = `Git gc failed: ${e.message}`; }
          break;
        case 'sys-journal':
          try {
            execSync('journalctl --vacuum-size=10M 2>&1', { timeout: 15000 });
            results.success = true;
            results.freed = item.size;
            results.message = 'Vacuumed journal logs to 10MB';
          } catch (e) { results.message = `Journal cleanup failed: ${e.message}`; }
          break;
        default:
          results.message = `No handler for command ${item.id}`;
      }
      return results;
    }

    // ── Directory-based cleanups ──
    switch (item.id) {
      case 'project-logs': {
        let freed = 0;
        for (const f of fs.readdirSync(item.path)) {
          const fp = path.join(item.path, f);
          try {
            const stat = fs.statSync(fp);
            if (stat.isFile()) { freed += stat.size; fs.writeFileSync(fp, ''); }
          } catch { /* skip */ }
        }
        results.freed = freed;
        results.success = true;
        results.message = `Truncated log files (${formatBytes(freed)})`;
        break;
      }
      case 'temp-files': {
        let freed = 0;
        for (const entry of fs.readdirSync(item.path, { withFileTypes: true })) {
          const fp = path.join(item.path, entry.name);
          try {
            const stat = fs.statSync(fp);
            if (Date.now() - stat.mtimeMs > 86400000) {
              const size = entry.isDirectory() ? getDirectorySize(fp) : stat.size;
              fs.rmSync(fp, { recursive: true, force: true });
              freed += size;
            }
          } catch { /* permission/in-use */ }
        }
        results.freed = freed;
        results.success = true;
        results.message = `Cleaned temp files (${formatBytes(freed)})`;
        break;
      }
      default: {
        // Generic: remove entire directory contents
        if (item.path && fs.existsSync(item.path)) {
          const size = getDirectorySize(item.path);
          fs.rmSync(item.path, { recursive: true, force: true });
          results.freed = size;
          results.success = true;
          results.message = `Removed ${item.label} (${formatBytes(size)})`;
        } else {
          results.message = `Path not found: ${item.path}`;
        }
        break;
      }
    }
  } catch (e) {
    results.message = `Cleanup failed: ${e.message}`;
  }
  return results;
}

// ── GET /api/system/health — Disk usage + cleanable items scan ──
router.get('/health', async (req, res) => {
  try {
    const disk = getDiskUsage();
    const cleanable = findCleanableItems();
    const totalCleanable = cleanable.filter(i => i.safe && i.size > 0).reduce((sum, i) => sum + i.size, 0);

    res.json({
      success: true,
      platform: os.platform(),
      hostname: os.hostname(),
      uptime: os.uptime(),
      memory: {
        total: os.totalmem(),
        free: os.freemem(),
        usedPercent: Math.round(((os.totalmem() - os.freemem()) / os.totalmem()) * 100),
      },
      disk,
      cleanable,
      totalCleanable,
      totalCleanableFormatted: formatBytes(totalCleanable),
      criticalThreshold: disk.percent >= 95,
      warningThreshold: disk.percent >= 85,
    });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

// ── POST /api/system/cleanup — Run cleanup on selected items ──
router.post('/cleanup', async (req, res) => {
  try {
    const { itemIds } = req.body || {};
    // If no specific IDs, clean all safe items
    const allCleanable = findCleanableItems();
    const toClean = itemIds
      ? allCleanable.filter(i => itemIds.includes(i.id) && i.safe)
      : allCleanable.filter(i => i.safe && i.size > 0);

    const results = toClean.map(item => cleanItem(item));
    const totalFreed = results.reduce((sum, r) => sum + (r.freed || 0), 0);

    // Re-check disk after cleanup
    const diskAfter = getDiskUsage();

    res.json({
      success: true,
      cleaned: results,
      totalFreed,
      totalFreedFormatted: formatBytes(totalFreed),
      diskAfter,
    });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

// ── Tiered auto-cleanup — called on boot and every 15 minutes ──
function runAutoCleanup(trigger = 'scheduled') {
  const disk = getDiskUsage();
  if (disk.error) {
    console.log(`[system-maintenance] ⚠️ Could not read disk: ${disk.error}`);
    return null;
  }

  if (disk.percent < WARN_PERCENT) {
    if (trigger === 'boot') console.log(`[system-maintenance] ✅ Disk at ${disk.percent}% (${formatBytes(disk.free)} free) — healthy`);
    return null;
  }

  const tier = disk.percent >= CRIT_PERCENT ? 'CRITICAL' : 'WARNING';
  console.log(`[system-maintenance] ⚠️ [${tier}] Disk at ${disk.percent}% (${formatBytes(disk.free)} free) — running ${trigger} cleanup...`);

  const cleanable = findCleanableItems();
  // At WARNING: only clean safe items. At CRITICAL: clean everything.
  const toClean = tier === 'CRITICAL'
    ? cleanable.filter(i => i.size > 0)
    : cleanable.filter(i => i.safe && i.size > 0);

  // Sort largest first so we free space fast
  toClean.sort((a, b) => b.size - a.size);

  let totalFreed = 0;
  for (const item of toClean) {
    const result = cleanItem(item);
    if (result.success && result.freed > 0) {
      console.log(`[system-maintenance]   ✓ ${result.message}`);
      totalFreed += result.freed;
    }

    // Re-check disk after each item — stop if we're below warning threshold
    const check = getDiskUsage();
    if (!check.error && check.percent < WARN_PERCENT) {
      console.log(`[system-maintenance]   Disk now ${check.percent}% — stopping early`);
      break;
    }
  }

  const diskAfter = getDiskUsage();
  console.log(`[system-maintenance] ✅ Cleanup freed ${formatBytes(totalFreed)} — disk now ${diskAfter.percent}% (${formatBytes(diskAfter.free)} free)`);
  return { freed: totalFreed, diskBefore: disk, diskAfter, tier, trigger };
}

// Boot cleanup
router.autoCleanupOnBoot = function () {
  return Promise.resolve(runAutoCleanup('boot'));
};

// Scheduled cleanup — starts a 15-minute interval, returns the timer
router.startScheduledCleanup = function () {
  console.log(`[system-maintenance] 🔄 Scheduled disk cleanup enabled (every ${CHECK_INTERVAL_MS / 60000} min, warn at ${WARN_PERCENT}%, critical at ${CRIT_PERCENT}%)`);
  return setInterval(() => {
    try { runAutoCleanup('scheduled'); } catch (e) { console.warn('[system-maintenance] Scheduled cleanup error:', e.message); }
  }, CHECK_INTERVAL_MS);
};

export default router;
