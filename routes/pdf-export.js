/**
 * PDF / Document Export Routes
 * 
 * Endpoints:
 *   POST /api/pdf/executive-summary  — Generate a bespoke Dynatrace Intelligence executive summary PDF
 *   POST /api/pdf/executive-doc      — Generate an HTML executive summary (Word-convertible)
 *   
 * Accepts journey + dashboard data, enriches from saved-configs, returns a downloadable file.
 */

import express from 'express';
import path from 'path';
import { readdir, readFile } from 'fs/promises';
import { generateExecutiveSummaryPDF } from '../services/pdfGenerator.js';
import { generateExecutiveSummaryDoc } from '../services/docGenerator.js';

const router = express.Router();

/**
 * Try to find a matching saved config with rich step data (description, businessRationale, category, etc.)
 */
async function enrichFromSavedConfig(journeyData) {
  try {
    const configDir = path.join(path.dirname(new URL(import.meta.url).pathname), '..', 'saved-configs');
    const files = await readdir(configDir);
    const company = (journeyData.companyName || '').toLowerCase().replace(/\s+/g, '-');
    const journey = (journeyData.journeyType || '').toLowerCase().replace(/\s+/g, '-');

    for (const file of files) {
      if (!file.endsWith('.json')) continue;
      const lower = file.toLowerCase();
      if (lower.includes(company) && lower.includes(journey)) {
        const data = JSON.parse(await readFile(path.join(configDir, file), 'utf8'));
        if (data.steps && data.steps.length > 0) {
          console.log(`[PDF Export] Enriched from saved config: ${file}`);
          return data;
        }
      }
    }

    // Fuzzy match — try company only
    for (const file of files) {
      if (!file.endsWith('.json')) continue;
      if (file.toLowerCase().includes(company)) {
        const data = JSON.parse(await readFile(path.join(configDir, file), 'utf8'));
        if (data.journeyType && data.journeyType.toLowerCase() === (journeyData.journeyType || '').toLowerCase()) {
          console.log(`[PDF Export] Enriched from fuzzy match: ${file}`);
          return data;
        }
      }
    }
  } catch (e) {
    console.warn(`[PDF Export] Could not enrich from saved configs: ${e.message}`);
  }
  return null;
}

/**
 * POST /api/pdf/executive-summary
 */
router.post('/executive-summary', async (req, res) => {
  try {
    let { journeyData, dashboardData } = req.body;

    if (!journeyData || !journeyData.steps || journeyData.steps.length === 0) {
      return res.status(400).json({ error: 'Journey data with steps is required' });
    }

    // Try to enrich steps with full business context from saved configs
    const enriched = await enrichFromSavedConfig(journeyData);
    if (enriched && enriched.steps) {
      // Merge: keep original steps but overlay rich fields from saved config
      const enrichedSteps = journeyData.steps.map(step => {
        const stepKey = (step.stepName || step.name || '').toLowerCase().replace(/service$/i, '');
        const match = enriched.steps.find(es => {
          const esKey = (es.stepName || '').toLowerCase();
          return esKey === stepKey || esKey.includes(stepKey) || stepKey.includes(esKey);
        });
        return match ? { ...step, ...match } : step;
      });
      journeyData = {
        ...journeyData,
        steps: enrichedSteps,
        domain: journeyData.domain || enriched.domain,
        industryType: journeyData.industryType || enriched.industryType,
        journeyDetail: journeyData.journeyDetail || enriched.journeyDetail,
      };
    }

    console.log(`[PDF Export] Generating executive summary for: ${journeyData.companyName || journeyData.company} — ${journeyData.journeyType}`);

    const pdfBuffer = await generateExecutiveSummaryPDF({ journeyData, dashboardData: dashboardData || {} });

    const filename = `${(journeyData.companyName || journeyData.company || 'Customer').replace(/\s+/g, '-')}-Executive-Summary.pdf`;

    res.set({
      'Content-Type': 'application/pdf',
      'Content-Disposition': `attachment; filename="${filename}"`,
      'Content-Length': pdfBuffer.length,
    });

    res.send(pdfBuffer);
    console.log(`[PDF Export] Generated ${filename} (${(pdfBuffer.length / 1024).toFixed(1)}KB)`);
  } catch (error) {
    console.error('[PDF Export] Generation error:', error);
    res.status(500).json({ error: 'Failed to generate PDF: ' + error.message });
  }
});

/**
 * POST /api/pdf/executive-doc
 * Word-convertible HTML executive summary
 */
router.post('/executive-doc', async (req, res) => {
  try {
    let { journeyData, dashboardData } = req.body;

    if (!journeyData || !journeyData.steps || journeyData.steps.length === 0) {
      return res.status(400).json({ error: 'Journey data with steps is required' });
    }

    // Enrich from saved configs (same as PDF path)
    const enriched = await enrichFromSavedConfig(journeyData);
    if (enriched && enriched.steps) {
      const enrichedSteps = journeyData.steps.map(step => {
        const stepKey = (step.stepName || step.name || '').toLowerCase().replace(/service$/i, '');
        const match = enriched.steps.find(es => {
          const esKey = (es.stepName || '').toLowerCase();
          return esKey === stepKey || esKey.includes(stepKey) || stepKey.includes(esKey);
        });
        return match ? { ...step, ...match } : step;
      });
      journeyData = {
        ...journeyData,
        steps: enrichedSteps,
        domain: journeyData.domain || enriched.domain,
        industryType: journeyData.industryType || enriched.industryType,
        journeyDetail: journeyData.journeyDetail || enriched.journeyDetail,
      };
    }

    console.log(`[Doc Export] Generating executive doc for: ${journeyData.companyName || journeyData.company} — ${journeyData.journeyType}`);

    const html = generateExecutiveSummaryDoc({ journeyData, dashboardData: dashboardData || {} });
    const filename = `${(journeyData.companyName || journeyData.company || 'Customer').replace(/\s+/g, '-')}-Executive-Summary.html`;

    res.set({
      'Content-Type': 'text/html; charset=utf-8',
      'Content-Disposition': `attachment; filename="${filename}"`,
      'Content-Length': Buffer.byteLength(html, 'utf8'),
    });

    res.send(html);
    console.log(`[Doc Export] Generated ${filename} (${(Buffer.byteLength(html, 'utf8') / 1024).toFixed(1)}KB)`);
  } catch (error) {
    console.error('[Doc Export] Generation error:', error);
    res.status(500).json({ error: 'Failed to generate document: ' + error.message });
  }
});

/**
 * GET /api/pdf/health
 */
router.get('/health', (req, res) => {
  res.json({ status: 'ok', service: 'pdf-export', features: ['executive-summary'] });
});

export default router;
