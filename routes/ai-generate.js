/**
 * AI Generate Route — Proxies calls to GitHub Models API with OTel GenAI tracing
 * 
 * This route runs on the EC2 Express server where the OTel SDK is active,
 * so every call gets a proper GenAI span exported to Dynatrace AI Observability.
 * 
 * Endpoint: POST /api/ai-generate/github
 * Body: { prompt, model?, systemPrompt?, temperature?, maxTokens? }
 * Auth: GitHub PAT passed in x-github-token header or GITHUB_PAT env var
 */

import express from 'express';
import { trace, SpanKind, SpanStatusCode, metrics } from '@opentelemetry/api';

const router = express.Router();

// ── OTel GenAI instrumentation ───────────────────────────────────────────
const _tracer = trace.getTracer('bizobs-ai-engine', '2.0.0');
const _meter = metrics.getMeter('bizobs-ai-engine', '2.0.0');

const _tokenCounter = _meter.createCounter('gen_ai.client.token.usage', {
  description: 'Tokens consumed by LLM calls',
  unit: 'token',
});
const _durationHist = _meter.createHistogram('gen_ai.client.operation.duration', {
  description: 'Duration of LLM requests',
  unit: 'ms',
});
const _requestCounter = _meter.createCounter('gen_ai.client.operation.count', {
  description: 'Total LLM requests',
  unit: '{request}',
});

const GITHUB_MODELS_URL = 'https://models.inference.ai.azure.com/chat/completions';

