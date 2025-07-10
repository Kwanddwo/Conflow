"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Plus, X } from "lucide-react";
import { useForm, Controller } from "react-hook-form";
import { z } from "zod";
import { trpc } from "@/server/client";
import { TRPCClientError } from "@trpc/client";
import { zodResolver } from "@hookform/resolvers/zod";
import { toast } from "sonner";
import CountrySelect from "@/components/CountrySelect";

// TODO: add verification for dates to be in the correct order!!!
// TODO: add editing for research areas
// TODO: replace these weird styles with a universal theme
// TODO: replace textarea with a rich text editor for call for papers (Slate.js)

const conferenceSchema = z.object({
  title: z.string().min(1, "Title is required"),
  acronym: z.string().min(1, "Acronym is required"),
  description: z.string().min(1, "Description is required"),
  locationVenue: z.string().min(1, "Venue is required"),
  locationCity: z.string().min(1, "City is required"),
  locationCountry: z.string().min(1, "Country is required"),
  callForPapers: z.string().min(1, "Call for papers is required"),
  websiteUrl: z.string().url().optional().or(z.literal("")),
  startDate: z.string().min(1, "Start date is required"),
  endDate: z.string().min(1, "End date is required"),
  abstractDeadline: z.string().min(1, "Abstract deadline is required"),
  submissionDeadline: z.string().min(1, "Submission deadline is required"),
  cameraReadyDeadline: z.string().min(1, "Camera ready deadline is required"),
  isPublic: z.boolean(),
  researchAreas: z.record(z.string(), z.array(z.string())),
});

type ConferenceFormData = z.infer<typeof conferenceSchema>;

