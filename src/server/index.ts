import { authRouter } from "./routers/auth";
import { notificationRouter } from "./routers/notification";
import { userRouter } from "./routers/user";
import { conferenceRouter } from "./routers/conference";
import { router } from "./trpc";
import { submissionRouter } from "./routers/submission";
import { reviewRouter } from "./routers/review";

export const appRouter = router({
  auth: authRouter,
  user: userRouter,
  notification: notificationRouter,
  conference: conferenceRouter,
  submission : submissionRouter,
  review : reviewRouter,
});

export type AppRouter = typeof appRouter;
 