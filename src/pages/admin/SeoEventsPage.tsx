import { useEffect, useMemo, useState } from "react";
import { Link, useSearchParams } from "react-router-dom";
import { supabase } from "@/lib/supabase";
import mascot from "@/assets/mascot-owl.png";
import { useSeo } from "@/lib/useSeo";

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

const toInt = (v: string | null, fallback: number) => {
  const n = Number(v);
  return Number.isFinite(n) && n > 0 ? Math.floor(n) : fallback;
};

const SeoEventsPage = () => {
  useSeo({
    title: "Eventos | SEO & Acessos | Admin | LingoABC",
    description: "Lista de eventos rastreados.",
    canonical: typeof window !== "undefined" ? `${window.location.origin}/admin/seo/eventos` : "/admin/seo/eventos",
    ogImage: mascot,
    noindex: true,
  });

  const [searchParams, setSearchParams] = useSearchParams();
  const page = toInt(searchParams.get("page"), 1);
  const perPage = 50;
  const type = String(searchParams.get("type") ?? "").trim();
  const pathQuery = String(searchParams.get("path") ?? "").trim();

  const [rows, setRows] = useState<AppEventRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  const since24hIso = useMemo(() => {
    const d = new Date();
    d.setHours(d.getHours() - 24);
    return d.toISOString();
  }, []);

  useEffect(() => {
    let mounted = true;
    const load = async () => {
      setLoading(true);
      setErrorMsg(null);
      try {
        let q = supabase
          .from("app_events")
          .select("id,created_at,event_type,path,title,referrer,session_id,user_id,metadata")
          .gte("created_at", since24hIso)
          .order("created_at", { ascending: false });

        if (type) q = q.eq("event_type", type);
        if (pathQuery) q = q.ilike("path", `%${pathQuery}%`);

        const from = (page - 1) * perPage;
        const to = from + perPage - 1;
        const { data, error } = await q.range(from, to);
        if (!mounted) return;
        if (error) {
          setErrorMsg(error.message);
          setRows([]);
          setLoading(false);
          return;
        }
        setRows((data ?? []) as AppEventRow[]);
        setLoading(false);
      } catch (e) {
        if (!mounted) return;
        setErrorMsg(e instanceof Error ? e.message : "Falha ao carregar");
        setRows([]);
        setLoading(false);
      }
    };
    load();
    return () => {
      mounted = false;
    };
  }, [page, pathQuery, since24hIso, type]);

  const canPrev = page > 1;
  const canNext = rows.length === perPage;

  const setParam = (key: string, value: string) => {
    const next = new URLSearchParams(searchParams);
    if (value) next.set(key, value);
    else next.delete(key);
    next.set("page", "1");
    setSearchParams(next, { replace: true });
  };

  const goPage = (p: number) => {
    const next = new URLSearchParams(searchParams);
    next.set("page", String(p));
    setSearchParams(next, { replace: true });
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between gap-3">
        <div>
          <h1 className="text-2xl font-display font-extrabold">Eventos (24h) ⚡</h1>
          <p className="text-xs text-muted-foreground font-bold">Paginação: {fmtNum(perPage)} por página</p>
        </div>
        <Link to="/admin/seo" className="inline-flex items-center justify-center rounded-xl border border-border bg-background font-bold px-4 py-2 text-sm">
          Voltar
        </Link>
      </div>

      <div className="bg-card rounded-2xl shadow-card p-6">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="grid gap-2">
            <label className="text-sm font-bold">Tipo</label>
            <select
              className="flex h-10 w-full rounded-xl border border-input bg-background px-3 py-2 text-sm"
              value={type}
              onChange={(e) => setParam("type", e.target.value)}
            >
              <option value="">Todos</option>
              <option value="page_view">page_view</option>
              <option value="click">click</option>
            </select>
          </div>
          <div className="grid gap-2 md:col-span-2">
            <label className="text-sm font-bold">Filtrar por path</label>
            <input
              className="flex h-10 w-full rounded-xl border border-input bg-background px-3 py-2 text-sm"
              value={pathQuery}
              onChange={(e) => setParam("path", e.target.value)}
              placeholder="/login, /modulos, /usuario..."
            />
          </div>
        </div>
      </div>

      <div className="bg-card rounded-2xl shadow-card p-6">
        {loading ? (
          <p className="text-muted-foreground font-bold">Carregando…</p>
        ) : errorMsg ? (
          <p className="text-destructive font-bold">{errorMsg}</p>
        ) : rows.length === 0 ? (
          <p className="text-muted-foreground font-bold">Sem dados.</p>
        ) : (
          <div className="space-y-2">
            {rows.map((e) => (
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
          </div>
        )}

        <div className="flex items-center justify-between gap-3 mt-6">
          <button
            type="button"
            className="inline-flex items-center justify-center rounded-xl border border-border bg-background font-bold px-4 py-2 text-sm disabled:opacity-50"
            onClick={() => goPage(page - 1)}
            disabled={!canPrev}
          >
            Anterior
          </button>
          <div className="text-sm text-muted-foreground font-bold">Página {fmtNum(page)}</div>
          <button
            type="button"
            className="inline-flex items-center justify-center rounded-xl border border-border bg-background font-bold px-4 py-2 text-sm disabled:opacity-50"
            onClick={() => goPage(page + 1)}
            disabled={!canNext}
          >
            Próxima
          </button>
        </div>
      </div>
    </div>
  );
};

export default SeoEventsPage;

