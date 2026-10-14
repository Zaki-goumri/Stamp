# Getting started

This guide builds a working OAuth 2.0 provider with NestJS, step by step.

We use in-memory stores to keep things short. In a real app, swap them for your database.

## What you need

- A NestJS app (v11 or v12)
- A way to log users in (sessions, cookies, Passport...)
- `@nestjs/jwt` to sign tokens (or any JWT library)

```bash
npm install github:Zaki-goumri/Stamp @nestjs/jwt class-validator class-transformer
```

## The big picture

Stamp needs three things from you:

| Piece        | Job                                          |
| ------------ | -------------------------------------------- |
| Client store | Finds OAuth clients (the apps that log in with you) |
| Code store   | Saves and reads authorization codes          |
| JWT signer   | Builds the access token for a user           |

And two settings:

| Setting         | Job                                              |
| --------------- | ------------------------------------------------ |
| `loginPagePath` | Where to send users who are not logged in        |
| `resolveUserId` | How to read the logged-in user id from a request |

## Step 1: The client store

A client is an app that wants to log users in through you. For example, your mobile app or a partner website.

```ts
import { Injectable } from "@nestjs/common";
import { randomUUID, scrypt, randomBytes, timingSafeEqual } from "crypto";
import { promisify } from "util";
import {
  SignetClientsStore,
  SignetClient,
  CreateClientDto,
  UpdateClientDto,
} from "stamp";

const scryptAsync = promisify(scrypt);

@Injectable()
export class ClientStore implements SignetClientsStore {
  private clients = new Map<string, SignetClient>([
    [
      "my-spa",
      {
        clientId: "my-spa",
        clientSecretHash: "",
        redirectUris: ["http://localhost:5173/callback"],
        name: "My SPA",
        createdAt: new Date(),
        type: "public",
      },
    ],
  ]);

  async findClientById(clientId: string) {
    return this.clients.get(clientId) ?? null;
  }

  async createClient(data: CreateClientDto) {
    const clientId = randomUUID();
    this.clients.set(clientId, {
      ...data,
      clientId,
      clientSecretHash: "",
      createdAt: new Date(),
    });
  }

  async updateClient(data: UpdateClientDto) {}

  async deleteClient(clientId: string) {
    this.clients.delete(clientId);
  }

  async hashClientSecret(secret: string) {
    const salt = randomBytes(16).toString("hex");
    const hash = (await scryptAsync(secret, salt, 64)) as Buffer;
    return `${salt}:${hash.toString("hex")}`;
  }

  async compareHash(secret: string, stored: string) {
    const [salt, hash] = stored.split(":");
    const test = (await scryptAsync(secret, salt, 64)) as Buffer;
    return timingSafeEqual(test, Buffer.from(hash, "hex"));
  }
}
```

### Public vs confidential clients

- **public**: runs on the user's device (SPA, mobile app). It can't keep a secret. PKCE protects it.
- **confidential**: runs on a server. It must send `client_secret` to `/token`. The library checks it with `compareHash`.

> The library only calls `findClientById` and `compareHash`. The other methods are there for your own admin code (create, update, delete clients).

## Step 2: The code store

An authorization code is a short-lived, one-time ticket. The client swaps it for a token.

```ts
import { Injectable } from "@nestjs/common";
import { CodeStore as ICodeStore, CodeClient } from "stamp";

@Injectable()
export class CodeStore implements ICodeStore {
  private codes = new Map<string, CodeClient>();

  async findByCode(code: string) {
    return this.codes.get(code) ?? null;
  }

  async upsertCode(data: Partial<CodeClient>) {
    const old = this.codes.get(data.code!);
    this.codes.set(data.code!, { ...old, ...data } as CodeClient);
  }

  async consumeCode(code: string) {
    const row = this.codes.get(code);
    if (!row || row.consumedAt) return false;
    row.consumedAt = new Date();
    return true;
  }

  async deleteCode(userId: string, code: string) {
    this.codes.delete(code);
  }
}
```

