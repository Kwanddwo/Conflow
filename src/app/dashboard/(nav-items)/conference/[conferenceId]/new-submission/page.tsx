"use client";
import LoadingSpinner from "@/components/LoadingSpinner";
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
import { Textarea } from "@/components/ui/textarea";
import { UploadButton } from "@/lib/uploadthing";
import { trpc } from "@/server/client";
import { zodResolver } from "@hookform/resolvers/zod";
import Link from "next/link";
import { useParams } from "next/navigation";
import { useRouter } from "next/navigation";
import React, { useState } from "react";
import { useForm } from "react-hook-form";
import { toast } from "sonner";
import { z } from "zod";

const paperSubmissionSchema = z.object({
  title: z.string().min(1, "Title is required"),
  abstract: z.string().min(1, "Abstract is required"),
  primary_area: z.string(),
  secondary_area: z.string(),
  keywords: z.string().min(1, "Keywords are required"),
  fileUrl: z.string().url("File upload is required"),
  fileName: z.string(),
});
type PaperSubmissionValues = z.infer<typeof paperSubmissionSchema>;
function PaperSubmission() {
  const { conferenceId } = useParams<{ conferenceId: string }>();
  const [selectedFile, setSelectedFile] = useState<string | null>(null);
  const [uploadedFileUrl, setUploadedFileUrl] = useState<string | null>(null);
  const [isUploading, setIsUploading] = useState(false);
  const router = useRouter();
  const {
    register,
    handleSubmit,
    setValue,
    formState: { errors, isSubmitting },
  } = useForm<PaperSubmissionValues>({
    resolver: zodResolver(paperSubmissionSchema),
  });
  const {
    data: areas,
    isLoading,
    error,
  } = trpc.conference.getAreas.useQuery(conferenceId);
  const normalizedAreas = areas
    ? Object.entries(areas).map(([key, values]) => {
        return {
          title: key,
          secondary: values,
        };
      })
    : [];
  const { mutateAsync, isPending } =
    trpc.submission.addPaperSubmission.useMutation();
  const onSubmit = async (data: PaperSubmissionValues) => {
    try {
      const jsonKeywords = data.keywords
        .split("\n")
        .map((k) => k.trim())
        .filter(Boolean);

      const payload = {
        ...data,
        keywords: jsonKeywords,
        conferenceId,
      };

      const response = await mutateAsync(payload);
      console.log("Submission response:", response);
      toast.success("Paper submitted successfully!");
      router.push(
        `/dashboard/conference/${conferenceId}/new-submission/authors/${response.submissionId}`
      );
    } catch (err) {
      console.error(err);
      toast.error("Submission failed.");
    }
  };

  if (isLoading || !areas) {
    return <LoadingSpinner />;
  }

  if (error) {
    toast.error("An unexpected error occured: " + error.message);
  }

  return (
    <div className="min-h-screen flex items-center justify-center p-6">
      <div className="w-full max-w-2xl">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-foreground mb-2">
            Submit Your Paper
          </h1>
          <p className="text-muted-foreground">
            Please provide all required information for your paper submission
          </p>
        </div>

        <form
          className="space-y-6 border rounded-lg p-6"
          onSubmit={handleSubmit(onSubmit)}
        >
          <div className="space-y-2">
            <Label htmlFor="title" className="text-foreground font-medium">
              Title
            </Label>
            <Input
              id="title"
              placeholder="Title"
              className="w-full border-border text-foreground placeholder:text-muted-foreground"
              {...register("title")}
              disabled={isSubmitting || isPending}
            />
            {errors.title && (
              <p className="text-destructive text-sm">{errors.title.message}</p>
            )}
          </div>

          {/* Abstract Section */}
          <div className="space-y-2">
            <Label htmlFor="abstract" className="text-foreground font-medium">
              Abstract
            </Label>
            <Textarea
              id="abstract"
              placeholder="Abstract"
              rows={4}
              className="w-full border-border text-foreground placeholder:text-muted-foreground resize-none"
              {...register("abstract")}
              disabled={isSubmitting || isPending}
            />
            {errors.abstract && (
              <p className="text-destructive text-sm">
                {errors.abstract.message}
              </p>
            )}
          </div>

          {/* Area/Track Section */}
          <div className="space-y-2">
            <Label htmlFor="area-track" className="text-foreground font-medium">
              Area/Track
            </Label>
            <Select
              onValueChange={(val) => {
                const found = normalizedAreas.find((area) =>
                  area.secondary.includes(val)
                );
                if (found) {
                  setValue("primary_area", found.title);
                  setValue("secondary_area", val);
                }
              }}
              disabled={isSubmitting || isPending}
            >
              <SelectTrigger className="w-full border-border text-foreground">
                <SelectValue placeholder="Select Research Area" />
              </SelectTrigger>
              <SelectContent>
                {normalizedAreas.map((primaryArea, index) => (
                  <React.Fragment key={index}>
                    {/* Primary Area - Disabled */}
                    <SelectItem
                      value={primaryArea.title}
                      disabled
                      className="font-semibold text-muted-foreground bg-muted cursor-not-allowed"
                    >
                      {primaryArea.title}
                    </SelectItem>
                    {/* Secondary Areas - Selectable */}
                    {primaryArea.secondary.map((secondaryArea, i) => (
                      <SelectItem
                        key={i}
                        value={secondaryArea}
                        className="pl-6 text-muted-foreground hover:bg-accent"
                      >
                        {secondaryArea}
                      </SelectItem>
                    ))}
                  </React.Fragment>
                ))}
              </SelectContent>
            </Select>

            <p className="text-muted-foreground text-sm">
              Select a specific research area. Primary areas are shown for
              organization but only sub-areas can be selected.
            </p>
          </div>

          {/* Keywords Section */}
          <div className="space-y-2">
            <Label htmlFor="keywords" className="text-foreground font-medium">
              Keywords
            </Label>
            <Textarea
              id="keywords"
              placeholder={`Keyword 1\nKeyword 2\nKeyword 3`}
              rows={3}
              className="w-full border-border text-foreground placeholder:text-muted-foreground resize-none"
              {...register("keywords")}
              disabled={isSubmitting || isPending}
            />
            {errors.keywords && (
              <p className="text-destructive text-sm">
                {errors.keywords.message}
              </p>
            )}
            <p className="text-muted-foreground text-sm">
              Type a list of keywords for your paper, each keyword should be in
              its own line!!
            </p>
          </div>

          {/* Files Section */}
          <div className="space-y-2">
            <Label htmlFor="files" className="text-foreground font-medium">
              Files
            </Label>
            <div className="flex items-center gap-3">
              <UploadButton
                endpoint="mediaUploader"
                onUploadBegin={() => {
                  setIsUploading(true);
                }}
                onClientUploadComplete={(res) => {
                  setIsUploading(false);
                  console.log("Files: ", res);
                  if (res && res[0]) {
                    setSelectedFile(res[0].name);
                    setUploadedFileUrl(res[0].ufsUrl);
                    setValue("fileUrl", res[0].ufsUrl);
                    setValue("fileName", res[0].name);
                  }
                }}
                onUploadError={(error: Error) => {
                  setIsUploading(false);
                  toast.error(`ERROR! ${error.message}`);
                }}
                content={{
                  button: isUploading ? "Uploading..." : "Browse",
                  allowedContent: "PDF files only",
                }}
                appearance={{
                  button:
                    "bg-primary hover:bg-primary/90 text-primary-foreground px-4 py-2 rounded-md font-medium",
                  allowedContent: "text-muted-foreground text-sm",
                }}
                disabled={isSubmitting || isPending}
              />
              {selectedFile && (
                <Link
                  href={uploadedFileUrl || "#"}
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  <span className="text-muted-foreground text-sm">
                    {selectedFile}
                  </span>
                </Link>
              )}
            </div>
            <p className="text-muted-foreground text-sm">
              Upload your paper, which must be in PDF format
            </p>
          </div>
          <div className="flex justify-center">
            <Button
              type="submit"
              disabled={isSubmitting || isPending}
              className="w-full max-w-md cursor-pointer"
            >
              {isUploading || isSubmitting || isPending
                ? "Submitting..."
                : "Submit Paper"}
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
}

export default PaperSubmission;
