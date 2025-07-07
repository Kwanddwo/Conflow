import { authRouter } from "./routers/auth";
import { notificationRouter } from "./routers/notification";
import { userRouter } from "./routers/user";
import { router } from "./trpc";

export const appRouter = router({
    auth: authRouter,
    user : userRouter,
    notification: notificationRouter,
});

export type AppRouter = typeof appRouter;
