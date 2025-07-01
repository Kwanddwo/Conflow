"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import { useEffect } from "react";

export default function Dasboard() {
  const { data: session, status } = useSession();
  const router = useRouter();

  useEffect(() => {
    if (status === "unauthenticated") {
      router.replace("/sign-in");
    }
  }, [status, router]);
  const roles = [
    { conference: "CONF2024", role: "Chair", variant: "default" as const },
    { conference: "CONF2023", role: "Reviewer", variant: "secondary" as const },
    { conference: "SIDECONF2023", role: "Author", variant: "outline" as const },
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-muted/20 to-muted/40 p-8">
      <div className="max-w-4xl mx-auto space-y-8">
        <div className="text-center space-y-4">
          <h1 className="text-4xl font-bold tracking-tight bg-gradient-to-r from-foreground to-foreground/70 bg-clip-text text-transparent">
            Your Recent Roles
          </h1>
          <p className="text-muted-foreground text-lg">
            Professional contributions and responsibilities
          </p>
        </div>
        <Card className="border-0 shadow-2xl bg-card/95 backdrop-blur supports-[backdrop-filter]:bg-card/60">
          <CardHeader className="pb-4">
            <CardTitle className="text-2xl font-semibold">
              Conference Participation
            </CardTitle>
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow className="border-border/50 hover:bg-transparent">
                  <TableHead className="text-base font-semibold">
                    Conference
                  </TableHead>
                  <TableHead className="text-base font-semibold">
                    Role
                  </TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {roles.map((item, index) => (
                  <TableRow
                    key={index}
                    className="group border-border/30 hover:bg-muted/50 transition-all duration-300 ease-in-out"
                  >
                    <TableCell className="py-6">
                      <div className="space-y-1">
                        <p className="text-lg font-medium group-hover:text-foreground/90 transition-colors">
                          {item.conference}
                        </p>
                        <p className="text-sm text-muted-foreground">
                          Academic Conference
                        </p>
                      </div>
                    </TableCell>
                    <TableCell className="py-6">
                      <Badge
                        variant={item.variant}
                        className="text-sm px-4 font-medium group-hover:scale-105 transition-transform duration-200 ease-out"
                      >
                        {item.role}
                      </Badge>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </CardContent>
        </Card>

      </div>
    </div>
  );
}
