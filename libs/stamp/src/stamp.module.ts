import { Module, DynamicModule } from "@nestjs/common";
import { StampService } from "./stamp.service";
import {
  DEFAULT_CODE_EXPIRES_IN,
  DEFAULT_TOKEN_EXPIRES_IN,
  SIGNET_CODE_EXPIRES_IN,
  SIGNET_LOGIN_PAGE_PATH,
  SIGNET_TOKEN_EXPIRES_IN,
  SIGNET_USER_ID_RESOLVER,
  SignetModuleAsyncOptions,
} from "./interfaces/signet-module-options.interface";
import {
  CODE_CLIENT_STORE,
  JWT_SIGNER,
  SIGNET_CLIENT_STORE,
} from "./interfaces/signet-clients.store.interface";
import { StampController } from "./stamp.controller";

@Module({
  controllers: [StampController],
})
export class StampModule {
  static forRootAsync(options: SignetModuleAsyncOptions): DynamicModule {
    return {
      module: StampModule,
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
        {
          provide: SIGNET_TOKEN_EXPIRES_IN,
          useValue: options.expiresIn ?? DEFAULT_TOKEN_EXPIRES_IN,
        },
        {
          provide: SIGNET_CODE_EXPIRES_IN,
          useValue: options.codeExpiresIn ?? DEFAULT_CODE_EXPIRES_IN,
        },
        StampService,
      ],
      exports: [StampService],
    };
  }
}
