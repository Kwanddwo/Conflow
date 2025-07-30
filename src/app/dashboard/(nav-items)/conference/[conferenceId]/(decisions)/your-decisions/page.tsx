"use client";

import { trpc } from "@/server/client";
import { useParams } from "next/navigation";
import { useSession } from "next-auth/react";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import LoadingSpinner from "@/components/LoadingSpinner";
import {
  Activity,
  AlertCircle,
  ExternalLink,
  FileText,
  GitBranch,
} from "lucide-react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { useProtectedQuery } from "@/hooks/useProtectedQuery";

interface DecisionAssignment {
  id: string;
  submission: {
    id: string;
    title: string;
    primaryArea: string;
  };
  isReviewed: boolean;
  decisionId: string | null;
  assignedByName: string;
}

export default function YourDecisionsPage() {
  const { conferenceId } = useParams<{ conferenceId: string }>();
  const { data: session } = useSession();
  const query = trpc.decision.getMyDecisionAssignments.useQuery(
    { conferenceId },
    { enabled: !!conferenceId && !!session?.user?.id }
  );
  const { data: decisions, isLoading, error } = useProtectedQuery(query);
  if (isLoading) {
    return <LoadingSpinner />;
  }

  const getLink = (
    isReviewed: boolean,
    decisionId: string,
    assignmentId: string
  ) => {
    if (isReviewed) {
      return `/dashboard/conference/${conferenceId}/your-decisions/${decisionId}`;
    }
    return `/dashboard/conference/${conferenceId}/new-decision/${assignmentId}`;
  };

  if (error) {
    return (
      <div className="max-w-4xl mx-auto p-6">
        <Card className="border-2 border-destructive/20">
          <CardContent className="p-6 text-center">
            <AlertCircle className="w-12 h-12 text-destructive mx-auto mb-4" />
            <h3 className="text-lg font-semibold text-destructive mb-2">
              Error Loading Decisions
            </h3>
            <p className="text-muted-foreground">
              {error instanceof Error
                ? error.message
                : "Failed to load your review assignments."}
            </p>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="main-content-height bg-gradient-to-br from-background via-muted/20 to-muted/40 p-6">
      <div className="max-w-4xl mx-auto space-y-4">
        <div className="space-y-4">
          <div className="flex items-center justify-center gap-3">
            <GitBranch className="w-8 h-8 text-primary" />
            <h1 className="text-3xl md:text-4xl font-semibold tracking-tight text-foreground">
              Your Decisions
            </h1>
          </div>
        </div>
        <Card className="py-1 w-full border-2 border-border/60 hover:border-border transition-colors duration-300 shadow-sm">
          <CardContent className="p-0">
            {!decisions || decisions.length === 0 ? (
              <div className="text-center py-16 space-y-4 px-6">
                <div className="w-16 h-16 mx-auto bg-muted rounded-full flex items-center justify-center">
                  <FileText className="w-8 h-8 text-muted-foreground" />
                </div>
                <h3 className="text-xl font-semibold text-muted-foreground">
                  No Decision Assignments
                </h3>
                <p className="text-muted-foreground max-w-md mx-auto">
                  You don&apos;t have any papers assigned for decision in this
                  conference yet.
                </p>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <Table className="w-full">
                  <TableHeader>
                    <TableRow className="border-b hover:bg-transparent">
                      <TableHead className="text-sm font-semibold h-12 px-4 w-[40%]">
                        <div className="flex items-center gap-2">
                          <FileText className="w-4 h-4 text-muted-foreground" />
                          <span>Title</span>
                        </div>
                      </TableHead>
                      <TableHead className="text-sm font-semibold h-12 px-4 w-[15%]">
                        <div className="flex items-center gap-2">
                          <Activity className="w-4 h-4 text-muted-foreground" />
                          <span>Decision</span>
                        </div>
                      </TableHead>
                      <TableHead className="text-sm font-semibold h-12 px-4 w-[5%]">
                        <span className="sr-only">Actions</span>
                      </TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {(decisions as DecisionAssignment[]).map((decision) => (
                      <TableRow
                        key={decision.id}
                        className="group border-b last:border-b-0 hover:bg-muted/50 transition-all duration-200 ease-in-out"
                      >
                        <TableCell className="px-4 py-4 text-sm text-muted-foreground group-hover:text-foreground transition-colors align-top max-w-0">
                          <Link
                            href={getLink(
                              decision.isReviewed,
                              decision.decisionId || "",
                              decision.id
                            )}
                            className="block"
                          >
                            <p className="font-medium text-foreground mb-1 leading-relaxed break-words overflow-wrap-anywhere">
                              {decision.submission.title.length > 70 ? (
                                <span title={decision.submission.title}>
                                  {decision.submission.title.slice(0, 50)}...
                                </span>
                              ) : (
                                decision.submission.title
                              )}
                            </p>
                          </Link>
                        </TableCell>
                        <TableCell className="px-4 py-4 align-top">
                          <Link
                            href={getLink(
                              decision.isReviewed,
                              decision.decisionId || "",
                              decision.id
                            )}
                          >
                            <Badge
                              variant="outline"
                              className={`text-sm transition-colors whitespace-nowrap ${
                                decision.isReviewed
                                  ? "bg-green-100 text-green-800 border-green-300"
                                  : "bg-yellow-100 text-yellow-800 border-yellow-300"
                              }`}
                            >
                              {decision.isReviewed ? "Made" : "Not Made"}
                            </Badge>
                          </Link>
                        </TableCell>
                        <TableCell className="px-4 py-4 align-top">
                          <Link
                            href={getLink(
                              decision.isReviewed,
                              decision.decisionId || "",
                              decision.id
                            )}
                          >
                            <Button
                              variant="ghost"
                              size="sm"
                              className="opacity-0 group-hover:opacity-100 transition-opacity cursor-pointer"
                            >
                              <ExternalLink className="w-4 h-4" />
                            </Button>
                          </Link>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
