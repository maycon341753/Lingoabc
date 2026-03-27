import Navbar from "@/components/landing/Navbar";
import Footer from "@/components/landing/Footer";
import mascot from "@/assets/mascot-owl.png";
import { useSeo } from "@/lib/useSeo";
import { Link } from "react-router-dom";

const posts = [
  {
    slug: "como-ensinar-criancas-a-ler-brincando",
    title: "Como ensinar crianças a ler brincando",
    excerpt:
      "Dicas práticas para transformar leitura em diversão: jogos, rotina leve e atividades que incentivam a criança a evoluir com alegria.",
  },
  {
    slug: "melhores-metodos-de-ensino-infantil",
    title: "Melhores métodos de ensino infantil",
    excerpt:
      "Conheça abordagens que funcionam no dia a dia: reforço escolar infantil, repetição inteligente e aprendizado ativo com metas curtas.",
  },
  {
    slug: "importancia-da-educacao-gamificada",
    title: "A importância da educação gamificada",
    excerpt:
      "Entenda como missões, recompensas e progressão aumentam o engajamento e melhoram o desempenho em matemática, português e inglês.",
  },
];

const BlogPage = () => {
  const origin = typeof window !== "undefined" ? window.location.origin : "";
  const canonical = origin ? `${origin}/blog` : "/blog";
  useSeo({
    title: "Blog de Educação Infantil | LingoABC",
    description:
      "Conteúdos sobre educação infantil online, reforço escolar infantil e aprender brincando. Dicas práticas para pais, responsáveis e educadores.",
    keywords:
      "educação infantil online, reforço escolar infantil, aprender brincando, ensino para crianças, plataforma educacional infantil, educação gamificada",
    canonical,
    ogImage: mascot,
  });

  return (
    <div className="min-h-screen">
      <Navbar />
      <main className="container mx-auto max-w-4xl px-4 py-10">
        <header className="mb-8">
          <h1 className="text-3xl md:text-4xl font-display font-extrabold">Blog LingoABC</h1>
          <p className="text-muted-foreground font-bold mt-2">
            Artigos para ajudar a criança a aprender brincando, com foco em educação infantil online e reforço escolar infantil.
          </p>
        </header>

        <section className="grid gap-4">
          {posts.map((p) => (
            <article key={p.slug} className="bg-card rounded-3xl shadow-card p-6">
              <h2 className="text-xl font-display font-extrabold mb-2">
                <Link to={`/blog/${p.slug}`} className="hover:underline">
                  {p.title}
                </Link>
              </h2>
              <p className="text-muted-foreground font-bold">{p.excerpt}</p>
              <div className="mt-4">
                <Link
                  to={`/blog/${p.slug}`}
                  className="inline-flex items-center justify-center rounded-xl bg-gradient-hero text-primary-foreground font-bold px-5 py-3"
                >
                  Ler artigo
                </Link>
              </div>
            </article>
          ))}
        </section>

        <section className="mt-10 bg-card rounded-3xl shadow-card p-6">
          <h2 className="text-xl font-display font-extrabold mb-2">Comece agora</h2>
          <p className="text-muted-foreground font-bold">
            Quer uma plataforma educacional infantil completa para matemática, português e inglês? Conheça os módulos e planos.
          </p>
          <div className="mt-4 flex flex-col sm:flex-row gap-3">
            <Link to="/cadastro" className="inline-flex items-center justify-center rounded-xl bg-gradient-hero text-primary-foreground font-bold px-6 py-4">
              Começar grátis
            </Link>
            <Link to="/planos" className="inline-flex items-center justify-center rounded-xl border border-border bg-background font-bold px-6 py-4">
              Ver planos
            </Link>
          </div>
        </section>
      </main>
      <Footer />
    </div>
  );
};

export default BlogPage;

