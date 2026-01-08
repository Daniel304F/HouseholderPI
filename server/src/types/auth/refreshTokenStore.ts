export interface RefreshTokenStore {
  token: string;
  userId: string;
  expiresAt: Date;
}
