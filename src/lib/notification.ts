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

export async function sendNotificationToChairs(
  conferenceId: string,
  title: string,
  message: string
): Promise<Notification[]> {
  try {
    const conference = await prisma.conference.findUnique({
      where: { id: conferenceId },
      include: {
        conferenceRoles: {
          where: {
            role: { in: ["MAIN_CHAIR", "CHAIR"] },
          },
          select: {
            role: true,
            user: {
              select: {
                id: true,
                email: true,
              },
            },
          },
        },
      },
    });

    if (!conference) {
      throw new Error("Conference not found");
    }

    const notifications: Notification[] = [];

    // Send to all chairs
    for (const chair of conference.conferenceRoles) {
      const notification = await sendNotification(
        { id: chair.user.id, email: chair.user.email },
        title,
        message
      );
      notifications.push(notification);
    }

    return notifications;
  } catch (error) {
    console.error("Failed to send notifications to chairs:", error);
    throw new Error("Failed to send notifications to chairs");
  }
}
export async function sendInviteNotification(
  user: { id: string; email: string },
  title: string,
  message: string,
  conferenceId?: string,
  role?: string
): Promise<Notification> {
  try {
    // Create invitation data structure to embed in the message
    const invitationData = {
      type: "INVITATION",
      originalMessage: message,
      conferenceId,
      role,
      status: "PENDING",
    };

    // Store as JSON string in message field
    const notification = await prisma.notification.create({
      data: {
        userId: user.id,
        message: JSON.stringify(invitationData),
        title,
      },
    });

    // Simple email with just a link to inbox
    await sendMail(
      user.email,
      title,
      `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
          <h1><strong>CONFLOW: </strong>You have a new invitation</h1>
          <p><strong>${title}</strong></p>
          <p>${message}</p>
          <p>Please check your dashboard inbox to respond to this invitation.</p>
          <a href="${FRONTEND_URL}/dashboard/inbox" target="_blank" rel="noopener noreferrer">
            <button style="background-color: #2563eb; color: white; padding: 12px 24px; border: none; border-radius: 6px; cursor: pointer;">
              Check Your Inbox
            </button>
          </a>
        </div>
      `
    );

    return notification;
  } catch (error) {
    console.error("Failed to send notification:", error);
    throw new Error("Failed to create notification");
  }
}
