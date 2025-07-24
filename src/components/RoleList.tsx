import Link from "next/link";
import { Card, CardContent } from "./ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "./ui/table";
import { BadgeCheck,ExternalLink, FileText, Hash } from "lucide-react";
import { Button } from "./ui/button";

export default function RoleList({
  conferences,
  title,
}: {
  conferences: Array<{
    id: string;
    title: string;
    acronym: string;
    role: string;
  }>;
  title: string | undefined;
}) {
  const getLink = (role: string, conferenceId: string) => {
    if (role === "AUTHOR") {
      return `/dashboard/conference/${conferenceId}/your-submissions`;
    }
    if (role === "REVIEWER") {
      return `/dashboard/conference/${conferenceId}/your-reviews`;
    }
    return `/dashboard/conference/${conferenceId}`;
  };
  return (
    <div className="main-content-height bg-gradient-to-br from-background via-muted/20 to-muted/40 p-6">
      <div className="max-w-4xl mx-auto space-y-4">
        <div className="space-y-4">
          <div className="flex items-center justify-center gap-3">
            <BadgeCheck className="w-8 h-8 text-primary" />
            <h1 className="text-3xl md:text-4xl font-semibold tracking-tight text-foreground">
              {title || "Your Roles"}
            </h1>
          </div>
        </div>
        <Card className="border-2 border-border/60 hover:border-border transition-colors duration-300 bg-card/95 backdrop-blur supports-[backdrop-filter]:bg-card/60 overflow-hidden">
          <CardContent className="p-0">
            <Table>
              <TableHeader>
                <TableRow className="border-b hover:bg-transparent">
                  <TableHead className="text-sm font-semibold h-12 px-4">
                    <div className="flex items-center gap-2">
                      <Hash className="w-4 h-4 text-muted-foreground" />
                      <span>Acronym</span>
                    </div>
                  </TableHead>
                  <TableHead className="text-sm font-semibold h-12 px-4">
                    <div className="flex items-center gap-2">
                      <FileText className="w-4 h-4 text-muted-foreground" />
                      <span>Name</span>
                    </div>
                  </TableHead>
                  <TableHead className="text-sm font-semibold h-12 px-4">
                    <div className="flex items-center gap-2">
                      <BadgeCheck className="w-4 h-4 text-muted-foreground" />
                      <span>Role</span>
                    </div>
                  </TableHead>
                  <TableHead className="text-sm font-semibold h-12 px-4 w-[50px]">
                    <span className="sr-only">Actions</span>
                  </TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {conferences ? (
                  conferences
                    .filter(
                      (item, index, self) =>
                        index ===
                        self.findIndex(
                          (conf) =>
                            conf.acronym === item.acronym &&
                            conf.role === item.role
                        )
                    )
                    .map((item, index) => (
                      <TableRow
                        key={index}
                        className="group border-b last:border-b-0 hover:bg-muted/50 transition-all duration-200 ease-in-out"
                      >
                        <TableCell className="h-12 px-4">
                          {/* The route should change based on role!! */}
                          <Link href={getLink(item.role, item.id)}>
                            <p className="text-sm text-muted-foreground group-hover:text-foreground transition-colors">
                              {item.acronym}
                            </p>
                          </Link>
                        </TableCell>
                        <TableCell className="h-12 px-4">
                          <Link href={getLink(item.role, item.id)}>
                            <p className="text-sm text-muted-foreground group-hover:text-foreground transition-colors">
                              {item.title}
                            </p>
                          </Link>
                        </TableCell>
                        <TableCell className="h-12 px-4">
                          <Link href={getLink(item.role, item.id)}>
                            <p className="text-sm text-muted-foreground group-hover:text-foreground transition-colors">
                              {item.role}
                            </p>
                          </Link>
                        </TableCell>
                        <TableCell className="h-12 px-4">
                          <Link href={getLink(item.role, item.id)}>
                            <Button
                              variant="ghost"
                              size="sm"
                              className="opacity-0 group-hover:opacity-100 transition-opacity cursor-pointer"
                            >
                              <ExternalLink className="w-4 h-4" />
                              <span className="sr-only">View conference</span>
                            </Button>
                          </Link>
                        </TableCell>
                      </TableRow>
                    ))
                ) : (
                  <TableRow>
                    <TableCell
                      colSpan={4}
                      className="h-24 px-4 text-center text-sm text-muted-foreground"
                    >
                      You currently have no roles in any conferences.
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
