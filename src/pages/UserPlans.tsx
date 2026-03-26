import Navbar from "@/components/landing/Navbar";
import PricingSection from "@/components/landing/PricingSection";
import Footer from "@/components/landing/Footer";
import { useAuth } from "@/contexts/AuthContext";
import { useEffect } from "react";
import { useNavigate } from "react-router-dom";

const UserPlansPage = () => {
  const { loading, user } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    if (!loading && !user) {
      navigate("/login", { replace: true });
    }
  }, [loading, navigate, user]);

  if (!loading && !user) return null;

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

export default UserPlansPage;
