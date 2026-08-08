import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  try {
    const twibbons = await prisma.twibbon.findMany();
    console.log("DB Data:", twibbons);
  } catch (error) {
    console.error("Error connecting to DB:", error);
  } finally {
    await prisma.$disconnect();
  }
}

main();
