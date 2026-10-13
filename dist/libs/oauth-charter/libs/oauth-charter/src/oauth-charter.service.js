"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
var __param = (this && this.__param) || function (paramIndex, decorator) {
    return function (target, key) { decorator(target, key, paramIndex); }
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.OauthCharterService = void 0;
const common_1 = require("@nestjs/common");
const interfaces_1 = require("./interfaces");
const oauth_error_1 = require("./oauth-error");
const crypto_1 = require("crypto");
const crypto_2 = require("crypto");
let OauthCharterService = class OauthCharterService {
    clientStore;
    loginPagePath;
    codeStore;
    jwtSigner;
    constructor(clientStore, loginPagePath, codeStore, jwtSigner) {
        this.clientStore = clientStore;
        this.loginPagePath = loginPagePath;
        this.codeStore = codeStore;
        this.jwtSigner = jwtSigner;
    }
    async handleRequest(q, userId) {
        const client = await this.clientStore.findClientById(q.client_id);
        if (!client) {
            throw oauth_error_1.Errors.invalidClient("unknown client_id");
        }
        if (!client.redirectUris.includes(q.redirect_uri)) {
            throw oauth_error_1.Errors.invalidClient("redirect_uri not registered");
        }
        const code = (0, crypto_1.randomBytes)(24).toString("base64url");
        await this.codeStore.upsertCode({
            code,
            userId,
            clientId: client.clientId,
            code_challenge: q.code_challenge,
            redirectUri: q.redirect_uri,
            expireAt: new Date(Date.now() + 10 * 60 * 1000),
            consumedAt: null,
        });
        return {
            url: `${q.redirect_uri}?code=${code}&state=${encodeURIComponent(q.state ? q.state : "")}`,
        };
    }
    async exchangeCode(data) {
        const codeClient = await this.codeStore.findByCode(data.code);
        if (!codeClient) {
            throw oauth_error_1.Errors.invalidGrant("code doesnt exist");
        }
        if (codeClient.consumedAt) {
            throw oauth_error_1.Errors.invalidGrant("code already consumed");
        }
        if (codeClient.expireAt < new Date()) {
            throw oauth_error_1.Errors.invalidGrant("code expired");
        }
        if (data.redirect_uri !== codeClient.redirectUri) {
            throw oauth_error_1.Errors.invalidClient("redirect mismatch");
        }
        if (data.client_id !== codeClient.clientId) {
            throw oauth_error_1.Errors.invalidClient("client id mismatch");
        }
        const client = await this.clientStore.findClientById(data.client_id);
        if (client?.type === "confidential") {
            if (!data.client_secret) {
                throw oauth_error_1.Errors.invalidClient("client id doesnt have secert");
            }
            if (!(await this.clientStore.compareHash(data.client_secret, client.clientSecretHash))) {
                throw oauth_error_1.Errors.invalidClient("secret mismatch");
            }
        }
        const challenge = (0, crypto_2.createHash)("sha256")
            .update(data.code_verifier)
            .digest("base64url");
        if (challenge !== codeClient.code_challenge) {
            throw oauth_error_1.Errors.invalidGrant("PKCE verification failed");
        }
        this.codeStore.upsertCode({
            code: codeClient.code,
            consumedAt: new Date(),
        });
        const expires_in = 1000 * 60 * 5;
        const payload = await this.jwtSigner.getJwtPayload(codeClient.userId);
        const access_token = await this.jwtSigner.sign(payload, expires_in);
        return {
            access_token,
            token_type: "Bearer",
            expires_in,
        };
    }
    renderLoginPage() {
        return this.loginPagePath;
    }
};
exports.OauthCharterService = OauthCharterService;
exports.OauthCharterService = OauthCharterService = __decorate([
    (0, common_1.Injectable)(),
    __param(0, (0, common_1.Inject)(interfaces_1.SIGNET_CLIENT_STORE)),
    __param(1, (0, common_1.Inject)(interfaces_1.SIGNET_LOGIN_PAGE_PATH)),
    __param(2, (0, common_1.Inject)(interfaces_1.CODE_CLIENT_STORE)),
    __param(3, (0, common_1.Inject)(interfaces_1.JWT_SIGNER)),
    __metadata("design:paramtypes", [Object, String, Object, Object])
], OauthCharterService);
//# sourceMappingURL=oauth-charter.service.js.map