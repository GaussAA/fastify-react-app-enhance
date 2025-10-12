import { PrismaClient } from '@prisma/client';
const prisma = new PrismaClient();

async function main() {
  await prisma.user.createMany({
    data: [
      { name: 'Alice', email: 'alice@test.com' },
      { name: 'Bob', email: 'bob@test.com' },
    ],
  });
  console.log('Database seeded.');
}

main()
  .catch(console.error)
  .finally(() => prisma.$disconnect());
