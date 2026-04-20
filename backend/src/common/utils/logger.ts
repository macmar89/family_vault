import pino, { type LoggerOptions } from 'pino';

const isDevelopment = process.env.NODE_ENV === 'development';
const betterStackToken = process.env.BETTERSTACK_TOKEN;

const pinoOptions: LoggerOptions = {
  level: process.env.LOG_LEVEL || 'info',
};

if (isDevelopment) {
  pinoOptions.transport = {
    target: 'pino-pretty',
    options: {
      colorize: true,
      translateTime: 'SYS:standard',
      ignore: 'pid,hostname',
    },
  };
} else if (betterStackToken) {
  pinoOptions.transport = {
    target: '@logtail/pino',
    options: { sourceToken: betterStackToken },
  };
}

export const logger = pino(pinoOptions);
