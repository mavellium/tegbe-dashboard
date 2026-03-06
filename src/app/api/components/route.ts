import { PrismaClient } from "@/app/generated/prisma/client";
import { NextResponse } from "next/server";
import prisma from '@/lib/prisma'

// GET: Busca o componente (Neste exemplo, busca o último modificado)
export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const id = searchParams.get("id");

    let component;
    if (id) {
      component = await prisma.component.findUnique({ where: { id } });
    } else {
      // Se não passar ID, pega o último formulário criado/editado (útil se você tiver apenas 1 form global por enquanto)
      component = await prisma.component.findFirst({
        orderBy: { updatedAt: "desc" },
      });
    }

    return NextResponse.json({ success: true, component }, { status: 200 });
  } catch (error) {
    console.error("Erro ao buscar componente:", error);
    return NextResponse.json({ success: false, error: "Erro ao buscar dados" }, { status: 500 });
  }
}

// POST: Cria ou Atualiza o componente
export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { id, name, html, config, formDataId } = body;

    let component;

    if (id) {
      // Se enviou ID, atualiza o existente
      component = await prisma.component.update({
        where: { id },
        data: {
          name: name || "Formulário",
          html: html,
          config: config,
          ...(formDataId && { formDataId }),
        },
      });
    } else {
      // Se não enviou ID, cria um novo
      component = await prisma.component.create({
        data: {
          name: name || "Formulário Novo",
          html: html,
          config: config,
          ...(formDataId && { formDataId }),
        },
      });
    }

    // Injeta o ID real no HTML gerado para o relacionamento do banco funcionar
    if (component.html.includes("{{COMPONENT_ID}}")) {
      const updatedHtml = component.html.replace(/{{COMPONENT_ID}}/g, component.id);
      
      component = await prisma.component.update({
        where: { id: component.id },
        data: { html: updatedHtml }
      });
    }

    return NextResponse.json({ success: true, component }, { status: 200 });
  } catch (error) {
    console.error("Erro ao salvar componente:", error);
    return NextResponse.json({ success: false, error: "Erro interno no servidor" }, { status: 500 });
  }
}