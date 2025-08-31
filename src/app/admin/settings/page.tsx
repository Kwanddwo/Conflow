"use client";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { toast } from "sonner";
import z from "zod";
import { trpc } from "@/server/client";
import { Loader2, Key } from "lucide-react";
import {
  passwordValidation,
  PASSWORD_REQUIREMENTS_TEXT,
} from "@/lib/validations/password";

const changePasswordSchema = z
  .object({
    currentPassword: z.string().min(1, "Current password is required"),
    newPassword: passwordValidation,
    confirmPassword: z.string(),
  })
  .refine((data) => data.newPassword === data.confirmPassword, {
    path: ["confirmPassword"],
    message: "Passwords do not match",
  });

type ChangePasswordData = z.infer<typeof changePasswordSchema>;

export default function AdminSettingsPage() {
  const {
    register,
    handleSubmit,
    reset,
    formState: { errors, isSubmitting },
  } = useForm<ChangePasswordData>({
    resolver: zodResolver(changePasswordSchema),
    defaultValues: {
      currentPassword: "",
      newPassword: "",
      confirmPassword: "",
    },
  });

  const { mutateAsync: changePassword } = trpc.auth.changePassword.useMutation({
    onSuccess: () => {
      toast.success(
        "Password changed successfully! Please use your new password for future logins."
      );
      reset();
    },
    onError: (error) => {
      toast.error(error.message || "Failed to change password");
    },
  });

  const onSubmit = async (data: ChangePasswordData) => {
    try {
      await changePassword({
        currentPassword: data.currentPassword,
        newPassword: data.newPassword,
      });
    } catch (error) {
      // Error handling is done in the mutation's onError
      console.error("Password change error:", error);
    }
  };

  return (
    <div className="main-content-height bg-gradient-to-br from-background via-muted/20 to-muted/40 p-8">
      <div className="max-w-2xl mx-auto space-y-8">
        <div className="text-center space-y-4">
          <h1 className="text-4xl font-bold tracking-tight bg-gradient-to-r from-foreground to-foreground/70 bg-clip-text text-transparent">
            Admin Settings
          </h1>
          <p className="text-muted-foreground text-lg">
            Manage your admin account settings and security
          </p>
        </div>

        <Card>
          <CardHeader className="space-y-1">
            <div className="flex items-center gap-2">
              <div className="flex h-8 w-8 items-center justify-center rounded-full bg-primary/10">
                <Key className="h-4 w-4 text-primary" />
              </div>
              <CardTitle className="text-xl">Change Password</CardTitle>
            </div>
            <CardDescription>
              Update your password to keep your account secure. Your new
              password must meet all security requirements. You will need to
              enter your current password to confirm this change.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="current-password">Current Password</Label>
                <Input
                  id="current-password"
                  type="password"
                  placeholder="Enter your current password"
                  {...register("currentPassword")}
                  disabled={isSubmitting}
                />
                {errors.currentPassword && (
                  <p className="text-sm text-destructive">
                    {errors.currentPassword.message}
                  </p>
                )}
              </div>

              <div className="space-y-2">
                <Label htmlFor="new-password">New Password</Label>
                <Input
                  id="new-password"
                  type="password"
                  placeholder="Enter your new password"
                  {...register("newPassword")}
                  disabled={isSubmitting}
                />
                {errors.newPassword ? (
                  <p className="text-sm text-destructive">
                    {errors.newPassword.message}
                  </p>
                ) : (
                  <p className="text-sm text-muted-foreground">
                    {PASSWORD_REQUIREMENTS_TEXT}
                  </p>
                )}
              </div>

              <div className="space-y-2">
                <Label htmlFor="confirm-password">Confirm New Password</Label>
                <Input
                  id="confirm-password"
                  type="password"
                  placeholder="Confirm your new password"
                  {...register("confirmPassword")}
                  disabled={isSubmitting}
                />
                {errors.confirmPassword && (
                  <p className="text-sm text-destructive">
                    {errors.confirmPassword.message}
                  </p>
                )}
              </div>

              <div className="flex justify-end pt-4">
                <Button
                  type="submit"
                  disabled={isSubmitting}
                  className="min-w-[120px]"
                >
                  {isSubmitting ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Changing...
                    </>
                  ) : (
                    "Change Password"
                  )}
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
