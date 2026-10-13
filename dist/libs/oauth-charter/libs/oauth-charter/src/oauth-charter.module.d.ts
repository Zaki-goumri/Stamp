import { DynamicModule } from "@nestjs/common";
import { SignetModuleAsyncOptions } from "./interfaces/signet-module-options.interface";
export declare class OauthCharterModule {
    static forRootAsync(options: SignetModuleAsyncOptions): DynamicModule;
}
