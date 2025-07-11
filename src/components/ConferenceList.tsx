import { Conference } from "@prisma/client";
import Link from "next/link";
import { Card, CardHeader, CardTitle, CardContent } from "./ui/card";
import {
  Table,
  TableHeader,
  TableRow,
  TableHead,
  TableBody,
  TableCell,
} from "./ui/table";

export default function ConferenceList({
  conferences,
  title = "All Conferences",
  route,
}: {
  conferences: Pick<Conference, "id" | "acronym" | "title">[];
  title?: string;
  route: string;
}) {
  return (
    <div className="max-w-4xl mx-auto space-y-8">
      <div className="text-center space-y-4">
        <h1 className="text-4xl font-bold tracking-tight bg-gradient-to-r from-foreground to-foreground/70 bg-clip-text text-transparent">
          {title}
        </h1>
      </div>
      <Card className="border-0 shadow-2xl bg-card/95 backdrop-blur supports-[backdrop-filter]:bg-card/60">
        <CardHeader className="pb-4">
          <CardTitle className="text-2xl font-semibold">Conferences</CardTitle>
        </CardHeader>
        <CardContent>
          {conferences.length === 0 ? (
            <div className="text-center py-12 space-y-4">
              <div className="text-6xl">📚</div>
              <h3 className="text-xl font-semibold text-muted-foreground">
                No conferences found
              </h3>
              <p className="text-muted-foreground max-w-md mx-auto">
                There are currently no conferences available. Check back later or create a new conference to get started.
              </p>
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow className="border-border/50 hover:bg-transparent">
                  <TableHead className="text-base font-semibold">
                    Acronym
                  </TableHead>
                  <TableHead className="text-base font-semibold">Name</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {conferences.map((conf) => (
                  <TableRow
                    key={conf.id}
                    className="group border-border/30 hover:bg-muted/50 transition-all duration-300 ease-in-out"
                  >
                    <TableCell className="py-6">
                      <Link href={`${route}/${conf.id}`}>
                        <p className="text-lg font-medium group-hover:text-foreground/90 transition-colors">
                          {conf.acronym}
                        </p>
                      </Link>
                    </TableCell>
                    <TableCell className="py-6">
                      <Link href={`${route}/${conf.id}`}>
                        <p className="text-lg font-medium group-hover:text-foreground/90 transition-colors">
                          {conf.title}
                        </p>
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