// ── POST /api/ai-generate/github ─────────────────────────────────────────
router.post('/github', async (req, res) => {
  const {
    prompt,
    model = 'gpt-4.1',
    systemPrompt = 'You are a business analyst AI assistant. Follow the output format instructions exactly.',
    temperature = 0.7,
    maxTokens = 4096,
  } = req.body || {};

  if (!prompt) {
    return res.status(400).json({ success: false, error: 'prompt is required' });
  }

  // Token from header, body, or env
  const ghToken = req.headers['x-github-token'] || req.body.token || process.env.GITHUB_PAT;
  if (!ghToken) {
    return res.status(401).json({
      success: false,
      error: 'GitHub PAT required. Pass via x-github-token header or set GITHUB_PAT env var.',
    });
  }

  const startTime = Date.now();
  const spanName = `chat ${model}`;

  // Create a parent GenAI span
  const span = _tracer.startSpan(spanName, {
    kind: SpanKind.CLIENT,
    attributes: {
      'gen_ai.system': 'github_models',
      'gen_ai.operation.name': 'chat',
      'gen_ai.request.model': model,
      'gen_ai.request.max_tokens': maxTokens,
      'gen_ai.request.temperature': temperature,
      'gen_ai.prompt.0.role': 'user',
      'gen_ai.prompt.0.content': prompt.substring(0, 4096),
      'server.address': 'models.inference.ai.azure.com',
      'server.port': 443,
    },
  });

  try {
    const resp = await fetch(GITHUB_MODELS_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${ghToken}`,
      },
      body: JSON.stringify({
        model,
        messages: [
          { role: 'system', content: systemPrompt },
          { role: 'user', content: prompt },
        ],
        temperature,
        max_tokens: maxTokens,
      }),
      signal: AbortSignal.timeout(120000),
    });

    const durationMs = Date.now() - startTime;

    if (!resp.ok) {
      const errText = await resp.text();
      span.setAttributes({
        'gen_ai.response.duration_ms': durationMs,
        'gen_ai.response.status': `error_${resp.status}`,
      });
      span.setStatus({ code: SpanStatusCode.ERROR, message: `HTTP ${resp.status}` });
      span.end();

      // Record metrics for failed requests too
      const metricAttrs = { 'gen_ai.system': 'github_models', 'gen_ai.request.model': model, 'gen_ai.operation.name': 'chat' };
      _durationHist.record(durationMs, metricAttrs);
      _requestCounter.add(1, { ...metricAttrs, 'gen_ai.response.status': 'error' });

      console.log('[GenAI Span]', JSON.stringify({
        operation: 'chat', system: 'github_models', model, status: 'error',
        http_status: resp.status, duration_ms: durationMs,
      }));

      if (resp.status === 401) {
        return res.status(401).json({ success: false, error: 'GitHub token invalid or expired', code: 'AUTH_FAILED' });
      }
      if (resp.status === 429) {
        return res.status(429).json({ success: false, error: 'Rate limit reached. Try again in a few minutes.', code: 'RATE_LIMITED' });
      }
      return res.status(resp.status).json({ success: false, error: `GitHub Models API error (${resp.status}): ${errText.slice(0, 200)}` });
    }

    const result = await resp.json();
    const durationFinal = Date.now() - startTime;
    const content = result.choices?.[0]?.message?.content || '';
    const usage = result.usage || {};
    const promptTokens = usage.prompt_tokens || 0;
    const completionTokens = usage.completion_tokens || 0;
    const finishReason = result.choices?.[0]?.finish_reason || 'unknown';

    // Set span attributes with response data
    span.setAttributes({
      'gen_ai.response.model': result.model || model,
      'gen_ai.usage.prompt_tokens': promptTokens,
      'gen_ai.usage.completion_tokens': completionTokens,
      'gen_ai.completion.0.role': 'assistant',
      'gen_ai.completion.0.content': content.substring(0, 4096),
      'gen_ai.response.finish_reason': finishReason,
      'gen_ai.response.duration_ms': durationFinal,
    });
    span.setStatus({ code: SpanStatusCode.OK });
    span.end();

    // Record OTel metrics
    const metricAttrs = { 'gen_ai.system': 'github_models', 'gen_ai.request.model': model, 'gen_ai.operation.name': 'chat' };
    _tokenCounter.add(promptTokens, { ...metricAttrs, 'gen_ai.token.type': 'input' });
    _tokenCounter.add(completionTokens, { ...metricAttrs, 'gen_ai.token.type': 'output' });
    _durationHist.record(durationFinal, metricAttrs);
    _requestCounter.add(1, { ...metricAttrs, 'gen_ai.response.status': 'ok' });

    console.log('[GenAI Span]', JSON.stringify({
      operation: 'chat', system: 'github_models', model: result.model || model,
      prompt_tokens: promptTokens, completion_tokens: completionTokens,
      duration_ms: durationFinal, finish_reason: finishReason,
    }));

    return res.json({
      success: true,
      data: {
        content,
        model: result.model || model,
        usage,
        genai: {
          system: 'github_models',
          model: result.model || model,
          promptTokens,
          completionTokens,
          totalTokens: promptTokens + completionTokens,
          durationMs: durationFinal,
          finishReason,
        },
      },
    });
  } catch (err) {
    const durationMs = Date.now() - startTime;
    span.setStatus({ code: SpanStatusCode.ERROR, message: err.message });
    span.setAttributes({ 'gen_ai.response.duration_ms': durationMs });
    span.end();

    console.error('[ai-generate] GitHub Models error:', err.message);
    return res.status(500).json({ success: false, error: err.message || 'AI generation failed' });
  }
});

// ── GET /api/ai-generate/models — list available models ──────────────────
router.get('/models', (_req, res) => {
  res.json({
    success: true,
    data: {
      github_models: [
        { id: 'gpt-4.1', name: 'GPT-4.1', provider: 'OpenAI' },
        { id: 'gpt-4.1-mini', name: 'GPT-4.1 Mini', provider: 'OpenAI' },
        { id: 'gpt-4.1-nano', name: 'GPT-4.1 Nano', provider: 'OpenAI' },
        { id: 'gpt-4o', name: 'GPT-4o', provider: 'OpenAI' },
        { id: 'gpt-4o-mini', name: 'GPT-4o Mini', provider: 'OpenAI' },
        { id: 'o4-mini', name: 'o4-mini', provider: 'OpenAI' },
        { id: 'o3-mini', name: 'o3-mini', provider: 'OpenAI' },
        { id: 'claude-sonnet-4', name: 'Claude Sonnet 4', provider: 'Anthropic' },
        { id: 'claude-3.5-sonnet', name: 'Claude 3.5 Sonnet', provider: 'Anthropic' },
      ],
      ollama: [
        { id: process.env.OLLAMA_MODEL || 'llama3.2:1b', name: 'Llama 3.2 1B', provider: 'Ollama (local)' },
      ],
    },
  });
});

export default router;
