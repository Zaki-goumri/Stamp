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
Object.defineProperty(exports, "__esModule", { value: true });
exports.AuthorizeQueryDto = void 0;
const class_validator_1 = require("class-validator");
class AuthorizeQueryDto {
    response_type;
    client_id;
    redirect_uri;
    scope;
    state;
    code_challenge;
    code_challenge_method;
}
exports.AuthorizeQueryDto = AuthorizeQueryDto;
__decorate([
    (0, class_validator_1.Equals)("code"),
    __metadata("design:type", String)
], AuthorizeQueryDto.prototype, "response_type", void 0);
__decorate([
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], AuthorizeQueryDto.prototype, "client_id", void 0);
__decorate([
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], AuthorizeQueryDto.prototype, "redirect_uri", void 0);
__decorate([
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], AuthorizeQueryDto.prototype, "scope", void 0);
__decorate([
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], AuthorizeQueryDto.prototype, "state", void 0);
__decorate([
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], AuthorizeQueryDto.prototype, "code_challenge", void 0);
__decorate([
    (0, class_validator_1.Equals)("S256"),
    __metadata("design:type", String)
], AuthorizeQueryDto.prototype, "code_challenge_method", void 0);
//# sourceMappingURL=authorize-query.dto.js.map