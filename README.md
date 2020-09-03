[![build](https://img.shields.io/github/workflow/status/djdmbrwsk/dotenv-cra/Lint%2C%20build%2C%20test/master)](https://github.com/djdmbrwsk/dotenv-cra/actions?query=branch%3Amaster+workflow%3A%22Lint%2C+build%2C+test%22)
&nbsp;
[![coverage](https://img.shields.io/codecov/c/gh/djdmbrwsk/dotenv-cra)](https://codecov.io/gh/djdmbrwsk/dotenv-cra/branch/master)
&nbsp;
[![npm](https://img.shields.io/npm/v/dotenv-cra)](https://www.npmjs.com/package/dotenv-cra)

# dotenv-cra

Create React App style [dotenv](https://github.com/motdotla/dotenv) support for
Node projects. Combine a base `.env` file with a `.env.${NODE_ENV}` file to
create your optimum configuration.

**Note:** It's not recommended that you store secrets (like private API keys) in
your `.env` file(s). Secret configuration values should be managed and provided
as part of your hosting solution.

## Install

```
npm i dotenv-cra
```

## Usage

Not much new here. As with dotenv, import/require `dotenv-cra` and configure it
as early as possible. One difference is that `NODE_ENV` must be provided, so you
may choose to default it in your application before calling `config()`.

```ts
import dotenvCra from 'dotenv-cra';

process.env.NODE_ENV = process.env.NODE_ENV || 'development';
dotenvCra.config();
```

At a minimum, create a base `.env` file in the root directory of your project
with `KEY=value` entires on each line. However, if that's all you ever do, you
don't need this library 😉. To see the real value of dotenv-cra, try creating a
second `.env.development` file with some new and some overlapping `KEY=value`
pairs.

```
# .env
LOG_LEVEL=info
PORT=3001

# .env.development
LOG_LEVEL=debug

# Loaded into process.env
LOG_LEVEL=debug
PORT=3001
```

## What `.env` files can be used?

- `.env`: Default.
- `.env.local`: Local overrides. This file is loaded for all environments except test.
- `.env.development`, `.env.test`, `.env.production`: Environment-specific settings.
- `.env.development.local`, `.env.test.local`, `.env.production.local`: Local overrides of environment-specific settings.

Files on the left have more priority than files on the right:

- `npm start`: `.env.development.local`, `.env.local`, `.env.development`, `.env`
- `npm test`: `.env.test.local`, `.env.test`, `.env` (note `.env.local` is missing)

[CRA Reference](https://create-react-app.dev/docs/adding-custom-environment-variables/#what-other-env-files-can-be-used)

## Options

### Env

Default: `process.env.NODE_ENV`

You may specify a custom environment if you don't want to base the `.env.*`
files you load on `NODE_ENV`. For example, you may want `NODE_ENV` set to
`production`, but you want to load the `.env.staging` file.

```ts
dotenvCra.config({ env: process.env.AWS_ENV });
```

### Path

Default: `path.resolve(process.cwd(), '.env')`

You may specify a custom path if your file containing environment variables is
located elsewhere. This will also be used as the basis for resolving the other
`.env.*` files.

```ts
dotenvCra.config({ path: '/full/custom/path/to/your/.env' });
```

### Encoding

Default: `utf8`

You may specify the encoding of your file containing environment variables.
**Passed through to dotenv.**

```ts
dotenvCra.config({ encoding: 'latin1' });
```

### Debug

Default: `false`

You may turn on logging to help debug why certain keys or values are not being
set as you expect. **Passed through to dotenv.**

```ts
dotenvCra.config({ debug: process.env.DEBUG });
```

## Credits

Thanks to these projects for this simple yet powerful approach 👏

- [dotenv](https://github.com/motdotla/dotenv)
- [dotenv-expand](https://github.com/motdotla/dotenv-expand)
- [create-react-app](https://github.com/facebook/create-react-app)
