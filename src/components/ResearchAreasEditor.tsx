"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Plus, X } from "lucide-react";

interface ResearchAreasEditorProps {
  researchAreas: { [key: string]: string[] };
  setResearchAreas: React.Dispatch<React.SetStateAction<{ [key: string]: string[] }>>;
}

export default function ResearchAreasEditor({
  researchAreas,
  setResearchAreas,
}: ResearchAreasEditorProps) {
  const [newPrimaryArea, setNewPrimaryArea] = useState("");

  const addPrimaryArea = () => {
    if (newPrimaryArea.trim() && !researchAreas[newPrimaryArea.trim()]) {
      setResearchAreas((prev) => ({
        ...prev,
        [newPrimaryArea.trim()]: [],
      }));
      setNewPrimaryArea("");
    }
  };

  const removePrimaryArea = (primaryArea: string) => {
    setResearchAreas((prev) => {
      const newAreas = { ...prev };
      delete newAreas[primaryArea];
      return newAreas;
    });
  };

  const addSecondaryArea = (primaryArea: string, secondaryArea: string) => {
    if (
      secondaryArea.trim() &&
      !researchAreas[primaryArea].includes(secondaryArea.trim())
    ) {
      setResearchAreas((prev) => ({
        ...prev,
        [primaryArea]: [...prev[primaryArea], secondaryArea.trim()],
      }));
    }
  };

  const removeSecondaryArea = (primaryArea: string, secondaryArea: string) => {
    setResearchAreas((prev) => ({
      ...prev,
      [primaryArea]: prev[primaryArea].filter((area) => area !== secondaryArea),
    }));
  };

  return (
    <div className="space-y-6">
      {/* Add new primary area */}
      <div className="space-y-2">
        <Label className="text-sm font-medium text-foreground">
          Add new primary research area
        </Label>
        <div className="flex gap-2">
          <Input
            value={newPrimaryArea}
            onChange={(e) => setNewPrimaryArea(e.target.value)}
            placeholder="Enter primary research area"
            className="border-border text-foreground placeholder:text-muted-foreground"
            onKeyDown={(e) => {
              if (e.key === "Enter") {
                e.preventDefault();
                addPrimaryArea();
              }
            }}
          />
          <Button
            type="button"
            onClick={addPrimaryArea}
            disabled={
              !newPrimaryArea.trim() || !!researchAreas[newPrimaryArea.trim()]
            }
          >
            Add
          </Button>
        </div>
      </div>
      <div className="border border-border flex flex-col gap-2 rounded-xl p-2">
        {Object.entries(researchAreas).map(
          ([primaryArea, secondaryAreas], index) => (
            <PrimaryAreaComponent
              key={primaryArea}
              primaryArea={primaryArea}
              secondaryAreas={secondaryAreas}
              index={index + 1}
              onRemovePrimary={removePrimaryArea}
              onAddSecondary={addSecondaryArea}
              onRemoveSecondary={removeSecondaryArea}
            />
          )
        )}
      </div>
    </div>
  );
}

const PrimaryAreaComponent = ({
  primaryArea,
  secondaryAreas,
  index,
  onRemovePrimary,
  onAddSecondary,
  onRemoveSecondary,
}: {
  primaryArea: string;
  secondaryAreas: string[];
  index: number;
  onRemovePrimary: (primaryArea: string) => void;
  onAddSecondary: (primaryArea: string, secondaryArea: string) => void;
  onRemoveSecondary: (primaryArea: string, secondaryArea: string) => void;
}) => {
  const [newSecondaryArea, setNewSecondaryArea] = useState("");

  const handleAddSecondary = () => {
    if (newSecondaryArea.trim()) {
      onAddSecondary(primaryArea, newSecondaryArea);
      setNewSecondaryArea("");
    }
  };

  return (
    <div className="space-y-3 border border-border p-4 rounded-lg bg-card">
      <div className="flex items-center justify-between">
        <Label className="text-sm font-medium text-foreground">
          Primary area no. {index}
        </Label>
        <Button
          type="button"
          variant="ghost"
          size="icon"
          className="h-6 w-6 hover:bg-destructive/10"
          onClick={() => onRemovePrimary(primaryArea)}
        >
          <X className="h-4 w-4 text-destructive" />
        </Button>
      </div>

      <div className="bg-accent p-2 rounded border">
        <span className="text-sm font-medium text-accent-foreground">
          {primaryArea}
        </span>
      </div>

      <div className="space-y-2">
        <Label className="text-sm font-medium text-accent-foreground bg-accent px-2 py-1 rounded">
          Secondary areas
        </Label>
        <div className="bg-accent p-3 rounded-md space-y-2">
          <div className="flex flex-wrap gap-2">
            {secondaryAreas.map((secondaryArea) => (
              <div key={secondaryArea} className="flex items-center gap-1">
                <span className="bg-background px-3 py-1 rounded-full text-sm text-foreground border border-border">
                  {secondaryArea}
                </span>
                <Button
                  type="button"
                  variant="ghost"
                  size="icon"
                  className="h-6 w-6 hover:bg-muted"
                  onClick={() => onRemoveSecondary(primaryArea, secondaryArea)}
                >
                  <X className="h-3 w-3" />
                </Button>
              </div>
            ))}
          </div>

          {/* Add new secondary area */}
          <div className="flex gap-2 mt-2">
            <Input
              value={newSecondaryArea}
              onChange={(e) => setNewSecondaryArea(e.target.value)}
              placeholder="Add secondary area"
              className="bg-background border-border text-foreground placeholder:text-muted-foreground text-sm"
              onKeyDown={(e) => {
                if (e.key === "Enter") {
                  e.preventDefault();
                  handleAddSecondary();
                }
              }}
            />
            <Button
              type="button"
              size="sm"
              onClick={handleAddSecondary}
              disabled={
                !newSecondaryArea.trim() ||
                secondaryAreas.includes(newSecondaryArea.trim())
              }
              variant="outline"
            >
              <Plus className="h-4 w-4" />
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
};