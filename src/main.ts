import { existsSync } from 'fs';
import { basename, resolve } from 'path';

import {
  config as dotenvConfig,
  DotenvConfigOptions,
  DotenvConfigOutput,
} from 'dotenv';
import dotenvExpand from 'dotenv-expand';

export interface DotenvCraOptions extends DotenvConfigOptions {
  /**
   * You may specify a custom environment if NODE_ENV isn't sufficient.
   */
  env?: string;
}

export function config(options?: DotenvCraOptions): DotenvConfigOutput {
  // Reference:
  // https://github.com/facebook/create-react-app/blob/8b7b819b4b9e6ba457e011e92e33266690e26957/packages/react-scripts/config/env.js#L18-L23
  if (!process.env.NODE_ENV) {
    throw new Error(
      'The NODE_ENV environment variable is required but was not specified.',
    );
  }

  const env = options?.env || process.env.NODE_ENV;
  const dotenvPath = options?.path || resolve(process.cwd(), '.env');

  // Reference:
  // https://github.com/facebook/create-react-app/blob/8b7b819b4b9e6ba457e011e92e33266690e26957/packages/react-scripts/config/env.js#L25-L34
  const dotenvFiles = [
    `${dotenvPath}.${env}.local`,
    `${dotenvPath}.${env}`,
    process.env.NODE_ENV !== 'test' && `${dotenvPath}.local`,
    dotenvPath,
  ];

  // Reference:
  // https://github.com/facebook/create-react-app/blob/8b7b819b4b9e6ba457e011e92e33266690e26957/packages/react-scripts/config/env.js#L36-L49
  let parsed: { [name: string]: string } = {};
  for (const dotenvFile of dotenvFiles) {
    if (dotenvFile && existsSync(dotenvFile)) {
      if (options?.debug) {
        log(`loading \`${basename(dotenvFile)}\``);
      }

      const result = dotenvExpand(
        dotenvConfig({
          debug: options?.debug,
          encoding: options?.encoding,
          path: dotenvFile,
        }),
      );

      if (result.error) {
        return result;
      }
      parsed = { ...result.parsed, ...parsed };
    }
  }
  return {
    parsed,
  };
}

function log(message: string): void {
  console.log(`[dotenv-cra][DEBUG] ${message}`);
}
