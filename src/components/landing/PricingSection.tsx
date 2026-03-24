import { motion } from "framer-motion";
import { Check, Sparkles } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useNavigate } from "react-router-dom";

const plans = [
  {
    name: "Mensal",
    price: "74,90",
    period: "/mês",
    highlight: false,
    savings: null,
  },
  {
    name: "Trimestral",
    price: "179,00",
    period: "/3 meses",
    highlight: true,
    savings: "Economize R$ 45",
  },
  {
    name: "Semestral",
    price: "259,90",
    period: "/6 meses",
    highlight: false,
    savings: "Economize R$ 189",
  },
];

const benefits = [
  "Acesso completo a todas as matérias",
  "4 módulos por faixa etária",
  "Lições interativas gamificadas",
  "Vídeos educativos",
  "Conquistas e medalhas",
  "Missões diárias",
  "Relatório de progresso",
];

const PricingSection = () => {
  const navigate = useNavigate();

  return (
    <section className="py-20 px-4 bg-card">
      <div className="container mx-auto max-w-5xl">
        <motion.div
          className="text-center mb-14"
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
        >
          <h2 className="text-3xl md:text-4xl font-display font-extrabold mb-4">
            Invista no futuro 💡
          </h2>
          <p className="text-muted-foreground text-lg">
            Escolha o melhor plano para seu filho
          </p>
        </motion.div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {plans.map((plan, i) => (
            <motion.div
              key={plan.name}
              className={`relative rounded-3xl p-8 ${
                plan.highlight
                  ? "bg-gradient-hero text-primary-foreground shadow-playful scale-105"
                  : "bg-background shadow-card"
              }`}
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.1 }}
              whileHover={{ y: -4 }}
            >
              {plan.highlight && (
                <span className="absolute -top-3 left-1/2 -translate-x-1/2 bg-sun px-4 py-1 rounded-full text-xs font-bold text-foreground flex items-center gap-1">
                  <Sparkles className="w-3 h-3" /> Mais popular
                </span>
              )}

              <h3 className="font-display font-bold text-xl mb-2">{plan.name}</h3>
              <div className="mb-1">
                <span className="text-4xl font-extrabold">R$ {plan.price}</span>
                <span className="text-sm opacity-80">{plan.period}</span>
              </div>
              {plan.savings && (
                <span className={`text-sm font-bold ${plan.highlight ? "text-primary-foreground/90" : "text-primary"}`}>
                  {plan.savings}
                </span>
              )}

              <ul className="mt-6 space-y-3 mb-8">
                {benefits.map((b) => (
                  <li key={b} className="flex items-start gap-2 text-sm">
                    <Check className={`w-4 h-4 mt-0.5 flex-shrink-0 ${plan.highlight ? "text-primary-foreground" : "text-primary"}`} />
                    <span className={plan.highlight ? "text-primary-foreground/90" : "text-muted-foreground"}>{b}</span>
                  </li>
                ))}
              </ul>

              <Button
                className={`w-full font-bold rounded-2xl py-5 ${
                  plan.highlight
                    ? "bg-card text-foreground hover:bg-card/90"
                    : "bg-gradient-hero text-primary-foreground"
                }`}
                onClick={() => navigate("/cadastro")}
              >
                Assinar agora
              </Button>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default PricingSection;
