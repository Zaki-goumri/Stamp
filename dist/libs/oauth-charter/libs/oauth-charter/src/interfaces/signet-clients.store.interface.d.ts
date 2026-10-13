import { CodeClient, CreateClientDto, SignetClient, UpdateClientDto } from "./signet-client.inteface";
export interface SignetClientsStore {
    findClientById(clientId: string | number): Promise<SignetClient | null>;
    createClient(data: CreateClientDto): Promise<void>;
    updateClient(data: UpdateClientDto): Promise<void>;
    deleteClient(clientId: string | number): Promise<void>;
    hashClientSecret(clientSecret: string): Promise<string>;
    compareHash(s1: string, s2: string): Promise<boolean>;
}
export declare const SIGNET_CLIENT_STORE: unique symbol;
export interface CodeStore {
    findByCode(code: string): Promise<CodeClient | null>;
    upsertCode(data: Partial<CodeClient>): Promise<void>;
    deleteCode(userId: string | number, code: string): Promise<void>;
}
export declare const CODE_CLIENT_STORE: unique symbol;
export interface JwtSigner {
    getJwtPayload(userId: string | number): Promise<Record<string, unknown>>;
    sign(payload: Record<string, unknown>, ttlSeconds: number): Promise<string>;
}
export declare const JWT_SIGNER: unique symbol;
