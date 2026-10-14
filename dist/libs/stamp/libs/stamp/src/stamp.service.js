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
exports.StampService = void 0;
const common_1 = require("@nestjs/common");
const interfaces_1 = require("./interfaces");
const oauth_error_1 = require("./oauth-error");
const crypto_1 = require("crypto");
const crypto_2 = require("crypto");
let StampService = class StampService {
    clientStore;
    loginPagePath;
    codeStore;
    jwtSigner;
    expiresIn;
    codeExpiresIn;
    constructor(clientStore, loginPagePath, codeStore, jwtSigner, expiresIn, codeExpiresIn) {
        this.clientStore = clientStore;
        this.loginPagePath = loginPagePath;
        this.codeStore = codeStore;
        this.jwtSigner = jwtSigner;
        this.expiresIn = expiresIn;
        this.codeExpiresIn = codeExpiresIn;
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
            expireAt: new Date(Date.now() + this.codeExpiresIn * 1000),
            consumedAt: null,
        });
        const url = new URL(q.redirect_uri);
        url.searchParams.set("code", code);
        if (q.state)
            url.searchParams.set("state", q.state);
        return { url: url.toString() };
    }
    async exchangeCode(data) {
        const codeClient = await this.codeStore.findByCode(data.code);
        if (!codeClient) {
            throw oauth_error_1.Errors.invalidGrant("code does not exist");
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
                throw oauth_error_1.Errors.invalidClient("client has no secret");
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
        if (!(await this.codeStore.consumeCode(codeClient.code))) {
            throw oauth_error_1.Errors.invalidGrant("code already consumed");
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
};
exports.StampService = StampService;
exports.StampService = StampService = __decorate([
    (0, common_1.Injectable)(),
    __param(0, (0, common_1.Inject)(interfaces_1.SIGNET_CLIENT_STORE)),
    __param(1, (0, common_1.Inject)(interfaces_1.SIGNET_LOGIN_PAGE_PATH)),
    __param(2, (0, common_1.Inject)(interfaces_1.CODE_CLIENT_STORE)),
    __param(3, (0, common_1.Inject)(interfaces_1.JWT_SIGNER)),
    __param(4, (0, common_1.Inject)(interfaces_1.SIGNET_TOKEN_EXPIRES_IN)),
    __param(5, (0, common_1.Inject)(interfaces_1.SIGNET_CODE_EXPIRES_IN)),
    __metadata("design:paramtypes", [Object, String, Object, Object, Number, Number])
], StampService);
//# sourceMappingURL=stamp.service.js.map