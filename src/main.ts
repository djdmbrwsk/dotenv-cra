import { existsSync } from 'fs';
import { basename, resolve } from 'path';

import {
  DotenvConfigOptions,
  DotenvConfigOutput,
  DotenvParseOutput,
  config as dotenvConfig,
} from 'dotenv';
import dotenvExpand from 'dotenv-expand';

export interface DotenvCraOptions extends DotenvConfigOptions {
  /**
   * You may specify a custom environment if NODE_ENV isn't sufficient.
   */
  env?: string;
  /**
   * You may specify a required prefix for your dotenv variables (ex. `REACT_APP_`).
   */
  prefix?: string;
}

export function config(options?: DotenvCraOptions): DotenvConfigOutput {
  const log = (message: string): void => {
    options?.debug && console.log(`[dotenv-cra][DEBUG] ${message}`);
  };

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
    process.env.NODE_ENV !== 'test' && `${dotenvPath}.local`,
    `${dotenvPath}.${env}`,
    dotenvPath,
  ];

  // Reference:
  // https://github.com/facebook/create-react-app/blob/8b7b819b4b9e6ba457e011e92e33266690e26957/packages/react-scripts/config/env.js#L36-L49
  let parsed: DotenvParseOutput = {};
  for (const dotenvFile of dotenvFiles) {
    if (!dotenvFile) {
      continue;
    }
    if (!existsSync(dotenvFile)) {
      log(`\`${basename(dotenvFile)}\` file not found`);
      continue;
    }

    log(`loading \`${basename(dotenvFile)}\``);

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

  // Reference:
  // https://github.com/facebook/create-react-app/blob/8b7b819b4b9e6ba457e011e92e33266690e26957/packages/react-scripts/config/env.js#L72-L89
  if (options?.prefix) {
    const prefixRegExp = new RegExp(`^${options.prefix}`, 'i');
    parsed = Object.keys(parsed)
      .filter((key) => {
        const match = prefixRegExp.test(key);
        log(
          `Prefix for key \`${key}\` ${
            match ? 'matches' : 'does not match'
          } \`${options.prefix}\``,
        );
        return match;
      })
      .reduce((obj, key) => {
        obj[key] = parsed[key];
        return obj;
      }, {} as DotenvParseOutput);
  }

  return {
    parsed,
  };
}
