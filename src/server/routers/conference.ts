// import { TRPCError } from "@trpc/server};
import { sendNotification } from "@/lib/notification";
import {
  userProcedure,
  router,
  protectedProcedure,
  adminProcedure,
} from "../trpc";
import { z } from "zod";
import { TRPCError } from "@trpc/server";

export const conferenceRouter = router({
  getAllPublicConferences: userProcedure.query(async ({ ctx }) => {
    const conferences = await ctx.prisma.conference.findMany({
      where: {
        status: "APPROVED",
        isDeleted: false,
        isPublic: true,
      },
      select: {
        id: true,
        title: true,
        acronym: true,
        description: true,
        locationCountry: true,
        startDate: true,
        endDate: true,
      },
      orderBy: {
        startDate: "asc",
      },
    });
    return conferences;
  }),
  getAllPendingConferences: adminProcedure.query(async ({ ctx }) => {
    const conferences = await ctx.prisma.conference.findMany({
      where: {
        status: "PENDING",
        isDeleted: false,
      },
      select: {
        id: true,
        title: true,
        acronym: true,
        description: true,
        locationCountry: true,
        startDate: true,
        endDate: true,
      },
      orderBy: {
        createdAt: "desc",
      },
    });
    return conferences;
  }),
  // I want to only get public conferences for users BUT admins can see all conferences...
  getConference: protectedProcedure
    .input(z.string())
    .query(async ({ input, ctx }) => {
      const isAdmin = ctx.session.user.role === "ADMIN";
      const conference = await ctx.prisma.conference.findUnique({
        where: { id: input, isDeleted: false, isPublic: !isAdmin },
        select: {
          id: true,
          title: true,
          acronym: true,
          description: true,
          locationVenue: true,
          locationCity: true,
          locationCountry: true,
          callForPapers: true,
          websiteUrl: true,
          startDate: true,
          endDate: true,
          abstractDeadline: true,
          submissionDeadline: true,
          cameraReadyDeadline: true,
          status: true,
          researchAreas: true,
          mainChairId: isAdmin,
          mainChair: isAdmin && {
            select: {
              id: true,
              firstName: true,
              lastName: true,
              email: true,
            },
          },
          isPublic: isAdmin,
        },
      });

      return conference;
    }),
  approveConference: adminProcedure
    .input(z.string())
    .mutation(async ({ input, ctx }) => {
      const conference = await ctx.prisma.conference.findUnique({
        where: {
          id: input,
        },
        select: {
          status: true,
          title: true,
          acronym: true,
          mainChair: {
            select: {
              id: true,
              email: true,
            },
          },
        },
      });
      if (!conference) {
        throw new TRPCError({
          code: "NOT_FOUND",
          message: "Conference not found",
        });
      }

      if (conference.status != "PENDING") {
        throw new TRPCError({
          code: "BAD_REQUEST",
          message: "Conference is not in pending status",
        });
      }

      const updatedConference = await ctx.prisma.conference.update({
        where: { id: input },
        data: {
          status: "APPROVED",
        },
      });

      sendNotification(
        conference.mainChair,
        "Conference Request Approved",
        `Your request to create the conference ${conference.title}(${conference.acronym}) has been approved.
          You can now manage the conference and start inviting reviewers and participants.`
      );

      return updatedConference;
    }),
  rejectConference: adminProcedure
    .input(z.string())
    .mutation(async ({ input, ctx }) => {
      const conference = await ctx.prisma.conference.findUnique({
        where: {
          id: input,
        },
        select: {
          status: true,
          title: true,
          acronym: true,
          mainChair: {
            select: {
              id: true,
              email: true,
            },
          },
        },
      });
      if (!conference) {
        throw new TRPCError({
          code: "NOT_FOUND",
          message: "Conference not found",
        });
      }

      if (conference.status != "PENDING") {
        throw new TRPCError({
          code: "BAD_REQUEST",
          message: "Conference is not in pending status",
        });
      }

      const updatedConference = await ctx.prisma.conference.update({
        where: { id: input },
        data: {
          status: "REJECTED",
        },
      });

      sendNotification(
        conference.mainChair,
        "Conference Request Rejected",
        `Your request to create the conference ${conference.title}(${conference.acronym}) has been rejected by a Conflow Admin.
          You can contact an admin to ask why this is the case.`
      );

      return updatedConference;
    }),
  createConference: userProcedure
    .input(
      z.object({
        title: z.string().min(1, "Title is required"),
        acronym: z.string().min(1, "Acronym is required"),
        description: z.string().min(1, "Description is required"),
        locationVenue: z.string().min(1, "Venue is required"),
        locationCity: z.string().min(1, "City is required"),
        locationCountry: z.string().min(1, "Country is required"),
        callForPapers: z.string().min(1, "Call for papers is required"),
        websiteUrl: z.string().url().optional().or(z.literal("")),
        startDate: z
          .union([z.date(), z.string()])
          .transform((val) => (typeof val === "string" ? new Date(val) : val)),
        endDate: z
          .union([z.date(), z.string()])
          .transform((val) => (typeof val === "string" ? new Date(val) : val)),
        abstractDeadline: z
          .union([z.date(), z.string()])
          .transform((val) => (typeof val === "string" ? new Date(val) : val)),
        submissionDeadline: z
          .union([z.date(), z.string()])
          .transform((val) => (typeof val === "string" ? new Date(val) : val)),
        cameraReadyDeadline: z
          .union([z.date(), z.string()])
          .transform((val) => (typeof val === "string" ? new Date(val) : val)),
        isPublic: z.boolean().default(false),
        researchAreas: z.record(z.string(), z.array(z.string())),
      })
    )
    .mutation(async ({ input, ctx }) => {
      const conferenceRequest = ctx.prisma.conference.create({
        data: { ...input, mainChairId: ctx.session.user.id },
      });

      const admins = await ctx.prisma.user.findMany({
        where: { role: "ADMIN" },
        select: { id: true, email: true, firstName: true, lastName: true },
      });
      const user = ctx.session.user;
      for (const admin of admins) {
        sendNotification(
          admin,
          "Conference Creation Request",
          `A new conference request has been created by ${user.firstName} ${user.lastName} (${user.email}).
          You can review it in the admin panel.`
        );
      }
      return conferenceRequest;
    }),
  getConferencesByMainChairId: userProcedure
    .input(z.string())
    .query(async ({ ctx, input }) => {
      return ctx.prisma.conference.findMany({
        where: { mainChairId: input, isDeleted: false },
        select: {
          id: true,
          title: true,
          acronym: true,
          description: true,
          locationVenue: true,
          locationCity: true,
          locationCountry: true,
          callForPapers: true,
          websiteUrl: true,
          startDate: true,
          endDate: true,
          abstractDeadline: true,
          submissionDeadline: true,
          cameraReadyDeadline: true,
          status: true,
          researchAreas: true,
          mainChair: true,
          isPublic: true,
        },
      });
    }),
  updateConference: userProcedure
    .input(
      z.object({
        id: z.string(),
        title: z.string().min(1, "Title is required"),
        acronym: z.string().min(1, "Acronym is required"),
        description: z.string().min(1, "Description is required"),
        locationVenue: z.string().min(1, "Venue is required"),
        locationCity: z.string().min(1, "City is required"),
        locationCountry: z.string().min(1, "Country is required"),
        callForPapers: z.string().min(1, "Call for papers is required"),
        websiteUrl: z.string().url().optional().or(z.literal("")),
        startDate: z
          .union([z.date(), z.string()])
          .transform((val) => (typeof val === "string" ? new Date(val) : val)),
        endDate: z
          .union([z.date(), z.string()])
          .transform((val) => (typeof val === "string" ? new Date(val) : val)),
        abstractDeadline: z
          .union([z.date(), z.string()])
          .transform((val) => (typeof val === "string" ? new Date(val) : val)),
        submissionDeadline: z
          .union([z.date(), z.string()])
          .transform((val) => (typeof val === "string" ? new Date(val) : val)),
        cameraReadyDeadline: z
          .union([z.date(), z.string()])
          .transform((val) => (typeof val === "string" ? new Date(val) : val)),
        researchAreas: z.record(z.string(), z.array(z.string())),
        isPublic: z.boolean().optional(),
      })
    )
    .mutation(async ({ input, ctx }) => {
      const { id, ...updateData } = input;

      // Check if user is the main chair or admin
      const conference = await ctx.prisma.conference.findUnique({
        where: { id },
        select: { mainChairId: true },
      });

      if (!conference) {
        throw new TRPCError({
          code: "NOT_FOUND",
          message: "Conference not found",
        });
      }

      const isMainChair = conference.mainChairId === ctx.session.user.id;
      const isAdmin = ctx.session.user.role === "ADMIN";

      if (!isMainChair && !isAdmin) {
        throw new TRPCError({
          code: "FORBIDDEN",
          message: "You don't have permission to edit this conference",
        });
      }

      return ctx.prisma.conference.update({
        where: { id },
        data: updateData,
      });
    }),
});
