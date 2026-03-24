import React, { useState, useEffect, useMemo, useCallback } from 'react';
import { Link } from 'react-router-dom';
import { Flex } from '@dynatrace/strato-components';
import { InfoButton } from '../components/InfoButton';
import {
  TimeseriesChart,
  CategoricalBarChart,
  PieChart,
  DonutChart,
  HoneycombChart,
  MeterBarChart,
  SingleValue,
  GaugeChart,
  convertQueryResultToTimeseries,
} from '@dynatrace/strato-components-preview/charts';
import { useDqlQuery } from '@dynatrace-sdk/react-hooks';
import { loadAppSettings, AppSettings } from '../services/app-settings';
import { functions } from '@dynatrace-sdk/app-utils';
import appConfig from '../../../app.config.json';

const TENANT_BASE = appConfig.environmentUrl.replace(/\/$/, '');

/* ═══════════════════════════════════════════════════════════════
   TYPES
   ═══════════════════════════════════════════════════════════════ */

interface TileDefinition {
  id: string;
  title: string;
  vizType: 'timeseries' | 'categoricalBar' | 'pie' | 'donut' | 'honeycomb' | 'meterBar' | 'singleValue' | 'gauge' | 'worldMap' | 'heroMetric' | 'impactCard' | 'table' | 'sectionBanner';
  dql: string;
  width: 1 | 2 | 3;
  icon?: string;
  accent?: string;
}

/** A tile candidate declares which fields it needs to be shown */
interface TileCandidate extends TileDefinition {
  requiresNumeric?: string[];      // additionalfields.* that must have non-zero numeric values
  requiresCategorical?: string[];  // additionalfields.* that must be non-empty strings
}

/** Discovered field profile for the selected company/journey */
interface FieldProfile {
  numericFields: Set<string>;      // additionalfields.* with non-zero numeric values
  categoricalFields: Set<string>;  // additionalfields.* with non-empty string values
  allFieldNames: string[];         // all field keys found
}

type DashboardPreset = 'developer' | 'operations' | 'executive' | 'intelligence' | 'genai' | 'security' | 'sre' | 'logs';

type Timeframe = 'now()-30m' | 'now()-1h' | 'now()-2h' | 'now()-6h' | 'now()-12h' | 'now()-24h' | 'now()-3d' | 'now()-7d';

const TIMEFRAME_OPTIONS: { value: Timeframe; label: string }[] = [
  { value: 'now()-30m', label: '30 min' },
  { value: 'now()-1h', label: '1 hour' },
  { value: 'now()-2h', label: '2 hours' },
  { value: 'now()-6h', label: '6 hours' },
  { value: 'now()-12h', label: '12 hours' },
  { value: 'now()-24h', label: '24 hours' },
  { value: 'now()-3d', label: '3 days' },
  { value: 'now()-7d', label: '7 days' },
];

const PRESET_META: Record<DashboardPreset, { label: string; icon: string; color: string; desc: string }> = {
  developer:    { label: 'Developer',              icon: '🔧', color: '#e67e22', desc: 'Services · Requests · Errors · Latency · Traces · Logs · Endpoints' },
  operations:   { label: 'Operations',             icon: '⚙️', color: '#3498db', desc: 'CPU · Memory · Hosts · Processes · Network · Availability · Saturation' },
  executive:    { label: 'Executive',              icon: '👔', color: '#a78bfa', desc: 'Revenue · Customers · Orders · Trends · Impact' },
  intelligence: { label: 'Dynatrace Intelligence', icon: '🧠', color: '#e74c3c', desc: 'Problems · Root Cause · Anomalies · Impact · Resolution' },
  genai:        { label: 'GenAI Observability',    icon: '🤖', color: '#10b981', desc: 'LLM Calls · Tokens · Latency · Models · Embeddings · Errors' },
  security:     { label: 'Security',               icon: '🔒', color: '#f59e0b', desc: 'Security Events · Attacks · Categories · Trends · Affected Entities' },
  sre:          { label: 'SRE / Reliability',      icon: '📋', color: '#06b6d4', desc: 'Availability · Error Budget · SLOs · Percentiles · Deployments' },
  logs:         { label: 'Biz Events',             icon: '📝', color: '#8b5cf6', desc: 'Event Volume · Types · Errors · Journeys · Services · Companies' },
};

/* ═══════════════════════════════════════════════════════════════
   PROXY DQL HELPER
   ═══════════════════════════════════════════════════════════════ */

async function proxyDql(query: string, maxRecords = 100): Promise<{ success: boolean; records?: any[]; error?: string }> {
  try {
    const res = await functions.call('proxy-api', {
      data: { action: 'execute-dql', body: { query, timeoutMs: 30000, maxRecords } },
    });
    return (await res.json()) as any;
  } catch (err: any) {
    return { success: false, error: err.message };
  }
}

/* ═══════════════════════════════════════════════════════════════
   FIELD DISCOVERY — fetches sample records, classifies fields
   ═══════════════════════════════════════════════════════════════ */

function useFieldDiscovery(companyName: string, journeyType: string): { profile: FieldProfile | null; discovering: boolean } {
  const [profile, setProfile] = useState<FieldProfile | null>(null);
  const [discovering, setDiscovering] = useState(false);

  useEffect(() => {
    setDiscovering(true);
    setProfile(null);

    let base = 'fetch bizevents';
    if (companyName) base += `\n| filter matchesPhrase(json.companyName, "${companyName}")`;
    if (journeyType) base += `\n| filter matchesPhrase(json.journeyType, "${journeyType}")`;
    base += '\n| limit 5';

    proxyDql(base, 5).then((result) => {
      if (result.success && result.records?.length) {
        const numericFields = new Set<string>();
        const categoricalFields = new Set<string>();
        const allFieldNames: string[] = [];

        // Inspect all records to build field profile
        for (const record of result.records) {
          for (const [key, value] of Object.entries(record)) {
            if (!key.startsWith('additionalfields.')) continue;
            const fieldName = key.replace('additionalfields.', '');

            if (value === null || value === undefined || value === '') continue;
            const strVal = String(value);
            if (strVal === '' || strVal === 'null') continue;

            const parsed = parseFloat(strVal);
            if (!isNaN(parsed) && parsed !== 0) {
              numericFields.add(fieldName);
            } else if (isNaN(parsed) && strVal.length > 0) {
              categoricalFields.add(fieldName);
            }
            // Note: fields with value "0" are skipped — they exist but have no useful data
          }
        }

        // Collect all unique keys from first record
        if (result.records[0]) {
          allFieldNames.push(...Object.keys(result.records[0]));
        }

        setProfile({ numericFields, categoricalFields, allFieldNames });
      }
      setDiscovering(false);
    });
  }, [companyName, journeyType]);

  return { profile, discovering };
}

/* ═══════════════════════════════════════════════════════════════
   TILE CANDIDATE CATALOG — each tile declares its field requirements
   Tiles with no requirements are always shown (core json.* tiles).
   Tiles with requirements are only shown when the fields have data.
   ═══════════════════════════════════════════════════════════════ */

function buildBase(companyName: string, journeyType: string, timeframe: Timeframe, serviceName?: string, eventType?: string): string {
  let q = `fetch bizevents, from:${timeframe}`;
  if (companyName) q += `\n| filter matchesPhrase(json.companyName, "${companyName}")`;
  if (journeyType) q += `\n| filter matchesPhrase(json.journeyType, "${journeyType}")`;
  if (serviceName) q += `\n| filter matchesPhrase(json.serviceName, "${serviceName}")`;
  if (eventType) q += `\n| filter matchesPhrase(event.type, "${eventType}")`;
  return q;
}

