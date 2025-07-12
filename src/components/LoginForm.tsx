"use client"
import Link from "next/link";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "./ui/card";
import { Input } from "./ui/input";
import { Label } from "./ui/label";
import { Button } from "./ui/button";
import { Loader2 } from "lucide-react";
import { useForm } from "react-hook-form";
import { LoginFormData } from "@/app/(marketing)/(auth)/sign-in/page";

function LoginForm({
  onSubmit,
  isSubmitting,
  register,
  errors,
  handleSubmit,
}: {
  onSubmit: (data: LoginFormData) => Promise<void>;
  isSubmitting: boolean;
  register: ReturnType<typeof useForm<LoginFormData>>["register"];
  errors: ReturnType<typeof useForm<LoginFormData>>["formState"]["errors"];
  handleSubmit: ReturnType<typeof useForm<LoginFormData>>["handleSubmit"];
}) {
  return (
    <div className="main-content-height flex items-center justify-center bg-background px-4 py-6 sm:py-12 sm:px-6 lg:px-8">
      <Card className="w-full max-w-md">
        <CardHeader className="space-y-1 px-4 sm:px-6">
          <CardTitle className="text-xl sm:text-2xl font-bold text-center text-foreground">
            Sign in
          </CardTitle>
          <CardDescription className="text-center text-muted-foreground">
            Enter your email and password to access your account
          </CardDescription>
        </CardHeader>
        <form onSubmit={handleSubmit(onSubmit)}>
          <CardContent className="space-y-4 px-4 sm:px-6">
            <div className="space-y-2">
              <Label htmlFor="email" className="text-foreground">Email</Label>
              <Input
                id="email"
                type="email"
                placeholder="Enter your email"
                {...register("email")}
                disabled={isSubmitting}
                className="w-full"
              />
              {errors.email && (
                <p className="text-sm text-destructive">{errors.email.message}</p>
              )}
            </div>
            <div className="space-y-2 mb-4">
              <div className="flex items-center justify-between">
                <Label htmlFor="password" className="text-foreground">Password</Label>
                <Link
                  href="/sign-in/forgot-password"
                  className="text-sm text-primary hover:text-primary/80 hover:underline transition-colors"
                >
                  Forgot password?
                </Link>
              </div>
              <Input
                id="password"
                type="password"
                placeholder="Enter your password"
                {...register("password")}
                autoComplete="new-password"
                disabled={isSubmitting}
                className="w-full"
              />
              {errors.password && (
                <p className="text-sm text-destructive">
                  {errors.password.message}
                </p>
              )}
            </div>
          </CardContent>
          <CardFooter className="flex flex-col space-y-4 px-4 sm:px-6">
            <Button
              type="submit"
              className="w-full cursor-pointer"
              disabled={isSubmitting}
            >
              {isSubmitting && (
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              )}
              Sign in
            </Button>
            <div className="text-center text-sm text-muted-foreground">
              {"Don't have an account? "}
              <Link
                href="/sign-up"
                className="text-primary hover:text-primary/80 hover:underline font-medium transition-colors"
              >
                Sign up
              </Link>
            </div>
          </CardFooter>
        </form>
      </Card>
    </div>
  );
}
export default LoginForm;