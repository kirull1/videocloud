export interface User {
  id: string;
  username: string;
  avatarUrl?: string;
}

export interface jwtUser {
  exp: number;
  iat: number;
  sub: string; 
  username: string;
}
