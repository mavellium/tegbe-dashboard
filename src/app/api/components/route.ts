import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";

export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const id = searchParams.get("id");

    if (id) {
      const component = await prisma.component.findUnique({ where: { id } });
      return NextResponse.json({ success: true, component }, { status: 200 });
    } else {
      // Na listagem, excluímos o HTML para economizar banda (só carregamos nome e ID)
      const components = await prisma.component.findMany({
        orderBy: { updatedAt: "desc" },
        select: { id: true, name: true, updatedAt: true } 
      });
      return NextResponse.json({ success: true, components }, { status: 200 });
    }
  } catch (error) {
    console.error("Erro ao buscar componentes:", error);
    return NextResponse.json({ success: false, error: "Erro interno" }, { status: 500 });
  }
}

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { id, name, html, config } = body;

    let component;

    if (id) {
      component = await prisma.component.update({
        where: { id },
        data: { 
          name: name || "Formulário", 
          html: html,      // Salva o HTML
          config: config   // Salva a estrutura do construtor
        },
      });
    } else {
      component = await prisma.component.create({
        data: { 
          name: name || "Formulário Novo", 
          html: html,      // Salva o HTML
          config: config 
        },
      });
    }

    // Injeção de ID para o Action do Form (Muito Importante)
    if (component.html && component.html.includes("{{COMPONENT_ID}}")) {
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