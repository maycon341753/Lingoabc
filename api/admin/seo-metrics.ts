import type { VercelRequest, VercelResponse } from "@vercel/node";
import { createClient } from "@supabase/supabase-js";

const isAllowedOrigin = (origin: string) => {
  if (origin === "http://localhost:8080") return true;
  if (/^https:\/\/[a-z0-9-]+\.vercel\.app$/i.test(origin)) return true;
  if (origin === "https://www.lingoabc.com.br") return true;
  return false;
};

const pickFirstHeader = (v: string | string[] | undefined) => (Array.isArray(v) ? v[0] : v);
const isString = (v: unknown): v is string => typeof v === "string";
const isRecord = (v: unknown): v is Record<string, unknown> => typeof v === "object" && v !== null;
const isUuid = (v: string) => /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i.test(v);

const decodeJwtPayload = (token: string) => {
  try {
    const part = token.split(".")[1] ?? "";
    const normalized = part.replace(/-/g, "+").replace(/_/g, "/").padEnd(Math.ceil(part.length / 4) * 4, "=");
    const json = Buffer.from(normalized, "base64").toString("utf8");
    const obj = JSON.parse(json) as unknown;
    return isRecord(obj) ? obj : null;
  } catch {
    return null;
  }
};

const decodeJwtRole = (token: string) => {
  const payload = decodeJwtPayload(token);
  const role = typeof payload?.role === "string" ? String(payload.role) : "";
  return role || null;
};

const normalizeRole = (raw: unknown) => {
  const s = String(raw ?? "").toLowerCase().trim();
  const norm = s.replace(/[^a-z0-9]+/g, "_").replace(/^_+|_+$/g, "");
  return norm === "superadmin" ? "super_admin" : norm;
};

const safeStr = (v: unknown, maxLen: number) => String(v ?? "").trim().slice(0, maxLen);

const normalizeReferrer = (ref: string | null) => {
  const raw = safeStr(ref, 300);
  if (!raw) return "Direto";
  try {
    const u = new URL(raw);
    return u.hostname || raw;
  } catch {
    return raw;
  }
};

const clickLabelFromMeta = (meta: Record<string, unknown> | null) => {
  if (!meta) return null;
  const tag = safeStr(meta.tag, 20).toLowerCase();
  const text = safeStr(meta.text, 80);
  const href = safeStr(meta.href, 200);
  if (!text) return null;
  const suffix = href ? ` • ${href}` : "";
  if (tag === "a" || tag === "button") return `${text}${suffix}`;
  return text;
};

type AppEventRow = {
  id: number;
  created_at: string;
  event_type: string;
  path: string | null;
  title: string | null;
  referrer: string | null;
  session_id: string | null;
  user_id: string | null;
  metadata: Record<string, unknown> | null;
};

export default async function handler(req: VercelRequest, res: VercelResponse) {
  const origin = pickFirstHeader(req.headers.origin);
  if (origin && isAllowedOrigin(origin)) {
    res.setHeader("Access-Control-Allow-Origin", origin);
    res.setHeader("Vary", "Origin");
    res.setHeader("Access-Control-Allow-Methods", "POST, OPTIONS");
    res.setHeader("Access-Control-Allow-Headers", "Content-Type, Authorization");
  }

  if (req.method === "OPTIONS") return res.status(204).end();
  if (req.method !== "POST") return res.status(405).json({ error: "method_not_allowed" });

  const supaUrlRaw = process.env.SUPABASE_URL;
  const supaServiceKeyRaw = process.env.SUPABASE_SERVICE_ROLE;
  if (!supaUrlRaw || !supaServiceKeyRaw) {
    return res.status(500).json({ error: "missing_server_env", required: ["SUPABASE_URL", "SUPABASE_SERVICE_ROLE"] });
  }
  const supaUrl = String(supaUrlRaw).trim();
  const supaServiceKey = String(supaServiceKeyRaw).trim();
  if (decodeJwtRole(supaServiceKey) !== "service_role") {
    return res.status(500).json({ error: "invalid_server_env", invalid: ["SUPABASE_SERVICE_ROLE"] });
  }

  const authHeader = pickFirstHeader(req.headers.authorization);
  const token = isString(authHeader) ? authHeader.replace(/^Bearer\\s+/i, "").trim() : "";
  if (!token) return res.status(401).json({ error: "missing_authorization" });

  const payload = decodeJwtPayload(token);
  const requesterIdRaw = isString(payload?.sub) ? String(payload.sub) : "";
  const requesterId = requesterIdRaw && isUuid(requesterIdRaw) ? requesterIdRaw : "";
  if (!requesterId) return res.status(401).json({ error: "invalid_user_token" });

  const supabaseAdmin = createClient(supaUrl, supaServiceKey);
  const { data: profileRow, error: profileErr } = await supabaseAdmin.from("profiles").select("role").eq("id", requesterId).maybeSingle();
  if (profileErr) return res.status(403).json({ error: "not_allowed" });
  const role = normalizeRole((profileRow as { role?: unknown } | null)?.role);
  const isAdmin = role === "admin" || role.startsWith("super_admin");
  if (!isAdmin) return res.status(403).json({ error: "not_allowed" });

  const since24hIso = new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString();
  const since5mIso = new Date(Date.now() - 5 * 60 * 1000).toISOString();

  const [ev24Res, ev5Res] = await Promise.all([
    supabaseAdmin
      .from("app_events")
      .select("id,created_at,event_type,path,title,referrer,session_id,user_id,metadata")
      .gte("created_at", since24hIso)
      .order("created_at", { ascending: false })
      .limit(5000),
    supabaseAdmin.from("app_events").select("session_id,created_at").gte("created_at", since5mIso).order("created_at", { ascending: false }).limit(2000),
  ]);

  if (ev24Res.error) return res.status(500).json({ error: "app_events_read_failed", message: ev24Res.error.message });
  if (ev5Res.error) return res.status(500).json({ error: "app_events_read_failed", message: ev5Res.error.message });

  const rows24 = ((ev24Res.data ?? []) as AppEventRow[]) ?? [];
  const rows5 = ((ev5Res.data ?? []) as { session_id: string | null }[]) ?? [];

  const pageViews24h: Record<string, number> = {};
  const clicks24h: Record<string, number> = {};
  const topButtons24h: Record<string, number> = {};
  const topReferrers24h: Record<string, number> = {};

  for (const r of rows24) {
    const path = String(r.path ?? "").trim() || "—";
    if (r.event_type === "page_view") pageViews24h[path] = (pageViews24h[path] ?? 0) + 1;
    if (r.event_type === "click") clicks24h[path] = (clicks24h[path] ?? 0) + 1;
    const refKey = normalizeReferrer(r.referrer);
    topReferrers24h[refKey] = (topReferrers24h[refKey] ?? 0) + 1;
    if (r.event_type === "click") {
      const label = clickLabelFromMeta(r.metadata);
      if (label) topButtons24h[label] = (topButtons24h[label] ?? 0) + 1;
    }
  }

  const sessions = new Set<string>();
  for (const r of rows5) {
    const sid = String(r.session_id ?? "").trim();
    if (sid) sessions.add(sid);
  }

  return res.status(200).json({
    ok: true,
    activeSessions5m: sessions.size,
    events24h: rows24.length,
    pageViews24h,
    clicks24h,
    topButtons24h,
    topReferrers24h,
    lastEvents: rows24.slice(0, 25),
  });
}

