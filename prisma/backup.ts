/* eslint-disable @typescript-eslint/no-explicit-any */
import "dotenv/config";
import prisma from "../src/lib/prisma";
import fs from "fs";
import path from "path";

async function backup() {
  const outputDir = path.join(process.cwd(), "backups");

  if (!fs.existsSync(outputDir)) {
    fs.mkdirSync(outputDir);
  }

  const timestamp = new Date().toISOString().replace(/[:.]/g, "-");

  const data: any = {};

  const runtime = (prisma as any)._runtimeDataModel.models;

  for (const modelName of Object.keys(runtime)) {
    try {
      const tableName =
        runtime[modelName].dbName ??
        runtime[modelName].mappedName ??
        modelName;

      const rows = await prisma.$queryRawUnsafe(
        `SELECT * FROM "public"."${tableName}"`
      );

      data[modelName] = rows;

      console.log("backup:", modelName, "->", tableName);
    } catch (err) {
      console.error("erro:", modelName);
    }
  }

  const file = path.join(outputDir, `backup-${timestamp}.json`);

  fs.writeFileSync(file, JSON.stringify(data, null, 2));

  console.log("✅ Backup criado:", file);

  await prisma.$disconnect();
}

backup();