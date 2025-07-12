import { PrismaClient } from "@prisma/client";

declare global {
	var prisma: PrismaClient | undefined;
}

export const prisma =
	globalThis.prisma ||
	new PrismaClient({
		log: process.env.NODE_ENV === "development" ? ["query", "error", "warn"] : ["error"],
	});

if (process.env.NODE_ENV !== "production") {
	globalThis.prisma = prisma;
}

export async function testDatabaseConnection(): Promise<boolean> {
  try {
    await prisma.$queryRaw`SELECT 1`;
    return true;
  } catch (error) {
    console.error("Database connection test failed:", error);
    return false;
  }
}

process.on("beforeExit", async () => {
	await prisma.$disconnect();
});

// Cleanup handlers
const cleanup = async () => {
  await prisma.$disconnect();
};

process.on("beforeExit", cleanup);
process.on("SIGTERM", cleanup);
process.on("SIGINT", cleanup);
