"use client";

import { useForm, useFieldArray, Controller } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Plus, Trash2 } from "lucide-react";
import { z } from "zod";
import { useParams } from "next/navigation";
import { trpc } from "@/server/client";
import { toast } from "sonner";
import CountrySelect from "@/components/CountrySelect";

const authorSchema = z.object({
  firstName: z.string().min(1, "First Name is Required"),
  lastName: z.string().min(1, "Last Name is Required"),
  email: z.string().email("Invalid email"),
  country: z.string().min(1, "Country is Required"),
  affiliation: z.string().min(1, "Affiliation is Required"),
  isCorresponding: z.boolean(),
});

const formSchema = z.object({
  authors: z.array(authorSchema).min(1, "At least one author is required"),
});

type AuthorFormValues = z.infer<typeof formSchema>;

export default function AuthorForm() {
  const { submissionId } = useParams<{ submissionId: string }>();
  const {
    control,
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<AuthorFormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      authors: [
        {
          firstName: "",
          lastName: "",
          email: "",
          country: "",
          affiliation: "",
          isCorresponding: false,
        },
      ],
    },
  });

  const { fields, append, remove } = useFieldArray({
    control,
    name: "authors",
  });
  const { mutateAsync, isPending } =
    trpc.submission.addSubmissionAuthors.useMutation();
  const onSubmit = async (data: AuthorFormValues) => {
    const payload = {
      ...data,
      submissionId,
    };
    try {
      await mutateAsync(payload);
      toast.success("Authors submitted successfully!");
    } catch (error) {
      console.error("Error submitting authors:", error);
      toast.error("Failed to submit authors.");
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-6">
      <div className="w-full max-w-4xl">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">
            Add Authors
          </h1>
          <p className="text-gray-600">
            Please provide information for all authors of this submission
          </p>
        </div>
        
        <form
          onSubmit={handleSubmit(onSubmit)}
          className="space-y-8"
        >
          {fields.map((field, index) => (
            <div key={field.id} className="space-y-4 border rounded-lg p-6">
              <div className="flex items-center justify-between">
                <h2 className="text-lg font-semibold">Author No. {index + 1}</h2>
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

          <div className="space-y-2">
            <Label>First Name</Label>
            <Input {...register(`authors.${index}.firstName`)} />
            {errors.authors?.[index]?.firstName && (
              <p className="text-sm text-red-500">
                {errors.authors[index].firstName.message}
              </p>
            )}
          </div>

          <div className="space-y-2">
            <Label>Last Name</Label>
            <Input {...register(`authors.${index}.lastName`)} />
            {errors.authors?.[index]?.lastName && (
              <p className="text-sm text-red-500">
                {errors.authors[index].lastName.message}
              </p>
            )}
          </div>

          <div className="space-y-2">
            <Label>Email</Label>
            <Input type="email" {...register(`authors.${index}.email`)} />
            {errors.authors?.[index]?.email && (
              <p className="text-sm text-red-500">
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
                <CountrySelect field={field} isSubmitting={isSubmitting} isPending={isPending} />
              )}
            />
            {errors.authors?.[index]?.country && (
              <p className="text-sm text-red-500">
                {errors.authors[index].country.message}
              </p>
            )}
          </div>

          <div className="space-y-2">
            <Label>Affiliation</Label>
            <Input {...register(`authors.${index}.affiliation`)} />
            <p className="text-sm text-muted-foreground">
              Enter the laboratory you are associated with.
            </p>
            {errors.authors?.[index]?.affiliation && (
              <p className="text-sm text-red-500">
                {errors.authors[index].affiliation.message}
              </p>
            )}
          </div>

          <div className="flex items-center space-x-2 pt-2">
            <Input
              type="checkbox"
              {...register(`authors.${index}.isCorresponding`)}
              className="h-4 w-4"
            />
            <Label className="cursor-pointer">Corresponding Author</Label>
          </div>
            </div>
          ))}

          <Button
            type="button"
            className="cursor-pointer"
            onClick={() =>
              append({
                firstName: "",
                lastName: "",
                email: "",
                country: "",
                affiliation: "",
                isCorresponding: false,
              })
            }
          >
            <Plus className="w-4 h-4 mr-1" /> Add an author
          </Button>

          <Button
            type="submit"
            className="w-full max-w-md mx-auto block mt-6 cursor-pointer"
            disabled={isSubmitting || isPending}
          >
            {isSubmitting || isPending ? "Submitting..." : "Submit Authors"}
          </Button>
        </form>
      </div>
    </div>
  );
}
