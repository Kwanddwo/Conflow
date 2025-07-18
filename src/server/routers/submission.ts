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
  firstName: z.string().min(1, "First Name is Required"),
  lastName: z.string().min(1, "Last Name is Required"),
  email: z.string().email("Invalid email"),
  country: z.string().min(1, "Country is required"),
  affiliation: z.string().min(1, "Affilliation is required"),
  isCorresponding: z.boolean(),
});
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
  addSubmissionAuthors: userProcedure
    .input(
      z.object({
        authors: z.array(authorSchema).min(1),
        submissionId: z.string(),
      })
    )
    .mutation(async ({ ctx, input }) => {
      const { authors, submissionId } = input;

      // Map authors to users if possible here
      await ctx.prisma.submissonAuthor.createMany({
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
});
