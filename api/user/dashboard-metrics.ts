import type { VercelRequest, VercelResponse } from "@vercel/node";
import { createClient } from "@supabase/supabase-js";

const isAllowedOrigin = (origin: string) => {
  if (origin === "http://localhost:8080") return true;
  if (/^https:\/\/[a-z0-9-]+\.vercel\.app$/i.test(origin)) return true;
  if (origin === "https://www.lingoabc.com.br") return true;
  if (origin === "https://lingoabc.com.br") return true;
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

const isActiveStatus = (raw: string | null) => {
  const s = String(raw ?? "").toLowerCase().trim();
  return s === "active" || s === "ativa" || s === "ativo";
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

  const [planTry, lessonsTry, progressTry] = await Promise.all([
    supabaseAdmin.from("v_user_profile_plan").select("name,plan_name,subscription_status,expires_at").eq("user_id", requesterId).maybeSingle(),
    supabaseAdmin.from("lessons").select("id", { count: "exact", head: true }).eq("active", true),
    supabaseAdmin.from("user_activity_progress").select("status,score,created_at").eq("user_id", requesterId),
  ]);

  const welcomeName = String((planTry.data as { name?: string | null } | null)?.name ?? "estudante");

  let planName: string | null = (planTry.data as { plan_name?: string | null } | null)?.plan_name ?? null;
  let planStatus: string | null = (planTry.data as { subscription_status?: string | null } | null)?.subscription_status ?? null;
  if (!planTry.error && planName) {
    void 0;
  } else {
    const { data: subRow } = await supabaseAdmin
      .from("subscriptions")
      .select("status,expires_at,plans(name)")
      .eq("user_id", requesterId)
      .order("expires_at", { ascending: false, nullsFirst: false })
      .limit(1)
      .maybeSingle();
    const row = subRow as { status?: string | null; expires_at?: string | null; plans?: { name?: string | null } | null } | null;
    planName = row?.plans?.name ?? null;
    planStatus = row?.status ?? null;
  }

  const lessonsTotal = lessonsTry.count ?? 0;
  const rows = Array.isArray(progressTry.data) ? progressTry.data : [];
  const completed = rows.filter((r) => String((r as { status?: string | null }).status ?? "").toLowerCase().trim() === "completed");
  const completedActivities = completed.length;
  const points = completed.reduce((sum, r) => sum + Number((r as { score?: number | null }).score ?? 0), 0);

  const days = Array.from(new Set(completed.map((r) => new Date(String((r as { created_at?: string }).created_at ?? "")).toDateString())))
    .map((d) => new Date(d).getTime())
    .filter((t) => Number.isFinite(t))
    .sort((a, b) => b - a);
  let streakDays = 0;
  const cursor = new Date();
  cursor.setHours(0, 0, 0, 0);
  for (;;) {
    const time = cursor.getTime();
    if (days.includes(time)) {
      streakDays += 1;
      cursor.setDate(cursor.getDate() - 1);
    } else {
      break;
    }
  }

  const hasActivePlan = isActiveStatus(planStatus) && (!planTry.error ? true : true);

  return res.status(200).json({
    ok: true,
    welcomeName,
    planName,
    planStatus,
    hasActivePlan,
    lessonsTotal,
    completedActivities,
    points,
    streakDays,
  });
}
