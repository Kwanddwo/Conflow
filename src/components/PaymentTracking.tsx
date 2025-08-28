"use client";

import { useState } from "react";
import { trpc } from "@/server/client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { CreditCard, CheckCircle, XCircle, Download } from "lucide-react";
import { toast } from "sonner";
import LoadingSpinner from "./LoadingSpinner";

interface PaymentTrackingProps {
  conferenceId: string;
}

export default function PaymentTracking({
  conferenceId,
}: PaymentTrackingProps) {
  const [updatingAuthorId, setUpdatingAuthorId] = useState<string | null>(null);

  const {
    data: acceptedSubmissions,
    isLoading,
    refetch,
  } = trpc.submission.getAcceptedSubmissionsWithPaymentStatus.useQuery({
    conferenceId,
  });

  const updatePaymentMutation = trpc.submission.updatePaymentStatus.useMutation(
    {
      onSuccess: (data) => {
        toast.success(data.message);
        refetch();
      },
      onError: (error) => {
        toast.error(error.message || "Failed to update payment status");
      },
      onSettled: () => {
        setUpdatingAuthorId(null);
      },
    }
  );

  const handlePaymentToggle = async (
    authorId: string,
    currentStatus: boolean
  ) => {
    setUpdatingAuthorId(authorId);
    updatePaymentMutation.mutate({
      conferenceId,
      authorId,
      hasPaid: !currentStatus,
    });
  };

  const handleDownloadReport = () => {
    if (!acceptedSubmissions || acceptedSubmissions.length === 0) return;

    // Flatten authors from all accepted submissions
    const allAuthors = acceptedSubmissions.flatMap((submission) =>
      submission.submissionAuthors.map((author) => ({
        ...author,
        submissionId: submission.id,
        submissionTitle: submission.title,
      }))
    );

    // Prepare CSV data
    const headers = [
      "Author Name",
      "Email",
      "Affiliation",
      "Submission Title",
      "Submission ID",
      "Role",
      "Payment Status",
      "Export Date",
    ];

    const rows = allAuthors.map((author) => [
      `${author.firstName} ${author.lastName}`,
      author.email,
      author.affiliation,
      author.submissionTitle,
      author.submissionId,
      author.isCorresponding ? "Corresponding Author" : "Co-Author",
      author.hasPaid ? "Paid" : "Unpaid",
      new Date().toLocaleDateString(),
    ]);

    // Convert to CSV format
    const csvContent = [
      headers.join(","),
      ...rows.map((row) => row.map((field) => `"${field}"`).join(",")),
    ].join("\n");

    // Create and download file
    const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
    const link = document.createElement("a");
    const url = URL.createObjectURL(blob);
    link.setAttribute("href", url);
    link.setAttribute(
      "download",
      `${conferenceId}-payment-report-${
        new Date().toISOString().split("T")[0]
      }.csv`
    );
    link.style.visibility = "hidden";
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);

    toast.success("Payment report downloaded successfully!");
  };

  if (isLoading) {
    return <LoadingSpinner />;
  }

  if (!acceptedSubmissions || acceptedSubmissions.length === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <CreditCard className="h-5 w-5" />
            Payment Tracking
          </CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-muted-foreground">
            No accepted submissions found for payment tracking.
          </p>
        </CardContent>
      </Card>
    );
  }

  // Flatten authors from all accepted submissions
  const allAuthors = acceptedSubmissions.flatMap((submission) =>
    submission.submissionAuthors.map((author) => ({
      ...author,
      submissionId: submission.id,
      submissionTitle: submission.title,
    }))
  );

  const paidAuthors = allAuthors.filter((author) => author.hasPaid);
  const unpaidAuthors = allAuthors.filter((author) => !author.hasPaid);

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center gap-2">
            <CreditCard className="h-5 w-5" />
            Payment Tracking
          </CardTitle>
          <Button
            variant="outline"
            size="sm"
            onClick={handleDownloadReport}
            className="flex items-center gap-2"
          >
            <Download className="h-4 w-4" />
            Download Report
          </Button>
        </div>
        <div className="flex gap-4 text-sm text-muted-foreground">
          <span>
            Total Authors: <strong>{allAuthors.length}</strong>
          </span>
          <span>
            Paid:{" "}
            <strong className="text-emerald-600 dark:text-emerald-400">
              {paidAuthors.length}
            </strong>
          </span>
          <span>
            Unpaid:{" "}
            <strong className="text-destructive">{unpaidAuthors.length}</strong>
          </span>
        </div>
      </CardHeader>
      <CardContent>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Author Name</TableHead>
              <TableHead>Email</TableHead>
              <TableHead>Affiliation</TableHead>
              <TableHead>Submission</TableHead>
              <TableHead>Role</TableHead>
              <TableHead>Payment Status</TableHead>
              <TableHead>Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {allAuthors.map((author) => (
              <TableRow key={`${author.submissionId}-${author.id}`}>
                <TableCell className="font-medium">
                  {author.firstName} {author.lastName}
                </TableCell>
                <TableCell>{author.email}</TableCell>
                <TableCell>{author.affiliation}</TableCell>
                <TableCell
                  className="max-w-xs truncate"
                  title={author.submissionTitle}
                >
                  {author.submissionTitle}
                </TableCell>
                <TableCell>
                  <Badge
                    variant={author.isCorresponding ? "default" : "secondary"}
                  >
                    {author.isCorresponding ? "Corresponding" : "Co-Author"}
                  </Badge>
                </TableCell>
                <TableCell>
                  <div className="flex items-center gap-2">
                    {author.hasPaid ? (
                      <CheckCircle className="h-4 w-4 text-emerald-600 dark:text-emerald-400" />
                    ) : (
                      <XCircle className="h-4 w-4 text-destructive" />
                    )}
                    <Badge
                      variant={author.hasPaid ? "secondary" : "destructive"}
                    >
                      {author.hasPaid ? "Paid" : "Unpaid"}
                    </Badge>
                  </div>
                </TableCell>
                <TableCell>
                  <Button
                    variant={author.hasPaid ? "outline" : "default"}
                    size="sm"
                    onClick={() =>
                      handlePaymentToggle(author.id, author.hasPaid)
                    }
                    disabled={updatingAuthorId === author.id}
                    className={
                      author.hasPaid
                        ? "border-destructive text-destructive hover:bg-destructive hover:text-destructive-foreground"
                        : "bg-emerald-600 hover:bg-emerald-700 text-white dark:bg-emerald-700 dark:hover:bg-emerald-800"
                    }
                  >
                    {updatingAuthorId === author.id ? (
                      <div className="h-4 w-4 animate-spin rounded-full border-2 border-current border-t-transparent" />
                    ) : author.hasPaid ? (
                      "Mark Unpaid"
                    ) : (
                      "Mark Paid"
                    )}
                  </Button>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </CardContent>
    </Card>
  );
}
