import { TRPCError } from "@trpc/server";
import { protectedProcedure, router } from "../trpc";
import { z } from "zod";

export const notificationRouter = router({
  getInbox: protectedProcedure.query(async ({ ctx }) => {
    const inbox = await ctx.prisma.notification.findMany({
      where: {
        userId: ctx.session.user.id,
        isDeleted: false,
      },
      orderBy: {
        createdAt: "desc",
      },
    });

    return inbox;
  }),

  updateNotification: protectedProcedure
    .input(
      z.object({
        id: z.string(),
        isRead: z.boolean().optional(),
        isArchived: z.boolean().optional(),
        isDeleted: z.boolean().optional(),
      })
    )
    .mutation(async ({ input, ctx }) => {
      const { id, isRead, isArchived, isDeleted } = input;

      const notificationExists = await ctx.prisma.notification.findUnique({
        where: { id },
        select: { userId: true },
      });

      if (!notificationExists) {
        throw new TRPCError({
          code: "NOT_FOUND",
          message: "Notification not found",
        });
      }

      if (notificationExists.userId !== ctx.session.user.id) {
        throw new TRPCError({
          code: "FORBIDDEN",
          message: "You don't have permission to update this notification",
        });
      }

      const notification = await ctx.prisma.notification.update({
        where: { id },
        data: {
          isRead,
          isArchived,
          isDeleted,
        },
        select: {
          id: true,
          message: true,
          isRead: true,
          createdAt: true,
        },
      });

      return notification;
    }),
});