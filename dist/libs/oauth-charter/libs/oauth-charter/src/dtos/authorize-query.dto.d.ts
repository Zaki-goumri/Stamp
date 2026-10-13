export declare class AuthorizeQueryDto {
    response_type: string;
    client_id: string;
    redirect_uri: string;
    scope?: string;
    state?: string;
    code_challenge: string;
    code_challenge_method: string;
}
