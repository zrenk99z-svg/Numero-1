import { useMemo, useState } from "react";
import type { VideoIdea } from "./types";
import { generateIdeas } from "./lib/ideaGenerator";
import { rankIdeas } from "./lib/scoring";
import { useLocalStorage } from "./hooks/useLocalStorage";

import { SearchBar } from "./components/SearchBar";
import { IdeaCard } from "./components/IdeaCard";
import { TrendRadar } from "./components/TrendRadar";
import { ViralMode } from "./components/ViralMode";
import { SavedList } from "./components/SavedList";
import { FireIcon, RadarIcon, SparkIcon } from "./components/Icons";

const STORAGE_KEY = "refugio-nerd:proximos-videos";

export default function App() {
  const [saved, setSaved] = useLocalStorage<VideoIdea[]>(STORAGE_KEY, []);
  const [subject, setSubject] = useState("");
  const [ideas, setIdeas] = useState<VideoIdea[]>([]);
  const [loading, setLoading] = useState(false);
  const [viralOnly, setViralOnly] = useState(false);

  const savedIds = useMemo(() => new Set(saved.map((s) => s.id)), [saved]);
  const ranked = useMemo(() => rankIdeas(ideas), [ideas]);

  function handleSearch(term: string) {
    setLoading(true);
    setSubject(term);
    // pequeno delay para dar feedback de "gerando"
    window.setTimeout(() => {
      setIdeas(generateIdeas(term));
      setLoading(false);
      document
        .getElementById("resultados")
        ?.scrollIntoView({ behavior: "smooth", block: "start" });
    }, 320);
  }

  function toggleSave(idea: VideoIdea) {
    setSaved((prev) =>
      prev.some((s) => s.id === idea.id)
        ? prev.filter((s) => s.id !== idea.id)
        : [...prev, idea],
    );
  }

  return (
    <div className="min-h-screen">
      <Header savedCount={saved.length} />

      <main className="mx-auto max-w-7xl space-y-14 px-4 pb-24 sm:px-6">
        {/* Hero + busca */}
        <section className="pt-10 sm:pt-16">
          <div className="mx-auto max-w-3xl text-center">
            <span className="chip mb-4 bg-white/5 text-electric-400 ring-1 ring-electric-500/20">
              <SparkIcon className="h-3.5 w-3.5" /> Radar de Vídeos
            </span>
            <h1 className="font-display text-4xl font-bold leading-tight text-slate-50 sm:text-5xl">
              Encontre o próximo vídeo{" "}
              <span className="bg-gradient-to-r from-electric-400 to-grape-400 bg-clip-text text-transparent">
                bombástico
              </span>{" "}
              do Refúgio Nerd
            </h1>
            <p className="mx-auto mt-4 max-w-xl text-slate-400">
              Digite um assunto e receba 20 ideias pontuadas por interesse,
              busca, produção e potencial de thumbnail.
            </p>
          </div>

          <div className="mx-auto mt-8 max-w-3xl">
            <SearchBar onSearch={handleSearch} loading={loading} />
          </div>
        </section>

        {/* Resultados */}
        <section id="resultados" className="scroll-mt-24 space-y-6">
          {ideas.length > 0 && (
            <>
              <div className="flex flex-wrap items-center justify-between gap-3">
                <div>
                  <h2 className="font-display text-lg font-bold text-slate-100">
                    Ranking para{" "}
                    <span className="text-electric-400">“{subject}”</span>
                  </h2>
                  <p className="text-sm text-slate-400">
                    {ideas.length} ideias, ordenadas do melhor para o pior tema.
                  </p>
                </div>
                <button
                  onClick={() => setViralOnly((v) => !v)}
                  className={
                    viralOnly
                      ? "inline-flex items-center gap-2 rounded-xl bg-gradient-to-r from-rose-500 to-grape-500 px-4 py-2.5 font-semibold text-white shadow-glow-grape transition active:scale-95"
                      : "btn-ghost"
                  }
                >
                  <FireIcon className="h-4 w-4" />
                  {viralOnly ? "Mostrando Modo Viral" : "Modo Viral"}
                </button>
              </div>

              {viralOnly ? (
                <ViralMode
                  ideas={ideas}
                  savedIds={savedIds}
                  onToggleSave={toggleSave}
                />
              ) : (
                <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
                  {ranked.map((idea, i) => (
                    <IdeaCard
                      key={idea.id}
                      idea={idea}
                      rank={i + 1}
                      saved={savedIds.has(idea.id)}
                      onToggleSave={toggleSave}
                    />
                  ))}
                </div>
              )}
            </>
          )}

          {ideas.length === 0 && (
            <div className="card-glow grid place-items-center gap-3 p-12 text-center">
              <RadarIcon className="h-10 w-10 animate-pulse-glow text-electric-400" />
              <p className="max-w-md text-slate-400">
                Comece pesquisando um herói, filme, série ou HQ — ou explore o{" "}
                <a href="#tendencias" className="text-electric-400 hover:underline">
                  Radar de Tendências
                </a>{" "}
                abaixo.
              </p>
            </div>
          )}
        </section>

        <TrendRadar onExplore={handleSearch} />

        <SavedList
          saved={saved}
          onRemove={(id) => setSaved((prev) => prev.filter((s) => s.id !== id))}
          onClear={() => setSaved([])}
        />
      </main>

      <Footer />
    </div>
  );
}

function Header({ savedCount }: { savedCount: number }) {
  return (
    <header className="sticky top-0 z-20 border-b border-white/5 bg-void-900/70 backdrop-blur-md">
      <div className="mx-auto flex max-w-7xl items-center justify-between px-4 py-3 sm:px-6">
        <a href="#" className="flex items-center gap-3">
          <span className="relative grid h-10 w-10 place-items-center rounded-xl bg-gradient-to-br from-electric-500 to-grape-500 shadow-glow-grape">
            <RadarIcon className="h-5 w-5 text-white" />
          </span>
          <span className="leading-tight">
            <span className="block font-display text-sm font-bold text-slate-100">
              Refúgio Nerd
            </span>
            <span className="block text-xs text-electric-400">
              Radar de Vídeos
            </span>
          </span>
        </a>
        <nav className="hidden items-center gap-6 text-sm text-slate-400 md:flex">
          <a href="#tendencias" className="transition hover:text-slate-100">
            Tendências
          </a>
          <a href="#viral" className="transition hover:text-slate-100">
            Modo Viral
          </a>
          <a href="#proximos" className="transition hover:text-slate-100">
            Próximos Vídeos
          </a>
        </nav>
        <a
          href="#proximos"
          className="inline-flex items-center gap-2 rounded-xl glass px-3 py-2 text-sm font-medium text-slate-200 transition hover:border-electric-500/40"
        >
          <span className="grid h-5 w-5 place-items-center rounded-full bg-grape-500/20 text-[11px] font-bold text-grape-400">
            {savedCount}
          </span>
          Salvos
        </a>
      </div>
    </header>
  );
}

function Footer() {
  return (
    <footer className="border-t border-white/5 py-8">
      <div className="mx-auto max-w-7xl px-4 text-center text-sm text-slate-500 sm:px-6">
        <p>
          Refúgio Nerd — Radar de Vídeos · dados de demonstração simulados ·
          salvos localmente no seu navegador.
        </p>
      </div>
    </footer>
  );
}
