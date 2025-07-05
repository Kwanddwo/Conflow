"use client";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import Link from "next/link";

export default function MyConferences() {
  const conferences = [
    { acronym: "CONF2024", name: "Chair" },
    { acronym: "CONF2023", name: "Reviewer" },
    { acronym: "SIDECONF2023", name: "Author" },
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-muted/20 to-muted/40 p-8">
      <div className="max-w-4xl mx-auto space-y-8">
        <div className="text-center space-y-4">
          <h1 className="text-4xl font-bold tracking-tight bg-gradient-to-r from-foreground to-foreground/70 bg-clip-text text-transparent">
            Your Conferences
          </h1>
        </div>
        <Card className="border-0 shadow-2xl bg-card/95 backdrop-blur supports-[backdrop-filter]:bg-card/60">
          <CardHeader className="pb-4">
            <CardTitle className="text-2xl font-semibold">
              Conferences
            </CardTitle>
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow className="border-border/50 hover:bg-transparent">
                  <TableHead className="text-base font-semibold">
                    Acronym
                  </TableHead>
                  <TableHead className="text-base font-semibold">
                    Name
                  </TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {conferences.map((item, index) => (
                  <TableRow
                    key={index}
                    className="group border-border/30 hover:bg-muted/50 transition-all duration-300 ease-in-out"
                  >
                    <TableCell className="py-6">
                      <p className="text-lg font-medium group-hover:text-foreground/90 transition-colors">
                        {item.acronym}
                      </p>
                    </TableCell>
                    <TableCell className="py-6">
                      <p className="text-lg font-medium group-hover:text-foreground/90 transition-colors">
                        {item.name}
                      </p>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
        <div className="flex justify-center">
          <Link href="/dashboard/my-conferences/create-conference">
            <Button className="cursor-pointer">Create Conference</Button>
          </Link>
        </div>
      </div>
    </div>
  );
}
