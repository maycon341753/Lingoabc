import { motion } from "framer-motion";
import { useEffect, useMemo, useState } from "react";
import { supabase } from "@/lib/supabase";

type SubscriptionRow = {
  value: number | null;
  status: string | null;
  plan_id: string | null;
  started_at?: string | null;
  created_at?: string | null;
};

type PlanRow = {
  id: string;
  name: string | null;
  price: number | null;
};

type ReferralAggRow = {
  clicks_count: number | null;
  conversions_count: number | null;
  commission_due: number | null;
};

type RevenueBar = {
  planLabel: string;
  pct: number;
  value: number;
  color: string;
};

type GrowthBar = {
  month: string;
  users: number;
};

const isPaidStatus = (raw: string | null) => {
  const s = String(raw ?? "").toLowerCase().trim();
  return s === "active" || s === "ativa" || s === "confirmed" || s === "received" || s === "paid";
};

const fmtMoney = (n: number) =>
  new Intl.NumberFormat("pt-BR", { style: "currency", currency: "BRL" }).format(Number.isFinite(n) ? n : 0);

const fmtPct = (n: number) => `${(Number.isFinite(n) ? n : 0).toFixed(1)}%`;

const monthLabel = (d: Date) =>
  new Intl.DateTimeFormat("pt-BR", { month: "long" }).format(d).replace(/^./, (c) => c.toUpperCase());

const monthKey = (d: Date) => `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}`;

