import { HttpException, HttpStatus } from "@nestjs/common";

export class OAuthError extends HttpException {
  constructor(
    error: string,
    description?: string,
    status = HttpStatus.BAD_REQUEST,
  ) {
    super({ error, error_description: description }, status);
  }
}

export const Errors = {
  invalidClient: (d?: string) => new OAuthError("invalid_client", d),
  invalidGrant: (d?: string) => new OAuthError("invalid_grant", d),
  invalidRequest: (d?: string) => new OAuthError("invalid_request", d),
  unsupportedGrantType: () => new OAuthError("unsupported_grant_type"),
};
