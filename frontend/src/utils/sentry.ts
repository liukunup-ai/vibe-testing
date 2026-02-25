import * as Sentry from '@sentry/react';

let initialized = false;

export function initSentry(dsn: string | undefined) {
  if (initialized || !dsn) {
    return;
  }
  
  initialized = true;
  
  Sentry.init({
    dsn,
    integrations: [
      Sentry.browserTracingIntegration(),
      Sentry.replayIntegration(),
    ],
    tracesSampleRate: 0.1,
    replaysSessionSampleRate: 0.1,
    replaysOnErrorSampleRate: 1.0,
  });
}

export { Sentry };
