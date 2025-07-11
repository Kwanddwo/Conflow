"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Checkbox } from "@/components/ui/checkbox";
import { Plus } from "lucide-react";
import PaperSubmissionForm from "./PaperInformation";

interface Author {
  id: number;
  firstName: string;
  lastName: string;
  email: string;
  country: string;
  affiliation: string;
  webPage: string;
  isCorresponding: boolean;
}

export default function AuthorForm() {
  const [authors, setAuthors] = useState<Author[]>([
    {
      id: 1,
      firstName: "",
      lastName: "",
      email: "",
      country: "",
      affiliation: "",
      webPage: "https://www.example.com",
      isCorresponding: false,
    },
  ]);

  const addAuthor = () => {
    const newAuthor: Author = {
      id: authors.length + 1,
      firstName: "",
      lastName: "",
      email: "",
      country: "",
      affiliation: "",
      webPage: "https://www.example.com",
      isCorresponding: false,
    };
    setAuthors([...authors, newAuthor]);
  };

  const updateAuthor = (
    id: number,
    field: keyof Author,
    value: string | boolean
  ) => {
    setAuthors(
      authors.map((author) =>
        author.id === id ? { ...author, [field]: value } : author
      )
    );
  };

  const fillWithMyInformation = (id: number) => {
    console.log(`Fill information for author ${id}`);
  };

  return (
    <div className="flex flex-col gap-8 max-w-7xl mx-auto p-6">
      {/* Author Form */}
      <div className="w-full">
        {authors.map((author) => (
          <div key={author.id} className="mb-8">
            <div className="flex items-center gap-4 mb-6">
              <h2 className="text-lg font-medium text-[#000000]">
                Author No. {author.id}
              </h2>
              <Button
                onClick={() => fillWithMyInformation(author.id)}
                className="bg-[#0f172a] hover:bg-[#0f172a]/90 text-[#ffffff] text-sm px-4 py-2 h-auto cursor-pointer"
              >
                Fill With My Information
              </Button>
            </div>

            <div className="space-y-4">
              <div>
                <Label
                  htmlFor={`firstName-${author.id}`}
                  className="text-sm font-medium text-[#000000] mb-2 block"
                >
                  First Name
                </Label>
                <Input
                  id={`firstName-${author.id}`}
                  placeholder="First Name"
                  value={author.firstName}
                  onChange={(e) =>
                    updateAuthor(author.id, "firstName", e.target.value)
                  }
                />
              </div>

              <div>
                <Label
                  htmlFor={`lastName-${author.id}`}
                  className="text-sm font-medium text-[#000000] mb-2 block"
                >
                  Last Name
                </Label>
                <Input
                  id={`lastName-${author.id}`}
                  placeholder="Last Name"
                  value={author.lastName}
                  onChange={(e) =>
                    updateAuthor(author.id, "lastName", e.target.value)
                  }
                />
              </div>

              <div>
                <Label
                  htmlFor={`email-${author.id}`}
                  className="text-sm font-medium text-[#000000] mb-2 block"
                >
                  Email
                </Label>
                <Input
                  id={`email-${author.id}`}
                  type="email"
                  placeholder="Email"
                  value={author.email}
                  onChange={(e) =>
                    updateAuthor(author.id, "email", e.target.value)
                  }
                />
              </div>

              <div>
                <Label
                  htmlFor={`country-${author.id}`}
                  className="text-sm font-medium text-[#000000] mb-2 block"
                >
                  Country
                </Label>
                <Select
                  value={author.country}
                  onValueChange={(value) =>
                    updateAuthor(author.id, "country", value)
                  }
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Country/region" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="us">United States</SelectItem>
                    <SelectItem value="uk">United Kingdom</SelectItem>
                    <SelectItem value="ca">Canada</SelectItem>
                    <SelectItem value="au">Australia</SelectItem>
                    <SelectItem value="de">Germany</SelectItem>
                    <SelectItem value="fr">France</SelectItem>
                    <SelectItem value="jp">Japan</SelectItem>
                    <SelectItem value="other">Other</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div>
                <Label
                  htmlFor={`affiliation-${author.id}`}
                  className="text-sm font-medium text-[#000000] mb-2 block"
                >
                  Affiliation
                </Label>
                <Input
                  id={`affiliation-${author.id}`}
                  placeholder="Affiliation"
                  value={author.affiliation}
                  onChange={(e) =>
                    updateAuthor(author.id, "affiliation", e.target.value)
                  }
                />
                <p className="text-sm text-[#64748b] mt-1">
                  Enter the laboratory you are associated with.
                </p>
              </div>

              <div>
                <Label
                  htmlFor={`webPage-${author.id}`}
                  className="text-sm font-medium text-[#000000] mb-2 block"
                >
                  Web Page
                </Label>
                <Input
                  id={`webPage-${author.id}`}
                  type="url"
                  value={author.webPage}
                  onChange={(e) =>
                    updateAuthor(author.id, "webPage", e.target.value)
                  }
                />
              </div>

              <div className="flex items-center space-x-2 pt-2">
                <Checkbox
                  id={`corresponding-${author.id}`}
                  checked={author.isCorresponding}
                  onCheckedChange={(checked) =>
                    updateAuthor(
                      author.id,
                      "isCorresponding",
                      checked as boolean
                    )
                  }
                />
                <Label
                  htmlFor={`corresponding-${author.id}`}
                  className="text-sm font-medium text-[#000000] cursor-pointer"
                >
                  Corresponding Author
                </Label>
              </div>
            </div>

            {author.id < authors.length && (
              <hr className="my-8 border-[#cbd5e1]" />
            )}
          </div>
        ))}

        <Button
          onClick={addAuthor}
          className="bg-[#0f172a] hover:bg-[#0f172a]/90 text-[#ffffff] flex items-center gap-2 cursor-pointer"
        >
          <Plus className="w-4 h-4" />
          Add an author
        </Button>
      </div>

      {/* Paper Submission Form */}
      <div className="w-full">
        <PaperSubmissionForm />
      </div>
    </div>
  );
}
