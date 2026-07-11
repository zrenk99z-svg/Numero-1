# Refúgio Nerd — Radar de Vídeos

Aplicativo web para descobrir **temas de vídeos com alto potencial de
visualização** para o canal Refúgio Nerd (filmes, séries, HQs, animações,
super-heróis e cultura nerd).

> App independente dentro deste repositório. A raiz do repositório é o projeto
> Remotion da vinheta do canal; este radar vive em `radar/` e tem o próprio
> `package.json`.

## Funcionalidades

1. **Descoberta de temas** — digite um assunto (Superman, One Piece, Marvel…)
   e gere **20 ideias** de vídeo. Cada ideia traz título sugerido, categoria,
   nível de interesse (0–100), potencial de cliques, dificuldade de produção e
   tipo de vídeo (review, teoria, ranking, explicação, notícia, curiosidade).
2. **Radar de tendências** — temas em alta simulados: filmes em lançamento,
   séries do momento, HQs comentadas e jogos em alta. Clique para gerar ideias.
3. **Pontuação automática** — cada ideia recebe uma nota (0–100) combinando
   interesse do público, facilidade de produção, potencial de busca e potencial
   de thumbnail; o feed é ordenado do melhor para o pior tema.
4. **Salvar ideias** — guarde favoritas na lista **Próximos Vídeos**,
   persistida no `localStorage` do navegador.
5. **Gerador de thumbnail** — para cada tema salvo, gera texto principal, texto
   secundário, emoção sugerida (choque, mistério, hype, nostalgia) e cores
   recomendadas, com prévia visual 16:9.
6. **Modo Viral** (bônus) — destaca os 5 temas com maior chance de gerar views
   no curto prazo.

## Tecnologias

React 18 · TypeScript · Vite · Tailwind CSS · `localStorage` (sem back-end).

## Como executar localmente

Requer Node.js 18+.

```bash
cd radar
npm install
npm run dev        # http://localhost:5173
```

Outros comandos:

```bash
npm run build      # type-check + build de produção em dist/
npm run preview    # serve o build de produção
npm run lint       # type-check (tsc --noEmit)
```

## Estrutura

```
radar/
  index.html
  tailwind.config.js        cores (azul elétrico/roxo), glow, animações
  src/
    App.tsx                 layout principal (header, busca, ranking, radar, salvos)
    types.ts                tipos de domínio
    lib/
      ideaGenerator.ts      gera 20 ideias determinísticas por assunto
      scoring.ts            pontuação final + score viral + ranking
      thumbnail.ts          conceito de thumbnail por ideia
    data/trends.ts          temas em alta simulados
    hooks/useLocalStorage.ts
    components/
      SearchBar.tsx  IdeaCard.tsx  ScoreRing.tsx  MetricBar.tsx
      TrendRadar.tsx  ViralMode.tsx  SavedList.tsx  ThumbnailPreview.tsx
      Icons.tsx  categoryMeta.tsx
```

## Como a pontuação é calculada

`score = 0.32·interesse + 0.18·facilidade + 0.28·busca + 0.22·thumbnail`
(facilidade = `100 − dificuldade`). Ver `src/lib/scoring.ts`.

O **Modo Viral** usa outra fórmula, priorizando cliques e busca de curto prazo:
`0.40·cliques + 0.25·busca + 0.25·thumbnail + 0.10·facilidade`.

Os dados são **mockados/simulados** para demonstração — o gerador é
determinístico, então o mesmo assunto sempre produz as mesmas ideias.
