import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { useNavigate } from "react-router-dom";
import heroKids from "@/assets/hero-kids.png";

const HeroSection = () => {
  const navigate = useNavigate();
  const autismRainbowClass =
    "bg-[linear-gradient(90deg,#ff3b30,#ff9500,#ffcc00,#34c759,#00c7be,#007aff,#5856d6,#ff2d55)] text-transparent bg-clip-text font-extrabold";

  return (
    <section className="relative overflow-hidden py-16 md:py-24 px-4">
      {/* Floating decorations */}
      <motion.div
        className="absolute top-20 left-10 w-16 h-16 rounded-full bg-sun/20"
        animate={{ y: [0, -15, 0] }}
        transition={{ duration: 4, repeat: Infinity }}
      />
      <motion.div
        className="absolute top-40 right-16 w-12 h-12 rounded-full bg-coral/20"
        animate={{ y: [0, -10, 0] }}
        transition={{ duration: 3, repeat: Infinity, delay: 1 }}
      />
      <motion.div
        className="absolute bottom-20 left-1/4 w-10 h-10 rounded-full bg-lavender/20"
        animate={{ y: [0, -12, 0] }}
        transition={{ duration: 3.5, repeat: Infinity, delay: 0.5 }}
      />

      <div className="container mx-auto max-w-6xl">
        <div className="flex flex-col lg:flex-row items-center gap-8 lg:gap-12">
          {/* Text */}
          <motion.div
            className="flex-1 text-center lg:text-left"
            initial={{ opacity: 0, x: -30 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.7 }}
          >
            <motion.span
              className="inline-block px-4 py-1.5 rounded-full bg-primary/10 text-primary font-bold text-sm mb-6"
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ delay: 0.3, type: "spring" }}
            >
              🎓 Aprendizado divertido!
            </motion.span>

            <h1 className="text-4xl md:text-5xl lg:text-6xl font-display font-extrabold leading-tight mb-6">
              <span className={`${autismRainbowClass} mr-2`}>♾</span>
              Aprenda brincando com o{" "}
              <span className="text-gradient-hero">LingoABC</span>
              <motion.span
                className="inline-block ml-2"
                animate={{ rotate: [0, 15, -15, 0] }}
                transition={{ duration: 2, repeat: Infinity, delay: 1 }}
              >
                ✨
              </motion.span>
            </h1>

            <p className="text-lg md:text-xl text-muted-foreground mb-8 max-w-lg mx-auto lg:mx-0">
              Matemática, Português e Inglês para crianças de 4 a 12 anos.
              Lições gamificadas, conquistas e muita diversão!{" "}
              <span className={autismRainbowClass}>♾</span>
            </p>

            <div className="flex flex-col sm:flex-row gap-4 justify-center lg:justify-start">
              <Button
                size="lg"
                className="bg-gradient-hero text-lg font-bold px-8 py-6 rounded-2xl shadow-playful hover:scale-105 transition-transform"
                onClick={() => navigate("/cadastro")}
              >
                🚀 Começar Grátis
              </Button>
              <Button
                variant="outline"
                size="lg"
                className="text-lg font-bold px-8 py-6 rounded-2xl border-2 hover:scale-105 transition-transform"
                onClick={() => navigate("/planos")}
              >
                Ver Planos
              </Button>
            </div>

            <div className="flex items-center gap-6 mt-8 justify-center lg:justify-start">
              <div className="flex -space-x-2">
                {["🧒", "👧", "👦", "👶"].map((emoji, i) => (
                  <span
                    key={i}
                    className="w-10 h-10 rounded-full bg-muted flex items-center justify-center text-xl border-2 border-card"
                  >
                    {emoji}
                  </span>
                ))}
              </div>
              <p className="text-sm text-muted-foreground">
                <span className="font-bold text-foreground">+2.500</span> crianças aprendendo
              </p>
            </div>
          </motion.div>

          {/* Hero Image */}
          <motion.div
            className="flex-1 flex justify-center"
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.7, delay: 0.2 }}
          >
            <motion.img
              src={heroKids}
              alt="Crianças aprendendo com LingoABC"
              className="w-full max-w-md lg:max-w-lg"
              loading="eager"
              decoding="async"
              fetchPriority="high"
              animate={{ y: [0, -8, 0] }}
              transition={{ duration: 4, repeat: Infinity }}
            />
          </motion.div>
        </div>
      </div>
    </section>
  );
};

export default HeroSection;
