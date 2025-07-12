// server/api/routers/author.ts
import { z } from "zod";
import {userProcedure,router} from "../trpc";
const authorSchema = z.object({
  firstName: z.string().min(1, "Required"),
  lastName: z.string().min(1, "Required"),
  email: z.string().email("Invalid email"),
  country: z.string().min(1, "Required"),
  affiliation: z.string().min(1, "Required"),
  isCorresponding: z.boolean(),
});
export const submissionRouter = router({
  addSubmissionAuthors: userProcedure
    .input(z.object({ authors: z.array(authorSchema).min(1),submissionId: z.string() }))
    .mutation(async ({ ctx,input }) => {
      const { authors, submissionId } = input;

      await ctx.prisma.submissonAuthor.createMany({
        data: authors.map(author => ({
          ...author,
          submissionId
        })), 
        skipDuplicates: true, 
      });

      return { success: true };
    }),
  addPaperSubmission: userProcedure
    .input(z.object({
      title: z.string(),
      abstract: z.string(),
      primary_area: z.string(),
      secondary_area: z.string(),
      keywords: z.array(z.string()),
      fileUrl: z.string(),
      fileName: z.string(),
      conferenceId: z.string(),
    }))
    .mutation(async ({ ctx,input }) => {
      const { title, abstract, primary_area,secondary_area, keywords, fileUrl, fileName, conferenceId } = input;

      const submission = await ctx.prisma.submission.create({
        data: {
          title,
          abstract,
          primary_area : primary_area,
          secondary_areas : secondary_area,
          keywords,
          paper_file_path : fileUrl,
          paper_file_name : fileName,
          conferenceId,
          submitted_by : ctx.session.user.id,
          submitted_at : "",
          camera_ready_file_path : "",
          camera_ready_file_name : ""
        },
      });

      return { success: true, submissionId: submission.id };
    }),
});
