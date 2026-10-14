---
layout: home

hero:
  name: Stamp
  text: OAuth 2.0 for NestJS
  tagline: Add the Authorization Code + PKCE flow to your app. Keep your own database, users and JWTs.
  actions:
    - theme: brand
      text: Get started
      link: /guide
    - theme: alt
      text: API reference
      link: /api-reference
    - theme: alt
      text: GitHub
      link: https://github.com/Zaki-goumri/Stamp

features:
  - title: Authorization Code + PKCE
    details: Follows RFC 6749 and RFC 7636 with S256. Works for SPAs, mobile apps and backends.
  - title: Bring your own database
    details: Plug in a client store and a code store. Use Prisma, TypeORM, Mongoose, Redis or plain memory.
  - title: Your JWTs, your way
    details: You build the token payload and sign it. Add roles, email, tenant id, anything.
  - title: Standard errors
    details: Returns real OAuth errors like invalid_client and invalid_grant, with the right shape.
  - title: Public and confidential clients
    details: Public clients use PKCE. Confidential clients also send a secret, checked with your hash.
  - title: NestJS 11 and 12
    details: One module, two endpoints. Register it and you are done.
---

## Quick look

```ts
import { Module } from "@nestjs/common";
import { StampModule } from "@zaki-goumri/stamp";

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

Your app now has:

| Method | Path         | What it does                            |
| ------ | ------------ | --------------------------------------- |
| GET    | `/authorize` | Checks the client and sends back a code |
| POST   | `/token`     | Swaps the code for an access token      |

## Install

Install it from npm:

```bash
npm install @zaki-goumri/stamp
```

Then follow the [getting started guide](/guide).
