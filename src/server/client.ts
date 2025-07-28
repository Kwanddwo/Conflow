import { AppRouter } from ".";
import { createTRPCReact } from "@trpc/react-query";
import { httpBatchLink } from "@trpc/react-query";

export const trpc = createTRPCReact<AppRouter>();
const FRONTEND_URL = process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000";
export const createTRPCClient = () => {
    return trpc.createClient({
        links: [
            httpBatchLink({
                url: `${FRONTEND_URL}/api/trpc`,
            }),
        ],
    });
};
