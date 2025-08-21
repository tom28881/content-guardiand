import { getDashboardData } from '../services/aggregations';

export function registerDashboardResolvers(resolver) {
  resolver.define('getDashboard', getDashboardData);
}
