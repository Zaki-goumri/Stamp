import { AuthorizeQueryDto } from "./dtos/authorize-query.dto";
import { StampService } from "./stamp.service";
import type { Request, Response } from "express";
import { TokenBodyDto } from "./dtos/token-body.dto";
import { UserIdResolver } from "./interfaces";
export declare class StampController {
    private readonly stampService;
    private readonly userIdResovler;
    constructor(stampService: StampService, userIdResovler: UserIdResolver);
    handleAuthorize(q: AuthorizeQueryDto, req: Request, res: Response): Promise<void>;
    token(body: TokenBodyDto, res: Response): Promise<import("./stamp.service").TokenResponse>;
}
