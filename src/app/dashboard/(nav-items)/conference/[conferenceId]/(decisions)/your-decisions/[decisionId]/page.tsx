"use client";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { SubmissionOverview } from "@/components/SubmissionOverview";
import { trpc } from "@/server/client";
import { useParams } from "next/navigation";
import LoadingSpinner from "@/components/LoadingSpinner";
import { useProtectedQuery } from "@/hooks/useProtectedQuery";
import { useState } from "react";
import { toast } from "sonner";
import React from "react";
import Link from "next/link";
import { Badge } from "@/components/ui/badge";


export default function ConflowReview() {
  const { conferenceId, decisionId } = useParams<{
    conferenceId: string;
    decisionId: string;
  }>();
  const [isEditing, setIsEditing] = useState(false);
  const [finalDecision, setFinalDecision] = useState<
    "ACCEPT" | "MAJOR_REVISION" | "MINOR_REVISION" | "REJECT"
  >("REJECT");
  const query = trpc.decision.getChairDecision.useQuery({
    decisionId,
    conferenceId,
  });
  const { data: decision, isPending } = useProtectedQuery(query);

  const updateDecisionMutation = trpc.decision.updateDecision.useMutation({
    onSuccess: () => {
      toast.success("Decision updated successfully!");
      setIsEditing(false);
      query.refetch();
    },
    onError: (error) => {
      toast.error(error.message || "Failed to update decision");
    },
  });

  // Initialize form with current review data
  React.useEffect(() => {
    if (decision) {
      setFinalDecision(
        decision.reviewDecision as "ACCEPT" | "MAJOR_REVISION" | "MINOR_REVISION" | "REJECT"
      );
    }
  }, [decision]);

  const handleSave = () => {
    if (!decision) return;

    updateDecisionMutation.mutate({
      conferenceId,
      decisionId: decision.id,
      reviewDecision: finalDecision,
    });
  };

  const handleCancel = () => {
    if (decision) {
      setFinalDecision(
        decision.reviewDecision as "ACCEPT" | "MAJOR_REVISION" | "MINOR_REVISION" | "REJECT"
      );
    }
    setIsEditing(false);
  };

  if (isPending || !decision) {
    return <LoadingSpinner />;
  }

const getFinalDecisionColor = (decision: string) => {
    switch (decision) {
        case "ACCEPT":
            return "bg-green-100 text-green-800 border-green-300";
        case "MAJOR_REVISION":
            return "bg-amber-100 text-amber-800 border-amber-300";
        case "MINOR_REVISION":
            return "bg-blue-100 text-blue-800 border-blue-300";
        case "REJECT":
            return "bg-red-100 text-red-800 border-red-300";
        default:
            return "bg-gray-100 text-gray-800 border-gray-300";
    }
};

  return (
    <div className="main-content-height bg-background">
      <main className="max-w-6xl mx-auto px-6 py-8">
        <div className="flex items-center justify-between mb-8">
          <h1 className="text-2xl font-semibold text-foreground">
            Your Decision for Submission{" "}
            <span className="text-muted-foreground">
              {decision.submission.id}
            </span>{" "}
            of CONF2024
          </h1>
          <Button
            asChild
            className="bg-primary text-primary-foreground hover:bg-primary/90"
          >
            <Link href={`/dashboard/conference/${conferenceId}`}>
              Go to Conference
            </Link>
          </Button>
        </div>

        {/* Paper Details and Authors */}
        <SubmissionOverview
          submission={decision.submission as never}
          className="mb-8"
        />

        {/* Review Details or Edit Form */}
        {isEditing ? (
          <Card className="mb-8">
            <CardHeader>
              <CardTitle>Edit Decision</CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="space-y-2">
                <Label htmlFor="finalDecision">Final Decision</Label>
                <Select
                  value={finalDecision}
                  onValueChange={(value) =>
                    setFinalDecision(
                      value as
                        | "ACCEPT"
                        | "MAJOR_REVISION"
                        | "MINOR_REVISION"
                        | "REJECT"
                    )
                  }
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select recommendation" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="ACCEPT">
                      <span className="text-green-800 font-medium">
                        Accepted
                      </span>
                    </SelectItem>
                    <SelectItem value="MAJOR_REVISION">
                      <span className="text-amber-800 font-medium">
                        Major Revision
                      </span>
                    </SelectItem>
                    <SelectItem value="MINOR_REVISION">
                      <span className="text-blue-800 font-medium">
                        Minor Revision
                      </span>
                    </SelectItem>
                    <SelectItem value="REJECT">
                      <span className="text-red-800 font-medium">Rejected</span>
                    </SelectItem>
                  </SelectContent>
                </Select>
              </div>
              {/* Action Buttons */}
              <div className="flex justify-end space-x-3">
                <Button
                  variant="outline"
                  onClick={handleCancel}
                  disabled={updateDecisionMutation.isPending}
                >
                  Cancel
                </Button>
                <Button
                  onClick={handleSave}
                  disabled={updateDecisionMutation.isPending}
                  className="bg-primary text-primary-foreground hover:bg-primary/90"
                >
                  {updateDecisionMutation.isPending
                    ? "Saving..."
                    : "Save Changes"}
                </Button>
              </div>
            </CardContent>
          </Card>
        ) : (
          <>
            {/* Review Details */}
            <div className="mb-8">
              <h2 className="text-xl font-semibold text-foreground mb-4">
                Your Decision
              </h2>
              <Card className="py-2 border-2 border-border/60">
                <CardContent className="p-6">
                  <div className="space-y-4">
                    <div className="grid grid-cols-[160px_1fr] gap-4">
                      <span className="font-medium text-foreground">
                        Final Decision
                      </span>
                      <Badge
                        variant="outline"
                        className={`w-fit ${getFinalDecisionColor(
                          decision.reviewDecision
                        )}`}
                      >
                        {decision.reviewDecision}
                      </Badge>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Edit Review Button */}
            <div className="flex justify-end">
              <Button
                onClick={() => setIsEditing(true)}
                className="bg-primary text-primary-foreground hover:bg-primary/90 px-8"
              >
                Edit Decision
              </Button>
            </div>
          </>
        )}
      </main>
    </div>
  );
}
