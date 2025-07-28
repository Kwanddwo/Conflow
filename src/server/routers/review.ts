import { z } from "zod";
import { reviewerProcedure, router } from "../trpc";

export const reviewRouter = router({
  getReviewerReview: reviewerProcedure
    .input(z.object({ reviewId: z.string() }))
    .query(async ({ input, ctx }) => {
      const { reviewId } = input;
      const review = await ctx.prisma.reviews.findUnique({
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
});
