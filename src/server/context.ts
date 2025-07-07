import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

import type { SessionUser } from "@/types/next-auth";

export interface Context {
  session: {
    user: SessionUser;
  } | null;
  prisma: typeof prisma;
}

export const createContext = async (): Promise<Context> => {
  const session = await auth();

  return {
    session: session?.user
      ? {
          user: session.user as SessionUser,
        }
      : null,
    prisma,
  };
};