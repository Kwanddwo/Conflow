/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { trpc } from "@/server/client";
import { zodResolver } from "@hookform/resolvers/zod";
import { TRPCClientError } from "@trpc/client";
import { Loader2 } from "lucide-react";
import { useState } from "react";
import { useForm, Controller } from "react-hook-form";
import { toast } from "sonner";
import z from "zod";
import EmailVerificationTrigger from "../EmailVerificationTrigger";
import CountrySelect from "@/components/CountrySelect";
import { passwordValidation, PASSWORD_REQUIREMENTS_TEXT } from "@/lib/validations/password";

const registerSchema = z.object({
  firstName: z.string().min(1, "First name is required"),
  lastName: z.string().min(1, "Last name is required"),
  email: z
    .string()
    .min(1, "Email is required")
    .email("Must be a valid email address"),
  password: passwordValidation,
  country: z
    .string()
    .min(1, "Country is required")
    .max(2, "Country code must be 2 characters")
    .refine((countryCode) => countryCode === countryCode.toLowerCase(), {
      message: "Country code must be lowercase",
    }),
  affiliation: z.string().min(1, "Affiliation is required"),
});

type RegisterFormData = z.infer<typeof registerSchema>;

const RegisterComponent = ({
  register,
  control,
  errors,
  isSubmitting,
  isPending,
  handleSubmit,
  onSubmit,
}: {
  register: any;
  control: any;
  errors: any;
  isSubmitting: boolean;
  isPending: boolean;
  handleSubmit: any;
  onSubmit: (data: any) => void;
}) => (
  <div className="main-content-height bg-[#f8fafc] flex items-center justify-center p-4">
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
            <p className="text-sm text-red-500">{errors.firstName.message}</p>
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
            <p className="text-sm text-red-500">{errors.lastName.message}</p>
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
            <p className="text-sm text-red-500">{errors.email.message}</p>
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
          {errors.password ? (
            <p className="text-sm text-red-500">{errors.password.message}</p>
          ) : (
            <p className="text-[#94a3b8] text-sm">
              {PASSWORD_REQUIREMENTS_TEXT}
            </p>
          )}
        </div>

        <div className="space-y-2">
          <Label htmlFor="country" className="text-[#0f172a] font-medium">
            Country
          </Label>
          <Controller
            name="country"
            control={control}
            render={({ field }) =>
              CountrySelect(field, isSubmitting, isPending)
            }
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
            <p className="text-sm text-red-500">{errors.affiliation.message}</p>
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
);

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
  const { mutateAsync, isPending } = trpc.auth.register.useMutation();
  const onSubmit = async (data: RegisterFormData) => {
    try {
      const result = await mutateAsync(data);
      console.log("Registered:", result.user);
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

  return (
    <>
      {step === "register" && (
        <RegisterComponent
          register={register}
          control={control}
          errors={errors}
          isSubmitting={isSubmitting}
          isPending={isPending}
          handleSubmit={handleSubmit}
          onSubmit={onSubmit}
        />
      )}
      {step === "verify" && (
        <EmailVerificationTrigger email={email} from="sign-up" />
      )}
    </>
  );
}
