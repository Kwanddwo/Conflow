"use client";

import { Card, CardContent } from "@/components/ui/card";
import { getName } from "country-list";

interface Author {
  firstName: string;
  lastName: string;
  email: string;
  country: string;
  affiliation: string;
  isCorresponding: boolean;
}

interface SubmissionAuthorsListProps {
  authors: Author[];
  title?: string;
  className?: string;
  showCorrespondingColumn?: boolean;
}

export function SubmissionAuthorsList({
  authors,
  title = "Authors",
  className = "",
  showCorrespondingColumn = true,
}: SubmissionAuthorsListProps) {
  return (
    <div className={className}>
      <h2 className="text-xl font-semibold text-foreground mb-4">{title}</h2>
      <Card className="py-0 border-2 border-border/60">
        <CardContent className="p-0">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-muted/30">
                <tr>
                  <th className="text-left p-4 font-bold text-foreground">
                    First Name
                  </th>
                  <th className="text-left p-4 font-bold text-foreground">
                    Last Name
                  </th>
                  <th className="text-left p-4 font-bold text-foreground">
                    Email
                  </th>
                  <th className="text-left p-4 font-bold text-foreground">
                    Country
                  </th>
                  <th className="text-left p-4 font-bold text-foreground">
                    Affiliation
                  </th>
                  {showCorrespondingColumn && (
                    <th className="text-left p-4 font-bold text-foreground">
                      Corresponding?
                    </th>
                  )}
                </tr>
              </thead>
              <tbody>
                {authors.length === 0 ? (
                  <tr>
                    <td
                      colSpan={showCorrespondingColumn ? 6 : 5}
                      className="p-8 text-center text-muted-foreground"
                    >
                      No authors found
                    </td>
                  </tr>
                ) : (
                  authors.map((author, index) => (
                    <tr
                      key={index}
                      className="border-b border-border hover:bg-muted/30 transition-colors"
                    >
                      <td className="p-4 text-foreground">
                        {author.firstName}
                      </td>
                      <td className="p-4 text-foreground">{author.lastName}</td>
                      <td className="p-4 text-foreground">{author.email}</td>
                      <td className="p-4 text-foreground">
                        {getName(author.country)}
                      </td>
                      <td className="p-4 text-foreground">
                        {author.affiliation}
                      </td>
                      {showCorrespondingColumn && (
                        <td className="p-4 text-foreground">
                          {author.isCorresponding ? "Yes" : "No"}
                        </td>
                      )}
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
