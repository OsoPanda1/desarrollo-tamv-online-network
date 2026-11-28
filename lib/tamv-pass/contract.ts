import type { JWTPayload } from "jose";

export const TAMV_PASS_TOKEN_TTL_SECONDS = 180;
export const TAMV_PASS_SUPPORTED_SCOPES = ["profile:read", "tamv:read"] as const;
export const TAMV_PASS_TOKEN_TYPE = "tamv-pass+jwt";
export const TAMV_PASS_TOKEN_PURPOSE = "tamv_pass";
export const TAMV_PASS_SIGNING_ALGORITHM = "RS256";
export const TAMV_PASS_ROLES = ["member", "moderator", "admin"] as const;

export type TamvPassScope = (typeof TAMV_PASS_SUPPORTED_SCOPES)[number];
export type TamvPassRole = (typeof TAMV_PASS_ROLES)[number];

export interface TamvPassClaims extends JWTPayload {
  sub: string;
  token_use: typeof TAMV_PASS_TOKEN_PURPOSE;
  tamv_version: 1;
  scope: string;
  name?: string;
  email?: string;
  email_verified?: boolean;
  tamv_role?: TamvPassRole;
}

export function isTamvPassRole(value: unknown): value is TamvPassRole {
  return typeof value === "string" && (TAMV_PASS_ROLES as readonly string[]).includes(value);
}
