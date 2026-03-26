import type { VercelRequest, VercelResponse } from "@vercel/node";
import { createClient } from "@supabase/supabase-js";

const asaasBaseUrl = (process.env.ASAAS_API_URL || "https://api.asaas.com/v3").replace(/\/+$/, "");

export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (req.method !== "POST") return res.status(405).send("Method Not Allowed");
  const secret = process.env.ASSAS_WEBHOOK_SECRET;
  if (!secret) return res.status(500).send("Missing ASSAS_WEBHOOK_SECRET");

  const headerToken =
    req.headers["asaas-access-token"] ||
    req.headers["x-webhook-token"] ||
    req.headers["x-asaas-token"] ||
    req.headers["authorization"];
  const tokenHeader = Array.isArray(headerToken) ? headerToken[0] : headerToken;
  const tokenFromHeader =
    typeof tokenHeader === "string" ? tokenHeader.replace(/^Bearer\s+/i, "").trim() : "";
  const tokenQuery = (req.query.token as string) || (req.query.auth as string);
  const token = tokenFromHeader || String(tokenQuery || "").trim();
  const expected = String(secret).trim();

  if (!token || token !== expected) return res.status(401).send("Invalid token");

  const apiKeyRaw = process.env.ASSAS_API_KEY;
  const supaUrl = process.env.SUPABASE_URL;
  const supaKey = process.env.SUPABASE_SERVICE_ROLE;
  if (!apiKeyRaw || !supaUrl || !supaKey) return res.status(500).send("Missing server environment variables");
  const apiKey = String(apiKeyRaw).replace(/^\$/, "").trim();

  const supabase = createClient(supaUrl, supaKey);

  const payloadObj =
    typeof req.body === "object" && req.body !== null ? (req.body as Record<string, unknown>) : {};
  const embeddedPayment = payloadObj["payment"];
  const paymentObj =
    typeof embeddedPayment === "object" && embeddedPayment !== null
      ? (embeddedPayment as Record<string, unknown>)
      : payloadObj;

  const paymentId = typeof paymentObj["id"] === "string" ? (paymentObj["id"] as string) : null;
  const customerId = typeof paymentObj["customer"] === "string" ? (paymentObj["customer"] as string) : null;
  const statusRaw = String(paymentObj["status"] ?? payloadObj["event"] ?? "").toLowerCase();
  const value = Number(paymentObj["value"] ?? paymentObj["amount"] ?? 0);
  const description = String(paymentObj["description"] ?? paymentObj["externalReference"] ?? "Assinatura");
  const receivedDate = String(
    paymentObj["confirmedDate"] ?? paymentObj["paymentDate"] ?? paymentObj["effectiveDate"] ?? new Date().toISOString(),
  );

  let confirmed = false;
  if (["confirmed", "received", "received_in_cash"].includes(statusRaw)) confirmed = true;

  let customerEmail: string | null = null;
  try {
    if (customerId) {
      const resp = await fetch(`${asaasBaseUrl}/customers/${customerId}`, {
        headers: { "User-Agent": "lingoabc", access_token: apiKey },
      });
      const j = await resp.json();
      customerEmail = typeof j?.email === "string" ? j.email : null;
    }
  } catch {
    customerEmail = null;
  }

  if (!customerEmail) {
    return res.status(200).json({ ok: true, info: "no_email", paymentId });
  }

  const { data: userRow } = await supabase.from("v_admin_users").select("user_id").eq("email", customerEmail).maybeSingle();
  const userId = userRow?.user_id ?? null;
  if (!userId) return res.status(200).json({ ok: true, info: "no_user", email: customerEmail });

  const planName = description;
  const { data: plan } = await supabase.from("plans").select("id,period_months,price").eq("name", planName).maybeSingle();
  const periodMonths = Number(plan?.period_months ?? 1);
  const planId = plan?.id ?? null;

  const start = new Date(receivedDate);
  const expires = new Date(start);
  expires.setMonth(expires.getMonth() + (periodMonths > 0 ? periodMonths : 1));

  const status = confirmed ? "active" : "pending";
  const amount = value || Number(plan?.price ?? 0);

  await supabase
    .from("subscriptions")
    .upsert({
      user_id: userId,
      plan_id: planId,
      status,
      value: amount,
      started_at: start.toISOString(),
      expires_at: expires.toISOString(),
    })
    .select();

  return res.status(200).json({ ok: true, userId, planId, status });
}
