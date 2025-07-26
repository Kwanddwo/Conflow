import { initTRPC, TRPCError } from "@trpc/server";
import { Context } from "./context";
import z from "zod";

const trpc = initTRPC.context<Context>().create();

export const router = trpc.router;
export const procedure = trpc.procedure;

export const protectedProcedure = procedure.use(({ ctx, next }) => {
  if (!ctx.session?.user) {
    throw new TRPCError({
      code: "UNAUTHORIZED",
      message: "You must be logged in to access this resource",
    });
  }

  return next({
    ctx: {
      ...ctx,
      session: ctx.session,
    },
  });
});

export const userProcedure = protectedProcedure.use(({ ctx, next }) => {
  if (ctx.session.user.role !== "USER") {
    throw new TRPCError({
      code: "FORBIDDEN",
      message: "You do not have permission to access this resource",
    });
  }

  if (!ctx.session.user.isVerified) {
    throw new TRPCError({
      code: "FORBIDDEN",
      message: "Your account is not verified",
    });
  }

  return next({ ctx });
});

export const adminProcedure = protectedProcedure.use(async ({ ctx, next }) => {
  if (ctx.session.user.role !== "ADMIN") {
    throw new TRPCError({
      code: "FORBIDDEN",
      message: "Admin access required",
    });
  }

  return next({ ctx });
});

export const mainChairProcedure = protectedProcedure
  .input(z.object({ conferenceId: z.string() }))
  .use(async ({ ctx, input, next }) => {
    const conferenceId = input.conferenceId;

    if (!conferenceId) {
      throw new TRPCError({
        code: "BAD_REQUEST",
        message: "Conference ID is required",
      });
    }

    const conference = await ctx.prisma.conference.findUnique({
      where: { id: conferenceId },
      select: {
        id: true,
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

    // Check if the current user is the main chair of the conference
    const isMainChair = conference.conferenceRoles.some(
      (role) => role.userId === ctx.session.user.id
    );

    if (!isMainChair) {
      throw new TRPCError({
        code: "FORBIDDEN",
        message:
          "You must be the main chair of this conference to access this submission",
      });
    }

    return next({ ctx });
  });

export const chairProcedure = protectedProcedure
  .input(z.object({ conferenceId: z.string() }))
  .use(async ({ ctx, input, next }) => {
    const conferenceId = input.conferenceId;

    if (!conferenceId) {
      throw new TRPCError({
        code: "BAD_REQUEST",
        message: "Conference ID is required",
      });
    }

    const conference = await ctx.prisma.conference.findUnique({
      where: { id: conferenceId },
      select: {
        id: true,
        conferenceRoles: {
          where: { role: { in: ["MAIN_CHAIR", "CHAIR"] } },
          select: { userId: true, role: true },
        },
      },
    });

    if (!conference) {
      throw new TRPCError({
        code: "NOT_FOUND",
        message: "Conference not found",
      });
    }

    // Check if the current user is the main chair OR a regular chair
    const isMainChair = conference.conferenceRoles.some(
      (role) =>
        role.userId === ctx.session.user.id && role.role === "MAIN_CHAIR"
    );
    const isChair = conference.conferenceRoles.some(
      (role) => role.userId === ctx.session.user.id && role.role === "CHAIR"
    );

    if (!isMainChair && !isChair) {
      throw new TRPCError({
        code: "FORBIDDEN",
        message:
          "You must be a chair of this conference to access this submission",
      });
    }

    return next({ ctx });
  });

export const reviewerProcedure = protectedProcedure
  .input(z.object({ conferenceId: z.string() }))
  .use(async ({ ctx, input, next }) => {
    const conferenceId = input.conferenceId;

    if (!conferenceId) {
      throw new TRPCError({
        code: "BAD_REQUEST",
        message: "Conference ID is required",
      });
    }

    const conference = await ctx.prisma.conference.findUnique({
      where: { id: conferenceId },
      select: {
        id: true,
        conferenceRoles: {
          where: { role: "REVIEWER" },
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

    // Check if the current user is a reviewer for the conference
    const isReviewer = conference.conferenceRoles.some(
      (role) => role.userId === ctx.session.user.id
    );

    if (!isReviewer) {
      throw new TRPCError({
        code: "FORBIDDEN",
        message:
          "You must be a reviewer for this conference to access this submission",
      });
    }

    return next({ ctx });
  });

export const adminOrMainChairProcedure = protectedProcedure
  .input(z.object({ conferenceId: z.string() }))
  .use(async ({ ctx, input, next }) => {
    // If user is an admin, allow access immediately
    if (ctx.session.user.role === "ADMIN") {
      return next({ ctx });
    }

    // Otherwise, check if they are the main chair of the specified conference
    const conferenceId = input.conferenceId;

    if (!conferenceId) {
      throw new TRPCError({
        code: "BAD_REQUEST",
        message: "Conference ID is required",
      });
    }

    // Check if the conference exists and get its main chair
    const conference = await ctx.prisma.conference.findUnique({
      where: { id: conferenceId },
      select: {
        id: true,
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

    // Check if the current user is the main chair of the conference
    const isMainChair = conference.conferenceRoles.some(
      (role) => role.userId === ctx.session.user.id
    );

    if (!isMainChair) {
      throw new TRPCError({
        code: "FORBIDDEN",
        message: "You must be an admin or the main chair of this conference",
      });
    }

    return next({ ctx });
  });

export const verifiedNoConferenceRoleProcedure = protectedProcedure
  .input(z.object({ conferenceId: z.string() }))
  .use(async ({ ctx, input, next }) => {
    // First check if user has USER role and is verified
    if (ctx.session.user.role !== "USER") {
      throw new TRPCError({
        code: "FORBIDDEN",
        message: "Only regular users can submit papers",
      });
    }

    if (!ctx.session.user.isVerified) {
      throw new TRPCError({
        code: "FORBIDDEN",
        message: "Your account must be verified to submit papers",
      });
    }

    const conferenceId = input.conferenceId;

    if (!conferenceId) {
      throw new TRPCError({
        code: "BAD_REQUEST",
        message: "Conference ID is required",
      });
    }

    // Check if the conference exists and if user has any role in it
    const conference = await ctx.prisma.conference.findUnique({
      where: { id: conferenceId },
      select: {
        id: true,
        title: true,
        conferenceRoles: {
          select: {
            userId: true,
            role: true,
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

    const userId = ctx.session.user.id;

    // Check if user has any role in the conference
    const hasRole = conference.conferenceRoles.some(
      (role) => role.userId === userId
    );

    if (hasRole) {
      throw new TRPCError({
        code: "FORBIDDEN",
        message:
          "You cannot submit papers to a conference where you have an organizational role",
      });
    }

    return next({ ctx });
  });
