import fs from "fs";

process.env.DATABASE_URL =
  process.env.DATABASE_URL ??
  "postgresql://neondb_owner:npg_RlvG2TfPs4wF@ep-round-cell-a4586o3m-pooler.us-east-1.aws.neon.tech/neondb?sslmode=require&pgbouncer=true";

import { PrismaClient } from "@/app/generated/prisma/client";
import { PrismaPg } from "@prisma/adapter-pg";

const adapter = new PrismaPg({
  connectionString: process.env.DATABASE_URL,
});

const prisma = new PrismaClient({
  adapter,
});

const BACKUP_FILE = "./backups/backup-final-mesclado.json";

// 1. TABELAS QUE SERÃO RESTAURADAS (Ordem de inserção: Pais antes dos Filhos)
// NOTA: "User", "Company" e "SubCompany" não estão aqui para serem protegidas!
const TABLES_TO_RESTORE = [
  "BlogCategory",
  "BlogTag",
  "FormData",
  "Component",
  "ComponentData",
  "Page",
  "BlogPost",
  "BlogPostTag"
];

async function main() {
  console.log("📦 Lendo arquivo de backup mesclado...");

  try {
    const rawData = fs.readFileSync(BACKUP_FILE, "utf-8");
    const backup = JSON.parse(rawData);

    // 2. APAGAR DADOS ANTIGOS (Ordem reversa para evitar erro de Relacionamento/FK)
    console.log("\n🧹 Limpando dados existentes (Protegendo Usuários e Empresas)...");
    const TABLES_TO_DELETE = [...TABLES_TO_RESTORE].reverse();
    
    for (const tableName of TABLES_TO_DELETE) {
      const modelName = tableName.charAt(0).toLowerCase() + tableName.slice(1);
      const delegate = prisma[modelName as keyof typeof prisma] as any;
      
      if (delegate) {
        try {
          await delegate.deleteMany({});
          console.log(`   🗑️ Limpou: ${tableName}`);
        } catch (err: any) {
          console.log(`   ⚠️ Erro ao limpar ${tableName}: ${err.message}`);
        }
      }
    }

    console.log("\n🚀 Iniciando inserção dos dados do backup...");

    // 3. INSERIR NOVOS DADOS (Ordem normal)
    for (const tableName of TABLES_TO_RESTORE) {
      if (!backup[tableName] || backup[tableName].length === 0) {
        console.log(`   ⏭️ Pulando ${tableName} (vazia ou não encontrada no backup)`);
        continue;
      }

      const modelName = tableName.charAt(0).toLowerCase() + tableName.slice(1);
      const delegate = prisma[modelName as keyof typeof prisma] as any;

      if (!delegate) continue;

      // Limpa os dados do backup: Remove objetos de relacionamento "pendurados"
      // no JSON para que o createMany não quebre, mas mantém os campos JSON reais.
      const dataToInsert = backup[tableName].map((record: any) => {
        const cleanRecord: any = {};
        for (const key in record) {
          if (record[key] !== null && typeof record[key] === "object" && !Array.isArray(record[key])) {
            // Se for um campo de JSON legítimo do banco, nós mantemos:
            if (["formData", "config", "data", "theme", "menuItems", "values"].includes(key)) {
              cleanRecord[key] = record[key];
            }
          } else {
            cleanRecord[key] = record[key];
          }
        }
        return cleanRecord;
      });

      try {
        await delegate.createMany({
          data: dataToInsert,
          skipDuplicates: true, // Previne quebras caso algo já exista
        });
        console.log(`   ✅ ${tableName}: ${dataToInsert.length} registros restaurados`);
      } catch (err: any) {
        console.error(`   ❌ Erro ao restaurar ${tableName}:`, err.message);
      }
    }

    console.log("\n🎉 Restauração concluída! Banco substituído pelo backup preservando dados sensíveis.");
  } catch (error) {
    console.error("❌ Erro na restauração:", error);
  } finally {
    await prisma.$disconnect();
  }
}

main();