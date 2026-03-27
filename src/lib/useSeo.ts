import { useEffect, useMemo } from "react";
import { applySeo, SeoConfig } from "@/lib/seo";

export const useSeo = (cfg: SeoConfig) => {
  const { title, description, keywords, canonical, noindex, ogTitle, ogDescription, ogType, ogImage, twitterCard, jsonLd } = cfg;
  const stableCfg = useMemo(
    () => ({
      title,
      description,
      keywords,
      canonical,
      noindex,
      ogTitle,
      ogDescription,
      ogType,
      ogImage,
      twitterCard,
      jsonLd,
    }),
    [
      title,
      description,
      keywords,
      canonical,
      noindex,
      ogTitle,
      ogDescription,
      ogType,
      ogImage,
      twitterCard,
      jsonLd,
    ],
  );

  useEffect(() => {
    applySeo(stableCfg);
  }, [stableCfg]);
};
