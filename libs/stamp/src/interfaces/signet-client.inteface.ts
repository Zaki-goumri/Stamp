export type SignetClientType = "public" | "confidential";
export interface SignetClient {
  clientId: string;
  clientSecretHash: string;
  redirectUris: string[];
  name: string;
  createdAt: Date;
  type: SignetClientType;
}

export interface CreateClientDto extends Omit<
  SignetClient,
  "clientId" | "clientSecretHash" | "createdAt"
> {}

export interface UpdateClientDto extends CreateClientDto {}

export interface CodeClient {
  code: string;
  clientId: string;
  userId: string;
  redirectUri: string;
  code_challenge: string;
  expireAt: Date;
  consumedAt: Date | null;
}