const ReportsPage = () => {
  const [loading, setLoading] = useState(true);
  const [loadError, setLoadError] = useState<string | null>(null);
  const [revenueBars, setRevenueBars] = useState<RevenueBar[]>([]);
  const [growthBars, setGrowthBars] = useState<GrowthBar[]>([]);
  const [revenue12m, setRevenue12m] = useState<number>(0);
  const [paidCount12m, setPaidCount12m] = useState<number>(0);
  const [commissionDue, setCommissionDue] = useState<number>(0);
  const [conversionRate, setConversionRate] = useState<number>(0);

  const now = useMemo(() => new Date(), []);
  const monthStartIso = useMemo(() => new Date(now.getFullYear(), now.getMonth(), 1).toISOString(), [now]);
  const start12mIso = useMemo(() => {
    const d = new Date(now);
    d.setMonth(d.getMonth() - 12);
    return d.toISOString();
  }, [now]);
  const start6mIso = useMemo(() => {
    const d = new Date(now);
    d.setMonth(d.getMonth() - 5);
    d.setDate(1);
    d.setHours(0, 0, 0, 0);
    return d.toISOString();
  }, [now]);

  useEffect(() => {
    let mounted = true;
    const load = async () => {
      setLoading(true);
      setLoadError(null);
      try {
        const [plansRes, subsMonthRes, subs12Res, usersRes, referralRes] = await Promise.all([
          supabase.from("plans").select("id,name,price").order("period_months", { ascending: true }),
          supabase.from("subscriptions").select("value,status,plan_id,started_at,created_at").gte("started_at", monthStartIso),
          supabase.from("subscriptions").select("value,status,started_at,created_at").gte("started_at", start12mIso),
          supabase.from("profiles").select("created_at").gte("created_at", start6mIso),
          supabase.from("v_admin_referral_links").select("clicks_count,conversions_count,commission_due"),
        ]);

        if (!mounted) return;

        const plans = (plansRes.data ?? []) as PlanRow[];
        const planMap = new Map(plans.map((p) => [p.id, p]));

        const subsMonthRaw =
          subsMonthRes.error != null
            ? await supabase.from("subscriptions").select("value,status,plan_id,created_at").gte("created_at", monthStartIso)
            : subsMonthRes;
        if (!mounted) return;

        const subs12Raw =
          subs12Res.error != null
            ? await supabase.from("subscriptions").select("value,status,created_at").gte("created_at", start12mIso)
            : subs12Res;
        if (!mounted) return;

        const subsMonth = ((subsMonthRaw.data ?? []) as SubscriptionRow[]).filter((s) => isPaidStatus(s.status));
        const byPlan = new Map<string, number>();
        for (const s of subsMonth) {
          const pid = String(s.plan_id ?? "");
          if (!pid) continue;
          byPlan.set(pid, (byPlan.get(pid) ?? 0) + Number(s.value ?? 0));
        }
        const totalMonth = Array.from(byPlan.values()).reduce((sum, v) => sum + v, 0);
        const colors = ["bg-primary", "bg-accent", "bg-sun", "bg-coral", "bg-gradient-hero"];
        const revBars = Array.from(byPlan.entries())
          .map(([planId, value], idx) => {
            const plan = planMap.get(planId);
            const price = Number(plan?.price ?? 0);
            const name = plan?.name ?? "Plano";
            const label = price > 0 ? `${name} (${fmtMoney(price)})` : name;
            const pct = totalMonth > 0 ? (value / totalMonth) * 100 : 0;
            return { planLabel: label, pct, value, color: colors[idx % colors.length] };
          })
          .sort((a, b) => b.value - a.value);
        setRevenueBars(revBars.length ? revBars : []);

        const subs12 = ((subs12Raw.data ?? []) as SubscriptionRow[]).filter((s) => isPaidStatus(s.status));
        const revenueSum12 = subs12.reduce((sum, s) => sum + Number(s.value ?? 0), 0);
        setRevenue12m(revenueSum12);
        setPaidCount12m(subs12.length);

        const users = (usersRes.data ?? []) as { created_at?: string | null }[];
        const keys: string[] = [];
        for (let i = 5; i >= 0; i--) {
          const d = new Date(now.getFullYear(), now.getMonth() - i, 1);
          keys.push(monthKey(d));
        }
        const counts = new Map(keys.map((k) => [k, 0]));
        for (const u of users) {
          const iso = String(u.created_at ?? "");
          if (!iso) continue;
          const d = new Date(iso);
          const k = monthKey(new Date(d.getFullYear(), d.getMonth(), 1));
          if (!counts.has(k)) continue;
          counts.set(k, (counts.get(k) ?? 0) + 1);
        }
        const growth = keys.map((k) => {
          const [y, m] = k.split("-").map((x) => Number(x));
          const d = new Date(y, (m ?? 1) - 1, 1);
          return { month: monthLabel(d), users: counts.get(k) ?? 0 };
        });
        setGrowthBars(growth);

        const refRows = (referralRes.data ?? []) as ReferralAggRow[];
        const clicks = refRows.reduce((sum, r) => sum + Number(r.clicks_count ?? 0), 0);
        const conv = refRows.reduce((sum, r) => sum + Number(r.conversions_count ?? 0), 0);
        const due = refRows.reduce((sum, r) => sum + Number(r.commission_due ?? 0), 0);
        setCommissionDue(due);
        setConversionRate(clicks > 0 ? (conv / clicks) * 100 : 0);

        setLoading(false);
      } catch (e) {
        if (!mounted) return;
        setLoading(false);
        setLoadError(e instanceof Error ? e.message : "Falha ao carregar relatórios");
      }
    };
    load();
    return () => {
      mounted = false;
    };
  }, [monthStartIso, now, start12mIso, start6mIso]);

  const maxUsers = useMemo(() => Math.max(1, ...growthBars.map((g) => g.users)), [growthBars]);
  const ticketAvg = paidCount12m > 0 ? revenue12m / paidCount12m : 0;

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-display font-extrabold">Relatórios ⚙️</h1>

      {loadError && (
        <div className="bg-card rounded-2xl shadow-card p-6">
          <p className="font-bold text-destructive">{loadError}</p>
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-card rounded-2xl shadow-card p-6">
          <h3 className="font-display font-bold text-lg mb-1">📊 Receita por Plano</h3>
          <p className="text-xs text-muted-foreground font-bold mb-4">Este mês (somente assinaturas pagas/ativas)</p>
          {loading ? (
            <p className="text-muted-foreground font-bold">Carregando…</p>
          ) : revenueBars.length === 0 ? (
            <p className="text-muted-foreground font-bold">Sem dados para este mês.</p>
          ) : (
            <div className="space-y-4">
              {revenueBars.map((p) => (
                <div key={p.planLabel}>
                  <div className="flex justify-between text-sm font-bold mb-1 gap-2">
                    <span className="truncate">{p.planLabel}</span>
                    <span className="shrink-0">{fmtPct(p.pct)}</span>
                  </div>
                  <div className="flex justify-between text-xs text-muted-foreground font-bold mb-2">
                    <span className="truncate">{fmtMoney(p.value)}</span>
                    <span />
                  </div>
                  <div className="h-3 bg-muted rounded-full overflow-hidden">
                    <motion.div
                      className={`h-full ${p.color} rounded-full`}
                      initial={{ width: 0 }}
                      animate={{ width: `${p.pct}%` }}
                      transition={{ duration: 0.8 }}
                    />
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        <div className="bg-card rounded-2xl shadow-card p-6">
          <h3 className="font-display font-bold text-lg mb-1">👥 Crescimento de Usuários</h3>
          <p className="text-xs text-muted-foreground font-bold mb-4">Últimos 6 meses</p>
          {loading ? (
            <p className="text-muted-foreground font-bold">Carregando…</p>
          ) : (
            <div className="space-y-3">
              {growthBars.map((m) => (
                <div key={m.month} className="flex items-center gap-4">
                  <span className="text-sm font-bold w-28 truncate">{m.month}</span>
                  <div className="flex-1 h-3 bg-muted rounded-full overflow-hidden">
                    <motion.div
                      className="h-full bg-gradient-hero rounded-full"
                      initial={{ width: 0 }}
                      animate={{ width: `${(m.users / maxUsers) * 100}%` }}
                      transition={{ duration: 0.8 }}
                    />
                  </div>
                  <span className="text-sm font-bold w-12 text-right">{m.users}</span>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      <div className="bg-card rounded-2xl shadow-card p-6">
        <h3 className="font-display font-bold text-lg mb-1">💰 Resumo Financeiro</h3>
        <p className="text-xs text-muted-foreground font-bold mb-4">Últimos 12 meses (somente assinaturas pagas/ativas)</p>
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          {[
            { label: "Receita (12m)", value: loading ? "—" : fmtMoney(revenue12m) },
            { label: "Comissões (a pagar)", value: loading ? "—" : fmtMoney(commissionDue) },
            { label: "Conversão (cliques→vendas)", value: loading ? "—" : fmtPct(conversionRate) },
            { label: "Ticket médio (12m)", value: loading ? "—" : fmtMoney(ticketAvg) },
          ].map((f) => (
            <div key={f.label} className="text-center p-4 bg-muted/50 rounded-xl">
              <p className="text-2xl font-extrabold">{f.value}</p>
              <p className="text-xs text-muted-foreground font-bold">{f.label}</p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default ReportsPage;

