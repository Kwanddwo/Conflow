// server/api/routers/submission.ts
import { z } from "zod";
import {
  userProcedure,
  router,
  chairProcedure,
  verifiedNoConferenceRoleProcedure,
} from "../trpc";
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
      });

      if (!submission) {
        throw new Error("Failed to create submission");
      }

      return { success: true, submissionId: submission.id };
    }),
});
