# API reference

## `StampModule.forRootAsync(options)`

Registers the OAuth endpoints and the `StampService`.

```ts
StampModule.forRootAsync({
  imports: [StoresModule],
  clientStore: ClientStore,
  codeStore: CodeStore,
  jwtSigner: TokenSigner,
  loginPagePath: "/auth/login",
  resolveUserId: (req) => req.user?.id,
  expiresIn: 60 * 15,
  codeExpiresIn: 60 * 5,
});
```

### Options

| Option          | Type                       | Required | Description |
| --------------- | -------------------------- | -------- | ----------- |
| `imports`       | `ModuleMetadata["imports"]` | no       | Modules that provide and export your store classes. |
| `clientStore`   | `Type<SignetClientsStore>` | yes      | Class that finds OAuth clients. |
| `codeStore`     | `Type<CodeStore>`          | yes      | Class that saves and reads codes. |
| `jwtSigner`     | `Type<JwtSigner>`          | yes      | Class that builds access tokens. |
| `loginPagePath` | `string`                   | yes      | Where to redirect users who are not logged in. |
| `resolveUserId` | `UserIdResolver`           | yes      | Reads the user id from the request. |
| `expiresIn`     | `number`                   | no       | Access token lifetime in seconds. Default: `300` (5 minutes). |
| `codeExpiresIn` | `number`                   | no       | Authorization code lifetime in seconds. Default: `600` (10 minutes). |

Store classes are injected with `useExisting`. They must be provided and exported by a module in `imports`.

## Endpoints

Routes are mounted at the app root. Use `app.setGlobalPrefix()` or `RouterModule` to move them.

### `GET /authorize`

Starts the flow.

**Query params**

| Param                   | Required | Value |
| ----------------------- | -------- | ----- |
| `response_type`         | yes      | must be `code` |
| `client_id`             | yes      | the client id |
| `redirect_uri`          | yes      | must be in the client's `redirectUris` |
| `code_challenge`        | yes      | base64url SHA-256 of the verifier |
| `code_challenge_method` | yes      | must be `S256` |
| `state`                 | no       | sent back as is |
| `scope`                 | no       | accepted, not used yet |

**What happens**

1. Calls `resolveUserId(req)`.
2. No user → redirect to `loginPagePath` with the same query string.
3. Checks the client and the `redirect_uri`.
4. Creates a code (valid `codeExpiresIn` seconds, 10 minutes by default) and saves it with `codeStore.upsertCode`.
5. Redirects to `redirect_uri` with `code` (and `state`, if you sent one) added to its query string. Existing query params are kept.

**Errors** (HTTP 400, JSON)

- `invalid_client`: unknown `client_id`
- `invalid_client`: `redirect_uri` not registered

### `POST /token`

Swaps a code for an access token. Accepts `application/x-www-form-urlencoded` or JSON.

**Body**

| Field           | Required | Value |
| --------------- | -------- | ----- |
| `grant_type`    | yes      | must be `authorization_code` |
| `code`          | yes      | the code from `/authorize` |
| `redirect_uri`  | yes      | same as in `/authorize` |
| `client_id`     | yes      | same as in `/authorize` |
| `code_verifier` | yes      | the PKCE verifier |
| `client_secret` | confidential clients only | the plain secret |

**Success** (HTTP 200)

```json
{
  "access_token": "eyJhbGciOi...",
  "token_type": "Bearer",
  "expires_in": 300
}
```

Headers `Cache-Control: no-store` and `Pragma: no-cache` are set.

**Errors** (HTTP 400, JSON)

| Error                    | Description |
| ------------------------ | ----------- |
| `unsupported_grant_type` | `grant_type` is not `authorization_code` |
| `invalid_grant`          | code does not exist |
| `invalid_grant`          | code already consumed |
| `invalid_grant`          | code expired |
| `invalid_client`         | redirect mismatch |
| `invalid_client`         | client id mismatch |
| `invalid_client`         | client has no secret |
| `invalid_client`         | secret mismatch |
| `invalid_grant`          | PKCE verification failed |

Error shape:

```json
{
  "error": "invalid_grant",
  "error_description": "code expired"
}
```

## Interfaces

### `SignetClient`

```ts
interface SignetClient {
  clientId: string;
  clientSecretHash: string;
  redirectUris: string[];
  name: string;
  createdAt: Date;
  type: "public" | "confidential";
}
```

### `SignetClientsStore`

```ts
interface SignetClientsStore {
  findClientById(clientId: string | number): Promise<SignetClient | null>;
  createClient(data: CreateClientDto): Promise<void>;
  updateClient(data: UpdateClientDto): Promise<void>;
  deleteClient(clientId: string | number): Promise<void>;
  hashClientSecret(clientSecret: string): Promise<string>;
  compareHash(secret: string, hash: string): Promise<boolean>;
}
```

The library calls `findClientById` and `compareHash`. The rest is for your own code.

### `CodeClient`

```ts
interface CodeClient {
  code: string;
  clientId: string;
  userId: string;
  redirectUri: string;
  code_challenge: string;
  expireAt: Date;
  consumedAt: Date | null;
}
```

### `CodeStore`

```ts
interface CodeStore {
  findByCode(code: string): Promise<CodeClient | null>;
  upsertCode(data: Partial<CodeClient>): Promise<void>;
  consumeCode(code: string): Promise<boolean>;
  deleteCode(userId: string | number, code: string): Promise<void>;
}
```

- `upsertCode` saves a new code.
- `consumeCode` marks a code as used. It must be atomic and return `true` only for the first call. If it returns `false`, `/token` fails with `invalid_grant: code already consumed`.
- `deleteCode` is not called by the library.

### `JwtSigner`

```ts
interface JwtSigner {
  getJwtPayload(userId: string | number): Promise<Record<string, unknown>>;
  sign(payload: Record<string, unknown>, ttlSeconds: number): Promise<string>;
}
```

`ttlSeconds` is the `expiresIn` option, in seconds.

### `UserIdResolver`

```ts
type UserIdResolver = (req: any) => string | undefined | Promise<string | undefined>;
```

## `StampService`

Exported by the module. Use it if you want to build your own controller.

| Method | Description |
| ------ | ----------- |
| `handleRequest(query: AuthorizeQueryDto, userId: string)` | Checks the client, saves a code, returns `{ url }` to redirect to. |
| `exchangeCode(body: TokenBodyDto)` | Checks the code and PKCE, returns a `TokenResponse`. |

## `OAuthError` and `Errors`

`OAuthError` extends Nest's `HttpException` and returns the OAuth error shape.

```ts
import { Errors, OAuthError } from "stamp";

throw Errors.invalidClient("unknown client");
throw Errors.invalidGrant("code expired");
throw Errors.invalidRequest("missing param");
throw Errors.unsupportedGrantType();
throw new OAuthError("access_denied", "user said no", 403);
```
