import { motion } from "framer-motion";
import { BookOpen, Gamepad2, Trophy, Users } from "lucide-react";

const features = [
  {
    icon: BookOpen,
    title: "3 Matérias",
    description: "Matemática, Português e Inglês adaptados para cada idade",
    color: "bg-primary/10 text-primary",
  },
  {
    icon: Gamepad2,
    title: "Gamificado",
    description: "Pontos, medalhas, níveis e missões diárias para motivar",
    color: "bg-secondary/10 text-secondary",
  },
  {
    icon: Trophy,
    title: "Conquistas",
    description: "Sistema de recompensas que celebra cada progresso",
    color: "bg-coral/10 text-coral",
  },
  {
    icon: Users,
    title: "4 Faixas Etárias",
    description: "Conteúdo personalizado de 4 a 12+ anos",
    color: "bg-accent/10 text-accent",
  },
];

const FeaturesSection = () => {
  return (
    <section className="py-20 px-4 bg-card">
      <div className="container mx-auto max-w-6xl">
        <motion.div
          className="text-center mb-14"
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
        >
          <h2 className="text-3xl md:text-4xl font-display font-extrabold mb-4">
            Por que o <span className="text-gradient-hero">LingoABC</span>? 🌟
          </h2>
          <p className="text-muted-foreground text-lg max-w-2xl mx-auto">
            Uma plataforma pensada para tornar o aprendizado irresistível
          </p>
        </motion.div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {features.map((f, i) => (
            <motion.div
              key={f.title}
              className="p-6 rounded-3xl bg-background shadow-card hover:shadow-hover transition-shadow cursor-default"
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.1 }}
              whileHover={{ y: -4 }}
            >
              <div className={`w-14 h-14 rounded-2xl ${f.color} flex items-center justify-center mb-4`}>
                <f.icon className="w-7 h-7" />
              </div>
              <h3 className="font-display font-bold text-xl mb-2">{f.title}</h3>
              <p className="text-muted-foreground text-sm">{f.description}</p>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default FeaturesSection;
