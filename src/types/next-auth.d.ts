import { User } from "@prisma/client";

export type SessionUser = Pick<
  User,
  | "id"
  | "firstName"
  | "lastName"
  | "email"
  | "role"
  | "isVerified"
  | "country"
  | "affiliation"
>;

declare module "next-auth" {
  interface Session {
    user: SessionUser;
  }
}

declare module "next-auth/jwt" {
  interface JWT {
    user: SessionUser;
  }
}
