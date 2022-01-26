import { createLogger } from 'bunyan';
import { LoggingBunyan } from '@google-cloud/logging-bunyan';

const loggingBunyan = new LoggingBunyan();

export const logger = createLogger({
  name: 'catholic-per-day',
  streams: [loggingBunyan.stream('info'), loggingBunyan.stream('warn'), loggingBunyan.stream('error'), loggingBunyan.stream('fatal')],
});
