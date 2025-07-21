import Link from "next/link";
import { Card, CardContent, CardHeader, CardTitle } from "./ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "./ui/table";

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
    <div className="main-content-height bg-gradient-to-br from-background via-muted/20 to-muted/40 p-8">
      <div className="max-w-4xl mx-auto space-y-8">
        <div className="text-center space-y-4">
          <h1 className="text-4xl font-bold tracking-tight bg-gradient-to-r from-foreground to-foreground/70 bg-clip-text text-transparent">
            {title || "Your Roles"}
          </h1>
        </div>
        <Card className="border-0 shadow-2xl bg-card/95 backdrop-blur supports-[backdrop-filter]:bg-card/60">
          <CardHeader className="pb-4">
            <CardTitle className="text-2xl font-semibold">Roles</CardTitle>
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow className="border-border/50 hover:bg-transparent">
                  <TableHead className="text-base font-semibold">
                    Acronym
                  </TableHead>
                  <TableHead className="text-base font-semibold">
                    Role
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
                        className="group border-border/30 hover:bg-muted/50 transition-all duration-300 ease-in-out"
                      >
                        <TableCell className="py-6">
                          {/* The route should change based on role!! */}
                          <Link href={getLink(item.role, item.id)}>
                            <p className="text-lg font-medium group-hover:text-foreground/90 transition-colors">
                              {item.acronym}
                            </p>
                          </Link>
                        </TableCell>
                        <TableCell className="py-6">
                          <Link href={getLink(item.role, item.id)}>
                            <p className="text-lg font-medium group-hover:text-foreground/90 transition-colors">
                              {item.role}
                            </p>
                          </Link>
                        </TableCell>
                      </TableRow>
                    ))
                ) : (
                  <TableRow>
                    <TableCell colSpan={2} className="text-center py-6">
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
