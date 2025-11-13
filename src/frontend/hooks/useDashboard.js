import React from 'react';
import { invoke } from '@forge/bridge';
import { friendlyError } from '../utils/friendlyError';

export const useDashboard = () => {
  const [data, setData] = React.useState(null);
  const [loading, setLoading] = React.useState(false);
  const [message, setMessage] = React.useState(null);

  const refresh = React.useCallback(async () => {
    setLoading(true);
    try {
      const res = await invoke('getDashboard', {});
      if (res?.ok) {
        setData(res);
        setMessage(null);
      } else {
        setData(null);
        setMessage({ appearance: 'error', text: friendlyError(res?.error || 'Failed to load dashboard') });
      }
    } catch (e) {
      console.error('getDashboard error', e);
      setData(null);
      setMessage({ appearance: 'error', text: friendlyError(e) });
    } finally {
      setLoading(false);
    }
  }, []);

  React.useEffect(() => {
    refresh();
  }, [refresh]);

  const startScan = async () => {
    setLoading(true);
    setMessage(null);
    try {
      const res = await invoke('startScan', { mode: 'real' });
      if (res?.ok) {
        const created = typeof res.detected === 'number' ? res.detected : res.created;
        const successMessage = { appearance: 'success', text: `Scan created ${created} items. Total: ${res.total}` };
        await refresh();
        setMessage(successMessage);
      } else {
        const error = res?.error;
        setMessage({
          appearance: 'error',
          text: /rate limited/i.test(error?.message || '')
            ? 'Request rate limited – please try again in a few seconds'
            : friendlyError(error)
        });
      }
    } catch (e) {
      setMessage({ appearance: 'error', text: String(e) });
    } finally {
      setLoading(false);
    }
  };

  const debugScan = async () => {
    setLoading(true);
    setMessage(null);
    try {
      const res = await invoke('debugScan', {});
      if (res?.ok) {
        setMessage({ appearance: 'success', text: 'Debug scan completed - check browser console and Forge logs' });
      } else {
        setMessage({ appearance: 'error', text: `Debug scan failed: ${res?.error}` });
      }
    } catch (e) {
      setMessage({ appearance: 'error', text: `Debug scan error: ${String(e)}` });
    } finally {
      setLoading(false);
    }
  };

  return {
    data,
    loading,
    message,
    refresh,
    startScan,
    debugScan,
  };
};
