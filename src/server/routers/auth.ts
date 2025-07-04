import z from "zod";
import { procedure, router } from "../trpc";
import { TRPCError } from "@trpc/server";
import { prisma } from "@/lib/prisma";
import { hashPassword } from "@/lib/hash";
import jwt from "jsonwebtoken";
import { sendMail } from "@/lib/mail";
const EMAIL_TOKEN_SECRET = process.env.EMAIL_TOKEN_SECRET!;
export const authRouter = router({
  register: procedure
    .input(
      z.object({
        firstName: z.string(),
        lastName: z.string(),
        email: z.string().email(),
        password: z.string(),
        country: z.string(),
        affiliation: z.string(),
      })
    )
    .mutation(async ({ input }) => {
      const existingUser = await prisma.user.findUnique({
        where: { email: input.email },
      });

      if (existingUser) {
        throw new TRPCError({
          code: "CONFLICT",
          message: "Email already in use",
        });
      }

      const hashedPassword = await hashPassword(input.password);

      const user = await prisma.user.create({
        data: {
          firstName: input.firstName,
          lastName: input.lastName,
          email: input.email,
          password: hashedPassword,
          country: input.country,
          affiliation: input.affiliation,
          isAdmin: false,
          isVerified: false,
        },
        select: {
          id: true,
          firstName: true,
          lastName: true,
          email: true,
        },
      });

      return { user };
    }),
  sendVerificationEmail: procedure
    .input(z.object({ email: z.string().email(), from: z.string() }))
    .mutation(async ({ input }) => {
      const token = jwt.sign(
        { email: input.email, type: "email-verification" },
        EMAIL_TOKEN_SECRET!,
        { expiresIn: "15m" }
      );

      await sendMail(input.email, token, input.from);
      return { success: true };
    }),
  verifyEmailToken: procedure
    .input(z.object({ token: z.string() }))
    .mutation(async ({ input }) => {
      try {
        const decoded = jwt.verify(input.token, EMAIL_TOKEN_SECRET!) as {
          email: string;
          type: string;
        };

        if (decoded.type !== "email-verification") {
          throw new Error("Invalid token type.");
        }
        await prisma.user.update({
          where: { email: decoded.email },
          data: { isVerified: true },
        });
        return { success: true };
      } catch (error) {
        console.error("Invalid or expired token", error);
        return { success: false, message: "Invalid or expired token" };
      }
    }),
  resetUserPassword: procedure
    .input(z.object({ userId: z.string(), newPassword: z.string() }))
    .mutation(async ({ input }) => {
      const { userId, newPassword } = input;
      const user = await prisma.user.findUnique({ where: { id : userId } });

      if (!user) {
        throw new TRPCError({
          code: "NOT_FOUND",
          message: "User not found",
        });
      }

      const hashedPassword = await hashPassword(newPassword);

      await prisma.user.update({
        where: { id : userId },
        data: { password: hashedPassword },
      });

      return { success: true };
    }),
  resetPassTokenVerification: procedure
    .input(z.object({ token: z.string() }))
    .mutation(async ({ input }) => {
      try {
        const decoded = jwt.verify(input.token, EMAIL_TOKEN_SECRET!) as {
          userId: string;
          email: string;
          type: string;
        };

        if (decoded.type !== "email-verification") {
          throw new Error("Invalid token type.");
        }
        return { success: true,userId : decoded.userId};
      } catch (error) {
        console.error("Invalid or expired token", error);
        return { success: false, message: "Invalid or expired token",userId : null };
      }
    }),
  sendResetPassRequest: procedure
    .input(z.object({ email: z.string().email(), from: z.string() }))
    .mutation(async ({ input }) => {
      const user = await prisma.user.findUnique({ where: { email : input.email } });

      if (!user) {
        throw new TRPCError({
          code: "NOT_FOUND",
          message: "User not found",
        });
      }
      const token = jwt.sign(
        { userId : user.id,email: input.email, type: "email-verification" },
        EMAIL_TOKEN_SECRET!,
        { expiresIn: "15m" }
      );

      await sendMail(input.email, token, input.from);
      return { success: true };
    }),
});
