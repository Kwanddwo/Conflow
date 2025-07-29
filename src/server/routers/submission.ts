import { TRPCError } from "@trpc/server";
import { z } from "zod";
import {
  userProcedure,
  router,
  chairProcedure,
  reviewerProcedure,
  verifiedNoConferenceRoleProcedure,
  mainChairProcedure,
} from "../trpc";
import { sendNotificationToChairs } from "@/lib/notification";

const authorSchema = z.object({
  id: z.string().optional(), // For existing authors
  firstName: z.string().min(1, "First Name is Required"),
  lastName: z.string().min(1, "Last Name is Required"),
  email: z.string().email("Invalid email"),
  country: z.string().min(1, "Country is required"),
  affiliation: z.string().min(1, "Affilliation is required"),
  isCorresponding: z.boolean(),
  userId: z.string().optional(),
});

export interface SubmissionWithAuthors {
  id: string;
  title: string;
  abstract: string;
  primaryArea: string;
  secondaryArea: string;
  keywords: string[];
  paperFilePath: string;
  paperFileName: string;
  createdAt: Date;
  submissionAuthors: {
    id: string;
    firstName: string;
    lastName: string;
    email: string;
    country: string;
    affiliation: string;
    isCorresponding: boolean;
  }[];
}
export const submissionRouter = router({
  getConferenceSubmissions: chairProcedure
    .input(
      z.object({
        conferenceId: z.string(),
      })
    )
    .query(async ({ ctx, input }) => {
      const { conferenceId } = input;

      const submissions = await ctx.prisma.submission.findMany({
        where: { conferenceId },
      });

      return submissions || [];
    }),
  getConferenceSubmissionsByAuthor: userProcedure
    .input(
      z.object({
        conferenceId: z.string(),
      })
    )
    .query(async ({ ctx, input }) => {
      const { conferenceId } = input;

      const submissions = await ctx.prisma.submission.findMany({
        where: {
          conferenceId,
          // The user must be one of the linked SubmissionAuthors of the paper
          submissionAuthors: {
            some: {
              userId: ctx.session.user.id,
            },
          },
        },
        select: {
          id: true,
          title: true,
          abstract: true,
          primaryArea: true,
          secondaryArea: true,
          keywords: true,
          paperFilePath: true,
          paperFileName: true,
          updatedAt: true,
          status: true,
          submissionAuthors: {
            select: {
              id: true,
              firstName: true,
              lastName: true,
              email: true,
              country: true,
              affiliation: true,
              isCorresponding: true,
            },
            orderBy: {
              createdAt: "asc",
            },
          },
          conference: {
            select: {
              id: true,
              title: true,
              acronym: true,
              status: true,
            },
          },
        },
      });

      return submissions || [];
    }),
  getSubmissionAuthors: userProcedure
    .input(
      z.object({
        submissionId: z.string(),
      })
    )
    .query(async ({ ctx, input }) => {
      const { submissionId } = input;

      // Check if user has access to this submission
      const submission = await ctx.prisma.submission.findUnique({
        where: { id: submissionId },
        select: {
          id: true,
          submittedById: true,
          submissionAuthors: {
            select: {
              userId: true,
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

      // Check if user is the submitter or one of the authors
      const isSubmitter = submission.submittedById === ctx.session.user.id;
      const isAuthor = submission.submissionAuthors.some(
        (author) => author.userId === ctx.session.user.id
      );

      if (!isSubmitter && !isAuthor) {
        throw new TRPCError({
          code: "FORBIDDEN",
          message: "You don't have access to this submission",
        });
      }

      const authors = await ctx.prisma.submissionAuthor.findMany({
        where: { submissionId },
        orderBy: { createdAt: "asc" },
      });

      return authors;
    }),
  updateSubmissionAuthors: userProcedure
    .input(
      z.object({
        submissionId: z.string(),
        authors: z.array(authorSchema).min(1),
      })
    )
    .mutation(async ({ ctx, input }) => {
      const { submissionId, authors } = input;

      // Check if user has access to this submission
      const submission = await ctx.prisma.submission.findUnique({
        where: { id: submissionId },
        select: {
          id: true,
          submittedById: true,
          submissionAuthors: {
            select: {
              userId: true,
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

      // Check if user is the submitter or one of the authors
      const isSubmitter = submission.submittedById === ctx.session.user.id;
      const isAuthor = submission.submissionAuthors.some(
        (author) => author.userId === ctx.session.user.id
      );

      if (!isSubmitter && !isAuthor) {
        throw new TRPCError({
          code: "FORBIDDEN",
          message: "You don't have access to this submission",
        });
      }

      try {
        // Use transaction to ensure data consistency
        await ctx.prisma.$transaction(async (prisma) => {
          // Delete all existing authors for this submission
          await prisma.submissionAuthor.deleteMany({
            where: { submissionId },
          });

          // Create new authors
          await prisma.submissionAuthor.createMany({
            data: authors.map((author) => ({
              firstName: author.firstName,
              lastName: author.lastName,
              email: author.email,
              country: author.country,
              affiliation: author.affiliation,
              isCorresponding: author.isCorresponding,
              userId: author.userId,
              submissionId,
            })),
          });
        });

        return { success: true };
      } catch (error) {
        console.error("Error updating submission authors:", error);
        throw new TRPCError({
          code: "INTERNAL_SERVER_ERROR",
          message: "Failed to update authors. Please try again.",
        });
      }
    }),
  addSubmissionAuthors: userProcedure
    .input(
      z.object({
        authors: z.array(authorSchema).min(1),
        submissionId: z.string(),
      })
    )
    .mutation(async ({ ctx, input }) => {
      const { authors, submissionId } = input;
      const submission = await ctx.prisma.submission.findUnique({
        where: { id: submissionId },
        select: {
          id: true,
        },
      });

      if (!submission) {
        throw new TRPCError({
          code: "NOT_FOUND",
          message: "Submission not found",
        });
      }
      // Map authors to users if possible here
      await ctx.prisma.submissionAuthor.createMany({
        data: authors.map((author) => ({
          ...author,
          submissionId,
        })),
        skipDuplicates: true,
      });

      return { success: true };
    }),
  addPaperSubmission: verifiedNoConferenceRoleProcedure
    .input(
      z.object({
        title: z.string(),
        abstract: z.string(),
        primaryArea: z.string(),
        secondaryArea: z.string(),
        keywords: z.array(z.string()),
        fileUrl: z.string(),
        fileName: z.string(),
        conferenceId: z.string(),
      })
    )
    .mutation(async ({ ctx, input }) => {
      const {
        title,
        abstract,
        primaryArea,
        secondaryArea,
        keywords,
        fileUrl,
        fileName,
        conferenceId,
      } = input;

      // First, verify the user exists
      const user = await ctx.prisma.user.findUnique({
        where: { id: ctx.session.user.id },
        select: { id: true, email: true, isVerified: true },
      });

      if (!user) {
        throw new TRPCError({
          code: "NOT_FOUND",
          message: "User not found. Please log out and log back in.",
        });
      }

      // Verify the conference exists and get research areas
      const conference = await ctx.prisma.conference.findUnique({
        where: { id: conferenceId },
        select: {
          id: true,
          title: true,
          researchAreas: true,
          status: true,
          submissionDeadline: true,
        },
      });

      if (!conference) {
        throw new TRPCError({
          code: "NOT_FOUND",
          message: "Conference not found",
        });
      }

      // Check if conference is approved and submissions are open
      if (conference.status !== "APPROVED") {
        throw new TRPCError({
          code: "BAD_REQUEST",
          message: "Submissions are only allowed for approved conferences",
        });
      }

      // Check if submission deadline has passed
      if (new Date() > conference.submissionDeadline) {
        throw new TRPCError({
          code: "BAD_REQUEST",
          message: "Submission deadline has passed",
        });
      }

      // Validate research areas
      if (conference.researchAreas) {
        const researchAreas = conference.researchAreas as Record<
          string,
          string[]
        >;
        const areaKeys = Object.keys(researchAreas);

        // console.log("Research areas validation:");
        // console.log("Available areas:", areaKeys);
        // console.log("Primary area:", primaryArea);
        // console.log("Secondary area:", secondaryArea);

        if (!areaKeys.includes(primaryArea)) {
          throw new TRPCError({
            code: "BAD_REQUEST",
            message: `Primary area '${primaryArea}' is not valid for this conference. Available areas: ${areaKeys.join(
              ", "
            )}`,
          });
        }

        const validSecondaryAreas = researchAreas[primaryArea];
        if (
          !validSecondaryAreas ||
          !validSecondaryAreas.includes(secondaryArea)
        ) {
          throw new TRPCError({
            code: "BAD_REQUEST",
            message: `Secondary area '${secondaryArea}' is not valid for primary area '${primaryArea}'. Available secondary areas: ${
              validSecondaryAreas?.join(", ") || "none"
            }`,
          });
        }
      }

      try {
        const submission = await ctx.prisma.submission.create({
          data: {
            title,
            abstract,
            primaryArea,
            secondaryArea,
            keywords,
            paperFilePath: fileUrl,
            paperFileName: fileName,
            conferenceId,
            submittedById: ctx.session.user.id,
          },
          include: {
            conference: {
              select: { id: true, title: true, acronym: true },
            },
            submittedBy: {
              select: { firstName: true, lastName: true, email: true },
            },
          },
        });

        console.log(`✅ Submission created successfully: ${submission.id}`);
        console.log(`Conference: ${submission.conference.title}`);
        console.log(
          `Submitted by: ${submission.submittedBy.firstName} ${submission.submittedBy.lastName}`
        );

        sendNotificationToChairs(
          submission.conference.id,
          `New submission to ${submission.conference.acronym}`,
          "You have a new submission to a conference you are a chair of, you can now assign the paper to a reviewer."
        );

        return {
          success: true,
          submissionId: submission.id,
          message: `Paper submitted successfully to ${submission.conference.acronym}`,
        };
      } catch (error) {
        console.error("Error creating submission:", error);

        if (error instanceof Error) {
          if (error.message.includes("Foreign key constraint")) {
            throw new TRPCError({
              code: "BAD_REQUEST",
              message:
                "Invalid user or conference reference. Please refresh and try again.",
            });
          }
        }

        throw new TRPCError({
          code: "INTERNAL_SERVER_ERROR",
          message: "Failed to create submission. Please try again.",
        });
      }
    }),
  updatePaperSubmission: verifiedNoConferenceRoleProcedure
    .input(
      z.object({
        submissionId: z.string(),
        title: z.string(),
        abstract: z.string(),
        primaryArea: z.string(),
        secondaryArea: z.string(),
        keywords: z.array(z.string()),
        paperFilePath: z.string().optional(),
        paperFileName: z.string().optional(),
      })
    )
    .mutation(async ({ ctx, input }) => {
      const {
        title,
        abstract,
        primaryArea,
        secondaryArea,
        keywords,
        paperFilePath,
        paperFileName,
        submissionId,
      } = input;

      const submissionAuthors = await ctx.prisma.submissionAuthor.findMany({
        where: { submissionId },
        select: {
          userId: true,
        },
      });

      const isAuthor = submissionAuthors
        .map((item) => item.userId)
        .includes(ctx.session.user.id);

      if (!isAuthor) {
        throw new TRPCError({
          code: "FORBIDDEN",
          message: "You are not allowed to update this submission.",
        });
      }

      try {
        const submission = await ctx.prisma.submission.update({
          where: { id: submissionId },
          data: {
            ...(title && { title }),
            ...(abstract && { abstract }),
            ...(primaryArea && { primaryArea }),
            ...(secondaryArea && { secondaryArea }),
            ...(keywords && { keywords }),
            ...(paperFilePath && { paperFilePath }),
            ...(paperFileName && { paperFileName }),
          },
          select: {
            id: true,
            conference: {
              select: {
                id: true,
                acronym: true,
              },
            },
          },
        });

        console.log(`✅ Submission updated successfully: ${submission.id}`);

        sendNotificationToChairs(
          submission.conference.id,
          `Updated submission to ${submission.conference.acronym}`,
          "You have an updated submission to a conference you are a chair of."
        );

        return {
          success: true,
          submissionId: submission.id,
          message: `Paper updated successfully for ${submission.conference.acronym}`,
        };
      } catch (error) {
        console.error("Error updating submission:", error);

        if (error instanceof Error) {
          if (error.message.includes("Foreign key constraint")) {
            throw new TRPCError({
              code: "BAD_REQUEST",
              message:
                "Invalid user or conference reference. Please refresh and try again.",
            });
          }
        }

        throw new TRPCError({
          code: "INTERNAL_SERVER_ERROR",
          message: "Failed to update submission. Please try again.",
        });
      }
    }),
  getSubmissionsByConferenceId: chairProcedure
    .input(z.object({ conferenceId: z.string() }))
    .query(async ({ ctx, input }) => {
      const { conferenceId } = input;

      const submissions = await ctx.prisma.submission.findMany({
        where: { conferenceId },
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
              id: true,
              firstName: true,
              lastName: true,
              email: true,
              country: true,
              affiliation: true,
              isCorresponding: true,
            },
          },
        },
      });

      return submissions as SubmissionWithAuthors[];
    }),

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
          reviews: {
            select: {
              id: true,
              isReviewed: true,
            },
          },
        },
        orderBy: { dueDate: "asc" },
      });

      return assignments.map((assignment) => {
        const review = assignment.reviews[0];
        return {
          id: assignment.id,
          submission: assignment.submission,
          assignedByName: `${assignment.assignedBy.user.firstName} ${assignment.assignedBy.user.lastName}`,
          dueDate: assignment.dueDate,
          createdAt: assignment.createdAt,
          isReviewed: review?.isReviewed || false,
          reviewId: review?.id || null,
        };
      });
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
          role: { in: ["MAIN_CHAIR","CHAIR"] },
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
});
