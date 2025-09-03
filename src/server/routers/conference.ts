import { sendNotification } from "@/lib/notification";
import {
  userProcedure,
  router,
  protectedProcedure,
  adminProcedure,
  chairProcedure,
} from "../trpc";
import { z } from "zod";
import { TRPCError } from "@trpc/server";
type ResearchAreas = Record<string, string[]>;
import DOMPurify from "isomorphic-dompurify";

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
        status: true,
        locationCity: true,
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
  // TODO: change this so it's more secure
  getConference: protectedProcedure
    .input(z.string())
    .query(async ({ input, ctx }) => {
      const conference = await ctx.prisma.conference.findUnique({
        where: { id: input, isDeleted: false },
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
          submissionDeadline: true,
          cameraReadyDeadline: true,
          status: true,
          researchAreas: true,
          isPublic: true,
          conferenceRoles: {
            include: {
              user: {
                select: {
                  id: true,
                  firstName: true,
                  lastName: true,
                  email: true,
                },
              },
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

      // Find the main chair from the roles
      const mainChair = conference.conferenceRoles.find(
        (role) => role.role === "MAIN_CHAIR"
      )?.user;

      // Transform the response to match the existing structure
      return {
        ...conference,
        mainChairId: mainChair?.id,
        mainChair,
      };
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
          conferenceRoles: {
            where: { role: "MAIN_CHAIR" },
            include: {
              user: {
                select: {
                  id: true,
                  email: true,
                },
              },
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

      const mainChair = conference.conferenceRoles[0]?.user;
      if (mainChair) {
        sendNotification(
          mainChair,
          "Conference Request Approved",
          `Your request to create the conference ${conference.title}(${conference.acronym}) has been approved.
        You can now manage the conference and start inviting reviewers and participants.`
        );
      }

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
          conferenceRoles: {
            where: { role: "MAIN_CHAIR" },
            include: {
              user: {
                select: {
                  id: true,
                  email: true,
                },
              },
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

      const mainChair = conference.conferenceRoles[0]?.user;
      if (mainChair) {
        sendNotification(
          mainChair,
          "Conference Request Rejected",
          `Your request to create the conference ${conference.title}(${conference.acronym}) has been rejected by a Conflow Admin.
        You can contact an admin to ask why this is the case.`
        );
      }

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
      input.callForPapers = DOMPurify.sanitize(input.callForPapers);

      if (
        !(
          input.submissionDeadline < input.cameraReadyDeadline &&
          input.cameraReadyDeadline < input.startDate &&
          input.startDate < input.endDate
        )
      ) {
        throw new TRPCError({
          code: "BAD_REQUEST",
          message:
            "Dates are not in the correct order: submissionDeadline, cameraReadyDeadline, startDate, endDate must be in ascending order.",
        });
      }

      // Create the conference first
      const conferenceRequest = await ctx.prisma.conference.create({
        data: {
          ...input,
        },
      });

      // Create the MAIN_CHAIR role entry for the creator
      await ctx.prisma.conferenceRoleEntries.create({
        data: {
          userId: ctx.session.user.id,
          conferenceId: conferenceRequest.id,
          role: "MAIN_CHAIR",
        },
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
        where: {
          isDeleted: false,
          status: { not: "PENDING" },
          conferenceRoles: {
            some: {
              userId: input,
              role: "MAIN_CHAIR",
            },
          },
        },
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
          submissionDeadline: true,
          cameraReadyDeadline: true,
          status: true,
          researchAreas: true,
          isPublic: true,
          conferenceRoles: {
            where: { role: "MAIN_CHAIR" },
            include: {
              user: {
                select: {
                  id: true,
                  firstName: true,
                  lastName: true,
                  email: true,
                },
              },
            },
          },
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

      // First, get the existing conference data including dates and permissions
      const existingConference = await ctx.prisma.conference.findUnique({
        where: { id },
        select: {
          submissionDeadline: true,
          cameraReadyDeadline: true,
          startDate: true,
          endDate: true,
          conferenceRoles: {
            where: { role: "MAIN_CHAIR" },
            select: { userId: true },
          },
        },
      });

      if (!existingConference) {
        throw new TRPCError({
          code: "NOT_FOUND",
          message: "Conference not found",
        });
      }

      // Merge existing data with update data for validation
      const finalData = {
        submissionDeadline:
          updateData.submissionDeadline ||
          existingConference.submissionDeadline,
        cameraReadyDeadline:
          updateData.cameraReadyDeadline ||
          existingConference.cameraReadyDeadline,
        startDate: updateData.startDate || existingConference.startDate,
        endDate: updateData.endDate || existingConference.endDate,
      };

      // Validate the final merged dates
      if (
        !(
          finalData.submissionDeadline < finalData.cameraReadyDeadline &&
          finalData.cameraReadyDeadline < finalData.startDate &&
          finalData.startDate < finalData.endDate
        )
      ) {
        throw new TRPCError({
          code: "BAD_REQUEST",
          message:
            "Dates are not in the correct order: submissionDeadline, cameraReadyDeadline, startDate, endDate must be in ascending order.",
        });
      }

      // Check permissions
      const isMainChair = existingConference.conferenceRoles.some(
        (role) => role.userId === ctx.session.user.id
      );
      const isAdmin = ctx.session.user.role === "ADMIN";

      if (!isMainChair && !isAdmin) {
        throw new TRPCError({
          code: "FORBIDDEN",
          message: "You don't have permission to edit this conference",
        });
      }

      // Sanitize call for papers if it's being updated
      if (updateData.callForPapers) {
        updateData.callForPapers = DOMPurify.sanitize(updateData.callForPapers);
      }

      return ctx.prisma.conference.update({
        where: { id },
        data: updateData,
      });
    }),
  getAreas: userProcedure.input(z.string()).query(async ({ ctx, input }) => {
    const conference = await ctx.prisma.conference.findUnique({
      where: { id: input },
      select: {
        researchAreas: true,
      },
    });

    if (!conference) {
      throw new TRPCError({
        code: "NOT_FOUND",
        message: "Conference not found",
      });
    }

    return conference.researchAreas as ResearchAreas;
  }),
  getConferenceRoles: userProcedure.query(async ({ ctx }) => {
    const roles = await ctx.prisma.conferenceRoleEntries.findMany({
      where: { userId: ctx.session.user.id },
      select: {
        role: true,
        conference: {
          select: {
            id: true,
            title: true,
            acronym: true,
          },
        },
      },
      orderBy: {
        createdAt: "desc",
      },
    });

    const authorEntries = await ctx.prisma.submissionAuthor.findMany({
      where: { userId: ctx.session.user.id },
      select: {
        submission: {
          select: {
            conference: {
              select: {
                id: true,
                title: true,
                acronym: true,
              },
            },
          },
        },
      },
    });

    console.log("Author Entries:", authorEntries.length);

    const authorRoles = authorEntries.map((entry) => ({
      role: "AUTHOR",
      conferenceId: entry.submission.conference.id,
      conferenceTitle: entry.submission.conference.title,
      conferenceAcronym: entry.submission.conference.acronym,
    }));

    const conferenceRoles = roles.map((role) => ({
      role: role.role,
      conferenceId: role.conference.id,
      conferenceTitle: role.conference.title,
      conferenceAcronym: role.conference.acronym,
    }));

    return [...conferenceRoles, ...authorRoles];
  }),
  getRecentConferenceRoles: userProcedure.query(async ({ ctx }) => {
    const roles = await ctx.prisma.conferenceRoleEntries.findMany({
      where: { userId: ctx.session.user.id },
      select: {
        role: true,
        conference: {
          select: {
            id: true,
            title: true,
            acronym: true,
          },
        },
      },
      orderBy: {
        createdAt: "desc",
      },
      take: 5, // Limit to the most recent 5 roles
    });

    const authorEntries = await ctx.prisma.submissionAuthor.findMany({
      where: { userId: ctx.session.user.id },
      select: {
        submission: {
          select: {
            conference: {
              select: {
                id: true,
                title: true,
                acronym: true,
              },
            },
          },
        },
      },
      orderBy: {
        createdAt: "desc",
      },
      take: 5, // Limit to the most recent 5 author roles
    });

    const authorRoles = authorEntries.map((entry) => ({
      role: "AUTHOR",
      conferenceId: entry.submission.conference.id,
      conferenceTitle: entry.submission.conference.title,
      conferenceAcronym: entry.submission.conference.acronym,
    }));

    const conferenceRoles = roles.map((role) => ({
      role: role.role,
      conferenceId: role.conference.id,
      conferenceTitle: role.conference.title,
      conferenceAcronym: role.conference.acronym,
    }));

    return [...conferenceRoles, ...authorRoles];
  }),
  addConferenceRole: userProcedure
    .input(
      z.object({
        conferenceId: z.string(),
        userId: z.string(),
        role: z.enum(["CHAIR", "REVIEWER"]), // Main chair can't be added this way
      })
    )
    .mutation(async ({ input, ctx }) => {
      // Check if user is main chair or admin
      const conference = await ctx.prisma.conference.findUnique({
        where: { id: input.conferenceId },
        select: {
          conferenceRoles: {
            where: { role: "MAIN_CHAIR" },
            select: { userId: true },
          },
        },
      });

      if (!conference) {
        throw new TRPCError({
          code: "NOT_FOUND",
          message: "Conference not found",
        });
      }

      const isMainChair = conference.conferenceRoles.some(
        (role) => role.userId === ctx.session.user.id
      );
      const isAdmin = ctx.session.user.role === "ADMIN";

      if (!isMainChair && !isAdmin) {
        throw new TRPCError({
          code: "FORBIDDEN",
          message: "You don't have permission to manage conference roles",
        });
      }

      return ctx.prisma.conferenceRoleEntries.create({
        data: {
          userId: input.userId,
          conferenceId: input.conferenceId,
          role: input.role,
        },
      });
    }),

  removeConferenceRole: userProcedure
    .input(
      z.object({
        conferenceId: z.string(),
        userId: z.string(),
        role: z.enum(["CHAIR", "REVIEWER"]), // Main chair can't be removed this way
      })
    )
    .mutation(async ({ input, ctx }) => {
      // Check permissions similar to addConferenceRole
      const conference = await ctx.prisma.conference.findUnique({
        where: { id: input.conferenceId },
        select: {
          conferenceRoles: {
            where: { role: "MAIN_CHAIR" },
            select: { userId: true },
          },
        },
      });

      if (!conference) {
        throw new TRPCError({
          code: "NOT_FOUND",
          message: "Conference not found",
        });
      }

      const isMainChair = conference.conferenceRoles.some(
        (role) => role.userId === ctx.session.user.id
      );
      const isAdmin = ctx.session.user.role === "ADMIN";

      if (!isMainChair && !isAdmin) {
        throw new TRPCError({
          code: "FORBIDDEN",
          message: "You don't have permission to manage conference roles",
        });
      }

      return ctx.prisma.conferenceRoleEntries.deleteMany({
        where: {
          userId: input.userId,
          conferenceId: input.conferenceId,
          role: input.role,
        },
      });
    }),
  getConferenceInvitees: chairProcedure
    .input(
      z.object({
        conferenceId: z.string(),
      })
    )
    .query(async ({ ctx, input }) => {
      const { conferenceId } = input;

      const invitees = await ctx.prisma.conferenceRoleEntries.findMany({
        where: { conferenceId },
        select: {
          user: {
            select: {
              id: true,
              firstName: true,
              lastName: true,
              email: true,
              country: true,
              affiliation: true,
            },
          },
          role: true,
        },
      });

      return invitees || [];
    }),
});
