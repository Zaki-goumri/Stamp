import { AuthorizeQueryDto } from "./dtos/authorize-query.dto";
import { OauthCharterService } from "./oauth-charter.service";
import type { Request, Response } from "express";
import { TokenBodyDto } from "./dtos/token-body.dto";
import { UserIdResolver } from "./interfaces";
export declare class OauthCharterController {
    private readonly oauthCharterService;
    private readonly userIdResovler;
    constructor(oauthCharterService: OauthCharterService, userIdResovler: UserIdResolver);
    handleAuthorize(q: AuthorizeQueryDto, req: Request, res: Response): Promise<void>;
    token(body: TokenBodyDto, res: Response): Promise<import("./oauth-charter.service").TokenResponse>;
    renderLoginPage(): string;
}
