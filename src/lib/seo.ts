export type SeoConfig = {
  title: string;
  description?: string;
  keywords?: string;
  canonical?: string;
  noindex?: boolean;
  ogTitle?: string;
  ogDescription?: string;
  ogType?: string;
  ogImage?: string;
  twitterCard?: string;
  jsonLd?: unknown;
};

const ensureMeta = (attrs: { name?: string; property?: string }, content: string) => {
  const head = document.head;
  const selector = attrs.name
    ? `meta[name="${CSS.escape(attrs.name)}"]`
    : attrs.property
    ? `meta[property="${CSS.escape(attrs.property)}"]`
    : "";
  if (!selector) return;
  const existing = head.querySelector(selector) as HTMLMetaElement | null;
  const el = existing ?? document.createElement("meta");
  if (!existing) {
    if (attrs.name) el.setAttribute("name", attrs.name);
    if (attrs.property) el.setAttribute("property", attrs.property);
    head.appendChild(el);
  }
  el.setAttribute("content", content);
};

const ensureLink = (rel: string, href: string) => {
  const head = document.head;
  const selector = `link[rel="${CSS.escape(rel)}"]`;
  const existing = head.querySelector(selector) as HTMLLinkElement | null;
  const el = existing ?? document.createElement("link");
  if (!existing) {
    el.setAttribute("rel", rel);
    head.appendChild(el);
  }
  el.setAttribute("href", href);
};

const ensureJsonLd = (jsonLd: unknown) => {
  const head = document.head;
  const id = "seo-jsonld";
  const existing = head.querySelector(`script#${CSS.escape(id)}`) as HTMLScriptElement | null;
  const el = existing ?? document.createElement("script");
  if (!existing) {
    el.id = id;
    el.type = "application/ld+json";
    head.appendChild(el);
  }
  el.text = JSON.stringify(jsonLd);
};

const removeJsonLd = () => {
  const el = document.head.querySelector("script#seo-jsonld");
  if (el) el.remove();
};

const toAbsoluteUrl = (href: string) => {
  try {
    const base = typeof window !== "undefined" ? window.location.origin : "";
    if (!base) return href;
    return new URL(href, base).toString();
  } catch {
    return href;
  }
};

export const applySeo = (cfg: SeoConfig) => {
  if (typeof document === "undefined") return;

  document.title = cfg.title;

  if (cfg.description) ensureMeta({ name: "description" }, cfg.description);
  if (cfg.keywords) ensureMeta({ name: "keywords" }, cfg.keywords);

  const verification = String(import.meta.env.VITE_GOOGLE_SITE_VERIFICATION ?? "").trim();
  if (verification) ensureMeta({ name: "google-site-verification" }, verification);

  const canonical =
    cfg.canonical ??
    (typeof window !== "undefined"
      ? window.location.href
      : undefined);
  if (canonical) ensureLink("canonical", canonical);

  const robots = cfg.noindex ? "noindex,nofollow" : "index,follow";
  ensureMeta({ name: "robots" }, robots);

  const ogTitle = cfg.ogTitle ?? cfg.title;
  const ogDescription = cfg.ogDescription ?? cfg.description;
  ensureMeta({ property: "og:title" }, ogTitle);
  if (ogDescription) ensureMeta({ property: "og:description" }, ogDescription);
  ensureMeta({ property: "og:type" }, cfg.ogType ?? "website");
  if (canonical) ensureMeta({ property: "og:url" }, canonical);
  if (cfg.ogImage) ensureMeta({ property: "og:image" }, toAbsoluteUrl(cfg.ogImage));

  ensureMeta({ name: "twitter:card" }, cfg.twitterCard ?? "summary_large_image");
  ensureMeta({ name: "twitter:title" }, ogTitle);
  if (ogDescription) ensureMeta({ name: "twitter:description" }, ogDescription);
  if (cfg.ogImage) ensureMeta({ name: "twitter:image" }, toAbsoluteUrl(cfg.ogImage));

  if (cfg.jsonLd != null) ensureJsonLd(cfg.jsonLd);
  else removeJsonLd();
};

