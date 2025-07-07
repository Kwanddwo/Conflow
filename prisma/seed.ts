import { PrismaClient, UserRole } from "@prisma/client";
import bcrypt from "bcryptjs";

const prisma = new PrismaClient();

async function main() {
  console.log("🌱 Starting database seeding...");

  // Get email parameters from command line arguments
  const argc = process.argv.length;
  if (argc < 3) {
    console.warn(
      "⚠️  Not enough email parameters provided. Using default emails for remaining users."
    );
  }
  const args = process.argv.slice(2);
  const adminEmail = args[0] || "kilpom245@gmail.com";
  const userEmail = args[1] || "marouanelemghari@gmail.com";

  console.log(`📧 Admin email: ${adminEmail}`);
  console.log(`📧 User email: ${userEmail}`);

  // Clear existing data (optional - remove if you want to keep existing data)
  console.log("🗑️  Clearing existing data...");
  await prisma.notification.deleteMany();
  await prisma.user.deleteMany();

  // Create users
  console.log("👤 Creating users...");

  const hashedPassword = await bcrypt.hash("Password123!", 10);

  // Admin user
  const adminUser = await prisma.user.create({
    data: {
      firstName: "Admin",
      lastName: "User",
      email: adminEmail,
      password: hashedPassword,
      affiliation: "CONFLOW Team",
      country: "us",
      role: UserRole.ADMIN,
      isVerified: true,
    },
  });

  // Regular users
  const johnUser = await prisma.user.create({
    data: {
      firstName: "John",
      lastName: "Doe",
      email: userEmail,
      password: hashedPassword,
      affiliation: "University of Technology",
      country: "us",
      role: UserRole.USER,
      isVerified: true,
    },
  });

  const janeUser = await prisma.user.create({
    data: {
      firstName: "Jane",
      lastName: "Smith",
      email: "jane@example.com",
      password: hashedPassword,
      affiliation: "Research Institute",
      country: "ca",
      role: UserRole.USER,
      isVerified: true,
    },
  });

  const bobUser = await prisma.user.create({
    data: {
      firstName: "Bob",
      lastName: "Wilson",
      email: "bob@example.com",
      password: hashedPassword,
      affiliation: "Tech Corp",
      country: "gb",
      role: UserRole.USER,
      isVerified: false, // Unverified user
    },
  });

  // Test user for development
  const testUser = await prisma.user.create({
    data: {
      firstName: "Test",
      lastName: "User",
      email: "test@conflow.com",
      password: hashedPassword,
      affiliation: "Test Organization",
      country: "us",
      role: UserRole.USER,
      isVerified: true,
    },
  });

  console.log(`✅ Created ${5} users`);

  // Create notifications
  console.log("🔔 Creating notifications...");

  const notifications = [
    // John's notifications
    {
      userId: johnUser.id,
      title: "Welcome to CONFLOW!",
      message:
        "Thank you for joining CONFLOW. Your account has been successfully created and verified.",
      isRead: false,
      isArchived: false,
      createdAt: new Date(Date.now() - 1 * 60 * 1000), // 1 minute ago
    },
    {
      userId: johnUser.id,
      title: "Conference Registration Confirmed",
      message:
        "Your registration for the Annual Technology Conference has been confirmed. Please check your email for further details.",
      isRead: true,
      isArchived: false,
      createdAt: new Date(Date.now() - 2 * 60 * 60 * 1000), // 2 hours ago
    },
    {
      userId: johnUser.id,
      title: "Paper Submission Deadline Reminder",
      message:
        "This is a reminder that the paper submission deadline is approaching in 3 days. Please ensure all required documents are uploaded.",
      isRead: false,
      isArchived: false,
      createdAt: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000), // 1 day ago
    },
    {
      userId: johnUser.id,
      title: "System Maintenance Notice",
      message:
        "CONFLOW will undergo scheduled maintenance on Sunday from 2:00 AM to 4:00 AM EST. The platform will be temporarily unavailable.",
      isRead: true,
      isArchived: true,
      createdAt: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000), // 3 days ago
    },

    // Jane's notifications
    {
      userId: janeUser.id,
      title: "New Message from Conference Organizer",
      message:
        "You have received a new message regarding your presentation schedule. Please log in to view the details.",
      isRead: false,
      isArchived: false,
      createdAt: new Date(Date.now() - 30 * 60 * 1000), // 30 minutes ago
    },
    {
      userId: janeUser.id,
      title: "Abstract Accepted",
      message:
        "Congratulations! Your abstract 'Advances in Machine Learning for Healthcare' has been accepted for presentation.",
      isRead: true,
      isArchived: false,
      createdAt: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000), // 2 days ago
    },
    {
      userId: janeUser.id,
      title: "Payment Confirmation",
      message:
        "Your conference registration fee payment has been successfully processed. Receipt #CF-2024-001234",
      isRead: true,
      isArchived: true,
      createdAt: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000), // 1 week ago
    },

    // Bob's notifications (unverified user)
    {
      userId: bobUser.id,
      title: "Please Verify Your Email",
      message:
        "To complete your registration, please verify your email address by clicking the link sent to your inbox.",
      isRead: false,
      isArchived: false,
      createdAt: new Date(Date.now() - 15 * 60 * 1000), // 15 minutes ago
    },

    // Test user notifications (for development/testing)
    {
      userId: testUser.id,
      title: "Test Notification - Unread",
      message: "This is an unread test notification for development purposes.",
      isRead: false,
      isArchived: false,
      createdAt: new Date(Date.now() - 5 * 60 * 1000), // 5 minutes ago
    },
    {
      userId: testUser.id,
      title: "Test Notification - Read",
      message: "This is a read test notification for development purposes.",
      isRead: true,
      isArchived: false,
      createdAt: new Date(Date.now() - 1 * 60 * 60 * 1000), // 1 hour ago
    },
    {
      userId: testUser.id,
      title: "Test Notification - Archived",
      message:
        "This is an archived test notification for development purposes.",
      isRead: true,
      isArchived: true,
      createdAt: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000), // 5 days ago
    },
    {
      userId: testUser.id,
      title: "Long Title Test Notification That Should Wrap Properly",
      message:
        "This is a test notification with a very long message to test how the UI handles longer content. Lorem ipsum dolor sit amet, consectetur adipiscing elit. Sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris.",
      isRead: false,
      isArchived: false,
      createdAt: new Date(Date.now() - 6 * 60 * 60 * 1000), // 6 hours ago
    },

    // Admin notifications
    {
      userId: adminUser.id,
      title: "Daily System Report",
      message:
        "System status: All services operational. 145 active users, 23 new registrations today.",
      isRead: false,
      isArchived: false,
      createdAt: new Date(Date.now() - 10 * 60 * 1000), // 10 minutes ago
    },
    {
      userId: adminUser.id,
      title: "Security Alert",
      message:
        "Multiple failed login attempts detected from IP 192.168.1.100. Please review security logs.",
      isRead: true,
      isArchived: false,
      createdAt: new Date(Date.now() - 4 * 60 * 60 * 1000), // 4 hours ago
    },
  ];

  // Create all notifications
  for (const notification of notifications) {
    await prisma.notification.create({
      data: notification,
    });
  }

  console.log(`✅ Created ${notifications.length} notifications`);

  // Summary
  console.log("\n📊 Seeding Summary:");
  console.log("==================");

  const userCount = await prisma.user.count();
  const notificationCount = await prisma.notification.count();
  const unreadCount = await prisma.notification.count({
    where: { isRead: false, isDeleted: false },
  });
  const archivedCount = await prisma.notification.count({
    where: { isArchived: true, isDeleted: false },
  });

  console.log(`👤 Total Users: ${userCount}`);
  console.log(`🔔 Total Notifications: ${notificationCount}`);
  console.log(`📬 Unread Notifications: ${unreadCount}`);
  console.log(`📦 Archived Notifications: ${archivedCount}`);

  console.log("\n🔑 Test Accounts:");
  console.log("=================");
  console.log(`Admin: ${adminEmail} / Password123!`);
  console.log(`User 1: ${userEmail} / Password123!`);
  console.log("User 2: jane@example.com / Password123!");
  console.log("User 3: bob@example.com / Password123! (unverified)");
  console.log("Test: test@conflow.com / Password123!");

  console.log("\n🌱 Database seeding completed successfully!");
}

main()
  .catch((e) => {
    console.error("❌ Error during seeding:");
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
