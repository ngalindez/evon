/**
 * Minimal structured logger.
 *
 * Plain English: instead of scattering bare `console.log` calls, everything logs through one
 * object that emits a single JSON line per event (level, timestamp, message, optional metadata).
 * JSON lines are easy for hosting/log tooling to parse later. No dependencies.
 */

type LogLevel = 'debug' | 'info' | 'warn' | 'error'

function emit(level: LogLevel, message: string, meta?: Record<string, unknown>): void {
  const entry = {
    level,
    time: new Date().toISOString(),
    message,
    ...(meta !== undefined ? { meta } : {}),
  }
  const line = JSON.stringify(entry)
  if (level === 'error') {
    console.error(line)
  } else if (level === 'warn') {
    console.warn(line)
  } else {
    console.log(line)
  }
}

export const logger = {
  debug: (message: string, meta?: Record<string, unknown>): void => emit('debug', message, meta),
  info: (message: string, meta?: Record<string, unknown>): void => emit('info', message, meta),
  warn: (message: string, meta?: Record<string, unknown>): void => emit('warn', message, meta),
  error: (message: string, meta?: Record<string, unknown>): void => emit('error', message, meta),
}
