import { TRPCError } from "@trpc/server";
import { userProcedure, router } from "../trpc";
import { z } from "zod";
export const userRouter = router({
  getAll: userProcedure.query(async ({ ctx }) => {
    const users = await ctx.prisma.user.findMany({
      select: {
        id: true,
        firstName: true,
        lastName: true,
        email: true,
        country: true,
        affiliation: true,
      },
    });
    return users;
  }),
  getProfile: userProcedure.query(async ({ ctx }) => {
    const user = await ctx.prisma.user.findUnique({
      where: { id: ctx.session.user.id },
      select: {
        id: true,
        firstName: true,
        lastName: true,
        email: true,
        country: true,
        affiliation: true,
        isVerified: true,
        createdAt: true,
      },
    });

    if (!user) {
      throw new TRPCError({
        code: "NOT_FOUND",
        message: "User not found",
      });
    }

    return user;
  }),

  updateProfile: userProcedure
    .input(
      z.object({
        firstName: z.string().optional(),
        lastName: z.string().optional(),
        country: z.string().optional(),
        affiliation: z.string().optional(),
      })
    )
    .mutation(async ({ input, ctx }) => {
      const updatedUser = await ctx.prisma.user.update({
        where: { id: ctx.session.user.id },
        data: input,
        select: {
          id: true,
          firstName: true,
          lastName: true,
          email: true,
          country: true,
          affiliation: true,
          isVerified: true,
        },
      });

      return updatedUser;
    }),
  getParticipantUsers: userProcedure.input(
    z.object({
      conferenceId: z.string(),
    })
  ).query(async ({ input, ctx }) => {
    const { conferenceId } = input;
    const usersWithRoles = await ctx.prisma.conferenceRoleEntries.findMany({
      where: { conferenceId },
      select: { userId: true },
    });

    const submissionAuthors = await ctx.prisma.submissionAuthor.findMany({
      where: {
        submission: {
          conferenceId,
        },
        userId: { not: null },
      },
      select: { userId: true },
    });

    const excludedUserIds = [
      ...new Set([
        ...usersWithRoles.map((entry) => entry.userId),
        ...submissionAuthors.map((author) => author.userId!),
      ]),
    ];

    const availableUsers = await ctx.prisma.user.findMany({
      where: {
        id: {
          notIn: excludedUserIds,
        },
        role : {not: "ADMIN"}, 
      },
      select: {
        id: true,
        firstName: true,
        lastName: true,
        email: true,
        affiliation: true,
        country: true,
        isVerified: true,
        role: true,
      },
    });

    return availableUsers;
  }),
});
