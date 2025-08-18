import { sendNotification } from "@/lib/notification";
import { PrismaClient } from "@prisma/client";
const prisma = new PrismaClient();

async function runTask() {
  const today = new Date();

  // Add check to prevent running multiple times on same data
  const acceptDecisions = await prisma.decision.findMany({
    include: {
      submission: {
        include: {
          conference: true,
        },
      },
      assignment: {
        select: {
          chairReviewer: {
            select: {
              user: {
                select: { id: true, email: true }, // Only select needed fields
              },
            },
          },
        },
      },
    },
    where: {
      reviewDecision: "ACCEPT",
      submission: {
        conference: {
          submissionDeadline: {
            lte: today,
          },
          // Add this to prevent processing already processed conferences
          status: { not: "CAMERA_READY_PHASE" },
        },
      },
    },
  });

  if (acceptDecisions.length === 0) {
    console.log("No decisions to process");
    return;
  }

  console.log(`Processing ${acceptDecisions.length} accepted decisions`);

  // Use transaction for data consistency
  await prisma.$transaction(async (tx) => {
    // Batch delete decisions
    const decisionIds = acceptDecisions.map((dec) => dec.id);
    await tx.decision.deleteMany({
      where: { id: { in: decisionIds } },
    });

    // Update conference status to prevent reprocessing
    const conferenceIds = [
      ...new Set(acceptDecisions.map((dec) => dec.submission.conference.id)),
    ];
    await tx.conference.updateMany({
      where: { id: { in: conferenceIds } },
      data: { status: "CAMERA_READY_PHASE" },
    });
  });

  // Send notifications outside transaction (non-critical operation)
  const notifications = acceptDecisions
    .filter((dec) => dec.assignment.chairReviewer)
    .map((dec) => ({
      user: dec.assignment.chairReviewer!.user,
      title: "New Camera-Ready Assignment",
      message: `You have been assigned camera-ready review for the paper "${dec.submission.title}" (${dec.submission.id}) in ${dec.submission.conference.title} (${dec.submission.conference.acronym})`,
      decisionId: dec.id,
    }));

  // Send notifications in parallel but with concurrency limit
  const BATCH_SIZE = 5;
  for (let i = 0; i < notifications.length; i += BATCH_SIZE) {
    const batch = notifications.slice(i, i + BATCH_SIZE);
    await Promise.all(
      batch.map((notif) =>
        sendNotification(notif.user, notif.title, notif.message).catch((err) =>
          console.error(
            `Failed to send notification for decision ${notif.decisionId}:`,
            err
          )
        )
      )
    );
  }

  console.log(
    `Successfully processed ${acceptDecisions.length} decisions and sent ${notifications.length} notifications`
  );
}

runTask()
  .catch((error) => {
    console.error("Script failed:", error);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());
