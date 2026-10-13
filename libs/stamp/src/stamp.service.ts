import { Inject, Injectable } from "@nestjs/common";
import {
  CODE_CLIENT_STORE,
  CodeStore,
  JWT_SIGNER,
  JwtSigner,
  SIGNET_CLIENT_STORE,
  SIGNET_LOGIN_PAGE_PATH,
  SIGNET_TOKEN_EXPIRES_IN,
  SignetClientsStore,
} from "./interfaces";
import { AuthorizeQueryDto, TokenBodyDto } from "./dtos";
import { Errors } from "./oauth-error";
import { randomBytes } from "crypto";
import { createHash } from "crypto";

export type TokenResponse = {
  access_token: string;
  token_type: "Bearer";
  expires_in: number;
  scope?: string; // we may implement it later
};

@Injectable()
export class StampService {
  constructor(
    @Inject(SIGNET_CLIENT_STORE)
    private readonly clientStore: SignetClientsStore,
    @Inject(SIGNET_LOGIN_PAGE_PATH) private readonly loginPagePath: string,
    @Inject(CODE_CLIENT_STORE) private readonly codeStore: CodeStore,
    @Inject(JWT_SIGNER) private readonly jwtSigner: JwtSigner,
    @Inject(SIGNET_TOKEN_EXPIRES_IN) private readonly expiresIn: number,
  ) {}

  async handleRequest(q: AuthorizeQueryDto, userId: string) {
    const client = await this.clientStore.findClientById(q.client_id);
    if (!client) {
      throw Errors.invalidClient("unknown client_id");
    }
    if (!client.redirectUris.includes(q.redirect_uri)) {
      throw Errors.invalidClient("redirect_uri not registered");
    }
    const code = randomBytes(24).toString("base64url") as string; //change it later
    await this.codeStore.upsertCode({
      code,
      userId,
      clientId: client.clientId,
      code_challenge: q.code_challenge,
      redirectUri: q.redirect_uri,
      expireAt: new Date(Date.now() + 10 * 60 * 1000),
      consumedAt: null,
    });
    const url = new URL(q.redirect_uri);
    url.searchParams.set("code", code);
    if (q.state) url.searchParams.set("state", q.state);
    return { url: url.toString() };
  }
  async exchangeCode(data: TokenBodyDto): Promise<TokenResponse> {
    const codeClient = await this.codeStore.findByCode(data.code);
    if (!codeClient) {
      throw Errors.invalidGrant("code doesnt exist");
    }
    if (codeClient.consumedAt) {
      throw Errors.invalidGrant("code already consumed");
    }

    if (codeClient.expireAt < new Date()) {
      throw Errors.invalidGrant("code expired");
    }
    if (data.redirect_uri !== codeClient.redirectUri) {
      throw Errors.invalidClient("redirect mismatch");
    }
    if (data.client_id !== codeClient.clientId) {
      throw Errors.invalidClient("client id mismatch");
    }
    const client = await this.clientStore.findClientById(data.client_id);
    if (client?.type === "confidential") {
      if (!data.client_secret) {
        throw Errors.invalidClient("client id doesnt have secert");
      }
      if (
        !(await this.clientStore.compareHash(
          data.client_secret,
          client.clientSecretHash,
        ))
      ) {
        throw Errors.invalidClient("secret mismatch");
      }
    }
    const challenge = createHash("sha256")
      .update(data.code_verifier)
      .digest("base64url");
    if (challenge !== codeClient.code_challenge) {
      throw Errors.invalidGrant("PKCE verification failed");
    }
    if (!(await this.codeStore.consumeCode(codeClient.code))) {
      throw Errors.invalidGrant("code already consumed");
    }
    const payload = await this.jwtSigner.getJwtPayload(codeClient.userId);
    const access_token = await this.jwtSigner.sign(payload, this.expiresIn);
    return {
      access_token,
      token_type: "Bearer",
      expires_in: this.expiresIn,
    };
  }

  getLoginPagePath() {
    return this.loginPagePath;
  }
}
