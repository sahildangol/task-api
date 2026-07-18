import prisma from "../src/config/db";
import bcrypt from "bcryptjs";

const sampleTasks = [
  {
    title: "Set up CI/CD pipeline",
    description: "Configure GitHub Actions for automated testing and deployment.",
    isCompleted: false,
  },
  {
    title: "Write API documentation",
    description: "Document all endpoints with request/response examples.",
    isCompleted: true,
  },
  {
    title: "Add rate limiting",
    description: "Implement rate limiting on auth endpoints to prevent brute force.",
    isCompleted: false,
  },
  {
    title: "Implement refresh tokens",
    description: "Add JWT refresh token rotation for better security.",
    isCompleted: false,
  },
  {
    title: "Database indexing review",
    description: "Analyze query patterns and add missing indexes.",
    isCompleted: true,
  },
];

const seed = async () => {
  const existing = await prisma.task.findMany({ select: { id: true }, take: 1 });
  if (existing.length > 0) {
    console.log("Tasks already seeded, skipping.");
    return;
  }

  const hashedPassword = await bcrypt.hash("password123", 12);

  const defaultUser = await prisma.user.upsert({
    where: { email: "admin@example.com" },
    update: {},
    create: {
      email: "admin@example.com",
      name: "Admin",
      password: hashedPassword,
      role: "USER",
    },
  });

  await prisma.task.createMany({
    data: sampleTasks.map((task) => ({
      ...task,
      userId: defaultUser.id,
    })),
  });

  console.log("Tasks seeded successfully (assigned to admin@example.com)");
};

seed()
  .catch((error) => {
    console.error("Seeding failed", error);
    process.exitCode = 1;
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
