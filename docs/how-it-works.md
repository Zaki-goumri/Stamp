# How it works

Stamp handles the OAuth part. You handle the rest.

## The flow

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

1. The client app sends the user to `/authorize` with a PKCE `code_challenge`.
2. If the user is not logged in, Stamp sends them to your login page.
3. The user logs in with your own logic.
4. Your login page sends them back to `/authorize` with the same query string.
5. Stamp creates a one-time code and redirects to the client's `redirect_uri`.
6. The client sends the code and its `code_verifier` to `/token`.
7. Stamp checks everything and returns an access token.

## What you provide

| Piece           | Job                                                |
| --------------- | -------------------------------------------------- |
| Client store    | Finds OAuth clients (the apps that log in with you) |
| Code store      | Saves and reads authorization codes                |
| JWT signer      | Builds the access token for a user                 |
| `loginPagePath` | Where to send users who are not logged in          |
| `resolveUserId` | How to read the logged-in user id from a request   |

## What Stamp does

- Validates the `/authorize` and `/token` requests
- Checks the client and its `redirect_uri`
- Creates one-time codes that expire after 10 minutes (change it with `codeExpiresIn`)
- Verifies PKCE with `S256`
- Checks the secret for confidential clients
- Returns standard OAuth errors

## Limitations

This is an early version. Not supported yet:

- refresh tokens
- scopes (accepted but ignored)
- grant types other than `authorization_code`
- PKCE `plain` method (only `S256`)
