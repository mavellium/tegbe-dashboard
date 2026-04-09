/* eslint-disable @typescript-eslint/no-explicit-any */
import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { createPageHistory } from "@/lib/page-history";

function parseEndpoint(endpoint: string): { subtype: string; type: string } | null {
  // Formato: /api/[subtype]/json/[type]
  const parts = endpoint.split("/").filter(Boolean);
  // parts = ["api", subtype, "json", type]
  if (parts.length >= 4 && parts[0] === "api" && parts[2] === "json") {
    return { subtype: parts[1], type: parts[3] };
  }
  return null;
}

export async function POST(req: NextRequest, { params }: { params: Promise<{ historyId: string }> }) {
  try {
    const { historyId } = await params;

    const entry = await prisma.pageHistory.findUnique({
      where: { id: historyId },
    });

    if (!entry) {
      return NextResponse.json({ error: "Registro de histórico não encontrado." }, { status: 404 });
    }

    const snapshot = entry.snapshot as any;

    const existingPage = entry.pageId
      ? await prisma.page.findUnique({ where: { id: entry.pageId } })
      : null;

    const pageBySnapshotId = !existingPage && snapshot?.id
      ? await prisma.page.findUnique({ where: { id: snapshot.id } })
      : null;

    const targetPage = existingPage || pageBySnapshotId;

    let restoredPage;

    if (targetPage) {
      restoredPage = await prisma.page.update({
        where: { id: targetPage.id },
        data: {
          title: snapshot.title,
          subtitle: snapshot.subtitle,
          icon: snapshot.icon,
          endpoint: snapshot.endpoint,
          formData: snapshot.formData ?? {},
          subCompanyId: snapshot.subCompanyId,
        },
      });
    } else {
      const subCompanyExists = await prisma.subCompany.findUnique({
        where: { id: snapshot.subCompanyId },
      });

      if (!subCompanyExists) {
        return NextResponse.json(
          { error: "Não é possível restaurar: a filial vinculada não existe mais." },
          { status: 400 }
        );
      }

      restoredPage = await prisma.page.create({
        data: {
          title: snapshot.title,
          subtitle: snapshot.subtitle,
          icon: snapshot.icon,
          endpoint: snapshot.endpoint,
          formData: snapshot.formData ?? {},
          subCompanyId: snapshot.subCompanyId,
        },
      });
    }

    // Sincronizar a tabela FormData do endpoint com os dados restaurados
    const endpointInfo = parseEndpoint(restoredPage.endpoint);
    if (endpointInfo && snapshot.formData) {
      const existingFormData = await prisma.formData.findFirst({
        where: { type: endpointInfo.type, subtype: endpointInfo.subtype },
      });

      if (existingFormData) {
        await prisma.formData.update({
          where: { id: existingFormData.id },
          data: { values: snapshot.formData },
        });
      } else {
        await prisma.formData.create({
          data: {
            type: endpointInfo.type,
            subtype: endpointInfo.subtype,
            values: snapshot.formData,
          },
        });
      }
    }

    await createPageHistory(restoredPage, "UPDATED");

    return NextResponse.json(restoredPage);
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
