import Logger, { createLogger } from 'bunyan';
import { LoggingBunyan } from '@google-cloud/logging-bunyan';
import { isLocal } from './config';

export function getLogger() {
  const streams: Logger.Stream[] = [];
  if (isLocal) {
    streams.push({ stream: process.stdout, level: 'info' });
  } else {
    const loggingBunyan = new LoggingBunyan();
    streams.push(loggingBunyan.stream('info'));
    streams.push(loggingBunyan.stream('warn'));
    streams.push(loggingBunyan.stream('error'));
    streams.push(loggingBunyan.stream('fatal'));
  }

  return createLogger({ name: 'catholic-per-day', streams });
}
