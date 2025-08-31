import z from "zod";
import { adminProcedure, procedure, router } from "../trpc";
import { TRPCError } from "@trpc/server";
import { hashPassword, verifyPassword } from "@/lib/hash";
import jwt from "jsonwebtoken";
import { sendPasswordMail, sendVerificationMail } from "@/lib/mail";
import { sendNotification } from "@/lib/notification";
import { passwordValidation } from "@/lib/validations/password";

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
    .mutation(async ({ input, ctx }) => {
      const existingUser = await ctx.prisma.user.findUnique({
        where: { email: input.email },
      });

      if (existingUser) {
        throw new TRPCError({
          code: "CONFLICT",
          message: "Email already in use",
        });
      }

      const hashedPassword = await hashPassword(input.password);

      const user = await ctx.prisma.user.create({
        data: {
          firstName: input.firstName,
          lastName: input.lastName,
          email: input.email,
          password: hashedPassword,
          country: input.country,
          affiliation: input.affiliation,
          isVerified: false,
        },
        select: {
          id: true,
          firstName: true,
          lastName: true,
          email: true,
        },
      });

      await sendNotification(
        user,
        "Welcome to Conflow!",
        "Your account has been created, you will have to verify your email to access all features."
      );

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

      await sendVerificationMail(input.email, token, input.from);
      return { success: true };
    }),

  verifyEmailToken: procedure
    .input(z.object({ token: z.string() }))
    .mutation(async ({ input, ctx }) => {
      try {
        const decoded = jwt.verify(input.token, EMAIL_TOKEN_SECRET!) as {
          email: string;
          type: string;
        };

        if (decoded.type !== "email-verification") {
          throw new Error("Invalid token type.");
        }

        await ctx.prisma.user.update({
          where: { email: decoded.email },
          data: { isVerified: true },
        });

        return { success: true, email: decoded.email };
      } catch (error) {
        console.error("Invalid or expired token", error);
        return {
          success: false,
          message: "Invalid or expired token",
          email: null,
        };
      }
    }),

  resetUserPassword: procedure
    .input(z.object({ userId: z.string(), newPassword: z.string() }))
    .mutation(async ({ input, ctx }) => {
      const { userId, newPassword } = input;

      const user = await ctx.prisma.user.findUnique({
        where: { id: userId },
      });

      if (!user) {
        throw new TRPCError({
          code: "NOT_FOUND",
          message: "User not found",
        });
      }

      const hashedPassword = await hashPassword(newPassword);

      await ctx.prisma.user.update({
        where: { id: userId },
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

        return { success: true, userId: decoded.userId, email: decoded.email };
      } catch (error) {
        console.error("Invalid or expired token", error);
        return {
          success: false,
          message: "Invalid or expired token",
          userId: null,
          email: null,
        };
      }
    }),

  sendResetPassRequest: procedure
    .input(z.object({ email: z.string().email(), from: z.string() }))
    .mutation(async ({ input, ctx }) => {
      const user = await ctx.prisma.user.findUnique({
        where: { email: input.email },
      });

      if (!user) {
        throw new TRPCError({
          code: "NOT_FOUND",
          message: "User not found",
        });
      }

      const token = jwt.sign(
        { userId: user.id, email: input.email, type: "email-verification" },
        EMAIL_TOKEN_SECRET!,
        { expiresIn: "15m" }
      );

      await sendPasswordMail(input.email, token, input.from);
      return { success: true };
    }),

  changePassword: adminProcedure
    .input(
      z.object({
        currentPassword: z.string().min(1, "Current password is required"),
        newPassword: passwordValidation,
      })
    )
    .mutation(async ({ input, ctx }) => {
      const { currentPassword, newPassword } = input;

      const user = await ctx.prisma.user.findUnique({
        where: { id: ctx.session.user.id },
        select: {
          id: true,
          password: true,
        },
      });

      if (!user) {
        throw new TRPCError({
          code: "NOT_FOUND",
          message: "User not found",
        });
      }

      const isCurrentPasswordValid = await verifyPassword(
        currentPassword,
        user.password
      );
      if (!isCurrentPasswordValid) {
        throw new TRPCError({
          code: "UNAUTHORIZED",
          message: "Current password is incorrect",
        });
      }

      const hashedNewPassword = await hashPassword(newPassword);

      await ctx.prisma.user.update({
        where: { id: ctx.session.user.id },
        data: { password: hashedNewPassword },
      });

      return { success: true };
    }),
});
