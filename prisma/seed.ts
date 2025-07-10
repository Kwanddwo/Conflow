import { PrismaClient, UserRole, ConferenceStatus } from "@prisma/client";
import bcrypt from "bcryptjs";

const prisma = new PrismaClient();

//usage: `npm run db:seed <adminEmail> <userEmail>`

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
  await prisma.conference.deleteMany();
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

  // Additional users for conference relationships
  const aliceUser = await prisma.user.create({
    data: {
      firstName: "Alice",
      lastName: "Johnson",
      email: "alice@university.edu",
      password: hashedPassword,
      affiliation: "State University",
      country: "us",
      role: UserRole.USER,
      isVerified: true,
    },
  });

  const charlieUser = await prisma.user.create({
    data: {
      firstName: "Charlie",
      lastName: "Brown",
      email: "charlie@research.org",
      password: hashedPassword,
      affiliation: "Research Organization",
      country: "uk",
      role: UserRole.USER,
      isVerified: true,
    },
  });

  console.log(`✅ Created ${7} users`);

  // Create conferences
  console.log("🏛️ Creating conferences...");

  const conference1 = await prisma.conference.create({
    data: {
      title: "International Conference on Artificial Intelligence 2024",
      acronym: "ICAI2024",
      description:
        "The premier conference for artificial intelligence research and applications. Join leading researchers, practitioners, and industry experts to explore the latest advances in AI technology, machine learning, and deep learning.",
      locationVenue: "Grand Convention Center",
      locationCity: "San Francisco",
      locationCountry: "United States",
      callForPapers:
        "We invite submissions on all aspects of artificial intelligence including but not limited to: Machine Learning, Deep Learning, Natural Language Processing, Computer Vision, Robotics, and AI Ethics.",
      websiteUrl: "https://icai2024.conference.org",
      startDate: new Date("2024-09-15"),
      endDate: new Date("2024-09-18"),
      abstractDeadline: new Date("2024-06-01"),
      submissionDeadline: new Date("2024-06-15"),
      cameraReadyDeadline: new Date("2024-07-30"),
      status: ConferenceStatus.APPROVED,
      isPublic: true,
      researchAreas: {
        "Machine Learning": [
          "Deep Learning",
          "Reinforcement Learning",
          "Supervised Learning",
          "Unsupervised Learning",
        ],
        "Natural Language Processing": [
          "Text Mining",
          "Language Models",
          "Machine Translation",
          "Sentiment Analysis",
        ],
        "Computer Vision": [
          "Image Recognition",
          "Object Detection",
          "Medical Imaging",
          "Video Analysis",
        ],
        "AI Ethics": [
          "Algorithmic Bias",
          "Explainable AI",
          "Privacy Protection",
          "Fairness in AI",
        ],
      },
      mainChairId: johnUser.id,
      chairs: {
        connect: [{ id: janeUser.id }, { id: aliceUser.id }],
      },
      reviewers: {
        connect: [
          { id: bobUser.id },
          { id: charlieUser.id },
          { id: testUser.id },
        ],
      },
    },
  });

  const conference2 = await prisma.conference.create({
    data: {
      title: "Cybersecurity and Data Privacy Summit 2024",
      acronym: "CDPS2024",
      description:
        "A comprehensive summit focusing on cybersecurity threats, data privacy regulations, and cutting-edge security technologies. Network with security professionals and learn about the latest defense strategies.",
      locationVenue: "Tech Innovation Hub",
      locationCity: "Toronto",
      locationCountry: "Canada",
      callForPapers:
        "Submit your research on cybersecurity, data privacy, cryptography, network security, incident response, and emerging security technologies.",
      websiteUrl: "https://cdps2024.securityconf.ca",
      startDate: new Date("2024-11-10"),
      endDate: new Date("2024-11-12"),
      abstractDeadline: new Date("2024-07-15"),
      submissionDeadline: new Date("2024-08-01"),
      cameraReadyDeadline: new Date("2024-09-15"),
      status: ConferenceStatus.APPROVED,
      isPublic: true,
      researchAreas: {
        Cybersecurity: [
          "Malware Analysis",
          "Penetration Testing",
          "Threat Intelligence",
          "Security Architecture",
        ],
        "Data Privacy": [
          "GDPR Compliance",
          "Privacy by Design",
          "Data Anonymization",
          "Consent Management",
        ],
        Cryptography: [
          "Blockchain Security",
          "Quantum Cryptography",
          "Hash Functions",
          "Digital Signatures",
        ],
        "Network Security": [
          "Intrusion Detection",
          "Firewall Technologies",
          "VPN Security",
          "Wireless Security",
        ],
      },
      mainChairId: janeUser.id,
      chairs: {
        connect: [{ id: johnUser.id }, { id: charlieUser.id }],
      },
      reviewers: {
        connect: [
          { id: aliceUser.id },
          { id: bobUser.id },
          { id: testUser.id },
        ],
      },
    },
  });

  const conference3 = await prisma.conference.create({
    data: {
      title: "Future of Healthcare Technology Conference",
      acronym: "FHTC2025",
      description:
        "Exploring innovations in healthcare technology, telemedicine, medical AI, and digital health solutions. Connect with healthcare professionals and technology innovators.",
      locationVenue: "Medical Research Institute",
      locationCity: "London",
      locationCountry: "United Kingdom",
      callForPapers:
        "We welcome papers on healthcare informatics, medical AI, telemedicine, digital health, biomedical engineering, and health data analytics.",
      websiteUrl: "https://fhtc2025.healthtech.uk",
      startDate: new Date("2025-03-20"),
      endDate: new Date("2025-03-23"),
      abstractDeadline: new Date("2024-12-01"),
      submissionDeadline: new Date("2024-12-15"),
      cameraReadyDeadline: new Date("2025-02-01"),
      status: ConferenceStatus.PENDING,
      isPublic: false,
      researchAreas: {
        "Healthcare Informatics": [
          "Electronic Health Records",
          "Health Information Systems",
          "Clinical Decision Support",
          "Healthcare Data Standards",
        ],
        "Medical AI": [
          "Diagnostic AI",
          "Drug Discovery",
          "Predictive Analytics",
          "Medical Image Analysis",
        ],
        Telemedicine: [
          "Remote Patient Monitoring",
          "Virtual Consultations",
          "Mobile Health Apps",
          "Telehealth Infrastructure",
        ],
        "Digital Health": [
          "Wearable Technology",
          "Health Sensors",
          "Patient Engagement",
          "Digital Therapeutics",
        ],
      },
      mainChairId: aliceUser.id,
      chairs: {
        connect: [{ id: charlieUser.id }, { id: janeUser.id }],
      },
      reviewers: {
        connect: [{ id: johnUser.id }, { id: bobUser.id }],
      },
    },
  });

  const conference4 = await prisma.conference.create({
    data: {
      title: "Quantum Computing and Physics Symposium",
      acronym: "QCPS2024",
      description:
        "A specialized symposium on quantum computing, quantum physics, and quantum information theory. Limited to 100 participants for intimate discussions.",
      locationVenue: "Quantum Research Laboratory",
      locationCity: "Boston",
      locationCountry: "United States",
      callForPapers:
        "Submit theoretical and experimental work in quantum computing, quantum algorithms, quantum cryptography, and quantum information processing.",
      startDate: new Date("2024-12-05"),
      endDate: new Date("2024-12-07"),
      abstractDeadline: new Date("2024-08-15"),
      submissionDeadline: new Date("2024-09-01"),
      cameraReadyDeadline: new Date("2024-10-15"),
      status: ConferenceStatus.REJECTED,
      isPublic: false,
      researchAreas: {
        "Quantum Computing": [
          "Quantum Gates",
          "Quantum Circuits",
          "Quantum Supremacy",
          "Quantum Hardware",
        ],
        "Quantum Algorithms": [
          "Shor's Algorithm",
          "Grover's Algorithm",
          "Quantum Optimization",
          "Variational Quantum Algorithms",
        ],
        "Quantum Information": [
          "Quantum Entanglement",
          "Quantum Teleportation",
          "Quantum Communication",
          "Quantum State Estimation",
        ],
        "Quantum Physics": [
          "Quantum Mechanics",
          "Quantum Field Theory",
          "Quantum Optics",
          "Quantum Many-Body Systems",
        ],
      },
      mainChairId: charlieUser.id,
      chairs: {
        connect: [{ id: testUser.id }],
      },
      reviewers: {
        connect: [{ id: aliceUser.id }, { id: johnUser.id }],
      },
    },
  });

  const conference5 = await prisma.conference.create({
    data: {
      title: "Sustainable Technology and Green Computing Conference",
      acronym: "STGC2024",
      description:
        "Focus on sustainable technology solutions, green computing practices, renewable energy systems, and environmental impact of technology.",
      locationVenue: "Eco-Tech Convention Center",
      locationCity: "Copenhagen",
      locationCountry: "Denmark",
      callForPapers:
        "Papers are invited on sustainable computing, green data centers, renewable energy, environmental monitoring systems, and sustainable software engineering.",
      websiteUrl: "https://stgc2024.greentech.dk",
      startDate: new Date("2024-10-08"),
      endDate: new Date("2024-10-10"),
      abstractDeadline: new Date("2024-06-20"),
      submissionDeadline: new Date("2024-07-05"),
      cameraReadyDeadline: new Date("2024-08-20"),
      status: ConferenceStatus.COMPLETED,
      isPublic: true,
      researchAreas: {
        "Sustainable Computing": [
          "Energy-Efficient Algorithms",
          "Green Software Engineering",
          "Carbon-Aware Computing",
          "Sustainable IT Practices",
        ],
        "Green Data Centers": [
          "Energy Management",
          "Cooling Technologies",
          "Renewable Energy Integration",
          "Power Usage Effectiveness",
        ],
        "Renewable Energy": [
          "Solar Power Systems",
          "Wind Energy Technology",
          "Energy Storage Solutions",
          "Smart Grid Integration",
        ],
        "Environmental Monitoring": [
          "IoT Environmental Sensors",
          "Climate Change Modeling",
          "Air Quality Monitoring",
          "Biodiversity Tracking",
        ],
      },
      mainChairId: testUser.id,
      chairs: {
        connect: [{ id: aliceUser.id }],
      },
      reviewers: {
        connect: [{ id: janeUser.id }, { id: charlieUser.id }],
      },
    },
  });

  console.log(`✅ Created ${5} conferences`);

  // Create notifications (existing + conference-related)
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
      title: "You've been assigned as Main Chair",
      message: `Congratulations! You have been assigned as the Main Chair for "${conference1.title}". Please review the conference details and begin coordinating with your team.`,
      isRead: false,
      isArchived: false,
      createdAt: new Date(Date.now() - 3 * 60 * 60 * 1000), // 3 hours ago
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
      title: "Conference Chair Assignment",
      message: `You have been assigned as a Chair for "${conference1.title}". Please coordinate with the Main Chair and other committee members.`,
      isRead: true,
      isArchived: false,
      createdAt: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000), // 2 days ago
    },
    {
      userId: janeUser.id,
      title: "Main Chair Appointment - CDPS2024",
      message: `You have been appointed as Main Chair for "${conference2.title}". Conference management tools are now available in your dashboard.`,
      isRead: false,
      isArchived: false,
      createdAt: new Date(Date.now() - 5 * 60 * 60 * 1000), // 5 hours ago
    },

    // Alice's notifications
    {
      userId: aliceUser.id,
      title: "Reviewer Assignment Confirmation",
      message: `You have been assigned as a reviewer for "${conference1.title}". Review assignments will be available soon.`,
      isRead: false,
      isArchived: false,
      createdAt: new Date(Date.now() - 4 * 60 * 60 * 1000), // 4 hours ago
    },
    {
      userId: aliceUser.id,
      title: "Conference Proposal Approved",
      message: `Great news! Your conference proposal "${conference3.title}" has been approved and is now live on the platform.`,
      isRead: true,
      isArchived: false,
      createdAt: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000), // 1 day ago
    },

    // Charlie's notifications
    {
      userId: charlieUser.id,
      title: "Conference Proposal Status Update",
      message: `Unfortunately, your conference proposal "${conference4.title}" has been rejected. Please see the detailed feedback in your dashboard.`,
      isRead: false,
      isArchived: false,
      createdAt: new Date(Date.now() - 6 * 60 * 60 * 1000), // 6 hours ago
    },
    {
      userId: charlieUser.id,
      title: "Chair Role Assignment",
      message: `You have been assigned as a Chair for "${conference2.title}". Please review the conference timeline and responsibilities.`,
      isRead: true,
      isArchived: false,
      createdAt: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000), // 2 days ago
    },

    // Test user notifications
    {
      userId: testUser.id,
      title: "Conference Successfully Completed",
      message: `The "${conference5.title}" has been marked as completed. Thank you for your excellent work as Main Chair!`,
      isRead: false,
      isArchived: false,
      createdAt: new Date(Date.now() - 1 * 60 * 60 * 1000), // 1 hour ago
    },
    {
      userId: testUser.id,
      title: "Reviewer Performance Report",
      message:
        "Your reviewer performance report for Q3 2024 is now available. You have completed 15 reviews with an average rating of 4.8/5.",
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
    {
      userId: bobUser.id,
      title: "Reviewer Invitation Pending Verification",
      message:
        "You have been invited to review for multiple conferences. Please verify your email address to access your reviewer dashboard.",
      isRead: false,
      isArchived: false,
      createdAt: new Date(Date.now() - 8 * 60 * 60 * 1000), // 8 hours ago
    },

    // Admin notifications
    {
      userId: adminUser.id,
      title: "Daily System Report",
      message:
        "System status: All services operational. 145 active users, 23 new registrations today. 5 conferences pending approval.",
      isRead: false,
      isArchived: false,
      createdAt: new Date(Date.now() - 10 * 60 * 1000), // 10 minutes ago
    },
    {
      userId: adminUser.id,
      title: "Conference Approval Required",
      message: `New conference proposal "${conference3.title}" requires admin approval. Please review the submission details.`,
      isRead: true,
      isArchived: false,
      createdAt: new Date(Date.now() - 4 * 60 * 60 * 1000), // 4 hours ago
    },
    {
      userId: adminUser.id,
      title: "Security Alert",
      message:
        "Multiple failed login attempts detected from IP 192.168.1.100. Please review security logs.",
      isRead: true,
      isArchived: true,
      createdAt: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000), // 2 days ago
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
  const conferenceCount = await prisma.conference.count();
  const notificationCount = await prisma.notification.count();
  const unreadCount = await prisma.notification.count({
    where: { isRead: false, isDeleted: false },
  });
  const archivedCount = await prisma.notification.count({
    where: { isArchived: true, isDeleted: false },
  });

  // Conference stats by status
  const approvedConferences = await prisma.conference.count({
    where: { status: ConferenceStatus.APPROVED },
  });
  const pendingConferences = await prisma.conference.count({
    where: { status: ConferenceStatus.PENDING },
  });
  const rejectedConferences = await prisma.conference.count({
    where: { status: ConferenceStatus.REJECTED },
  });
  const completedConferences = await prisma.conference.count({
    where: { status: ConferenceStatus.COMPLETED },
  });

  console.log(`👤 Total Users: ${userCount}`);
  console.log(`🏛️ Total Conferences: ${conferenceCount}`);
  console.log(`  ✅ Approved: ${approvedConferences}`);
  console.log(`  ⏳ Pending: ${pendingConferences}`);
  console.log(`  ❌ Rejected: ${rejectedConferences}`);
  console.log(`  🏁 Completed: ${completedConferences}`);
  console.log(`🔔 Total Notifications: ${notificationCount}`);
  console.log(`📬 Unread Notifications: ${unreadCount}`);
  console.log(`📦 Archived Notifications: ${archivedCount}`);

  console.log("\n🔑 Test Accounts:");
  console.log("=================");
  console.log(`Admin: ${adminEmail} / Password123!`);
  console.log(`User 1: ${userEmail} / Password123! (Main Chair ICAI2024)`);
  console.log("User 2: jane@example.com / Password123! (Main Chair CDPS2024)");
  console.log("User 3: bob@example.com / Password123! (unverified)");
  console.log(
    "User 4: alice@university.edu / Password123! (Main Chair FHTC2025)"
  );
  console.log(
    "User 5: charlie@research.org / Password123! (Main Chair QCPS2024 - rejected)"
  );
  console.log(
    "Test: test@conflow.com / Password123! (Main Chair STGC2024 - completed)"
  );

  console.log("\n🏛️ Conference Examples:");
  console.log("=======================");
  console.log(
    "✅ ICAI2024 - International Conference on AI (Approved, Public)"
  );
  console.log("✅ CDPS2024 - Cybersecurity Summit (Approved, Public)");
  console.log("⏳ FHTC2025 - Healthcare Technology (Pending, Private)");
  console.log("❌ QCPS2024 - Quantum Computing (Rejected, Private)");
  console.log("🏁 STGC2024 - Sustainable Technology (Completed, Public)");

  console.log("\n🌱 Database seeding completed successfully!");
  if (argc < 3) {
    console.warn(
      "⚠️  Not enough email parameters provided. Used default emails for remaining users."
    );
  }
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