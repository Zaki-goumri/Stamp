"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.Errors = exports.OAuthError = void 0;
const common_1 = require("@nestjs/common");
class OAuthError extends common_1.HttpException {
    constructor(error, description, status = common_1.HttpStatus.BAD_REQUEST) {
        super({ error, error_description: description }, status);
    }
}
exports.OAuthError = OAuthError;
exports.Errors = {
    invalidClient: (d) => new OAuthError("invalid_client", d),
    invalidGrant: (d) => new OAuthError("invalid_grant", d),
    invalidRequest: (d) => new OAuthError("invalid_request", d),
    unsupportedGrantType: () => new OAuthError("unsupported_grant_type"),
};
//# sourceMappingURL=oauth-error.js.map