export default function ConferenceForm() {
  const [researchAreas, setResearchAreas] = useState<{
    [key: string]: string[];
  }>({
    "Machine Learning": ["Deep Learning", "Neural Networks"],
  });

  const {
    register,
    handleSubmit,
    control,
    setValue,
    formState: { errors, isSubmitting },
  } = useForm<ConferenceFormData>({
    resolver: zodResolver(conferenceSchema),
    defaultValues: {
      researchAreas: {
        "Machine Learning": ["Deep Learning", "Neural Networks"],
      },
      isPublic: false,
    },
  });

  // Update form value when researchAreas state changes
  useEffect(() => {
    setValue("researchAreas", researchAreas);
  }, [researchAreas, setValue]);

  const { mutateAsync, isPending } =
    trpc.conference.createConference.useMutation();

  const onSubmit = async (data: ConferenceFormData) => {
    try {
      console.log("Submitting data:", data); // Debug log
      // Convert string dates to Date objects
      const formattedData = {
        ...data,
        startDate: new Date(data.startDate),
        endDate: new Date(data.endDate),
        abstractDeadline: new Date(data.abstractDeadline),
        submissionDeadline: new Date(data.submissionDeadline),
        cameraReadyDeadline: new Date(data.cameraReadyDeadline),
      };
      const result = await mutateAsync(formattedData);
      console.log("Success:", result); // Debug log
      toast.success("Conference creation request sent successfully!");
    } catch (err) {
      const errorMessage =
        err instanceof TRPCClientError
          ? err.message
          : "An unexpected error occurred";

      toast.error(errorMessage);
      console.error("Registration failed:", err);
    }
  };

  return (
    <div className="max-w-2xl mx-auto p-6 bg-white">
      <form className="space-y-8" onSubmit={handleSubmit(onSubmit)}>
        {/* Conference Name & Acronym */}
        <div className="space-y-4">
          <h2 className="text-lg font-medium text-[#0f172a]">
            Conference Title & Acronym
          </h2>

          <div className="space-y-2">
            <Input
              {...register("title")}
              placeholder="Title"
              className="border-[#e2e8f0] text-slate-900 placeholder:text-[#94a3b8]"
            />
            {errors.title && (
              <p className="text-sm text-red-500">{errors.title.message}</p>
            )}
            <p className="text-sm text-[#64748b]">
              Enter The conference&apos;s full name
            </p>
          </div>

          <div className="space-y-2">
            <Input
              {...register("acronym")}
              placeholder="ACR20XX"
              className="border-[#e2e8f0] text-slate-900 placeholder:text-[#94a3b8]"
            />
            {errors.acronym && (
              <p className="text-sm text-red-500">{errors.acronym.message}</p>
            )}
            <p className="text-sm text-[#64748b]">
              Acronym must contain atleast one digit
            </p>
          </div>

          {/* Description */}
          <div className="space-y-2">
            <h2 className="text-lg font-medium text-[#0f172a]">Description</h2>
            <div className="space-y-2">
              <textarea
                {...register("description")}
                placeholder="Enter conference description"
                className="w-full p-3 border border-[#e2e8f0] rounded-md text-slate-900 placeholder:text-[#94a3b8] min-h-[100px]"
              />
              {errors.description && (
                <p className="text-sm text-red-500">
                  {errors.description.message}
                </p>
              )}
            </div>
          </div>
        </div>

        {/* Conference Location */}
        <div className="space-y-4">
          <h2 className="text-lg font-medium text-[#0f172a]">
            Conference Location
          </h2>

          <div className="space-y-2">
            <Input
              {...register("locationVenue")}
              placeholder="Venue"
              className="border-[#e2e8f0] text-slate-900 placeholder:text-[#94a3b8]"
            />
            {errors.locationVenue && (
              <p className="text-sm text-red-500">
                {errors.locationVenue.message}
              </p>
            )}
          </div>

          <div className="space-y-2">
            <Input
              {...register("locationCity")}
              placeholder="City"
              className="border-[#e2e8f0] text-slate-900 placeholder:text-[#94a3b8]"
            />
            {errors.locationCity && (
              <p className="text-sm text-red-500">
                {errors.locationCity.message}
              </p>
            )}
          </div>

          <div className="space-y-2">
            <Controller
              name="locationCountry"
              control={control}
              render={({ field }) => (
                <CountrySelect
                  {...field}
                  isSubmitting={isSubmitting}
                  isPending={isPending}
                />
              )}
            />
            {errors.locationCountry && (
              <p className="text-sm text-red-500">
                {errors.locationCountry.message}
              </p>
            )}
          </div>
        </div>

        {/* Web Page */}
        <div className="space-y-4">
          <h2 className="text-lg font-medium text-[#0f172a]">Web Page</h2>
          <div className="space-y-2">
            <Input
              {...register("websiteUrl")}
              placeholder="https://www.example.com"
              className="border-[#e2e8f0] text-slate-900 placeholder:text-[#94a3b8]"
            />
            {errors.websiteUrl && (
              <p className="text-sm text-red-500">
                {errors.websiteUrl.message}
              </p>
            )}
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
                {...register("startDate")}
                type="date"
                placeholder="Start date"
                className="border-[#e2e8f0] text-slate-900 placeholder:text-[#94a3b8]"
              />
            </div>
            {errors.startDate && (
              <p className="text-sm text-red-500">{errors.startDate.message}</p>
            )}
            <p className="text-sm text-[#64748b]">
              Enter The conference&apos;s start date
            </p>
          </div>

          <div className="space-y-2">
            <div className="relative">
              <Input
                {...register("endDate")}
                type="date"
                placeholder="End date"
                className="border-[#e2e8f0] text-slate-900 placeholder:text-[#94a3b8]"
              />
            </div>
            {errors.endDate && (
              <p className="text-sm text-red-500">{errors.endDate.message}</p>
            )}
            <p className="text-sm text-[#64748b]">
              Enter The conference&apos;s end date
            </p>
          </div>

          <div className="space-y-2">
            <div className="relative">
              <Input
                {...register("abstractDeadline")}
                type="date"
                placeholder="Abstract deadline"
                className="border-[#e2e8f0] text-slate-900 placeholder:text-[#94a3b8]"
              />
            </div>
            {errors.abstractDeadline && (
              <p className="text-sm text-red-500">
                {errors.abstractDeadline.message}
              </p>
            )}
            <p className="text-sm text-[#64748b]">
              Enter The CFP Abstraction registration deadline
            </p>
          </div>

          <div className="space-y-2">
            <div className="relative">
              <Input
                {...register("submissionDeadline")}
                type="date"
                placeholder="Submission deadline"
                className="border-[#e2e8f0] text-slate-900 placeholder:text-[#94a3b8]"
              />
            </div>
            {errors.submissionDeadline && (
              <p className="text-sm text-red-500">
                {errors.submissionDeadline.message}
              </p>
            )}
            <p className="text-sm text-[#64748b]">
              Enter The CFP submission deadline
            </p>
          </div>

          <div className="space-y-2">
            <div className="relative">
              <Input
                {...register("cameraReadyDeadline")}
                type="date"
                placeholder="Camera ready deadline"
                className="border-[#e2e8f0] text-slate-900 placeholder:text-[#94a3b8]"
              />
            </div>
            {errors.cameraReadyDeadline && (
              <p className="text-sm text-red-500">
                {errors.cameraReadyDeadline.message}
              </p>
            )}
            <p className="text-sm text-[#64748b]">
              Enter The camera ready deadline
            </p>
          </div>
        </div>

        {/* Research Areas */}
        <div className="space-y-4">
          <h2 className="text-lg font-medium text-[#0f172a]">Research Areas</h2>
          <p className="text-sm text-[#64748b]">
            Enter the primary research areas of the conference, and the
            secondary areas corresponding to each primary area
          </p>

          <ResearchAreasSection
            researchAreas={researchAreas}
            setResearchAreas={setResearchAreas}
          />

          <div className="space-y-2 flex items-center gap-2">
            <Label className="text-sm font-medium text-[#0f172a] m-0">
              Make this conference public on approval?
            </Label>
            <Input
              type="checkbox"
              className="h-4 w-4"
              {...register("isPublic")}
            />
            {errors.isPublic && (
              <p className="text-sm text-red-500">{errors.isPublic.message}</p>
            )}
          </div>
        </div>

        {/* Call for Papers */}
        {/* TODO: replace with rich text editor and put in a separate page if necessary*/}
        <div className="space-y-4">
          <h2 className="text-lg font-medium text-[#0f172a]">
            Call for Papers
          </h2>
          <div className="space-y-2">
            <textarea
              {...register("callForPapers")}
              placeholder="Enter call for papers"
              className="w-full p-3 border border-[#e2e8f0] rounded-md text-slate-900 placeholder:text-[#94a3b8] min-h-[100px]"
            />
            {errors.callForPapers && (
              <p className="text-sm text-red-500">
                {errors.callForPapers.message}
              </p>
            )}
          </div>
        </div>

        {/* Submit Button */}
        <Button
          type="submit"
          disabled={isPending}
          className="w-full bg-[#1e293b] hover:bg-[#334155] text-white py-3 text-base font-medium disabled:opacity-50"
        >
          {isPending ? "Sending Request..." : "Send Creation Request"}
        </Button>
      </form>
    </div>
  );
}