- `upsertCode` saves a new code, with every field.
- `consumeCode` marks a code as used. It must return `true` only the first time.

`consumeCode` must be **atomic**. If two requests use the same code at the same time, only one may get `true`. Otherwise one code could give two tokens.

How to do it with common databases:

| Database | How |
| -------- | --- |
| SQL / Prisma | `UPDATE ... SET consumedAt = now() WHERE code = ? AND consumedAt IS NULL`, then check that 1 row changed |
| MongoDB | `findOneAndUpdate({ code, consumedAt: null }, { $set: { consumedAt: new Date() } })` |
| Redis | `GETDEL` the code, or `SET ... NX` a "used" key |

> Tip: Redis is a great fit for codes. Set the TTL to `codeExpiresIn` and they clean up on their own.

## Step 3: The JWT signer

This builds the access token. You decide what goes inside.

```ts
import { Injectable } from "@nestjs/common";
import { JwtService } from "@nestjs/jwt";
import { JwtSigner } from "stamp";

@Injectable()
export class TokenSigner implements JwtSigner {
  constructor(private readonly jwt: JwtService) {}

  async getJwtPayload(userId: string) {
    return { sub: userId };
  }

  async sign(payload: Record<string, unknown>, ttl: number) {
    return this.jwt.signAsync(payload, { expiresIn: ttl });
  }
}
```

`getJwtPayload` is the place to add roles, email, tenant id, and so on.

`ttl` is the token lifetime in **seconds**. It comes from the `expiresIn` option (default: 300, so 5 minutes).

## Step 4: Put the stores in a module

The library looks up your classes with `useExisting`. So they must be **provided and exported** by a module you pass in `imports`.

```ts
import { Module } from "@nestjs/common";
import { JwtModule } from "@nestjs/jwt";
import { ClientStore } from "./client.store";
import { CodeStore } from "./code.store";
import { TokenSigner } from "./token.signer";

@Module({
  imports: [JwtModule.register({ secret: process.env.JWT_SECRET })],
  providers: [ClientStore, CodeStore, TokenSigner],
  exports: [ClientStore, CodeStore, TokenSigner],
})
export class StoresModule {}
```

If you forget `exports`, Nest will throw a "can't resolve dependencies" error.

## Step 5: Register the module

```ts
import { Module } from "@nestjs/common";
import { StampModule } from "stamp";
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

### `expiresIn` (optional)

Access token lifetime in seconds. Default is `300` (5 minutes).

```ts
expiresIn: 60 * 15
```

### `codeExpiresIn` (optional)

Authorization code lifetime in seconds. Default is `600` (10 minutes).

```ts
codeExpiresIn: 60 * 5
```

Keep it short. A code only needs to live a few seconds, between the redirect and the `/token` call.

### `resolveUserId`

This function gets the Express request. Return the logged-in user id, or `undefined` if nobody is logged in.

It can be async. Some examples:

```ts
resolveUserId: (req) => req.user?.id
```

```ts
resolveUserId: (req) => req.session?.userId
```

```ts
resolveUserId: async (req) => {
  const token = req.cookies?.session;
  if (!token) return undefined;
  const session = await sessions.find(token);
  return session?.userId;
}
```

> Make sure your auth middleware runs before the OAuth routes, so `req.user` or `req.session` is ready.

## Step 6: Turn on validation

The endpoints use `class-validator` DTOs. Turn on the global pipe in `main.ts`:

```ts
import { NestFactory } from "@nestjs/core";
import { ValidationPipe } from "@nestjs/common";
import { AppModule } from "./app.module";

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  app.useGlobalPipes(new ValidationPipe());
  await app.listen(3000);
}
bootstrap();
```

## Step 7: Build the login page

When a user is not logged in, `/authorize` sends them to:

```
{loginPagePath}?response_type=code&client_id=...&redirect_uri=...&code_challenge=...
```

All the original query params are kept. Your login page must:

1. Log the user in (your own logic).
2. Send them back to `/authorize` with the **same query string**.

Example with a simple form handler:

```ts
@Post("auth/login")
async login(@Body() body, @Query() query, @Req() req, @Res() res) {
  const user = await this.users.check(body.email, body.password);
  req.session.userId = user.id;
  return res.redirect(`/authorize?${new URLSearchParams(query)}`);
}
```

Now `resolveUserId` finds the user, and the flow continues.

## Step 8: Try it

### 1. Make a PKCE pair (client side)

```ts
import { randomBytes, createHash } from "crypto";

