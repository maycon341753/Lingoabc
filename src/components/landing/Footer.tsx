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
            </ul>
          </div>
        </div>

        <div className="border-t border-border mt-8 pt-6 text-center text-sm text-muted-foreground">
          © {new Date().getFullYear()} LingoABC. Todos os direitos reservados.
        </div>
      </div>
    </footer>
  );
};

export default Footer;
