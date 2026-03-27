import { useLocation } from "react-router-dom";
import { useEffect } from "react";
import mascot from "@/assets/mascot-owl.png";
import { useSeo } from "@/lib/useSeo";

const NotFound = () => {
  const location = useLocation();
  const origin = typeof window !== "undefined" ? window.location.origin : "";
  const canonical = origin ? `${origin}${location.pathname}` : location.pathname;
  useSeo({
    title: "Página não encontrada | LingoABC",
    description: "Esta página não existe. Volte para a home e continue explorando a LingoABC.",
    canonical,
    ogImage: mascot,
    noindex: true,
  });

  useEffect(() => {
    console.error("404 Error: User attempted to access non-existent route:", location.pathname);
  }, [location.pathname]);

  return (
    <div className="flex min-h-screen items-center justify-center bg-muted">
      <div className="text-center">
        <h1 className="mb-4 text-4xl font-bold">404</h1>
        <p className="mb-4 text-xl text-muted-foreground">Oops! Page not found</p>
        <a href="/" className="text-primary underline hover:text-primary/90">
          Return to Home
        </a>
      </div>
    </div>
  );
};

export default NotFound;
