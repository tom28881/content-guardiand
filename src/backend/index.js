import { asUser, assumeTrustedRoute } from '@forge/api';
import { registerResolvers } from './resolvers';
import { scheduledScan } from './services/scheduler';

// Minimal inlined Resolver to avoid bundling/import interop issues
const isRequestPayload = (request) => {
  return (
    typeof request?.payload === 'object' &&
    request?.payload?.product &&
    request?.payload?.fetchUrl
  );
};

const defaultFunctions = {
  __request: async (request) => {
    if (!isRequestPayload(request)) {
      throw new Error('Invalid payload specified for request');
    }
    const { payload } = request;
    const productApis = {
      jira: asUser().requestJira,
      confluence: asUser().requestConfluence,
    };
    const response = await productApis[payload.product](
      assumeTrustedRoute(payload.fetchUrl),
      payload.fetchOptions
    );
    let body = await response.text();
    try {
      body = JSON.parse(body);
    } catch (e) {}
    return { ...response, body };
  },
};

function createResolver() {
  const functions = { ...defaultFunctions };

  function define(functionKey, cb) {
    if (!cb || typeof cb !== 'function') {
      throw new Error(
        `Resolver definition '${functionKey}' callback must be a 'function'. Received '${typeof cb}'.`
      );
    }
    if (functionKey in functions) {
      throw new Error(`Resolver definition '${functionKey}' already exists.`);
    }
    functions[functionKey] = cb;
    return api; // enable chaining
  }

  function getFunction(functionKey) {
    if (functionKey in functions) {
      return functions[functionKey];
    }
    throw new Error(`Resolver has no definition for '${functionKey}'.`);
  }

  function sanitizeObject(object) {
    return JSON.parse(JSON.stringify(object));
  }

  function getDefinitions() {
    const resolve = async (
      { call: { functionKey, payload: callPayload, jobId }, context },
      backendRuntimePayload
    ) => {
      const cb = getFunction(functionKey);
      const result = await cb({
        payload: callPayload || {},
        context: {
          ...context,
          installContext: backendRuntimePayload?.installContext,
          accountId: backendRuntimePayload?.principal?.accountId,
          license: backendRuntimePayload?.license,
          jobId: jobId,
          installation: backendRuntimePayload?.installation,
        },
      });
      if (typeof result === 'object') {
        return sanitizeObject(result);
      }
      return result;
    };
    return resolve;
  }

  const api = { define, getDefinitions };
  return api;
}

const resolver = createResolver();
// Register all resolvers from modular files in ./resolvers
registerResolvers(resolver);

// Intentionally left minimal; HTTP and date/storage utilities live in services/* and utils/* modules

 

 

 

 

 

 

 

 

 

 

 

// scheduledScan moved to services/scheduler

// Debug utilities moved to resolvers/debug

// runRealScan is implemented in services/scan

export const handler = resolver.getDefinitions();
export const scan = scheduledScan; // Export with name expected by manifest
