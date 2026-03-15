/* eslint-disable @typescript-eslint/no-explicit-any */
import { NextRequest, NextResponse } from "next/server";
import { analytics } from "@/lib/analytics";
import prisma from "@/lib/prisma";

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ subCompanyId: string }> }
) {
  try {
    const { subCompanyId } = await params;

    const subCompany = await prisma.subCompany.findUnique({
      where: { id: subCompanyId },
      select: { ga_id: true }
    });

    if (!subCompany || !subCompany.ga_id) {
      throw new Error(`Filial sem GA_ID cadastrado. ID buscado: ${subCompanyId}`);
    }

    const propertyString = `properties/${subCompany.ga_id.trim()}`;

    const [response] = await analytics.runReport({
      property: propertyString,
      dateRanges: [{ startDate: "2020-01-01", endDate: "today" }],
      dimensions: [{ name: "date" }],
      metrics: [
        { name: "activeUsers" },
        { name: "sessions" },
        { name: "screenPageViews" },
        { name: "engagedSessions" },
      ],
      orderBys: [{ dimension: { dimensionName: "date" } }],
    });

      const data = response.rows?.map((row) => {
      const rawDate = row.dimensionValues?.[0]?.value ?? "";

      const [
        activeUsers,
        sessions,
        pageViews,
        engagedSessions,
      ] = row.metricValues?.map(m => Number(m.value)) ?? [];

      return {
        date: `${rawDate.slice(6, 8)}/${rawDate.slice(4, 6)}`,
        activeUsers,
        sessions,
        pageViews,
        engagedSessions,
      };
    }) ?? [];

    return NextResponse.json(data);

  } catch (error: any) {
    console.error("\n[ERRO FATAL ANALYTICS]:", error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}