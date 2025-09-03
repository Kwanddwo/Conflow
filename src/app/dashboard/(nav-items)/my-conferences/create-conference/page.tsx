"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useForm, Controller } from "react-hook-form";
import { z } from "zod";
import { trpc } from "@/server/client";
import { TRPCClientError } from "@trpc/client";
import { zodResolver } from "@hookform/resolvers/zod";
import { toast } from "sonner";
import CountrySelect from "@/components/CountrySelect";
import ReactQuill from "react-quill-new";
import "react-quill-new/dist/quill.snow.css"; // Import Quill styles
import { useRouter } from "next/navigation";
import ResearchAreasEditor from "@/components/ResearchAreasEditor";

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

  const router = useRouter();

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

      // Convert string dates to Date objects
      const formattedData = {
        ...data,
        startDate: new Date(data.startDate),
        endDate: new Date(data.endDate),
        submissionDeadline: new Date(data.submissionDeadline),
        cameraReadyDeadline: new Date(data.cameraReadyDeadline),
      };
      const result = await mutateAsync(formattedData);
      console.log("Success:", result); // Debug log
      toast.success("Conference creation request sent successfully!");
      router.push("/dashboard/my-conferences");
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
    <div className="max-w-2xl mx-auto p-6 bg-background">
      <form className="space-y-8" onSubmit={handleSubmit(onSubmit)}>
        {/* Conference Name & Acronym */}
        <div className="space-y-4">
          <h2 className="text-lg font-medium text-foreground">
            Conference Title & Acronym
          </h2>

          <div className="space-y-2">
            <Input
              {...register("title")}
              placeholder="Title"
              className="border-border text-foreground placeholder:text-muted-foreground"
            />
            {errors.title && (
              <p className="text-sm text-destructive">{errors.title.message}</p>
            )}
            <p className="text-sm text-muted-foreground">
              Enter The conference&apos;s full name
            </p>
          </div>

          <div className="space-y-2">
            <Input
              {...register("acronym")}
              placeholder="ACR20XX"
              className="border-border text-foreground placeholder:text-muted-foreground"
            />
            {errors.acronym && (
              <p className="text-sm text-destructive">
                {errors.acronym.message}
              </p>
            )}
            <p className="text-sm text-muted-foreground">
              Acronym must contain atleast one digit
            </p>
          </div>

          {/* Description */}
          <div className="space-y-2">
            <h2 className="text-lg font-medium text-foreground">Description</h2>
            <div className="space-y-2">
              <textarea
                {...register("description")}
                placeholder="Enter conference description"
                className="w-full p-3 border border-border rounded-md text-foreground placeholder:text-muted-foreground min-h-[100px] bg-background"
              />
              {errors.description && (
                <p className="text-sm text-destructive">
                  {errors.description.message}
                </p>
              )}
            </div>
          </div>
        </div>

        {/* Conference Location */}
        <div className="space-y-4">
          <h2 className="text-lg font-medium text-foreground">
            Conference Location
          </h2>

          <div className="space-y-2">
            <Input
              {...register("locationVenue")}
              placeholder="Venue"
              className="border-border text-foreground placeholder:text-muted-foreground"
            />
            {errors.locationVenue && (
              <p className="text-sm text-destructive">
                {errors.locationVenue.message}
              </p>
            )}
          </div>

          <div className="space-y-2">
            <Input
              {...register("locationCity")}
              placeholder="City"
              className="border-border text-foreground placeholder:text-muted-foreground"
            />
            {errors.locationCity && (
              <p className="text-sm text-destructive">
                {errors.locationCity.message}
              </p>
            )}
          </div>

          <div className="space-y-2">
            <Controller
              control={control}
              name="locationCountry"
              render={({ field }) => (
                <CountrySelect
                  field={field}
                  isSubmitting={isSubmitting}
                  isPending={isPending}
                />
              )}
            />
            {errors.locationCountry && (
              <p className="text-sm text-destructive">
                {errors.locationCountry.message}
              </p>
            )}
          </div>
        </div>

        {/* Web Page */}
        <div className="space-y-4">
          <h2 className="text-lg font-medium text-foreground">Web Page</h2>
          <div className="space-y-2">
            <Input
              {...register("websiteUrl")}
              placeholder="https://www.example.com"
              className="border-border text-foreground placeholder:text-muted-foreground"
            />
            {errors.websiteUrl && (
              <p className="text-sm text-destructive">
                {errors.websiteUrl.message}
              </p>
            )}
            <p className="text-sm text-muted-foreground">
              Enter The conference&apos;s web page
            </p>
          </div>
        </div>

        {/* Dates and deadlines */}
        <div className="space-y-4">
          <h2 className="text-lg font-medium text-foreground">
            Dates and deadlines
          </h2>

          <div className="space-y-2">
            <div className="relative">
              <Input
                {...register("startDate")}
                type="date"
                placeholder="Start date"
                className="border-border text-foreground placeholder:text-muted-foreground"
              />
            </div>
            {errors.startDate && (
              <p className="text-sm text-destructive">
                {errors.startDate.message}
              </p>
            )}
            <p className="text-sm text-muted-foreground">
              Enter The conference&apos;s start date
            </p>
          </div>

          <div className="space-y-2">
            <div className="relative">
              <Input
                {...register("endDate")}
                type="date"
                placeholder="End date"
                className="border-border text-foreground placeholder:text-muted-foreground"
              />
            </div>
            {errors.endDate && (
              <p className="text-sm text-destructive">
                {errors.endDate.message}
              </p>
            )}
            <p className="text-sm text-muted-foreground">
              Enter The conference&apos;s end date
            </p>
          </div>

          <div className="space-y-2">
            <div className="relative">
              <Input
                {...register("submissionDeadline")}
                type="date"
                placeholder="Submission deadline"
                className="border-border text-foreground placeholder:text-muted-foreground"
              />
            </div>
            {errors.submissionDeadline && (
              <p className="text-sm text-destructive">
                {errors.submissionDeadline.message}
              </p>
            )}
            <p className="text-sm text-muted-foreground">
              Enter The CFP submission deadline
            </p>
          </div>

          <div className="space-y-2">
            <div className="relative">
              <Input
                {...register("cameraReadyDeadline")}
                type="date"
                placeholder="Camera ready deadline"
                className="border-border text-foreground placeholder:text-muted-foreground"
              />
            </div>
            {errors.cameraReadyDeadline && (
              <p className="text-sm text-destructive">
                {errors.cameraReadyDeadline.message}
              </p>
            )}
            <p className="text-sm text-muted-foreground">
              Enter The camera ready deadline
            </p>
          </div>
        </div>

        {/* Research Areas */}
        <div className="space-y-4">
          <h2 className="text-lg font-medium text-foreground">
            Research Areas
          </h2>
          <p className="text-sm text-muted-foreground">
            Enter the primary research areas of the conference, and the
            secondary areas corresponding to each primary area
          </p>

          <ResearchAreasEditor
            researchAreas={researchAreas}
            setResearchAreas={setResearchAreas}
          />

          <div className="space-y-2 flex items-center gap-2">
            <Label className="text-sm font-medium text-foreground m-0">
              Make this conference public on approval?
            </Label>
            <Input
              type="checkbox"
              className="h-4 w-4"
              {...register("isPublic")}
            />
            {errors.isPublic && (
              <p className="text-sm text-destructive">
                {errors.isPublic.message}
              </p>
            )}
          </div>
        </div>

        {/* Call for Papers */}
        <div className="space-y-4">
          <h2 className="text-lg font-medium text-foreground">
            Call for Papers
          </h2>
          <div className="space-y-2">
            <Controller
              control={control}
              name="callForPapers"
              defaultValue={`<h1>Call for Papers</h1>
                <br/>
                <h2>[Event Name]</h2>
                <p><strong>Date:</strong> [Month DD–DD, YYYY] &nbsp;|&nbsp; <strong>Location:</strong> [City, Country or "Virtual"]</p>
                <p><strong>Organized by:</strong> [Organization / Host Institution]</p>
              
                <br/>
                <h2>About the Event</h2>
                <p>
                  The <em>[Event Name]</em> is a [type: conference/workshop/special issue] aiming to bring together researchers, practitioners, and industry experts
                  working on [broad theme]. We welcome original contributions that advance the understanding of [primary focus area], and that
                  foster innovative approaches or interdisciplinary collaborations.
                </p>

                <br/>
                <h2>Themes &amp; Topics</h2>
                <p>We invite authors to submit papers on topics including, but not limited to:</p>
                <ul>
                  <li>Topic A (e.g., Machine Learning for Healthcare)</li>
                  <li>Topic B (e.g., Renewable Energy Systems)</li>
                  <li>Topic C (e.g., Sustainability and Policy Frameworks)</li>
                  <li>Topic D (e.g., AI Ethics and Governance)</li>
                </ul>
              
                <br/>
                <h2>Submission Guidelines</h2>
                <ul>
                  <li><strong>Abstract:</strong> Max 300 words, structured (objective, method, expected results)</li>
                  <li><strong>Full paper:</strong> [e.g., Up to 8,000 words in APA/IEEE/ACM format]</li>
                  <li><strong>Review process:</strong> Double-blind peer review</li>
                </ul>
              
                <br/>
                <h2>Important Dates</h2>
                <ul>
                  <li>Full Paper Submission Deadline: [Month DD, YYYY]</li>
                  <li>Notification of Acceptance: [Month DD, YYYY]</li>
                  <li>Camera-ready Submission: [Month DD, YYYY]</li>
                  <li>Event Dates: [Month DD–DD, YYYY]</li>
                </ul>
                
                <br/>
                <h2>Evaluation Criteria</h2>
                <p>Submissions will be reviewed based on:</p>
                <ul>
                  <li>Relevance to the themes and topics</li>
                  <li>Originality and novelty</li>
                  <li>Technical soundness and rigor</li>
                  <li>Clarity and structure of the presentation</li>
                </ul>
                
                <br/>
                <h2>Publication &amp; Presentation</h2>
                <p>
                  Accepted papers will be published in the official conference proceedings (indexed in [e.g., Scopus, EI]) and presented
                  during the event, with opportunities for full‑paper publication in a special journal or edited volume.
                </p>
                
                <br/>
                <h2>Contact</h2>
                <p>
                  For inquiries, please contact the Program Chairs:<br/>
                  <strong>Dr. A. Smith</strong> – <a href="mailto:asmith@example.com">asmith@example.com</a><br/>
                  <strong>Prof. B. Lee</strong> – <a href="mailto:blee@example.com">blee@example.com</a>
                </p>`}
              render={({ field: { onChange, onBlur, value } }) => (
                <ReactQuill
                  style={{ lineHeight: 2 }}
                  theme="snow"
                  onChange={onChange}
                  onBlur={onBlur}
                  value={value}
                />
              )}
            />

            {errors.callForPapers && (
              <p className="text-sm text-destructive">
                {errors.callForPapers.message}
              </p>
            )}
          </div>
        </div>

        {/* Submit Button */}
        <Button
          type="submit"
          disabled={isPending}
          className="w-full py-3 text-base font-medium disabled:opacity-50"
        >
          {isPending ? "Sending Request..." : "Send Creation Request"}
        </Button>
      </form>
    </div>
  );
}