function getCandidates(companyName: string, journeyType: string, preset: DashboardPreset, timeframe: Timeframe, serviceName?: string, eventType?: string, companyServices?: string[]): TileCandidate[] {
  const b = buildBase(companyName, journeyType, timeframe, serviceName, eventType);

  // Service filter helpers for metric/timeseries queries — all values lowercased to match lower(entityName(...))
  // When a specific service is picked, filter to it; otherwise if a company is selected, filter to its services
  const svcInList = !serviceName && companyServices?.length
    ? companyServices.map(s => `"${s.toLowerCase()}"`).join(', ') : '';
  const svcF = serviceName ? `\n| filter contains(service, "${serviceName.toLowerCase()}")`
    : svcInList ? `\n| filter in(service, ${svcInList})` : '';
  const svcFSN = serviceName ? `\n| filter contains(ServiceName, "${serviceName.toLowerCase()}")`
    : svcInList ? `\n| filter in(ServiceName, ${svcInList})` : '';

  switch (preset) {

    /* ══════════════════════════════════════════════════════════════
       DEVELOPER — Services · RED · Traffic · Latency · Errors ·
                   Traces · Logs · Endpoints
       ══════════════════════════════════════════════════════════════ */
    case 'developer': return [
      // ── SERVICE OVERVIEW ──
      { id: 'dev-overview-banner', title: 'SERVICE OVERVIEW', vizType: 'sectionBanner', width: 3, icon: '📊', accent: '#e67e22', dql: '' },
      { id: 'dev-total-req', title: 'Total Requests', vizType: 'heroMetric', width: 1, icon: '📈', accent: '#e67e22',
        dql: `timeseries requests = sum(dt.service.request.count), by:{dt.entity.service}, from:${timeframe}\n| fieldsAdd service = lower(entityName(dt.entity.service))${svcF}\n| fieldsAdd reqTotal = arraySum(requests)\n| summarize totalRequests = sum(reqTotal)` },
      { id: 'dev-error-rate', title: 'Error Rate %', vizType: 'heroMetric', width: 1, icon: '⚠️', accent: '#e74c3c',
        dql: `timeseries requests = sum(dt.service.request.count), errors = sum(dt.service.request.failure_count), by:{dt.entity.service}, from:${timeframe}\n| fieldsAdd service = lower(entityName(dt.entity.service))${svcF}\n| fieldsAdd r = arraySum(requests), e = arraySum(errors)\n| summarize totalR = sum(r), totalE = sum(e)\n| fieldsAdd errorRate = round(100.0 * totalE / totalR, decimals:2)` },
      { id: 'dev-active-svc', title: 'Active Services', vizType: 'heroMetric', width: 1, icon: '🔧', accent: '#3498db',
        dql: `timeseries requests = sum(dt.service.request.count), by:{dt.entity.service}, from:${timeframe}\n| fieldsAdd service = lower(entityName(dt.entity.service))${svcF}\n| summarize activeServices = count()` },

      // ── SERVICE HEALTH: RED TABLE ──
      { id: 'dev-health-banner', title: 'SERVICE HEALTH: Full RED Metrics', vizType: 'sectionBanner', width: 3, icon: '🔍', accent: '#3498db', dql: '' },
      { id: 'dev-red-table', title: 'Service Health (RED Metrics)', vizType: 'table', width: 3, icon: '🏥', accent: '#e67e22',
        dql: `timeseries {latency_p50 = median(dt.service.request.response_time), latency_p90 = percentile(dt.service.request.response_time, 90), latency_p99 = percentile(dt.service.request.response_time, 99), requests = sum(dt.service.request.count), errors = sum(dt.service.request.failure_count)}, by:{dt.entity.service}, from:${timeframe}\n| lookup [timeseries http_5xx = sum(dt.service.request.count, default:0.0), by:{dt.entity.service}, from:${timeframe}, filter: http.response.status_code >= 500 and http.response.status_code <= 599], sourceField:dt.entity.service, lookupField:dt.entity.service, prefix:"http5xx."\n| lookup [timeseries http_4xx = sum(dt.service.request.count, default:0.0), by:{dt.entity.service}, from:${timeframe}, filter: http.response.status_code >= 400 and http.response.status_code <= 499], sourceField:dt.entity.service, lookupField:dt.entity.service, prefix:"http4xx."\n| fieldsAdd Latency_p50 = arrayAvg(latency_p50), Latency_p90 = arrayAvg(latency_p90), Latency_p99 = arrayAvg(latency_p99), Requests = arraySum(requests), Errors = arraySum(errors), Http5xx = arraySum(http5xx.http_5xx), Http4xx = arraySum(http4xx.http_4xx)\n| fieldsAdd FailureRate = round((Errors/Requests) * 100, decimals:2)\n| fieldsAdd ServiceName = lower(entityName(dt.entity.service))${svcFSN}\n| fieldsAdd Service = concat("[", ServiceName, "](${TENANT_BASE}/ui/apps/dynatrace.services/explorer?detailsId=", dt.entity.service, ")")\n| fields Service, Requests, FailureRate, Errors, Http5xx, Http4xx, Latency_p50, Latency_p90, Latency_p99\n| sort FailureRate desc\n| limit 25` },

      // ── TRAFFIC ──
      { id: 'dev-traffic-banner', title: 'TRAFFIC', vizType: 'sectionBanner', width: 3, icon: '📊', accent: '#438fb1', dql: '' },
      { id: 'dev-req-by-svc', title: 'Requests by Service', vizType: 'timeseries', width: 1, icon: '📈', accent: '#438fb1',
        dql: `timeseries requests = sum(dt.service.request.count), by:{dt.entity.service}, from:${timeframe}\n| fieldsAdd service = lower(entityName(dt.entity.service))${svcF}\n| fields timeframe, interval, service, requests\n| sort arraySum(requests) desc\n| limit 15` },
      { id: 'dev-success-fail', title: 'Success vs Failed', vizType: 'timeseries', width: 1, icon: '📊', accent: '#0D9C29',
        dql: `timeseries total = sum(dt.service.request.count, default:0), failed = sum(dt.service.request.failure_count, default:0), from:${timeframe}\n| fieldsAdd success = total[] - failed[]\n| fields timeframe, interval, success, failed` },
      { id: 'dev-endpoints', title: 'Key Endpoints', vizType: 'timeseries', width: 1, icon: '🔗', accent: '#438fb1',
        dql: `timeseries requests = sum(dt.service.request.count), by:{endpoint.name}, from:${timeframe}, filter: endpoint.name != "NON_KEY_REQUESTS"\n| fields timeframe, interval, endpoint.name, requests\n| sort arraySum(requests) desc\n| limit 15` },
      { id: 'dev-req-dist', title: 'Request Distribution by Service', vizType: 'categoricalBar', width: 3, icon: '📊', accent: '#438fb1',
        dql: `timeseries requests = sum(dt.service.request.count), by:{dt.entity.service}, from:${timeframe}\n| fieldsAdd service = lower(entityName(dt.entity.service))${svcF}\n| fieldsAdd totalReq = arraySum(requests)\n| fields service, totalReq\n| sort totalReq desc\n| limit 20` },

      // ── LATENCY ──
      { id: 'dev-lat-banner', title: 'LATENCY', vizType: 'sectionBanner', width: 3, icon: '⏱️', accent: '#f1c40f', dql: '' },
      { id: 'dev-p50', title: 'Latency p50', vizType: 'timeseries', width: 1, icon: '⏱️', accent: '#f1c40f',
        dql: `timeseries latency_p50 = median(dt.service.request.response_time), by:{dt.entity.service}, from:${timeframe}\n| fieldsAdd service = lower(entityName(dt.entity.service))${svcF}\n| fields timeframe, interval, service, latency_p50\n| sort arrayAvg(latency_p50) desc\n| limit 15` },
      { id: 'dev-p90', title: 'Latency p90', vizType: 'timeseries', width: 1, icon: '⏱️', accent: '#eca440',
        dql: `timeseries latency_p90 = percentile(dt.service.request.response_time, 90), by:{dt.entity.service}, from:${timeframe}\n| fieldsAdd service = lower(entityName(dt.entity.service))${svcF}\n| fields timeframe, interval, service, latency_p90\n| sort arrayAvg(latency_p90) desc\n| limit 15` },
      { id: 'dev-p99', title: 'Latency p99', vizType: 'timeseries', width: 1, icon: '⏱️', accent: '#c4233b',
        dql: `timeseries latency_p99 = percentile(dt.service.request.response_time, 99), by:{dt.entity.service}, from:${timeframe}\n| fieldsAdd service = lower(entityName(dt.entity.service))${svcF}\n| fields timeframe, interval, service, latency_p99\n| sort arrayAvg(latency_p99) desc\n| limit 15` },

      // ── ERRORS ──
      { id: 'dev-err-banner', title: 'ERRORS', vizType: 'sectionBanner', width: 3, icon: '❌', accent: '#e74c3c', dql: '' },
      { id: 'dev-failed', title: 'Failed Requests', vizType: 'timeseries', width: 1, icon: '❌', accent: '#e74c3c',
        dql: `timeseries errors = sum(dt.service.request.failure_count, default:0), nonempty:true, by:{dt.entity.service}, from:${timeframe}\n| fieldsAdd service = lower(entityName(dt.entity.service))${svcF}\n| fields timeframe, interval, service, errors\n| sort arraySum(errors) desc\n| limit 15` },
      { id: 'dev-5xx', title: '5xx Server Errors', vizType: 'timeseries', width: 1, icon: '🔴', accent: '#ae132d',
        dql: `timeseries errors = sum(dt.service.request.count, default:0), nonempty:true, by:{dt.entity.service}, from:${timeframe}, filter: http.response.status_code >= 500 and http.response.status_code <= 599\n| fieldsAdd service = lower(entityName(dt.entity.service))${svcF}\n| fields timeframe, interval, service, errors\n| sort arraySum(errors) desc\n| limit 15` },
      { id: 'dev-4xx', title: '4xx Client Errors', vizType: 'timeseries', width: 1, icon: '🟠', accent: '#d56b1a',
        dql: `timeseries errors = sum(dt.service.request.count, default:0), nonempty:true, by:{dt.entity.service}, from:${timeframe}, filter: http.response.status_code >= 400 and http.response.status_code <= 499\n| fieldsAdd service = lower(entityName(dt.entity.service))${svcF}\n| fields timeframe, interval, service, errors\n| sort arraySum(errors) desc\n| limit 15` },

      // ── TRACES & EXCEPTIONS ──
      { id: 'dev-traces-banner', title: 'TRACES & EXCEPTIONS', vizType: 'sectionBanner', width: 3, icon: '📡', accent: '#d56b1a', dql: '' },
      { id: 'dev-traces', title: 'Exception Traces', vizType: 'table', width: 3, icon: '📡', accent: '#d56b1a',
        dql: `fetch spans, from:${timeframe}\n| fieldsAdd exceptionType = span.events[0][exception.type]\n| fieldsAdd eventname = span.events[0][span_event.name]\n| filter eventname == "exception"\n| filter isNotNull(span.exit_by_exception_id)\n| fieldsAdd ServiceName = lower(entityName(dt.entity.service))${svcFSN}\n| fieldsAdd ExceptionMessage = toString(span.events[][exception.message])\n| fieldsAdd Service = concat("[", ServiceName, "](${TENANT_BASE}/ui/apps/dynatrace.services/explorer?detailsId=", dt.entity.service, ")")\n| fieldsAdd Endpoint = concat("[", endpoint.name, "](${TENANT_BASE}/ui/apps/dynatrace.distributedtracing/explorer?filter=dt.entity.service+%3D+", dt.entity.service, "&traceId=", trace_id, "&spanId=", span_id, ")")\n| fields Time = start_time, Service, Endpoint, ExceptionClass = exceptionType, ExceptionMessage, Duration = duration\n| sort Time desc\n| limit 100` },
      { id: 'dev-exception-types', title: 'Top Exception Types', vizType: 'categoricalBar', width: 3, icon: '🐛', accent: '#d56b1a',
        dql: `fetch spans, from:${timeframe}\n| fieldsAdd exceptionType = span.events[0][exception.type]\n| fieldsAdd eventname = span.events[0][span_event.name]\n| filter eventname == "exception"\n| fieldsAdd ServiceName = lower(entityName(dt.entity.service))${svcFSN}\n| summarize count = count(), by:{exceptionType}\n| sort count desc\n| limit 15` },

      // ── LOGS ──
      { id: 'dev-logs-banner', title: 'LOGS', vizType: 'sectionBanner', width: 3, icon: '📋', accent: '#cd3741', dql: '' },
      { id: 'dev-logs', title: 'Error & Warning Logs', vizType: 'table', width: 3, icon: '📋', accent: '#cd3741',
        dql: `fetch logs, from:${timeframe}\n| filter in(status, "WARN", "ERROR")\n| filter isNotNull(trace_id)\n| fieldsAdd Process = lower(entityName(dt.entity.process_group_instance))\n| fieldsAdd TraceLink = concat("[", trace_id, "](${TENANT_BASE}/ui/apps/dynatrace.distributedtracing/explorer?traceId=", trace_id, ")")\n| fields Time = timestamp, Status = status, Process, Content = content, TraceId = TraceLink\n| sort Time desc\n| limit 100` },
      { id: 'dev-log-volume', title: 'Log Volume by Severity', vizType: 'timeseries', width: 2, icon: '📊', accent: '#cd3741',
        dql: `fetch logs, from:${timeframe}\n| makeTimeseries count = count(), by:{status}` },
      { id: 'dev-log-dist', title: 'Log Distribution', vizType: 'donut', width: 1, icon: '📊', accent: '#cd3741',
        dql: `fetch logs, from:${timeframe}\n| summarize count = count(), by:{status}\n| sort count desc` },

      // ── SLOWEST ENDPOINTS ──
      { id: 'dev-slow-banner', title: 'SLOWEST ENDPOINTS', vizType: 'sectionBanner', width: 3, icon: '🐌', accent: '#27ae60', dql: '' },
      { id: 'dev-slow-table', title: 'Slowest Endpoints by Avg Latency', vizType: 'table', width: 3, icon: '🐌', accent: '#27ae60',
        dql: `timeseries {latency = avg(dt.service.request.response_time), count = sum(dt.service.request.count)}, by:{dt.entity.service, endpoint.name}, from:${timeframe}\n| filter endpoint.name != "NON_KEY_REQUESTS"\n| fieldsAdd ServiceName = lower(entityName(dt.entity.service))${svcFSN}\n| fieldsAdd Service = concat("[", ServiceName, "](${TENANT_BASE}/ui/apps/dynatrace.services/explorer?detailsId=", dt.entity.service, ")")\n| fieldsAdd AvgLatency = arrayAvg(latency), Requests = arraySum(count)\n| fields Service, Endpoint = endpoint.name, AvgLatency, Requests\n| sort AvgLatency desc\n| limit 25` },
    ];

    /* ══════════════════════════════════════════════════════════════
       OPERATIONS — CPU · Memory · Hosts · Processes · Network ·
                    Availability · Saturation · Logs
       ══════════════════════════════════════════════════════════════ */
    case 'operations': return [
      // ── INFRASTRUCTURE OVERVIEW ──
      { id: 'ops-overview-banner', title: 'INFRASTRUCTURE OVERVIEW', vizType: 'sectionBanner', width: 3, icon: '🏗️', accent: '#3498db', dql: '' },
      { id: 'ops-hosts', title: 'Active Hosts', vizType: 'heroMetric', width: 1, icon: '🖥️', accent: '#3498db',
        dql: `timeseries cpu = avg(dt.host.cpu.usage), by:{dt.entity.host}, from:${timeframe}\n| summarize activeHosts = count()` },
      { id: 'ops-pgs', title: 'Process Groups', vizType: 'heroMetric', width: 1, icon: '⚙️', accent: '#27ae60',
        dql: `timeseries cpu = avg(dt.process.cpu.usage), by:{dt.entity.process_group_instance}, from:${timeframe}\n| summarize activePGs = count()` },
      { id: 'ops-avg-cpu', title: 'Avg Host CPU %', vizType: 'heroMetric', width: 1, icon: '💻', accent: '#e67e22',
        dql: `timeseries cpu = avg(dt.host.cpu.usage), by:{dt.entity.host}, from:${timeframe}\n| fieldsAdd avgCpu = arrayAvg(cpu)\n| summarize overallCpu = round(avg(avgCpu), decimals:1)` },

      // ── CPU & COMPUTE ──
      { id: 'ops-cpu-banner', title: 'CPU & COMPUTE', vizType: 'sectionBanner', width: 3, icon: '💻', accent: '#e67e22', dql: '' },
      { id: 'ops-cpu-host', title: 'CPU by Host', vizType: 'timeseries', width: 2, icon: '🖥️', accent: '#e67e22',
        dql: `timeseries cpu = avg(dt.host.cpu.usage), by:{dt.entity.host}, from:${timeframe}\n| fieldsAdd host = lower(entityName(dt.entity.host))\n| fields timeframe, interval, host, cpu\n| sort arrayAvg(cpu) desc\n| limit 15` },
      { id: 'ops-cpu-pg', title: 'CPU by Process Group', vizType: 'timeseries', width: 1, icon: '⚙️', accent: '#e67e22',
        dql: `timeseries cpu = avg(dt.process.cpu.usage), by:{dt.entity.process_group_instance}, from:${timeframe}\n| fieldsAdd process = lower(entityName(dt.entity.process_group_instance))\n| fields timeframe, interval, process, cpu\n| sort arrayAvg(cpu) desc\n| limit 15` },
      { id: 'ops-cpu-dist', title: 'CPU Distribution by Host', vizType: 'categoricalBar', width: 3, icon: '📊', accent: '#e67e22',
        dql: `timeseries cpu = avg(dt.host.cpu.usage), by:{dt.entity.host}, from:${timeframe}\n| fieldsAdd host = lower(entityName(dt.entity.host)), avgCpu = round(arrayAvg(cpu), decimals:1)\n| fields host, avgCpu\n| sort avgCpu desc\n| limit 20` },

      // ── MEMORY ──
      { id: 'ops-mem-banner', title: 'MEMORY', vizType: 'sectionBanner', width: 3, icon: '🧠', accent: '#a78bfa', dql: '' },
      { id: 'ops-mem-host', title: 'Memory by Host', vizType: 'timeseries', width: 2, icon: '🖥️', accent: '#a78bfa',
        dql: `timeseries memory = avg(dt.host.memory.usage), by:{dt.entity.host}, from:${timeframe}\n| fieldsAdd host = lower(entityName(dt.entity.host))\n| fields timeframe, interval, host, memory\n| sort arrayAvg(memory) desc\n| limit 15` },
      { id: 'ops-mem-pg', title: 'Memory by Process Group', vizType: 'timeseries', width: 1, icon: '⚙️', accent: '#a78bfa',
        dql: `timeseries memory = avg(dt.process.memory.working_set_size), by:{dt.entity.process_group_instance}, from:${timeframe}\n| fieldsAdd process = lower(entityName(dt.entity.process_group_instance))\n| fields timeframe, interval, process, memory\n| sort arrayAvg(memory) desc\n| limit 15` },

      // ── SERVICE AVAILABILITY ──
      { id: 'ops-avail-banner', title: 'SERVICE AVAILABILITY', vizType: 'sectionBanner', width: 3, icon: '✅', accent: '#27ae60', dql: '' },
      { id: 'ops-avail-table', title: 'Service Availability & Error Rate', vizType: 'table', width: 3, icon: '✅', accent: '#27ae60',
        dql: `timeseries {requests = sum(dt.service.request.count), errors = sum(dt.service.request.failure_count)}, by:{dt.entity.service}, from:${timeframe}\n| fieldsAdd ServiceName = lower(entityName(dt.entity.service))${svcFSN}\n| fieldsAdd TotalRequests = arraySum(requests), TotalErrors = arraySum(errors)\n| fieldsAdd ErrorRate = round((TotalErrors / TotalRequests) * 100, decimals:2)\n| fieldsAdd Availability = round(100 - ErrorRate, decimals:2)\n| fieldsAdd Service = concat("[", ServiceName, "](${TENANT_BASE}/ui/apps/dynatrace.services/explorer?detailsId=", dt.entity.service, ")")\n| fields Service, TotalRequests, TotalErrors, ErrorRate, Availability\n| sort ErrorRate desc\n| limit 25` },
      { id: 'ops-error-trend', title: 'Error Rate Trend by Service', vizType: 'timeseries', width: 3, icon: '📈', accent: '#e74c3c',
        dql: `timeseries errors = sum(dt.service.request.failure_count), by:{dt.entity.service}, from:${timeframe}\n| fieldsAdd service = lower(entityName(dt.entity.service))${svcF}\n| fields timeframe, interval, service, errors\n| sort arraySum(errors) desc\n| limit 10` },

      // ── NETWORK ──
      { id: 'ops-net-banner', title: 'NETWORK', vizType: 'sectionBanner', width: 3, icon: '🌐', accent: '#1abc9c', dql: '' },
      { id: 'ops-net-in', title: 'Network Traffic In', vizType: 'timeseries', width: 1, icon: '📥', accent: '#1abc9c',
        dql: `timeseries traffic_in = avg(dt.host.network.nic.traffic.in), by:{dt.entity.host}, from:${timeframe}\n| fieldsAdd host = lower(entityName(dt.entity.host))\n| fields timeframe, interval, host, traffic_in\n| sort arrayAvg(traffic_in) desc\n| limit 10` },
      { id: 'ops-net-out', title: 'Network Traffic Out', vizType: 'timeseries', width: 1, icon: '📤', accent: '#1abc9c',
        dql: `timeseries traffic_out = avg(dt.host.network.nic.traffic.out), by:{dt.entity.host}, from:${timeframe}\n| fieldsAdd host = lower(entityName(dt.entity.host))\n| fields timeframe, interval, host, traffic_out\n| sort arrayAvg(traffic_out) desc\n| limit 10` },
      { id: 'ops-connections', title: 'TCP Connections', vizType: 'timeseries', width: 1, icon: '🔗', accent: '#1abc9c',
        dql: `timeseries conns = avg(dt.host.network.nic.traffic.in), by:{dt.entity.host}, from:${timeframe}\n| fieldsAdd host = lower(entityName(dt.entity.host))\n| fields timeframe, interval, host, conns\n| sort arrayAvg(conns) desc\n| limit 10` },

      // ── RESOURCE SATURATION ──
      { id: 'ops-sat-banner', title: 'RESOURCE SATURATION', vizType: 'sectionBanner', width: 3, icon: '📦', accent: '#f39c12', dql: '' },
      { id: 'ops-gc', title: 'GC Suspension Time', vizType: 'timeseries', width: 1, icon: '♻️', accent: '#f39c12',
        dql: `timeseries gc_time = avg(dt.runtime.jvm.gc.suspension_time), by:{dt.entity.process_group_instance}, from:${timeframe}\n| append [timeseries gc_time = avg(dt.runtime.clr.gc.suspension_time), by:{dt.entity.process_group_instance}, from:${timeframe}]\n| append [timeseries gc_time = avg(dt.runtime.go.gc.suspension_time), by:{dt.entity.process_group_instance}, from:${timeframe}]\n| append [timeseries gc_time = avg(dt.runtime.nodejs.gc.suspension_time), by:{dt.entity.process_group_instance}, from:${timeframe}]\n| fieldsAdd process = lower(entityName(dt.entity.process_group_instance))\n| fields timeframe, interval, process, gc_time\n| sort arrayAvg(gc_time) desc\n| limit 15` },
      { id: 'ops-threads', title: 'Thread Count by Process', vizType: 'timeseries', width: 1, icon: '🧵', accent: '#f39c12',
        dql: `timeseries threads = avg(dt.process.threads), by:{dt.entity.process_group_instance}, from:${timeframe}\n| fieldsAdd process = lower(entityName(dt.entity.process_group_instance))\n| fields timeframe, interval, process, threads\n| sort arrayAvg(threads) desc\n| limit 15` },
      { id: 'ops-disk', title: 'Disk Usage by Host', vizType: 'timeseries', width: 1, icon: '💾', accent: '#f39c12',
        dql: `timeseries disk = avg(dt.host.disk.usage), by:{dt.entity.host}, from:${timeframe}\n| fieldsAdd host = lower(entityName(dt.entity.host))\n| fields timeframe, interval, host, disk\n| sort arrayAvg(disk) desc\n| limit 15` },

      // ── LOGS & EVENTS ──
      { id: 'ops-logs-banner', title: 'LOGS & EVENTS', vizType: 'sectionBanner', width: 3, icon: '📋', accent: '#cd3741', dql: '' },
      { id: 'ops-log-volume', title: 'Log Volume by Severity', vizType: 'timeseries', width: 2, icon: '📊', accent: '#cd3741',
        dql: `fetch logs, from:${timeframe}\n| makeTimeseries count = count(), by:{status}` },
      { id: 'ops-recent-errors', title: 'Recent Error Logs', vizType: 'table', width: 3, icon: '📋', accent: '#cd3741',
        dql: `fetch logs, from:${timeframe}\n| filter in(status, "ERROR")\n| fieldsAdd Process = lower(entityName(dt.entity.process_group_instance))\n| fieldsAdd Host = lower(entityName(dt.entity.host))\n| fields Time = timestamp, Status = status, Host, Process, Content = content\n| sort Time desc\n| limit 100` },
      { id: 'ops-log-dist', title: 'Log Severity Distribution', vizType: 'donut', width: 1, icon: '📊', accent: '#cd3741',
        dql: `fetch logs, from:${timeframe}\n| summarize count = count(), by:{status}\n| sort count desc` },
    ];

    /* ══════════════════════════════════════════════════════════════
       EXECUTIVE — C-Level Business Impact Dashboard
       Inspired by EasyTrade Business Impact & Retail eCommerce
       Revenue · Volume · SLA · Journey Flow · IT Impact · Trends
       ══════════════════════════════════════════════════════════════ */
    case 'executive': return [
      // ══════ KEY BUSINESS METRICS ══════
      { id: 'ex-kpi-banner', title: 'KEY BUSINESS METRICS', vizType: 'sectionBanner', width: 3, icon: '📊', accent: '#a78bfa', dql: '' },
      { id: 'ex-revenue', title: 'Total Revenue', vizType: 'heroMetric', width: 1, icon: '💰', accent: '#00d4aa',
        dql: `${b}\n| summarize totalRevenue = round(sum(toDouble(additionalfields.transactionValue)), decimals:0)` },
      { id: 'ex-orders', title: 'Total Orders', vizType: 'heroMetric', width: 1, icon: '🛒', accent: '#3498db',
        dql: `${b}\n| summarize totalOrders = count()` },
      { id: 'ex-customers', title: 'Unique Customers', vizType: 'heroMetric', width: 1, icon: '👥', accent: '#a78bfa',
        dql: `${b}\n| summarize customers = countDistinct(json.customerId)` },
      { id: 'ex-avg-order', title: 'Avg Order Value', vizType: 'heroMetric', width: 1, icon: '💵', accent: '#1abc9c',
        dql: `${b}\n| summarize avgOrder = round(avg(toDouble(additionalfields.transactionValue)), decimals:2)`,
        requiresNumeric: ['transactionValue'] },
      { id: 'ex-error-rate', title: 'Error Rate %', vizType: 'heroMetric', width: 1, icon: '⚠️', accent: '#e74c3c',
        dql: `${b}\n| summarize total = count(), errors = countIf(json.hasError == true)\n| fieldsAdd rate = round(100.0 * toDouble(errors) / toDouble(total), decimals:1)` },
      { id: 'ex-services', title: 'Active Services', vizType: 'heroMetric', width: 1, icon: '🔧', accent: '#e67e22',
        dql: `${b}\n| summarize services = countDistinct(json.serviceName)` },

      // ══════ REVENUE & VOLUME TRENDS ══════
      { id: 'ex-trends-banner', title: 'REVENUE & VOLUME TRENDS', vizType: 'sectionBanner', width: 3, icon: '📈', accent: '#00d4aa', dql: '' },
      { id: 'ex-revenue-ts', title: 'Revenue Over Time', vizType: 'timeseries', width: 2, icon: '📈', accent: '#00d4aa',
        dql: `${b}\n| makeTimeseries revenue = sum(toDouble(additionalfields.transactionValue))` },
      { id: 'ex-impact', title: 'Revenue at Risk', vizType: 'impactCard', width: 1, icon: '🔥', accent: '#e74c3c',
        dql: `${b}\n| summarize errors = countIf(json.hasError == true), totalTxns = count(), avgValue = avg(toDouble(additionalfields.transactionValue))\n| fieldsAdd estimatedImpact = round(toDouble(errors) * avgValue, decimals:0), errorRate = round(100.0 * toDouble(errors) / toDouble(totalTxns), decimals:1)` },
      { id: 'ex-volume-ts', title: 'Order Volume Over Time', vizType: 'timeseries', width: 1, icon: '📊', accent: '#3498db',
        dql: `${b}\n| makeTimeseries orders = count()` },
      { id: 'ex-customers-ts', title: 'Unique Customers Over Time', vizType: 'timeseries', width: 1, icon: '👥', accent: '#a78bfa',
        dql: `${b}\n| makeTimeseries customers = countDistinct(json.customerId)` },
      { id: 'ex-rev-by-svc-ts', title: 'Revenue by Service Over Time', vizType: 'timeseries', width: 1, icon: '💰', accent: '#1abc9c',
        dql: `${b}\n| makeTimeseries revenue = sum(toDouble(additionalfields.transactionValue)), by:{json.serviceName}` },

      // ══════ JOURNEY FLOW (Retail-inspired stage view) ══════
      { id: 'ex-journey-banner', title: 'JOURNEY FLOW', vizType: 'sectionBanner', width: 3, icon: '🔻', accent: '#a78bfa', dql: '' },
      { id: 'ex-funnel', title: 'Journey Steps Funnel', vizType: 'categoricalBar', width: 2, icon: '🔻', accent: '#a78bfa',
        dql: `${b}\n| summarize count = count(), by:{json.stepName, json.stepIndex}\n| sort toDouble(json.stepIndex) asc\n| limit 20` },
      { id: 'ex-step-conversion', title: 'Drop-off by Step', vizType: 'categoricalBar', width: 1, icon: '📉', accent: '#e74c3c',
        dql: `${b}\n| summarize total = count(), errors = countIf(json.hasError == true), by:{json.stepName, json.stepIndex}\n| fieldsAdd dropRate = round(100.0 * toDouble(errors) / toDouble(total), decimals:1)\n| sort toDouble(json.stepIndex) asc\n| limit 20` },
      { id: 'ex-step-revenue', title: 'Revenue by Journey Step', vizType: 'categoricalBar', width: 2, icon: '💰', accent: '#00d4aa',
        dql: `${b}\n| summarize revenue = sum(toDouble(additionalfields.transactionValue)), count = count(), by:{json.stepName, json.stepIndex}\n| sort toDouble(json.stepIndex) asc\n| limit 20` },
      { id: 'ex-step-time', title: 'Avg Processing Time by Step', vizType: 'categoricalBar', width: 1, icon: '⏱️', accent: '#f39c12',
        dql: `${b}\n| summarize avgTime = round(avg(toDouble(additionalfields.processingTime)), decimals:0), by:{json.stepName, json.stepIndex}\n| sort toDouble(json.stepIndex) asc\n| limit 20`,
        requiresNumeric: ['processingTime'] },

      // ══════ REVENUE BREAKDOWN ══════
      { id: 'ex-bd-banner', title: 'REVENUE BREAKDOWN', vizType: 'sectionBanner', width: 3, icon: '💰', accent: '#1abc9c', dql: '' },
      { id: 'ex-rev-journey', title: 'Revenue by Journey Type', vizType: 'categoricalBar', width: 2, icon: '📊', accent: '#1abc9c',
        dql: `${b}\n| summarize revenue = sum(toDouble(additionalfields.transactionValue)), by:{json.journeyType}\n| sort revenue desc\n| limit 15` },
      { id: 'ex-events-journey', title: 'Events by Journey', vizType: 'donut', width: 1, icon: '🎯',
        dql: `${b}\n| summarize count = count(), by:{json.journeyType}\n| sort count desc\n| limit 10` },
      { id: 'ex-rev-service', title: 'Revenue by Service', vizType: 'categoricalBar', width: 2, icon: '🔧', accent: '#1abc9c',
        dql: `${b}\n| summarize revenue = sum(toDouble(additionalfields.transactionValue)), by:{json.serviceName}\n| sort revenue desc\n| limit 15` },
      { id: 'ex-events-type', title: 'Events by Type', vizType: 'donut', width: 1, icon: '🏷️',
        dql: `${b}\n| summarize count = count(), by:{event.type}\n| sort count desc\n| limit 10` },

      // ══════ SLA & PERFORMANCE (EasyTrade-inspired) ══════
      { id: 'ex-sla-banner', title: 'SLA & PERFORMANCE', vizType: 'sectionBanner', width: 3, icon: '⏱️', accent: '#f39c12', dql: '' },
      { id: 'ex-sla-met', title: 'SLA Met vs Not Met', vizType: 'timeseries', width: 2, icon: '✅', accent: '#27ae60',
        dql: `${b}\n| fieldsAdd sla = if(toDouble(additionalfields.processingTime) > 5000, "Not Met", else: "Met")\n| makeTimeseries met = countIf(sla == "Met"), notMet = countIf(sla == "Not Met")`,
        requiresNumeric: ['processingTime'] },
      { id: 'ex-sla-pct', title: 'SLA Compliance %', vizType: 'heroMetric', width: 1, icon: '📋', accent: '#27ae60',
        dql: `${b}\n| fieldsAdd sla = if(toDouble(additionalfields.processingTime) > 5000, "Not Met", else: "Met")\n| summarize slaPercentage = round(100.0 * toDouble(countIf(sla == "Met")) / toDouble(count()), decimals:1)`,
        requiresNumeric: ['processingTime'] },
      { id: 'ex-latency-by-svc', title: 'Avg Latency by Service', vizType: 'categoricalBar', width: 2, icon: '⏱️', accent: '#f39c12',
        dql: `${b}\n| summarize avgLatency = round(avg(toDouble(additionalfields.processingTime)), decimals:0), by:{json.serviceName}\n| sort avgLatency desc\n| limit 15`,
        requiresNumeric: ['processingTime'] },
      { id: 'ex-latency-ts', title: 'Avg Processing Time', vizType: 'timeseries', width: 1, icon: '📈', accent: '#f39c12',
        dql: `${b}\n| makeTimeseries avgLatency = avg(toDouble(additionalfields.processingTime))`,
        requiresNumeric: ['processingTime'] },

      // ══════ IT IMPACT ON BUSINESS (Retail-inspired) ══════
      { id: 'ex-it-banner', title: 'IT IMPACT ON BUSINESS', vizType: 'sectionBanner', width: 3, icon: '🛠️', accent: '#e74c3c', dql: '' },
      { id: 'ex-it-problems', title: 'Open IT Problems', vizType: 'heroMetric', width: 1, icon: '🔴', accent: '#e74c3c',
        dql: `fetch dt.davis.problems, from:${timeframe}\n| filter dt.davis.is_duplicate == false\n| filter event.status == "ACTIVE"\n| summarize openProblems = count()` },
      { id: 'ex-it-loss', title: 'Est. Loss from Errors', vizType: 'heroMetric', width: 1, icon: '💸', accent: '#ae132d',
        dql: `${b}\n| filter json.hasError == true\n| summarize lostRevenue = round(sum(toDouble(additionalfields.transactionValue)), decimals:0)` },
      { id: 'ex-it-affected', title: 'Affected Customers', vizType: 'heroMetric', width: 1, icon: '👥', accent: '#d56b1a',
        dql: `${b}\n| filter json.hasError == true\n| summarize affectedCustomers = countDistinct(json.customerId)` },
      { id: 'ex-problems-ts', title: 'Problems Over Time', vizType: 'timeseries', width: 2, icon: '📈', accent: '#e74c3c',
        dql: `fetch dt.davis.problems, from:${timeframe}\n| filter dt.davis.is_duplicate == false\n| makeTimeseries count = count()` },
      { id: 'ex-errors-ts', title: 'Business Errors Over Time', vizType: 'timeseries', width: 1, icon: '📈', accent: '#ae132d',
        dql: `${b}\n| makeTimeseries errors = countIf(json.hasError == true)` },

      // ══════ TOP CUSTOMERS & RECENT ACTIVITY (EasyTrade-inspired) ══════
      { id: 'ex-activity-banner', title: 'TOP CUSTOMERS & RECENT ACTIVITY', vizType: 'sectionBanner', width: 3, icon: '👤', accent: '#3498db', dql: '' },
      { id: 'ex-top-customers', title: 'Top Customers by Revenue', vizType: 'categoricalBar', width: 2, icon: '👤', accent: '#3498db',
        dql: `${b}\n| summarize revenue = round(sum(toDouble(additionalfields.transactionValue)), decimals:2), orders = count(), by:{json.customerId}\n| sort revenue desc\n| limit 15` },
      { id: 'ex-customer-dist', title: 'Customer Activity Distribution', vizType: 'honeycomb', width: 1, icon: '🔥',
        dql: `${b}\n| summarize count = count(), by:{json.customerId}\n| sort count desc\n| limit 30` },
      { id: 'ex-recent-orders', title: 'Most Recent Orders', vizType: 'table', width: 3, icon: '📋', accent: '#3498db',
        dql: `${b}\n| fields Time = timestamp, Customer = json.customerId, Journey = json.journeyType, Step = json.stepName, Service = json.serviceName, Value = additionalfields.transactionValue, EventType = event.type, HasError = json.hasError\n| sort Time desc\n| limit 50` },

      // ══════ SERVICE PERFORMANCE ══════
      { id: 'ex-svc-banner', title: 'SERVICE PERFORMANCE', vizType: 'sectionBanner', width: 3, icon: '🔧', accent: '#e67e22', dql: '' },
      { id: 'ex-svc-table', title: 'Service Business Performance', vizType: 'table', width: 3, icon: '📋', accent: '#e67e22',
        dql: `${b}\n| summarize EventCount = count(), Errors = countIf(json.hasError == true), Revenue = round(sum(toDouble(additionalfields.transactionValue)), decimals:2), AvgValue = round(avg(toDouble(additionalfields.transactionValue)), decimals:2), Customers = countDistinct(json.customerId), by:{json.serviceName}\n| fieldsAdd FailRate = round(100.0 * toDouble(Errors) / toDouble(EventCount), decimals:2)\n| fieldsAdd Service = concat("[", json.serviceName, "](${TENANT_BASE}/ui/apps/dynatrace.services)")\n| fields Service, Revenue, EventCount, Errors, FailRate, AvgValue, Customers\n| sort Revenue desc\n| limit 25` },
      { id: 'ex-svc-errors', title: 'Error Rate by Service', vizType: 'categoricalBar', width: 2, icon: '⚠️', accent: '#e74c3c',
        dql: `${b}\n| summarize total = count(), errors = countIf(json.hasError == true), by:{json.serviceName}\n| fieldsAdd errorRate = round(100.0 * toDouble(errors) / toDouble(total), decimals:1)\n| sort errorRate desc\n| limit 15` },
      { id: 'ex-heatmap', title: 'Event Activity Heatmap', vizType: 'honeycomb', width: 1, icon: '🔥',
        dql: `${b}\n| summarize count = count(), by:{event.type}\n| sort count desc\n| limit 20` },
    ];

    /* ══════════════════════════════════════════════════════════════
       DYNATRACE INTELLIGENCE — Problems · Root Cause · Anomalies ·
                                Impact · Resolution
       ══════════════════════════════════════════════════════════════ */
    case 'intelligence': return [
      // ── PROBLEM OVERVIEW ──
      { id: 'di-overview-banner', title: 'PROBLEM OVERVIEW', vizType: 'sectionBanner', width: 3, icon: '🔴', accent: '#e74c3c', dql: '' },
      { id: 'di-active', title: 'Active Problems', vizType: 'heroMetric', width: 1, icon: '🔥', accent: '#e74c3c',
        dql: `fetch dt.davis.problems, from:${timeframe}\n| filter dt.davis.is_duplicate == false\n| filter event.status == "ACTIVE"\n| summarize activeProblems = count()` },
      { id: 'di-total', title: 'Total Problems', vizType: 'heroMetric', width: 1, icon: '📊', accent: '#f39c12',
        dql: `fetch dt.davis.problems, from:${timeframe}\n| filter dt.davis.is_duplicate == false\n| summarize totalProblems = count()` },
      { id: 'di-affected-svc', title: 'Affected Services', vizType: 'heroMetric', width: 1, icon: '🔧', accent: '#a78bfa',
        dql: `fetch dt.davis.problems, from:${timeframe}\n| filter dt.davis.is_duplicate == false\n| expand affected_entity_ids\n| filter matchesPhrase(toString(affected_entity_ids), "SERVICE")\n| summarize affectedServices = countDistinct(affected_entity_ids)` },

      // ── PROBLEM DETAIL ──
      { id: 'di-detail-banner', title: 'PROBLEM DETAIL', vizType: 'sectionBanner', width: 3, icon: '🔍', accent: '#e74c3c', dql: '' },
      { id: 'di-problems-table', title: 'Dynatrace Intelligence Problems', vizType: 'table', width: 3, icon: '🔥', accent: '#e74c3c',
        dql: `fetch dt.davis.problems, from:${timeframe}\n| filter dt.davis.is_duplicate == false\n| sort timestamp desc\n| expand affected_entity_ids\n| lookup [fetch dt.entity.service], sourceField:affected_entity_ids, lookupField:id, prefix:"svc."\n| summarize {startTime = takeFirst(event.start), endTime = takeFirst(event.end), status = takeFirst(event.status), eventName = takeFirst(event.name), category = takeFirst(event.category), rootCause = takeFirst(root_cause_entity_name), affectedServices = collectDistinct(svc.entity.name), eventId = takeFirst(event.id)}, by:{display_id, event.kind}\n| fieldsAdd Description = concat("[", display_id, " - ", eventName, "](${TENANT_BASE}/ui/apps/dynatrace.davis.problems/problem/", eventId, ")")\n| fields Status = status, Description, RootCause = rootCause, Category = category, AffectedServices = affectedServices, StartTime = startTime\n| sort StartTime desc\n| limit 25` },
      { id: 'di-problems-ts', title: 'Problems Over Time', vizType: 'timeseries', width: 3, icon: '📈', accent: '#e74c3c',
        dql: `fetch dt.davis.problems, from:${timeframe}\n| filter dt.davis.is_duplicate == false\n| makeTimeseries count = count()` },

      // ── PROBLEM ANALYSIS ──
      { id: 'di-analysis-banner', title: 'PROBLEM ANALYSIS', vizType: 'sectionBanner', width: 3, icon: '🧠', accent: '#a78bfa', dql: '' },
      { id: 'di-by-category', title: 'Problems by Category', vizType: 'donut', width: 1, icon: '🎯', accent: '#a78bfa',
        dql: `fetch dt.davis.problems, from:${timeframe}\n| filter dt.davis.is_duplicate == false\n| summarize count = count(), by:{event.category}\n| sort count desc\n| limit 10` },
      { id: 'di-by-root-cause', title: 'Top Root Causes', vizType: 'categoricalBar', width: 2, icon: '🔎', accent: '#e74c3c',
        dql: `fetch dt.davis.problems, from:${timeframe}\n| filter dt.davis.is_duplicate == false\n| filter isNotNull(root_cause_entity_name)\n| summarize count = count(), by:{root_cause_entity_name}\n| sort count desc\n| limit 15` },
      { id: 'di-by-service', title: 'Affected Services', vizType: 'categoricalBar', width: 2, icon: '🔧', accent: '#a78bfa',
        dql: `fetch dt.davis.problems, from:${timeframe}\n| filter dt.davis.is_duplicate == false\n| expand affected_entity_ids\n| lookup [fetch dt.entity.service], sourceField:affected_entity_ids, lookupField:id, prefix:"svc."\n| filter isNotNull(svc.entity.name)\n| summarize count = count(), by:{svc.entity.name}\n| sort count desc\n| limit 15` },
      { id: 'di-severity-heatmap', title: 'Problem Severity Heatmap', vizType: 'honeycomb', width: 1, icon: '🔥', accent: '#e74c3c',
        dql: `fetch dt.davis.problems, from:${timeframe}\n| filter dt.davis.is_duplicate == false\n| summarize count = count(), by:{event.name}\n| sort count desc\n| limit 20` },

      // ── BUSINESS IMPACT ──
      { id: 'di-impact-banner', title: 'BUSINESS IMPACT', vizType: 'sectionBanner', width: 3, icon: '💰', accent: '#f39c12', dql: '' },
      { id: 'di-rev-impact', title: 'Revenue at Risk', vizType: 'impactCard', width: 1, icon: '💥', accent: '#e74c3c',
        dql: `${b}\n| summarize errors = countIf(json.hasError == true), totalTxns = count(), avgValue = avg(toDouble(additionalfields.transactionValue))\n| fieldsAdd estimatedImpact = round(toDouble(errors) * avgValue, decimals:0), errorRate = round(100.0 * toDouble(errors) / toDouble(totalTxns), decimals:1)` },
      { id: 'di-error-orders', title: 'Error-Affected Orders', vizType: 'heroMetric', width: 1, icon: '⚠️', accent: '#e74c3c',
        dql: `${b}\n| summarize errorOrders = countIf(json.hasError == true)` },
      { id: 'di-errors-ts', title: 'Business Errors Over Time', vizType: 'timeseries', width: 1, icon: '📈', accent: '#e74c3c',
        dql: `${b}\n| makeTimeseries errors = countIf(json.hasError == true)` },

      // ── ANOMALY EVENTS ──
      { id: 'di-anomaly-banner', title: 'ANOMALY EVENTS', vizType: 'sectionBanner', width: 3, icon: '📡', accent: '#4fc3f7', dql: '' },
      { id: 'di-events-ts', title: 'Davis Event Timeline', vizType: 'timeseries', width: 2, icon: '📊', accent: '#4fc3f7',
        dql: `fetch events, from:${timeframe}\n| filter event.kind == "DAVIS_EVENT" or event.kind == "DAVIS_PROBLEM"\n| makeTimeseries count = count(), by:{event.kind}` },
      { id: 'di-event-types', title: 'Event Type Distribution', vizType: 'donut', width: 1, icon: '🎯', accent: '#4fc3f7',
        dql: `fetch events, from:${timeframe}\n| filter event.kind == "DAVIS_EVENT" or event.kind == "DAVIS_PROBLEM"\n| summarize count = count(), by:{event.category}\n| sort count desc\n| limit 10` },
      { id: 'di-recent-events', title: 'Recent Anomaly Events', vizType: 'table', width: 3, icon: '📡', accent: '#4fc3f7',
        dql: `fetch events, from:${timeframe}\n| filter event.kind == "DAVIS_EVENT"\n| fieldsAdd AffectedEntity = affected_entity_ids[0]\n| fields Time = timestamp, Category = event.category, Name = event.name, Status = event.status, AffectedEntity\n| sort Time desc\n| limit 50` },
    ];

    /* ══════════════════════════════════════════════════════════════
       GENAI OBSERVABILITY — LLM Calls · Tokens · Latency · Models ·
                             Embeddings · Errors
       ══════════════════════════════════════════════════════════════ */
    case 'genai': return [
      // ── LLM OVERVIEW ──
      { id: 'ai-overview-banner', title: 'LLM OVERVIEW', vizType: 'sectionBanner', width: 3, icon: '🤖', accent: '#10b981', dql: '' },
      { id: 'ai-total-calls', title: 'Total LLM Calls', vizType: 'heroMetric', width: 1, icon: '📞', accent: '#10b981',
        dql: `fetch spans, from:${timeframe}\n| filter isNotNull(gen_ai.system)\n| summarize totalCalls = count()` },
      { id: 'ai-avg-latency', title: 'Avg LLM Latency', vizType: 'heroMetric', width: 1, icon: '⏱️', accent: '#f59e0b',
        dql: `fetch spans, from:${timeframe}\n| filter isNotNull(gen_ai.system)\n| summarize avgLatency = round(avg(duration), decimals:0)` },
      { id: 'ai-error-count', title: 'LLM Errors', vizType: 'heroMetric', width: 1, icon: '❌', accent: '#e74c3c',
        dql: `fetch spans, from:${timeframe}\n| filter isNotNull(gen_ai.system)\n| filter gen_ai.response.finish_reason == "error" or isNotNull(error.type)\n| summarize errors = count()` },

      // ── LLM ACTIVITY ──
      { id: 'ai-activity-banner', title: 'LLM ACTIVITY', vizType: 'sectionBanner', width: 3, icon: '📊', accent: '#10b981', dql: '' },
      { id: 'ai-calls-ts', title: 'LLM Calls Over Time', vizType: 'timeseries', width: 2, icon: '📈', accent: '#10b981',
        dql: `fetch spans, from:${timeframe}\n| filter isNotNull(gen_ai.system)\n| makeTimeseries calls = count()` },
      { id: 'ai-latency-ts', title: 'LLM Latency Over Time', vizType: 'timeseries', width: 1, icon: '⏱️', accent: '#f59e0b',
        dql: `fetch spans, from:${timeframe}\n| filter isNotNull(gen_ai.system)\n| makeTimeseries avgLatency = avg(duration)` },
      { id: 'ai-by-model', title: 'Calls by Model', vizType: 'categoricalBar', width: 2, icon: '🧠', accent: '#10b981',
        dql: `fetch spans, from:${timeframe}\n| filter isNotNull(gen_ai.system)\n| summarize count = count(), by:{gen_ai.request.model}\n| sort count desc\n| limit 15` },
      { id: 'ai-by-operation', title: 'Calls by Operation', vizType: 'donut', width: 1, icon: '🎯', accent: '#06b6d4',
        dql: `fetch spans, from:${timeframe}\n| filter isNotNull(gen_ai.system)\n| summarize count = count(), by:{gen_ai.operation.name}\n| sort count desc\n| limit 10` },

      // ── TOKEN USAGE ──
      { id: 'ai-tokens-banner', title: 'TOKEN USAGE', vizType: 'sectionBanner', width: 3, icon: '🔢', accent: '#8b5cf6', dql: '' },
      { id: 'ai-total-tokens', title: 'Total Tokens', vizType: 'heroMetric', width: 1, icon: '🔢', accent: '#8b5cf6',
        dql: `fetch spans, from:${timeframe}\n| filter isNotNull(gen_ai.system)\n| summarize totalTokens = sum(gen_ai.usage.output_tokens) + sum(gen_ai.usage.input_tokens)` },
      { id: 'ai-tokens-ts', title: 'Token Usage Over Time', vizType: 'timeseries', width: 2, icon: '📈', accent: '#8b5cf6',
        dql: `fetch spans, from:${timeframe}\n| filter isNotNull(gen_ai.system)\n| makeTimeseries inputTokens = sum(gen_ai.usage.input_tokens), outputTokens = sum(gen_ai.usage.output_tokens)` },
      { id: 'ai-tokens-by-model', title: 'Tokens by Model', vizType: 'categoricalBar', width: 2, icon: '🧠', accent: '#8b5cf6',
        dql: `fetch spans, from:${timeframe}\n| filter isNotNull(gen_ai.system)\n| summarize tokens = sum(gen_ai.usage.output_tokens) + sum(gen_ai.usage.input_tokens), by:{gen_ai.request.model}\n| sort tokens desc\n| limit 10` },
      { id: 'ai-avg-tokens', title: 'Avg Tokens per Call', vizType: 'heroMetric', width: 1, icon: '📊', accent: '#06b6d4',
        dql: `fetch spans, from:${timeframe}\n| filter isNotNull(gen_ai.system)\n| fieldsAdd total_tokens = gen_ai.usage.output_tokens + gen_ai.usage.input_tokens\n| summarize avgTokens = round(avg(total_tokens), decimals:0)` },

      // ── MODEL PERFORMANCE ──
      { id: 'ai-perf-banner', title: 'MODEL PERFORMANCE', vizType: 'sectionBanner', width: 3, icon: '⚡', accent: '#f59e0b', dql: '' },
      { id: 'ai-latency-by-model', title: 'Latency by Model', vizType: 'categoricalBar', width: 2, icon: '⏱️', accent: '#f59e0b',
        dql: `fetch spans, from:${timeframe}\n| filter isNotNull(gen_ai.system)\n| summarize avgLatency = round(avg(duration), decimals:0), p90 = round(percentile(duration, 90), decimals:0), maxLatency = round(max(duration), decimals:0), by:{gen_ai.request.model}\n| sort avgLatency desc\n| limit 10` },
      { id: 'ai-latency-by-op', title: 'Latency by Operation', vizType: 'categoricalBar', width: 1, icon: '🎯', accent: '#f59e0b',
        dql: `fetch spans, from:${timeframe}\n| filter isNotNull(gen_ai.system)\n| summarize avgLatency = round(avg(duration), decimals:0), calls = count(), by:{gen_ai.operation.name}\n| sort avgLatency desc\n| limit 10` },
      { id: 'ai-detail-table', title: 'LLM Call Details', vizType: 'table', width: 3, icon: '📋', accent: '#10b981',
        dql: `fetch spans, from:${timeframe}\n| filter isNotNull(gen_ai.system)\n| fieldsAdd ServiceName = entityName(dt.entity.service)\n| fieldsAdd Service = concat("[", ServiceName, "](${TENANT_BASE}/ui/apps/dynatrace.services/explorer?detailsId=", dt.entity.service, ")")\n| fieldsAdd Trace = concat("[", trace_id, "](${TENANT_BASE}/ui/apps/dynatrace.distributedtracing/explorer?traceId=", trace_id, ")")\n| fields Time = start_time, Service, Model = gen_ai.request.model, Operation = gen_ai.operation.name, InputTokens = gen_ai.usage.input_tokens, OutputTokens = gen_ai.usage.output_tokens, Duration = duration, Trace\n| sort Time desc\n| limit 100` },
    ];

    /* ══════════════════════════════════════════════════════════════
       SECURITY — Security Events · Attacks · Categories ·
                  Trends · Affected Entities
       ══════════════════════════════════════════════════════════════ */
    case 'security': return [
      // ── SECURITY OVERVIEW ──
      { id: 'sec-overview-banner', title: 'SECURITY OVERVIEW', vizType: 'sectionBanner', width: 3, icon: '🔒', accent: '#f59e0b', dql: '' },
      { id: 'sec-total-events', title: 'Total Security Events', vizType: 'heroMetric', width: 1, icon: '🛡️', accent: '#f59e0b',
        dql: `fetch events, from:${timeframe}\n| filter event.kind == "SECURITY_EVENT"\n| summarize total = count()` },
      { id: 'sec-categories', title: 'Event Categories', vizType: 'heroMetric', width: 1, icon: '📊', accent: '#3498db',
        dql: `fetch events, from:${timeframe}\n| filter event.kind == "SECURITY_EVENT"\n| summarize categories = countDistinct(event.category)` },
      { id: 'sec-attack-count', title: 'Attack Events', vizType: 'heroMetric', width: 1, icon: '⚔️', accent: '#ae132d',
        dql: `fetch events, from:${timeframe}\n| filter event.kind == "SECURITY_EVENT"\n| filter event.category == "ATTACK"\n| summarize attacks = count()` },

      // ── SECURITY TRENDS ──
      { id: 'sec-trend-banner', title: 'SECURITY TRENDS', vizType: 'sectionBanner', width: 3, icon: '📈', accent: '#f59e0b', dql: '' },
      { id: 'sec-events-ts', title: 'Security Events Over Time', vizType: 'timeseries', width: 2, icon: '📈', accent: '#f59e0b',
        dql: `fetch events, from:${timeframe}\n| filter event.kind == "SECURITY_EVENT"\n| makeTimeseries count = count()` },
      { id: 'sec-by-category', title: 'By Category', vizType: 'donut', width: 1, icon: '🎯', accent: '#e74c3c',
        dql: `fetch events, from:${timeframe}\n| filter event.kind == "SECURITY_EVENT"\n| summarize count = count(), by:{event.category}\n| sort count desc` },
      { id: 'sec-by-category-ts', title: 'Categories Over Time', vizType: 'timeseries', width: 2, icon: '📊', accent: '#3498db',
        dql: `fetch events, from:${timeframe}\n| filter event.kind == "SECURITY_EVENT"\n| makeTimeseries count = count(), by:{event.category}` },
      { id: 'sec-by-status', title: 'By Status', vizType: 'donut', width: 1, icon: '🏷️', accent: '#a78bfa',
        dql: `fetch events, from:${timeframe}\n| filter event.kind == "SECURITY_EVENT"\n| summarize count = count(), by:{event.status}\n| sort count desc\n| limit 10` },

      // ── SECURITY EVENT DETAILS ──
      { id: 'sec-detail-banner', title: 'SECURITY EVENT DETAILS', vizType: 'sectionBanner', width: 3, icon: '🔍', accent: '#f59e0b', dql: '' },
      { id: 'sec-events-table', title: 'Recent Security Events', vizType: 'table', width: 3, icon: '📋', accent: '#f59e0b',
        dql: `fetch events, from:${timeframe}\n| filter event.kind == "SECURITY_EVENT"\n| fields Time = timestamp, Category = event.category, Name = event.name, Status = event.status, Entity = affected_entity_ids[0]\n| sort Time desc\n| limit 50` },
      { id: 'sec-top-names', title: 'Top Event Names', vizType: 'categoricalBar', width: 2, icon: '📊', accent: '#e74c3c',
        dql: `fetch events, from:${timeframe}\n| filter event.kind == "SECURITY_EVENT"\n| summarize count = count(), by:{event.name}\n| sort count desc\n| limit 15` },
      { id: 'sec-affected-entities', title: 'Affected Entities', vizType: 'categoricalBar', width: 1, icon: '🎯', accent: '#f59e0b',
        dql: `fetch events, from:${timeframe}\n| filter event.kind == "SECURITY_EVENT"\n| expand affected_entity_ids\n| summarize count = count(), by:{affected_entity_ids}\n| sort count desc\n| limit 15` },

      // ── ATTACK ANALYSIS ──
      { id: 'sec-attack-banner', title: 'ATTACK ANALYSIS', vizType: 'sectionBanner', width: 3, icon: '⚔️', accent: '#ae132d', dql: '' },
      { id: 'sec-attack-ts', title: 'Attack Events Over Time', vizType: 'timeseries', width: 2, icon: '📈', accent: '#ae132d',
        dql: `fetch events, from:${timeframe}\n| filter event.kind == "SECURITY_EVENT"\n| filter event.category == "ATTACK"\n| makeTimeseries count = count()` },
      { id: 'sec-attack-types', title: 'Attack Types', vizType: 'donut', width: 1, icon: '🎯', accent: '#ae132d',
        dql: `fetch events, from:${timeframe}\n| filter event.kind == "SECURITY_EVENT"\n| filter event.category == "ATTACK"\n| summarize count = count(), by:{event.name}\n| sort count desc\n| limit 10` },
    ];

    /* ══════════════════════════════════════════════════════════════
       SRE / RELIABILITY — Availability · Error Budget · SLOs ·
                           Percentiles · Deployments
       ══════════════════════════════════════════════════════════════ */
    case 'sre': return [
      // ── RELIABILITY OVERVIEW ──
      { id: 'sre-overview-banner', title: 'RELIABILITY OVERVIEW', vizType: 'sectionBanner', width: 3, icon: '📋', accent: '#06b6d4', dql: '' },
      { id: 'sre-availability', title: 'Overall Availability %', vizType: 'heroMetric', width: 1, icon: '✅', accent: '#10b981',
        dql: `timeseries requests = sum(dt.service.request.count), errors = sum(dt.service.request.failure_count), from:${timeframe}\n| fieldsAdd r = arraySum(requests), e = arraySum(errors)\n| summarize totalR = sum(r), totalE = sum(e)\n| fieldsAdd availability = round(100.0 * (1.0 - toDouble(totalE) / toDouble(totalR)), decimals:3)` },
      { id: 'sre-error-rate', title: 'Global Error Rate %', vizType: 'heroMetric', width: 1, icon: '⚠️', accent: '#e74c3c',
        dql: `timeseries requests = sum(dt.service.request.count), errors = sum(dt.service.request.failure_count), from:${timeframe}\n| fieldsAdd r = arraySum(requests), e = arraySum(errors)\n| summarize totalR = sum(r), totalE = sum(e)\n| fieldsAdd errorRate = round(100.0 * toDouble(totalE) / toDouble(totalR), decimals:3)` },
      { id: 'sre-service-count', title: 'Total Services', vizType: 'heroMetric', width: 1, icon: '🔧', accent: '#06b6d4',
        dql: `timeseries r = sum(dt.service.request.count), by:{dt.entity.service}, from:${timeframe}\n| summarize serviceCount = count()` },

      // ── AVAILABILITY TREND ──
      { id: 'sre-trend-banner', title: 'AVAILABILITY TREND', vizType: 'sectionBanner', width: 3, icon: '📈', accent: '#10b981', dql: '' },
      { id: 'sre-avail-ts', title: 'Availability Over Time', vizType: 'timeseries', width: 2, icon: '📈', accent: '#10b981',
        dql: `timeseries requests = sum(dt.service.request.count), errors = sum(dt.service.request.failure_count), from:${timeframe}\n| fieldsAdd availability = 100.0 * (requests[] - errors[]) / requests[]\n| fields timeframe, interval, availability` },
      { id: 'sre-error-ts', title: 'Error Rate Over Time', vizType: 'timeseries', width: 1, icon: '📉', accent: '#e74c3c',
        dql: `timeseries requests = sum(dt.service.request.count), errors = sum(dt.service.request.failure_count), from:${timeframe}\n| fieldsAdd errorRate = 100.0 * errors[] / requests[]\n| fields timeframe, interval, errorRate` },

      // ── LATENCY PERCENTILES ──
      { id: 'sre-lat-banner', title: 'LATENCY PERCENTILES', vizType: 'sectionBanner', width: 3, icon: '⏱️', accent: '#f59e0b', dql: '' },
      { id: 'sre-p50-ts', title: 'Global p50 Latency', vizType: 'timeseries', width: 1, icon: '⏱️', accent: '#f1c40f',
        dql: `timeseries p50 = median(dt.service.request.response_time), from:${timeframe}` },
      { id: 'sre-p90-ts', title: 'Global p90 Latency', vizType: 'timeseries', width: 1, icon: '⏱️', accent: '#eca440',
        dql: `timeseries p90 = percentile(dt.service.request.response_time, 90), from:${timeframe}` },
      { id: 'sre-p99-ts', title: 'Global p99 Latency', vizType: 'timeseries', width: 1, icon: '⏱️', accent: '#c4233b',
        dql: `timeseries p99 = percentile(dt.service.request.response_time, 99), from:${timeframe}` },
      { id: 'sre-lat-table', title: 'Service Latency Percentiles', vizType: 'table', width: 3, icon: '📋', accent: '#f59e0b',
        dql: `timeseries {p50 = median(dt.service.request.response_time), p90 = percentile(dt.service.request.response_time, 90), p99 = percentile(dt.service.request.response_time, 99), requests = sum(dt.service.request.count)}, by:{dt.entity.service}, from:${timeframe}\n| fieldsAdd ServiceName = lower(entityName(dt.entity.service))${svcFSN}\n| fieldsAdd Service = concat("[", ServiceName, "](${TENANT_BASE}/ui/apps/dynatrace.services/explorer?detailsId=", dt.entity.service, ")")\n| fieldsAdd P50 = round(arrayAvg(p50), decimals:0), P90 = round(arrayAvg(p90), decimals:0), P99 = round(arrayAvg(p99), decimals:0), Requests = arraySum(requests)\n| fields Service, Requests, P50, P90, P99\n| sort P99 desc\n| limit 25` },

      // ── SERVICE RELIABILITY RANKING ──
      { id: 'sre-rank-banner', title: 'SERVICE RELIABILITY RANKING', vizType: 'sectionBanner', width: 3, icon: '🏆', accent: '#06b6d4', dql: '' },
      { id: 'sre-rank-table', title: 'Services by Reliability', vizType: 'table', width: 3, icon: '🏆', accent: '#06b6d4',
        dql: `timeseries {requests = sum(dt.service.request.count), errors = sum(dt.service.request.failure_count)}, by:{dt.entity.service}, from:${timeframe}\n| fieldsAdd ServiceName = lower(entityName(dt.entity.service))${svcFSN}\n| fieldsAdd Service = concat("[", ServiceName, "](${TENANT_BASE}/ui/apps/dynatrace.services/explorer?detailsId=", dt.entity.service, ")")\n| fieldsAdd TotalRequests = arraySum(requests), TotalErrors = arraySum(errors)\n| fieldsAdd ErrorRate = round((TotalErrors / TotalRequests) * 100, decimals:3)\n| fieldsAdd Availability = round(100 - ErrorRate, decimals:3)\n| fields Service, TotalRequests, TotalErrors, ErrorRate, Availability\n| sort Availability asc\n| limit 25` },
      { id: 'sre-worst-svc', title: 'Worst Error Rates', vizType: 'categoricalBar', width: 2, icon: '⚠️', accent: '#e74c3c',
        dql: `timeseries {requests = sum(dt.service.request.count), errors = sum(dt.service.request.failure_count)}, by:{dt.entity.service}, from:${timeframe}\n| fieldsAdd service = lower(entityName(dt.entity.service))${svcF}\n| fieldsAdd totalR = arraySum(requests), totalE = arraySum(errors)\n| fieldsAdd errorRate = round((totalE / totalR) * 100, decimals:2)\n| fields service, errorRate\n| sort errorRate desc\n| limit 15` },
      { id: 'sre-svc-req-dist', title: 'Request Volume by Service', vizType: 'donut', width: 1, icon: '📊', accent: '#06b6d4',
        dql: `timeseries requests = sum(dt.service.request.count), by:{dt.entity.service}, from:${timeframe}\n| fieldsAdd service = lower(entityName(dt.entity.service))${svcF}\n| fieldsAdd total = arraySum(requests)\n| fields service, total\n| sort total desc\n| limit 15` },

      // ── HTTP STATUS CODES ──
      { id: 'sre-http-banner', title: 'HTTP STATUS CODES', vizType: 'sectionBanner', width: 3, icon: '🌐', accent: '#3498db', dql: '' },
      { id: 'sre-2xx-ts', title: '2xx Success', vizType: 'timeseries', width: 1, icon: '✅', accent: '#10b981',
        dql: `timeseries success = sum(dt.service.request.count), from:${timeframe}, filter: http.response.status_code >= 200 and http.response.status_code <= 299` },
      { id: 'sre-4xx-ts', title: '4xx Client Errors', vizType: 'timeseries', width: 1, icon: '🟠', accent: '#f59e0b',
        dql: `timeseries clientErrors = sum(dt.service.request.count), from:${timeframe}, filter: http.response.status_code >= 400 and http.response.status_code <= 499` },
      { id: 'sre-5xx-ts', title: '5xx Server Errors', vizType: 'timeseries', width: 1, icon: '🔴', accent: '#e74c3c',
        dql: `timeseries serverErrors = sum(dt.service.request.count), from:${timeframe}, filter: http.response.status_code >= 500 and http.response.status_code <= 599` },

      // ── PROBLEMS IMPACTING SRE ──
      { id: 'sre-problem-banner', title: 'PROBLEMS IMPACTING RELIABILITY', vizType: 'sectionBanner', width: 3, icon: '🔥', accent: '#e74c3c', dql: '' },
      { id: 'sre-problems-table', title: 'Active Problems', vizType: 'table', width: 3, icon: '🔥', accent: '#e74c3c',
        dql: `fetch dt.davis.problems, from:${timeframe}\n| filter dt.davis.is_duplicate == false\n| sort timestamp desc\n| expand affected_entity_ids\n| lookup [fetch dt.entity.service], sourceField:affected_entity_ids, lookupField:id, prefix:"svc."\n| summarize {startTime = takeFirst(event.start), status = takeFirst(event.status), eventName = takeFirst(event.name), rootCause = takeFirst(root_cause_entity_name), affectedServices = collectDistinct(svc.entity.name), eventId = takeFirst(event.id)}, by:{display_id, event.kind}\n| fieldsAdd Problem = concat("[", display_id, " - ", eventName, "](${TENANT_BASE}/ui/apps/dynatrace.davis.problems/problem/", eventId, ")")\n| fields Status = status, Problem, RootCause = rootCause, AffectedServices = affectedServices, StartTime = startTime\n| sort StartTime desc\n| limit 25` },
    ];

    /* ══════════════════════════════════════════════════════════════
       BIZ EVENTS — Event Volume · Types · Errors · Journeys ·
                    Services · Companies
       ══════════════════════════════════════════════════════════════ */
    case 'logs': return [
      // ── EVENT OVERVIEW ──
      { id: 'log-overview-banner', title: 'EVENT OVERVIEW', vizType: 'sectionBanner', width: 3, icon: '📝', accent: '#8b5cf6', dql: '' },
      { id: 'log-total', title: 'Total Events', vizType: 'heroMetric', width: 1, icon: '📝', accent: '#8b5cf6',
        dql: `${b}\n| summarize totalEvents = count()` },
      { id: 'log-errors', title: 'Error Events', vizType: 'heroMetric', width: 1, icon: '❌', accent: '#e74c3c',
        dql: `${b}\n| filter json.hasError == true\n| summarize errorEvents = count()` },
      { id: 'log-types', title: 'Unique Event Types', vizType: 'heroMetric', width: 1, icon: '🏷️', accent: '#f59e0b',
        dql: `${b}\n| summarize types = countDistinct(event.type)` },

      // ── EVENT VOLUME ──
      { id: 'log-volume-banner', title: 'EVENT VOLUME', vizType: 'sectionBanner', width: 3, icon: '📊', accent: '#8b5cf6', dql: '' },
      { id: 'log-volume-ts', title: 'Event Volume Over Time', vizType: 'timeseries', width: 2, icon: '📈', accent: '#8b5cf6',
        dql: `${b}\n| makeTimeseries count = count()` },
      { id: 'log-type-dist', title: 'Events by Type', vizType: 'donut', width: 1, icon: '🎯', accent: '#8b5cf6',
        dql: `${b}\n| summarize count = count(), by:{event.type}\n| sort count desc` },
      { id: 'log-by-type-ts', title: 'Volume by Type', vizType: 'timeseries', width: 2, icon: '📊', accent: '#e74c3c',
        dql: `${b}\n| makeTimeseries count = count(), by:{event.type}` },
      { id: 'log-by-service', title: 'Events by Service', vizType: 'categoricalBar', width: 1, icon: '🔧', accent: '#06b6d4',
        dql: `${b}\n| summarize count = count(), by:{json.serviceName}\n| sort count desc\n| limit 15` },

      // ── ERROR ANALYSIS ──
      { id: 'log-error-banner', title: 'ERROR ANALYSIS', vizType: 'sectionBanner', width: 3, icon: '🔍', accent: '#e74c3c', dql: '' },
      { id: 'log-error-table', title: 'Recent Error Events', vizType: 'table', width: 3, icon: '❌', accent: '#e74c3c',
        dql: `${b}\n| filter json.hasError == true\n| fields Time = timestamp, Service = json.serviceName, Journey = json.journeyType, Step = json.stepName, Company = json.companyName, Type = event.type\n| sort Time desc\n| limit 100` },
      { id: 'log-error-by-service', title: 'Errors by Service', vizType: 'categoricalBar', width: 2, icon: '🐛', accent: '#e74c3c',
        dql: `${b}\n| filter json.hasError == true\n| summarize count = count(), by:{json.serviceName}\n| sort count desc\n| limit 15` },
      { id: 'log-error-by-journey', title: 'Errors by Journey', vizType: 'donut', width: 1, icon: '🛣️', accent: '#e74c3c',
        dql: `${b}\n| filter json.hasError == true\n| summarize count = count(), by:{json.journeyType}\n| sort count desc\n| limit 10` },

      // ── EVENT BREAKDOWN ──
      { id: 'log-breakdown-banner', title: 'EVENT BREAKDOWN', vizType: 'sectionBanner', width: 3, icon: '🔗', accent: '#06b6d4', dql: '' },
      { id: 'log-errors-ts', title: 'Error Events Over Time', vizType: 'timeseries', width: 2, icon: '❌', accent: '#e74c3c',
        dql: `${b}\n| makeTimeseries errors = countIf(json.hasError == true)` },
      { id: 'log-by-journey', title: 'Events by Journey', vizType: 'categoricalBar', width: 1, icon: '🛣️', accent: '#a78bfa',
        dql: `${b}\n| summarize count = count(), by:{json.journeyType}\n| sort count desc\n| limit 15` },
      { id: 'log-by-step', title: 'Events by Step', vizType: 'categoricalBar', width: 2, icon: '👣', accent: '#8b5cf6',
        dql: `${b}\n| summarize count = count(), by:{json.stepName}\n| sort count desc\n| limit 15` },
      { id: 'log-by-company', title: 'Events by Company', vizType: 'categoricalBar', width: 1, icon: '🏢', accent: '#a78bfa',
        dql: `${b}\n| summarize count = count(), by:{json.companyName}\n| sort count desc\n| limit 15` },

      // ── EVENT DETAILS ──
      { id: 'log-detail-banner', title: 'EVENT DETAILS', vizType: 'sectionBanner', width: 3, icon: '📋', accent: '#a78bfa', dql: '' },
      { id: 'log-detail-table', title: 'Event Detail Table', vizType: 'table', width: 3, icon: '📋', accent: '#a78bfa',
        dql: `${b}\n| fields Time = timestamp, Type = event.type, Service = json.serviceName, Journey = json.journeyType, Step = json.stepName, Company = json.companyName, Error = json.hasError\n| sort Time desc\n| limit 100` },
    ];

    default: return [];
  }
}

