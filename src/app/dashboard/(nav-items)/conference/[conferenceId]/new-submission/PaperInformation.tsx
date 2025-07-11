"use client";

import type React from "react";

import { useState } from "react";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { UploadButton } from "@/lib/uploadthing";

export default function PaperSubmissionForm() {
  const [selectedFile, setSelectedFile] = useState<string | null>(null);
  const [uploadedFileUrl, setUploadedFileUrl] = useState<string | null>(null);

  return (
    <div>
      <form className="space-y-6">
        {/* Title Section */}
        <div className="space-y-2">
          <Label htmlFor="title" className="text-[#000000] font-medium">
            Title
          </Label>
          <Input
            id="title"
            placeholder="Title"
            className="w-full border-[#cbd5e1] text-[#94a3b8] placeholder:text-[#94a3b8]"
          />
        </div>

        {/* Abstract Section */}
        <div className="space-y-2">
          <Label htmlFor="abstract" className="text-[#000000] font-medium">
            Abstract
          </Label>
          <Textarea
            id="abstract"
            placeholder="Abstract"
            rows={4}
            className="w-full border-[#cbd5e1] text-[#94a3b8] placeholder:text-[#94a3b8] resize-none"
          />
        </div>

        {/* Area/Track Section */}
        <div className="space-y-2">
          <Label htmlFor="area-track" className="text-[#000000] font-medium">
            Area/Track
          </Label>
          <Select>
            <SelectTrigger className="w-full border-[#cbd5e1] text-[#64748b]">
              <SelectValue placeholder="Research Area" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="ai">Artificial Intelligence</SelectItem>
              <SelectItem value="ml">Machine Learning</SelectItem>
              <SelectItem value="nlp">Natural Language Processing</SelectItem>
              <SelectItem value="cv">Computer Vision</SelectItem>
              <SelectItem value="hci">Human-Computer Interaction</SelectItem>
              <SelectItem value="systems">Systems</SelectItem>
            </SelectContent>
          </Select>
        </div>

        {/* Keywords Section */}
        <div className="space-y-2">
          <Label htmlFor="keywords" className="text-[#000000] font-medium">
            Keywords
          </Label>
          <Textarea
            id="keywords"
            placeholder="Keyword 1&#10;Keyword 2&#10;Keyword 3"
            rows={3}
            className="w-full border-[#cbd5e1] text-[#94a3b8] placeholder:text-[#94a3b8] resize-none"
          />
          <p className="text-[#64748b] text-sm">
            Type a list of keywords for your paper, each keyword should be in
            its own line!!
          </p>
        </div>

        {/* Files Section */}
        <div className="space-y-2">
          <Label htmlFor="files" className="text-[#000000] font-medium">
            Files
          </Label>
          <div className="flex items-center gap-3">
            <UploadButton
              endpoint="mediaUploader"
              onClientUploadComplete={(res) => {
                // Do something with the response
                console.log("Files: ", res);
                if (res && res[0]) {
                  setSelectedFile(res[0].name);
                  setUploadedFileUrl(res[0].url);
                }
              }}
              onUploadError={(error: Error) => {
                // Do something with the error.
                alert(`ERROR! ${error.message}`);
              }}
              content={{
                button: "Browse...",
                allowedContent: "PDF files only",
              }}
              appearance={{
                button: "bg-[#0f172a] hover:bg-[#000000] text-[#ffffff] px-4 py-2 rounded-md font-medium",
                allowedContent: "text-[#64748b] text-sm",
              }}
            />
            {selectedFile && (
              <span className="text-[#64748b] text-sm">{selectedFile}</span>
            )}
          </div>
          <p className="text-[#64748b] text-sm">
            Upload your paper, which must be in PDF format
          </p>
        </div>
      </form>
    </div>
  );
}
