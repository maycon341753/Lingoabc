import { useEffect, useMemo, useRef } from "react";
import { useLocation } from "react-router-dom";
import { supabase } from "@/lib/supabase";
import { useAuth } from "@/contexts/AuthContext";

const getSessionId = () => {
  try {
    const key = "app:session_id";
    const existing = window.localStorage.getItem(key);
    if (existing) return existing;
    const id =
      typeof crypto !== "undefined" && "randomUUID" in crypto
        ? crypto.randomUUID()
        : `${Date.now()}-${Math.random().toString(16).slice(2)}`;
    window.localStorage.setItem(key, id);
    return id;
  } catch {
    return `${Date.now()}-${Math.random().toString(16).slice(2)}`;
  }
};

const safeStr = (v: unknown, maxLen: number) => String(v ?? "").trim().slice(0, maxLen);

const buildBaseMeta = () => {
  const tz = (() => {
    try {
      return Intl.DateTimeFormat().resolvedOptions().timeZone;
    } catch {
      return null;
    }
  })();
  return {
    lang: typeof navigator !== "undefined" ? navigator.language : null,
    tz,
    ua: typeof navigator !== "undefined" ? navigator.userAgent : null,
  };
};

const AnalyticsTracker = () => {
  const location = useLocation();
  const { user } = useAuth();
  const sessionId = useMemo(() => (typeof window !== "undefined" ? getSessionId() : ""), []);
  const lastClickSigRef = useRef<string>("");
  const lastClickTsRef = useRef<number>(0);

  useEffect(() => {
    if (typeof window === "undefined") return;
    if (location.pathname.startsWith("/admin")) return;

    const path = `${location.pathname}${location.search}`;
    const meta = buildBaseMeta();

    supabase
      .from("app_events")
      .insert({
        event_type: "page_view",
        path,
        title: document.title,
        referrer: document.referrer || null,
        user_id: user?.id ?? null,
        session_id: sessionId,
        metadata: meta,
      })
      .then(() => {})
      .catch(() => {});
  }, [location.pathname, location.search, sessionId, user?.id]);

  useEffect(() => {
    if (typeof window === "undefined") return;

    const onClick = (e: MouseEvent) => {
      if (!e.isTrusted) return;
      if (location.pathname.startsWith("/admin")) return;

      const target = e.target as Element | null;
      if (!target) return;
      const el = target.closest("a,button") as HTMLElement | null;
      if (!el) return;

      const tag = el.tagName.toLowerCase();
      const text = safeStr(el.textContent, 80);
      if (!text) return;
      const href = el instanceof HTMLAnchorElement ? safeStr(el.getAttribute("href"), 300) : null;

      const now = Date.now();
      const sig = `${tag}|${text}|${href ?? ""}|${location.pathname}`;
      if (sig === lastClickSigRef.current && now - lastClickTsRef.current < 350) return;
      lastClickSigRef.current = sig;
      lastClickTsRef.current = now;

      const meta = {
        ...buildBaseMeta(),
        tag,
        text,
        href,
        id: safeStr(el.id, 80) || null,
      };

      const path = `${location.pathname}${location.search}`;
      supabase
        .from("app_events")
        .insert({
          event_type: "click",
          path,
          title: document.title,
          referrer: document.referrer || null,
          user_id: user?.id ?? null,
          session_id: sessionId,
          metadata: meta,
        })
        .then(() => {})
        .catch(() => {});
    };

    document.addEventListener("click", onClick, { capture: true });
    return () => {
      document.removeEventListener("click", onClick, { capture: true });
    };
  }, [location.pathname, location.search, sessionId, user?.id]);

  return null;
};

export default AnalyticsTracker;

