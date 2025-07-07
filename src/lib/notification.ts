import { prisma } from "./prisma";
import { Notification } from "@prisma/client";
import { sendMail } from "./mail";

const FRONTEND_URL = process.env.NEXT_PUBLIC_APP_URL;

export async function sendNotification(
  user: { id: string; email: string },
  title: string,
  message: string
): Promise<Notification> {
  try {
    const notification = await prisma.notification.create({
      data: {
        userId: user.id,
        message,
        title,
      },
    });

    await sendMail(
      user.email,
      title,
      `
          <h1><strong>CONFLOW: </strong>You have a new alert</h1>
          <p><strong>${title}</strong></p>
          <p>${message}</p>
          <a href="${FRONTEND_URL}/dashboard/inbox" target="_blank" rel="noopener noreferrer">
            <button>Check your inbox</button>
          </a>
        `
    );

    return notification;
  } catch (error) {
    console.error("Failed to send notification:", error);
    throw new Error("Failed to create notification");
  }
}
