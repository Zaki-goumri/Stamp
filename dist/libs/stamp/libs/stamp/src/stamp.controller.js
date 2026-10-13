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
exports.StampController = void 0;
const common_1 = require("@nestjs/common");
const authorize_query_dto_1 = require("./dtos/authorize-query.dto");
const stamp_service_1 = require("./stamp.service");
const token_body_dto_1 = require("./dtos/token-body.dto");
const oauth_error_1 = require("./oauth-error");
const interfaces_1 = require("./interfaces");
let StampController = class StampController {
    stampService;
    userIdResovler;
    constructor(stampService, userIdResovler) {
        this.stampService = stampService;
        this.userIdResovler = userIdResovler;
    }
    async handleAuthorize(q, req, res) {
        const userId = await this.userIdResovler(req);
        if (!userId)
            return res.redirect(`${this.stampService.getLoginPagePath()}?${new URLSearchParams(q)}`);
        const { url } = await this.stampService.handleRequest(q, userId);
        return res.redirect(url);
    }
    async token(body, res) {
        if (body.grant_type !== "authorization_code")
            throw oauth_error_1.Errors.unsupportedGrantType();
        res.setHeader("Cache-Control", "no-store");
        res.setHeader("Pragma", "no-cache");
        return this.stampService.exchangeCode(body);
    }
};
exports.StampController = StampController;
__decorate([
    (0, common_1.Get)("/authorize"),
    __param(0, (0, common_1.Query)()),
    __param(1, (0, common_1.Req)()),
    __param(2, (0, common_1.Res)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [authorize_query_dto_1.AuthorizeQueryDto, Object, Object]),
    __metadata("design:returntype", Promise)
], StampController.prototype, "handleAuthorize", null);
__decorate([
    (0, common_1.Post)("/token"),
    (0, common_1.HttpCode)(200),
    __param(0, (0, common_1.Body)()),
    __param(1, (0, common_1.Res)({ passthrough: true })),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [token_body_dto_1.TokenBodyDto, Object]),
    __metadata("design:returntype", Promise)
], StampController.prototype, "token", null);
exports.StampController = StampController = __decorate([
    (0, common_1.Controller)(),
    __param(1, (0, common_1.Inject)(interfaces_1.SIGNET_USER_ID_RESOLVER)),
    __metadata("design:paramtypes", [stamp_service_1.StampService, Function])
], StampController);
//# sourceMappingURL=stamp.controller.js.map