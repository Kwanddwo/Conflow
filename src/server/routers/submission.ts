import { TRPCError } from "@trpc/server";
import { z } from "zod";
import {
  userProcedure,
  router,
  chairProcedure,
  verifiedNoConferenceRoleProcedure,
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
  cameraReadyFilepath: string;
  cameraReadyFilename: string;
  createdAt: Date;
  conference: {
    id: string;
    submissionDeadline: Date;
  };
  submissionAuthors: {
    id: string;
    firstName: string;
    lastName: string;
    email: string;
    country: string;
    affiliation: string;
    isCorresponding: boolean;
    hasPaid: boolean;
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
          cameraReadyFilepath: true,
          cameraReadyFilename: true,
          updatedAt: true,
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
          decision: true,
          conference: {
            select: {
              id: true,
              title: true,
              acronym: true,
              status: true,
              submissionDeadline: true,
              cameraReadyDeadline: true,
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
          conference: {
            select: {
              id: true,
              submissionDeadline: true,
            },
          },
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

      // Check if submission deadline has passed
      if (new Date() > submission.conference.submissionDeadline) {
        throw new TRPCError({
          code: "BAD_REQUEST",
          message: "Cannot update authors after the submission deadline",
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

      // If the current user is the submitter,
      // they must remain linked as an author
      if (isSubmitter) {
        const submitterStillLinked = authors.some(
          (author) => author.userId === ctx.session.user.id
        );

        if (!submitterStillLinked) {
          throw new TRPCError({
            code: "BAD_REQUEST",
            message:
              "The submitting author cannot remove themselves from the submission",
          });
        }
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
          conference: {
            select: {
              id: true,
              submissionDeadline: true,
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

      if (new Date() > submission.conference.submissionDeadline) {
        throw new TRPCError({
          code: "BAD_REQUEST",
          message: "Cannot add authors after the submission deadline",
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

      const currentSubmission = await ctx.prisma.submission.findUnique({
        where: { id: submissionId },
        select: {
          id: true,
          conference: {
            select: {
              id: true,
              submissionDeadline: true,
            },
          },
        },
      });

      if (!currentSubmission) {
        throw new TRPCError({
          code: "NOT_FOUND",
          message: "Submission not found",
        });
      }

      // Check if submission deadline has passed
      if (new Date() > currentSubmission.conference.submissionDeadline) {
        throw new TRPCError({
          code: "BAD_REQUEST",
          message: "Cannot update submission after the deadline",
        });
      }

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

        // sendNotificationToChairs(
        //   submission.conference.id,
        //   `Updated submission to ${submission.conference.acronym}`,
        //   "You have an updated submission to a conference you are a chair of."
        // );

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
  updateCameraReady: verifiedNoConferenceRoleProcedure
    .input(
      z.object({
        submissionId: z.string(),
        cameraReadyFilepath: z.string().optional(),
        cameraReadyFilename: z.string().optional(),
      })
    )
    .mutation(async ({ ctx, input }) => {
      const { submissionId, cameraReadyFilepath, cameraReadyFilename } = input;
      const currentSubmission = await ctx.prisma.submission.findUnique({
        where: { id: submissionId },
        select: {
          id: true,
          conference: {
            select: {
              id: true,
              submissionDeadline: true,
              cameraReadyDeadline: true,
            },
          },
        },
      });

      if (!currentSubmission) {
        throw new TRPCError({
          code: "NOT_FOUND",
          message: "Submission not found",
        });
      }

      // Check if the submission deadline has not passed
      if (new Date() < currentSubmission.conference.submissionDeadline) {
        throw new TRPCError({
          code: "BAD_REQUEST",
          message:
            "Cannot update camera-ready submission before the submission deadline",
        });
      }

      // Check if camera-ready deadline has passed
      if (new Date() > currentSubmission.conference.cameraReadyDeadline) {
        throw new TRPCError({
          code: "BAD_REQUEST",
          message: "Cannot update camera-ready submission after the deadline",
        });
      }

      // Check if the user is an author of this submission
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
            cameraReadyFilepath,
            cameraReadyFilename,
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

        console.log(
          `✅ Camera-ready submission updated successfully: ${submission.id}`
        );

        return {
          success: true,
          submissionId: submission.id,
          message: `Camera-ready paper updated successfully for ${submission.conference.acronym}`,
        };
      } catch (error) {
        console.error("Error updating camera-ready submission:", error);

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
          message:
            "Failed to update camera-ready submission. Please try again.",
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
          cameraReadyFilepath: true,
          cameraReadyFilename: true,
          createdAt: true,
          conference: {
            select: {
              id: true,
              submissionDeadline: true,
            },
          },
          submissionAuthors: {
            select: {
              id: true,
              firstName: true,
              lastName: true,
              email: true,
              country: true,
              affiliation: true,
              isCorresponding: true,
              hasPaid: true,
            },
          },
        },
      });

      return submissions as SubmissionWithAuthors[];
    }),
  getSubmissionReviews: chairProcedure
    .input(
      z.object({
        conferenceId: z.string(),
        submissionId: z.string(),
      })
    )
    .query(async ({ ctx, input }) => {
      const { conferenceId, submissionId } = input;

      // Verify the submission belongs to this conference
      const submission = await ctx.prisma.submission.findUnique({
        where: { id: submissionId },
        select: { conferenceId: true },
      });

      if (!submission || submission.conferenceId !== conferenceId) {
        throw new TRPCError({
          code: "NOT_FOUND",
          message: "Submission not found or does not belong to this conference",
        });
      }

      // Get all reviews for this submission with reviewer information
      const reviews = await ctx.prisma.review.findMany({
        where: {
          submissionId,
        },
        select: {
          id: true,
          overallScore: true,
          recommendation: true,
          overallEvaluation: true,
          createdAt: true,
          assignment: {
            select: {
              reviewer: {
                select: {
                  user: {
                    select: {
                      firstName: true,
                      lastName: true,
                      email: true,
                    },
                  },
                },
              },
            },
          },
        },
        orderBy: {
          createdAt: "desc",
        },
      });

      return reviews.map((review) => ({
        id: review.id,
        overallScore: review.overallScore,
        recommendation: review.recommendation,
        overallEvaluation: review.overallEvaluation,
        createdAt: review.createdAt,
        reviewerName: `${review.assignment.reviewer.user.firstName} ${review.assignment.reviewer.user.lastName}`,
        reviewerEmail: review.assignment.reviewer.user.email,
      }));
    }),

  // Payment management endpoints
  getAcceptedSubmissionsWithPaymentStatus: chairProcedure
    .input(z.object({ conferenceId: z.string() }))
    .query(async ({ ctx, input }) => {
      const { conferenceId } = input;

      // Get accepted submissions based on decisions
      const acceptedSubmissions = await ctx.prisma.submission.findMany({
        where: {
          conferenceId,
          decision: {
            reviewDecision: "ACCEPT",
          },
        },
        select: {
          id: true,
          title: true,
          submissionAuthors: {
            select: {
              id: true,
              firstName: true,
              lastName: true,
              email: true,
              affiliation: true,
              hasPaid: true,
              isCorresponding: true,
            },
          },
        },
        orderBy: { title: "asc" },
      });

      return acceptedSubmissions;
    }),

  updatePaymentStatus: chairProcedure
    .input(
      z.object({
        conferenceId: z.string(),
        authorId: z.string(),
        hasPaid: z.boolean(),
      })
    )
    .mutation(async ({ ctx, input }) => {
      const { conferenceId, authorId, hasPaid } = input;

      // Verify the author belongs to a submission in this conference
      const author = await ctx.prisma.submissionAuthor.findFirst({
        where: {
          id: authorId,
          submission: {
            conferenceId,
          },
        },
        include: {
          submission: {
            select: {
              title: true,
              conference: {
                select: {
                  title: true,
                  acronym: true,
                },
              },
            },
          },
        },
      });

      if (!author) {
        throw new TRPCError({
          code: "NOT_FOUND",
          message: "Author not found or not part of this conference",
        });
      }

      try {
        const updatedAuthor = await ctx.prisma.submissionAuthor.update({
          where: { id: authorId },
          data: { hasPaid },
        });

        return {
          success: true,
          message: `Payment status updated successfully for ${author.firstName} ${author.lastName}`,
          author: {
            id: updatedAuthor.id,
            firstName: author.firstName,
            lastName: author.lastName,
            hasPaid: updatedAuthor.hasPaid,
          },
        };
      } catch (error) {
        console.error("Error updating payment status:", error);
        throw new TRPCError({
          code: "INTERNAL_SERVER_ERROR",
          message: "Failed to update payment status",
        });
      }
    }),
});
