"use client";
import { trpc } from "@/server/client";
import { useParams, useRouter } from "next/navigation";
import { useSession } from "next-auth/react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import Link from "next/link";
import LoadingSpinner from "@/components/LoadingSpinner";
import {
  Calendar,
  MapPin,
  Globe,
  Clock,
  Users,
  FileText,
  ExternalLink,
  Building,
  Check,
  X,
  Save,
} from "lucide-react";
import { TRPCError } from "@trpc/server";
import { toast } from "sonner";
import { useState, useEffect } from "react";

export default function ConferencePage() {
  const { conferenceId } = useParams<{ conferenceId: string }>();
  const { data: session } = useSession();
  const nextRouter = useRouter();

  const {
    data: conference,
    isLoading,
    refetch,
  } = trpc.conference.getConference.useQuery(conferenceId, {
    enabled: !!conferenceId,
  });

  const editable = session?.user.id === conference?.mainChairId;
  // Debug logging for session and main chair comparison
  console.log("Session user:", session?.user);
  console.log("Main chair ID:", conference?.mainChairId);
  console.log(
    "Are they the same?",
    session?.user.id === conference?.mainChairId
  );

  // State for editable fields
  const [editableData, setEditableData] = useState<{
    title: string;
    acronym: string;
    description: string;
    callForPapers: string;
    startDate: string;
    endDate: string;
    abstractDeadline: string;
    submissionDeadline: string;
    cameraReadyDeadline: string;
    locationVenue: string;
    locationCity: string;
    locationCountry: string;
    websiteUrl: string;
    isPublic: boolean;
    researchAreas: Record<string, string[]> | null;
  } | null>(null);
  const [isEditing, setIsEditing] = useState(false);

  // Initialize editable data when conference loads
  useEffect(() => {
    if (conference && editable && !isEditing) {
      setEditableData({
        title: conference.title,
        acronym: conference.acronym,
        description: conference.description,
        callForPapers: conference.callForPapers,
        startDate: new Date(conference.startDate).toISOString().split("T")[0],
        endDate: new Date(conference.endDate).toISOString().split("T")[0],
        abstractDeadline: new Date(conference.abstractDeadline)
          .toISOString()
          .split("T")[0],
        submissionDeadline: new Date(conference.submissionDeadline)
          .toISOString()
          .split("T")[0],
        cameraReadyDeadline: new Date(conference.cameraReadyDeadline)
          .toISOString()
          .split("T")[0],
        locationVenue: conference.locationVenue,
        locationCity: conference.locationCity,
        locationCountry: conference.locationCountry,
        websiteUrl: conference.websiteUrl || "",
        isPublic: conference.isPublic,
        researchAreas: conference.researchAreas as Record<
          string,
          string[]
        > | null,
      });
    }
  }, [conference, editable, isEditing]);

  const { mutateAsync: updateMutateAsync, isPending: isUpdateLoading } =
    trpc.conference.updateConference.useMutation({
      onSuccess: () => {
        setIsEditing(false);
        refetch();
        toast.success("Conference updated successfully!");
      },
      onError: (error) => {
        toast.error(error.message || "Failed to update conference");
      },
    });

  const { mutateAsync: approveMutateAsync, isPending: isApproveLoading } =
    trpc.conference.approveConference.useMutation({
      onSuccess: () => {
        nextRouter.push("/admin/conference-requests");
      },
    });

  const { mutateAsync: rejectMutateAsync, isPending: isRejectLoading } =
    trpc.conference.rejectConference.useMutation({
      onSuccess: () => {
        nextRouter.push("/admin/conference-requests");
      },
    });

  const handleSave = async () => {
    if (!editableData || !conferenceId) return;

    try {
      await updateMutateAsync({
        id: conferenceId,
        title: editableData.title,
        acronym: editableData.acronym,
        description: editableData.description,
        callForPapers: editableData.callForPapers,
        startDate: new Date(editableData.startDate),
        endDate: new Date(editableData.endDate),
        abstractDeadline: new Date(editableData.abstractDeadline),
        submissionDeadline: new Date(editableData.submissionDeadline),
        cameraReadyDeadline: new Date(editableData.cameraReadyDeadline),
        locationVenue: editableData.locationVenue,
        locationCity: editableData.locationCity,
        locationCountry: editableData.locationCountry,
        websiteUrl: editableData.websiteUrl,
        isPublic: editableData.isPublic,
        researchAreas: editableData.researchAreas || {},
      });
    } catch {
      // Error handling is done in the mutation's onError
    }
  };

  const handleInputChange = (field: string, value: string | boolean) => {
    setEditableData((prev) => ({
      ...prev!,
      [field]: value,
    }));
  };

  if (isLoading || !conference) {
    return <LoadingSpinner />;
  }

  const formatDate = (date: string | Date) => {
    return new Date(date).toLocaleDateString("en-UK", {
      year: "numeric",
      month: "long",
      day: "numeric",
    });
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case "APPROVED":
        return "bg-green-100 text-green-800 border-green-200";
      case "PENDING":
        return "bg-yellow-100 text-yellow-800 border-yellow-200";
      case "REJECTED":
        return "bg-red-100 text-red-800 border-red-200";
      case "COMPLETED":
        return "bg-blue-100 text-blue-800 border-blue-200";
      default:
        return "bg-gray-100 text-gray-800 border-gray-200";
    }
  };

  const ResearchAreasSection = (
    researchAreas: Record<string, string[]> | null
  ) => {
    if (!researchAreas || typeof researchAreas !== "object") return null;

    return (
      <div className="space-y-4">
        {Object.entries(researchAreas).map(
          ([primary, secondary]: [string, string[]]) => (
            <div key={primary} className="space-y-2">
              <h4 className="font-semibold text-lg text-slate-900">
                {primary}
              </h4>
              <div className="flex flex-wrap gap-2">
                {Array.isArray(secondary) &&
                  secondary.map((area: string, index: number) => (
                    <Badge key={index} variant="secondary" className="text-sm">
                      {area}
                    </Badge>
                  ))}
              </div>
            </div>
          )
        )}
      </div>
    );
  };

  return (
    <div className="w-full mx-auto p-6 space-y-6">
      {/* Header Section */}
      <div className="space-y-4">
        <div className="flex items-start justify-between">
          <div className="space-y-2 flex-1">
            {editable && isEditing ? (
              <div className="space-y-4">
                <div className="flex gap-4">
                  <div className="flex-1">
                    <Label htmlFor="acronym">Acronym</Label>
                    <Input
                      id="acronym"
                      value={editableData?.acronym || ""}
                      onChange={(e) =>
                        handleInputChange("acronym", e.target.value)
                      }
                      placeholder="Conference Acronym"
                    />
                  </div>
                  <div className="flex-[3]">
                    <Label htmlFor="title">Title</Label>
                    <Input
                      id="title"
                      value={editableData?.title || ""}
                      onChange={(e) =>
                        handleInputChange("title", e.target.value)
                      }
                      placeholder="Conference Title"
                    />
                  </div>
                </div>
              </div>
            ) : (
              <h1 className="text-xl font-bold text-slate-900">
                ({conference.acronym}) - {conference.title}
              </h1>
            )}
            <div className="flex items-center gap-4">
              {(session?.user.role === "ADMIN" ||
                session?.user.id === conference.mainChairId) && (
                <Badge
                  variant="outline"
                  className={`${getStatusColor(conference.status)} font-medium`}
                >
                  {conference.status}
                </Badge>
              )}
              {editable && (
                <div className="flex gap-2">
                  {isEditing ? (
                    <>
                      <Button
                        onClick={handleSave}
                        disabled={isUpdateLoading}
                        size="sm"
                        className="bg-green-600 hover:bg-green-700"
                      >
                        <Save className="h-4 w-4 mr-2" />
                        {isUpdateLoading ? "Saving..." : "Save"}
                      </Button>
                      <Button
                        onClick={() => setIsEditing(false)}
                        size="sm"
                        variant="outline"
                      >
                        Cancel
                      </Button>
                    </>
                  ) : (
                    <Button
                      onClick={() => setIsEditing(true)}
                      size="sm"
                      variant="outline"
                    >
                      Edit Conference
                    </Button>
                  )}
                </div>
              )}
            </div>
          </div>

          {session?.user.role === "USER" &&
            conference.status === "APPROVED" &&
            conference.mainChairId !== session?.user.id && (
              <Link href="/dashboard/conference/new-submission">
                <Button className="bg-blue-600 hover:bg-blue-700">
                  <FileText className="h-4 w-4 mr-2" />
                  Make a Submission
                </Button>
              </Link>
            )}
        </div>

        {editable && isEditing ? (
          <div>
            <Label htmlFor="description">Description</Label>
            <Textarea
              id="description"
              value={editableData?.description || ""}
              onChange={(e) => handleInputChange("description", e.target.value)}
              placeholder="Conference Description"
              rows={4}
            />
          </div>
        ) : (
          <p className="text-lg text-slate-600 leading-relaxed">
            {conference.description}
          </p>
        )}
      </div>

      <div className="grid grid-cols-1 gap-6">
        {/* Main Content */}
        <div className="space-y-6">
          {/* Call for Papers */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <FileText className="h-5 w-5" />
                Call for Papers
              </CardTitle>
            </CardHeader>
            <CardContent>
              {editable && isEditing ? (
                <div>
                  <Label htmlFor="callForPapers">Call for Papers</Label>
                  <Textarea
                    id="callForPapers"
                    value={editableData?.callForPapers || ""}
                    onChange={(e) =>
                      handleInputChange("callForPapers", e.target.value)
                    }
                    placeholder="Call for Papers content"
                    rows={10}
                    className="mt-2"
                  />
                </div>
              ) : (
                <div className="prose prose-slate max-w-none">
                  <div className="whitespace-pre-wrap text-slate-700 leading-relaxed">
                    {conference.callForPapers}
                  </div>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Research Areas */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Users className="h-5 w-5" />
                Research Areas
              </CardTitle>
            </CardHeader>
            <CardContent>
              {ResearchAreasSection(
                conference.researchAreas as Record<string, string[]> | null
              )}
            </CardContent>
          </Card>
        </div>

        {/* Sidebar */}
        <div className="space-y-6">
          {/* Conference Details */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Calendar className="h-5 w-5" />
                Conference Details
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {/* Dates */}
              <div className="space-y-3">
                {editable && isEditing ? (
                  <div className="space-y-4">
                    <div>
                      <Label htmlFor="startDate">Start Date</Label>
                      <Input
                        id="startDate"
                        type="date"
                        value={editableData?.startDate || ""}
                        onChange={(e) =>
                          handleInputChange("startDate", e.target.value)
                        }
                      />
                    </div>
                    <div>
                      <Label htmlFor="endDate">End Date</Label>
                      <Input
                        id="endDate"
                        type="date"
                        value={editableData?.endDate || ""}
                        onChange={(e) =>
                          handleInputChange("endDate", e.target.value)
                        }
                      />
                    </div>
                  </div>
                ) : (
                  <div className="flex items-center gap-3">
                    <Calendar className="h-4 w-4 text-slate-500" />
                    <div>
                      <p className="text-sm font-medium">Conference Dates</p>
                      <p className="text-sm text-slate-600">
                        {formatDate(conference.startDate)} -{" "}
                        {formatDate(conference.endDate)}
                      </p>
                    </div>
                  </div>
                )}

                {editable && isEditing ? (
                  <div className="space-y-4">
                    <div>
                      <Label htmlFor="locationVenue">Venue</Label>
                      <Input
                        id="locationVenue"
                        value={editableData?.locationVenue || ""}
                        onChange={(e) =>
                          handleInputChange("locationVenue", e.target.value)
                        }
                        placeholder="Venue name"
                      />
                    </div>
                    <div>
                      <Label htmlFor="locationCity">City</Label>
                      <Input
                        id="locationCity"
                        value={editableData?.locationCity || ""}
                        onChange={(e) =>
                          handleInputChange("locationCity", e.target.value)
                        }
                        placeholder="City"
                      />
                    </div>
                    <div>
                      <Label htmlFor="locationCountry">Country</Label>
                      <Input
                        id="locationCountry"
                        value={editableData?.locationCountry || ""}
                        onChange={(e) =>
                          handleInputChange("locationCountry", e.target.value)
                        }
                        placeholder="Country"
                      />
                    </div>
                  </div>
                ) : (
                  <div className="flex items-center gap-3">
                    <MapPin className="h-4 w-4 text-slate-500" />
                    <div>
                      <p className="text-sm font-medium">Location</p>
                      <p className="text-sm text-slate-600">
                        {conference.locationVenue}
                      </p>
                      <p className="text-sm text-slate-600">
                        {conference.locationCity},{" "}
                        {conference.locationCountry.toUpperCase()}
                      </p>
                    </div>
                  </div>
                )}

                {editable && isEditing ? (
                  <div>
                    <Label htmlFor="websiteUrl">Website URL</Label>
                    <Input
                      id="websiteUrl"
                      type="url"
                      value={editableData?.websiteUrl || ""}
                      onChange={(e) =>
                        handleInputChange("websiteUrl", e.target.value)
                      }
                      placeholder="https://example.com"
                    />
                  </div>
                ) : (
                  conference.websiteUrl && (
                    <div className="flex items-center gap-3">
                      <Globe className="h-4 w-4 text-slate-500" />
                      <div className="flex-1">
                        <p className="text-sm font-medium">Website</p>
                        <a
                          href={conference.websiteUrl}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-sm text-blue-600 hover:text-blue-800 flex items-center gap-1"
                        >
                          {conference.websiteUrl}{" "}
                          <ExternalLink className="h-3 w-3" />
                        </a>
                      </div>
                    </div>
                  )
                )}
              </div>
            </CardContent>
          </Card>

          {/* Important Deadlines */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Clock className="h-5 w-5" />
                Important Deadlines
              </CardTitle>
            </CardHeader>
            <CardContent>
              {editable && isEditing ? (
                <div className="space-y-4">
                  <div>
                    <Label htmlFor="abstractDeadline">Abstract Deadline</Label>
                    <Input
                      id="abstractDeadline"
                      type="date"
                      value={editableData?.abstractDeadline || ""}
                      onChange={(e) =>
                        handleInputChange("abstractDeadline", e.target.value)
                      }
                    />
                  </div>
                  <div>
                    <Label htmlFor="submissionDeadline">
                      Submission Deadline
                    </Label>
                    <Input
                      id="submissionDeadline"
                      type="date"
                      value={editableData?.submissionDeadline || ""}
                      onChange={(e) =>
                        handleInputChange("submissionDeadline", e.target.value)
                      }
                    />
                  </div>
                  <div>
                    <Label htmlFor="cameraReadyDeadline">
                      Camera Ready Deadline
                    </Label>
                    <Input
                      id="cameraReadyDeadline"
                      type="date"
                      value={editableData?.cameraReadyDeadline || ""}
                      onChange={(e) =>
                        handleInputChange("cameraReadyDeadline", e.target.value)
                      }
                    />
                  </div>
                </div>
              ) : (
                <div className="space-y-3">
                  <div className="flex justify-between items-start">
                    <span className="text-sm font-medium">
                      Abstract Deadline
                    </span>
                    <span className="text-sm text-slate-600 text-right">
                      {formatDate(conference.abstractDeadline)}
                    </span>
                  </div>
                  <Separator />

                  <div className="flex justify-between items-start">
                    <span className="text-sm font-medium">
                      Submission Deadline
                    </span>
                    <span className="text-sm text-slate-600 text-right">
                      {formatDate(conference.submissionDeadline)}
                    </span>
                  </div>
                  <Separator />

                  <div className="flex justify-between items-start">
                    <span className="text-sm font-medium">Camera Ready</span>
                    <span className="text-sm text-slate-600 text-right">
                      {formatDate(conference.cameraReadyDeadline)}
                    </span>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Admin Info (if admin) */}
          {(session?.user.role === "ADMIN" ||
            conference.mainChairId === session?.user.id) && (
            <>
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Building className="h-5 w-5" />
                    Organization
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-2">
                    <div>
                      <p className="text-sm font-medium">Main Chair</p>
                      <p className="text-sm text-slate-600">
                        {conference.mainChair.firstName}{" "}
                        {conference.mainChair.lastName}
                      </p>
                      <p className="text-sm text-slate-500">
                        {conference.mainChair.email}
                      </p>
                    </div>

                    <div className="pt-2">
                      <p className="text-sm font-medium">Visibility</p>
                      {editable && isEditing ? (
                        <div className="flex items-center space-x-2 mt-2">
                          <Checkbox
                            id="isPublic"
                            checked={editableData?.isPublic || false}
                            onCheckedChange={(checked) =>
                              handleInputChange("isPublic", checked)
                            }
                          />
                          <Label htmlFor="isPublic">
                            Make conference public
                          </Label>
                        </div>
                      ) : (
                        <Badge
                          variant={
                            conference.isPublic ? "default" : "secondary"
                          }
                        >
                          {conference.isPublic ? "Public" : "Private"}
                        </Badge>
                      )}
                    </div>
                  </div>
                </CardContent>
              </Card>
              {conference.status === "PENDING" && (
                <div className="flex justify-center gap-2">
                  <Button
                    className="bg-green-600 hover:bg-green-700"
                    disabled={isApproveLoading}
                    onClick={async () => {
                      try {
                        await approveMutateAsync(conference.id);
                        toast.success("Conference approved successfully!");
                      } catch (error) {
                        if (error instanceof TRPCError) {
                          toast.error(error.message);
                        } else {
                          toast.error("An unexpected error occurred.");
                        }
                      }
                    }}
                  >
                    <Check className="h-4 w-4 mr-2" />
                    {isApproveLoading ? "Approving..." : "Approve Conference"}
                  </Button>
                  <Button
                    className="bg-red-600 hover:bg-red-700"
                    disabled={isRejectLoading}
                    onClick={async () => {
                      try {
                        await rejectMutateAsync(conference.id);
                        toast.success("Conference rejected successfully!");
                      } catch (error) {
                        if (error instanceof TRPCError) {
                          toast.error(error.message);
                        } else {
                          toast.error("An unexpected error occurred.");
                        }
                      }
                    }}
                  >
                    <X className="h-4 w-4 mr-2" />
                    {isRejectLoading ? "Rejecting..." : "Reject Conference"}
                  </Button>
                </div>
              )}
            </>
          )}
        </div>
      </div>
    </div>
  );
}
