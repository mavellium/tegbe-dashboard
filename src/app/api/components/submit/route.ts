/* eslint-disable @typescript-eslint/no-explicit-any */
import { NextResponse } from "next/server";
import prisma from '@/lib/prisma'; 

export async function POST(req: Request) {
  try {
    const formData = await req.formData();
    const dataObj: Record<string, any> = {};
    let componentId = "";
    let componentName = "";

    // Mapeia todos os campos recebidos
    formData.forEach((value, key) => {
      if (key === "componentId") componentId = value.toString();
      else if (key === "componentName") componentName = value.toString();
      else dataObj[key] = value;
    });

    if (!componentId) {
      return NextResponse.json({ error: "Componente não identificado." }, { status: 400 });
    }

    // Salva na tabela genérica injetando o nome do componente dentro do JSON para fácil leitura futura
    const submission = await prisma.componentData.create({
      data: {
        componentId: componentId,
        data: { 
          _origem: componentName || "Formulário Desconhecido", 
          ...dataObj 
        },
      },
    });

    return NextResponse.json({ success: true, submission }, { status: 201 });
  } catch (error) {
    console.error("Erro ao processar envio do formulário:", error);
    return NextResponse.json({ success: false, error: "Erro ao processar envio" }, { status: 500 });
  }
}