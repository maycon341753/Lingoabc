export const initAnalytics = () => {
  if (typeof window === "undefined") return;

  const id = String(import.meta.env.VITE_GA_MEASUREMENT_ID ?? "").trim();
  if (!id) return;

  const existing = document.querySelector(`script[src^="https://www.googletagmanager.com/gtag/js?id="]`);
  if (!existing) {
    const s = document.createElement("script");
    s.async = true;
    s.src = `https://www.googletagmanager.com/gtag/js?id=${encodeURIComponent(id)}`;
    document.head.appendChild(s);
  }

  const w = window as unknown as { dataLayer?: unknown[]; gtag?: (...args: unknown[]) => void };
  w.dataLayer = w.dataLayer ?? [];
  w.gtag =
    w.gtag ??
    ((...args: unknown[]) => {
      (w.dataLayer as unknown[]).push(args);
    });
  w.gtag("js", new Date());
  w.gtag("config", id, { anonymize_ip: true });
};

