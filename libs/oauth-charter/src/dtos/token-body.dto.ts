import { Equals, IsOptional, IsString } from "class-validator";

export class TokenBodyDto {
  @Equals("authorization_code")
  grant_type: string;
  @IsString()
  code: string;
  @IsString()
  redirect_uri: string;
  @IsString()
  client_id: string;
  @IsOptional()
  @IsString()
  client_secret?: string; // if type confidential
  @IsString()
  code_verifier: string; // in PKCE it's required
}