const verifier = randomBytes(32).toString("base64url");
const challenge = createHash("sha256").update(verifier).digest("base64url");
```

In the browser, use `crypto.subtle.digest("SHA-256", ...)` instead.

### 2. Send the user to `/authorize`

```
http://localhost:3000/authorize
  ?response_type=code
  &client_id=my-spa
  &redirect_uri=http://localhost:5173/callback
  &code_challenge=<challenge>
  &code_challenge_method=S256
  &state=xyz
```

After login, the user lands on:

```
http://localhost:5173/callback?code=<code>&state=xyz
```

Always check that `state` matches what you sent.

### 3. Swap the code for a token

```bash
curl -X POST http://localhost:3000/token \
  -H "Content-Type: application/x-www-form-urlencoded" \
  -d grant_type=authorization_code \
  -d code=<code> \
  -d redirect_uri=http://localhost:5173/callback \
  -d client_id=my-spa \
  -d code_verifier=<verifier>
```

Response:

```json
{
  "access_token": "eyJhbGciOi...",
  "token_type": "Bearer",
  "expires_in": 300
}
```

Confidential clients also send `-d client_secret=<secret>`.

## Using a real database

Here is a Prisma schema you can start from:

```prisma
model OAuthClient {
  clientId         String   @id
  clientSecretHash String   @default("")
  redirectUris     String[]
  name             String
  type             String
  createdAt        DateTime @default(now())
}

model OAuthCode {
  code          String    @id
  clientId      String
  userId        String
  redirectUri   String
  code_challenge String
  expireAt      DateTime
  consumedAt    DateTime?
}
```

And the code store:

```ts
@Injectable()
export class PrismaCodeStore implements CodeStore {
  constructor(private readonly prisma: PrismaService) {}

  findByCode(code: string) {
    return this.prisma.oAuthCode.findUnique({ where: { code } });
  }

  async upsertCode(data: Partial<CodeClient>) {
    await this.prisma.oAuthCode.upsert({
      where: { code: data.code },
      create: data as CodeClient,
      update: data,
    });
  }

  async consumeCode(code: string) {
    const { count } = await this.prisma.oAuthCode.updateMany({
      where: { code, consumedAt: null },
      data: { consumedAt: new Date() },
    });
    return count === 1;
  }

  async deleteCode(userId: string, code: string) {
    await this.prisma.oAuthCode.delete({ where: { code } });
  }
}
```

## Common problems

**"Nest can't resolve dependencies of StampService"**
Your store classes are not exported from the module in `imports`. See [step 4](#step-4-put-the-stores-in-a-module).

**`/authorize` always goes to the login page**
`resolveUserId` returns `undefined`. Check that your auth middleware runs first, and that the login page sends the user back with the same query string.

**`invalid_client: redirect_uri not registered`**
The `redirect_uri` must match one of the client's `redirectUris` exactly. Watch out for trailing slashes and `http` vs `https`.

**`invalid_grant: PKCE verification failed`**
The `code_verifier` does not match the `code_challenge`. Make sure you use SHA-256 and **base64url** (not plain base64).

**`invalid_grant: code already consumed`**
Codes work only once. Start the flow again.

**Validation errors are ignored**
You forgot `app.useGlobalPipes(new ValidationPipe())`.

## Next

See the [API reference](api-reference.md) for every type and endpoint.
