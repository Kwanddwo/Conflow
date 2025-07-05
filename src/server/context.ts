import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
type SessionUser = {
  id: string;
  email: string;
  name: string;
  isVerified: boolean;
  emailVerified: Date | null;
};

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
