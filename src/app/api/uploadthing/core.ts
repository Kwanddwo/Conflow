import { createUploadthing, type FileRouter } from "uploadthing/server";
import { UTApi } from "uploadthing/server";

const f = createUploadthing();

export const uploadRouter = {
  mediaUploader: f({
    // image: { maxFileSize: "4MB" },
    pdf: { maxFileSize: "16MB" },
  }).onUploadComplete(async ({ metadata, file }) => {
    console.log("Upload complete:", file);
  }),
} satisfies FileRouter;

export type OurFileRouter = typeof uploadRouter;

export const utapi = new UTApi();
