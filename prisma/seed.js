import prisma from "./seed-client.js";

async function main() {
  await prisma.category.createMany({
    data: [
      { name: "Web Dev" },
      { name: "UI/UX" },
      { name: "AI/ML" },
      { name: "Mobile Dev" },
      { name: "Cloud" },
      { name: "Data Science" }
    ],
    skipDuplicates: true, // avoids duplicates
  });

  console.log("✔ Categories seeded successfully!");
}

main()
  .catch((e) => {
    console.error("Seed error:", e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
