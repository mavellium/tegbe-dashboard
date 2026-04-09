/* eslint-disable @typescript-eslint/no-explicit-any */
import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { createPageHistory } from "@/lib/page-history";

export async function GET(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params;
    
    const page = await prisma.page.findUnique({
      where: { id }
    });

    if (!page) {
      return NextResponse.json({ error: "Página não encontrada" }, { status: 404 });
    }

    return NextResponse.json(page);
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

export async function PUT(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params;
    const data = await req.json();
    
    const safeFormData = data.formData ?? {};

    const page = await prisma.page.update({
      where: { id },
      data: {
        title: data.title,
        subtitle: data.subtitle,
        icon: data.icon,
        endpoint: data.endpoint,
        formData: safeFormData,
        subCompanyId: data.subCompanyId
      }
    });
    await createPageHistory(page, "UPDATED");
    return NextResponse.json(page);
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

export async function DELETE(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params;

    const page = await prisma.page.findUnique({ where: { id } });
    if (!page) {
      return NextResponse.json({ error: "Página não encontrada" }, { status: 404 });
    }

    const lastEntry = await prisma.pageHistory.findFirst({
      where: { pageId: id },
      orderBy: { version: "desc" },
      select: { version: true },
    });
    const nextVersion = (lastEntry?.version ?? 0) + 1;

    await prisma.page.delete({ where: { id } });

    await prisma.pageHistory.create({
      data: {
        pageId: null,
        title: page.title,
        subtitle: page.subtitle,
        icon: page.icon,
        endpoint: page.endpoint,
        formData: page.formData as any,
        subCompanyId: page.subCompanyId,
        version: nextVersion,
        action: "DELETED",
        snapshot: {
          id: page.id,
          title: page.title,
          subtitle: page.subtitle,
          icon: page.icon,
          endpoint: page.endpoint,
          formData: page.formData as any,
          subCompanyId: page.subCompanyId,
          createdAt: page.createdAt,
          updatedAt: page.updatedAt,
        },
      },
    });

    return NextResponse.json({ success: true });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}