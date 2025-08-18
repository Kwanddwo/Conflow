"use client";

import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { trpc } from "@/server/client";
import { GitBranch, Loader2 } from "lucide-react";
import { useRouter } from "next/navigation";
import React, { useState } from "react";

function NewDecisionModal({
  open,
  setOpen,
  conference,
  assignmentId,
}: {
  conference: { id: string; submissionDeadline: string };
  assignmentId: string;
  open: boolean;
  setOpen: (open: boolean) => void;
}) {
  const router = useRouter();
  const [finalDecision, setFinalDecision] = useState<
    "ACCEPT" | "MAJOR_REVISION" | "MINOR_REVISION" | "REJECT"
  >("ACCEPT");

  const conferenceId = conference.id;
  const handleDecisionChange = (value: string) => {
    setFinalDecision(
      value as "ACCEPT" | "MAJOR_REVISION" | "MINOR_REVISION" | "REJECT"
    );
  };
  const submitDecisionMutation = trpc.decision.submitDecision.useMutation({
    onSuccess: () => {
      router.push(`/dashboard/conference/${conferenceId}/your-decisions`);
    },
    onError: (error) => {
      console.error("Error submitting decision:", error);
    },
  });

  const isLoading = submitDecisionMutation.isPending;
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (finalDecision) {
      submitDecisionMutation.mutate({
        conferenceId,
        assignmentId,
        reviewDecision: finalDecision,
      });
    }
  };

  const decisionOptions =
    new Date() > new Date(conference.submissionDeadline)
      ? [
          { value: "ACCEPT", label: "Accept", color: "text-green-600" },
          { value: "REJECT", label: "Reject", color: "text-red-600" },
        ]
      : [
          { value: "ACCEPT", label: "Accept", color: "text-green-600" },
          { value: "REJECT", label: "Reject", color: "text-red-600" },
          {
            value: "MINOR_REVISION",
            label: "Minor Revision",
            color: "text-yellow-600",
          },
          {
            value: "MAJOR_REVISION",
            label: "Major Revision",
            color: "text-orange-600",
          },
        ];

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <GitBranch className="w-5 h-5 text-primary" />
            Make Final Decision
          </DialogTitle>
          <DialogDescription>
            Make a final decision for the submission
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="final-decision" className="text-sm font-medium">
              Final Decision *
            </Label>
            <Select value={finalDecision} onValueChange={handleDecisionChange}>
              <SelectTrigger id="final-decision">
                <SelectValue placeholder="Select a decision..." />
              </SelectTrigger>
              <SelectContent>
                {decisionOptions.map((option) => (
                  <SelectItem
                    key={option.value}
                    value={option.value}
                    className={`flex items-center gap-2 ${option.color}`}
                  >
                    {option.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <DialogFooter className="flex gap-2 sm:gap-0">
            <Button
              type="submit"
              disabled={!finalDecision || isLoading}
              className="min-w-[100px] cursor-pointer"
            >
              {isLoading ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  Submitting...
                </>
              ) : (
                "Submit Decision"
              )}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}

export default NewDecisionModal;
