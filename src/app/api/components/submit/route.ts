/* eslint-disable @typescript-eslint/no-explicit-any */
import { NextResponse } from "next/server";
import prisma from '@/lib/prisma'

export async function POST(req: Request) {
  try {
    // Como é um form HTML padrão, lemos o formData
    const formData = await req.formData();
    const dataObj: Record<string, any> = {};
    let componentId = "";

    formData.forEach((value, key) => {
      if (key === "componentId") {
        componentId = value.toString();
      } else {
        dataObj[key] = value;
      }
    });

    if (!componentId) {
      return NextResponse.json({ error: "Componente não identificado." }, { status: 400 });
    }

    // Salva na nossa nova tabela genérica
    const submission = await prisma.componentData.create({
      data: {
        componentId: componentId,
        data: dataObj,
      },
    });

    // Idealmente você redirecionaria de volta com um param ?success=true
    // Ou retornaria um HTML de sucesso dependendo da sua arquitetura
    return NextResponse.json({ success: true, submission }, { status: 201 });
  } catch (error) {
    console.error("Erro ao processar envio do formulário:", error);
    return NextResponse.json({ success: false, error: "Erro ao processar envio" }, { status: 500 });
  }
}