/* eslint-disable @typescript-eslint/no-explicit-any */
import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/prisma";

export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ type: string; subtype: string }> }
) {
  try {
    const { type, subtype } = await params;
    
    // Pega o corpo da requisição (JSON puro enviado pelo Admin/Editor)
    const incomingValues = await req.json();

    // 1. Tenta encontrar o registro existente sem depender de índice único
    const existingRecord = await prisma.formData.findFirst({
      where: { 
        type: type,
        subtype: subtype 
      },
    });

    let record;

    if (existingRecord) {
      // 2. Se o registro já existe, atualizamos ele usando o ID único da tabela
      record = await prisma.formData.update({
        where: { id: existingRecord.id },
        data: {
          values: incomingValues,
        },
      });
    } else {
      // 3. Se não existe, criamos um novo do zero
      record = await prisma.formData.create({
        data: {
          type,
          subtype,
          values: incomingValues,
        },
      });
    }

    return NextResponse.json({ success: true, values: record.values });
  } catch (err: any) {
    console.error("RAW JSON API ERROR:", err);
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}