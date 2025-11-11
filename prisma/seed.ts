import { PrismaClient } from "../generated/prisma";
import bcrypt from "bcryptjs";

const prisma = new PrismaClient();

async function main() {
  console.log("🌱 Starting seed...");
  
  // Hash password untuk semua user (password: "password123")
  const hashedPassword = await bcrypt.hash("password123", 10);
  console.log("🔑 Password hashed:", hashedPassword.substring(0, 20) + "...");

  // Delete existing data in correct order (respect foreign key constraints)
  await prisma.reimbursement.deleteMany({});
  await prisma.expense.deleteMany({});
  await prisma.projectRevision.deleteMany({});
  await prisma.project.deleteMany({});
  await prisma.post.deleteMany({});
  await prisma.user.deleteMany({
    where: {
      email: {
        in: ["admin@netkrida.com", "finance@netkrida.com", "staff@netkrida.com"],
      },
    },
  });
  console.log("🗑️  Deleted existing test data");

  // Create users
  const admin = await prisma.user.create({
    data: {
      name: "Admin User",
      email: "admin@netkrida.com",
      password: hashedPassword,
      role: "ADMIN",
      bankName: "BCA",
      bankAccountNo: "1234567890",
      isActive: true,
    },
  });
  console.log("✅ Created admin:", admin.email);

  const finance = await prisma.user.create({
    data: {
      name: "Finance User",
      email: "finance@netkrida.com",
      password: hashedPassword,
      role: "FINANCE",
      bankName: "Mandiri",
      bankAccountNo: "9876543210",
      isActive: true,
    },
  });
  console.log("✅ Created finance:", finance.email);

  const staff = await prisma.user.create({
    data: {
      name: "Staff User",
      email: "staff@netkrida.com",
      password: hashedPassword,
      role: "STAFF",
      bankName: "BNI",
      bankAccountNo: "5555666677",
      isActive: true,
    },
  });
  console.log("✅ Created staff:", staff.email);

  // Create a project
  const project = await prisma.project.create({
    data: {
      projectName: "Website Redesign PT ABC",
      clientName: "PT ABC Indonesia",
      projectValue: 50000000,
      deadline: new Date("2025-12-31"),
      status: "ACTIVE",
      description: "Redesign website utama PT ABC.",
      createdBy: { connect: { id: admin.id } },
    },
  });
  console.log("✅ Created project:", project.projectName);

  // Create an expense
  const expense = await prisma.expense.create({
    data: {
      project: { connect: { id: project.id } },
      expenseType: "REIMBURSEMENT",
      description: "Transport & Akomodasi",
      amount: 1500000,
      expenseDate: new Date(),
      createdBy: { connect: { id: staff.id } },
    },
  });
  console.log("✅ Created expense:", expense.description);

  // Create a reimbursement
  await prisma.reimbursement.create({
    data: {
      expense: { connect: { id: expense.id } },
      status: "PENDING",
      submittedBy: { connect: { id: staff.id } },
    },
  });
  console.log("✅ Created reimbursement");
  console.log("\n🎉 Seed completed successfully!");
  console.log("\n📋 Login credentials:");
  console.log("   Admin: admin@netkrida.com / password123");
  console.log("   Finance: finance@netkrida.com / password123");
  console.log("   Staff: staff@netkrida.com / password123");
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
