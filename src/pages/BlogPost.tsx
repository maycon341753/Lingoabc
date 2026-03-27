import Navbar from "@/components/landing/Navbar";
import Footer from "@/components/landing/Footer";
import mascot from "@/assets/mascot-owl.png";
import { useSeo } from "@/lib/useSeo";
import { Link, useParams } from "react-router-dom";

const posts = {
  "como-ensinar-criancas-a-ler-brincando": {
    title: "Como ensinar crianças a ler brincando",
    description:
      "Estratégias simples para incentivar a leitura: jogos, rotina leve, escolhas da criança e atividades para reforço escolar infantil.",
    content: (
      <>
        <h2 className="text-2xl font-display font-extrabold mt-8 mb-3">1) Transforme leitura em jogo</h2>
        <p className="text-muted-foreground font-bold">
          Crie pequenas missões: encontrar uma palavra na página, ler uma frase e ganhar pontos simbólicos. A ideia é aprender brincando, sem pressão.
        </p>
        <h2 className="text-2xl font-display font-extrabold mt-8 mb-3">2) Rotina curta e constante</h2>
        <p className="text-muted-foreground font-bold">
          Melhor 10 minutos por dia do que uma sessão longa. A constância ajuda a criança a ganhar confiança e evoluir com previsibilidade.
        </p>
        <h2 className="text-2xl font-display font-extrabold mt-8 mb-3">3) Reforço escolar infantil com atividades variadas</h2>
        <p className="text-muted-foreground font-bold">
          Intercale leitura, escrita e jogos de associação. Atividades gamificadas costumam aumentar o engajamento e reduzir a resistência.
        </p>
      </>
    ),
  },
  "melhores-metodos-de-ensino-infantil": {
    title: "Melhores métodos de ensino infantil",
    description:
      "Uma visão prática de métodos: aprendizagem ativa, repetição inteligente, micro-metas e feedback rápido para ensino para crianças.",
    content: (
      <>
        <h2 className="text-2xl font-display font-extrabold mt-8 mb-3">Aprendizagem ativa</h2>
        <p className="text-muted-foreground font-bold">
          Crianças aprendem melhor fazendo. Prefira atividades curtas e interativas, com perguntas, desafios e correção imediata.
        </p>
        <h2 className="text-2xl font-display font-extrabold mt-8 mb-3">Repetição inteligente</h2>
        <p className="text-muted-foreground font-bold">
          Revisar é essencial, mas sem cair na monotonia. Varie o formato (múltipla escolha, arrastar e ordenar, completar palavras).
        </p>
        <h2 className="text-2xl font-display font-extrabold mt-8 mb-3">Micro-metas e progresso visível</h2>
        <p className="text-muted-foreground font-bold">
          Divida o conteúdo em passos pequenos. Isso melhora motivação e favorece a conversão em plataformas de educação infantil online.
        </p>
      </>
    ),
  },
  "importancia-da-educacao-gamificada": {
    title: "A importância da educação gamificada",
    description:
      "Por que gamificação funciona: motivação, dopamina do progresso e engajamento. Ideal para plataforma educacional infantil e aprender brincando.",
    content: (
      <>
        <h2 className="text-2xl font-display font-extrabold mt-8 mb-3">Motivação e hábito</h2>
        <p className="text-muted-foreground font-bold">
          Missões e recompensas fortalecem o hábito de estudo. A criança sente que evolui e tende a voltar com mais frequência.
        </p>
        <h2 className="text-2xl font-display font-extrabold mt-8 mb-3">Feedback rápido</h2>
        <p className="text-muted-foreground font-bold">
          Correção imediata reduz frustração e acelera o aprendizado. É um diferencial para reforço escolar infantil.
        </p>
        <h2 className="text-2xl font-display font-extrabold mt-8 mb-3">Aprender brincando com foco</h2>
        <p className="text-muted-foreground font-bold">
          Quando o conteúdo é bem organizado, a gamificação não distrai: ela guia a criança por uma trilha clara de objetivos.
        </p>
      </>
    ),
  },
} as const;

type PostKey = keyof typeof posts;

const BlogPostPage = () => {
  const { slug } = useParams();
  const key = String(slug ?? "") as PostKey;
  const post = posts[key];

  const origin = typeof window !== "undefined" ? window.location.origin : "";
  const canonical = origin ? `${origin}/blog/${encodeURIComponent(String(slug ?? ""))}` : `/blog/${encodeURIComponent(String(slug ?? ""))}`;

  useSeo({
    title: post ? `${post.title} | LingoABC` : "Artigo | LingoABC",
    description: post?.description ?? "Conteúdo sobre educação infantil online e aprender brincando.",
    canonical,
    ogImage: mascot,
    ogType: "article",
    jsonLd: post
      ? {
          "@context": "https://schema.org",
          "@type": "Article",
          headline: post.title,
          description: post.description,
          image: origin ? [new URL(mascot, origin).toString()] : [mascot],
          mainEntityOfPage: canonical,
          author: { "@type": "Organization", name: "LingoABC" },
          publisher: { "@type": "Organization", name: "LingoABC", logo: { "@type": "ImageObject", url: origin ? new URL(mascot, origin).toString() : mascot } },
        }
      : undefined,
  });

  return (
    <div className="min-h-screen">
      <Navbar />
      <main className="container mx-auto max-w-3xl px-4 py-10">
        <div className="text-sm text-muted-foreground font-bold mb-6">
          <Link to="/" className="hover:underline">
            Home
          </Link>{" "}
          /{" "}
          <Link to="/blog" className="hover:underline">
            Blog
          </Link>
          {post ? ` / ${post.title}` : ""}
        </div>

        {!post ? (
          <div className="bg-card rounded-3xl shadow-card p-8">
            <h1 className="text-3xl font-display font-extrabold mb-2">Artigo não encontrado</h1>
            <p className="text-muted-foreground font-bold">Volte para o blog e escolha um artigo.</p>
            <div className="mt-4">
              <Link to="/blog" className="inline-flex items-center justify-center rounded-xl bg-gradient-hero text-primary-foreground font-bold px-6 py-4">
                Ir para o blog
              </Link>
            </div>
          </div>
        ) : (
          <article className="bg-card rounded-3xl shadow-card p-8">
            <h1 className="text-3xl md:text-4xl font-display font-extrabold">{post.title}</h1>
            <p className="text-muted-foreground font-bold mt-3">{post.description}</p>
            <div className="mt-2 text-sm text-muted-foreground font-bold">Conteúdo em pt-BR • Educação infantil online</div>
            <div className="prose prose-neutral dark:prose-invert max-w-none mt-8">{post.content}</div>
            <div className="mt-10 flex flex-col sm:flex-row gap-3">
              <Link to="/cadastro" className="inline-flex items-center justify-center rounded-xl bg-gradient-hero text-primary-foreground font-bold px-6 py-4">
                Começar grátis
              </Link>
              <Link to="/planos" className="inline-flex items-center justify-center rounded-xl border border-border bg-background font-bold px-6 py-4">
                Ver planos
              </Link>
            </div>
          </article>
        )}
      </main>
      <Footer />
    </div>
  );
};

export default BlogPostPage;

