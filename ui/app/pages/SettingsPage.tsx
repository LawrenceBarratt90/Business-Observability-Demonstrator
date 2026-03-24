import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { Page } from '@dynatrace/strato-components-preview/layouts';
import { Flex } from '@dynatrace/strato-components/layouts';
import { Heading, Paragraph, Strong } from '@dynatrace/strato-components/typography';
import { Button } from '@dynatrace/strato-components/buttons';
import { TextInput } from '@dynatrace/strato-components-preview/forms';
import { TitleBar } from '@dynatrace/strato-components-preview/layouts';
import Colors from '@dynatrace/strato-design-tokens/colors';
import { InfoButton } from '../components/InfoButton';
import { functions } from '@dynatrace-sdk/app-utils';
import { loadAppSettings, saveAppSettings, type AppSettings } from '../services/app-settings';

// localStorage fallback key (for when app-settings is unavailable)
const LOCAL_STORAGE_KEY = 'bizobs_api_settings';

const DEFAULT_SETTINGS: AppSettings = {
  apiHost: 'localhost',
  apiPort: '8080',
  apiProtocol: 'http',
  enableAutoGeneration: false,
};

export const SettingsPage = () => {
  const navigate = useNavigate();
  const [settings, setSettings] = useState<AppSettings>(() => {
    // Immediate render from localStorage while Document Service loads async
    try {
      const stored = localStorage.getItem(LOCAL_STORAGE_KEY);
      if (stored) {
        const p = JSON.parse(stored);
        return { ...DEFAULT_SETTINGS, ...p };
      }
    } catch { /* ignore */ }
    return DEFAULT_SETTINGS;
  });
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [isTesting, setIsTesting] = useState(false);
  const [statusMessage, setStatusMessage] = useState('');
  const [settingsSource, setSettingsSource] = useState<'document' | 'localStorage' | 'defaults'>('defaults');

  // Load settings from shared Document Service on mount
  const settingsLoadedRef = useRef(false);
  useEffect(() => {
    if (settingsLoadedRef.current) return;
    settingsLoadedRef.current = true;

    loadAppSettings().then(({ settings: loaded, source }) => {
      setSettingsSource(source);
      if (source === 'document' && loaded.apiHost !== 'localhost') {
        setSettings(loaded);
        setStatusMessage('✅ Settings loaded from shared app config');
      } else if (source === 'localStorage') {
        setSettings(loaded);
        setStatusMessage('💾 Settings loaded from local cache');
      } else {
        setStatusMessage('ℹ️ No saved settings found. Using defaults.');
      }
      setIsLoading(false);
    }).catch(() => {
      setStatusMessage('⚠️ Could not load settings — using local cache');
      setIsLoading(false);
    });
  }, []);

  const saveSettings = async () => {
    setIsSaving(true);
    setStatusMessage('💾 Saving to shared app config...');

    // Save to Document Service (also writes localStorage as fallback)
    const docSaved = await saveAppSettings(settings);

    if (docSaved) {
      setStatusMessage('✅ Settings saved to shared app config (all users will see these)');
    } else {
      setStatusMessage('⚠️ Saved locally only — shared document write failed');
    }

    // Auto-register host pattern with EdgeConnect
    const host = settings.apiHost.trim();
    if (host && host !== 'localhost' && host !== '127.0.0.1') {
      try {
        const ecRes = await functions.call('proxy-api', {
          data: {
            action: 'ec-update-patterns',
            apiHost: '', apiPort: '', apiProtocol: '',
            body: { hostPatterns: [host] },
          },
        });
        const ecResult = await ecRes.json() as any;
        if (ecResult.success && ecResult.data?.added?.length > 0) {
          setStatusMessage(prev => `${prev}\n🔌 Auto-registered ${host} as EdgeConnect host pattern`);
        }
      } catch {
        // Non-fatal
      }
    }

    setTimeout(() => navigate('/'), 800);
    setIsSaving(false);
  };

  const testConnection = async () => {
    setIsTesting(true);
    setStatusMessage('🔄 Testing connection via server-side proxy...');

    try {
      const proxyResponse = await functions.call('proxy-api', {
        data: {
          action: 'test-connection',
          apiHost: settings.apiHost,
          apiPort: settings.apiPort,
          apiProtocol: settings.apiProtocol,
        },
      });

      const result = await proxyResponse.json() as any;

      if (result.success) {
        setStatusMessage(`✅ ${result.message}`);
      } else {
        setStatusMessage(`❌ ${result.error}${result.details ? '\n' + result.details : ''}`);
      }
    } catch (error: any) {
      setStatusMessage(`❌ Connection test failed: ${error.message}`);
    }
    setIsTesting(false);
  };

  const resetToDefaults = () => {
    setSettings(DEFAULT_SETTINGS);
    setStatusMessage('🔄 Reset to defaults. Click Save to persist.');
  };

  if (isLoading) {
    return (
      <Page>
        <Page.Header>
          <TitleBar>
            <TitleBar.Title>⚙️ Settings</TitleBar.Title>
            <TitleBar.Subtitle>Loading configuration...</TitleBar.Subtitle>
          </TitleBar>
        </Page.Header>
        <Page.Main>
          <Flex justifyContent="center" style={{ padding: 48 }}>
            <div style={{ fontSize: 48 }}>⏳</div>
          </Flex>
        </Page.Main>
      </Page>
    );
  }

  return (
    <Page>
      <Page.Header>
        <TitleBar>
          <TitleBar.Title>
            <Flex alignItems="center" gap={8}>
              ⚙️ Settings
              <InfoButton
                title="⚙️ Settings"
                description="Configure the connection between this AppEngine app and your BizObs backend server."
                sections={[
                  { label: 'Protocol', detail: 'Choose HTTP or HTTPS for the API connection' },
                  { label: 'Host / IP', detail: 'Enter the IP address or hostname of your BizObs server' },
                  { label: 'Port', detail: 'The port your server listens on (default: 8080)' },
                  { label: '🧪 Test Connection', detail: 'Verify the server is reachable before saving' },
                  { label: '💾 Save Settings', detail: 'Persist settings via Dynatrace Document Service (shared across all users)' },
                  { label: '🔄 Reset to Defaults', detail: 'Revert to localhost:8080 defaults' },
                ]}
                footer="Settings are stored in Dynatrace Document Service (cloud) with localStorage fallback."
              />
            </Flex>
          </TitleBar.Title>
          <TitleBar.Subtitle>Configure your BizObs Generator API connection</TitleBar.Subtitle>
        </TitleBar>
      </Page.Header>

      <Page.Main>
        <div style={{ maxWidth: 800, margin: '0 auto', padding: 32 }}>
          {/* Status Banner */}
          {statusMessage && (
            <div style={{
              padding: 16,
              marginBottom: 24,
              borderRadius: 12,
              background: statusMessage.includes('✅')
                ? 'rgba(115, 190, 40, 0.12)'
                : statusMessage.includes('❌')
                ? 'rgba(220, 50, 47, 0.12)'
                : statusMessage.includes('⚠️')
                ? 'rgba(255, 210, 63, 0.12)'
                : 'rgba(0, 161, 201, 0.12)',
              border: `1px solid ${
                statusMessage.includes('✅')
                  ? Colors.Theme.Success['70']
                  : statusMessage.includes('❌')
                  ? '#dc322f'
                  : statusMessage.includes('⚠️')
                  ? 'rgba(255, 210, 63, 0.8)'
                  : Colors.Theme.Primary['70']
              }`,
              fontSize: 14,
              fontFamily: 'monospace',
            }}>
              {statusMessage}
            </div>
          )}

          {/* Storage Info Badge */}
          <div style={{
            display: 'inline-flex',
            alignItems: 'center',
            gap: 8,
            padding: '6px 14px',
            borderRadius: 20,
            background: settingsSource === 'document'
              ? 'rgba(115, 190, 40, 0.15)'
              : 'rgba(255, 210, 63, 0.15)',
            border: `1px solid ${settingsSource === 'document' ? Colors.Theme.Success['70'] : 'rgba(255, 210, 63, 0.6)'}`,
            fontSize: 12,
            marginBottom: 24,
          }}>
            <span>{settingsSource === 'document' ? '☁️' : '💾'}</span>
            <span>{settingsSource === 'document' ? 'Shared App Config (all users)' : 'Local Storage'}</span>
          </div>

          {/* API Connection Settings Card */}
          <div style={{
            background: Colors.Background.Surface.Default,
            borderRadius: 16,
            border: `2px solid ${Colors.Border.Neutral.Default}`,
            overflow: 'hidden',
            marginBottom: 24,
          }}>
            <div style={{
              padding: '20px 24px',
              background: `linear-gradient(135deg, ${Colors.Theme.Primary['70']}, rgba(108, 44, 156, 0.9))`,
              color: 'white',
            }}>
              <Flex alignItems="center" gap={12}>
                <div style={{ fontSize: 28 }}>🔌</div>
                <div>
                  <Heading level={4} style={{ marginBottom: 0, color: 'white' }}>API Connection</Heading>
                  <Paragraph style={{ fontSize: 12, marginBottom: 0, color: 'rgba(255,255,255,0.8)', marginTop: 4 }}>
                    Connect to your BizObs Generator Node.js service
                  </Paragraph>
                </div>
              </Flex>
            </div>

            <div style={{ padding: 24 }}>
              {/* Protocol */}
              <div style={{ marginBottom: 20 }}>
                <label style={{ display: 'block', fontSize: 13, fontWeight: 600, marginBottom: 8 }}>
                  Protocol
                </label>
                <Flex gap={8}>
                  <Button
                    variant={settings.apiProtocol === 'http' ? 'emphasized' : 'default'}
                    onClick={() => setSettings(prev => ({ ...prev, apiProtocol: 'http' }))}
                    style={{ flex: 1 }}
                  >
                    HTTP
                  </Button>
                  <Button
                    variant={settings.apiProtocol === 'https' ? 'emphasized' : 'default'}
                    onClick={() => setSettings(prev => ({ ...prev, apiProtocol: 'https' }))}
                    style={{ flex: 1 }}
                  >
                    HTTPS
                  </Button>
                </Flex>
              </div>

              {/* Host */}
              <div style={{ marginBottom: 20 }}>
                <label style={{ display: 'block', fontSize: 13, fontWeight: 600, marginBottom: 8 }}>
                  Host / IP Address
                </label>
                <TextInput
                  value={settings.apiHost}
                  onChange={(value: string) => setSettings(prev => ({ ...prev, apiHost: value }))}
                  placeholder="localhost or IP address"
                />
                <Paragraph style={{ fontSize: 11, marginTop: 6, marginBottom: 0, opacity: 0.7 }}>
                  e.g. <code style={{ background: 'rgba(0,0,0,0.1)', padding: '2px 6px', borderRadius: 4 }}>localhost</code>,{' '}
                  <code style={{ background: 'rgba(0,0,0,0.1)', padding: '2px 6px', borderRadius: 4 }}>YOUR_SERVER_IP</code>,{' '}
                  <code style={{ background: 'rgba(0,0,0,0.1)', padding: '2px 6px', borderRadius: 4 }}>my-server.example.com</code>
                </Paragraph>
              </div>

              {/* Port */}
              <div style={{ marginBottom: 20 }}>
                <label style={{ display: 'block', fontSize: 13, fontWeight: 600, marginBottom: 8 }}>
                  Port
                </label>
                <TextInput
                  value={settings.apiPort}
                  onChange={(value: string) => setSettings(prev => ({ ...prev, apiPort: value }))}
                  placeholder="8080"
                />
                <Paragraph style={{ fontSize: 11, marginTop: 6, marginBottom: 0, opacity: 0.7 }}>
                  Default BizObs Generator port is <strong>8080</strong>
                </Paragraph>
              </div>

              {/* Full URL Preview */}
              <div style={{
                padding: 16,
                background: 'rgba(0, 161, 201, 0.08)',
                border: `1px solid ${Colors.Theme.Primary['70']}`,
                borderRadius: 8,
                marginBottom: 20,
              }}>
                <Strong style={{ fontSize: 12, marginBottom: 6, display: 'block' }}>Full API URL:</Strong>
                <code style={{
                  display: 'block',
                  fontSize: 12,
                  fontFamily: 'monospace',
                  wordBreak: 'break-all',
                  padding: 8,
                  background: 'rgba(0,0,0,0.06)',
                  borderRadius: 4,
                }}>
                  {settings.apiProtocol}://{settings.apiHost}:{settings.apiPort}/api/journey-simulation/simulate-journey
                </code>
              </div>

              {/* Auto Generation Toggle */}
              <div style={{
                padding: 16,
                background: Colors.Background.Base.Default,
                borderRadius: 8,
                border: `1px solid ${Colors.Border.Neutral.Default}`,
              }}>
                <Flex alignItems="center" justifyContent="space-between">
                  <div>
                    <Strong style={{ fontSize: 13 }}>Auto Generate Services</Strong>
                    <Paragraph style={{ fontSize: 12, marginBottom: 0, marginTop: 2, opacity: 0.7 }}>
                      Automatically create services after validating JSON response
                    </Paragraph>
                  </div>
                  <Button
                    variant={settings.enableAutoGeneration ? 'emphasized' : 'default'}
                    onClick={() => setSettings(prev => ({
                      ...prev,
                      enableAutoGeneration: !prev.enableAutoGeneration,
                    }))}
                    style={{
                      minWidth: 80,
                      background: settings.enableAutoGeneration ? Colors.Theme.Success['70'] : undefined,
                    }}
                  >
                    {settings.enableAutoGeneration ? '✅ ON' : '❌ OFF'}
                  </Button>
                </Flex>
              </div>
            </div>
          </div>

          {/* Actions */}
          <Flex gap={12} style={{ marginBottom: 24 }}>
            <Button
              variant="emphasized"
              onClick={saveSettings}
              disabled={isSaving}
              style={{ flex: 2, padding: '14px', fontSize: 14, fontWeight: 600 }}
            >
              {isSaving ? '💾 Saving...' : '💾 Save Settings'}
            </Button>
            <Button
              onClick={testConnection}
              disabled={isTesting}
              style={{ flex: 1, padding: '14px', fontSize: 14 }}
            >
              {isTesting ? '🔄 Testing...' : '🔌 Test Connection'}
            </Button>
            <Button
              onClick={resetToDefaults}
              style={{ padding: '14px', fontSize: 14 }}
            >
              🔄 Reset
            </Button>
            <Button
              onClick={() => navigate('/')}
              style={{ padding: '14px', fontSize: 14 }}
            >
              ← Back
            </Button>
          </Flex>

          {/* How It Works Info */}
          <div style={{
            background: 'linear-gradient(135deg, rgba(255, 210, 63, 0.12), rgba(255, 210, 63, 0.04))',
            borderRadius: 12,
            border: '1px solid rgba(255, 210, 63, 0.5)',
            padding: 24,
          }}>
            <Flex alignItems="flex-start" gap={12}>
              <div style={{ fontSize: 24 }}>💡</div>
              <div style={{ flex: 1 }}>
                <Strong style={{ fontSize: 14, marginBottom: 8, display: 'block' }}>How It Works</Strong>
                <Paragraph style={{ fontSize: 13, lineHeight: 1.7, marginBottom: 12 }}>
                  These settings configure the connection between this Dynatrace app and your BizObs Generator Node.js service running on your host.
                </Paragraph>
                <Paragraph style={{ fontSize: 13, lineHeight: 1.7, marginBottom: 12 }}>
                  <Strong>Step 1:</Strong> Ensure BizObs Generator is running on your target host<br />
                  <Strong>Step 2:</Strong> Enter the host, port, and protocol here<br />
                  <Strong>Step 3:</Strong> Click "Test Connection" to verify<br />
                  <Strong>Step 4:</Strong> Save — settings persist in the Dynatrace tenant
                </Paragraph>
                <Paragraph style={{ fontSize: 13, lineHeight: 1.7, marginBottom: 0 }}>
                  When you click "🚀 Generate Services" on the main page, the app will call your BizObs Generator API at the configured URL to create live services.
                </Paragraph>
              </div>
            </Flex>
          </div>
        </div>
      </Page.Main>
    </Page>
  );
};
