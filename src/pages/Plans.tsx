import Navbar from "@/components/landing/Navbar";
import PricingSection from "@/components/landing/PricingSection";
import Footer from "@/components/landing/Footer";
import { useAuth } from "@/contexts/AuthContext";
import { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import mascot from "@/assets/mascot-owl.png";
import { useSeo } from "@/lib/useSeo";

const PlansPage = () => {
  const { loading, user } = useAuth();
  const navigate = useNavigate();
  const origin = typeof window !== "undefined" ? window.location.origin : "";
  const canonical = origin ? `${origin}/planos` : "/planos";
  useSeo({
    title: "Planos e Assinatura | LingoABC",
    description:
      "Assine a plataforma educacional infantil LingoABC e libere matemática, português e inglês para aprender brincando. Reforço escolar infantil com módulos por faixa etária.",
    keywords:
      "plataforma educacional infantil, educação infantil online, reforço escolar infantil, aprender brincando, planos, assinatura",
    canonical,
    ogImage: mascot,
  });

  useEffect(() => {
    if (!loading && user) {
      navigate("/usuario/planos", { replace: true });
    }
  }, [loading, navigate, user]);

  return (
    <div className="min-h-screen">
      <Navbar />
      <div className="pt-10">
        <PricingSection />
      </div>
      <Footer />
    </div>
  );
};

export default PlansPage;
