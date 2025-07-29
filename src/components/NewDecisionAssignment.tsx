"use client";
import { useState } from "react";
import { trpc } from "@/server/client";
import { toast } from "sonner";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

export function NewDecisionAssignmentForm({
  conferenceId,
  submissions,
  onCreateAssignment,
  isCreating,
}: {
  conferenceId: string;
  submissions: {
    id: string;
    title: string;
  }[];
  onCreateAssignment: (data: {
    submissionId: string;
    chairRoleId: string;
    dueDate: Date;
    conferenceId: string;
  }) => void;
  isCreating: boolean;
}) {
  const [selectedReviewer, setSelectedReviewer] = useState("");
  const [selectedSubmission, setSelectedSubmission] = useState("");
  // Set default due date to 30 days from now
  const [dueDate, setDueDate] = useState(() => {
    const defaultDate = new Date();
    defaultDate.setDate(defaultDate.getDate() + 30);
    return defaultDate.toISOString().split("T")[0];
  });

  const { data: invitees } = trpc.conference.getConferenceInvitees.useQuery({
    conferenceId,
  });

  const reviewers =
    invitees?.filter((invite) => invite.role === "CHAIR" || invite.role === "MAIN_CHAIR") || [];

  const handleSubmit = () => {
    if (!selectedReviewer || !selectedSubmission || !dueDate) {
      toast.error("Please select a chair, submission, and due date");
      return;
    }

    onCreateAssignment({
      submissionId: selectedSubmission,
      chairRoleId: selectedReviewer,
      dueDate: new Date(dueDate),
      conferenceId,
    });

    // Reset form
    setSelectedReviewer("");
    setSelectedSubmission("");
    // Reset to default date (30 days from now)
    const defaultDate = new Date();
    defaultDate.setDate(defaultDate.getDate() + 30);
    setDueDate(defaultDate.toISOString().split("T")[0]);
  };

  return (
    <div className="space-y-4">
      <div>
        <label className="text-sm font-medium text-foreground mb-2 block">
          Select Chair
        </label>
        <Select value={selectedReviewer} onValueChange={setSelectedReviewer}>
          <SelectTrigger>
            <SelectValue placeholder="Choose a chair..." />
          </SelectTrigger>
          <SelectContent>
            {reviewers.map((reviewer) => (
              <SelectItem key={reviewer.user.id} value={reviewer.user.id}>
                {reviewer.user.firstName} {reviewer.user.lastName} (
                {reviewer.user.email})
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      <div>
        <label className="text-sm font-medium text-foreground mb-2 block">
          Select Submission
        </label>
        <Select
          value={selectedSubmission}
          onValueChange={setSelectedSubmission}
        >
          <SelectTrigger>
            <SelectValue placeholder="Choose a submission..." />
          </SelectTrigger>
          <SelectContent>
            {submissions.map((submission) => (
              <SelectItem key={submission.id} value={submission.id}>
                <span className="text-muted-foreground">{submission.id}</span> -{" "}
                {submission.title.length > 50
                  ? `${submission.title.substring(0, 50)}...`
                  : submission.title}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      <div>
        <Label
          htmlFor="dueDate"
          className="text-sm font-medium text-foreground mb-2 block"
        >
          Due Date
        </Label>
        <Input
          id="dueDate"
          type="date"
          value={dueDate}
          className="w-sm"
          onChange={(e) => setDueDate(e.target.value)}
          min={new Date().toISOString().split("T")[0]} // Prevent selecting past dates
        />
      </div>

      <div className="flex justify-end gap-2 pt-4">
        <button
          onClick={handleSubmit}
          disabled={
            isCreating || !selectedReviewer || !selectedSubmission || !dueDate
          }
          className="px-4 py-2 bg-primary text-primary-foreground rounded-md hover:bg-primary/90 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {isCreating ? "Creating..." : "Create Assignment"}
        </button>
      </div>
    </div>
  );
}
