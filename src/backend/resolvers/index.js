import { registerSettingsResolvers } from './settings';
import { registerScanResolvers } from './scan';
import { registerDetectedResolvers } from './detected';
import { registerAuditResolvers } from './audit';
import { registerBulkResolvers } from './bulk';
import { registerDashboardResolvers } from './dashboard';
import { registerMaintenanceResolvers } from './maintenance';
import { registerDebugResolvers } from './debug';

export function registerResolvers(resolver) {
  // Basic health check
  resolver.define('ping', async () => ({
    ok: true,
    name: 'Content Guardian',
    timestamp: new Date().toISOString(),
  }));

  registerSettingsResolvers(resolver);
  registerScanResolvers(resolver);
  registerDetectedResolvers(resolver);
  registerAuditResolvers(resolver);
  registerBulkResolvers(resolver);
  registerDashboardResolvers(resolver);
  registerMaintenanceResolvers(resolver);
  registerDebugResolvers(resolver);
}
