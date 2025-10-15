import pino from 'pino';
import { logging } from '../config/env.js';

// Use a minimal, typed-compatible pino configuration. For pretty-printing in dev you can
// add pino-pretty as a transport if desired.
export const logger = pino({ level: logging.level });
