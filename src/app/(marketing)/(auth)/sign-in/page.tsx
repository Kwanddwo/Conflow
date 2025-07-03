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
import Link from "next/link";
import { z } from "zod";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { getSession, signIn } from "next-auth/react"; 
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { Loader2 } from "lucide-react";
import { useState } from "react";
import EmailVerificationTrigger from "../EmailVerificationTrigger";
const loginSchema = z.object({
  email: z
    .string()
    .min(1, "Email is required")
    .email("Please enter a valid email address"),
  password: z
    .string()
    .min(1, "Password is required")
});

type LoginFormData = z.infer<typeof loginSchema>;

export default function LoginPage() {
  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<LoginFormData>({
    resolver: zodResolver(loginSchema),
    defaultValues: {
      email: "",
      password: "",
    },
  });
  const router = useRouter();
  const [step, setStep] = useState<"login" | "verify">("login");
  const [email, setEmail] = useState<string>("");
  const onSubmit = async (data: LoginFormData) => {
    try {
      setEmail(data.email);
      const res = await signIn('credentials', { email: data.email, password: data.password, redirect: false });
      if (res?.error) {
        toast.error("Invalid credentials. Please try again.");
      } else {
        const session = await getSession();
        const user = session?.user as { isVerified: boolean };
      
        if (!user?.isVerified) {
          toast.warning("Please verify your email.");
          setStep("verify");
        } else {
          toast.success("Login successful");
          router.push("/dashboard");
        }
      }
    } catch (error) {
      console.log("Login error:", error);
    }
  };
  const LoginForm = () => (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 px-4 py-12 sm:px-6 lg:px-8">
      <Card className="w-full max-w-md">
        <CardHeader className="space-y-1">
          <CardTitle className="text-2xl font-bold text-center">
            Sign in
          </CardTitle>
          <CardDescription className="text-center">
            Enter your email and password to access your account
          </CardDescription>
        </CardHeader>
        <form onSubmit={handleSubmit(onSubmit)}>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="email">Email</Label>
              <Input
                id="email"
                type="email"
                placeholder="Enter your email"
                {...register("email")}
                className={
                  errors.email ? "border-red-500 focus:border-red-500" : ""
                }
                disabled={isSubmitting}
              />
              {errors.email && (
                <p className="text-sm text-red-500">{errors.email.message}</p>
              )}
            </div>
            <div className="space-y-2 mb-4">
              <div className="flex items-center justify-between">
                <Label htmlFor="password">Password</Label>
                <Link
                  href="/forgot-password"
                  className="text-sm text-blue-600 hover:text-blue-500 hover:underline"
                >
                  Forgot password?
                </Link>
              </div>
              <Input
                id="password"
                type="password"
                placeholder="Enter your password"
                {...register("password")}
                className={
                  errors.password
                    ? "border-red-500 focus:border-red-500 pr-10"
                    : "pr-10"
                }
                disabled={isSubmitting}
              />
              {errors.password && (
                <p className="text-sm text-red-500">
                  {errors.password.message}
                </p>
              )}
            </div>
          </CardContent>
          <CardFooter className="flex flex-col space-y-4">
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
            <div className="text-center text-sm text-gray-600">
              {"Don't have an account? "}
              <Link
                href="/sign-up"
                className="text-blue-600 hover:text-blue-500 hover:underline font-medium"
              >
                Sign up
              </Link>
            </div>
          </CardFooter>
        </form>
      </Card>
    </div>
  )
  return (
     <>
      {step === "login" && <LoginForm />}
      {step === "verify" && <EmailVerificationTrigger email={email} from="sign-in"/>}
    </>
  );
}