/* ═══════════════════════════════════════════════════════════════
   FIELD-AWARE TILE FILTER
   If no profile yet (still discovering), show all tiles.
   Once profile arrives, filter tiles to only those whose required
   fields are present with real data values.
   ═══════════════════════════════════════════════════════════════ */

function filterTiles(candidates: TileCandidate[], profile: FieldProfile | null): TileDefinition[] {
  if (!profile) return candidates; // before discovery completes, show everything

  return candidates.filter((tile) => {
    // Check numeric requirements
    if (tile.requiresNumeric?.length) {
      const numOk = tile.requiresNumeric.every((f) => profile.numericFields.has(f));
      if (!numOk) return false;
    }
    // Check categorical requirements
    if (tile.requiresCategorical?.length) {
      const catOk = tile.requiresCategorical.every((f) => profile.categoricalFields.has(f));
      if (!catOk) return false;
    }
    return true;
  });
}

/* ═══════════════════════════════════════════════════════════════
   SECTION BANNER COMPONENT — visual section headers (no DQL query)
   ═══════════════════════════════════════════════════════════════ */

function SectionBanner({ tile }: { tile: TileDefinition }) {
  const accent = tile.accent || '#4fc3f7';
  return (
    <div style={{
      gridColumn: '1 / -1',
      padding: '10px 18px',
      background: `linear-gradient(135deg, ${accent}15, ${accent}05)`,
      border: `1px solid ${accent}33`,
      borderLeft: `4px solid ${accent}`,
      borderRadius: 8,
      display: 'flex',
      alignItems: 'center',
      gap: 10,
    }}>
      <span style={{ fontSize: 16 }}>{tile.icon}</span>
      <span style={{ color: accent, fontWeight: 700, fontSize: 13, letterSpacing: '0.05em' }}>{tile.title}</span>
    </div>
  );
}

