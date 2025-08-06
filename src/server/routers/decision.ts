import { TRPCError } from "@trpc/server";
import { mainChairProcedure, chairProcedure, router } from "../trpc";
import z from "zod";
import { sendNotification } from "@/lib/notification";

export const decisionRouter = router({
  createDecisionAssignment: mainChairProcedure
    .input(
      z.object({
        submissionId: z.string(),
        chairRoleId: z.string(),
        dueDate: z
          .union([z.date(), z.string()])
          .transform((val) => (typeof val === "string" ? new Date(val) : val)),
        conferenceId: z.string(),
      })
    )
    .mutation(async ({ ctx, input }) => {
      const { submissionId, chairRoleId, dueDate, conferenceId } = input;

      const submission = await ctx.prisma.submission.findUnique({
        where: { id: submissionId },
        select: { id: true, conferenceId: true },
      });

      if (!submission) {
        throw new TRPCError({
          code: "NOT_FOUND",
          message: "Submission not found",
        });
      }

      if (submission.conferenceId !== conferenceId) {
        throw new TRPCError({
          code: "BAD_REQUEST",
          message: "Submission does not belong to this conference",
        });
      }

      const chairRole = await ctx.prisma.conferenceRoleEntries.findFirst({
        where: {
          userId: chairRoleId,
          conferenceId,
          role: { in: ["MAIN_CHAIR", "CHAIR"] },
        },
      });

      if (!chairRole) {
        throw new TRPCError({
          code: "NOT_FOUND",
          message:
            "Chair not found or not assigned as chair for this conference",
        });
      }

      const assignerRole = await ctx.prisma.conferenceRoleEntries.findFirst({
        where: {
          userId: ctx.session.user.id,
          conferenceId,
          role: "MAIN_CHAIR",
        },
      });

      if (!assignerRole) {
        throw new TRPCError({
          code: "FORBIDDEN",
          message: "You must be a chair to assign decisions",
        });
      }

      const existingAssignment = await ctx.prisma.decisionAssignment.findFirst({
        where: {
          submissionId,
          chairRoleId: chairRole.id,
        },
      });

      if (existingAssignment) {
        throw new TRPCError({
          code: "CONFLICT",
          message: "This chair is already assigned to this submission",
        });
      }

      try {
        const assignment = await ctx.prisma.decisionAssignment.create({
          data: {
            submissionId,
            dueDate,
            chairRoleId: chairRole.id,
            assignedByRoleId: assignerRole.id,
          },
          include: {
            submission: {
              select: { title: true },
            },
            chairReviewer: {
              select: {
                user: {
                  select: { firstName: true, lastName: true, email: true },
                },
              },
            },
          },
        });

        await ctx.prisma.notification.create({
          data: {
            userId: chairRoleId,
            title: "New Decision Assignment",
            message: `You have been assigned to decide on "${
              assignment.submission.title
            }". Due date: ${dueDate.toDateString()}`,
            isRead: false,
          },
        });

        return {
          success: true,
          assignmentId: assignment.id,
          message: `Decision assignment created successfully`,
        };
      } catch (error) {
        console.error("Error creating decision assignment:", error);
        throw new TRPCError({
          code: "INTERNAL_SERVER_ERROR",
          message: "Failed to create decision assignment",
        });
      }
    }),
  getAvailableChairDecisionMakers: mainChairProcedure
    .input(
      z.object({
        conferenceId: z.string(),
        submissionId: z.string(),
      })
    )
    .query(async ({ ctx, input }) => {
      const { conferenceId, submissionId } = input;

      const decisionMakers = await ctx.prisma.conferenceRoleEntries.findMany({
        where: {
          conferenceId,
          role: { in: ["CHAIR", "MAIN_CHAIR"] },
        },
        include: {
          user: {
            select: {
              id: true,
              firstName: true,
              lastName: true,
              email: true,
              affiliation: true,
            },
          },
        },
      });

      const existingAssignments = await ctx.prisma.decisionAssignment.findMany({
        where: { submissionId },
        select: { chairRoleId: true },
      });

      const assignedChairRoleIds = new Set(
        existingAssignments.map((a) => a.chairRoleId)
      );

      const availableChairs = decisionMakers
        .filter((chair) => !assignedChairRoleIds.has(chair.id))
        .map((chair) => ({
          id: chair.userId,
          name: `${chair.user.firstName} ${chair.user.lastName}`,
          email: chair.user.email,
          affiliation: chair.user.affiliation,
        }));

      return availableChairs;
    }),
  updateDecisionAssignmentDueDate: mainChairProcedure
    .input(
      z.object({
        assignmentId: z.string(),
        dueDate: z
          .union([z.date(), z.string()])
          .transform((val) => (typeof val === "string" ? new Date(val) : val)),
        conferenceId: z.string(),
      })
    )
    .mutation(async ({ ctx, input }) => {
      const { assignmentId, dueDate, conferenceId } = input;

      const assignment = await ctx.prisma.decisionAssignment.findUnique({
        where: { id: assignmentId },
        include: {
          submission: { select: { conferenceId: true, title: true } },
          chairReviewer: {
            select: {
              user: { select: { id: true, firstName: true, lastName: true } },
            },
          },
        },
      });

      if (!assignment) {
        throw new TRPCError({
          code: "NOT_FOUND",
          message: "Decision assignment not found",
        });
      }

      if (assignment.submission.conferenceId !== conferenceId) {
        throw new TRPCError({
          code: "BAD_REQUEST",
          message: "Assignment does not belong to this conference",
        });
      }

      try {
        await ctx.prisma.decisionAssignment.update({
          where: { id: assignmentId },
          data: { dueDate },
        });

        await ctx.prisma.notification.create({
          data: {
            userId: assignment.chairReviewer.user.id,
            title: "Decision Due Date Updated",
            message: `The due date for your decision of "${
              assignment.submission.title
            }" has been updated to ${dueDate.toDateString()}`,
            isRead: false,
          },
        });

        return {
          success: true,
          message: "Due date updated successfully",
        };
      } catch (error) {
        console.error("Error updating decision assignment due date:", error);
        throw new TRPCError({
          code: "INTERNAL_SERVER_ERROR",
          message: "Failed to update due date",
        });
      }
    }),
  deleteDecisionAssignment: mainChairProcedure
    .input(
      z.object({
        assignmentId: z.string(),
        conferenceId: z.string(),
      })
    )
    .mutation(async ({ ctx, input }) => {
      const { assignmentId, conferenceId } = input;

      const assignment = await ctx.prisma.decisionAssignment.findUnique({
        where: { id: assignmentId },
        include: {
          submission: { select: { conferenceId: true, title: true } },
          chairReviewer: {
            select: {
              user: { select: { id: true, firstName: true, lastName: true } },
            },
          },
        },
      });

      if (!assignment) {
        throw new TRPCError({
          code: "NOT_FOUND",
          message: "Decision assignment not found",
        });
      }

      if (assignment.submission.conferenceId !== conferenceId) {
        throw new TRPCError({
          code: "BAD_REQUEST",
          message: "Assignment does not belong to this conference",
        });
      }

      try {
        await ctx.prisma.decisionAssignment.delete({
          where: { id: assignmentId },
        });

        await ctx.prisma.notification.create({
          data: {
            userId: assignment.chairReviewer.user.id,
            title: "Decision Assignment Removed",
            message: `Your decision assignment for "${assignment.submission.title}" has been removed`,
            isRead: false,
          },
        });

        return {
          success: true,
          message: "Decision assignment removed successfully",
        };
      } catch (error) {
        console.error("Error deleting decision assignment:", error);
        throw new TRPCError({
          code: "INTERNAL_SERVER_ERROR",
          message: "Failed to remove decision assignment",
        });
      }
    }),
  getDecisionAssignments: mainChairProcedure
    .input(
      z.object({
        conferenceId: z.string(),
        submissionId: z.string().optional(),
      })
    )
    .query(async ({ ctx, input }) => {
      const { conferenceId, submissionId } = input;

      const assignments = await ctx.prisma.decisionAssignment.findMany({
        where: {
          submission: { conferenceId },
          ...(submissionId && { submissionId }),
        },
        include: {
          decision: {
            select: {
              id: true,
            },
          },
          submission: {
            select: {
              id: true,
              title: true,
              primaryArea: true,
              secondaryArea: true,
            },
          },
          chairReviewer: {
            select: {
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
          assignedBy: {
            select: {
              user: {
                select: {
                  id: true,
                  firstName: true,
                  lastName: true,
                },
              },
            },
          },
        },
        orderBy: { createdAt: "desc" },
      });

      return assignments.map((assignment) => ({
        id: assignment.id,
        isReviewed: !!assignment.decision,
        submissionId: assignment.submissionId,
        submissionTitle: assignment.submission.title,
        submissionPrimaryArea: assignment.submission.primaryArea,
        submissionSecondaryArea: assignment.submission.secondaryArea,
        chairReviewerId: assignment.chairReviewer.user.id,
        chairName: `${assignment.chairReviewer.user.firstName} ${assignment.chairReviewer.user.lastName}`,
        chairEmail: assignment.chairReviewer.user.email,
        assignedById: assignment.assignedBy.user.id,
        assignedByName: `${assignment.assignedBy.user.firstName} ${assignment.assignedBy.user.lastName}`,
        dueDate: assignment.dueDate,
        createdAt: assignment.createdAt,
      }));
    }),
  getMyDecisionAssignments: chairProcedure
    .input(
      z.object({
        conferenceId: z.string(),
      })
    )
    .query(async ({ ctx, input }) => {
      const { conferenceId } = input;

      const assignments = await ctx.prisma.decisionAssignment.findMany({
        where: {
          chairReviewer: {
            userId: ctx.session.user.id,
            conferenceId,
            role: { in: ["MAIN_CHAIR", "CHAIR"] },
          },
          submission: { conferenceId },
        },
        include: {
          submission: {
            select: {
              id: true,
              title: true,
              abstract: true,
              primaryArea: true,
              secondaryArea: true,
              keywords: true,
              paperFilePath: true,
              paperFileName: true,
              submissionAuthors: {
                select: {
                  firstName: true,
                  lastName: true,
                  affiliation: true,
                  country: true,
                },
              },
            },
          },
          assignedBy: {
            select: {
              user: {
                select: {
                  firstName: true,
                  lastName: true,
                },
              },
            },
          },
          decision: {
            select: {
              id: true,
            },
          },
        },
        orderBy: { dueDate: "asc" },
      });

      return assignments.map((assignment) => {
        return {
          id: assignment.id,
          submission: assignment.submission,
          assignedByName: `${assignment.assignedBy.user.firstName} ${assignment.assignedBy.user.lastName}`,
          dueDate: assignment.dueDate,
          createdAt: assignment.createdAt,
          isReviewed: !!assignment.decision,
          decisionId: assignment.decision?.id || null,
        };
      });
    }),
  submitDecision: chairProcedure
    .input(
      z.object({
        assignmentId: z.string(),
        reviewDecision: z.enum([
          "ACCEPT",
          "MAJOR_REVISION",
          "MINOR_REVISION",
          "REJECT",
        ]),
      })
    )
    .mutation(async ({ input, ctx }) => {
      const { assignmentId, reviewDecision } = input;

      const assignment = await ctx.prisma.decisionAssignment.findUnique({
        where: { id: assignmentId },
        include: {
          submission: {
            select: {
              id: true,
              title: true,
              submissionAuthors: {
                where: {
                  isCorresponding: true,
                },
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
          },
          chairReviewer: {
            select: {
              userId: true,
            },
          },
          decision: {
            select: {
              id: true,
            },
          },
        },
      });

      if (
        !assignment ||
        assignment.chairReviewer.userId !== ctx.session.user.id
      ) {
        throw new Error(
          "Assignment not found or you don't have permission to review it"
        );
      }

      // Check if decision already exists using the one-to-one relationship
      if (assignment.decision) {
        throw new Error(
          "Decision has already been submitted for this assignment"
        );
      }

      const decision = await ctx.prisma.decision.create({
        data: {
          assignmentId,
          submissionId: assignment.submission.id,
          reviewDecision,
        },
      });

      const emailPromises: Promise<any>[] = [];
      assignment.submission.submissionAuthors.forEach((author) => {
        if (!author.user) return;
        emailPromises.push(
          sendNotification(
            author.user,
            "One of your submissions has been given a decision",
            `Your submission titled "${assignment.submission.title}" (${assignment.submission.id}) has been given a final decision.`
          )
        );
      });
      await Promise.allSettled(emailPromises);

      return {
        success: true,
        decisionId: decision.id,
        message: "Decision submitted successfully",
      };
    }),

  updateDecision: chairProcedure
    .input(
      z.object({
        decisionId: z.string(),
        reviewDecision: z.enum([
          "ACCEPT",
          "MAJOR_REVISION",
          "MINOR_REVISION",
          "REJECT",
        ]),
      })
    )
    .mutation(async ({ input, ctx }) => {
      const { decisionId, reviewDecision } = input;

      // Verify the decision belongs to the current user
      const existingDecision = await ctx.prisma.decision.findUnique({
        where: { id: decisionId },
        include: {
          assignment: {
            include: {
              chairReviewer: {
                select: {
                  userId: true,
                },
              },
              submission: {
                select: {
                  id: true,
                  title: true,
                },
              },
            },
          },
        },
      });

      if (!existingDecision) {
        throw new Error("Decision not found");
      }

      if (
        existingDecision.assignment.chairReviewer.userId !== ctx.session.user.id
      ) {
        throw new Error("You don't have permission to update this decision");
      }

      const updatedDecision = await ctx.prisma.decision.update({
        where: { id: decisionId },
        data: {
          reviewDecision,
        },
      });

      return {
        success: true,
        decisionId: updatedDecision.id,
        message: "Decision updated successfully",
      };
    }),
  getChairDecision: chairProcedure
    .input(z.object({ decisionId: z.string() }))
    .query(async ({ input, ctx }) => {
      const { decisionId } = input;
      const decision = await ctx.prisma.decision.findUnique({
        where: { id: decisionId },
        include: {
          submission: {
            select: {
              id: true,
              title: true,
              abstract: true,
              keywords: true,
              paperFilePath: true,
              paperFileName: true,
              primaryArea: true,
              secondaryArea: true,
              createdAt: true,
              updatedAt: true,
              submissionAuthors: {
                select: {
                  id: true,
                  firstName: true,
                  lastName: true,
                  email: true,
                  affiliation: true,
                  country: true,
                  isCorresponding: true,
                },
                orderBy: {
                  createdAt: "asc",
                },
              },
            },
          },
          assignment: {
            select: {
              id: true,
              dueDate: true,
              createdAt: true,
            },
          },
        },
      });
      return decision;
    }),
  getDecisionAssignment: chairProcedure
    .input(
      z.object({
        conferenceId: z.string(),
        assignmentId: z.string(),
      })
    )
    .query(async ({ ctx, input }) => {
      const { assignmentId } = input;

      const assignment = await ctx.prisma.decisionAssignment.findUnique({
        where: { id: assignmentId },
        include: {
          decision: {
            select: {
              id: true,
            },
          },
          submission: {
            select: {
              id: true,
              title: true,
              abstract: true,
              primaryArea: true,
              secondaryArea: true,
              keywords: true,
              paperFilePath: true,
              paperFileName: true,
              createdAt: true,
              submissionAuthors: {
                select: {
                  firstName: true,
                  lastName: true,
                  email: true,
                  affiliation: true,
                  country: true,
                },
              },
            },
          },
          chairReviewer: {
            select: {
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
          assignedBy: {
            select: {
              user: {
                select: {
                  firstName: true,
                  lastName: true,
                },
              },
            },
          },
        },
      });

      if (!assignment) {
        throw new TRPCError({
          code: "NOT_FOUND",
          message: "Decision assignment not found",
        });
      }

      // Additional authorization: check if the user is either the assigned chair or a main chair
      const isAssignedChair =
        assignment.chairReviewer.user.id === ctx.session.user.id;

      if (!isAssignedChair) {
        throw new TRPCError({
          code: "FORBIDDEN",
          message:
            "You can only access decision assignments that are assigned to you",
        });
      }

      return {
        id: assignment.id,
        submission: assignment.submission,
        isReviewed: !!assignment.decision,
        chairReviewer: {
          id: assignment.chairReviewer.user.id,
          name: `${assignment.chairReviewer.user.firstName} ${assignment.chairReviewer.user.lastName}`,
          email: assignment.chairReviewer.user.email,
        },
        assignedBy: {
          name: `${assignment.assignedBy.user.firstName} ${assignment.assignedBy.user.lastName}`,
        },
        dueDate: assignment.dueDate,
        createdAt: assignment.createdAt,
      };
    }),
});
