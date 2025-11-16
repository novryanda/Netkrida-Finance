// Quick script to check reimbursement data
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  console.log('Checking Reimbursement data...\n');
  
  const all = await prisma.reimbursement.findMany({
    select: {
      id: true,
      status: true,
      description: true,
      amount: true,
      submittedAt: true,
      reviewedAt: true,
      approvedAt: true,
      submittedBy: {
        select: { name: true }
      },
      reviewedBy: {
        select: { name: true }
      },
      approvedBy: {
        select: { name: true }
      }
    },
    orderBy: { submittedAt: 'desc' }
  });
  
  console.log(`Total Reimbursements: ${all.length}\n`);
  
  const byStatus = {
    PENDING: all.filter(r => r.status === 'PENDING').length,
    REVIEWED: all.filter(r => r.status === 'REVIEWED').length,
    APPROVED: all.filter(r => r.status === 'APPROVED').length,
    PAID: all.filter(r => r.status === 'PAID').length,
    REJECTED: all.filter(r => r.status === 'REJECTED').length,
  };
  
  console.log('By Status:');
  console.log(byStatus);
  console.log('\n');
  
  const approved = all.filter(r => r.status === 'APPROVED');
  if (approved.length > 0) {
    console.log('APPROVED Reimbursements:');
    approved.forEach(r => {
      console.log(`- ID: ${r.id.substring(0, 8)}...`);
      console.log(`  Description: ${r.description}`);
      console.log(`  Amount: ${r.amount}`);
      console.log(`  Submitted by: ${r.submittedBy.name}`);
      console.log(`  Reviewed by: ${r.reviewedBy?.name || 'N/A'}`);
      console.log(`  Approved by: ${r.approvedBy?.name || 'N/A'}`);
      console.log(`  Approved at: ${r.approvedAt || 'N/A'}`);
      console.log('');
    });
  } else {
    console.log('No APPROVED reimbursements found!');
    console.log('\nAll Reimbursements:');
    all.forEach(r => {
      console.log(`- [${r.status}] ${r.description} - ${r.submittedBy.name}`);
    });
  }
}

main()
  .catch(console.error)
  .finally(() => prisma.$disconnect());
