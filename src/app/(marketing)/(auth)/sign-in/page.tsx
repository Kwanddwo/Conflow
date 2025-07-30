"use client";
import { z } from "zod";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { getSession, signIn, useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { useEffect, useState } from "react";
import EmailVerificationTrigger from "../EmailVerificationTrigger";
import LoginForm from "@/components/LoginForm";

const loginSchema = z.object({
  email: z
    .string()
    .min(1, "Email is required")
    .email("Please enter a valid email address"),
  password: z.string().min(1, "Password is required"),
});

export type LoginFormData = z.infer<typeof loginSchema>;

export default function LoginPage() {
  const router = useRouter();

  const { status, data: session } = useSession();

  useEffect(() => {
    if (status === "authenticated" && session && session.user.isVerified) {
      router.push("/dashboard");
    }
  }, [session, status, router]);

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

  const [step, setStep] = useState<"login" | "verify">("login");
  const [email, setEmail] = useState<string>("");

  const onSubmit = async (data: LoginFormData) => {
    try {
      setEmail(data.email);
      const res = await signIn("credentials", {
        email: data.email,
        password: data.password,
        redirect: false,
      });
      if (res?.error) {
        toast.error("Invalid credentials. Please try again.");
      } else {
        const session = await getSession();
        const user = session?.user as { isVerified: boolean; role: string };

        if (!user?.isVerified) {
          toast.warning("Please verify your email.");
          setStep("verify");
        } else {
          toast.success("Login successful");
          if (user.role === "ADMIN") router.push("/admin");
          if (user.role === "USER") router.push("/dashboard");
        }
      }
    } catch (error) {
      console.log("Login error:", error);
    }
  };

  return (
    <>
      {step === "login" && (
        <LoginForm
          handleSubmit={handleSubmit}
          onSubmit={onSubmit}
          isSubmitting={isSubmitting}
          register={register}
          errors={errors}
        />
      )}
      {step === "verify" && (
        <EmailVerificationTrigger email={email} from="sign-in" />
      )}
    </>
  );
}
