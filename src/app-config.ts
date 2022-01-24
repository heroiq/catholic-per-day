export interface AppConfig {
  auth: AuthConfig;
}

export interface AuthConfig {
  accessToken?: string;
  codeVerifier?: string;
  refreshToken?: string;
  state?: string;
}
