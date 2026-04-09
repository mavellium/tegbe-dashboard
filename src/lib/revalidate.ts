/* eslint-disable @typescript-eslint/no-explicit-any */

/**
 * Extrai o último segmento (slug) de um caminho.
 *
 * Exemplos:
 *   /api/itc-tegbe/json/meta-sobre          → "meta-sobre"
 *   /api/site-a/json/home                   → "home"
 *   /api/site-b/json/faq-home/              → "faq-home"
 *   /api/site-b/json/faq-home?draft=true    → "faq-home"
 *   /api/site-b/json/                       → null
 */
export function extractSlugFromPath(path: string): string | null {
  if (!path) return null;
  const clean = path.split("?")[0].replace(/\/$/, "");
  const parts = clean.split("/");
  return parts[parts.length - 1] || null;
}

type RevalidatePayload = { slug?: string | null; slugs?: (string | null | undefined)[] };

/**
 * Dispara o webhook de revalidação para o frontend Next.js.
 *
 * Nunca lança exceção: erros são apenas logados para não bloquear o salvamento no CMS.
 * Executa em "fire-and-forget" quando chamado sem await.
 */
export async function triggerRevalidate(payload: RevalidatePayload): Promise<void> {
  const url = process.env.REVALIDATE_URL;
  const secret = process.env.WEBHOOK_SECRET;

  if (!url || !secret) {
    console.warn("[Webhook] REVALIDATE_URL ou WEBHOOK_SECRET não configurados — revalidação ignorada");
    return;
  }

  // Normaliza slugs: aceita { slug } ou { slugs } e remove nulos/duplicados
  const rawSlugs: string[] = [];
  if (payload.slug) rawSlugs.push(payload.slug);
  if (Array.isArray(payload.slugs)) {
    for (const s of payload.slugs) if (s) rawSlugs.push(s);
  }
  const slugs = Array.from(new Set(rawSlugs.filter(Boolean)));

  if (slugs.length === 0) {
    console.warn("[Webhook] Nenhum slug válido — revalidação ignorada");
    return;
  }

  const body = slugs.length === 1 ? { slug: slugs[0] } : { slugs };

  try {
    const res = await fetch(url, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "x-webhook-secret": secret,
      },
      body: JSON.stringify(body),
      // Evita bloquear por muito tempo caso o frontend esteja lento
      signal: AbortSignal.timeout(5000),
    });

    if (!res.ok) {
      console.error(`[Webhook] Error revalidating: ${slugs.join(",")} — status ${res.status}`);
      return;
    }

    for (const s of slugs) console.log(`[Webhook] Revalidated: ${s}`);
  } catch (err: any) {
    console.error(`[Webhook] Error revalidating: ${slugs.join(",")} — ${err?.message ?? err}`);
  }
}

/**
 * Versão "fire-and-forget": dispara o webhook sem bloquear o chamador.
 * Use quando não quiser aguardar a resposta do frontend.
 */
export function triggerRevalidateAsync(payload: RevalidatePayload): void {
  // Promise sem await — erros são capturados dentro de triggerRevalidate
  void triggerRevalidate(payload);
}