/* ═══════════════════════════════════════════════════════════════
   DQL TILE COMPONENT
   ═══════════════════════════════════════════════════════════════ */

function DqlTile({ tile, timeframe }: { tile: TileDefinition; timeframe: Timeframe }) {
  const [showDql, setShowDql] = useState(false);
  const [copied, setCopied] = useState(false);

  const { data, isLoading, isError, error } = useDqlQuery(
    { body: { query: tile.dql, requestTimeoutMilliseconds: 30000, maxResultRecords: 1000 } },
    { autoFetch: true, autoFetchOnUpdate: true },
  );

  const handleCopy = useCallback(() => {
    navigator.clipboard.writeText(tile.dql);
    setCopied(true);
    setTimeout(() => setCopied(false), 1500);
  }, [tile.dql]);

  const colSpan = tile.width === 3 ? '1 / -1' : tile.width === 2 ? 'span 2' : 'span 1';
  const accentColor = tile.accent || 'rgba(100,120,200,0.5)';
  const isCompact = tile.vizType === 'singleValue' || tile.vizType === 'gauge' || tile.vizType === 'meterBar' || tile.vizType === 'heroMetric' || tile.vizType === 'impactCard';

  return (
    <div style={{
      gridColumn: colSpan,
      background: 'linear-gradient(135deg, rgba(20,22,40,0.85) 0%, rgba(30,32,55,0.75) 100%)',
      border: '1px solid rgba(100,120,200,0.18)',
      borderTop: `3px solid ${accentColor}`,
      borderRadius: 14,
      padding: 18,
      display: 'flex',
      flexDirection: 'column',
      minHeight: isCompact ? 160 : 330,
      boxShadow: `0 4px 24px rgba(0,0,0,0.3), inset 0 1px 0 rgba(255,255,255,0.04), 0 0 40px ${accentColor}08`,
      backdropFilter: 'blur(12px)',
      transition: 'box-shadow 0.3s ease, border-color 0.3s ease',
    }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 10 }}>
        <span style={{ fontWeight: 600, fontSize: 13, color: '#e0e4ff', display: 'flex', alignItems: 'center', gap: 6 }}>
          {tile.icon && <span style={{ fontSize: 15 }}>{tile.icon}</span>}
          {tile.title}
        </span>
        <button onClick={() => setShowDql(!showDql)} style={{
          background: 'rgba(100,120,200,0.15)', border: '1px solid rgba(100,120,200,0.3)',
          borderRadius: 6, color: '#8899cc', fontSize: 10, padding: '3px 8px', cursor: 'pointer',
        }}>
          {showDql ? 'Hide DQL' : 'Show DQL'}
        </button>
      </div>

      {showDql && (
        <div style={{
          background: 'rgba(0,0,0,0.35)', border: '1px solid rgba(100,120,200,0.2)',
          borderRadius: 6, padding: 10, marginBottom: 10, fontSize: 11,
          fontFamily: 'monospace', color: '#99aadd', whiteSpace: 'pre-wrap',
          wordBreak: 'break-all', position: 'relative',
        }}>
          {tile.dql}
          <button onClick={handleCopy} style={{
            position: 'absolute', top: 6, right: 6,
            background: copied ? 'rgba(39,174,96,0.3)' : 'rgba(100,120,200,0.2)',
            border: '1px solid rgba(100,120,200,0.3)', borderRadius: 4,
            color: copied ? '#27ae60' : '#8899cc', fontSize: 10, padding: '2px 8px', cursor: 'pointer',
          }}>
            {copied ? '✓ Copied' : 'Copy'}
          </button>
        </div>
      )}

      <div style={{ flex: 1, minHeight: isCompact ? 80 : 250, position: 'relative' }}>
        {isLoading && (
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '100%', color: accentColor, fontSize: 12, gap: 8 }}>
            <span style={{ display: 'inline-block', width: 6, height: 6, borderRadius: '50%', background: accentColor, animation: 'pulse 1.2s ease-in-out infinite' }} />
            Loading…
          </div>
        )}
        {isError && (
          <div style={{ color: '#e74c3c', fontSize: 11, padding: 8 }}>Error: {error?.message || 'Query failed'}</div>
        )}
        {!isLoading && !isError && data && <ChartRenderer vizType={tile.vizType} data={data} tile={tile} />}
      </div>
    </div>
  );
}

