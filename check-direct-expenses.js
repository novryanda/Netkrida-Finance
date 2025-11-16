import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  console.log('\n=== Checking Direct Expenses ===\n');

  // Count all direct expenses
  const total = await prisma.directExpenseRequest.count();
  console.log(`Total Direct Expenses: ${total}`);

  // Count by status
  const byStatus = await prisma.directExpenseRequest.groupBy({
    by: ['status'],
    _count: true,
  });

  console.log('\nBy Status:');
  byStatus.forEach(({ status, _count }) => {
    console.log(`  ${status}: ${_count}`);
  });

  // Get first 5 direct expenses with details
  const expenses = await prisma.directExpenseRequest.findMany({
    take: 5,
    orderBy: { createdAt: 'desc' },
    include: {
      project: {
        select: {
          id: true,
          projectName: true,
        },
      },
      category: {
        select: {
          id: true,
          name: true,
        },
      },
      createdBy: {
        select: {
          id: true,
          name: true,
          email: true,
          role: true,
        },
      },
    },
  });

  console.log('\nFirst 5 Direct Expenses:');
  expenses.forEach((expense) => {
    console.log(`\n  ID: ${expense.id}`);
    console.log(`  Description: ${expense.description}`);
    console.log(`  Amount: ${expense.amount}`);
    console.log(`  Status: ${expense.status}`);
    console.log(`  Project: ${expense.project?.projectName || 'N/A'}`);
    console.log(`  Category: ${expense.category?.name || 'N/A'}`);
    console.log(`  Created By: ${expense.createdBy.name} (${expense.createdBy.role})`);
    console.log(`  Created At: ${expense.createdAt}`);
  });

  console.log('\n');
}

main()
  .catch((e) => {
    console.error('Error:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
