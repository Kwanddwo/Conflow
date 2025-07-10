import { authRouter } from "./routers/auth";
import { notificationRouter } from "./routers/notification";
import { userRouter } from "./routers/user";
import { conferenceRouter } from "./routers/conference";
import { router } from "./trpc";

export const appRouter = router({
  auth: authRouter,
  user: userRouter,
  notification: notificationRouter,
  conference: conferenceRouter,
});

export type AppRouter = typeof appRouter;
