import type { jwtUser } from "@/entities/user/model/types";
import { getJWT } from "./getJWT";

export const getMe = (token: string = getJWT()): jwtUser => {
  if (!token) throw new Error("Token is required");

  const parts = token.split('.');
  if (parts.length !== 3) throw new Error("Invalid JWT token format");

  const payload = parts[1];

  const base64 = payload.replace(/-/g, '+').replace(/_/g, '/');
  const pad = base64.length % 4 === 0 ? '' : '='.repeat(4 - base64.length % 4);

  try {
    const decodedPayload = atob(base64 + pad);
    return JSON.parse(decodedPayload);
  } catch (e) {
    throw new Error("Failed to parse JWT payload");
  }
}
