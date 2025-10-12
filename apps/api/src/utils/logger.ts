import pino from 'pino';
// Use a minimal, typed-compatible pino configuration. For pretty-printing in dev you can
// add pino-pretty as a transport if desired.
export const logger = pino({ level: process.env.LOG_LEVEL || 'info' });
