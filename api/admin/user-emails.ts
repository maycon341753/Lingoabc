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
    if (isRecord(obj)) return obj;
    return null;
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
  if (!/^https:\/\/.+\.supabase\.co\/?$/i.test(supaUrl)) {
    return res.status(500).json({ error: "invalid_server_env", invalid: ["SUPABASE_URL"] });
  }
  if (decodeJwtRole(supaServiceKey) !== "service_role") {
    return res.status(500).json({ error: "invalid_server_env", invalid: ["SUPABASE_SERVICE_ROLE"] });
  }

  const authHeader = pickFirstHeader(req.headers.authorization);
  const token = isString(authHeader) ? authHeader.replace(/^Bearer\s+/i, "").trim() : "";
  if (!token) return res.status(401).json({ error: "missing_authorization" });

  const payload = decodeJwtPayload(token);
  const requesterIdRaw = isString(payload?.sub) ? String(payload.sub) : "";
  const requesterId = requesterIdRaw && isUuid(requesterIdRaw) ? requesterIdRaw : "";
  if (!requesterId) return res.status(401).json({ error: "invalid_user_token" });

  const supabaseAdmin = createClient(supaUrl, supaServiceKey);
  const { data: profileRow, error: profileErr } = await supabaseAdmin
    .from("profiles")
    .select("role")
    .eq("id", requesterId)
    .maybeSingle();
  if (profileErr) return res.status(403).json({ error: "not_allowed" });
  const role = normalizeRole((profileRow as { role?: unknown } | null)?.role);
  const isAdmin = role === "admin" || role.startsWith("super_admin");
  if (!isAdmin) return res.status(403).json({ error: "not_allowed" });

  const body = isRecord(req.body) ? (req.body as Record<string, unknown>) : {};
  const userIdsRaw = Array.isArray(body.userIds) ? (body.userIds as unknown[]) : [];
  const userIds = userIdsRaw
    .map((v) => (isString(v) ? v.trim() : ""))
    .filter((v) => v && isUuid(v))
    .slice(0, 50);
  if (userIds.length === 0) return res.status(400).json({ error: "missing_userIds" });

  const emails: Record<string, string> = {};
  const missing: string[] = [];
  for (const uid of userIds) {
    try {
      const r = await supabaseAdmin.auth.admin.getUserById(uid);
      const email = String(r.data?.user?.email ?? "").trim();
      if (email) emails[uid] = email;
      else missing.push(uid);
    } catch {
      missing.push(uid);
    }
  }

  return res.status(200).json({ ok: true, emails, missing });
}

