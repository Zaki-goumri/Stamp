import {
  Body,
  Controller,
  Get,
  HttpCode,
  Post,
  Query,
  Req,
  Res,
  Inject,
} from "@nestjs/common";
import { AuthorizeQueryDto } from "./dtos/authorize-query.dto";
import { StampService } from "./stamp.service";
import type { Request, Response } from "express";
import { TokenBodyDto } from "./dtos/token-body.dto";
import { Errors } from "./oauth-error";
import { SIGNET_USER_ID_RESOLVER, UserIdResolver } from "./interfaces";

@Controller()
export class StampController {
  constructor(
    private readonly stampService: StampService,
    @Inject(SIGNET_USER_ID_RESOLVER)
    private readonly userIdResovler: UserIdResolver,
  ) {}

  @Get("/authorize")
  async handleAuthorize(
    @Query() q: AuthorizeQueryDto,
    @Req() req: Request,
    @Res() res: Response,
  ) {
    const userId = await this.userIdResovler(req);
    if (!userId)
      return res.redirect(
        `${this.stampService.getLoginPagePath()}?${new URLSearchParams(q as any)}`,
      );
    const { url } = await this.stampService.handleRequest(q, userId);
    return res.redirect(url);
  }

  @Post("/token")
  @HttpCode(200)
  async token(
    @Body() body: TokenBodyDto,
    @Res({ passthrough: true }) res: Response,
  ) {
    if (body.grant_type !== "authorization_code")
      throw Errors.unsupportedGrantType();
    res.setHeader("Cache-Control", "no-store");
    res.setHeader("Pragma", "no-cache");
    return this.stampService.exchangeCode(body);
  }
}
