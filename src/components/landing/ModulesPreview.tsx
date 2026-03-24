import { motion } from "framer-motion";
import { Lock, Star } from "lucide-react";

const modules = [
  {
    name: "Descoberta",
    age: "4–5 anos",
    emoji: "🌱",
    gradient: "bg-gradient-fun",
    description: "Primeiros passos no mundo das letras e números",
    lessons: 40,
  },
  {
    name: "Construção",
    age: "6–7 anos",
    emoji: "🧱",
    gradient: "bg-gradient-hero",
    description: "Formando palavras e resolvendo contas",
    lessons: 40,
  },
  {
    name: "Desenvolvimento",
    age: "8–9 anos",
    emoji: "🚀",
    gradient: "bg-gradient-cool",
    description: "Textos, problemas e vocabulário em inglês",
    lessons: 40,
  },
  {
    name: "Domínio",
    age: "10+ anos",
    emoji: "👑",
    gradient: "bg-gradient-warm",
    description: "Desafios avançados e fluência completa",
    lessons: 40,
  },
];

const ModulesPreview = () => {
  return (
    <section className="py-20 px-4">
      <div className="container mx-auto max-w-6xl">
        <motion.div
          className="text-center mb-14"
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
        >
          <h2 className="text-3xl md:text-4xl font-display font-extrabold mb-4">
            Módulos por idade 🎯
          </h2>
          <p className="text-muted-foreground text-lg max-w-2xl mx-auto">
            Conteúdo adaptado para cada fase do desenvolvimento
          </p>
        </motion.div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {modules.map((m, i) => (
            <motion.div
              key={m.name}
              className="rounded-3xl overflow-hidden shadow-card hover:shadow-hover transition-all cursor-pointer group"
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.1 }}
              whileHover={{ y: -6, scale: 1.02 }}
            >
              <div className={`${m.gradient} p-6 text-center`}>
                <motion.span
                  className="text-5xl block mb-2"
                  whileHover={{ scale: 1.2, rotate: 10 }}
                >
                  {m.emoji}
                </motion.span>
                <h3 className="font-display font-bold text-xl text-primary-foreground">
                  {m.name}
                </h3>
                <span className="text-primary-foreground/80 text-sm font-bold">
                  {m.age}
                </span>
              </div>
              <div className="p-5 bg-card">
                <p className="text-muted-foreground text-sm mb-4">
                  {m.description}
                </p>
                <div className="flex items-center justify-between text-sm">
                  <span className="flex items-center gap-1 text-sun font-bold">
                    <Star className="w-4 h-4 fill-sun" /> {m.lessons} lições
                  </span>
                  <span className="flex items-center gap-1 text-muted-foreground">
                    <Lock className="w-3 h-3" /> Premium
                  </span>
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default ModulesPreview;
