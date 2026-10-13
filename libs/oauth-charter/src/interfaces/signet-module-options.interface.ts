import { ModuleMetadata, Type } from "@nestjs/common";
import {
  CodeStore,
  JwtSigner,
  SignetClientsStore,
} from "./signet-clients.store.interface";

export type UserIdResolver = (
  req: any,
) => string | undefined | Promise<string | undefined>;

export interface SignetModuleAsyncOptions extends Pick<
  ModuleMetadata,
  "imports"
> {
  clientStore: Type<SignetClientsStore>;
  codeStore: Type<CodeStore>;
  jwtSigner: Type<JwtSigner>;
  loginPagePath: string;
  resolveUserId: UserIdResolver;
}

export const SIGNET_LOGIN_PAGE_PATH = Symbol("SIGNET_LOGIN_PAGE_PATH");
export const SIGNET_USER_ID_RESOLVER = Symbol("SIGNET_USER_ID_RESOLVER");