const ResearchAreasSection = ({
  researchAreas,
  setResearchAreas,
}: {
  researchAreas: { [key: string]: string[] };
  setResearchAreas: React.Dispatch<
    React.SetStateAction<{ [key: string]: string[] }>
  >;
}) => {
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
        <Label className="text-sm font-medium text-[#0f172a]">
          Add new primary research area
        </Label>
        <div className="flex gap-2">
          <Input
            value={newPrimaryArea}
            onChange={(e) => setNewPrimaryArea(e.target.value)}
            placeholder="Enter primary research area"
            className="border-[#e2e8f0] text-slate-900 placeholder:text-[#94a3b8]"
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
            className="bg-[#1e293b] hover:bg-[#334155] text-white"
          >
            Add
          </Button>
        </div>
      </div>
      <div className="border-[#e2e8f0] flex flex-col gap-2 border-1 rounded-xl p-2">
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
};

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
    <div className="space-y-3 border border-[#e2e8f0] p-4 rounded-lg">
      <div className="flex items-center justify-between">
        <Label className="text-sm font-medium text-[#0f172a]">
          Primary area no. {index}
        </Label>
        <Button
          type="button"
          variant="ghost"
          size="icon"
          className="h-6 w-6 hover:bg-red-100"
          onClick={() => onRemovePrimary(primaryArea)}
        >
          <X className="h-4 w-4 text-red-500" />
        </Button>
      </div>

      <div className="bg-[#f8fafc] p-2 rounded border">
        <span className="text-sm font-medium text-[#0f172a]">
          {primaryArea}
        </span>
      </div>

      <div className="space-y-2">
        <Label className="text-sm font-medium text-[#334155] bg-[#cbd5e1] px-2 py-1 rounded">
          Secondary areas
        </Label>
        <div className="bg-[#cbd5e1] p-3 rounded-md space-y-2">
          <div className="flex flex-wrap gap-2">
            {secondaryAreas.map((secondaryArea) => (
              <div key={secondaryArea} className="flex items-center gap-1">
                <span className="bg-white px-3 py-1 rounded-full text-sm text-[#0f172a] border border-[#e2e8f0]">
                  {secondaryArea}
                </span>
                <Button
                  type="button"
                  variant="ghost"
                  size="icon"
                  className="h-6 w-6 hover:bg-[#94a3b8]"
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
              className="bg-white border-[#e2e8f0] text-slate-900 placeholder:text-[#94a3b8] text-sm"
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
              className="bg-[#64748b] hover:bg-[#475569] text-white"
            >
              <Plus className="h-4 w-4" />
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
};
