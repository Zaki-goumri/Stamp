import { Equals, IsOptional, IsString } from "class-validator";

export class AuthorizeQueryDto {
  @Equals("code")
  response_type: string;
  @IsString()
  client_id: string;
  @IsString()
  redirect_uri: string;
  @IsOptional()
  @IsString()
  scope?: string;
  @IsOptional()
  @IsString()
  state?: string;
  @IsString()
  code_challenge: string;
  @Equals("S256")
  code_challenge_method: string;
}
