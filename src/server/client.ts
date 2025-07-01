import { AppRouter } from ".";
import { createTRPCReact } from "@trpc/react-query";
import { httpBatchLink } from "@trpc/react-query";

export const trpc = createTRPCReact<AppRouter>();

export const createTRPCClient = () => {
    return trpc.createClient({
        links: [
            httpBatchLink({
                url: "http://localhost:3000/api/trpc",
            }),
        ],
    });
};
