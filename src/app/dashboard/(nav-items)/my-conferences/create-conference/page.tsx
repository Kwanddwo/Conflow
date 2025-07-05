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
import { Calendar, Plus, X } from "lucide-react";

export default function ConferenceForm() {
  const [secondaryAreas, setSecondaryAreas] = useState([
    { id: 1, text: "Typed in area" },
    { id: 2, text: "Research area" },
  ]);

  const addSecondaryArea = () => {
    const newId = Math.max(...secondaryAreas.map((area) => area.id)) + 1;
    setSecondaryAreas([...secondaryAreas, { id: newId, text: "" }]);
  };

  const removeSecondaryArea = (id: number) => {
    setSecondaryAreas(secondaryAreas.filter((area) => area.id !== id));
  };

  const updateSecondaryArea = (id: number, text: string) => {
    setSecondaryAreas(
      secondaryAreas.map((area) => (area.id === id ? { ...area, text } : area))
    );
  };

  return (
    <div className="max-w-2xl mx-auto p-6 bg-white">
      <form className="space-y-8">
        {/* Conference Name & Acronym */}
        <div className="space-y-4">
          <h2 className="text-lg font-medium text-[#0f172a]">
            Conference Name & Acronym
          </h2>

          <div className="space-y-2">
            <Input
              placeholder="Name"
              className="border-[#e2e8f0] text-[#64748b] placeholder:text-[#94a3b8]"
            />
            <p className="text-sm text-[#64748b]">
              Enter The conference&apos;s full name
            </p>
          </div>

          <div className="space-y-2">
            <Input
              placeholder="ACR20XX"
              className="border-[#e2e8f0] text-[#64748b] placeholder:text-[#94a3b8]"
            />
            <p className="text-sm text-[#64748b]">
              Acronym must contain atleast one digit
            </p>
          </div>
        </div>

        {/* Conference Location */}
        <div className="space-y-4">
          <h2 className="text-lg font-medium text-[#0f172a]">
            Conference Location
          </h2>

          <Input
            placeholder="Venue"
            className="border-[#e2e8f0] text-[#64748b] placeholder:text-[#94a3b8]"
          />

          <Input
            placeholder="City"
            className="border-[#e2e8f0] text-[#64748b] placeholder:text-[#94a3b8]"
          />

          <Select>
            <SelectTrigger className="border-[#e2e8f0] text-[#94a3b8]">
              <SelectValue placeholder="Country" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="us">United States</SelectItem>
              <SelectItem value="uk">United Kingdom</SelectItem>
              <SelectItem value="ca">Canada</SelectItem>
              <SelectItem value="au">Australia</SelectItem>
            </SelectContent>
          </Select>
        </div>

        {/* Web Page */}
        <div className="space-y-4">
          <h2 className="text-lg font-medium text-[#0f172a]">Web Page</h2>

          <div className="space-y-2">
            <Input
              placeholder="https://www.example.com"
              className="border-[#e2e8f0] text-[#64748b] placeholder:text-[#94a3b8]"
            />
            <p className="text-sm text-[#64748b]">
              Enter The conference&apos;s web page
            </p>
          </div>
        </div>

        {/* Dates and deadlines */}
        <div className="space-y-4">
          <h2 className="text-lg font-medium text-[#0f172a]">
            Dates and deadlines
          </h2>

          <div className="space-y-2">
            <div className="relative">
              <Input
                placeholder="Start date"
                className="border-[#e2e8f0] text-[#64748b] placeholder:text-[#94a3b8] pr-12"
              />
              <Button
                type="button"
                variant="ghost"
                size="icon"
                className="absolute right-2 top-1/2 -translate-y-1/2 h-8 w-8 bg-[#1e293b] hover:bg-[#334155]"
              >
                <Calendar className="h-4 w-4 text-white" />
              </Button>
            </div>
            <p className="text-sm text-[#64748b]">
              Enter The conference&apos;s start date
            </p>
          </div>

          <div className="space-y-2">
            <div className="relative">
              <Input
                placeholder="End date"
                className="border-[#e2e8f0] text-[#64748b] placeholder:text-[#94a3b8] pr-12"
              />
              <Button
                type="button"
                variant="ghost"
                size="icon"
                className="absolute right-2 top-1/2 -translate-y-1/2 h-8 w-8 bg-[#1e293b] hover:bg-[#334155]"
              >
                <Calendar className="h-4 w-4 text-white" />
              </Button>
            </div>
            <p className="text-sm text-[#64748b]">
              Enter The conference&apos;s end date
            </p>
          </div>

          <div className="space-y-2">
            <div className="relative">
              <Input
                placeholder="Abstract registration deadline"
                className="border-[#e2e8f0] text-[#64748b] placeholder:text-[#94a3b8] pr-12"
              />
              <Button
                type="button"
                variant="ghost"
                size="icon"
                className="absolute right-2 top-1/2 -translate-y-1/2 h-8 w-8 bg-[#1e293b] hover:bg-[#334155]"
              >
                <Calendar className="h-4 w-4 text-white" />
              </Button>
            </div>
            <p className="text-sm text-[#64748b]">
              Enter The CFP Abstraction registration deadline
            </p>
          </div>

          <div className="space-y-2">
            <div className="relative">
              <Input
                placeholder="Submission deadline"
                className="border-[#e2e8f0] text-[#64748b] placeholder:text-[#94a3b8] pr-12"
              />
              <Button
                type="button"
                variant="ghost"
                size="icon"
                className="absolute right-2 top-1/2 -translate-y-1/2 h-8 w-8 bg-[#1e293b] hover:bg-[#334155]"
              >
                <Calendar className="h-4 w-4 text-white" />
              </Button>
            </div>
            <p className="text-sm text-[#64748b]">
              Enter The CFP submission deadline
            </p>
          </div>
        </div>

        {/* Research Areas */}
        <div className="space-y-4">
          <h2 className="text-lg font-medium text-[#0f172a]">Research Areas</h2>
          <p className="text-sm text-[#64748b]">
            Enter the primary research areas of the conference (max 3), and the
            secondary areas corresponding to each primary area
          </p>

          {/* Primary area no. 1 */}
          <div className="space-y-3">
            <Label className="text-sm font-medium text-[#0f172a]">
              Primary area no. 1
            </Label>
            <Input
              placeholder="Typed in area"
              className="border-[#e2e8f0] text-[#0f172a] placeholder:text-[#0f172a]"
            />

            <div className="space-y-2">
              <Label className="text-sm font-medium text-[#334155] bg-[#cbd5e1] px-2 py-1 rounded">
                Secondary areas
              </Label>
              <div className="bg-[#cbd5e1] p-3 rounded-md space-y-2">
                <div className="flex flex-wrap gap-2">
                  {secondaryAreas.map((area) => (
                    <div key={area.id} className="flex items-center gap-1">
                      <span className="bg-white px-3 py-1 rounded-full text-sm text-[#0f172a] border border-[#e2e8f0]">
                        {area.text || "Research area"}
                      </span>
                      {secondaryAreas.length > 1 && (
                        <Button
                          type="button"
                          variant="ghost"
                          size="icon"
                          className="h-6 w-6 hover:bg-[#94a3b8]"
                          onClick={() => removeSecondaryArea(area.id)}
                        >
                          <X className="h-3 w-3" />
                        </Button>
                      )}
                    </div>
                  ))}
                  <Button
                    type="button"
                    variant="ghost"
                    size="icon"
                    className="h-8 w-8 rounded-full bg-white hover:bg-[#f8fafc] border border-[#e2e8f0]"
                    onClick={addSecondaryArea}
                  >
                    <Plus className="h-4 w-4 text-[#64748b]" />
                  </Button>
                </div>
              </div>
            </div>
          </div>

          {/* Primary area no. 2 */}
          <div className="space-y-2">
            <Label className="text-sm font-medium text-[#0f172a]">
              Primary area no. 2
            </Label>
            <Input
              placeholder="Research area"
              className="border-[#e2e8f0] text-[#64748b] placeholder:text-[#94a3b8]"
            />
          </div>

          {/* Primary area no. 3 */}
          <div className="space-y-2">
            <Label className="text-sm font-medium text-[#0f172a]">
              Primary area no. 3
            </Label>
            <Input
              placeholder="Research area"
              className="border-[#e2e8f0] text-[#64748b] placeholder:text-[#94a3b8]"
            />
          </div>
        </div>

        {/* Submit Button */}
        <Button
          type="submit"
          className="w-full bg-[#1e293b] hover:bg-[#334155] text-white py-3 text-base font-medium"
        >
          Send Creation Request
        </Button>
      </form>
    </div>
  );
}
