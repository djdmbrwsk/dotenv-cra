import fs from 'fs';
import { basename } from 'path';

import dotenv, { DotenvConfigOutput } from 'dotenv';

import { DotenvCraOptions, config } from '../src/main';

const originalNodeEnv = process.env.NODE_ENV;
beforeEach(() => {
  jest.restoreAllMocks();
  process.env.NODE_ENV = originalNodeEnv;
});

test('should successfully configure', () => {
  process.env.NODE_ENV = 'development';
  jest.spyOn(fs, 'existsSync').mockReturnValue(true);
  jest.spyOn(dotenv, 'config').mockImplementation(
    makeMockDotenvConfig({
      '.env.development.local': { parsed: { FIRST: 'FIRST', SAME: 'SAME' } },
      '.env.development': { parsed: { SECOND: 'SECOND' } },
      '.env.local': { parsed: { THIRD: 'THIRD' } },
      '.env': { parsed: { FOURTH: 'FOURTH', SAME: 'DIFFERENT' } },
    }),
  );

  const output = config();
  expect(output.error).toBeFalsy();
  expect(output.parsed).toBeTruthy();
  expect(output.parsed).toEqual({
    FIRST: 'FIRST',
    SECOND: 'SECOND',
    THIRD: 'THIRD',
    FOURTH: 'FOURTH',

    SAME: 'SAME',
  });
});

test('should error if NODE_ENV not set', () => {
  delete process.env.NODE_ENV;
  expect(config).toThrowError(
    'The NODE_ENV environment variable is required but was not specified.',
  );
});

test('should allow override of NODE_ENV when `env` supplied in options', () => {
  process.env.NODE_ENV = 'development';
  jest.spyOn(fs, 'existsSync').mockReturnValue(true);
  const dotenvConfigSpy = jest
    .spyOn(dotenv, 'config')
    .mockImplementation(makeMockDotenvConfig());

  config({ env: 'staging' });
  expect(dotenvConfigSpy).toBeCalled();
  const firstCallPath = dotenvConfigSpy.mock.calls[0][0]?.path;
  expect(firstCallPath?.endsWith('.env.staging.local')).toEqual(true);
});

test('should allow custom .env path when `path` supplied in options', () => {
  jest.spyOn(fs, 'existsSync').mockReturnValue(true);
  const dotenvConfigSpy = jest
    .spyOn(dotenv, 'config')
    .mockImplementation(makeMockDotenvConfig());

  config({ path: '/foo/bar/.env' });
  expect(dotenvConfigSpy).toBeCalled();
  const firstCallPath = dotenvConfigSpy.mock.calls[0][0]?.path;
  expect(firstCallPath?.startsWith('/foo/bar/')).toEqual(true);
});

test('should log files loaded when `debug` supplied in options', () => {
  process.env.NODE_ENV = 'development';
  jest.spyOn(fs, 'existsSync').mockReturnValue(true);
  jest.spyOn(dotenv, 'config').mockImplementation(makeMockDotenvConfig());
  const consoleLogSpy = jest.spyOn(console, 'log');

  config({ debug: true });
  expect(consoleLogSpy).toBeCalledTimes(4);
  expect(consoleLogSpy.mock.calls[0][0]).toEqual(
    '[dotenv-cra][DEBUG] loading `.env.development.local`',
  );
  expect(consoleLogSpy.mock.calls[1][0]).toEqual(
    '[dotenv-cra][DEBUG] loading `.env.local`',
  );
  expect(consoleLogSpy.mock.calls[2][0]).toEqual(
    '[dotenv-cra][DEBUG] loading `.env.development`',
  );
  expect(consoleLogSpy.mock.calls[3][0]).toEqual(
    '[dotenv-cra][DEBUG] loading `.env`',
  );
});

test('should exclude .env.local when NODE_ENV set to test', () => {
  jest.spyOn(fs, 'existsSync').mockReturnValue(true);

  process.env.NODE_ENV = 'test';
  let dotenvConfigSpy = jest
    .spyOn(dotenv, 'config')
    .mockImplementation(makeMockDotenvConfig());
  config();
  expect(dotenvConfigSpy).toBeCalledTimes(3);
  let secondCallPath = dotenvConfigSpy.mock.calls[1][0]?.path;
  expect(secondCallPath?.endsWith('.env.local')).toEqual(false);

  process.env.NODE_ENV = 'development';
  dotenvConfigSpy.mockRestore();
  dotenvConfigSpy = jest
    .spyOn(dotenv, 'config')
    .mockImplementation(makeMockDotenvConfig());
  config();
  expect(dotenvConfigSpy).toBeCalledTimes(4);
  secondCallPath = dotenvConfigSpy.mock.calls[1][0]?.path;
  expect(secondCallPath?.endsWith('.env.local')).toEqual(true);
});

test('should return error objects', () => {
  jest.spyOn(fs, 'existsSync').mockReturnValue(true);
  jest.spyOn(dotenv, 'config').mockReturnValue({ error: new Error('foobar') });

  const output = config();
  expect(output.error).toBeTruthy();
  expect(output.parsed).toBeFalsy();
});

function makeMockDotenvConfig(fileToOutput?: {
  [file: string]: DotenvConfigOutput;
}) {
  return (options?: DotenvCraOptions): DotenvConfigOutput => {
    const file = options?.path && basename(options.path);
    const output = file && fileToOutput && fileToOutput[file];
    return output || { parsed: {} };
  };
}
