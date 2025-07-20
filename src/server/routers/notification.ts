import { TRPCError } from "@trpc/server";
import { protectedProcedure, router } from "../trpc";
import { z } from "zod";
import { sendNotification, sendInviteNotification } from "@/lib/notification";

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

  sendNotification: protectedProcedure
    .input(
      z.object({
        userId: z.string(),
        title: z.string().min(1, "Title is required"),
        message: z.string().min(1, "Message is required"),
      })
    )
    .mutation(async ({ input, ctx }) => {
      const { userId, title, message } = input;

      const targetUser = await ctx.prisma.user.findUnique({
        where: { id: userId },
        select: { id: true, email: true },
      });

      if (!targetUser) {
        throw new TRPCError({
          code: "NOT_FOUND",
          message: "User not found",
        });
      }

      try {
        const notification = await sendNotification(targetUser, title, message);
        return {
          success: true,
          notificationId: notification.id,
        };
      } catch (error) {
        console.error("Failed to send notification:", error);
        throw new TRPCError({
          code: "INTERNAL_SERVER_ERROR",
          message: "Failed to send notification",
        });
      }
    }),

  sendInviteNotification: protectedProcedure
    .input(
      z.object({
        userId: z.string(),
        title: z.string().min(1, "Title is required"),
        message: z.string().min(1, "Message is required"),
        conferenceId: z.string().optional(),
        role: z.string().optional(),
      })
    )
    .mutation(async ({ input, ctx }) => {
      const { userId, title, message, conferenceId, role } = input;

      // Check if the target user exists
      const targetUser = await ctx.prisma.user.findUnique({
        where: { id: userId },
        select: { id: true, email: true },
      });

      if (!targetUser) {
        throw new TRPCError({
          code: "NOT_FOUND",
          message: "User not found",
        });
      }

      try {
        const notification = await sendInviteNotification(
          targetUser,
          title,
          message,
          conferenceId,
          role
        );
        return {
          success: true,
          notificationId: notification.id,
        };
      } catch (error) {
        console.error("Failed to send invite notification:", error);
        throw new TRPCError({
          code: "INTERNAL_SERVER_ERROR",
          message: "Failed to send invite notification",
        });
      }
    }),

  respondToInvitation: protectedProcedure
    .input(
      z.object({
        notificationId: z.string(),
        response: z.enum(["ACCEPTED", "REFUSED"]),
      })
    )
    .mutation(async ({ input, ctx }) => {
      const { notificationId, response } = input;

      const notification = await ctx.prisma.notification.findUnique({
        where: { id: notificationId },
      });

      if (!notification) {
        throw new TRPCError({
          code: "NOT_FOUND",
          message: "Notification not found",
        });
      }

      if (notification.userId !== ctx.session.user.id) {
        throw new TRPCError({
          code: "FORBIDDEN",
          message: "You don't have permission to respond to this notification",
        });
      }

      try {
        const invitationData = JSON.parse(notification.message);

        if (invitationData.type !== "INVITATION") {
          throw new TRPCError({
            code: "BAD_REQUEST",
            message: "This is not an invitation notification",
          });
        }

        invitationData.status = response;

        const updatedNotification = await ctx.prisma.notification.update({
          where: { id: notificationId },
          data: {
            message: JSON.stringify(invitationData),
            isRead: true,
          },
        });

        if (
          response === "ACCEPTED" &&
          invitationData.conferenceId &&
          invitationData.role
        ) {
          const conferenceRole = invitationData.role.toUpperCase();

          await ctx.prisma.conferenceRoleEntries.create({
            data: {
              userId: ctx.session.user.id,
              conferenceId: invitationData.conferenceId,
              role: conferenceRole as "MAIN_CHAIR" | "CHAIR" | "REVIEWER",
            },
          });
        }

        return {
          success: true,
          response,
          notificationId: updatedNotification.id,
        };
      } catch {
        throw new TRPCError({
          code: "BAD_REQUEST",
          message: "Invalid invitation data format",
        });
      }
    }),
});
