"use client";

import { useForm, useFieldArray, Controller } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Plus,
  Trash2,
  User,
  UserCheck,
  Link,
  Unlink,
  UserPlus,
  Loader2,
} from "lucide-react";
import { z } from "zod";
import { useParams } from "next/navigation";
import { trpc } from "@/server/client";
import { toast } from "sonner";
import CountrySelect from "@/components/CountrySelect";
import { useRouter } from "next/navigation";
import UserChooser from "@/components/UserChooser";
import { useSession } from "next-auth/react";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { useEffect } from "react";

const authorSchema = z.object({
  id: z.string().optional(), // Add id for existing authors
  firstName: z.string().min(1, "First Name is Required"),
  lastName: z.string().min(1, "Last Name is Required"),
  email: z.string().email("Invalid email"),
  country: z.string().min(1, "Country is Required"),
  affiliation: z.string().min(1, "Affiliation is Required"),
  isCorresponding: z.boolean(),
  userId: z.string().optional(),
});

const formSchema = z.object({
  authors: z.array(authorSchema).min(1, "At least one author is required"),
});

type AuthorFormValues = z.infer<typeof formSchema>;

export default function AuthorForm() {
  const { conferenceId } = useParams<{ conferenceId: string }>();
  const router = useRouter();
  const { submissionId } = useParams<{ submissionId: string }>();
  const { data: session } = useSession();

  // Fetch existing authors
  const { data: existingAuthors, isLoading: isLoadingAuthors } =
    trpc.submission.getSubmissionAuthors.useQuery({ submissionId });

  const {
    control,
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
    watch,
    reset,
  } = useForm<AuthorFormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      authors: [],
    },
  });

  // Update form when data is loaded
  useEffect(() => {
    if (existingAuthors && existingAuthors.length > 0) {
      reset({
        authors: existingAuthors.map((author) => ({
          id: author.id,
          firstName: author.firstName,
          lastName: author.lastName,
          email: author.email,
          country: author.country,
          affiliation: author.affiliation,
          isCorresponding: author.isCorresponding,
          userId: author.userId || undefined,
        })),
      });
    } else if (
      existingAuthors &&
      existingAuthors.length === 0 &&
      session?.user
    ) {
      // If no existing authors, set current user as first author (for backward compatibility)
      reset({
        authors: [
          {
            firstName: session.user.firstName,
            lastName: session.user.lastName,
            email: session.user.email,
            country: session.user.country,
            affiliation: session.user.affiliation,
            isCorresponding: true,
            userId: session.user.id,
          },
        ],
      });
    }
  }, [existingAuthors, session, reset]);

  const { fields, append, remove } = useFieldArray({
    control,
    name: "authors",
  });

  const watchedAuthors = watch("authors");

  const { mutateAsync: updateAuthors, isPending: isUpdating } =
    trpc.submission.updateSubmissionAuthors.useMutation();

  const onSubmit = async (data: AuthorFormValues) => {
    const payload = {
      submissionId,
      authors: data.authors,
    };
    try {
      await updateAuthors(payload);
      toast.success("Authors updated successfully!");
      router.push(`/dashboard/conference/${conferenceId}/your-submissions/`);
    } catch (error) {
      console.error("Error updating authors:", error);
      toast.error("Failed to update authors.");
    }
  };

  const isLinkedUser = (index: number) => {
    return !!watchedAuthors[index]?.userId;
  };

  const isCurrentUser = (index: number) => {
    return watchedAuthors[index]?.userId === session?.user.id;
  };

  const unlinkUser = (index: number) => {
    const currentAuthor = watchedAuthors[index];
    // Keep the current data but remove the userId
    const updatedFields = [...fields];
    updatedFields[index] = {
      ...updatedFields[index],
      firstName: currentAuthor.firstName,
      lastName: currentAuthor.lastName,
      email: currentAuthor.email,
      country: currentAuthor.country,
      affiliation: currentAuthor.affiliation,
      isCorresponding: currentAuthor.isCorresponding,
      userId: undefined,
    };

    // Update the form
    remove(index);
    append({
      firstName: currentAuthor.firstName,
      lastName: currentAuthor.lastName,
      email: currentAuthor.email,
      country: currentAuthor.country,
      affiliation: currentAuthor.affiliation,
      isCorresponding: currentAuthor.isCorresponding,
      userId: undefined,
    });
  };

  const linkToCurrentUser = (index: number) => {
    if (!session?.user) return;

    // Debug: Check what data is available (removed debug logs for production safety)

    // Update the form with current user's data
    remove(index);
    append({
      firstName: session.user.firstName || "",
      lastName: session.user.lastName || "",
      email: session.user.email || "",
      country: session.user.country || "",
      affiliation: session.user.affiliation || "",
      isCorresponding:
        index === 0 ? true : watchedAuthors[index]?.isCorresponding || false,
      userId: session.user.id,
    });
  };

  // Show loading state
  if (isLoadingAuthors) {
    return (
      <div className="main-content-height flex items-center justify-center p-6">
        <div className="flex items-center gap-2">
          <Loader2 className="w-6 h-6 animate-spin" />
          <span>Loading authors...</span>
        </div>
      </div>
    );
  }

  return (
    <div className="main-content-height flex items-center justify-center p-6">
      <div className="w-full max-w-4xl">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-foreground mb-2">
            {existingAuthors && existingAuthors.length > 0
              ? "Edit Authors"
              : "Add Authors"}
          </h1>
          <p className="text-muted-foreground">
            Please provide information for all authors of this submission
          </p>
        </div>

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-8">
          {fields.map((field, index) => {
            const isLinked = isLinkedUser(index);
            const isCurrent = isCurrentUser(index);

            return (
              <div
                key={field.id}
                className={`space-y-4 border rounded-lg p-6 ${
                  isLinked ? "border-primary/30 bg-primary/5" : "border-border"
                }`}
              >
                {/* Hidden field for id */}
                <input type="hidden" {...register(`authors.${index}.id`)} />

                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <h2 className="text-lg font-semibold">
                      Author No. {index + 1}
                    </h2>

                    {isLinked && (
                      <div className="flex items-center gap-2">
                        <Avatar className="h-6 w-6">
                          <AvatarFallback className="text-xs">
                            {watchedAuthors[index]?.firstName?.[0]}
                            {watchedAuthors[index]?.lastName?.[0]}
                          </AvatarFallback>
                        </Avatar>
                        <Badge
                          variant="secondary"
                          className="flex items-center gap-1"
                        >
                          <Link className="w-3 h-3" />
                          {isCurrent ? "You" : "Linked User"}
                        </Badge>
                      </div>
                    )}

                    {!isLinked && (
                      <Badge
                        variant="outline"
                        className="flex items-center gap-1"
                      >
                        <User className="w-3 h-3" />
                        Manual Entry
                      </Badge>
                    )}
                  </div>

                  <div className="flex items-center gap-2">
                    {/* Show "Link to Me" for first author when unlinked */}
                    {!isLinked && index === 0 && session?.user && (
                      <Button
                        type="button"
                        variant="outline"
                        size="sm"
                        onClick={() => linkToCurrentUser(index)}
                        className="flex items-center gap-2"
                      >
                        <UserPlus className="w-4 h-4" />
                        Link to Me
                      </Button>
                    )}

                    {isLinked && (
                      <Button
                        type="button"
                        variant="outline"
                        size="sm"
                        onClick={() => unlinkUser(index)}
                        className="flex items-center gap-2"
                      >
                        <Unlink className="w-4 h-4" />
                        Unlink
                      </Button>
                    )}

                    {index > 0 && (
                      <Button
                        type="button"
                        variant="destructive"
                        size="sm"
                        onClick={() => remove(index)}
                        className="flex items-center gap-2"
                      >
                        <Trash2 className="w-4 h-4" />
                        Remove
                      </Button>
                    )}
                  </div>
                </div>

                {/* Show suggestion banner for first author when unlinked */}
                {!isLinked && index === 0 && session?.user && (
                  <div className="bg-primary border border-primary-foreground rounded-md p-3 text-sm text-primary-foreground">
                    <div className="flex items-center gap-2">
                      <UserPlus className="w-4 h-4" />
                      <span>This appears to be your submission.</span>
                      <Button
                        type="button"
                        variant="link"
                        size="sm"
                        onClick={() => linkToCurrentUser(index)}
                        className="ml-auto text-amber-600 hover:text-amber-800 p-0 h-auto"
                      >
                        Link to your account
                      </Button>
                    </div>
                  </div>
                )}

                {isLinked && (
                  <div className="bg-blue-50 border border-blue-200 rounded-md p-3 text-sm text-blue-800">
                    <div className="flex items-center gap-2">
                      <UserCheck className="w-4 h-4" />
                      <span>
                        This author is linked to a registered user. Their
                        information cannot be modified.
                      </span>
                      <Button
                        type="button"
                        variant="link"
                        size="sm"
                        onClick={() => unlinkUser(index)}
                        className="ml-auto text-blue-600 hover:text-blue-800 p-0 h-auto"
                      >
                        Unlink to edit
                      </Button>
                    </div>
                  </div>
                )}

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label>First Name</Label>
                    <Input
                      {...register(`authors.${index}.firstName`)}
                      disabled={isLinked}
                      className={isLinked ? "bg-muted" : ""}
                    />
                    {errors.authors?.[index]?.firstName && (
                      <p className="text-sm text-destructive">
                        {errors.authors[index].firstName.message}
                      </p>
                    )}
                  </div>

                  <div className="space-y-2">
                    <Label>Last Name</Label>
                    <Input
                      {...register(`authors.${index}.lastName`)}
                      disabled={isLinked}
                      className={isLinked ? "bg-muted" : ""}
                    />
                    {errors.authors?.[index]?.lastName && (
                      <p className="text-sm text-destructive">
                        {errors.authors[index].lastName.message}
                      </p>
                    )}
                  </div>
                </div>

                <div className="space-y-2">
                  <Label>Email</Label>
                  <Input
                    type="email"
                    {...register(`authors.${index}.email`)}
                    disabled={isLinked}
                    className={isLinked ? "bg-muted" : ""}
                  />
                  {errors.authors?.[index]?.email && (
                    <p className="text-sm text-destructive">
                      {errors.authors[index].email.message}
                    </p>
                  )}
                </div>

                <div className="space-y-2">
                  <Label>Country</Label>
                  <Controller
                    control={control}
                    name={`authors.${index}.country`}
                    render={({ field }) => (
                      <CountrySelect
                        field={field}
                        isSubmitting={isSubmitting}
                        isPending={isUpdating}
                      />
                    )}
                  />
                  {errors.authors?.[index]?.country && (
                    <p className="text-sm text-destructive">
                      {errors.authors[index].country.message}
                    </p>
                  )}
                </div>

                <div className="space-y-2">
                  <Label>Affiliation</Label>
                  <Input
                    {...register(`authors.${index}.affiliation`)}
                    disabled={isLinked}
                    className={isLinked ? "bg-muted" : ""}
                  />
                  <p className="text-sm text-muted-foreground">
                    Enter the laboratory you are associated with.
                  </p>
                  {errors.authors?.[index]?.affiliation && (
                    <p className="text-sm text-destructive">
                      {errors.authors[index].affiliation.message}
                    </p>
                  )}
                </div>

                <div className="flex items-center space-x-2 pt-2">
                  <Input
                    type="checkbox"
                    {...register(`authors.${index}.isCorresponding`)}
                    className="h-4 w-4"
                    disabled={isCurrent && index === 0} // Can't change for first author if it's current user
                  />
                  <Label className="cursor-pointer">Corresponding Author</Label>
                  {isCurrent && index === 0 && (
                    <span className="text-xs text-muted-foreground ml-2">
                      (You are the default corresponding author)
                    </span>
                  )}
                </div>
              </div>
            );
          })}

          <div className="flex flex-col sm:flex-row gap-2">
            <UserChooser
              onUserSelect={(user) =>
                append({
                  firstName: user.firstName,
                  lastName: user.lastName,
                  email: user.email,
                  country: user.country || "",
                  affiliation: user.affiliation || "",
                  isCorresponding: false,
                  userId: user.id,
                })
              }
            />
            <Button
              type="button"
              variant="secondary"
              className="cursor-pointer"
              onClick={() =>
                append({
                  firstName: "",
                  lastName: "",
                  email: "",
                  country: "",
                  affiliation: "",
                  isCorresponding: false,
                  userId: undefined,
                })
              }
            >
              <Plus className="w-4 h-4 mr-1" /> Add Manually
            </Button>
          </div>

          <Button
            type="submit"
            className="w-full max-w-md mx-auto block mt-6 cursor-pointer"
            disabled={isSubmitting || isUpdating}
          >
            {isSubmitting || isUpdating ? "Updating..." : "Update Authors"}
          </Button>
        </form>
      </div>
    </div>
  );
}
