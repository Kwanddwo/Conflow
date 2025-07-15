import { initTRPC, TRPCError } from "@trpc/server";
import { Context } from "./context";

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

/**
 * Middleware that ensures the authenticated user is the main chair of the conference
 * that contains the submission. Expects input to contain either 'submissionId' or 'id'.
 *
 * Use this for operations that should only be accessible to the main chair of a submission's conference.
 *
 * @example
 * ```typescript
 * getSubmissionDetails: mainChairProcedure
 *   .input(z.object({ submissionId: z.string() }))
 *   .query(async ({ ctx, input }) => { ... })
 * ```
 */
export const mainChairProcedure = protectedProcedure.use(
  async ({ ctx, input, next }) => {
    // Extract submissionId from input - it could be nested in different ways
    let submissionId: string | undefined;

    if (typeof input === "object" && input !== null) {
      const inputObj = input as Record<string, unknown>;
      if (
        "submissionId" in inputObj &&
        typeof inputObj.submissionId === "string"
      ) {
        submissionId = inputObj.submissionId;
      }
    }

    if (!submissionId) {
      throw new TRPCError({
        code: "BAD_REQUEST",
        message: "Submission ID is required",
      });
    }

    // Check if the submission exists and get its conference
    const submission = await ctx.prisma.submission.findUnique({
      where: { id: submissionId },
      select: {
        id: true,
        conference: {
          select: {
            id: true,
            conferenceRoles: {
              where: { role: "MAIN_CHAIR" },
              select: { userId: true },
            },
          },
        },
      },
    });

    if (!submission) {
      throw new TRPCError({
        code: "NOT_FOUND",
        message: "Submission not found",
      });
    }

    // Check if the current user is the main chair of the conference
    const isMainChair = submission.conference.conferenceRoles.some(
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
  }
);

/**
 * Middleware that ensures the authenticated user is either the main chair or a regular chair
 * of the conference that contains the submission. Expects input to contain either 'submissionId' or 'id'.
 *
 * Use this for operations that should be accessible to any chair of a submission's conference.
 *
 * @example
 * ```typescript
 * getSubmissionStatus: chairProcedure
 *   .input(z.object({ submissionId: z.string() }))
 *   .query(async ({ ctx, input }) => { ... })
 * ```
 */
// Alternative procedure that checks for main chair OR regular chair permissions
export const chairProcedure = protectedProcedure.use(
  async ({ ctx, input, next }) => {
    // Extract submissionId from input
    let submissionId: string | undefined;

    if (typeof input === "object" && input !== null) {
      const inputObj = input as Record<string, unknown>;
      if (
        "submissionId" in inputObj &&
        typeof inputObj.submissionId === "string"
      ) {
        submissionId = inputObj.submissionId;
      }
    }

    if (!submissionId) {
      throw new TRPCError({
        code: "BAD_REQUEST",
        message: "Submission ID is required",
      });
    }

    // Check if the submission exists and get its conference with roles
    const submission = await ctx.prisma.submission.findUnique({
      where: { id: submissionId },
      select: {
        id: true,
        conference: {
          select: {
            id: true,
            conferenceRoles: {
              where: {
                role: { in: ["MAIN_CHAIR", "CHAIR"] },
              },
              select: {
                userId: true,
                role: true,
              },
            },
          },
        },
      },
    });

    if (!submission) {
      throw new TRPCError({
        code: "NOT_FOUND",
        message: "Submission not found",
      });
    }

    // Check if the current user is the main chair OR a regular chair
    const isMainChair = submission.conference.conferenceRoles.some(
      (role) =>
        role.userId === ctx.session.user.id && role.role === "MAIN_CHAIR"
    );
    const isChair = submission.conference.conferenceRoles.some(
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
  }
);

/**
 * Middleware that ensures the authenticated user is the main chair of a specific conference.
 * Expects input to contain 'conferenceId'.
 *
 * Use this for conference-level operations that should only be accessible to the main chair.
 *
 * @example
 * ```typescript
 * updateConferenceSettings: conferenceMainChairProcedure
 *   .input(z.object({ conferenceId: z.string(), ... }))
 *   .mutation(async ({ ctx, input }) => { ... })
 * ```
 */
// Alternative procedure for conference-based main chair check
export const conferenceMainChairProcedure = protectedProcedure.use(
  async ({ ctx, input, next }) => {
    // Extract conferenceId from input
    let conferenceId: string | undefined;

    if (typeof input === "object" && input !== null) {
      const inputObj = input as Record<string, unknown>;
      if (
        "conferenceId" in inputObj &&
        typeof inputObj.conferenceId === "string"
      ) {
        conferenceId = inputObj.conferenceId;
      }
    }

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
        message: "You must be the main chair of this conference",
      });
    }

    return next({ ctx });
  }
);

