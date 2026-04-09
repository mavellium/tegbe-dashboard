/* eslint-disable @typescript-eslint/no-explicit-any */
import { NextRequest, NextResponse } from "next/server";
import { revalidatePath, revalidateTag } from "next/cache";
import { extractSlugFromPath } from "@/lib/revalidate";

/**
 * POST /api/revalidate
 *
 * Webhook de revalidação On-Demand disparado pelo CMS sempre que um
 * conteúdo é criado, editado ou deletado.
 *
 * Headers obrigatórios:
 *   Content-Type: application/json
 *   x-webhook-secret: <WEBHOOK_SECRET>
 *
 * Body aceito:
 *   { "slug": "meta-sobre" }
 *   { "slugs": ["home", "faq-home"] }
 *   { "slug": "/api/itc-tegbe/json/meta-sobre" }  // extrai automaticamente
 */
export async function POST(req: NextRequest) {
  // 1. Valida secret
  const secret = req.headers.get("x-webhook-secret");
  if (!secret || secret !== process.env.WEBHOOK_SECRET) {
    return NextResponse.json({ error: "Invalid secret" }, { status: 401 });
  }

  // 2. Valida payload
  let body: any;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON" }, { status: 400 });
  }

  // 3. Normaliza slugs (aceita { slug } ou { slugs })
  const rawSlugs: string[] = [];
  if (typeof body?.slug === "string" && body.slug.trim()) rawSlugs.push(body.slug.trim());
  if (Array.isArray(body?.slugs)) {
    for (const s of body.slugs) {
      if (typeof s === "string" && s.trim()) rawSlugs.push(s.trim());
    }
  }

  if (rawSlugs.length === 0) {
    return NextResponse.json({ error: "Missing slug" }, { status: 400 });
  }

  // 4. Extrai último segmento quando vier um path completo
  const slugs = Array.from(
    new Set(
      rawSlugs
        .map((s) => (s.includes("/") ? extractSlugFromPath(s) : s))
        .filter((s): s is string => !!s)
    )
  );

  if (slugs.length === 0) {
    return NextResponse.json({ error: "Missing slug" }, { status: 400 });
  }

  // 5. Revalida cada slug (path + tag)
  const results: { slug: string; ok: boolean; error?: string }[] = [];
  for (const slug of slugs) {
    try {
      // Revalida a rota pública do slug e também a raiz (caso home).
      revalidatePath(`/${slug}`);
      if (slug === "home") revalidatePath("/");
      // Tag opcional para quem preferir fetch({ next: { tags: [slug] } })
      // Next.js 16 exige um profile; expire:0 força invalidação imediata.
      revalidateTag(slug, { expire: 0 });
      console.log(`[Webhook] Revalidated: ${slug}`);
      results.push({ slug, ok: true });
    } catch (err: any) {
      console.error(`[Webhook] Error revalidating: ${slug} — ${err?.message ?? err}`);
      results.push({ slug, ok: false, error: err?.message ?? String(err) });
    }
  }

  // 6. Resposta
  if (slugs.length === 1) {
    return NextResponse.json({ revalidated: true, slug: slugs[0] });
  }
  return NextResponse.json({ revalidated: true, slugs, results });
}
