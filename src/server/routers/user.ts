import { TRPCError } from "@trpc/server";
import { userProcedure, router } from "../trpc";
import { z } from "zod";
import { UserRole } from "@prisma/client";
export const userRouter = router({
  getUsersByEmail: userProcedure
    .input(z.object({ email: z.string().email() }))
    .query(async ({ input, ctx }) => {
      const user = await ctx.prisma.user.findMany({
        where: {
          role: UserRole.USER,
          email: input.email,
        },
        select: {
          id: true,
          firstName: true,
          lastName: true,
          email: true,
          country: true,
          affiliation: true,
        },
      });
      return user;
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
  getParticipantUsers: userProcedure
    .input(
      z.object({
        conferenceId: z.string(),
        email: z.string().email(),
      })
    )
    .query(async ({ input, ctx }) => {
      const { conferenceId } = input;

      // Get conference data
      const conference = await ctx.prisma.conference.findUniqueOrThrow({
        where: { id: conferenceId },
        select: {
          id: true,
          title: true,
          acronym: true,
        },
      });

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
          email: input.email,
          role: { not: "ADMIN" },
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

      return {
        conference,
        users: availableUsers,
      };
    }),
});
