# Stamp

[![npm](https://img.shields.io/npm/v/@zaki-g/stamp)](https://www.npmjs.com/package/@zaki-g/stamp) [![license](https://img.shields.io/npm/l/@zaki-g/stamp)](LICENSE) [![docs](https://img.shields.io/badge/docs-website-blue)](https://zaki-goumri.github.io/Stamp/)

Turn your NestJS app into an OAuth 2.0 provider.

Stamp adds the **Authorization Code + PKCE** flow to your NestJS app. It gives you the `/authorize` and `/token` endpoints. You keep full control of your database, your users and your JWTs.

## Why

Most OAuth libraries force a database, an ORM or a user model on you. Stamp does not. You plug in three small classes:

- a **client store** → where your OAuth apps live
- a **code store** → where authorization codes live
- a **JWT signer** → how you build access tokens

The library does the OAuth part. You do the rest your way.

## Features

- Authorization Code flow ([RFC 6749](https://datatracker.ietf.org/doc/html/rfc6749))
- PKCE with `S256` ([RFC 7636](https://datatracker.ietf.org/doc/html/rfc7636))
- Public clients (SPA, mobile) and confidential clients (backend with a secret)
- One-time codes that expire after 10 minutes by default
- Standard OAuth error responses (`invalid_client`, `invalid_grant`, ...)
- Works with any database: Prisma, TypeORM, Mongoose, Redis, in-memory...
- NestJS 11 and 12

## Install

Install it from npm:

```bash
npm install @zaki-g/stamp
```

Peer dependencies:

```bash
npm install @nestjs/common @nestjs/core @nestjs/platform-express class-validator class-transformer reflect-metadata rxjs
```

## Quick start

```ts
import { Module } from "@nestjs/common";
import { StampModule } from "@zaki-g/stamp";
import { StoresModule } from "./stores.module";
import { ClientStore } from "./client.store";
import { CodeStore } from "./code.store";
import { TokenSigner } from "./token.signer";

@Module({
  imports: [
    StampModule.forRootAsync({
      imports: [StoresModule],
      clientStore: ClientStore,
      codeStore: CodeStore,
      jwtSigner: TokenSigner,
      loginPagePath: "/auth/login",
      resolveUserId: (req) => req.user?.id,
    }),
  ],
})
export class AppModule {}
```

Turn on validation in `main.ts`:

```ts
app.useGlobalPipes(new ValidationPipe());
```

Your app now has:

| Method | Path         | What it does                                |
| ------ | ------------ | ------------------------------------------- |
| GET    | `/authorize` | Checks the client and sends back a code     |
| POST   | `/token`     | Swaps the code for an access token          |

## How it works

```
 Client app                 Your NestJS app                  User
     │                            │                            │
     │ 1. GET /authorize ────────▶│                            │
     │    + code_challenge        │ not logged in?             │
     │                            │ 2. redirect to login ─────▶│
     │                            │◀──── 3. user logs in ──────│
     │                            │ 4. back to /authorize      │
     │◀── 5. redirect_uri?code=…  │                            │
     │                            │                            │
     │ 6. POST /token ───────────▶│                            │
     │    + code_verifier         │ checks PKCE                │
     │◀── 7. access_token ────────│                            │
```

## Documentation

Full docs: **https://zaki-goumri.github.io/Stamp/**

- [Getting started guide](https://zaki-goumri.github.io/Stamp/guide): full setup, step by step
- [API reference](https://zaki-goumri.github.io/Stamp/api-reference): every option, interface and endpoint

## Limitations

This is an early version. Not supported yet:

- refresh tokens
- scopes (accepted but ignored)
- grant types other than `authorization_code`
- PKCE `plain` method (only `S256`)

## Contributing

Issues and pull requests are welcome.

```bash
git clone https://github.com/Zaki-goumri/Stamp.git
cd Stamp
npm install
npm run build
npm test
npm run docs:dev
```

## Releasing

Bump the version and push the tag. CI publishes to npm.

```bash
npm version patch
git push --follow-tags
```

## License

MIT
