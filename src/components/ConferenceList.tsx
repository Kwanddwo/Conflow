import { Conference } from "@prisma/client";
import Link from "next/link";
import { Card, CardContent } from "./ui/card";
import {
  Table,
  TableHeader,
  TableRow,
  TableHead,
  TableBody,
  TableCell,
} from "./ui/table";
import { Button } from "./ui/button";
import { Badge } from "./ui/badge";
import { getName } from "country-list";
import {
  Hash,
  FileText,
  Activity,
  Globe,
  MapPin,
  ExternalLink,
  Calendar,
} from "lucide-react";

const getStatusBadge = (status: string) => {
  const statusConfig = {
    PENDING: {
      variant: "outline" as const,
      className: "bg-yellow-100 text-yellow-800 border-yellow-300",
    },
    APPROVED: {
      variant: "default" as const,
      className: "bg-green-100 text-green-800 border-green-300",
    },
    REJECTED: {
      variant: "destructive" as const,
      className: "bg-red-100 text-red-800 border-red-300",
    },
    COMPLETED: {
      variant: "secondary" as const,
      className: "bg-blue-100 text-blue-800 border-blue-300",
    },
  };

  const config =
    statusConfig[status as keyof typeof statusConfig] || statusConfig.PENDING;

  return (
    <Badge
      variant="outline"
      className={`font-medium ${config.className} transition-colors group-hover:saturate-150`}
    >
      <Activity className="w-3 h-3 mr-1" />
      {status}
    </Badge>
  );
};

export default function ConferenceList({
  conferences,
  title = "All Conferences",
  route,
  actionButton,
}: {
  conferences: Pick<
    Conference,
    "id" | "acronym" | "title" | "status" | "locationCity" | "locationCountry"
  >[];
  title?: string;
  route: string;
  actionButton?: {
    label: string;
    href: string;
    icon?: React.ComponentType<{ className?: string }>;
  };
}) {
  return (
    <div className="max-w-4xl mx-auto space-y-4">
      <div className="text-center space-y-4">
        <div className="flex items-center justify-center gap-3 mb-2">
          <div className="p-3 bg-primary/5 rounded-full">
            <Calendar className="w-8 h-8" />
          </div>
          <h1 className="text-3xl md:text-4xl font-semibold tracking-tight text-foreground">
            {title}
          </h1>
        </div>
        {actionButton && (
          <div className="flex justify-center">
            <Button asChild className="gap-2">
              <Link href={actionButton.href}>
                {actionButton.icon && <actionButton.icon className="h-4 w-4" />}
                {actionButton.label}
              </Link>
            </Button>
          </div>
        )}
      </div>
      <Card className="py-2 border-2 border-border/60 hover:border-border transition-colors duration-300 bg-card/95 backdrop-blur supports-[backdrop-filter]:bg-card/60 overflow-hidden">
        <CardContent className="p-0">
          {conferences.length === 0 ? (
            <div className="text-center space-y-4 px-6">
              <div className="text-6xl">📚</div>
              <h3 className="text-xl font-semibold text-muted-foreground">
                No conferences found
              </h3>
              <p className="text-muted-foreground max-w-md mx-auto">
                There are currently no conferences available. Check back later
                or create a new conference to get started.
              </p>
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow className="border-b hover:bg-transparent">
                  <TableHead className="text-base font-semibold h-10 px-4">
                    <div className="flex items-center gap-2">
                      <Hash className="w-4 h-4 text-muted-foreground" />
                      Acronym
                    </div>
                  </TableHead>
                  <TableHead className="text-base font-semibold h-10 px-4">
                    <div className="flex items-center gap-2">
                      <FileText className="w-4 h-4 text-muted-foreground" />
                      Name
                    </div>
                  </TableHead>
                  <TableHead className="text-base font-semibold h-10 px-4">
                    <div className="flex items-center gap-2">
                      <Activity className="w-4 h-4 text-muted-foreground" />
                      Status
                    </div>
                  </TableHead>
                  <TableHead className="text-base font-semibold h-10 px-4 w-[50px]">
                    <span className="sr-only">Actions</span>
                  </TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {conferences.map((conf) => (
                  <TableRow
                    key={conf.id}
                    className="group border-b last:border-b-0 hover:bg-muted/30 transition-all duration-200 ease-in-out cursor-pointer"
                  >
                    <TableCell className="h-10 px-4">
                      <Link href={`${route}/${conf.id}`} className="block">
                        <div className="flex items-center gap-2">
                          <Hash className="w-4 h-4 text-muted-foreground group-hover:text-foreground transition-colors" />
                          <span className="text-sm text-muted-foreground group-hover:text-foreground transition-colors">
                            {conf.acronym}
                          </span>
                        </div>
                      </Link>
                    </TableCell>
                    <TableCell className="h-10 px-4">
                      <Link href={`${route}/${conf.id}`} className="block">
                        <div className="flex items-center gap-2">
                          <FileText className="w-4 h-4 text-muted-foreground group-hover:text-foreground transition-colors" />
                          <span className="text-sm text-muted-foreground group-hover:text-foreground transition-colors">
                            {conf.title}
                          </span>
                        </div>
                      </Link>
                    </TableCell>
                    <TableCell className="h-10 px-4">
                      <Link href={`${route}/${conf.id}`} className="block">
                        {getStatusBadge(conf.status)}
                      </Link>
                    </TableCell>
                    <TableCell className="h-10 px-4">
                      <Link href={`${route}/${conf.id}`}>
                        <Button
                          variant="ghost"
                          size="sm"
                          className="opacity-0 group-hover:opacity-100 transition-opacity"
                        >
                          <ExternalLink className="w-4 h-4" />
                          <span className="sr-only">View conference</span>
                        </Button>
                      </Link>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
