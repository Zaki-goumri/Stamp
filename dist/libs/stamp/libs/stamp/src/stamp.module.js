"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var StampModule_1;
Object.defineProperty(exports, "__esModule", { value: true });
exports.StampModule = void 0;
const common_1 = require("@nestjs/common");
const stamp_service_1 = require("./stamp.service");
const signet_module_options_interface_1 = require("./interfaces/signet-module-options.interface");
const signet_clients_store_interface_1 = require("./interfaces/signet-clients.store.interface");
const stamp_controller_1 = require("./stamp.controller");
let StampModule = StampModule_1 = class StampModule {
    static forRootAsync(options) {
        return {
            module: StampModule_1,
            imports: options.imports ?? [],
            providers: [
                {
                    provide: signet_module_options_interface_1.SIGNET_USER_ID_RESOLVER,
                    useValue: options.resolveUserId ?? ((req) => req.user?.id),
                },
                {
                    provide: signet_clients_store_interface_1.SIGNET_CLIENT_STORE,
                    useExisting: options.clientStore,
                },
                {
                    provide: signet_clients_store_interface_1.CODE_CLIENT_STORE,
                    useExisting: options.codeStore,
                },
                {
                    provide: signet_module_options_interface_1.SIGNET_LOGIN_PAGE_PATH,
                    useValue: options.loginPagePath,
                },
                {
                    provide: signet_clients_store_interface_1.JWT_SIGNER,
                    useExisting: options.jwtSigner,
                },
                {
                    provide: signet_module_options_interface_1.SIGNET_TOKEN_EXPIRES_IN,
                    useValue: options.expiresIn ?? signet_module_options_interface_1.DEFAULT_TOKEN_EXPIRES_IN,
                },
                {
                    provide: signet_module_options_interface_1.SIGNET_CODE_EXPIRES_IN,
                    useValue: options.codeExpiresIn ?? signet_module_options_interface_1.DEFAULT_CODE_EXPIRES_IN,
                },
                stamp_service_1.StampService,
            ],
            exports: [stamp_service_1.StampService],
        };
    }
};
exports.StampModule = StampModule;
exports.StampModule = StampModule = StampModule_1 = __decorate([
    (0, common_1.Module)({
        controllers: [stamp_controller_1.StampController],
    })
], StampModule);
//# sourceMappingURL=stamp.module.js.map