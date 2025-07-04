import NextAuth from "next-auth";
import Credentials from "next-auth/providers/credentials";
import { verifyPassword } from "./hash";
import { prisma } from "./prisma";
interface SessionUser {
  id: string;
  email: string;
  name: string;
  isVerified: boolean;
  emailVerified: Date | null;
}

export const { handlers, signIn, signOut, auth } = NextAuth({
  providers: [
    Credentials({
      name: "Credentials",
      credentials: {
        email: { label: "Email", type: "email" },
        password: { label: "Password", type: "password" },
      },
      authorize: async (credentials):Promise<SessionUser | null> => {
        const { email, password } = credentials as {
          email: string;
          password: string;
        };

        if (!email || !password) return null;

        const user = await prisma.user.findUnique({
          where: { email },
          select: {
            id: true,
            email: true,
            firstName: true,
            lastName: true,
            password: true,
            isVerified: true,
          },
        });

        if (!user) return null;

        const isValid = await verifyPassword(password, user.password);
        if (!isValid) return null;

        return {
          id: user.id,
          email: user.email,
          name: `${user.firstName} ${user.lastName}`,
          isVerified: user.isVerified,
          emailVerified: null,
        };
      },
    }),
  ],
  session: {
    strategy: "jwt",
    maxAge: 30 * 24 * 60 * 60, // 30 days
  },
  jwt: {
    // Optionally, you can add custom encode/decode logic here
  },
  secret: process.env.AUTH_SECRET,
  pages: {
    signIn: "/(marketing)/(auth)/sign-in", 
    error: "/(marketing)/(auth)/sign-in", 
  },
  callbacks: {
    async jwt({ token, user }) {
      if (user) {
        token.user = user as SessionUser;
      }
      return token;
    },
    async session({ session, token }) {
      session.user = token.user as SessionUser;
      return session;
    },
  },
});
