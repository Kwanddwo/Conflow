import {
  PrismaClient,
  UserRole,
  ConferenceStatus,
  RecStatus,
  DecStatus,
} from "@prisma/client";
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
  await prisma.decision.deleteMany();
  await prisma.decisionAssignment.deleteMany();
  await prisma.review.deleteMany();
  await prisma.reviewAssignment.deleteMany();
  await prisma.notification.deleteMany();
  await prisma.submissionAuthor.deleteMany();
  await prisma.submission.deleteMany();
  await prisma.conferenceRoleEntries.deleteMany();
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
      isVerified: true,
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
      callForPapers: `
        <h2>Call for Papers</h2>
        <p>We invite submissions on all aspects of artificial intelligence including but not limited to:</p>
        <ul>
          <li><strong>Machine Learning:</strong> Deep Learning, Reinforcement Learning, Transfer Learning</li>
          <li><strong>Natural Language Processing:</strong> Language Models, Machine Translation, Text Mining</li>
          <li><strong>Computer Vision:</strong> Image Recognition, Object Detection, Medical Imaging</li>
          <li><strong>Robotics:</strong> Autonomous Systems, Human-Robot Interaction, Robot Learning</li>
          <li><strong>AI Ethics:</strong> Algorithmic Bias, Explainable AI, Privacy Protection</li>
        </ul>
        <h3>Submission Guidelines</h3>
        <p>All submissions must be original work and not previously published. Papers should be formatted according to the conference template and not exceed 8 pages including references.</p>
        <p><em>Submission deadline: June 15, 2024</em></p>
      `,
      websiteUrl: "https://icai2024.conference.org",
      startDate: new Date("2024-09-15"),
      endDate: new Date("2024-09-18"),
      abstractDeadline: new Date("2024-06-01"),
      submissionDeadline: new Date("2024-06-15"),
      // Set camera ready deadline in the past to enable payment tracking
      cameraReadyDeadline: new Date("2024-07-30"),
      status: ConferenceStatus.CAMERA_READY_PHASE, // Updated for payment tracking
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
      callForPapers: `
        <h2>Call for Papers</h2>
        <p>Submit your research on the following topics:</p>
        <h3>Core Areas</h3>
        <ul>
          <li><strong>Cybersecurity:</strong> Malware Analysis, Penetration Testing, Threat Intelligence</li>
          <li><strong>Data Privacy:</strong> GDPR Compliance, Privacy by Design, Data Anonymization</li>
          <li><strong>Cryptography:</strong> Blockchain Security, Quantum Cryptography, Digital Signatures</li>
          <li><strong>Network Security:</strong> Intrusion Detection, Firewall Technologies, VPN Security</li>
        </ul>
        <h3>Special Focus</h3>
        <p>This year we particularly encourage submissions on:</p>
        <ul>
          <li>AI-powered security solutions</li>
          <li>Zero-trust architecture implementations</li>
          <li>Privacy-preserving technologies</li>
        </ul>
        <p><strong>Important:</strong> All submissions will undergo double-blind peer review.</p>
      `,
      websiteUrl: "https://cdps2024.securityconf.ca",
      startDate: new Date("2024-11-10"),
      endDate: new Date("2024-11-12"),
      abstractDeadline: new Date("2024-07-15"),
      submissionDeadline: new Date("2024-08-01"),
      // Set camera ready deadline in the past to enable payment tracking
      cameraReadyDeadline: new Date("2024-09-15"),
      status: ConferenceStatus.CAMERA_READY_PHASE, // Updated for payment tracking
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
      callForPapers: `
        <h2>Call for Papers</h2>
        <p>We welcome papers on healthcare technology innovations and their practical applications:</p>
        <h3>Research Areas</h3>
        <ol>
          <li><strong>Healthcare Informatics</strong>
            <ul>
              <li>Electronic Health Records</li>
              <li>Health Information Systems</li>
              <li>Clinical Decision Support</li>
            </ul>
          </li>
          <li><strong>Medical AI</strong>
            <ul>
              <li>Diagnostic AI</li>
              <li>Drug Discovery</li>
              <li>Predictive Analytics</li>
            </ul>
          </li>
          <li><strong>Telemedicine & Digital Health</strong>
            <ul>
              <li>Remote Patient Monitoring</li>
              <li>Virtual Consultations</li>
              <li>Wearable Technology</li>
            </ul>
          </li>
        </ol>
        <h3>Submission Requirements</h3>
        <p>Papers must demonstrate <em>practical healthcare applications</em> and include validation with real-world data where possible.</p>
        <p class="highlight">⚠️ Note: This conference is invitation-only until further notice.</p>
      `,
      websiteUrl: "https://fhtc2025.healthtech.uk",
      startDate: new Date("2025-03-20"),
      endDate: new Date("2025-03-23"),
      abstractDeadline: new Date("2024-12-01"),
      submissionDeadline: new Date("2024-12-15"),
      cameraReadyDeadline: new Date("2025-02-01"),
      status: ConferenceStatus.PENDING,
      isPublic: true,
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
      callForPapers: `
        <h2>Call for Papers</h2>
        <p>Submit theoretical and experimental work in quantum sciences:</p>
        <h3>Theoretical Contributions</h3>
        <ul>
          <li><strong>Quantum Algorithms:</strong> Shor's Algorithm, Grover's Algorithm, Variational Quantum Algorithms</li>
          <li><strong>Quantum Information:</strong> Entanglement, Quantum Communication, State Estimation</li>
          <li><strong>Quantum Physics:</strong> Quantum Mechanics, Field Theory, Many-Body Systems</li>
        </ul>
        <h3>Experimental Work</h3>
        <ul>
          <li><strong>Quantum Computing:</strong> Hardware implementations, Gate fidelity, Error correction</li>
          <li><strong>Quantum Optics:</strong> Photonic quantum systems, Quantum sensing</li>
        </ul>
        <div style="background-color: #f0f0f0; padding: 10px; border-left: 4px solid #007acc;">
          <p><strong>Note:</strong> This symposium is limited to 100 participants to encourage in-depth discussions and networking.</p>
        </div>
        <p><small>Paper length: 4-6 pages maximum</small></p>
      `,
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
      callForPapers: `
        <h2>Call for Papers</h2>
        <p>Papers are invited on sustainable technology solutions and environmental computing:</p>
        <h3>🌱 Primary Tracks</h3>
        <table border="1" style="border-collapse: collapse; width: 100%;">
          <tr>
            <td><strong>Sustainable Computing</strong></td>
            <td>Energy-Efficient Algorithms, Green Software Engineering, Carbon-Aware Computing</td>
          </tr>
          <tr>
            <td><strong>Green Data Centers</strong></td>
            <td>Energy Management, Cooling Technologies, Renewable Energy Integration</td>
          </tr>
          <tr>
            <td><strong>Renewable Energy</strong></td>
            <td>Solar Power Systems, Wind Energy Technology, Smart Grid Integration</td>
          </tr>
          <tr>
            <td><strong>Environmental Monitoring</strong></td>
            <td>IoT Environmental Sensors, Climate Change Modeling, Biodiversity Tracking</td>
          </tr>
        </table>
        <h3>🎯 Special Sessions</h3>
        <ul>
          <li><em>Industry best practices</em> for sustainable computing</li>
          <li><em>Policy and regulation</em> in green technology</li>
          <li><em>Emerging technologies</em> for environmental protection</li>
        </ul>
        <p><strong style="color: green;">Sustainability Impact Statement Required:</strong> All submissions must include a brief statement on the environmental impact and sustainability benefits of the proposed work.</p>
      `,
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
    },
  });

  const conference6 = await prisma.conference.create({
    data: {
      title: "International Symposium on Software Engineering and Innovation",
      acronym: "ISSEI2025",
      description:
        "A leading symposium bringing together software engineers, researchers, and industry professionals to discuss the latest innovations in software development, DevOps, cloud computing, and emerging technologies.",
      locationVenue: "Silicon Valley Convention Center",
      locationCity: "San Jose",
      locationCountry: "United States",
      callForPapers: `
        <h2>Call for Papers</h2>
        <p>We invite high-quality research papers on all aspects of software engineering and innovation:</p>
        <h3>Technical Tracks</h3>
        <ul>
          <li><strong>Software Architecture:</strong> Microservices, Distributed Systems, Design Patterns</li>
          <li><strong>DevOps & CI/CD:</strong> Automation, Testing, Deployment Strategies</li>
          <li><strong>Cloud Computing:</strong> Serverless Architecture, Container Orchestration, Multi-cloud</li>
          <li><strong>Software Quality:</strong> Testing Methodologies, Code Quality, Performance Optimization</li>
          <li><strong>Emerging Technologies:</strong> AI/ML in Software Engineering, Blockchain, IoT</li>
        </ul>
        <h3>Industry Track</h3>
        <p>We also welcome industry papers showcasing:</p>
        <ul>
          <li>Real-world case studies and lessons learned</li>
          <li>Innovative tools and frameworks</li>
          <li>Best practices in software development</li>
        </ul>
        <h3>Submission Guidelines</h3>
        <p>Papers should be 6-8 pages for full papers, 2-4 pages for short papers. All submissions undergo rigorous peer review.</p>
        <p><strong>Important:</strong> Authors must disclose any potential conflicts of interest.</p>
      `,
      websiteUrl: "https://issei2025.softwareconf.org",
      startDate: new Date("2025-11-25"),
      endDate: new Date("2025-11-27"),
      abstractDeadline: new Date("2025-08-10"),
      submissionDeadline: new Date("2025-08-25"),
      cameraReadyDeadline: new Date("2025-10-10"),
      status: ConferenceStatus.APPROVED,
      isPublic: true,
      researchAreas: {
        "Software Architecture": [
          "Microservices",
          "Distributed Systems",
          "Design Patterns",
          "System Integration",
        ],
        "DevOps & CI/CD": [
          "Automation",
          "Testing Strategies",
          "Deployment Pipelines",
          "Infrastructure as Code",
        ],
        "Cloud Computing": [
          "Serverless Architecture",
          "Container Orchestration",
          "Multi-cloud Strategies",
          "Cloud Security",
        ],
        "Software Quality": [
          "Testing Methodologies",
          "Code Quality Metrics",
          "Performance Optimization",
          "Security Testing",
        ],
        "Emerging Technologies": [
          "AI/ML in Software Engineering",
          "Blockchain Applications",
          "IoT Development",
          "Edge Computing",
        ],
      },
    },
  });

  console.log(`✅ Created ${6} conferences`);

  // Create conference role entries
  console.log("👥 Creating conference role entries...");

  await prisma.conferenceRoleEntries.createMany({
    data: [
      // Conference 1 (ICAI2024) - John as main chair, Jane and Alice as chairs, Bob, Charlie, Test as reviewers
      {
        userId: johnUser.id,
        conferenceId: conference1.id,
        role: "MAIN_CHAIR",
      },
      {
        userId: janeUser.id,
        conferenceId: conference1.id,
        role: "CHAIR",
      },
      {
        userId: aliceUser.id,
        conferenceId: conference1.id,
        role: "CHAIR",
      },
      {
        userId: bobUser.id,
        conferenceId: conference1.id,
        role: "REVIEWER",
      },
      {
        userId: charlieUser.id,
        conferenceId: conference1.id,
        role: "REVIEWER",
      },
      {
        userId: testUser.id,
        conferenceId: conference1.id,
        role: "REVIEWER",
      },

      // Conference 2 (CDPS2024) - Jane as main chair, John and Charlie as chairs, Alice, Bob, Test as reviewers
      {
        userId: janeUser.id,
        conferenceId: conference2.id,
        role: "MAIN_CHAIR",
      },
      {
        userId: johnUser.id,
        conferenceId: conference2.id,
        role: "CHAIR",
      },
      {
        userId: charlieUser.id,
        conferenceId: conference2.id,
        role: "CHAIR",
      },
      {
        userId: aliceUser.id,
        conferenceId: conference2.id,
        role: "REVIEWER",
      },
      {
        userId: bobUser.id,
        conferenceId: conference2.id,
        role: "REVIEWER",
      },
      {
        userId: testUser.id,
        conferenceId: conference2.id,
        role: "REVIEWER",
      },

      // Conference 3 (FHTC2025) - Alice as main chair, Charlie and Jane as chairs, John and Bob as reviewers
      {
        userId: aliceUser.id,
        conferenceId: conference3.id,
        role: "MAIN_CHAIR",
      },
      {
        userId: charlieUser.id,
        conferenceId: conference3.id,
        role: "CHAIR",
      },
      {
        userId: janeUser.id,
        conferenceId: conference3.id,
        role: "CHAIR",
      },
      {
        userId: johnUser.id,
        conferenceId: conference3.id,
        role: "REVIEWER",
      },
      {
        userId: bobUser.id,
        conferenceId: conference3.id,
        role: "REVIEWER",
      },

      // Conference 4 (QCPS2024) - Charlie as main chair, Test as chair, Alice and John as reviewers
      {
        userId: charlieUser.id,
        conferenceId: conference4.id,
        role: "MAIN_CHAIR",
      },
      {
        userId: testUser.id,
        conferenceId: conference4.id,
        role: "CHAIR",
      },
      {
        userId: aliceUser.id,
        conferenceId: conference4.id,
        role: "REVIEWER",
      },
      {
        userId: johnUser.id,
        conferenceId: conference4.id,
        role: "REVIEWER",
      },

      // Conference 5 (STGC2024) - Test as main chair, Alice as chair, Jane and Charlie as reviewers
      {
        userId: testUser.id,
        conferenceId: conference5.id,
        role: "MAIN_CHAIR",
      },
      {
        userId: aliceUser.id,
        conferenceId: conference5.id,
        role: "CHAIR",
      },
      {
        userId: janeUser.id,
        conferenceId: conference5.id,
        role: "REVIEWER",
      },
      {
        userId: charlieUser.id,
        conferenceId: conference5.id,
        role: "REVIEWER",
      },

      // Conference 6 (ISSEI2024) - Bob as main chair, Alice and Charlie as chairs, Jane and Test as reviewers
      // NOTE: John (marouanelemghari@gmail.com) has NO role in this conference
      {
        userId: bobUser.id,
        conferenceId: conference6.id,
        role: "MAIN_CHAIR",
      },
      {
        userId: aliceUser.id,
        conferenceId: conference6.id,
        role: "CHAIR",
      },
      {
        userId: charlieUser.id,
        conferenceId: conference6.id,
        role: "CHAIR",
      },
      {
        userId: janeUser.id,
        conferenceId: conference6.id,
        role: "REVIEWER",
      },
      {
        userId: testUser.id,
        conferenceId: conference6.id,
        role: "REVIEWER",
      },
    ],
  });

  console.log(`✅ Created conference role entries`);

  // Create submissions with authors
  console.log("📝 Creating submissions...");

  // Submission 1 for ICAI2024 - with linked user authors
  const submission1 = await prisma.submission.create({
    data: {
      title: "Deep Learning Approaches for Natural Language Understanding",
      abstract:
        "This paper presents novel deep learning architectures for natural language understanding tasks. We propose a transformer-based model that achieves state-of-the-art performance on multiple benchmarks including GLUE and SuperGLUE. Our approach combines attention mechanisms with graph neural networks to better capture semantic relationships in text.",
      keywords: [
        "deep learning",
        "natural language processing",
        "transformers",
        "attention mechanisms",
        "graph neural networks",
      ],
      paperFilePath:
        "https://8tyye4fbpp.ufs.sh/f/iDM0dapMasUCCkIXI3gvCVHGoUlfBRNXmsn7WK1ErOSuT9IP",
      paperFileName: "deep_learning_nlu.pdf",
      cameraReadyFilepath:
        "https://8tyye4fbpp.ufs.sh/f/iDM0dapMasUCCkIXI3gvCVHGoUlfBRNXmsn7WK1ErOSuT9IP",
      cameraReadyFilename: "deep_learning_nlu_camera_ready.pdf",
      primaryArea: "Natural Language Processing",
      secondaryArea: "Language Models",
      submittedById: johnUser.id,
      conferenceId: conference1.id,
    },
  });

  // Authors for submission 1 - mix of linked and non-linked users with payment status
  await prisma.submissionAuthor.createMany({
    data: [
      {
        firstName: "John",
        lastName: "Doe",
        email: userEmail,
        affiliation: "University of Technology",
        country: "us",
        submissionId: submission1.id,
        isCorresponding: true,
        userId: johnUser.id, // Linked to existing user
        hasPaid: true, // Corresponding author has paid
      },
      {
        firstName: "Alice",
        lastName: "Johnson",
        email: "alice@university.edu",
        affiliation: "State University",
        country: "us",
        submissionId: submission1.id,
        isCorresponding: false,
        userId: aliceUser.id, // Linked to existing user
        hasPaid: false, // Co-author hasn't paid yet
      },
      {
        firstName: "Michael",
        lastName: "Chen",
        email: "m.chen@research.ai",
        affiliation: "AI Research Lab",
        country: "cn",
        submissionId: submission1.id,
        isCorresponding: false,
        userId: null, // Not linked to any user
        hasPaid: true, // Non-user co-author has paid
      },
    ],
  });

  // Submission 2 for CDPS2024
  const submission2 = await prisma.submission.create({
    data: {
      title: "Zero-Trust Architecture for Cloud Security",
      abstract:
        "In this work, we present a comprehensive zero-trust security architecture specifically designed for cloud environments. Our framework includes identity verification, device authentication, and continuous monitoring capabilities. We demonstrate significant improvements in threat detection and response times compared to traditional perimeter-based security models.",
      keywords: [
        "zero-trust",
        "cloud security",
        "identity verification",
        "threat detection",
        "cybersecurity",
      ],
      paperFilePath:
        "https://8tyye4fbpp.ufs.sh/f/iDM0dapMasUCCkIXI3gvCVHGoUlfBRNXmsn7WK1ErOSuT9IP",
      paperFileName: "zero_trust_cloud_security.pdf",
      cameraReadyFilepath: "",
      cameraReadyFilename: "",
      primaryArea: "Cybersecurity",
      secondaryArea: "Threat Intelligence",
      submittedById: janeUser.id,
      conferenceId: conference2.id,
    },
  });

  await prisma.submissionAuthor.createMany({
    data: [
      {
        firstName: "Jane",
        lastName: "Smith",
        email: "jane@example.com",
        affiliation: "Research Institute",
        country: "ca",
        submissionId: submission2.id,
        isCorresponding: true,
        userId: janeUser.id,
        hasPaid: true, // All authors have paid
      },
      {
        firstName: "David",
        lastName: "Rodriguez",
        email: "d.rodriguez@cybersec.com",
        affiliation: "CyberSec Solutions",
        country: "es",
        submissionId: submission2.id,
        isCorresponding: false,
        userId: null,
        hasPaid: true, // All authors have paid
      },
    ],
  });

  // Submission 3 for FHTC2025 - Draft status
  const submission3 = await prisma.submission.create({
    data: {
      title: "AI-Powered Diagnostic System for Early Disease Detection",
      abstract:
        "We propose an AI-powered diagnostic system that leverages machine learning algorithms to detect early signs of various diseases from medical imaging data. Our system achieves 95% accuracy in detecting early-stage cancer and shows promising results for cardiovascular disease prediction.",
      keywords: [
        "medical AI",
        "diagnostic systems",
        "machine learning",
        "medical imaging",
        "early detection",
      ],
      paperFilePath:
        "https://8tyye4fbpp.ufs.sh/f/iDM0dapMasUCCkIXI3gvCVHGoUlfBRNXmsn7WK1ErOSuT9IP",
      paperFileName: "ai_diagnostic_system.pdf",
      cameraReadyFilepath: "",
      cameraReadyFilename: "",
      primaryArea: "Medical AI",
      secondaryArea: "Diagnostic AI",
      submittedById: aliceUser.id,
      conferenceId: conference3.id,
    },
  });

  await prisma.submissionAuthor.createMany({
    data: [
      {
        firstName: "Alice",
        lastName: "Johnson",
        email: "alice@university.edu",
        affiliation: "State University",
        country: "us",
        submissionId: submission3.id,
        isCorresponding: true,
        userId: aliceUser.id,
        hasPaid: false,
      },
      {
        firstName: "Dr. Sarah",
        lastName: "Williams",
        email: "s.williams@medical.center",
        affiliation: "Metropolitan Medical Center",
        country: "us",
        submissionId: submission3.id,
        isCorresponding: false,
        userId: null,
        hasPaid: false,
      },
      {
        firstName: "Robert",
        lastName: "Kumar",
        email: "r.kumar@biotech.in",
        affiliation: "BioTech Research Institute",
        country: "in",
        submissionId: submission3.id,
        isCorresponding: false,
        userId: null,
        hasPaid: false,
      },
    ],
  });

  // Submission 4 for STGC2024 - Revision required
  const submission4 = await prisma.submission.create({
    data: {
      title: "Energy-Efficient Algorithms for Large-Scale Data Processing",
      abstract:
        "This paper introduces novel energy-efficient algorithms for processing large datasets in distributed computing environments. Our approach reduces energy consumption by up to 40% while maintaining computational performance. We validate our methods on real-world datasets from various domains.",
      keywords: [
        "energy efficiency",
        "green computing",
        "distributed systems",
        "data processing",
        "sustainability",
      ],
      paperFilePath:
        "https://8tyye4fbpp.ufs.sh/f/iDM0dapMasUCCkIXI3gvCVHGoUlfBRNXmsn7WK1ErOSuT9IP",
      paperFileName: "energy_efficient_algorithms.pdf",
      cameraReadyFilepath: "",
      cameraReadyFilename: "",
      primaryArea: "Sustainable Computing",
      secondaryArea: "Energy-Efficient Algorithms",
      submittedById: testUser.id,
      conferenceId: conference5.id,
    },
  });

  await prisma.submissionAuthor.createMany({
    data: [
      {
        firstName: "Test",
        lastName: "User",
        email: "test@conflow.com",
        affiliation: "Test Organization",
        country: "us",
        submissionId: submission4.id,
        isCorresponding: true,
        userId: testUser.id,
        hasPaid: false,
      },
      {
        firstName: "Emma",
        lastName: "Thompson",
        email: "e.thompson@greentech.org",
        affiliation: "Green Technology Institute",
        country: "uk",
        submissionId: submission4.id,
        isCorresponding: false,
        userId: null,
        hasPaid: false,
      },
    ],
  });

  // Submission 5 for ICAI2024 - Refused
  const submission5 = await prisma.submission.create({
    data: {
      title: "Quantum-Classical Hybrid Neural Networks",
      abstract:
        "We explore the potential of quantum-classical hybrid neural networks for solving complex optimization problems. Our approach combines quantum computing principles with classical deep learning architectures to achieve quantum advantage in specific problem domains.",
      keywords: [
        "quantum computing",
        "neural networks",
        "hybrid systems",
        "optimization",
        "quantum advantage",
      ],
      paperFilePath:
        "https://8tyye4fbpp.ufs.sh/f/iDM0dapMasUCCkIXI3gvCVHGoUlfBRNXmsn7WK1ErOSuT9IP",
      paperFileName: "quantum_hybrid_networks.pdf",
      cameraReadyFilepath: "",
      cameraReadyFilename: "",
      primaryArea: "Machine Learning",
      secondaryArea: "Deep Learning",
      submittedById: charlieUser.id,
      conferenceId: conference1.id,
    },
  });

  await prisma.submissionAuthor.createMany({
    data: [
      {
        firstName: "Charlie",
        lastName: "Brown",
        email: "charlie@research.org",
        affiliation: "Research Organization",
        country: "uk",
        submissionId: submission5.id,
        isCorresponding: true,
        userId: charlieUser.id,
        hasPaid: false,
      },
      {
        firstName: "Dr. Lisa",
        lastName: "Zhang",
        email: "l.zhang@quantum.lab",
        affiliation: "Quantum Computing Lab",
        country: "ca",
        submissionId: submission5.id,
        isCorresponding: false,
        userId: null,
        hasPaid: false,
      },
      {
        firstName: "Professor Alex",
        lastName: "Petrov",
        email: "a.petrov@physics.edu",
        affiliation: "Institute of Theoretical Physics",
        country: "ru",
        submissionId: submission5.id,
        isCorresponding: false,
        userId: null,
        hasPaid: false,
      },
    ],
  });

  // Submission 6 for CDPS2024 - Multiple authors, some linked
  const submission6 = await prisma.submission.create({
    data: {
      title: "Privacy-Preserving Machine Learning in Healthcare",
      abstract:
        "This research presents privacy-preserving techniques for machine learning applications in healthcare. We develop federated learning approaches that enable collaborative model training without compromising patient data privacy, ensuring HIPAA compliance while maintaining model accuracy.",
      keywords: [
        "privacy preservation",
        "federated learning",
        "healthcare",
        "HIPAA compliance",
        "data protection",
      ],
      paperFilePath:
        "https://8tyye4fbpp.ufs.sh/f/iDM0dapMasUCCkIXI3gvCVHGoUlfBRNXmsn7WK1ErOSuT9IP",
      paperFileName: "privacy_ml_healthcare.pdf",
      cameraReadyFilepath:
        "https://8tyye4fbpp.ufs.sh/f/iDM0dapMasUCCkIXI3gvCVHGoUlfBRNXmsn7WK1ErOSuT9IP",
      cameraReadyFilename: "privacy_ml_healthcare_camera_ready.pdf",
      primaryArea: "Data Privacy",
      secondaryArea: "Privacy by Design",
      submittedById: bobUser.id,
      conferenceId: conference2.id,
    },
  });

  await prisma.submissionAuthor.createMany({
    data: [
      {
        firstName: "Bob",
        lastName: "Wilson",
        email: "bob@example.com",
        affiliation: "Tech Corp",
        country: "gb",
        submissionId: submission6.id,
        isCorresponding: true,
        userId: bobUser.id,
        hasPaid: false, // No one has paid yet
      },
      {
        firstName: "Jane",
        lastName: "Smith",
        email: "jane@example.com",
        affiliation: "Research Institute",
        country: "ca",
        submissionId: submission6.id,
        isCorresponding: false,
        userId: janeUser.id, // Co-author who is also a user
        hasPaid: false, // No one has paid yet
      },
      {
        firstName: "Dr. Maria",
        lastName: "Garcia",
        email: "m.garcia@hospital.es",
        affiliation: "Barcelona General Hospital",
        country: "es",
        submissionId: submission6.id,
        isCorresponding: false,
        userId: null,
        hasPaid: false, // No one has paid yet
      },
      {
        firstName: "Prof. James",
        lastName: "Anderson",
        email: "j.anderson@privacy.org",
        affiliation: "Privacy Research Foundation",
        country: "us",
        submissionId: submission6.id,
        isCorresponding: false,
        userId: null,
        hasPaid: false, // No one has paid yet
      },
    ],
  });

  // Add another ACCEPTED submission for ICAI2024 with all authors unpaid
  const submission7 = await prisma.submission.create({
    data: {
      title: "Explainable AI for Medical Diagnosis: A Comprehensive Framework",
      abstract:
        "This paper presents a novel framework for explainable artificial intelligence in medical diagnosis. Our approach provides transparent and interpretable AI models that can assist healthcare professionals while maintaining clinical accuracy and meeting regulatory requirements.",
      keywords: [
        "explainable AI",
        "medical diagnosis",
        "interpretability",
        "healthcare AI",
        "regulatory compliance",
      ],
      paperFilePath:
        "https://8tyye4fbpp.ufs.sh/f/iDM0dapMasUCCkIXI3gvCVHGoUlfBRNXmsn7WK1ErOSuT9IP",
      paperFileName: "explainable_ai_medical.pdf",
      cameraReadyFilepath:
        "https://8tyye4fbpp.ufs.sh/f/iDM0dapMasUCCkIXI3gvCVHGoUlfBRNXmsn7WK1ErOSuT9IP",
      cameraReadyFilename: "explainable_ai_medical_camera_ready.pdf",
      primaryArea: "AI Ethics",
      secondaryArea: "Explainable AI",
      submittedById: testUser.id,
      conferenceId: conference1.id,
    },
  });

  await prisma.submissionAuthor.createMany({
    data: [
      {
        firstName: "Test",
        lastName: "User",
        email: "test@conflow.com",
        affiliation: "Test Organization",
        country: "us",
        submissionId: submission7.id,
        isCorresponding: true,
        userId: testUser.id,
        hasPaid: false, // Unpaid corresponding author
      },
      {
        firstName: "Dr. Elena",
        lastName: "Rossi",
        email: "e.rossi@medicalai.it",
        affiliation: "Medical AI Research Center",
        country: "it",
        submissionId: submission7.id,
        isCorresponding: false,
        userId: null,
        hasPaid: false, // Unpaid co-author
      },
      {
        firstName: "Prof. Ahmed",
        lastName: "Al-Rashid",
        email: "a.alrashid@tech.ae",
        affiliation: "UAE Institute of Technology",
        country: "ae",
        submissionId: submission7.id,
        isCorresponding: false,
        userId: null,
        hasPaid: false, // Unpaid co-author
      },
    ],
  });

  console.log(`✅ Created 7 submissions with multiple authors`);

  // Create review assignments
  console.log("📋 Creating review assignments...");

  // First, get the role entries for reviewers that we'll use for assignments
  const johnReviewerRole = await prisma.conferenceRoleEntries.findFirst({
    where: {
      userId: johnUser.id,
      conferenceId: conference3.id,
      role: "REVIEWER",
    },
  });

  const bobReviewerRole = await prisma.conferenceRoleEntries.findFirst({
    where: {
      userId: bobUser.id,
      conferenceId: conference3.id,
      role: "REVIEWER",
    },
  });

  const aliceChairRole = await prisma.conferenceRoleEntries.findFirst({
    where: {
      userId: aliceUser.id,
      conferenceId: conference3.id,
      role: "MAIN_CHAIR",
    },
  });

  const janeChairRole = await prisma.conferenceRoleEntries.findFirst({
    where: {
      userId: janeUser.id,
      conferenceId: conference2.id,
      role: "MAIN_CHAIR",
    },
  });

  const johnChairRole = await prisma.conferenceRoleEntries.findFirst({
    where: { userId: johnUser.id, conferenceId: conference2.id, role: "CHAIR" },
  });

  const aliceReviewerRole = await prisma.conferenceRoleEntries.findFirst({
    where: {
      userId: aliceUser.id,
      conferenceId: conference2.id,
      role: "REVIEWER",
    },
  });

  const bobReviewerRole2 = await prisma.conferenceRoleEntries.findFirst({
    where: {
      userId: bobUser.id,
      conferenceId: conference2.id,
      role: "REVIEWER",
    },
  });

  // Create review assignments
  const reviewAssignments: {
    submissionId: string;
    dueDate: Date;
    reviewerRoleId: string;
    assignedByRoleId: string;
  }[] = [];

  // Assignments for FHTC2025 (conference3) - submission3
  if (johnReviewerRole && aliceChairRole) {
    reviewAssignments.push({
      submissionId: submission3.id,
      dueDate: new Date(Date.now() + 14 * 24 * 60 * 60 * 1000), // 14 days from now
      reviewerRoleId: johnReviewerRole.id,
      assignedByRoleId: aliceChairRole.id,
    });
  }

  if (bobReviewerRole && aliceChairRole) {
    reviewAssignments.push({
      submissionId: submission3.id,
      dueDate: new Date(Date.now() + 14 * 24 * 60 * 60 * 1000), // 14 days from now
      reviewerRoleId: bobReviewerRole.id,
      assignedByRoleId: aliceChairRole.id,
    });
  }

  // Assignments for CDPS2024 (conference2) - submission2 and submission6
  if (aliceReviewerRole && janeChairRole) {
    reviewAssignments.push({
      submissionId: submission2.id,
      dueDate: new Date(Date.now() + 10 * 24 * 60 * 60 * 1000), // 10 days from now
      reviewerRoleId: aliceReviewerRole.id,
      assignedByRoleId: janeChairRole.id,
    });
  }

  if (bobReviewerRole2 && janeChairRole) {
    reviewAssignments.push({
      submissionId: submission6.id,
      dueDate: new Date(Date.now() + 12 * 24 * 60 * 60 * 1000), // 12 days from now
      reviewerRoleId: bobReviewerRole2.id,
      assignedByRoleId: janeChairRole.id,
    });
  }

  if (aliceReviewerRole && johnChairRole) {
    reviewAssignments.push({
      submissionId: submission6.id,
      dueDate: new Date(Date.now() + 12 * 24 * 60 * 60 * 1000), // 12 days from now
      reviewerRoleId: aliceReviewerRole.id,
      assignedByRoleId: johnChairRole.id,
    });
  }

  // Create the review assignments
  for (const assignment of reviewAssignments) {
    await prisma.reviewAssignment.create({
      data: assignment,
    });
  }

  console.log(`✅ Created ${reviewAssignments.length} review assignments`);

  // Create reviews for some assignments
  console.log("📝 Creating reviews...");

  // Get created review assignments to add reviews to them
  const createdAssignments = await prisma.reviewAssignment.findMany({
    include: {
      submission: true,
      reviewer: {
        include: {
          user: true,
        },
      },
    },
  });

  const reviews: {
    submissionId: string;
    assignmentId: string;
    recommendation: RecStatus;
    overallEvaluation: string;
    overallScore: number;
  }[] = [];

  // Create some completed reviews
  // Skip creating a review for John's second assignment (the new one we added) for testing
  const assignmentsToReview = createdAssignments.slice(0, 3);

  for (let i = 0; i < assignmentsToReview.length; i++) {
    const assignment = assignmentsToReview[i];

    // Skip creating review for John's assignment to submission3 (for testing)
    if (
      assignment.reviewer.user.id === johnUser.id &&
      assignment.submissionId === submission3.id
    ) {
      console.log(
        `⏭️  Skipping review creation for John's assignment to test review submission`
      );
      continue;
    }

    const recommendations: RecStatus[] = ["ACCEPTED", "REVISION", "REJECTED"];
    const randomRecommendation = recommendations[Math.floor(Math.random() * 3)];

    reviews.push({
      submissionId: assignment.submissionId,
      assignmentId: assignment.id,
      recommendation: randomRecommendation,
      overallEvaluation: `This paper presents ${
        ["excellent", "good", "fair"][Math.floor(Math.random() * 3)]
      } research on ${assignment.submission.title.toLowerCase()}. The methodology is ${
        ["strong", "adequate", "weak"][Math.floor(Math.random() * 3)]
      } and the results are ${
        ["convincing", "promising", "questionable"][
          Math.floor(Math.random() * 3)
        ]
      }. ${
        [
          "I recommend acceptance with minor revisions.",
          "The paper needs major revisions before acceptance.",
          "The contribution is not sufficient for publication.",
        ][Math.floor(Math.random() * 3)]
      }`,
      overallScore: Math.floor(Math.random() * 10), // 1-10 score
    });
  }

  // Create the reviews
  for (const review of reviews) {
    await prisma.review.create({
      data: review,
    });
  }

  console.log(`✅ Created ${reviews.length} reviews`);

  // Create decision assignments
  console.log("⚖️ Creating decision assignments...");

  // Get chair roles that can make decisions
  const johnMainChairRole = await prisma.conferenceRoleEntries.findFirst({
    where: {
      userId: johnUser.id,
      conferenceId: conference1.id,
      role: "MAIN_CHAIR",
    },
  });

  const janeMainChairRole = await prisma.conferenceRoleEntries.findFirst({
    where: {
      userId: janeUser.id,
      conferenceId: conference2.id,
      role: "MAIN_CHAIR",
    },
  });

  const aliceMainChairRole = await prisma.conferenceRoleEntries.findFirst({
    where: {
      userId: aliceUser.id,
      conferenceId: conference3.id,
      role: "MAIN_CHAIR",
    },
  });

  const testMainChairRole = await prisma.conferenceRoleEntries.findFirst({
    where: {
      userId: testUser.id,
      conferenceId: conference5.id,
      role: "MAIN_CHAIR",
    },
  });

  const decisionAssignments: {
    submissionId: string;
    dueDate: Date;
    chairRoleId: string;
    assignedByRoleId: string;
  }[] = [];

  // Create decision assignments for submissions that have been reviewed or are ready for decision
  if (johnMainChairRole) {
    // For submission1 (UNDER_REVIEW) - assign to Main Chair
    decisionAssignments.push({
      submissionId: submission1.id,
      dueDate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000), // 7 days from now
      chairRoleId: johnMainChairRole.id,
      assignedByRoleId: johnMainChairRole.id, // Self-assigned as Main Chair
    });

    // For submission5 (REFUSED) - historical decision assignment
    decisionAssignments.push({
      submissionId: submission5.id,
      dueDate: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000), // 5 days ago (completed)
      chairRoleId: johnMainChairRole.id,
      assignedByRoleId: johnMainChairRole.id,
    });
  }

  if (janeMainChairRole) {
    // For submission2 (ACCEPTED) - historical decision assignment
    decisionAssignments.push({
      submissionId: submission2.id,
      dueDate: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000), // 3 days ago (completed)
      chairRoleId: janeMainChairRole.id,
      assignedByRoleId: janeMainChairRole.id,
    });

    // For submission6 (ACCEPTED) - historical decision assignment
    decisionAssignments.push({
      submissionId: submission6.id,
      dueDate: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000), // 2 days ago (completed)
      chairRoleId: janeMainChairRole.id,
      assignedByRoleId: janeMainChairRole.id,
    });
  }

  if (aliceMainChairRole) {
    // For submission3 (DRAFT) - future decision assignment (when ready)
    decisionAssignments.push({
      submissionId: submission3.id,
      dueDate: new Date(Date.now() + 21 * 24 * 60 * 60 * 1000), // 21 days from now
      chairRoleId: aliceMainChairRole.id,
      assignedByRoleId: aliceMainChairRole.id,
    });
  }

  if (testMainChairRole) {
    // For submission4 (REVISION) - historical decision assignment
    decisionAssignments.push({
      submissionId: submission4.id,
      dueDate: new Date(Date.now() - 10 * 24 * 60 * 60 * 1000), // 10 days ago (completed)
      chairRoleId: testMainChairRole.id,
      assignedByRoleId: testMainChairRole.id,
    });
  }

  // Create the decision assignments
  type CreatedDecisionAssignment = {
    id: string;
    submissionId: string;
    dueDate: Date;
    chairRoleId: string;
    assignedByRoleId: string;
    createdAt: Date;
  };

  const createdDecisionAssignments: CreatedDecisionAssignment[] = [];
  for (const assignment of decisionAssignments) {
    const created = await prisma.decisionAssignment.create({
      data: assignment,
    });
    createdDecisionAssignments.push(created);
  }

  console.log(
    `✅ Created ${createdDecisionAssignments.length} decision assignments`
  );

  // Create decisions for completed assignments
  console.log("📋 Creating decisions...");

  const decisions: {
    submissionId: string;
    assignmentId: string;
    reviewDecision: DecStatus;
  }[] = [];

  // Find decision assignments that should have decisions (historical ones)
  const completedDecisionAssignments = createdDecisionAssignments.filter(
    (assignment) => assignment.dueDate < new Date()
  );

  for (const assignment of completedDecisionAssignments) {
    let decision: DecStatus;

    // Match decisions to submission status
    if (
      assignment.submissionId === submission2.id ||
      assignment.submissionId === submission6.id
    ) {
      decision = "ACCEPT"; // These are ACCEPTED submissions
    } else if (assignment.submissionId === submission4.id) {
      decision = "MAJOR_REVISION"; // This is REVISION submission
    } else if (assignment.submissionId === submission5.id) {
      decision = "REJECT"; // This is REFUSED submission
    } else {
      // Default random decision for others
      const randomDecisions: DecStatus[] = [
        "ACCEPT",
        "MAJOR_REVISION",
        "MINOR_REVISION",
        "REJECT",
      ];
      decision = randomDecisions[Math.floor(Math.random() * 4)];
    }

    decisions.push({
      submissionId: assignment.submissionId,
      assignmentId: assignment.id,
      reviewDecision: decision,
    });
  }

  // Create the decisions
  for (const decision of decisions) {
    await prisma.decision.create({
      data: decision,
    });
  }

  console.log(`✅ Created ${decisions.length} decisions`);

  // Create ACCEPTED decisions for payment tracking
  console.log(
    "📋 Creating additional ACCEPT decisions for payment tracking..."
  );

  // Create decision assignment for submission7 (ICAI2024)
  let submission7DecisionAssignment;
  if (johnMainChairRole) {
    submission7DecisionAssignment = await prisma.decisionAssignment.create({
      data: {
        submissionId: submission7.id,
        dueDate: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000), // 1 day ago (completed)
        chairRoleId: johnMainChairRole.id,
        assignedByRoleId: johnMainChairRole.id,
      },
    });
  }

  // Create ACCEPT decisions for payment tracking
  const acceptDecisions: {
    submissionId: string;
    assignmentId: string;
    reviewDecision: DecStatus;
  }[] = [];

  // Find existing decision assignments that we want to mark as ACCEPT
  const submission1DecisionAssignment = createdDecisionAssignments.find(
    (assignment) => assignment.submissionId === submission1.id
  );

  if (submission1DecisionAssignment) {
    acceptDecisions.push({
      submissionId: submission1.id,
      assignmentId: submission1DecisionAssignment.id,
      reviewDecision: "ACCEPT",
    });
  }

  if (submission7DecisionAssignment) {
    acceptDecisions.push({
      submissionId: submission7.id,
      assignmentId: submission7DecisionAssignment.id,
      reviewDecision: "ACCEPT",
    });
  }

  // Create the ACCEPT decisions
  for (const decision of acceptDecisions) {
    await prisma.decision.create({
      data: decision,
    });
  }

  console.log(
    `✅ Created ${acceptDecisions.length} additional ACCEPT decisions for payment tracking`
  );

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

  // Add payment-related notifications
  const paymentNotifications = [
    {
      userId: johnUser.id,
      title: "Payment Required - ICAI2024",
      message: `Your paper "Deep Learning Approaches for Natural Language Understanding" has been accepted for ICAI2024. Please complete your registration payment to secure your spot.`,
      isRead: false,
      isArchived: false,
      createdAt: new Date(Date.now() - 2 * 60 * 60 * 1000), // 2 hours ago
    },
    {
      userId: aliceUser.id,
      title: "Co-Author Payment Reminder",
      message: `As a co-author on the accepted paper "Deep Learning Approaches for Natural Language Understanding" for ICAI2024, please complete your registration payment.`,
      isRead: false,
      isArchived: false,
      createdAt: new Date(Date.now() - 3 * 60 * 60 * 1000), // 3 hours ago
    },
    {
      userId: bobUser.id,
      title: "Conference Registration Payment Due",
      message: `Your paper "Privacy-Preserving Machine Learning in Healthcare" has been accepted for CDPS2024. Registration payment is now due for all authors.`,
      isRead: false,
      isArchived: false,
      createdAt: new Date(Date.now() - 1 * 60 * 60 * 1000), // 1 hour ago
    },
    {
      userId: testUser.id,
      title: "Payment Deadline Approaching",
      message: `Reminder: Payment for your accepted paper "Explainable AI for Medical Diagnosis" at ICAI2024 is due within 7 days.`,
      isRead: true,
      isArchived: false,
      createdAt: new Date(Date.now() - 6 * 60 * 60 * 1000), // 6 hours ago
    },
    {
      userId: janeUser.id,
      title: "Payment Status Update Required",
      message: `As Main Chair of CDPS2024, please update payment statuses for accepted authors using the payment tracking dashboard.`,
      isRead: false,
      isArchived: false,
      createdAt: new Date(Date.now() - 4 * 60 * 60 * 1000), // 4 hours ago
    },
  ];

  // Add payment notifications to existing notifications array
  notifications.push(...paymentNotifications);

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
  const submissionCount = await prisma.submission.count();
  const authorCount = await prisma.submissionAuthor.count();
  const paidAuthorsCount = await prisma.submissionAuthor.count({
    where: { hasPaid: true },
  });
  const unpaidAuthorsCount = await prisma.submissionAuthor.count({
    where: { hasPaid: false },
  });
  const acceptedSubmissionsCount = await prisma.decision.count({
    where: { reviewDecision: "ACCEPT" },
  });
  const cameraReadyConferencesCount = await prisma.conference.count({
    where: { status: ConferenceStatus.CAMERA_READY_PHASE },
  });
  const roleEntriesCount = await prisma.conferenceRoleEntries.count();
  const reviewAssignmentCount = await prisma.reviewAssignment.count();
  const reviewCount = await prisma.review.count();
  const decisionAssignmentCount = await prisma.decisionAssignment.count();
  const decisionCount = await prisma.decision.count();
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

  // Role distribution stats
  const mainChairRoles = await prisma.conferenceRoleEntries.count({
    where: { role: "MAIN_CHAIR" },
  });
  const chairRoles = await prisma.conferenceRoleEntries.count({
    where: { role: "CHAIR" },
  });
  const reviewerRoles = await prisma.conferenceRoleEntries.count({
    where: { role: "REVIEWER" },
  });

  console.log(`👤 Total Users: ${userCount}`);
  console.log(`🏛️ Total Conferences: ${conferenceCount}`);
  console.log(`  📹 Camera Ready Phase: ${cameraReadyConferencesCount}`);
  console.log(`  ✅ Approved: ${approvedConferences}`);
  console.log(`  ⏳ Pending: ${pendingConferences}`);
  console.log(`  ❌ Rejected: ${rejectedConferences}`);
  console.log(`  🏁 Completed: ${completedConferences}`);
  console.log(`📝 Total Submissions: ${submissionCount}`);
  console.log(`  ✅ Accepted: ${acceptedSubmissionsCount}`);
  console.log(`👥 Total Authors: ${authorCount}`);
  console.log(`  💰 Paid Authors: ${paidAuthorsCount}`);
  console.log(`  💳 Unpaid Authors: ${unpaidAuthorsCount}`);
  console.log(`📋 Review Assignments: ${reviewAssignmentCount}`);
  console.log(`📝 Reviews: ${reviewCount}`);
  console.log(`⚖️ Decision Assignments: ${decisionAssignmentCount}`);
  console.log(`📋 Decisions: ${decisionCount}`);
  console.log(`🎭 Conference Roles: ${roleEntriesCount}`);
  console.log(`  🎯 Main Chairs: ${mainChairRoles}`);
  console.log(`  🪑 Chairs: ${chairRoles}`);
  console.log(`  👀 Reviewers: ${reviewerRoles}`);
  console.log(`🔔 Total Notifications: ${notificationCount}`);
  console.log(`📬 Unread Notifications: ${unreadCount}`);
  console.log(`📦 Archived Notifications: ${archivedCount}`);

  console.log("\n🔑 Test Accounts:");
  console.log("=================");
  console.log(`Admin: ${adminEmail} / Password123!`);
  console.log(`User 1: ${userEmail} / Password123! (Main Chair ICAI2024)`);
  console.log("User 2: jane@example.com / Password123! (Main Chair CDPS2024)");
  console.log(
    "User 3: bob@example.com / Password123! (Main Chair ISSEI2024, unverified)"
  );
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
  console.log("⏳ FHTC2025 - Healthcare Technology (Pending, Public)");
  console.log("❌ QCPS2024 - Quantum Computing (Rejected, Private)");
  console.log("🏁 STGC2024 - Sustainable Technology (Completed, Public)");
  console.log(
    "✅ ISSEI2024 - Software Engineering Symposium (Approved, Public) - John has NO role"
  );

  console.log("\n🎯 For Testing Paper Submissions:");
  console.log("==================================");
  console.log(`📝 ${userEmail} (John) can submit papers to:`);
  console.log("   - ISSEI2024 (Software Engineering Symposium)");
  console.log("   - Any other public conferences where he has no role");
  console.log("🚫 John CANNOT submit to ICAI2024 (he's Main Chair)");
  console.log("🚫 John CANNOT submit to CDPS2024 (he's Chair)");
  console.log("🚫 John CANNOT submit to FHTC2025 (he's Reviewer)");
  console.log("🚫 John CANNOT submit to QCPS2024 (he's Reviewer)");

  console.log("\n📝 For Testing Review Submissions:");
  console.log("===================================");
  console.log(`🔍 ${userEmail} (John) has a review assignment for:`);
  console.log(
    '   - FHTC2025: "AI-Powered Diagnostic System for Early Disease Detection"'
  );
  console.log(
    "   - This assignment has NO review created yet (perfect for testing!)"
  );
  console.log("   - Due in 21 days from now");
  console.log("   - Assigned by Alice (Main Chair)");

  console.log("\n🎭 Role System Features:");
  console.log("========================");
  console.log("✅ Multi-role support per conference");
  console.log("✅ Conflict of interest prevention");
  console.log("✅ Hierarchical permissions (MAIN_CHAIR > CHAIR > REVIEWER)");
  console.log("✅ Role-based access control");
  console.log("✅ Flexible role assignment/removal");

  console.log("\n💰 Payment Tracking Features:");
  console.log("==============================");
  console.log(
    "✅ ICAI2024 - Camera ready deadline passed, payment tracking enabled"
  );
  console.log(
    "✅ CDPS2024 - Camera ready deadline passed, payment tracking enabled"
  );
  console.log(
    "📊 Mixed payment status across accepted submissions for testing"
  );
  console.log(
    "🔍 Payment status can be toggled by chairs in conference dashboard"
  );
  console.log("📥 CSV export functionality for payment reports");

  console.log("\n📋 Payment Status Examples:");
  console.log("============================");
  console.log("📝 Submission 1 (ICAI2024): 2/3 authors paid");
  console.log("📝 Submission 2 (CDPS2024): 2/2 authors paid");
  console.log("📝 Submission 6 (CDPS2024): 0/4 authors paid");
  console.log("📝 Submission 7 (ICAI2024): 0/3 authors paid");

  console.log("\n🎯 For Testing Payment Features:");
  console.log("=================================");
  console.log(`🔍 ${userEmail} (John) as Main Chair of ICAI2024 can:`);
  console.log(
    "   - View payment tracking section (camera ready deadline passed)"
  );
  console.log("   - Toggle payment status for all accepted submission authors");
  console.log("   - Download CSV reports of payment status");
  console.log("   - See mixed payment statuses for comprehensive testing");
  console.log(`🔍 jane@example.com (Jane) as Main Chair of CDPS2024 can:`);
  console.log("   - Access payment tracking for accepted submissions");
  console.log("   - Manage payment status for multiple author submissions");

  console.log(
    "\n🌱 Database seeding completed successfully with payment tracking!"
  );
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