/* ═══════════════════════════════════════════════════════════════
   CHART RENDERER
   ═══════════════════════════════════════════════════════════════ */

/** Extract the last numeric-looking value from a DQL record.
 *  DQL `fieldsAdd` appends derived fields at the end, so the last numeric
 *  column is almost always the computed result (e.g. rate, average). */
function extractNumeric(record: Record<string, any>): number {
  let last = 0;
  for (const k of Object.keys(record)) {
    const v = record[k];
    if (typeof v === 'number' && isFinite(v)) { last = v; }
    else if (typeof v === 'string') { const n = Number(v); if (isFinite(n)) last = n; }
  }
  return last;
}

/** Find the dimension (string category) and metric (numeric) keys in a DQL record. */
function classifyRecordKeys(record: Record<string, any>): { dimKey: string | null; metricKey: string | null } {
  let dimKey: string | null = null;
  let metricKey: string | null = null;
  for (const k of Object.keys(record)) {
    const v = record[k];
    if (metricKey === null && (typeof v === 'number' || (typeof v === 'string' && isFinite(Number(v)) && v !== ''))) {
      metricKey = k;
    } else if (dimKey === null && typeof v === 'string') {
      dimKey = k;
    }
  }
  if (!dimKey && metricKey) {
    for (const k of Object.keys(record)) {
      if (k !== metricKey) { dimKey = k; break; }
    }
  }
  return { dimKey, metricKey };
}

/** Format large numbers nicely: 63200 → "63.2K", 1200000 → "1.2M" */
function fmtNum(n: number): string {
  if (n === 0) return '0';
  const abs = Math.abs(n);
  if (abs >= 1_000_000_000) return (n / 1_000_000_000).toFixed(1).replace(/\.0$/, '') + 'B';
  if (abs >= 1_000_000) return (n / 1_000_000).toFixed(1).replace(/\.0$/, '') + 'M';
  if (abs >= 10_000) return (n / 1_000).toFixed(1).replace(/\.0$/, '') + 'K';
  if (abs >= 1_000) return n.toLocaleString('en-US', { maximumFractionDigits: 1 });
  if (Number.isInteger(n)) return n.toString();
  return n.toFixed(2);
}

