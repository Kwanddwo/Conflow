import { z } from "zod";
import { reviewerProcedure, chairProcedure, router } from "../trpc";
import { TRPCError } from "@trpc/server";

export const reviewRouter = router({
  // Review Assignment Management Procedures
  createReviewAssignment: chairProcedure
    .input(
      z.object({
        submissionId: z.string(),
        reviewerId: z.string(),
        dueDate: z
          .union([z.date(), z.string()])
          .transform((val) => (typeof val === "string" ? new Date(val) : val)),
        conferenceId: z.string(),
      })
    )
    .mutation(async ({ ctx, input }) => {
      const { submissionId, reviewerId, dueDate, conferenceId } = input;

      // Verify the submission exists and belongs to the conference
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

      // Get the reviewer's role entry for this conference
      const reviewerRole = await ctx.prisma.conferenceRoleEntries.findFirst({
        where: {
          userId: reviewerId,
          conferenceId,
          role: "REVIEWER",
        },
      });

      if (!reviewerRole) {
        throw new TRPCError({
          code: "NOT_FOUND",
          message:
            "Reviewer not found or not assigned as reviewer for this conference",
        });
      }

      // Get the assigner's role entry (must be CHAIR or MAIN_CHAIR)
      const assignerRole = await ctx.prisma.conferenceRoleEntries.findFirst({
        where: {
          userId: ctx.session.user.id,
          conferenceId,
          role: { in: ["CHAIR", "MAIN_CHAIR"] },
        },
      });

      if (!assignerRole) {
        throw new TRPCError({
          code: "FORBIDDEN",
          message: "You must be a chair to assign reviewers",
        });
      }

      // Check if assignment already exists for this submission and reviewer role
      const existingAssignment = await ctx.prisma.reviewAssignment.findFirst({
        where: {
          submissionId,
          reviewerRoleId: reviewerRole.id,
        },
      });

      if (existingAssignment) {
        throw new TRPCError({
          code: "CONFLICT",
          message: "This reviewer is already assigned to this submission",
        });
      }

      try {
        const assignment = await ctx.prisma.reviewAssignment.create({
          data: {
            submissionId,
            dueDate,
            reviewerRoleId: reviewerRole.id,
            assignedByRoleId: assignerRole.id,
          },
          include: {
            submission: {
              select: { title: true },
            },
            reviewer: {
              select: {
                user: {
                  select: { firstName: true, lastName: true, email: true },
                },
              },
            },
          },
        });

        // Send notification to the reviewer
        await ctx.prisma.notification.create({
          data: {
            userId: reviewerId,
            title: "New Review Assignment",
            message: `You have been assigned to review "${
              assignment.submission.title
            }". Due date: ${dueDate.toDateString()}`,
            isRead: false,
          },
        });

        return {
          success: true,
          assignmentId: assignment.id,
          message: `Review assignment created successfully`,
        };
      } catch (error) {
        console.error("Error creating review assignment:", error);
        throw new TRPCError({
          code: "INTERNAL_SERVER_ERROR",
          message: "Failed to create review assignment",
        });
      }
    }),

  getReviewAssignments: chairProcedure
    .input(
      z.object({
        conferenceId: z.string(),
        submissionId: z.string().optional(),
      })
    )
    .query(async ({ ctx, input }) => {
      const { conferenceId, submissionId } = input;

      const assignments = await ctx.prisma.reviewAssignment.findMany({
        where: {
          submission: { conferenceId },
          ...(submissionId && { submissionId }),
        },
        include: {
          submission: {
            select: {
              id: true,
              title: true,
              primaryArea: true,
              secondaryArea: true,
            },
          },
          review: true,
          reviewer: {
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
        submissionId: assignment.submissionId,
        submissionTitle: assignment.submission.title,
        submissionPrimaryArea: assignment.submission.primaryArea,
        submissionSecondaryArea: assignment.submission.secondaryArea,
        reviewerId: assignment.reviewer.user.id,
        reviewerName: `${assignment.reviewer.user.firstName} ${assignment.reviewer.user.lastName}`,
        reviewerEmail: assignment.reviewer.user.email,
        isReviewed: !!assignment.review,
        assignedById: assignment.assignedBy.user.id,
        assignedByName: `${assignment.assignedBy.user.firstName} ${assignment.assignedBy.user.lastName}`,
        dueDate: assignment.dueDate,
        createdAt: assignment.createdAt,
      }));
    }),
  getMyReviewAssignments: reviewerProcedure
    .input(
      z.object({
        conferenceId: z.string(),
      })
    )
    .query(async ({ ctx, input }) => {
      const { conferenceId } = input;

      const assignments = await ctx.prisma.reviewAssignment.findMany({
        where: {
          reviewer: {
            userId: ctx.session.user.id,
            conferenceId,
            role: "REVIEWER",
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
          review: {
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
          isReviewed: !!assignment.review,
          reviewId: assignment.review?.id || null,
        };
      });
    }),
  getReviewAssignment: reviewerProcedure
    .input(
      z.object({
        conferenceId: z.string(),
        assignmentId: z.string(),
      })
    )
    .query(async ({ ctx, input }) => {
      const { assignmentId } = input;
      const assignment = await ctx.prisma.reviewAssignment.findUnique({
        where: { id: assignmentId },
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
          reviewer: {
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
          message: "Review assignment not found",
        });
      }

      return {
        id: assignment.id,
        submission: assignment.submission,
        reviewer: {
          id: assignment.reviewer.user.id,
          name: `${assignment.reviewer.user.firstName} ${assignment.reviewer.user.lastName}`,
          email: assignment.reviewer.user.email,
        },
        assignedBy: {
          name: `${assignment.assignedBy.user.firstName} ${assignment.assignedBy.user.lastName}`,
        },
        dueDate: assignment.dueDate,
        createdAt: assignment.createdAt,
      };
    }),
  updateReviewAssignmentDueDate: chairProcedure
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

      // Verify the assignment exists and belongs to the conference
      const assignment = await ctx.prisma.reviewAssignment.findUnique({
        where: { id: assignmentId },
        include: {
          submission: { select: { conferenceId: true, title: true } },
          reviewer: {
            select: {
              user: { select: { id: true, firstName: true, lastName: true } },
            },
          },
        },
      });

      if (!assignment) {
        throw new TRPCError({
          code: "NOT_FOUND",
          message: "Review assignment not found",
        });
      }

      if (assignment.submission.conferenceId !== conferenceId) {
        throw new TRPCError({
          code: "BAD_REQUEST",
          message: "Assignment does not belong to this conference",
        });
      }

      try {
        await ctx.prisma.reviewAssignment.update({
          where: { id: assignmentId },
          data: { dueDate },
        });

        // Notify the reviewer about the updated due date
        await ctx.prisma.notification.create({
          data: {
            userId: assignment.reviewer.user.id,
            title: "Review Due Date Updated",
            message: `The due date for your review of "${
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
        console.error("Error updating review assignment due date:", error);
        throw new TRPCError({
          code: "INTERNAL_SERVER_ERROR",
          message: "Failed to update due date",
        });
      }
    }),

  deleteReviewAssignment: chairProcedure
    .input(
      z.object({
        assignmentId: z.string(),
        conferenceId: z.string(),
      })
    )
    .mutation(async ({ ctx, input }) => {
      const { assignmentId, conferenceId } = input;

      // Verify the assignment exists and belongs to the conference
      const assignment = await ctx.prisma.reviewAssignment.findUnique({
        where: { id: assignmentId },
        include: {
          submission: { select: { conferenceId: true, title: true } },
          reviewer: {
            select: {
              user: { select: { id: true, firstName: true, lastName: true } },
            },
          },
        },
      });

      if (!assignment) {
        throw new TRPCError({
          code: "NOT_FOUND",
          message: "Review assignment not found",
        });
      }

      if (assignment.submission.conferenceId !== conferenceId) {
        throw new TRPCError({
          code: "BAD_REQUEST",
          message: "Assignment does not belong to this conference",
        });
      }

      try {
        await ctx.prisma.reviewAssignment.delete({
          where: { id: assignmentId },
        });

        // Notify the reviewer about the removed assignment
        await ctx.prisma.notification.create({
          data: {
            userId: assignment.reviewer.user.id,
            title: "Review Assignment Removed",
            message: `Your review assignment for "${assignment.submission.title}" has been removed`,
            isRead: false,
          },
        });

        return {
          success: true,
          message: "Review assignment removed successfully",
        };
      } catch (error) {
        console.error("Error deleting review assignment:", error);
        throw new TRPCError({
          code: "INTERNAL_SERVER_ERROR",
          message: "Failed to remove review assignment",
        });
      }
    }),

  getAvailableReviewers: chairProcedure
    .input(
      z.object({
        conferenceId: z.string(),
        submissionId: z.string(),
      })
    )
    .query(async ({ ctx, input }) => {
      const { conferenceId, submissionId } = input;

      // Get all reviewers for the conference
      const reviewers = await ctx.prisma.conferenceRoleEntries.findMany({
        where: {
          conferenceId,
          role: "REVIEWER",
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

      // Get existing assignments for this submission
      const existingAssignments = await ctx.prisma.reviewAssignment.findMany({
        where: { submissionId },
        select: { reviewerRoleId: true },
      });

      const assignedReviewerRoleIds = new Set(
        existingAssignments.map((a) => a.reviewerRoleId)
      );

      // Filter out already assigned reviewers
      const availableReviewers = reviewers
        .filter((reviewer) => !assignedReviewerRoleIds.has(reviewer.id))
        .map((reviewer) => ({
          id: reviewer.userId,
          name: `${reviewer.user.firstName} ${reviewer.user.lastName}`,
          email: reviewer.user.email,
          affiliation: reviewer.user.affiliation,
        }));

      return availableReviewers;
    }),

  getReviewerReview: reviewerProcedure
    .input(z.object({ reviewId: z.string() }))
    .query(async ({ input, ctx }) => {
      const { reviewId } = input;
      const review = await ctx.prisma.review.findUnique({
        where: { id: reviewId },
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
              status: true,
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
      return review;
    }),

  submitReview: reviewerProcedure
    .input(
      z.object({
        assignmentId: z.string(),
        recommendation: z.enum(["REVISION", "ACCEPTED", "REJECTED"]),
        overallEvaluation: z
          .string()
          .min(50, "Evaluation must be at least 50 characters"),
        overallScore: z.number().min(1).max(10),
      })
    )
    .mutation(async ({ input, ctx }) => {
      const { assignmentId, recommendation, overallEvaluation, overallScore } =
        input;

      // Verify the assignment belongs to the current user
      const assignment = await ctx.prisma.reviewAssignment.findUnique({
        where: { id: assignmentId },
        include: {
          reviewer: {
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
          // Include the existing review if any
          review: {
            select: {
              id: true,
            },
          },
        },
      });

      if (!assignment || assignment.reviewer.userId !== ctx.session.user.id) {
        throw new Error(
          "Assignment not found or you don't have permission to review it"
        );
      }

      // Check if review already exists using the one-to-one relationship
      if (assignment.review) {
        throw new Error(
          "Review has already been submitted for this assignment"
        );
      }

      // Create the review
      const review = await ctx.prisma.review.create({
        data: {
          assignmentId,
          submissionId: assignment.submission.id,
          recommendation,
          overallEvaluation,
          overallScore,
        },
      });

      return {
        success: true,
        reviewId: review.id,
        message: "Review submitted successfully",
      };
    }),

  updateReview: reviewerProcedure
    .input(
      z.object({
        reviewId: z.string(),
        recommendation: z.enum(["REVISION", "ACCEPTED", "REJECTED"]),
        overallEvaluation: z
          .string()
          .min(50, "Evaluation must be at least 50 characters"),
        overallScore: z.number().min(1).max(10),
      })
    )
    .mutation(async ({ input, ctx }) => {
      const { reviewId, recommendation, overallEvaluation, overallScore } =
        input;

      // Verify the review belongs to the current user
      const existingReview = await ctx.prisma.review.findUnique({
        where: { id: reviewId },
        include: {
          assignment: {
            include: {
              reviewer: {
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

      if (!existingReview) {
        throw new Error("Review not found");
      }

      if (existingReview.assignment.reviewer.userId !== ctx.session.user.id) {
        throw new Error("You don't have permission to update this review");
      }

      // Update the review
      const updatedReview = await ctx.prisma.review.update({
        where: { id: reviewId },
        data: {
          recommendation,
          overallEvaluation,
          overallScore,
        },
      });

      return {
        success: true,
        reviewId: updatedReview.id,
        message: "Review updated successfully",
      };
    }),
});
