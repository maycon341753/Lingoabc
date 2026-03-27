import { useEffect, useMemo, useRef, useState } from "react";
import { supabase } from "@/lib/supabase";
import { useSeo } from "@/lib/useSeo";
import mascot from "@/assets/mascot-owl.png";

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

const fmtNum = (n: number) => new Intl.NumberFormat("pt-BR").format(n);

const toIso = (d: Date) => d.toISOString();

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

const SeoPage = () => {
  useSeo({
    title: "SEO & Acessos | Admin | LingoABC",
    description: "Painel de SEO e acessos.",
    canonical: typeof window !== "undefined" ? `${window.location.origin}/admin/seo` : "/admin/seo",
    ogImage: mascot,
    noindex: true,
  });

  const lookerUrl = String(import.meta.env.VITE_LOOKER_STUDIO_EMBED_URL ?? "").trim();

  const [ready, setReady] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [lastEvents, setLastEvents] = useState<AppEventRow[]>([]);
  const [pageViews24h, setPageViews24h] = useState<Record<string, number>>({});
  const [clicks24h, setClicks24h] = useState<Record<string, number>>({});
  const [topButtons24h, setTopButtons24h] = useState<Record<string, number>>({});
  const [topReferrers24h, setTopReferrers24h] = useState<Record<string, number>>({});
  const [activeSessions5m, setActiveSessions5m] = useState(0);
  const [events24h, setEvents24h] = useState(0);
  const realtimeRef = useRef<ReturnType<typeof supabase.channel> | null>(null);

  const since24h = useMemo(() => {
    const d = new Date();
    d.setHours(d.getHours() - 24);
    return d;
  }, []);

  const since5m = useMemo(() => {
    const d = new Date();
    d.setMinutes(d.getMinutes() - 5);
    return d;
  }, []);

  const aggregate = (rows: AppEventRow[]) => {
    const pv: Record<string, number> = {};
    const cl: Record<string, number> = {};
    const btn: Record<string, number> = {};
    const ref: Record<string, number> = {};
    for (const r of rows) {
      const path = String(r.path ?? "").trim() || "—";
      if (r.event_type === "page_view") pv[path] = (pv[path] ?? 0) + 1;
      if (r.event_type === "click") cl[path] = (cl[path] ?? 0) + 1;

      const refKey = normalizeReferrer(r.referrer);
      ref[refKey] = (ref[refKey] ?? 0) + 1;

      if (r.event_type === "click") {
        const label = clickLabelFromMeta(r.metadata);
        if (label) btn[label] = (btn[label] ?? 0) + 1;
      }
    }
    setPageViews24h(pv);
    setClicks24h(cl);
    setTopButtons24h(btn);
    setTopReferrers24h(ref);
  };

  useEffect(() => {
    let mounted = true;
    const run = async () => {
      setReady(false);
      setErrorMsg(null);
      try {
        const [{ data: ev24 }, { data: ev5 }] = await Promise.all([
          supabase
            .from("app_events")
            .select("id,created_at,event_type,path,title,referrer,session_id,user_id,metadata")
            .gte("created_at", toIso(since24h))
            .order("created_at", { ascending: false })
            .limit(5000),
          supabase
            .from("app_events")
            .select("session_id,created_at")
            .gte("created_at", toIso(since5m))
            .order("created_at", { ascending: false })
            .limit(2000),
        ]);

        if (!mounted) return;

        const rows24 = (Array.isArray(ev24) ? ev24 : []) as AppEventRow[];
        const rows5 = (Array.isArray(ev5) ? ev5 : []) as Pick<AppEventRow, "session_id" | "created_at">[];

        setEvents24h(rows24.length);
        setLastEvents(rows24.slice(0, 25));
        aggregate(rows24);

        const sessions = new Set<string>();
        for (const r of rows5) {
          const sid = String(r.session_id ?? "").trim();
          if (sid) sessions.add(sid);
        }
        setActiveSessions5m(sessions.size);

        setReady(true);
      } catch (e) {
        if (!mounted) return;
        setErrorMsg("Não foi possível carregar os eventos. Verifique se a tabela app_events existe e se o admin tem permissão de leitura.");
        setReady(true);
      }
    };
    run();
    return () => {
      mounted = false;
    };
  }, [since24h, since5m]);

  useEffect(() => {
    if (realtimeRef.current) return;
    const ch = supabase
      .channel("admin-app-events")
      .on(
        "postgres_changes",
        { event: "INSERT", schema: "public", table: "app_events" },
        (payload) => {
          const row = payload.new as AppEventRow;
          setLastEvents((cur) => [row, ...cur].slice(0, 25));
          setEvents24h((n) => n + 1);
          const path = String(row.path ?? "").trim() || "—";
          if (row.event_type === "page_view") setPageViews24h((m) => ({ ...m, [path]: (m[path] ?? 0) + 1 }));
          if (row.event_type === "click") setClicks24h((m) => ({ ...m, [path]: (m[path] ?? 0) + 1 }));
          const refKey = normalizeReferrer(row.referrer);
          setTopReferrers24h((m) => ({ ...m, [refKey]: (m[refKey] ?? 0) + 1 }));
          if (row.event_type === "click") {
            const label = clickLabelFromMeta(row.metadata);
            if (label) setTopButtons24h((m) => ({ ...m, [label]: (m[label] ?? 0) + 1 }));
          }
        },
      )
      .subscribe();
    realtimeRef.current = ch;
    return () => {
      ch.unsubscribe();
      realtimeRef.current = null;
    };
  }, []);

  const topEntries = (m: Record<string, number>) =>
    Object.entries(m)
      .sort((a, b) => b[1] - a[1])
      .slice(0, 10);

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-display font-extrabold">SEO & Acessos ⚙️</h1>

      <div className="bg-card rounded-2xl shadow-card p-6">
        <h2 className="font-display font-bold text-lg mb-2">📈 Google Analytics (recomendado)</h2>
        <p className="text-sm text-muted-foreground font-bold">
          Para ver idade do público, cidades/países e acessos em tempo real com alta precisão, conecte o GA4 e cole um link de embed do Looker Studio.
        </p>
        {lookerUrl ? (
          <div className="mt-4 overflow-hidden rounded-2xl border border-border bg-background">
            <iframe title="SEO Dashboard" src={lookerUrl} className="w-full h-[720px]" />
          </div>
        ) : (
          <div className="mt-4 rounded-xl bg-muted/50 border border-border p-4">
            <p className="text-sm font-bold">Configuração</p>
            <p className="text-sm text-muted-foreground font-bold mt-1">
              Defina a variável VITE_LOOKER_STUDIO_EMBED_URL com o link de incorporação do seu relatório do Looker Studio (conectado ao GA4).
            </p>
          </div>
        )}
      </div>

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-card rounded-2xl shadow-card p-5">
          <p className="text-xs text-muted-foreground font-bold">Acessos ativos (5 min)</p>
          <p className="text-2xl font-extrabold">{ready ? fmtNum(activeSessions5m) : "—"}</p>
        </div>
        <div className="bg-card rounded-2xl shadow-card p-5">
          <p className="text-xs text-muted-foreground font-bold">Eventos (24h)</p>
          <p className="text-2xl font-extrabold">{ready ? fmtNum(events24h) : "—"}</p>
        </div>
        <div className="bg-card rounded-2xl shadow-card p-5">
          <p className="text-xs text-muted-foreground font-bold">Páginas rastreadas</p>
          <p className="text-2xl font-extrabold">{ready ? fmtNum(Object.keys(pageViews24h).length) : "—"}</p>
        </div>
        <div className="bg-card rounded-2xl shadow-card p-5">
          <p className="text-xs text-muted-foreground font-bold">Cliques por página</p>
          <p className="text-2xl font-extrabold">{ready ? fmtNum(Object.keys(clicks24h).length) : "—"}</p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-card rounded-2xl shadow-card p-6">
          <h3 className="font-display font-bold text-lg mb-4">📄 Páginas mais acessadas (24h)</h3>
          {!ready ? (
            <p className="text-muted-foreground font-bold">Carregando…</p>
          ) : errorMsg ? (
            <p className="text-destructive font-bold">{errorMsg}</p>
          ) : (
            <div className="space-y-3">
              {topEntries(pageViews24h).map(([path, count]) => (
                <div key={path} className="flex items-center justify-between gap-3">
                  <div className="text-sm font-bold truncate">{path}</div>
                  <div className="text-sm font-extrabold">{fmtNum(count)}</div>
                </div>
              ))}
              {Object.keys(pageViews24h).length === 0 && <p className="text-muted-foreground font-bold">Sem dados.</p>}
            </div>
          )}
        </div>

        <div className="bg-card rounded-2xl shadow-card p-6">
          <h3 className="font-display font-bold text-lg mb-4">🖱️ Cliques por página (24h)</h3>
          {!ready ? (
            <p className="text-muted-foreground font-bold">Carregando…</p>
          ) : errorMsg ? (
            <p className="text-destructive font-bold">{errorMsg}</p>
          ) : (
            <div className="space-y-3">
              {topEntries(clicks24h).map(([path, count]) => (
                <div key={path} className="flex items-center justify-between gap-3">
                  <div className="text-sm font-bold truncate">{path}</div>
                  <div className="text-sm font-extrabold">{fmtNum(count)}</div>
                </div>
              ))}
              {Object.keys(clicks24h).length === 0 && <p className="text-muted-foreground font-bold">Sem dados.</p>}
            </div>
          )}
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-card rounded-2xl shadow-card p-6">
          <h3 className="font-display font-bold text-lg mb-4">🏆 Top botões clicados (24h)</h3>
          {!ready ? (
            <p className="text-muted-foreground font-bold">Carregando…</p>
          ) : errorMsg ? (
            <p className="text-destructive font-bold">{errorMsg}</p>
          ) : (
            <div className="space-y-3">
              {topEntries(topButtons24h).map(([label, count]) => (
                <div key={label} className="flex items-center justify-between gap-3">
                  <div className="text-sm font-bold truncate">{label}</div>
                  <div className="text-sm font-extrabold">{fmtNum(count)}</div>
                </div>
              ))}
              {Object.keys(topButtons24h).length === 0 && <p className="text-muted-foreground font-bold">Sem dados.</p>}
            </div>
          )}
        </div>

        <div className="bg-card rounded-2xl shadow-card p-6">
          <h3 className="font-display font-bold text-lg mb-4">🔗 Top referrers (24h)</h3>
          {!ready ? (
            <p className="text-muted-foreground font-bold">Carregando…</p>
          ) : errorMsg ? (
            <p className="text-destructive font-bold">{errorMsg}</p>
          ) : (
            <div className="space-y-3">
              {topEntries(topReferrers24h).map(([label, count]) => (
                <div key={label} className="flex items-center justify-between gap-3">
                  <div className="text-sm font-bold truncate">{label}</div>
                  <div className="text-sm font-extrabold">{fmtNum(count)}</div>
                </div>
              ))}
              {Object.keys(topReferrers24h).length === 0 && <p className="text-muted-foreground font-bold">Sem dados.</p>}
            </div>
          )}
        </div>
      </div>

      <div className="bg-card rounded-2xl shadow-card p-6">
        <h3 className="font-display font-bold text-lg mb-4">⚡ Eventos em tempo real</h3>
        {!ready ? (
          <p className="text-muted-foreground font-bold">Carregando…</p>
        ) : errorMsg ? (
          <p className="text-destructive font-bold">{errorMsg}</p>
        ) : (
          <div className="space-y-2">
            {lastEvents.map((e) => (
              <div key={e.id} className="flex items-start justify-between gap-4 rounded-xl border border-border bg-muted/30 p-3">
                <div className="min-w-0">
                  <div className="text-sm font-extrabold">{String(e.event_type)}</div>
                  <div className="text-sm font-bold truncate">{String(e.path ?? "—")}</div>
                  <div className="text-xs text-muted-foreground font-bold truncate">{String(e.title ?? "")}</div>
                </div>
                <div className="text-xs text-muted-foreground font-bold shrink-0">
                  {new Date(e.created_at).toLocaleString("pt-BR")}
                </div>
              </div>
            ))}
            {lastEvents.length === 0 && <p className="text-muted-foreground font-bold">Sem dados.</p>}
          </div>
        )}
      </div>
    </div>
  );
};

export default SeoPage;
