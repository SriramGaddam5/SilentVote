import { createWriteStream } from 'node:fs';
import * as fs from 'node:fs/promises';
import * as path from 'path';
import pino from 'pino';
import pinoPretty from 'pino-pretty';

export const createLogger = async (logPath: string): Promise<pino.Logger> => {
  await fs.mkdir(path.dirname(logPath), { recursive: true });
  const pretty: pinoPretty.PrettyStream = pinoPretty({
    colorize: true,
    sync: true,
  });
  const level = 'trace' as const;
  return pino(
    {
      level,
      depthLimit: 20,
    },
    pino.multistream([
      { stream: pretty, level: 'debug' },
      { stream: createWriteStream(logPath), level },
    ]),
  );
};
