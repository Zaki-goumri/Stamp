import {
  Body,
  Controller,
  Get,
  Header,
  HttpCode,
  Post,
  Query,
  Req,
  Res,
  Inject,
} from "@nestjs/common";
import { AuthorizeQueryDto } from "./dtos/authorize-query.dto";
import { OauthCharterService } from "./oauth-charter.service";
import type { Request, Response } from "express";
import { TokenBodyDto } from "./dtos/token-body.dto";
import { Errors } from "./oauth-error";
import { SIGNET_USER_ID_RESOLVER, UserIdResolver } from "./interfaces";

@Controller()
export class OauthCharterController {
  constructor(
    private readonly oauthCharterService: OauthCharterService,
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
        `${this.oauthCharterService.renderLoginPage()}?${new URLSearchParams(q as any)}`,
      );
    const { url } = await this.oauthCharterService.handleRequest(q, userId);
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
    return this.oauthCharterService.exchangeCode(body);
  }

  @Get("login")
  @Header("Content-Type", "text/html")
  renderLoginPage(): string {
    return this.oauthCharterService.renderLoginPage();
  }
}
