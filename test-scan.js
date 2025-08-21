// Test script to run scan directly and debug the issue
// This will bypass UI and call scan functions directly

import { storage } from '@forge/api';
import { runRealScan } from './src/backend/services/scan.js';
import { getPagesBatchV2WithRetry } from './src/backend/services/confluence.js';

async function testScanDirectly() {
  console.log('🔍 Testing scan directly...\n');
  
  try {
    // 1. Check scan lock status
    const lockKey = 'scan:lock';
    const lock = await storage.get(lockKey);
    console.log('📋 Scan lock status:', {
      hasLock: !!lock,
      lockTimestamp: lock?.timestamp,
      lockAge: lock ? Date.now() - lock.timestamp : 0,
      isBlocked: lock && Date.now() - lock.timestamp < 600000
    });
    
    // 2. Clear any old locks
    if (lock && Date.now() - lock.timestamp >= 600000) {
      console.log('🧹 Clearing old scan lock...');
      await storage.delete(lockKey);
    }
    
    // 3. Test API call directly
    console.log('\n🌐 Testing Confluence API directly...');
    const apiResp = await getPagesBatchV2WithRetry({ limit: 10 });
    console.log('API Response:', {
      ok: apiResp.ok,
      status: apiResp.status,
      resultCount: apiResp.body?.results?.length,
      hasNext: !!apiResp.body?._links?.next,
      nextLink: apiResp.body?._links?.next,
      totalSize: apiResp.body?.size,
      limit: apiResp.body?.limit,
      _links: Object.keys(apiResp.body?._links || {})
    });
    
    if (apiResp.body?.results?.length > 0) {
      console.log('First page:', {
        id: apiResp.body.results[0].id,
        title: apiResp.body.results[0].title,
        spaceId: apiResp.body.results[0].spaceId
      });
    }
    
    // 4. Test scan function directly
    console.log('\n🚀 Testing runRealScan directly...');
    const scanResult = await runRealScan();
    console.log('Scan Result:', scanResult);
    
  } catch (error) {
    console.error('❌ Test failed:', error);
    console.error('Stack:', error.stack);
  }
}

// Export for use in Forge environment
export { testScanDirectly };