/* ─────── REGION → LAT/LNG LOOKUP ─────── */
const REGION_COORDS: Record<string, [number, number]> = {
  'north america': [-100, 45], 'south america': [-60, -15], 'europe': [15, 50],
  'asia': [100, 35], 'africa': [25, 5], 'oceania': [135, -25], 'australia': [135, -25],
  'middle east': [45, 28], 'central america': [-85, 14], 'caribbean': [-72, 18],
  'southeast asia': [110, 5], 'east asia': [120, 35], 'south asia': [78, 22],
  'central asia': [65, 42], 'eastern europe': [30, 52], 'western europe': [5, 48],
  'northern europe': [15, 60], 'southern europe': [15, 42],
  'usa': [-98, 38], 'united states': [-98, 38], 'us': [-98, 38],
  'canada': [-105, 56], 'mexico': [-102, 23], 'brazil': [-51, -14],
  'argentina': [-64, -34], 'uk': [-1, 53], 'united kingdom': [-1, 53],
  'france': [2, 46], 'germany': [10, 51], 'spain': [-3, 40], 'italy': [12, 42],
  'netherlands': [5, 52], 'switzerland': [8, 47], 'austria': [14, 47],
  'poland': [20, 52], 'sweden': [15, 62], 'norway': [10, 62],
  'finland': [26, 64], 'ireland': [-8, 53], 'portugal': [-8, 39],
  'russia': [100, 60], 'china': [105, 35], 'japan': [138, 36], 'south korea': [127, 36],
  'india': [78, 22], 'indonesia': [118, -2], 'thailand': [100, 15],
  'singapore': [103, 1], 'taiwan': [121, 24], 'turkey': [32, 39],
  'saudi arabia': [45, 24], 'uae': [54, 24], 'israel': [34, 31],
  'egypt': [30, 27], 'south africa': [25, -30], 'nigeria': [8, 10], 'kenya': [37, 0],
  'new zealand': [174, -41], 'pakistan': [69, 30],
  'emea': [15, 48], 'apac': [110, 20], 'latam': [-60, -10], 'amer': [-90, 35],
  'northeast': [-73, 42], 'southeast': [-83, 33], 'midwest': [-90, 42],
  'southwest': [-110, 33], 'northwest': [-120, 46], 'west': [-118, 37], 'east': [-77, 39],
  'global': [0, 20], 'worldwide': [0, 20],
};
function resolveCoords(regionName: string): [number, number] | null {
  const lower = regionName.toLowerCase().trim();
  if (REGION_COORDS[lower]) return REGION_COORDS[lower];
  for (const [key, coords] of Object.entries(REGION_COORDS)) {
    if (lower.includes(key) || key.includes(lower)) return coords;
  }
  return null;
}
function project(lon: number, lat: number): [number, number] {
  const x = ((lon + 180) / 360) * 800;
  const latRad = (lat * Math.PI) / 180;
  const mercN = Math.log(Math.tan(Math.PI / 4 + latRad / 2));
  const y = 200 - (mercN / Math.PI) * 200;
  return [Math.max(5, Math.min(795, x)), Math.max(5, Math.min(395, y))];
}

/* Continent outlines as [lon,lat] polygons — projected via same Mercator fn */
const CONTINENT_POLYS: Array<[number, number][]> = [
  /* North America */
  [[-130,55],[-125,48],[-122,37],[-117,33],[-112,30],[-105,20],[-98,18],[-92,18],[-87,15],[-83,10],[-80,8],[-79,9],[-82,17],[-81,25],[-82,30],[-78,35],[-75,39],[-70,42],[-67,45],[-64,47],[-59,47],[-55,50],[-58,53],[-62,57],[-68,60],[-75,62],[-85,65],[-100,65],[-120,62],[-138,60],[-148,61],[-155,62],[-162,64],[-165,62],[-165,57],[-157,56],[-145,58],[-135,57],[-130,55]],
  /* South America */
  [[-80,9],[-76,7],[-72,11],[-67,11],[-62,8],[-55,5],[-50,1],[-44,-2],[-38,-4],[-35,-8],[-35,-13],[-38,-17],[-40,-22],[-44,-24],[-48,-28],[-53,-33],[-57,-38],[-62,-42],[-66,-46],[-68,-53],[-72,-48],[-73,-42],[-71,-35],[-72,-28],[-74,-20],[-77,-12],[-79,-5],[-78,0],[-77,4],[-80,9]],
  /* Europe */
  [[-9,36],[-5,36],[0,38],[3,43],[-2,44],[-5,44],[-9,43],[-10,44],[-5,48],[2,49],[6,52],[0,53],[-5,56],[-3,58],[5,59],[9,56],[12,55],[10,59],[12,62],[18,64],[25,66],[30,65],[32,60],[30,55],[24,52],[20,48],[25,45],[28,42],[26,38],[22,35],[15,38],[12,44],[8,46],[5,44],[2,43],[0,38],[-5,36],[-9,36]],
  /* Africa */
  [[-17,15],[-17,21],[-14,26],[-10,30],[-5,35],[0,35],[10,37],[12,34],[20,32],[25,31],[32,30],[36,28],[40,18],[44,12],[48,8],[50,2],[48,-1],[42,-5],[40,-11],[37,-18],[34,-25],[30,-30],[26,-34],[20,-34],[17,-30],[15,-22],[12,-12],[10,-5],[5,5],[0,6],[-5,5],[-10,6],[-14,10],[-17,15]],
  /* Asia (mainland) */
  [[30,40],[35,37],[40,38],[48,30],[55,27],[60,28],[62,38],[68,38],[72,22],[78,8],[80,12],[85,22],[90,22],[95,17],[100,14],[102,20],[105,22],[108,12],[112,10],[115,15],[118,22],[122,25],[128,34],[132,33],[140,36],[142,38],[145,42],[150,46],[158,50],[167,52],[170,60],[175,65],[180,66],[180,55],[170,50],[160,48],[152,45],[145,42],[142,38],[140,36],[133,33],[128,35],[125,30],[122,25],[118,20],[115,15],[112,10],[108,12],[105,10],[100,14],[98,18],[102,20],[105,22],[100,22],[95,18],[90,22],[85,22],[80,15],[78,8],[73,17],[72,22],[68,28],[60,28],[55,27],[50,28],[48,30],[42,33],[38,35],[35,37],[30,40]],
  /* Australia */
  [[115,-14],[122,-13],[130,-12],[136,-12],[141,-15],[146,-16],[149,-20],[152,-25],[153,-28],[150,-33],[147,-38],[142,-38],[137,-35],[132,-33],[128,-30],[124,-26],[120,-22],[116,-20],[114,-23],[115,-27],[118,-33],[116,-35],[113,-33],[113,-25],[114,-20],[115,-14]],
  /* Greenland */
  [[-52,60],[-45,60],[-38,65],[-22,70],[-18,76],[-20,80],[-35,82],[-45,82],[-55,80],[-55,75],[-50,68],[-52,60]],
];
function buildContinentPaths(): string[] {
  return CONTINENT_POLYS.map((poly) =>
    poly.map((p, i) => { const [x, y] = project(p[0], p[1]); return `${i === 0 ? 'M' : 'L'}${x.toFixed(0)},${y.toFixed(0)}`; }).join(' ') + ' Z'
  );
}

/** SVG World Map with real continent outlines and animated data points */
function WorldMapChart({ data, tile }: { data: any; tile?: TileDefinition }) {
  if (!data?.records?.length) return <div style={{ color: '#666', fontSize: 11, padding: 8 }}>No region data</div>;
  const { dimKey, metricKey } = classifyRecordKeys(data.records[0]);
  const points: Array<{ name: string; value: number; x: number; y: number }> = [];
  let maxVal = 1;
  for (const r of data.records) {
    const name = dimKey ? String(r[dimKey] ?? '') : '';
    const value = metricKey ? (typeof r[metricKey] === 'number' ? r[metricKey] : Number(r[metricKey]) || 0) : 0;
    if (!name || value <= 0) continue;
    const coords = resolveCoords(name);
    if (!coords) continue;
    const [x, y] = project(coords[0], coords[1]);
    points.push({ name, value, x, y });
    if (value > maxVal) maxVal = value;
  }
  const accent = tile?.accent || '#1abc9c';
  const continentPaths = buildContinentPaths();
  return (
    <div style={{ width: '100%', height: 280, position: 'relative' }}>
      <svg viewBox="0 0 800 400" style={{ width: '100%', height: '100%' }} preserveAspectRatio="xMidYMid meet">
        <defs>
          <radialGradient id="glow-grad">
            <stop offset="0%" stopColor={accent} stopOpacity="0.6" />
            <stop offset="100%" stopColor={accent} stopOpacity="0" />
          </radialGradient>
          <filter id="land-glow" x="-5%" y="-5%" width="110%" height="110%">
            <feGaussianBlur stdDeviation="2" result="blur" />
            <feMerge><feMergeNode in="blur" /><feMergeNode in="SourceGraphic" /></feMerge>
          </filter>
        </defs>
        {/* Ocean */}
        <rect x="0" y="0" width="800" height="400" fill="#080c18" rx="8" />
        {/* Subtle grid */}
        {[160, 320, 480, 640].map(x => (
          <line key={`vg${x}`} x1={x} y1="0" x2={x} y2="400" stroke="rgba(80,120,200,0.05)" strokeWidth="0.5" strokeDasharray="4,8" />
        ))}
        {/* Equator */}
        <line x1="0" y1="200" x2="800" y2="200" stroke="rgba(80,120,200,0.08)" strokeWidth="0.5" strokeDasharray="6,6" />
        {/* Continent outlines */}
        {continentPaths.map((d, i) => (
          <path key={i} d={d} fill="rgba(60,100,180,0.08)" stroke="rgba(80,130,220,0.25)" strokeWidth="0.8" strokeLinejoin="round" />
        ))}
        {/* Connection lines from data points to their labels (for depth) */}
        {points.map((p, i) => {
          const frac = p.value / maxVal;
          const r = 6 + frac * 16;
          return <line key={`conn${i}`} x1={p.x} y1={p.y} x2={p.x} y2={p.y - r - 10} stroke={accent} strokeWidth="0.4" opacity="0.2" />;
        })}
        {/* Data points */}
        {points.map((p, i) => {
          const frac = p.value / maxVal;
          const r = 6 + frac * 16;
          const op = 0.4 + frac * 0.5;
          return (
            <g key={i}>
              {/* Outer pulse */}
              <circle cx={p.x} cy={p.y} r={r * 1.5} fill="none" stroke={accent} strokeWidth="0.5" opacity="0">
                <animate attributeName="r" from={String(r)} to={String(r * 3)} dur="2.5s" repeatCount="indefinite" />
                <animate attributeName="opacity" from={String(op * 0.5)} to="0" dur="2.5s" repeatCount="indefinite" />
              </circle>
              {/* Glow halo */}
              <circle cx={p.x} cy={p.y} r={r * 1.8} fill="url(#glow-grad)" opacity={op * 0.3} />
              {/* Main dot */}
              <circle cx={p.x} cy={p.y} r={r} fill={accent} opacity={op} stroke="rgba(255,255,255,0.5)" strokeWidth="0.8" />
              {/* Inner highlight */}
              <circle cx={p.x - r * 0.2} cy={p.y - r * 0.2} r={r * 0.3} fill="rgba(255,255,255,0.3)" />
              {/* Label */}
              <text x={p.x} y={p.y - r - 6} textAnchor="middle" fill="rgba(255,255,255,0.92)" fontSize="10" fontWeight="600" style={{ textShadow: '0 1px 4px rgba(0,0,0,0.8)' }}>{p.name}</text>
              {/* Value inside dot */}
              <text x={p.x} y={p.y + 3.5} textAnchor="middle" fill="#fff" fontSize={r > 12 ? '9' : '7'} fontWeight="700">{fmtNum(p.value)}</text>
            </g>
          );
        })}
        {points.length === 0 && (
          <text x="400" y="200" textAnchor="middle" fill="#556" fontSize="13">No recognized regions in data</text>
        )}
      </svg>
    </div>
  );
}

/** Rich single-value display with large formatted number and accent color */
function RichSingleValue({ data: queryData, tile }: { data: any; tile?: TileDefinition }) {
  if (!queryData?.records?.length) return <div style={{ color: '#666', fontSize: 11, padding: 8 }}>—</div>;
  const val = extractNumeric(queryData.records[0]);
  const accent = tile?.accent || '#3498db';
  const isPercent = (tile?.title || '').toLowerCase().includes('rate') || (tile?.title || '').toLowerCase().includes('%');
  const display = isPercent ? (val <= 1 ? (val * 100).toFixed(1) + '%' : val.toFixed(1) + '%') : fmtNum(val);
  return (
    <div style={{ display: 'flex', flexDirection: 'column', justifyContent: 'center', alignItems: 'center', height: '100%', padding: '8px 0' }}>
      <div style={{ fontSize: 42, fontWeight: 700, color: accent, lineHeight: 1.1, textShadow: `0 0 24px ${accent}44`, letterSpacing: '-0.02em' }}>
        {display}
      </div>
    </div>
  );
}

/** Extract a numeric value from a record by trying multiple field names */
function extractFieldValue(record: Record<string, any>, fieldNames: string[]): number {
  for (const name of fieldNames) {
    if (record[name] !== undefined && record[name] !== null) {
      const val = Number(record[name]);
      if (isFinite(val)) return val;
    }
  }
  return 0;
}

/** Hero metric — premium large-number display for key business KPIs */
function HeroMetric({ data, tile }: { data: any; tile?: TileDefinition }) {
  if (!data?.records?.length) return <div style={{ color: '#445', fontSize: 13, textAlign: 'center', padding: 20 }}>—</div>;
  const val = extractNumeric(data.records[0]);
  const accent = tile?.accent || '#00d4aa';
  const title = (tile?.title || '').toLowerCase();
  const isCurrency = title.includes('revenue') || title.includes('value') || title.includes('cost') || title.includes('spend');
  const isPercent = title.includes('rate') || title.includes('%') || title.includes('resolution') || title.includes('abandonment');
  const isTime = title.includes('time') || title.includes('duration') || title.includes('(s)') || title.includes('(ms)');

  let display: string;
  let unit = '';
  if (isPercent) {
    const pctVal = val > 0 && val <= 1 ? val * 100 : val;
    display = pctVal.toFixed(1);
    unit = '%';
  } else if (isCurrency) {
    display = '$' + fmtNum(val);
  } else if (isTime) {
    display = fmtNum(val);
    unit = title.includes('(ms)') ? 'ms' : 's';
  } else {
    display = fmtNum(val);
  }

  return (
    <div style={{
      display: 'flex', flexDirection: 'column', justifyContent: 'center', alignItems: 'center',
      height: '100%', position: 'relative', overflow: 'hidden',
    }}>
      <div style={{
        position: 'absolute', width: 160, height: 160, borderRadius: '50%',
        background: `radial-gradient(circle, ${accent}18 0%, transparent 70%)`,
        filter: 'blur(30px)', pointerEvents: 'none',
      }} />
      <div style={{
        fontSize: 56, fontWeight: 800, color: accent, lineHeight: 1,
        letterSpacing: '-0.03em',
        textShadow: `0 0 40px ${accent}55, 0 2px 8px rgba(0,0,0,0.3)`,
        position: 'relative', zIndex: 1,
      }}>
        {display}
        {unit && <span style={{ fontSize: 22, fontWeight: 600, opacity: 0.6, marginLeft: 2 }}>{unit}</span>}
      </div>
    </div>
  );
}

/** Impact card — shows business impact of errors in plain language */
function ImpactCard({ data, tile }: { data: any; tile?: TileDefinition }) {
  if (!data?.records?.length) return <div style={{ color: '#445', fontSize: 12, textAlign: 'center', padding: 20 }}>No data</div>;
  const record = data.records[0];
  const errors = Math.round(extractFieldValue(record, ['errors', 'errorCount']));
  const impact = Math.round(extractFieldValue(record, ['estimatedImpact', 'impact']));
  const rate = extractFieldValue(record, ['errorRate', 'rate']);

  const isHealthy = errors === 0;
  const severity: 'healthy' | 'warning' | 'critical' = isHealthy ? 'healthy' : rate > 5 ? 'critical' : 'warning';
  const sColor = { healthy: '#00d4aa', warning: '#f39c12', critical: '#e74c3c' }[severity];

  return (
    <div style={{
      display: 'flex', flexDirection: 'column', justifyContent: 'center', alignItems: 'center',
      height: '100%', gap: 8, textAlign: 'center', padding: '12px 16px',
      position: 'relative', overflow: 'hidden',
    }}>
      <div style={{
        position: 'absolute', inset: 0, opacity: 0.06,
        background: `radial-gradient(ellipse at center, ${sColor} 0%, transparent 70%)`,
        pointerEvents: 'none',
      }} />
      {isHealthy ? (
        <>
          <div style={{ fontSize: 40, lineHeight: 1 }}>✓</div>
          <div style={{ fontSize: 16, fontWeight: 700, color: '#00d4aa', position: 'relative', zIndex: 1 }}>All Clear</div>
          <div style={{ fontSize: 11, color: '#667', position: 'relative', zIndex: 1 }}>No errors impacting revenue</div>
        </>
      ) : (
        <>
          {impact > 0 ? (
            <div style={{
              fontSize: 36, fontWeight: 800, color: sColor, lineHeight: 1,
              textShadow: `0 0 30px ${sColor}44`, position: 'relative', zIndex: 1,
            }}>
              ${fmtNum(impact)}
            </div>
          ) : (
            <div style={{
              fontSize: 36, fontWeight: 800, color: sColor, lineHeight: 1,
              position: 'relative', zIndex: 1,
            }}>
              {fmtNum(errors)}
            </div>
          )}
          <div style={{ fontSize: 12, color: '#c0c8e8', lineHeight: 1.5, position: 'relative', zIndex: 1 }}>
            <strong style={{ color: sColor }}>{fmtNum(errors)}</strong> errors
            {rate > 0 && <> · {rate.toFixed(1)}% rate</>}
          </div>
          {impact > 0 && (
            <div style={{ fontSize: 11, color: '#8899cc', position: 'relative', zIndex: 1 }}>estimated revenue at risk</div>
          )}
        </>
      )}
    </div>
  );
}

