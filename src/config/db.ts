import { PrismaClient } from "@prisma/client";
import { PrismaPg } from "@prisma/adapter-pg";
import { config } from "./env";

const adapter = new PrismaPg({ connectionString: config.databaseUrl });
const prisma = new PrismaClient({ adapter });

export default prisma;
