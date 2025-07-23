"use client";
import Link from "next/link";
import { useState } from "react";
import { Card, CardHeader, CardTitle, CardContent } from "./ui/card";
import { Button } from "./ui/button";
import { Input } from "./ui/input";
import { Textarea } from "./ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "./ui/select";
import { Submission } from "@prisma/client";
import { trpc } from "@/server/client";
import { toast } from "sonner";
import { Pencil, Check, X, Upload, User } from "lucide-react";
import { UploadButton } from "@/lib/uploadthing";
import React from "react";

export default function SubmissionsTable({
  submissions,
  conferenceId,
}: {
  submissions: Array<Submission> | undefined;
  conferenceId: string;
}) {
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editData, setEditData] = useState<Partial<Submission>>({});
  const [uploadedFile, setUploadedFile] = useState<{
    url: string;
    name: string;
  } | null>(null);

  const { data: areas } = trpc.conference.getAreas.useQuery(conferenceId);

  const normalizedAreas = areas
    ? Object.entries(areas).map(([key, values]) => {
        return {
          title: key,
          secondary: values,
        };
      })
    : [];

  const utils = trpc.useUtils();
  const updateSubmission = trpc.submission.updatePaperSubmission.useMutation({
    onSuccess: () => {
      toast.success("Submission updated successfully");
      setEditingId(null);
      setEditData({});
      setUploadedFile(null);
      utils.submission.getConferenceSubmissionsByAuthor.invalidate();
    },
    onError: (error) => {
      toast.error(`Failed to update submission: ${error.message}`);
    },
  });

  const handleEdit = (submission: Submission) => {
    setEditingId(submission.id);
    setEditData({
      title: submission.title,
      abstract: submission.abstract,
      primaryArea: submission.primaryArea,
      secondaryArea: submission.secondaryArea,
      keywords: submission.keywords,
    });
    setUploadedFile(null);
  };

  const handleCancel = () => {
    setEditingId(null);
    setEditData({});
    setUploadedFile(null);
  };

  const handleSave = (submissionId: string) => {
    if (
      !editData.title ||
      !editData.abstract ||
      !editData.primaryArea ||
      !editData.secondaryArea
    ) {
      toast.error("Please fill in all required fields");
      return;
    }

    // Process keywords: split by newlines and filter out empty strings
    const processedKeywords =
      typeof editData.keywords === "string"
        ? editData.keywords.split("\n").filter((k) => k.trim())
        : Array.isArray(editData.keywords)
        ? editData.keywords
        : [];

    updateSubmission.mutate({
      conferenceId: conferenceId,
      submissionId,
      title: editData.title,
      abstract: editData.abstract,
      primaryArea: editData.primaryArea,
      secondaryArea: editData.secondaryArea,
      keywords: processedKeywords,
      paperFilePath: uploadedFile?.url || "", // Use uploaded file or keep existing
      paperFileName: uploadedFile?.name || "", // Use uploaded file or keep existing
    });
  };

  const handleInputChange = (field: keyof Submission, value: any) => {
    setEditData((prev) => ({ ...prev, [field]: value }));
  };

  if (!submissions || submissions.length === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="text-lg font-semibold text-foreground">
            Submissions
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-center text-muted-foreground">
            No submissions found.
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-lg font-semibold text-foreground">
          Submissions
        </CardTitle>
      </CardHeader>
      <CardContent>
        {submissions ? (
          <div className="space-y-6">
            {submissions.map((submission) => {
              const isEditing = editingId === submission.id;

              return (
                <div key={submission.id}>
                  <div className="flex items-center justify-between mb-4">
                    <h3 className="text-xl font-semibold text-foreground">
                      Submission ID {submission.id}
                    </h3>
                    <div className="flex gap-2">
                      {isEditing ? (
                        <>
                          <Button
                            size="sm"
                            onClick={() => handleSave(submission.id)}
                            disabled={updateSubmission.isPending}
                          >
                            <Check className="h-4 w-4" />
                            Save
                          </Button>
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={handleCancel}
                          >
                            <X className="h-4 w-4" />
                            Cancel
                          </Button>
                        </>
                      ) : (
                        <>
                          <Link
                            href={`/dashboard/conference/${conferenceId}/your-submissions/${submission.id}/authors`}
                          >
                            <Button size="sm" variant="outline">
                              <User className="h-4 w-4" />
                              Edit Authors
                            </Button>
                          </Link>
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => handleEdit(submission)}
                          >
                            <Pencil className="h-4 w-4" />
                            Edit
                          </Button>
                        </>
                      )}
                    </div>
                  </div>

                  <div className="grid grid-cols-1 gap-0 border border-border rounded-lg overflow-hidden">
                    {/* Title Row */}
                    <div className="grid grid-cols-4 min-h-[60px]">
                      <div className="bg-muted p-4 border-r border-border flex items-center">
                        <span className="font-medium text-foreground">
                          Title
                        </span>
                      </div>
                      <div className="col-span-3 p-4 flex items-center">
                        {isEditing ? (
                          <Input
                            value={editData.title || ""}
                            onChange={(e) =>
                              handleInputChange("title", e.target.value)
                            }
                            className="w-full"
                          />
                        ) : (
                          <span className="text-foreground">
                            {submission.title}
                          </span>
                        )}
                      </div>
                    </div>

                    {/* Paper Row */}
                    <div className="grid grid-cols-4 min-h-[60px] border-t border-border">
                      <div className="bg-muted p-4 border-r border-border flex items-center">
                        <span className="font-medium text-foreground">
                          Paper
                        </span>
                      </div>
                      <div className="col-span-3 p-4">
                        {isEditing ? (
                          <div className="space-y-3">
                            {/* Current file display */}
                            {(uploadedFile || submission.paperFilePath) && (
                              <div className="flex items-center gap-2">
                                <span className="text-sm text-muted-foreground">
                                  Current file:
                                </span>
                                <Link
                                  href={
                                    uploadedFile?.url ||
                                    submission.paperFilePath ||
                                    ""
                                  }
                                  className="text-primary hover:text-primary/80 underline text-sm"
                                  target="_blank"
                                  rel="noopener noreferrer"
                                >
                                  {uploadedFile?.name ||
                                    submission.paperFileName}
                                </Link>
                              </div>
                            )}

                            {/* Upload button */}
                            <div className="flex items-center gap-2">
                              <Upload className="h-4 w-4 text-muted-foreground" />
                              <UploadButton
                                endpoint="mediaUploader"
                                onUploadBegin={() => {
                                  // Optional: Add uploading state if needed
                                }}
                                onClientUploadComplete={(res) => {
                                  if (res && res[0]) {
                                    setUploadedFile({
                                      url: res[0].ufsUrl, // Use ufsUrl instead of url
                                      name: res[0].name,
                                    });
                                    toast.success(
                                      "File uploaded successfully!"
                                    );
                                  }
                                }}
                                onUploadError={(error: Error) => {
                                  toast.error(
                                    `Upload failed: ${error.message}`
                                  );
                                }}
                                content={{
                                  button: "Browse",
                                  allowedContent: "PDF files only",
                                }}
                                appearance={{
                                  button:
                                    "bg-primary hover:bg-primary/90 text-primary-foreground px-4 py-2 rounded-md font-medium",
                                  allowedContent:
                                    "text-muted-foreground text-sm",
                                }}
                              />
                            </div>
                          </div>
                        ) : (
                          <div className="flex items-center">
                            {submission.paperFilePath ? (
                              <>
                                <Link
                                  href={submission.paperFilePath}
                                  className="text-primary hover:text-primary/80 underline"
                                  target="_blank"
                                  rel="noopener noreferrer"
                                >
                                  {submission.paperFileName}
                                </Link>
                                <span className="text-muted-foreground ml-2">
                                  [
                                  {new Date(
                                    submission.updatedAt
                                  ).toLocaleDateString("fr-FR", {
                                    year: "numeric",
                                    month: "long",
                                    day: "numeric",
                                  })}
                                  ]
                                </span>
                              </>
                            ) : (
                              <span className="text-muted-foreground">
                                No Paper uploaded
                              </span>
                            )}
                          </div>
                        )}
                      </div>
                    </div>

                    {/* Secondary Area Row */}
                    <div className="grid grid-cols-4 min-h-[60px] border-t border-border">
                      <div className="bg-muted p-4 border-r border-border flex items-center">
                        <span className="font-medium text-foreground">
                          Area
                        </span>
                      </div>
                      <div className="col-span-3 p-4 flex items-center">
                        {isEditing ? (
                          <Select
                            value={editData.secondaryArea || ""}
                            onValueChange={(value) =>
                              handleInputChange("secondaryArea", value)
                            }
                          >
                            <SelectTrigger className="w-full">
                              <SelectValue placeholder="Select an area" />
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
                                  {primaryArea.secondary.map(
                                    (secondaryArea, i) => (
                                      <SelectItem
                                        key={i}
                                        value={secondaryArea}
                                        className="pl-6 text-muted-foreground hover:bg-accent"
                                      >
                                        {secondaryArea}
                                      </SelectItem>
                                    )
                                  )}
                                </React.Fragment>
                              ))}
                            </SelectContent>
                          </Select>
                        ) : (
                          <span className="text-foreground">
                            {submission.secondaryArea}
                          </span>
                        )}
                      </div>
                    </div>

                    {/* Keywords Row */}
                    <div className="grid grid-cols-4 min-h-[60px] border-t border-border">
                      <div className="bg-muted p-4 border-r border-border flex items-center">
                        <span className="font-medium text-foreground">
                          Keywords
                        </span>
                      </div>
                      <div className="col-span-3 p-4 flex items-center">
                        {isEditing ? (
                          <Textarea
                            value={
                              Array.isArray(editData.keywords)
                                ? editData.keywords.join("\n")
                                : typeof editData.keywords === "string"
                                ? editData.keywords
                                : ""
                            }
                            onChange={(e) =>
                              handleInputChange("keywords", e.target.value)
                            }
                            placeholder="Enter keywords, one per line"
                            className="w-full min-h-[80px]"
                            rows={3}
                          />
                        ) : (
                          <span className="text-foreground">
                            {submission.keywords?.join(", ")}
                          </span>
                        )}
                      </div>
                    </div>

                    {/* Abstract Row */}
                    <div className="grid grid-cols-4 border-t border-border">
                      <div className="bg-muted p-4 border-r border-border flex items-start pt-4">
                        <span className="font-medium text-foreground">
                          Abstract
                        </span>
                      </div>
                      <div className="col-span-3 p-4">
                        {isEditing ? (
                          <Textarea
                            value={editData.abstract || ""}
                            onChange={(e) =>
                              handleInputChange("abstract", e.target.value)
                            }
                            className="w-full min-h-[100px]"
                            rows={4}
                          />
                        ) : (
                          <p className="text-foreground leading-relaxed">
                            {submission.abstract}
                          </p>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        ) : (
          <div className="text-center text-muted-foreground">
            No submissions found.
          </div>
        )}
      </CardContent>
    </Card>
  );
}
