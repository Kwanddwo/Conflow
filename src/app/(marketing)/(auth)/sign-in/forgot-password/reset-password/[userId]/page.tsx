"use client";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { zodResolver } from "@hookform/resolvers/zod";
import { useParams, useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import z from "zod";
import { TRPCClientError } from "@trpc/client";
import { toast } from "sonner";
import { trpc } from "@/server/client";
import { Loader2 } from "lucide-react";
import { passwordValidation, PASSWORD_REQUIREMENTS_TEXT } from "@/lib/validations/password";

const ResetFormDataSchema = z
  .object({
    password: passwordValidation,
    confirmPassword: z.string(),
  })
  .refine((data) => data.password === data.confirmPassword, {
    path: ["confirmPassword"],
    message: "Passwords do not match",
  });

type ResetFormData = z.infer<typeof ResetFormDataSchema>;
export default function ResetPassword() {
  const router = useRouter();
  const params = useParams();
  const userId = params.userId as string;
  const resetPassword = trpc.auth.resetUserPassword.useMutation();
  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<ResetFormData>({
    resolver: zodResolver(ResetFormDataSchema),
    defaultValues: {
      password: "",
      confirmPassword: "",
    },
  });
  const onSubmit = async (data: ResetFormData) => {
    try {
      await resetPassword.mutateAsync({
        userId: userId,
        newPassword: data.password,
      });
      toast.success("Password reset successful");
      router.push("/sign-in");
    } catch (error) {
      if (error instanceof TRPCClientError) {
        toast.error(error.message);
      } else {
        toast.error("Something went wrong");
      }
    }
  };
  return (
    <div className="main-content-height flex items-center justify-center p-4 bg-muted/50">
      <Card className="w-full max-w-md">
        <CardHeader className="space-y-1">
          <CardTitle className="text-2xl font-bold text-center">
            Reset Password
          </CardTitle>
          <CardDescription className="text-center">
            Enter your new password below
          </CardDescription>
        </CardHeader>
        <form onSubmit={handleSubmit(onSubmit)}>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="new-password">New Password</Label>
              <Input
                id="new-password"
                type="password"
                placeholder="Enter your new password"
                {...register("password")}
                disabled={isSubmitting}
              />
              {errors.password ? (
                <p className="text-sm text-destructive">{errors.password.message}</p>
              ) : (
                <p className="text-sm text-muted-foreground">{PASSWORD_REQUIREMENTS_TEXT}</p>
              )}
            </div>
            <div className="space-y-2 mb-4">
              <Label htmlFor="confirm-password">Confirm Password</Label>
              <Input
                id="confirm-password"
                type="password"
                placeholder="Confirm your new password"
                {...register("confirmPassword")}
                disabled={isSubmitting}
              />
            </div>
            {errors.confirmPassword && (
              <p className="text-sm text-destructive">
                {errors.confirmPassword.message}
              </p>
            )}
          </CardContent>
          <CardFooter>
            <Button type="submit" className="w-full" disabled={isSubmitting}>
              {isSubmitting && (
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              )}
              Reset Password
            </Button>
          </CardFooter>
        </form>
      </Card>
    </div>
  );
}