function ChartRenderer({ vizType, data, tile }: { vizType: TileDefinition['vizType']; data: any; tile?: TileDefinition }) {
  if (!data?.records?.length) return <div style={{ color: '#666', fontSize: 11, padding: 8 }}>No data</div>;

  switch (vizType) {
    case 'timeseries': {
      const ts = convertQueryResultToTimeseries(data);
      if (!ts?.length) return <div style={{ color: '#666', fontSize: 11 }}>No timeseries data</div>;
      return <TimeseriesChart data={ts} height={250} />;
    }

    case 'pie': {
      const { dimKey, metricKey } = classifyRecordKeys(data.records[0]);
      const slices = data.records.map((r: any) => ({
        category: dimKey ? String(r[dimKey] ?? 'Unknown') : 'Unknown',
        value: metricKey ? (typeof r[metricKey] === 'number' ? r[metricKey] : Number(r[metricKey]) || 0) : 0,
      }));
      return <PieChart data={{ slices }} height={250} />;
    }

    case 'categoricalBar': {
      const { dimKey, metricKey } = classifyRecordKeys(data.records[0]);
      const chartData = data.records.map((r: any) => ({
        category: dimKey ? String(r[dimKey] ?? 'Unknown') : 'Unknown',
        value: metricKey ? (typeof r[metricKey] === 'number' ? r[metricKey] : Number(r[metricKey]) || 0) : 0,
      }));
      return <CategoricalBarChart data={chartData} height={250} />;
    }

    case 'singleValue':
      return <RichSingleValue data={data} tile={tile} />;

    case 'gauge': {
      const val = extractNumeric(data.records[0]);
      return <GaugeChart value={val} min={0} max={Math.max(100, val)} height={120} />;
    }

    case 'donut': {
      const { dimKey, metricKey } = classifyRecordKeys(data.records[0]);
      const slices = data.records.map((r: any) => ({
        category: dimKey ? String(r[dimKey] ?? 'Unknown') : 'Unknown',
        value: metricKey ? (typeof r[metricKey] === 'number' ? r[metricKey] : Number(r[metricKey]) || 0) : 0,
      }));
      return <DonutChart data={{ slices }} height={250}><DonutChart.Legend /></DonutChart>;
    }

    case 'honeycomb': {
      const hcData: Array<{ name: string; value: number }> = [];
      for (const r of data.records) {
        const { dimKey: dk, metricKey: mk } = classifyRecordKeys(r);
        const nm = dk ? String(r[dk] ?? 'Item') : 'Item';
        const vl = mk ? (typeof r[mk] === 'number' ? r[mk] : Number(r[mk]) || 0) : 0;
        if (vl > 0) hcData.push({ name: nm, value: vl });
      }
      if (!hcData.length) return <div style={{ color: '#666', fontSize: 11 }}>No numeric data</div>;
      return <HoneycombChart data={hcData} height={250} shape="hexagon" showLabels />;
    }

    case 'meterBar': {
      const val = extractNumeric(data.records[0]);
      const isPercent = (tile?.title || '').toLowerCase().includes('rate') || (tile?.title || '').toLowerCase().includes('%');
      const display = isPercent ? (val <= 1 ? (val * 100).toFixed(1) + '%' : val.toFixed(1) + '%') : fmtNum(val);
      return (
        <div style={{ display: 'flex', flexDirection: 'column', justifyContent: 'center', height: '100%', gap: 8, padding: '4px 12px' }}>
          <div style={{ fontSize: 28, fontWeight: 700, color: tile?.accent || '#1abc9c', textAlign: 'center', textShadow: `0 0 16px ${tile?.accent || '#1abc9c'}44` }}>
            {display}
          </div>
          <MeterBarChart value={isPercent && val <= 1 ? val * 100 : val} min={0} max={100} color={tile?.accent || undefined} />
        </div>
      );
    }

    case 'worldMap':
      return <WorldMapChart data={data} tile={tile} />;

    case 'heroMetric':
      return <HeroMetric data={data} tile={tile} />;

    case 'impactCard':
      return <ImpactCard data={data} tile={tile} />;

    case 'table': {
      const records = data.records;
      const keys = Object.keys(records[0]).filter(k => !k.startsWith('__'));
      const isCurrencyCol = (k: string) => /revenue|value|cost|spend|impact/i.test(k) && !/rate|count|fail/i.test(k);
      // Parse markdown links: [text](url) → { text, url }
      const mdLinkRe = /^\[([^\]]+)\]\(([^)]+)\)$/;
      const inlineMdLinkRe = /\[([^\]]+)\]\(([^)]+)\)/g;

      return (
        <div style={{ overflowX: 'auto', overflowY: 'auto', maxHeight: 280, fontSize: 11 }}>
          <table style={{ width: '100%', borderCollapse: 'separate', borderSpacing: 0 }}>
            <thead>
              <tr>
                {keys.map(k => (
                  <th key={k} style={{
                    padding: '6px 10px', textAlign: 'left', whiteSpace: 'nowrap',
                    background: 'rgba(100,120,200,0.12)', color: '#8899cc',
                    borderBottom: '1px solid rgba(100,120,200,0.25)', fontWeight: 600, fontSize: 10,
                    position: 'sticky', top: 0, zIndex: 1,
                  }}>{k}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {records.slice(0, 50).map((r: any, i: number) => (
                <tr key={i} style={{ background: i % 2 === 0 ? 'transparent' : 'rgba(100,120,200,0.04)' }}>
                  {keys.map(k => {
                    const val = r[k];
                    const isNum = typeof val === 'number';
                    const isHighFailRate = k.toLowerCase().includes('fail') && isNum && val > 2;
                    let display: string | React.ReactNode = val === null || val === undefined ? '—' : isNum ? (isCurrencyCol(k) ? '$' + fmtNum(val) : fmtNum(val)) : String(val);
                    // Render markdown links as clickable <a> tags
                    if (typeof display === 'string') {
                      const str = display;
                      const fullMatch = str.match(mdLinkRe);
                      if (fullMatch) {
                        display = <a href={fullMatch[2]} target="_blank" rel="noopener noreferrer" style={{ color: '#4fc3f7', textDecoration: 'underline', cursor: 'pointer' }}>{fullMatch[1]}</a>;
                      } else if (inlineMdLinkRe.test(str)) {
                        // Multiple inline links mixed with text
                        inlineMdLinkRe.lastIndex = 0;
                        const parts: React.ReactNode[] = [];
                        let last = 0;
                        str.replace(inlineMdLinkRe, (match: string, text: string, url: string, offset: number) => {
                          if (offset > last) parts.push(str.slice(last, offset));
                          parts.push(<a key={offset} href={url} target="_blank" rel="noopener noreferrer" style={{ color: '#4fc3f7', textDecoration: 'underline', cursor: 'pointer' }}>{text}</a>);
                          last = offset + match.length;
                          return match;
                        });
                        if (last < str.length) parts.push(str.slice(last));
                        display = <>{parts}</>;
                      }
                    }
                    return (
                      <td key={k} style={{
                        padding: '5px 10px', borderBottom: '1px solid rgba(100,120,200,0.08)',
                        color: isHighFailRate ? '#e74c3c' : isNum ? '#e0e4ff' : '#b0b8d8',
                        whiteSpace: 'nowrap', fontFamily: isNum ? 'monospace' : 'inherit', fontSize: 11,
                      }}>{display}</td>
                    );
                  })}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      );
    }

    default: return <div style={{ color: '#666', fontSize: 11 }}>Unsupported: {vizType}</div>;
  }
}

/* ═══════════════════════════════════════════════════════════════
   NOTEBOOK EXPORT
   ═══════════════════════════════════════════════════════════════ */

async function exportToNotebook(tiles: TileDefinition[], presetLabel: string) {
  const sections = tiles.map((t) => ({
    id: crypto.randomUUID ? crypto.randomUUID() : `${Date.now()}-${Math.random()}`,
    type: 'dql' as const,
    title: t.title,
    state: {
      input: { value: t.dql, timeframe: { from: 'now()-2h', to: 'now()' } },
      visualization: t.vizType === 'timeseries' ? 'lineChart'
        : t.vizType === 'categoricalBar' ? 'barChart'
        : t.vizType === 'pie' || t.vizType === 'donut' ? 'pieChart'
        : t.vizType === 'gauge' || t.vizType === 'meterBar' ? 'gauge'
        : t.vizType === 'honeycomb' ? 'honeycomb' : 'table',
      davis: { includeLogs: false, dapiQuery: '' },
    },
  }));
  try {
    const res = await functions.call('proxy-api', {
      data: {
        action: 'create-notebook',
        body: { name: `Forge — ${presetLabel} — ${new Date().toISOString().slice(0, 16)}`, content: JSON.stringify({ version: '1', defaultTimeframe: { from: 'now()-2h', to: 'now()' }, sections }) },
      },
    });
    const result = (await res.json()) as any;
    return result.success ? { success: true, id: result.id } : { success: false, error: result.error || 'Unknown' };
  } catch (err: any) {
    return { success: false, error: err.message };
  }
}

/* ═══════════════════════════════════════════════════════════════
   DROPDOWN HOOKS — server-side via proxy
   ═══════════════════════════════════════════════════════════════ */

function useCompanyValues() {
  const [values, setValues] = useState<string[]>([]);
  const [error, setError] = useState('');
  useEffect(() => {
    let cancelled = false;
    proxyDql(`fetch bizevents\n| summarize count = count(), by:{json.companyName}\n| fields json.companyName\n| dedup json.companyName`).then((result) => {
      if (cancelled) return;
      if (result.success && Array.isArray(result.records)) {
        setValues(result.records.map((r: any) => String(r['json.companyName'] ?? '')).filter(Boolean));
      } else { setError(result.error || 'Query failed'); }
    });
    return () => { cancelled = true; };
  }, []);
  return { values, error };
}

function useJourneyValues(companyName: string) {
  const [values, setValues] = useState<string[]>([]);
  const [error, setError] = useState('');
  useEffect(() => {
    let cancelled = false;
    const dql = companyName
      ? `fetch bizevents\n| filter matchesPhrase(json.companyName, "${companyName}")\n| summarize count = count(), by:{json.journeyType}\n| fields json.journeyType\n| dedup json.journeyType`
      : `fetch bizevents\n| summarize count = count(), by:{json.journeyType}\n| fields json.journeyType\n| dedup json.journeyType`;
    proxyDql(dql).then((result) => {
      if (cancelled) return;
      if (result.success && Array.isArray(result.records)) {
        setValues(result.records.map((r: any) => String(r['json.journeyType'] ?? '')).filter(Boolean));
      } else { setError(result.error || 'Query failed'); }
    });
    return () => { cancelled = true; };
  }, [companyName]);
  return { values, error };
}

function useServiceNames(companyName: string, journeyType: string) {
  const [values, setValues] = useState<string[]>([]);
  useEffect(() => {
    let cancelled = false;
    if (companyName) {
      // Get services from bizevents for this company
      let q = `fetch bizevents\n| filter matchesPhrase(json.companyName, "${companyName}")`;
      if (journeyType) q += `\n| filter matchesPhrase(json.journeyType, "${journeyType}")`;
      q += `\n| summarize count = count(), by:{json.serviceName}\n| sort count desc\n| fields json.serviceName\n| limit 50`;
      proxyDql(q, 50).then((result) => {
        if (cancelled) return;
        if (result.success && Array.isArray(result.records)) {
          setValues(result.records.map((r: any) => String(r['json.serviceName'] ?? '').toLowerCase()).filter(Boolean));
        }
      });
    } else {
      // No company selected — get all services from timeseries (already lowercase from DQL)
      proxyDql(`timeseries r = sum(dt.service.request.count), by:{dt.entity.service}\n| fieldsAdd Service = lower(entityName(dt.entity.service))\n| fields Service\n| sort Service asc\n| limit 100`, 100).then((result) => {
        if (cancelled) return;
        if (result.success && Array.isArray(result.records)) {
          setValues(result.records.map((r: any) => String(r['Service'] ?? '').toLowerCase()).filter(Boolean));
        }
      });
    }
    return () => { cancelled = true; };
  }, [companyName, journeyType]);
  return { values };
}

function useEventTypeValues(companyName: string) {
  const [values, setValues] = useState<string[]>([]);
  useEffect(() => {
    let cancelled = false;
    const dql = companyName
      ? `fetch bizevents\n| filter matchesPhrase(json.companyName, "${companyName}")\n| summarize count = count(), by:{event.type}\n| sort count desc\n| fields event.type\n| limit 50`
      : `fetch bizevents\n| summarize count = count(), by:{event.type}\n| sort count desc\n| fields event.type\n| limit 50`;
    proxyDql(dql, 50).then((result) => {
      if (cancelled) return;
      if (result.success && Array.isArray(result.records)) {
        setValues(result.records.map((r: any) => String(r['event.type'] ?? '')).filter(Boolean));
      }
    });
    return () => { cancelled = true; };
  }, [companyName]);
  return { values };
}

/* ═══════════════════════════════════════════════════════════════
   FIELD PROFILE BADGE — shows discovered fields
   ═══════════════════════════════════════════════════════════════ */

function FieldProfileBadge({ profile, discovering }: { profile: FieldProfile | null; discovering: boolean }) {
  const [expanded, setExpanded] = useState(false);

  if (discovering) {
    return (
      <div style={{
        margin: '0 24px 8px', padding: '8px 14px', borderRadius: 8,
        background: 'rgba(0,180,220,0.08)', border: '1px solid rgba(0,180,220,0.25)',
        color: '#00b4dc', fontSize: 11, display: 'flex', alignItems: 'center', gap: 8,
      }}>
        <span style={{ animation: 'spin 1s linear infinite', display: 'inline-block' }}>⟳</span>
        Discovering available fields…
      </div>
    );
  }

  if (!profile) return null;

  const numCount = profile.numericFields.size;
  const catCount = profile.categoricalFields.size;

  return (
    <div style={{
      margin: '0 24px 8px', padding: '8px 14px', borderRadius: 8,
      background: 'rgba(39,174,96,0.06)', border: '1px solid rgba(39,174,96,0.2)',
      fontSize: 11,
    }}>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        <span style={{ color: '#27ae60' }}>
          🔍 Discovered: <strong>{numCount}</strong> numeric · <strong>{catCount}</strong> categorical fields
        </span>
        <button onClick={() => setExpanded(!expanded)} style={{
          background: 'none', border: 'none', color: '#8899cc', fontSize: 10, cursor: 'pointer', padding: '2px 6px',
        }}>
          {expanded ? '▲ Hide' : '▼ Show fields'}
        </button>
      </div>
      {expanded && (
        <div style={{ marginTop: 8, display: 'flex', flexWrap: 'wrap', gap: 4 }}>
          {[...profile.numericFields].sort().map((f) => (
            <span key={f} style={{
              background: 'rgba(39,174,96,0.12)', border: '1px solid rgba(39,174,96,0.3)',
              borderRadius: 4, padding: '1px 6px', color: '#27ae60', fontSize: 10,
            }}>📊 {f}</span>
          ))}
          {[...profile.categoricalFields].sort().map((f) => (
            <span key={f} style={{
              background: 'rgba(52,152,219,0.12)', border: '1px solid rgba(52,152,219,0.3)',
              borderRadius: 4, padding: '1px 6px', color: '#3498db', fontSize: 10,
            }}>🏷️ {f}</span>
          ))}
        </div>
      )}
    </div>
  );
}

/* ═══════════════════════════════════════════════════════════════
   AI TILES HOOK — calls Ollama via proxy to generate DQL tiles
   ═══════════════════════════════════════════════════════════════ */

interface AiTilesState {
  tiles: TileDefinition[];
  loading: boolean;
  loadingMsg: string;
  error: string | null;
  meta: { model?: string; elapsed?: number; promptTokens?: number; completionTokens?: number } | null;
}

function useAiTiles() {
  const [state, setState] = useState<AiTilesState>({ tiles: [], loading: false, loadingMsg: '', error: null, meta: null });
  const [cacheKey, setCacheKey] = useState('');

  const generate = useCallback(async (
    profile: FieldProfile | null,
    preset: DashboardPreset,
    companyName: string,
    journeyType: string,
    timeframe: Timeframe,
    services: string[],
    settings?: AppSettings | null,
  ) => {
    if (!profile || (profile.numericFields.size === 0 && profile.categoricalFields.size === 0)) {
      setState({ tiles: [], loading: false, loadingMsg: '', error: 'No fields discovered yet — select a company and journey first', meta: null });
      return;
    }

    // Build cache key to avoid re-generating for same inputs
    const key = `${companyName}|${journeyType}|${preset}|${timeframe}`;
    if (key === cacheKey && state.tiles.length > 0) return; // Already generated

    setState({ tiles: [], loading: true, loadingMsg: 'Starting AI generation…', error: null, meta: null });

    // Convert Sets to arrays for the API
    const fields: { name: string; type: 'string' | 'numeric'; sampleValue?: string | number }[] = [];
    for (const f of profile.numericFields)     fields.push({ name: f, type: 'numeric' });
    for (const f of profile.categoricalFields) fields.push({ name: f, type: 'string' });

    const connSettings = {
      apiHost: settings?.apiHost || 'localhost',
      apiPort: settings?.apiPort || '8080',
      apiProtocol: settings?.apiProtocol || 'http',
    };

    try {
      // Step 1: Start the async job — returns immediately with a jobId
      const startRes = await functions.call('proxy-api', {
        data: {
          action: 'forge-ai-tiles' as const,
          ...connSettings,
          body: { fields, preset, companyName, journeyType, timeframe, services },
        },
      });
      const startData = (await startRes.json()) as any;

      if (!startData.success || !startData.jobId) {
        setState({ tiles: [], loading: false, loadingMsg: '', error: startData.error || 'Failed to start AI tile generation', meta: null });
        return;
      }

      const jobId = startData.jobId;

      // Step 2: Poll for completion (every 5s, up to 3 minutes)
      const maxPolls = 36;
      const pollInterval = 5000;
      for (let i = 0; i < maxPolls; i++) {
        await new Promise(r => setTimeout(r, pollInterval));

        try {
          const statusRes = await functions.call('proxy-api', {
            data: {
              action: 'forge-tiles-status' as const,
              ...connSettings,
              body: { jobId },
            },
          });
          const statusData = (await statusRes.json()) as any;

          if (statusData.status === 'complete' && Array.isArray(statusData.tiles)) {
            setCacheKey(key);
            setState({ tiles: statusData.tiles, loading: false, loadingMsg: '', error: null, meta: statusData.meta || null });
            return;
          }

          if (statusData.status === 'failed') {
            setState({ tiles: [], loading: false, loadingMsg: '', error: statusData.error || 'AI generation failed', meta: null });
            return;
          }

          // Still running — update loading message with elapsed time
          const elapsed = Math.round((statusData.elapsed || ((i + 1) * pollInterval)) / 1000);
          setState(prev => ({ ...prev, loadingMsg: `Ollama is thinking… (${elapsed}s)` }));
        } catch {
          // Transient poll error — retry next interval
        }
      }

      // Timeout after max polls
      setState({ tiles: [], loading: false, loadingMsg: '', error: 'AI tile generation timed out (180s). Try again.', meta: null });
    } catch (err: any) {
      setState({ tiles: [], loading: false, loadingMsg: '', error: err.message || 'AI tile generation failed', meta: null });
    }
  }, [cacheKey, state.tiles.length]);

  const clear = useCallback(() => {
    setState({ tiles: [], loading: false, loadingMsg: '', error: null, meta: null });
    setCacheKey('');
  }, []);

  return { ...state, generate, clear };
}

/* ═══════════════════════════════════════════════════════════════
   MAIN PAGE COMPONENT
   ═══════════════════════════════════════════════════════════════ */

export const ForgeDashboardsPage = () => {
  const [preset, setPreset] = useState<DashboardPreset>('developer');
  const [companyName, setCompanyName] = useState('');
  const [journeyType, setJourneyType] = useState('');
  const [serviceName, setServiceName] = useState('');
  const [eventType, setEventType] = useState('');
  const [timeframe, setTimeframe] = useState<Timeframe>('now()-2h');
  const [refreshKey, setRefreshKey] = useState(0);
  const [loading, setLoading] = useState(true);
  const [settings, setSettings] = useState<AppSettings | null>(null);
  const [nbStatus, setNbStatus] = useState<{ msg: string; ok: boolean } | null>(null);

  useEffect(() => {
    loadAppSettings().then(({ settings: s }) => { setSettings(s); setLoading(false); });
  }, []);

  const { values: companyValues, error: companyError } = useCompanyValues();
  const { values: journeyValues, error: journeyError } = useJourneyValues(companyName);
  const { values: serviceValues } = useServiceNames(companyName, journeyType);
  const { values: eventTypeValues } = useEventTypeValues(companyName);

  // Field discovery — runs when company/journey changes
  const { profile, discovering } = useFieldDiscovery(companyName, journeyType);

  // AI-generated tiles via Ollama
  const aiTiles = useAiTiles();

  // Build candidates then filter by discovered fields
  const tiles = useMemo(() => {
    const candidates = getCandidates(companyName, journeyType, preset, timeframe, serviceName, eventType, serviceValues);
    return filterTiles(candidates, profile);
  }, [companyName, journeyType, preset, profile, timeframe, serviceName, eventType, serviceValues]);

  // Count how many were filtered out
  const totalCandidates = useMemo(
    () => getCandidates(companyName, journeyType, preset, timeframe, serviceName, eventType, serviceValues).length,
    [companyName, journeyType, preset, timeframe, serviceName, eventType, serviceValues],
  );
  const filteredOut = totalCandidates - tiles.length;

  const handleRefresh = useCallback(() => { setRefreshKey((k) => k + 1); }, []);

  const handleExportNotebook = useCallback(async () => {
    setNbStatus(null);
    const result = await exportToNotebook(tiles, PRESET_META[preset].label);
    setNbStatus(result.success ? { msg: `Notebook created (${result.id})`, ok: true } : { msg: `Export failed: ${result.error}`, ok: false });
  }, [tiles, preset]);

  const handleAiInsights = useCallback(() => {
    aiTiles.generate(profile, preset, companyName, journeyType, timeframe, serviceValues, settings);
  }, [profile, preset, companyName, journeyType, timeframe, serviceValues, settings, aiTiles.generate]);

  if (loading) return <div style={{ padding: 40, color: '#8899cc', textAlign: 'center' }}>Loading settings…</div>;

  const meta = PRESET_META[preset];

  return (
    <div style={{ minHeight: '100vh', background: 'linear-gradient(180deg, #0e0e1a 0%, #14142a 100%)', padding: '0 0 40px 0' }}>

      {/* ── TOP BAR ── */}
      <div style={{
        display: 'flex', alignItems: 'center', justifyContent: 'space-between',
        padding: '14px 24px', background: 'rgba(20,20,40,0.85)',
        borderBottom: '1px solid rgba(100,120,200,0.2)',
      }}>
        <Link to="/" style={{ color: '#8899cc', fontSize: 12, textDecoration: 'none', display: 'flex', alignItems: 'center', gap: 6 }}>
          ← Back to Home
        </Link>
        <span style={{ color: '#e0e0ff', fontWeight: 700, fontSize: 16, display: 'flex', alignItems: 'center', gap: 8 }}>
          📊 Forge Dashboards
          <InfoButton
            align="left"
            title="📊 Forge Dashboards"
            description="Eight persona-based preset dashboards with live DQL-powered tiles, all filterable by company, journey, service, and timeframe."
            sections={[
              { label: '🔧 Developer', detail: '~28 tiles: RED metrics, latency p50/p90/p99, errors, traces, logs, endpoints' },
              { label: '⚙️ Operations', detail: '~26 tiles: host health, CPU/memory, processes, network, availability' },
              { label: '👔 Executive', detail: '~38 tiles: revenue, SLA, journey funnel, customer churn, IT impact' },
              { label: '🧠 Intelligence', detail: '~19 tiles: problems, root cause, anomalies, MTTD/MTTR' },
              { label: '🤖 GenAI', detail: '~20 tiles: LLM calls, tokens, model latency, embeddings, operation breakdown' },
              { label: '🔒 Security', detail: '~18 tiles: security events, attacks, categories, trends, affected entities' },
              { label: '📋 SRE', detail: '~22 tiles: availability, error budget, latency percentiles, HTTP status codes' },
              { label: '📝 Biz Events', detail: '~22 tiles: event volume, types, errors by service/journey/company, details' },
              { label: '🔄 Refresh', detail: 'Re-run all DQL queries with current filters' },
              { label: '📓 Export to Notebook', detail: 'Export all tiles as a Dynatrace Notebook with DQL sections' },
              { label: '✨ AI Insights', detail: 'Generate additional AI-powered analysis tiles using Ollama' },
            ]}
            footer="Filter dropdowns scope all tiles dynamically. Every tile runs a live DQL query."
            color="#a78bfa"
            width={340}
          />
        </span>
        <div style={{ display: 'flex', gap: 8 }}>
          <button onClick={handleRefresh} style={{
            background: 'linear-gradient(135deg, rgba(0,180,220,0.15), rgba(108,44,156,0.08))',
            border: '1.5px solid rgba(0,180,220,0.5)', borderRadius: 8, padding: '6px 16px',
            color: '#00b4dc', fontWeight: 600, fontSize: 12, cursor: 'pointer',
          }}>🔄 Refresh</button>
          <button onClick={handleExportNotebook} style={{
            background: 'linear-gradient(135deg, rgba(39,174,96,0.2), rgba(0,180,220,0.1))',
            border: '1.5px solid rgba(39,174,96,0.5)', borderRadius: 8, padding: '6px 16px',
            color: '#27ae60', fontWeight: 600, fontSize: 12, cursor: 'pointer',
          }}>📓 Export to Notebook</button>
          <button onClick={handleAiInsights} disabled={aiTiles.loading || discovering} style={{
            background: aiTiles.tiles.length > 0
              ? 'linear-gradient(135deg, rgba(167,139,250,0.25), rgba(108,44,156,0.15))'
              : 'linear-gradient(135deg, rgba(167,139,250,0.15), rgba(108,44,156,0.08))',
            border: `1.5px solid ${aiTiles.tiles.length > 0 ? 'rgba(167,139,250,0.7)' : 'rgba(167,139,250,0.5)'}`,
            borderRadius: 8, padding: '6px 16px',
            color: '#a78bfa', fontWeight: 600, fontSize: 12,
            cursor: aiTiles.loading || discovering ? 'wait' : 'pointer',
            opacity: aiTiles.loading || discovering ? 0.6 : 1,
          }}>{aiTiles.loading ? '⏳ Generating…' : '✨ AI Insights'}</button>
        </div>
      </div>

      {nbStatus && (
        <div style={{
          margin: '8px 24px 0', padding: '8px 14px', borderRadius: 8,
          background: nbStatus.ok ? 'rgba(39,174,96,0.12)' : 'rgba(231,76,60,0.12)',
          border: `1px solid ${nbStatus.ok ? 'rgba(39,174,96,0.4)' : 'rgba(231,76,60,0.4)'}`,
          color: nbStatus.ok ? '#27ae60' : '#e74c3c', fontSize: 12,
        }}>{nbStatus.msg}</div>
      )}

      {/* ── FILTERS ROW ── */}
      <div style={{ display: 'flex', flexWrap: 'wrap', gap: 12, padding: '16px 24px', alignItems: 'flex-end' }}>
        <div>
          <label style={{ color: companyError ? '#e74c3c' : '#8899cc', fontSize: 11, display: 'block', marginBottom: 4 }}>
            Company {companyError && `⚠ ${companyError}`}
          </label>
          <select value={companyName} onChange={(e) => { setCompanyName(e.target.value); setJourneyType(''); }} style={{
            background: 'rgba(30,30,50,0.8)', border: `1px solid ${companyError ? 'rgba(231,76,60,0.5)' : 'rgba(100,120,200,0.3)'}`,
            borderRadius: 6, color: '#e0e0ff', padding: '6px 12px', fontSize: 12, minWidth: 180,
          }}>
            <option value="">All Companies</option>
            {companyValues.map((v) => <option key={v} value={v}>{v}</option>)}
          </select>
        </div>
        <div>
          <label style={{ color: journeyError ? '#e74c3c' : '#8899cc', fontSize: 11, display: 'block', marginBottom: 4 }}>
            Journey Type {journeyError && `⚠ ${journeyError}`}
          </label>
          <select value={journeyType} onChange={(e) => setJourneyType(e.target.value)} style={{
            background: 'rgba(30,30,50,0.8)', border: '1px solid rgba(100,120,200,0.3)',
            borderRadius: 6, color: '#e0e0ff', padding: '6px 12px', fontSize: 12, minWidth: 220,
          }}>
            <option value="">All Journeys</option>
            {journeyValues.map((v) => <option key={v} value={v}>{v}</option>)}
          </select>
        </div>
        <div>
          <label style={{ color: '#e67e22', fontSize: 11, display: 'block', marginBottom: 4 }}>Service Name</label>
          <select value={serviceName} onChange={(e) => setServiceName(e.target.value)} style={{
            background: 'rgba(30,30,50,0.8)', border: '1px solid rgba(230,126,34,0.3)',
            borderRadius: 6, color: '#e0e0ff', padding: '6px 12px', fontSize: 12, minWidth: 200,
          }}>
            <option value="">All Services</option>
            {serviceValues.map((v) => <option key={v} value={v}>{v}</option>)}
          </select>
        </div>
        <div>
          <label style={{ color: '#1abc9c', fontSize: 11, display: 'block', marginBottom: 4 }}>Event Type</label>
          <select value={eventType} onChange={(e) => setEventType(e.target.value)} style={{
            background: 'rgba(30,30,50,0.8)', border: '1px solid rgba(26,188,156,0.3)',
            borderRadius: 6, color: '#e0e0ff', padding: '6px 12px', fontSize: 12, minWidth: 200,
          }}>
            <option value="">All Event Types</option>
            {eventTypeValues.map((v) => <option key={v} value={v}>{v}</option>)}
          </select>
        </div>
        <div>
          <label style={{ color: '#8899cc', fontSize: 11, display: 'block', marginBottom: 4 }}>Timeframe</label>
          <select value={timeframe} onChange={(e) => setTimeframe(e.target.value as Timeframe)} style={{
            background: 'rgba(30,30,50,0.8)', border: '1px solid rgba(100,120,200,0.3)',
            borderRadius: 6, color: '#e0e0ff', padding: '6px 12px', fontSize: 12, minWidth: 120,
          }}>
            {TIMEFRAME_OPTIONS.map((opt) => <option key={opt.value} value={opt.value}>{opt.label}</option>)}
          </select>
        </div>
      </div>

      {/* ── FIELD DISCOVERY STATUS ── */}
      <FieldProfileBadge profile={profile} discovering={discovering} />

      {/* ── DASHBOARD PRESET TABS ── */}
      <div style={{ padding: '0 24px 12px', display: 'flex', flexWrap: 'wrap', gap: 6 }}>
        {(Object.keys(PRESET_META) as DashboardPreset[]).map((p) => {
          const m = PRESET_META[p];
          const active = preset === p;
          return (
            <button key={p} onClick={() => { setPreset(p); aiTiles.clear(); }} title={m.desc} style={{
              background: active ? `linear-gradient(135deg, ${m.color}33, ${m.color}11)` : 'rgba(30,30,50,0.5)',
              border: `1.5px solid ${active ? m.color + '88' : 'rgba(100,120,200,0.2)'}`,
              borderRadius: 8, padding: '7px 14px',
              color: active ? m.color : '#667', fontWeight: active ? 700 : 400,
              fontSize: 12, cursor: 'pointer', transition: 'all 0.2s ease',
            }}>
              {m.icon} {m.label}
            </button>
          );
        })}
      </div>

      {/* ── PRESET BANNER ── */}
      <div style={{
        margin: '0 24px 16px', padding: '12px 18px', borderRadius: 10,
        background: `linear-gradient(135deg, ${meta.color}18, ${meta.color}08)`,
        border: `1px solid ${meta.color}44`,
        display: 'flex', alignItems: 'center', gap: 10,
      }}>
        <span style={{ fontSize: 22 }}>{meta.icon}</span>
        <div>
          <span style={{ color: meta.color, fontWeight: 700, fontSize: 14 }}>{meta.label} Dashboard</span>
          <span style={{ color: '#8899cc', fontSize: 11, marginLeft: 12 }}>
            {tiles.length} tiles{filteredOut > 0 && ` (${filteredOut} hidden — no data)`}
            {companyName && ` · ${companyName}`}{journeyType && ` · ${journeyType}`}{serviceName && ` · ${serviceName}`}{eventType && ` · ${eventType}`}
          </span>
          <div style={{ color: '#667', fontSize: 10, marginTop: 2 }}>{meta.desc}</div>
        </div>
      </div>

      {/* ── TILE GRID ── */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 14, padding: '0 24px' }}>
        {tiles.map((tile) => (
          tile.vizType === 'sectionBanner'
            ? <SectionBanner key={`${preset}-${tile.id}-${refreshKey}`} tile={tile} />
            : <DqlTile key={`${preset}-${tile.id}-${companyName}-${journeyType}-${serviceName}-${eventType}-${timeframe}-${refreshKey}`} tile={tile} timeframe={timeframe} />
        ))}
      </div>

      {/* ── AI INSIGHTS SECTION ── */}
      {(aiTiles.loading || aiTiles.tiles.length > 0 || aiTiles.error) && (
        <div style={{ marginTop: 20 }}>
          {/* AI Section Banner */}
          <div style={{
            margin: '0 24px 14px', padding: '10px 18px', borderRadius: 10,
            background: 'linear-gradient(135deg, rgba(167,139,250,0.12), rgba(108,44,156,0.06))',
            border: '1px solid rgba(167,139,250,0.35)',
            display: 'flex', alignItems: 'center', justifyContent: 'space-between',
          }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
              <span style={{ fontSize: 20 }}>✨</span>
              <div>
                <span style={{ color: '#a78bfa', fontWeight: 700, fontSize: 14 }}>AI-Generated Insights</span>
                <span style={{ color: '#8899cc', fontSize: 11, marginLeft: 10 }}>
                  {aiTiles.loading ? 'Ollama is analyzing your data…' :
                   aiTiles.tiles.length > 0 ? `${aiTiles.tiles.length} tiles generated` :
                   aiTiles.error ? 'Generation failed' : ''}
                </span>
                {aiTiles.meta && (
                  <div style={{ color: '#667', fontSize: 10, marginTop: 2 }}>
                    {aiTiles.meta.model} · {aiTiles.meta.elapsed}ms · {aiTiles.meta.promptTokens}+{aiTiles.meta.completionTokens} tokens
                  </div>
                )}
              </div>
            </div>
            {aiTiles.tiles.length > 0 && (
              <button onClick={aiTiles.clear} style={{
                background: 'none', border: '1px solid rgba(231,76,60,0.3)', borderRadius: 6,
                color: '#e74c3c', fontSize: 10, padding: '3px 10px', cursor: 'pointer',
              }}>✕ Clear</button>
            )}
          </div>

          {/* AI Loading Indicator */}
          {aiTiles.loading && (
            <div style={{
              margin: '0 24px', padding: '20px', borderRadius: 10, textAlign: 'center',
              background: 'rgba(167,139,250,0.05)', border: '1px solid rgba(167,139,250,0.15)',
              color: '#a78bfa', fontSize: 13,
            }}>
              <div style={{ fontSize: 28, marginBottom: 12, animation: 'spin 2s linear infinite', display: 'inline-block' }}>🤖</div>
              <div>{aiTiles.loadingMsg || 'Ollama is analyzing your discovered fields and generating custom DQL tiles…'}</div>
              <div style={{ color: '#667', fontSize: 11, marginTop: 6 }}>This typically takes 60-120 seconds via EdgeConnect</div>
            </div>
          )}

          {/* AI Error */}
          {aiTiles.error && !aiTiles.loading && (
            <div style={{
              margin: '0 24px', padding: '12px 18px', borderRadius: 8,
              background: 'rgba(231,76,60,0.08)', border: '1px solid rgba(231,76,60,0.3)',
              color: '#e74c3c', fontSize: 12,
            }}>⚠️ {aiTiles.error}</div>
          )}

          {/* AI Tiles Grid */}
          {aiTiles.tiles.length > 0 && (
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 14, padding: '0 24px' }}>
              {aiTiles.tiles.map((tile) => (
                tile.vizType === 'sectionBanner'
                  ? <SectionBanner key={`ai-${tile.id}-${refreshKey}`} tile={tile} />
                  : <DqlTile key={`ai-${tile.id}-${companyName}-${journeyType}-${timeframe}-${refreshKey}`} tile={tile} timeframe={timeframe} />
              ))}
            </div>
          )}
        </div>
      )}

      {tiles.length === 0 && aiTiles.tiles.length === 0 && (
        <div style={{
          margin: '40px 24px', padding: '24px', borderRadius: 10, textAlign: 'center',
          background: 'rgba(30,30,50,0.4)', border: '1px solid rgba(100,120,200,0.15)',
          color: '#667', fontSize: 13,
        }}>
          No tiles available for this preset — the selected company/journey doesn't have the required fields.
          Try selecting a different company or switching to another dashboard preset.
        </div>
      )}

      {/* ── FOOTER ── */}
      <div style={{
        margin: '24px 24px 0', padding: '12px 18px', borderRadius: 8,
        background: 'rgba(30,30,50,0.4)', border: '1px solid rgba(100,120,200,0.15)',
        color: '#667', fontSize: 11, textAlign: 'center',
      }}>
        Forge Dashboards — 7 vertical dashboards · People · Time · Money · Powered by Strato & DQL
      </div>
    </div>
  );
};
