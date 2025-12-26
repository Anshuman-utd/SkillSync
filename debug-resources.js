const { PrismaClient } = require('./src/generated/prisma');
const prisma = new PrismaClient();

async function main() {
  const resources = await prisma.resource.findMany({
    take: 5,
    orderBy: {
      createdAt: 'desc',
    },
    include: {
        course: true
    }
  });

  console.log('Latest 5 resources:');
  resources.forEach(r => {
    console.log(`ID: ${r.id}, Title: ${r.title}, Course: ${r.course.title}, URL: ${r.fileUrl}`);
  });
}

main()
  .catch(e => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
