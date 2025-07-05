import { initTRPC, TRPCError } from "@trpc/server";
import { Context } from "./context";


const trpc = initTRPC.context<Context>().create();

export const router = trpc.router;
export const procedure = trpc.procedure;

export const protectedProcedure = trpc.procedure.use(({ ctx, next }) => {
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


export const adminProcedure = protectedProcedure.use(async ({ ctx, next }) => {
  const user = await ctx.prisma.user.findUnique({
    where: { id: ctx.session.user.id },
    select: { isAdmin: true },
  });

  if (!user?.isAdmin) {
    throw new TRPCError({
      code: "FORBIDDEN",
      message: "Admin access required",
    });
  }

  return next({ ctx });
});