/**
 * Middleware that ensures the authenticated user is either an admin or the main chair of a specific conference.
 * Expects input to contain 'conferenceId'.
 *
 * Use this for conference-level operations that should be accessible to admins or the main chair.
 *
 * @example
 * ```typescript
 * manageConference: adminOrMainChairProcedure
 *   .input(z.object({ conferenceId: z.string(), ... }))
 *   .mutation(async ({ ctx, input }) => { ... })
 * ```
 */
export const adminOrMainChairProcedure = protectedProcedure.use(
  async ({ ctx, input, next }) => {
    // If user is an admin, allow access immediately
    if (ctx.session.user.role === "ADMIN") {
      return next({ ctx });
    }

    // Otherwise, check if they are the main chair of the specified conference
    let conferenceId: string | undefined;

    if (typeof input === "object" && input !== null) {
      const inputObj = input as Record<string, unknown>;
      if (
        "conferenceId" in inputObj &&
        typeof inputObj.conferenceId === "string"
      ) {
        conferenceId = inputObj.conferenceId;
      }
    }

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
  }
);

/**
 * Middleware that ensures the authenticated user is either an admin or the main chair of the conference
 * that contains the submission. Expects input to contain either 'submissionId' or 'id'.
 *
 * Use this for submission-level operations that should be accessible to admins or the main chair.
 *
 * @example
 * ```typescript
 * moderateSubmission: adminOrSubmissionMainChairProcedure
 *   .input(z.object({ submissionId: z.string(), ... }))
 *   .mutation(async ({ ctx, input }) => { ... })
 * ```
 */
export const adminOrSubmissionMainChairProcedure = protectedProcedure.use(
  async ({ ctx, input, next }) => {
    // If user is an admin, allow access immediately
    if (ctx.session.user.role === "ADMIN") {
      return next({ ctx });
    }

    // Otherwise, check if they are the main chair of the submission's conference
    let submissionId: string | undefined;

    if (typeof input === "object" && input !== null) {
      const inputObj = input as Record<string, unknown>;
      if (
        "submissionId" in inputObj &&
        typeof inputObj.submissionId === "string"
      ) {
        submissionId = inputObj.submissionId;
      }
    }

    if (!submissionId) {
      throw new TRPCError({
        code: "BAD_REQUEST",
        message: "Submission ID is required",
      });
    }

    // Check if the submission exists and get its conference
    const submission = await ctx.prisma.submission.findUnique({
      where: { id: submissionId },
      select: {
        id: true,
        conference: {
          select: {
            id: true,
            conferenceRoles: {
              where: { role: "MAIN_CHAIR" },
              select: { userId: true },
            },
          },
        },
      },
    });

    if (!submission) {
      throw new TRPCError({
        code: "NOT_FOUND",
        message: "Submission not found",
      });
    }

    // Check if the current user is the main chair of the conference
    const isMainChair = submission.conference.conferenceRoles.some(
      (role) => role.userId === ctx.session.user.id
    );

    if (!isMainChair) {
      throw new TRPCError({
        code: "FORBIDDEN",
        message:
          "You must be an admin or the main chair of this conference to access this submission",
      });
    }

    return next({ ctx });
  }
);

/**
 * Middleware that ensures the authenticated user is a verified user with NO role in the specified conference.
 * Combines user verification with conflict of interest prevention.
 * Expects input to contain 'conferenceId'.
 *
 * Use this for paper submission operations where both verification and conflict avoidance are required.
 *
 * @example
 * ```typescript
 * submitPaper: verifiedNoConferenceRoleProcedure
 *   .input(z.object({ conferenceId: z.string(), ... }))
 *   .mutation(async ({ ctx, input }) => { ... })
 * ```
 */
export const verifiedNoConferenceRoleProcedure = protectedProcedure.use(
  async ({ ctx, input, next }) => {
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

    // Extract conferenceId from input
    let conferenceId: string | undefined;

    if (typeof input === "object" && input !== null) {
      const inputObj = input as Record<string, unknown>;
      if (
        "conferenceId" in inputObj &&
        typeof inputObj.conferenceId === "string"
      ) {
        conferenceId = inputObj.conferenceId;
      }
    }

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
  }
);
