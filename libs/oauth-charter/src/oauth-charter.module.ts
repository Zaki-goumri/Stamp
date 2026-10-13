import { Module, DynamicModule } from "@nestjs/common";
import { OauthCharterService } from "./oauth-charter.service";
import {
  SIGNET_LOGIN_PAGE_PATH,
  SIGNET_USER_ID_RESOLVER,
  SignetModuleAsyncOptions,
} from "./interfaces/signet-module-options.interface";
import {
  CODE_CLIENT_STORE,
  JWT_SIGNER,
  SIGNET_CLIENT_STORE,
} from "./interfaces/signet-clients.store.interface";
import { OauthCharterController } from "./oauth-charter.controller";

@Module({
  controllers: [OauthCharterController],
})
export class OauthCharterModule {
  static forRootAsync(options: SignetModuleAsyncOptions): DynamicModule {
    return {
      module: OauthCharterModule,
      imports: options.imports ?? [],
      providers: [
        {
          provide: SIGNET_USER_ID_RESOLVER,
          useValue:
            options.resolveUserId ?? ((req: Request) => (req as any).user?.id),
        },
        {
          provide: SIGNET_CLIENT_STORE,
          useExisting: options.clientStore,
        },
        {
          provide: CODE_CLIENT_STORE,
          useExisting: options.codeStore,
        },
        {
          provide: SIGNET_LOGIN_PAGE_PATH,
          useValue: options.loginPagePath,
        },
        {
          provide: JWT_SIGNER,
          useExisting: options.jwtSigner,
        },
        OauthCharterService,
      ],
      exports: [OauthCharterService],
    };
  }
}
