import { HttpException, HttpStatus } from "@nestjs/common";
export declare class OAuthError extends HttpException {
    constructor(error: string, description?: string, status?: HttpStatus);
}
export declare const Errors: {
    invalidClient: (d?: string) => OAuthError;
    invalidGrant: (d?: string) => OAuthError;
    invalidRequest: (d?: string) => OAuthError;
    unsupportedGrantType: () => OAuthError;
};
