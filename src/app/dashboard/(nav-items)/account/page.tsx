"use client";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { trpc } from "@/server/client";
import { User, Mail, Building, Globe, Save, X } from "lucide-react";
import { getName } from "country-list";
import { useEffect, useState } from "react";
import { toast } from "sonner";
import { z } from "zod";
import { Controller, useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import CountrySelect from "@/components/CountrySelect";

const accountSchema = z.object({
  firstName: z.string().min(1, "First Name is required"),
  lastName: z.string().min(1, "Last Name is required"),
  affiliation: z.string().min(1, "Affiliation is required"),
  country: z.string().min(1, "Country is required"),
});

type AccountData = z.infer<typeof accountSchema>;



export default function AccountPage() {
  const { data: user, isPending, error } = trpc.user.getProfile.useQuery();
  const [isEditing, setIsEditing] = useState(false);
  const utils = trpc.useUtils();
  const {
    control,
    register,
    handleSubmit,
    reset,
    formState: { errors, isSubmitting },
  } = useForm<AccountData>({
    resolver: zodResolver(accountSchema),
    defaultValues: {
      firstName: "",
      lastName: "",
      affiliation: "",
      country: "",
    },
  });

  useEffect(() => {
    if (user) {
      reset({
        firstName: user.firstName,
        lastName: user.lastName,
        affiliation: user.affiliation,
        country: user.country,
      });
    }
  }, [user, reset]);
  const { mutateAsync, isPending: isUpdating } =
    trpc.user.updateProfile.useMutation();

  const onSubmit = async(data: AccountData) => {
    console.log("Saving user data:", data);
    try{
      const res = await mutateAsync(data);
      await utils.user.getProfile.invalidate();
      reset({
        firstName: res.firstName,
        lastName: res.lastName,
        affiliation: res.affiliation,
        country: res.country,
      });
      toast.success("Account updated successfully!");
    }catch (error) {
      console.error("Error updating account:", error);
      toast.error("Failed to update account.");
    }finally {
        setIsEditing(false);
    }
  };

  if (isPending) {
    return (
      <div className="main-content-height flex items-center justify-center">
        <div className="w-12 h-12 border-4 border-border border-t-primary rounded-full animate-spin"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="main-content-height flex items-center justify-center">
        <p className="text-destructive text-lg font-semibold">
          Error: {error.message}
        </p>
      </div>
    );
  }

  if (!user) {
    return (
      <div className="main-content-height flex items-center justify-center">
        <p className="text-muted-foreground text-lg font-semibold">
          No user data found.
        </p>
      </div>
    );
  }

  return (
    <div className="main-content-height flex items-center justify-center p-6">
      <div className="w-full max-w-md">
        <form onSubmit={handleSubmit(onSubmit)}>
          <Card className="border-border shadow-sm">
            <CardHeader className="text-center pb-4">
              <CardTitle className="text-2xl font-semibold text-foreground">
                Account Information
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              {/* First Name */}
              <FieldWrapper icon={<User />} label="First Name">
                {isEditing ? (
                  <>
                    <Input {...register("firstName")} />
                    {errors.firstName && (
                      <p className="text-sm text-destructive mt-1">
                        {errors.firstName.message}
                      </p>
                    )}
                  </>
                ) : (
                  <TextValue>{user.firstName}</TextValue>
                )}
              </FieldWrapper>

              {/* Last Name */}
              <FieldWrapper icon={<User />} label="Last Name">
                {isEditing ? (
                  <>
                    <Input {...register("lastName")} />
                    {errors.lastName && (
                      <p className="text-sm text-destructive mt-1">
                        {errors.lastName.message}
                      </p>
                    )}
                  </>
                ) : (
                  <TextValue>{user.lastName}</TextValue>
                )}
              </FieldWrapper>

              {/* Email */}
              <FieldWrapper icon={<Mail />} label="Email">
                <TextValue>{user.email}</TextValue>
                {isEditing && (
                  <p className="text-xs text-muted-foreground mt-1">
                    Email cannot be changed
                  </p>
                )}
              </FieldWrapper>

              {/* Affiliation */}
              <FieldWrapper icon={<Building />} label="Affiliation">
                {isEditing ? (
                  <>
                    <Input {...register("affiliation")} />
                    {errors.affiliation && (
                      <p className="text-sm text-destructive mt-1">
                        {errors.affiliation.message}
                      </p>
                    )}
                  </>
                ) : (
                  <TextValue>{user.affiliation}</TextValue>
                )}
              </FieldWrapper>

              {/* Country */}
              <FieldWrapper icon={<Globe />} label="Country">
                {isEditing ? (
                  <>
                    <Controller
                      control={control}
                      name="country"
                      render={({ field }) => (
                        <CountrySelect
                          field={field}
                          isSubmitting={isSubmitting}
                          isPending={isPending}
                        />
                      )}
                    />
                    {errors.country && (
                      <p className="text-sm text-destructive mt-1">
                        {errors.country.message}
                      </p>
                    )}
                  </>
                ) : (
                  <TextValue>{getName(user.country)}</TextValue>
                )}
              </FieldWrapper>

              {/* Actions */}
              <div className="pt-4">
                {isEditing ? (
                  <div className="flex gap-2">
                    <Button
                      type="submit"
                      className="flex-1 py-3 text-base font-medium"
                      disabled={isSubmitting || isUpdating}
                    >
                      <Save className="w-4 h-4 mr-2" />
                      Save Changes
                    </Button>
                    <Button
                      type="button"
                      variant="outline"
                      onClick={() => {
                        reset();
                        setIsEditing(false);
                      }}
                      className="flex-1 py-3 text-base font-medium"
                    >
                      <X className="w-4 h-4 mr-2" />
                      Cancel
                    </Button>
                  </div>
                ) : (
                  <Button
                    type="button"
                    onClick={() => setIsEditing(true)}
                    className="w-full py-3 text-base font-medium"
                  >
                    Edit Account
                  </Button>
                )}
              </div>
            </CardContent>
          </Card>
        </form>
      </div>
    </div>
  );
}

const FieldWrapper = ({
  icon,
  label,
  children,
}: {
  icon: React.ReactNode;
  label: string;
  children: React.ReactNode;
}) => (
  <div className="space-y-2">
    <div className="flex items-center gap-3">
      <div className="text-muted-foreground">{icon}</div>
      <div className="flex-1">
        <p className="text-sm font-medium text-muted-foreground">{label}</p>
        {children}
      </div>
    </div>
  </div>
);

const TextValue = ({ children }: { children: React.ReactNode }) => (
  <p className="text-base text-foreground mt-1">{children}</p>
);
