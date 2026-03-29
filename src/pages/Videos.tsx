import { useEffect, useMemo, useState } from "react";
import Navbar from "@/components/landing/Navbar";
import Footer from "@/components/landing/Footer";
import { supabase } from "@/lib/supabase";
import mascot from "@/assets/mascot-owl.png";
import { useSeo } from "@/lib/useSeo";
import { Button } from "@/components/ui/button";
import { useNavigate } from "react-router-dom";

type MediaRow = {
  id: string;
  title: string;
  description: string | null;
  subject: string | null;
  module: string | null;
  bucket: string;
  object_name: string;
  thumb_name: string | null;
  duration_seconds: number | null;
  is_music: boolean;
};

const VideosPage = () => {
  const navigate = useNavigate();
  const origin = typeof window !== "undefined" ? window.location.origin : "";
  const canonical = origin ? `${origin}/videos` : "/videos";
  useSeo({
    title: "Vídeos Educativos e Músicas | LingoABC",
    description:
      "Conteúdos educativos para crianças: vídeos e músicas para aprender brincando. Ideal para educação infantil online e reforço escolar infantil.",
    keywords:
      "educação infantil online, aprender brincando, plataforma educacional infantil, vídeos educativos para crianças, músicas educativas, reforço escolar infantil",
    canonical,
    ogImage: mascot,
  });
  const [items, setItems] = useState<MediaRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [hasActivePlan, setHasActivePlan] = useState<boolean | null>(null);
  const ordered = useMemo(() => {
    const vids = items.filter((i) => !i.is_music);
    const mus = items.filter((i) => i.is_music);
    return [...vids, ...mus];
  }, [items]);

  useEffect(() => {
    let mounted = true;
    const run = async () => {
      const { data: auth } = await supabase.auth.getUser();
      const uid = auth.user?.id ?? null;
      if (!uid) {
        if (mounted) setHasActivePlan(false);
        return;
      }
      const { data } = await supabase
        .from("subscriptions")
        .select("status,expires_at")
        .eq("user_id", uid)
        .order("expires_at", { ascending: false, nullsFirst: false })
        .limit(1)
        .maybeSingle();
      const status = String((data as { status?: string | null } | null)?.status ?? "").toLowerCase().trim();
      const expiresAtIso = String((data as { expires_at?: string | null } | null)?.expires_at ?? "");
      const t = expiresAtIso ? new Date(expiresAtIso).getTime() : NaN;
      const expiresAtMs = Number.isFinite(t) ? t : null;
      const nowMs = Date.now();
      const active = (status === "active" || status === "ativa" || status === "ativo") && (expiresAtMs == null || expiresAtMs > nowMs);
      if (mounted) setHasActivePlan(active);
    };
    run();
    return () => {
      mounted = false;
    };
  }, []);

  useEffect(() => {
    let mounted = true;
    const load = async () => {
      setLoading(true);
      const { data } = await supabase.from("videos_media").select("*").eq("active", true).order("created_at", { ascending: false });
      if (!mounted) return;
      setItems(data ?? []);
      setLoading(false);
    };
    load();
    return () => {
      mounted = false;
    };
  }, []);

  return (
    <div className="min-h-screen">
      <Navbar />
      <div className="container mx-auto max-w-6xl px-4 py-10">
        <h1 className="text-3xl font-display font-extrabold mb-6 text-center">Vídeos e Músicas</h1>
        {loading ? (
          <p className="text-center text-muted-foreground font-bold">Carregando…</p>
        ) : items.length === 0 ? (
          <p className="text-center text-muted-foreground font-bold">Nenhum conteúdo disponível</p>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {ordered.map((it) => {
              const { data: pub } = supabase.storage.from(it.bucket).getPublicUrl(it.object_name);
              const url = pub.publicUrl;
              return (
                <div key={it.id} className="bg-card rounded-2xl shadow-card overflow-hidden">
                  <div className="aspect-video bg-muted">
                    {it.is_music ? (
                      <audio controls src={url} className="w-full h-12" />
                    ) : (
                      <video controls src={url} className="w-full h-full" />
                    )}
                  </div>
                  <div className="p-4 space-y-2">
                    <h2 className="font-display font-bold">{it.title}</h2>
                    {it.description && <p className="text-sm text-muted-foreground">{it.description}</p>}
                    <div className="flex gap-2 text-xs text-muted-foreground">
                      {it.subject && <span>{it.subject}</span>}
                      {it.module && <span>• {it.module}</span>}
                      {it.duration_seconds != null && <span>• {Math.round(it.duration_seconds / 60)} min</span>}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}

        {hasActivePlan === false && (
          <div className="mt-10 flex justify-center">
            <Button
              className="bg-gradient-hero rounded-2xl font-extrabold text-base md:text-lg px-8 py-7 shadow-card motion-safe:animate-pulse motion-reduce:animate-none"
              onClick={() => navigate("/usuario/planos")}
            >
              Mais de 100 musicas, DESBLOQUEIE
            </Button>
          </div>
        )}
      </div>
      <Footer />
    </div>
  );
};

export default VideosPage;
