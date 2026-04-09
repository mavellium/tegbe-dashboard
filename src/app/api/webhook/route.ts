/* eslint-disable @typescript-eslint/no-explicit-any */
import { NextRequest, NextResponse } from "next/server";

export async function POST(req: NextRequest) {
  try {
    const { slug } = await req.json();

    const response = await fetch("https://tegbe.com.br/api/revalidate", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "x-webhook-secret": process.env.WEBHOOK_SECRET || ""
      },
      body: JSON.stringify({ slug })
    });

    if (!response.ok) {
       const errorText = await response.text();
       return NextResponse.json({ error: "Falha no webhook externo", details: errorText }, { status: response.status });
    }
    return NextResponse.json({ success: true, message: "Revalidação concluída" });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}