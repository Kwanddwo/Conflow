import z from "zod";
import { procedure, router } from "../trpc";
import { TRPCError } from "@trpc/server";
import { prisma } from "@/lib/prisma";
import { hashPassword } from "@/lib/hash";

export const authRouter = router({
    register: procedure
        .input(
            z.object({
                firstName: z.string(),
                lastName: z.string(),
                email: z.string().email(),
                password: z.string(),
                country: z.string(),
                affiliation : z.string(),
            })
        )
        .mutation(async ({ input }) => {
            const existingUser = await prisma.user.findUnique({
                where: { email: input.email },
            });

            if (existingUser) {
                throw new TRPCError({
                    code: "CONFLICT",
                    message: "Email already in use",
                });
            }

            const hashedPassword = await hashPassword(input.password);

            const user = await prisma.user.create({
                data: {
                    firstName: input.firstName,
                    lastName : input.lastName,
                    email: input.email,
                    password: hashedPassword,
                    country: input.country,
                    affiliation: input.affiliation,
                    isAdmin: false,
                    isVerified : false,
                },
                select: {
                    id: true,
                    firstName: true,
                    lastName :true,
                    email: true,
                },
            });

            return { user };
        }),
});
