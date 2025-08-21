import React from 'react';
import { Text, Box, Stack, Inline, Textfield, Checkbox, Button, SectionMessage, Heading } from '@forge/react';
import { invoke } from '@forge/bridge';
import PageHeader from '../components/common/PageHeader';

const Settings = () => {
  const [settings, setSettings] = React.useState(null);
  const [loading, setLoading] = React.useState(false);
  const [message, setMessage] = React.useState(null);

  const load = React.useCallback(async () => {
    setLoading(true);
    setMessage(null);
    try {
      const res = await invoke('getSettings', {});
      if (res?.ok) setSettings(res.settings);
    } catch (e) {
      setMessage({ appearance: 'error', text: String(e) });
    } finally {
      setLoading(false);
    }
  }, []);

  React.useEffect(() => {
    load();
  }, [load]);

  const save = async () => {
    setLoading(true);
    setMessage(null);
    try {
      const res = await invoke('saveSettings', { settings });
      if (res?.ok) setMessage({ appearance: 'success', text: 'Settings saved' });
      else setMessage({ appearance: 'error', text: res?.error || 'Save failed' });
    } catch (e) {
      setMessage({ appearance: 'error', text: String(e) });
    } finally {
      setLoading(false);
    }
  };

  const update = (path, value) => {
    setSettings((prev) => {
      const next = { ...(prev || {}) };
      const segs = path.split('.');
      let cur = next;
      for (let i = 0; i < segs.length - 1; i++) {
        const k = segs[i];
        cur[k] = cur[k] || {};
        cur = cur[k];
      }
      cur[segs[segs.length - 1]] = value;
      return next;
    });
  };

  const listToString = (arr) => (arr || []).join(',');
  const stringToList = (s) =>
    String(s || '')
      .split(',')
      .map((x) => x.trim())
      .filter(Boolean);

  if (!settings) {
    return (
      <Box>
        <PageHeader title="Settings" />
        <Text>{loading ? 'Loading…' : 'No settings yet.'}</Text>
      </Box>
    );
  }

  return (
    <Box>
      <PageHeader title="Settings" actions={(
        <Inline space="space.300" alignBlock="center">
          <Button onClick={load} isLoading={loading}>Reload</Button>
          <Button appearance="primary" onClick={save} isLoading={loading}>Save</Button>
        </Inline>
      )} />
      {message && (
        <Box padding="space.200">
          <SectionMessage appearance={message.appearance}>{message.text}</SectionMessage>
        </Box>
      )}
      <Box paddingTop="space.300">
        <Stack space="space.300">
          <Heading level="h500">Rules</Heading>
          <Inline space="space.300">
            <Textfield
              name="ageDays"
              label="Max age (days)"
              value={String(settings.rules?.ageDays ?? '')}
              onChange={(e) => update('rules.ageDays', Number(e?.target?.value || 0))}
            />
            <Textfield
              name="inactivityDays"
              label="Max inactivity (days)"
              value={String(settings.rules?.inactivityDays ?? '')}
              onChange={(e) => update('rules.inactivityDays', Number(e?.target?.value || 0))}
            />
          </Inline>
          <Inline space="space.400">
            <Checkbox
              label="Include incomplete"
              isChecked={!!settings.rules?.includeIncomplete}
              onChange={(e) => update('rules.includeIncomplete', !!e?.target?.checked)}
            />
            <Checkbox
              label="Include orphaned"
              isChecked={!!settings.rules?.includeOrphaned}
              onChange={(e) => update('rules.includeOrphaned', !!e?.target?.checked)}
            />
          </Inline>

          <Heading level="h500">Scheduling</Heading>
          <Checkbox
            label="Enable daily scheduled scan"
            isChecked={(settings.schedule?.mode || 'manual') === 'auto'}
            onChange={(e) => update('schedule.mode', e?.target?.checked ? 'auto' : 'manual')}
          />

          <Heading level="h500">Whitelist</Heading>
          <Textfield
            name="spaceKeys"
            label="Space keys (comma separated)"
            value={listToString(settings.whitelist?.spaceKeys)}
            onChange={(e) => update('whitelist.spaceKeys', stringToList(e?.target?.value))}
          />
          <Textfield
            name="pageIds"
            label="Page IDs (comma separated)"
            value={listToString(settings.whitelist?.pageIds)}
            onChange={(e) => update('whitelist.pageIds', stringToList(e?.target?.value))}
          />
        </Stack>
      </Box>
    </Box>
  );
};

export default Settings;
