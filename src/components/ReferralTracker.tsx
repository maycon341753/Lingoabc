import { useEffect } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { supabase } from "@/lib/supabase";

const ReferralTracker = () => {
  const location = useLocation();
  const navigate = useNavigate();

  useEffect(() => {
    const search = new URLSearchParams(location.search);
    const code = String(search.get("ref") ?? "").trim();
    if (!code) return;

    try {
      window.localStorage.setItem("referral:code", code);
      window.localStorage.setItem("referral:ts", String(Date.now()));
    } catch {
      void 0;
    }

    const key = `referral:click:${code}`;
    try {
      if (window.sessionStorage.getItem(key) === "1") return;
      window.sessionStorage.setItem(key, "1");
    } catch {
      void 0;
    }

    supabase.rpc("referral_track_click", { p_code: code }).then(() => {});
    supabase.auth.getSession().then(({ data }) => {
      const hasSession = !!data.session?.user?.id;
      if (hasSession) return;
      if (location.pathname === "/cadastro") return;
      navigate(`/cadastro?ref=${encodeURIComponent(code)}`, { replace: true });
    });
  }, [location.pathname, location.search, navigate]);

  return null;
};

export default ReferralTracker;
