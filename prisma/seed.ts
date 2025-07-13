import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

async function main() {
  console.log("🌱 Seeding database...");

  // Clear existing data
  await prisma.collection.deleteMany();
  await prisma.chest.deleteMany();
  await prisma.bitrefillReward.deleteMany();

  // Create sample chests around New York City
  const chests = [
    {
      location: { lat: 40.7128, lng: -74.006 }, // Times Square area
      metadata: { type: "common", value: 5, model: "wooden_chest" },
    },
    {
      location: { lat: 40.758, lng: -73.9855 }, // Central Park area
      metadata: { type: "rare", value: 10, model: "golden_chest" },
    },
    {
      location: { lat: 40.7505, lng: -73.9934 }, // Empire State Building area
      metadata: { type: "common", value: 5, model: "wooden_chest" },
    },
    {
      location: { lat: 40.7484, lng: -73.9857 }, // Rockefeller Center area
      metadata: { type: "epic", value: 20, model: "diamond_chest" },
    },
    {
      location: { lat: 40.7527, lng: -73.9772 }, // Grand Central Terminal area
      metadata: { type: "rare", value: 10, model: "golden_chest" },
    },
    {
      location: { lat: 40.7589, lng: -73.9851 }, // Bryant Park area
      metadata: { type: "common", value: 5, model: "wooden_chest" },
    },
    {
      location: { lat: 40.7484, lng: -73.9857 }, // Madison Square Garden area
      metadata: { type: "rare", value: 10, model: "golden_chest" },
    },
    {
      location: { lat: 40.7505, lng: -73.9934 }, // Penn Station area
      metadata: { type: "common", value: 5, model: "wooden_chest" },
    },
  ];

  for (const chest of chests) {
    await prisma.chest.create({
      data: chest,
    });
  }

  console.log(`✅ Created ${chests.length} chests`);
  console.log("🎉 Database seeded successfully!");
}

main()
  .catch((e) => {
    console.error("❌ Error seeding database:", e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
