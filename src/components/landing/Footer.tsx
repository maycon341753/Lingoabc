import { Link, useNavigate } from "react-router-dom";
import mascot from "@/assets/mascot-owl.png";
import { useAuth } from "@/contexts/AuthContext";

const Footer = () => {
  const { userLabel } = useAuth();
  const navigate = useNavigate();
  return (
    <footer className="py-12 px-4 border-t border-border">
      <div className="container mx-auto max-w-6xl">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          <div className="md:col-span-1">
            <div className="flex items-center gap-2 mb-4">
              <img src={mascot} alt="LingoABC mascote" className="w-10 h-10" />
              <span className="font-display font-extrabold text-2xl text-gradient-hero">
                LingoABC
              </span>
            </div>
            <p className="text-sm text-muted-foreground">
              Aprendizado divertido e gamificado para crianças.
            </p>
          </div>

          <div>
            <h4 className="font-display font-bold mb-3">Plataforma</h4>
            <ul className="space-y-2 text-sm text-muted-foreground">
              <li><Link to="/planos" className="hover:text-primary transition-colors">Planos</Link></li>
              <li><Link to="/blog" className="hover:text-primary transition-colors">Blog</Link></li>
              <li>
                <Link
                  to="/modulos"
                  className="hover:text-primary transition-colors"
                  onClick={(e) => {
                    if (!userLabel) {
                      e.preventDefault();
                      navigate("/login");
                    }
                  }}
                >
                  Módulos
                </Link>
              </li>
              <li><Link to="/sobre" className="hover:text-primary transition-colors">Sobre</Link></li>
            </ul>
          </div>

          <div>
            <h4 className="font-display font-bold mb-3">Legal</h4>
            <ul className="space-y-2 text-sm text-muted-foreground">
              <li><Link to="/lgpd" className="hover:text-primary transition-colors">LGPD</Link></li>
              <li><Link to="/eca" className="hover:text-primary transition-colors">ECA Digital</Link></li>
            </ul>
          </div>

          <div>
            <h4 className="font-display font-bold mb-3">Contato</h4>
            <ul className="space-y-2 text-sm text-muted-foreground">
              <li>contato@lingoabc.com</li>
              <li>
                <Link
                  to="/indicacao"
                  className="hover:text-primary transition-colors"
                  onClick={(e) => {
                    if (!userLabel) {
                      e.preventDefault();
                      navigate("/login");
                    }
                  }}
                >
                  Indicação
                </Link>
              </li>
            </ul>
            <div className="mt-4 grid grid-cols-2 gap-2">
              <div className="rounded-xl border border-border bg-card px-3 py-2 flex items-center gap-2">
                <svg width="22" height="22" viewBox="0 0 24 24" fill="none" className="text-primary shrink-0" aria-hidden="true">
                  <path
                    d="M7 11V8a5 5 0 0 1 10 0v3"
                    stroke="currentColor"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  />
                  <path
                    d="M6 11h12a2 2 0 0 1 2 2v6a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2v-6a2 2 0 0 1 2-2Z"
                    stroke="currentColor"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  />
                </svg>
                <div className="leading-tight">
                  <div className="text-xs font-extrabold text-foreground">SSL</div>
                  <div className="text-[11px] text-muted-foreground font-bold">Certificado</div>
                </div>
              </div>
              <div className="rounded-xl border border-border bg-card px-3 py-2 flex items-center gap-2">
                <svg width="22" height="22" viewBox="0 0 24 24" fill="none" className="text-primary shrink-0" aria-hidden="true">
                  <path
                    d="M12 2l7 4v6c0 5-3 9-7 10-4-1-7-5-7-10V6l7-4Z"
                    stroke="currentColor"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  />
                  <path
                    d="M9 12l2 2 4-5"
                    stroke="currentColor"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  />
                </svg>
                <div className="leading-tight">
                  <div className="text-xs font-extrabold text-foreground">Compra</div>
                  <div className="text-[11px] text-muted-foreground font-bold">100% segura</div>
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className="border-t border-border mt-8 pt-6 text-center text-sm text-muted-foreground space-y-1">
          <div>© {new Date().getFullYear()} LingoABC. Todos os direitos reservados.</div>
          <div>CNPJ: 39.433.448/0001-34 - LingoABC</div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
