import { CodeStore, JwtSigner, SignetClientsStore } from "./interfaces";
import { AuthorizeQueryDto, TokenBodyDto } from "./dtos";
export type TokenResponse = {
    access_token: string;
    token_type: "Bearer";
    expires_in: number;
    scope?: string;
};
export declare class StampService {
    private readonly clientStore;
    private readonly loginPagePath;
    private readonly codeStore;
    private readonly jwtSigner;
    private readonly expiresIn;
    private readonly codeExpiresIn;
    constructor(clientStore: SignetClientsStore, loginPagePath: string, codeStore: CodeStore, jwtSigner: JwtSigner, expiresIn: number, codeExpiresIn: number);
    handleRequest(q: AuthorizeQueryDto, userId: string): Promise<{
        url: string;
    }>;
    exchangeCode(data: TokenBodyDto): Promise<TokenResponse>;
    getLoginPagePath(): string;
}
