"use client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { trpc } from "@/server/client";
import { zodResolver } from "@hookform/resolvers/zod";
import { TRPCClientError } from "@trpc/client";
import { Loader2 } from "lucide-react";
import { useState } from "react";
import { useForm, Controller } from "react-hook-form";
import { toast } from "sonner";
import z from "zod";
import EmailVerificationTrigger from "../EmailVerificationTrigger";
const registerSchema = z
  .object({
    firstName: z.string().min(1, "First name is required"),
    lastName: z.string().min(1, "Last name is required"),
    email: z
      .string()
      .min(1, "Email is Required")
      .email("Please enter a valid email adress"),
    password: z.string().min(6, "Password must be at least 6 characters"),
    country: z.string().min(1, "Country is required"),
    affiliation: z.string().min(1, "Affiliation is required"),
  })
type RegisterFormData = z.infer<typeof registerSchema>;
export default function SignUpForm() {
  const [step, setStep] = useState<"register" | "verify">("register");
  const [email, setEmail] = useState<string>("");
  const {
    register,
    handleSubmit,
    control,
    formState: { errors, isSubmitting },
  } = useForm<RegisterFormData>({
    resolver: zodResolver(registerSchema),
    defaultValues: {
      firstName: "",
      lastName: "",
      email: "",
      password: "",
      country: "",
      affiliation: "",
    },
  });
  const { mutateAsync, isPending } = trpc.auth.register.useMutation()
  const onSubmit = async (data: RegisterFormData) => {
    try {
      const result = await mutateAsync(data)
      console.log('Registered:', result.user)
      toast.success("Registered successfully");
      setEmail(data.email);
      setStep("verify");
    } catch (err) {
      const errorMessage =
        err instanceof TRPCClientError
          ? err.message
          : "An unexpected error occurred";

      toast.error(errorMessage);
      console.error("Registration failed:", err);
    }
  };
  const RegisterComponent = () => (
    <div className="min-h-[65vh] bg-[#f8fafc] flex items-center justify-center p-4">
      <div className="w-full max-w-xl bg-white p-8 rounded-lg shadow">
        <form className="space-y-6" onSubmit={handleSubmit(onSubmit)}>
          <div className="space-y-2">
            <Label htmlFor="firstName" className="text-[#0f172a] font-medium">
              First Name
            </Label>
            <Input
              id="firstName"
              type="text"
              placeholder="First Name"
              className="w-full px-4 py-3 border border-[#cbd5e1] rounded-lg placeholder:text-[#94a3b8] focus:border-[#64748b] focus:ring-1 focus:ring-[#64748b]"
              {...register("firstName")}
              disabled={isSubmitting || isPending}
            />
            {errors.firstName && (
              <p className="text-sm text-red-500">
                {errors.firstName.message}
              </p>
            )}
          </div>

          <div className="space-y-2">
            <Label htmlFor="lastName" className="text-[#0f172a] font-medium">
              Last Name
            </Label>
            <Input
              id="lastName"
              type="text"
              placeholder="Last Name"
              className="w-full px-4 py-3 border border-[#cbd5e1] rounded-lg placeholder:text-[#94a3b8] focus:border-[#64748b] focus:ring-1 focus:ring-[#64748b]"
              {...register("lastName")}
              disabled={isSubmitting || isPending}
            />
            {errors.lastName && (
              <p className="text-sm text-red-500">
                {errors.lastName.message}
              </p>
            )}
          </div>

          <div className="space-y-2">
            <Label htmlFor="email" className="text-[#0f172a] font-medium">
              Email
            </Label>
            <Input
              id="email"
              type="email"
              placeholder="Email"
              className="w-full px-4 py-3 border border-[#cbd5e1] rounded-lg placeholder:text-[#94a3b8] focus:border-[#64748b] focus:ring-1 focus:ring-[#64748b]"
              {...register("email")}
              disabled={isSubmitting || isPending}
            />
            {errors.email && (
              <p className="text-sm text-red-500">
                {errors.email.message}
              </p>
            )}
          </div>

          <div className="space-y-2">
            <Label htmlFor="password" className="text-[#0f172a] font-medium">
              Password
            </Label>
            <Input
              id="password"
              type="password"
              placeholder="Password"
              className="w-full px-4 py-3 border border-[#cbd5e1] rounded-lg placeholder:text-[#94a3b8] focus:border-[#64748b] focus:ring-1 focus:ring-[#64748b]"
              {...register("password")}
              disabled={isSubmitting || isPending}
            />
            {errors.password && (
              <p className="text-sm text-red-500">
                {errors.password.message}
              </p>
            )}
            <p className="text-[#94a3b8] text-sm">
              Make sure your password has atleast 8 characters, and is a mix of
              lowercase characters, uppercase characters and numbers.
            </p>
          </div>

          <div className="space-y-2">
            <Label htmlFor="country" className="text-[#0f172a] font-medium">
              Country
            </Label>
            <Controller
              name="country"
              control={control}
              render={({ field }) => (
                <Select
                  onValueChange={field.onChange}
                  value={field.value}
                  defaultValue={field.value}
                  disabled={isSubmitting || isPending}
                >
                  <SelectTrigger
                    ref={field.ref}
                    onBlur={field.onBlur}
                    className="w-full px-4 py-3 border border-[#cbd5e1] rounded-lg text-[#94a3b8] focus:border-[#64748b] focus:ring-1 focus:ring-[#64748b]"
                  >
                    <SelectValue placeholder="Country/region" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="united states">United States</SelectItem>
                    <SelectItem value="canada">Canada</SelectItem>
                    <SelectItem value="united kingdom">United Kingdom</SelectItem>
                    <SelectItem value="australia">Australia</SelectItem>
                    <SelectItem value="germany">Germany</SelectItem>
                    <SelectItem value="france">France</SelectItem>
                    <SelectItem value="japan">Japan</SelectItem>
                    <SelectItem value="other">Other</SelectItem>
                  </SelectContent>
                </Select>
              )}
            />

            {errors.country && (
              <p className="text-sm text-red-500">{errors.country.message}</p>
            )}
          </div>

          <div className="space-y-2">
            <Label htmlFor="affiliation" className="text-[#0f172a] font-medium">
              Affiliation
            </Label>
            <Input
              id="affiliation"
              type="text"
              placeholder="Affiliation"
              className="w-full px-4 py-3 border border-[#cbd5e1] rounded-lg placeholder:text-[#94a3b8] focus:border-[#64748b] focus:ring-1 focus:ring-[#64748b]"
              {...register("affiliation")}
              disabled={isSubmitting || isPending}
            />
            {errors.affiliation && (
              <p className="text-sm text-red-500">
                {errors.affiliation.message}
              </p>
            )}
            <p className="text-[#94a3b8] text-sm">
              Enter the laboratory you are associated with.
            </p>
          </div>

          <Button
            type="submit"
            className="w-full bg-[#0f172a] hover:bg-[#0f172a]/90 text-white py-3 rounded-lg font-medium cursor-pointer"
            disabled={isSubmitting || isPending}
          >
            {(isSubmitting || isPending) && (
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
            )}
            Sign Up
          </Button>
        </form>
      </div>
    </div>
  )
  return (
    <>
      {step === "register" && <RegisterComponent />}
      {step === "verify" && <EmailVerificationTrigger email={email} from="sign-up"/>}
    </>
  );
}
