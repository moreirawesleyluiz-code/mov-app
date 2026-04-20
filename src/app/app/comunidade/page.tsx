/** Evita pré-render estático que, em dev, pode combinar mal com o runtime webpack dos chunks do servidor. */
export const dynamic = "force-dynamic";

const communityMosaic = {
  hero: {
    src: "/comunidade/jantar.jpg",
    alt: "Pessoas conversando durante jantar noturno em ambiente urbano.",
    objectPosition: "50% 62%",
  },
  highlights: [
    {
      src: "/comunidade/speed-dating.jpg",
      alt: "Participantes em dinâmica social de speed dating.",
      objectPosition: "50% 42%",
    },
    {
      src: "/comunidade/corrida.jpg",
      alt: "Grupo correndo junto ao ar livre.",
      objectPosition: "50% 45%",
    },
  ],
  supporting: [
    {
      src: "/comunidade/trilha.jpg",
      alt: "Duas pessoas em trilha de floresta.",
      objectPosition: "50% 46%",
    },
    {
      src: "/comunidade/danca.jpg",
      alt: "Pessoas dançando juntas em espaço aberto.",
      objectPosition: "50% 43%",
    },
    {
      src: "/comunidade/palco.jpg",
      alt: "Apresentação ao vivo em palco com público.",
      objectPosition: "50% 40%",
    },
    {
      src: "/comunidade/canto.jpg",
      alt: "Grupo cantando em roda.",
      objectPosition: "50% 37%",
    },
    {
      src: "/comunidade/escalada.jpg",
      alt: "Pessoas em escalada em parede rochosa.",
      objectPosition: "52% 45%",
    },
  ],
} as const;

export default function ComunidadePage() {
  return (
    <div className="mx-auto w-full max-w-3xl">
      <h1 className="font-display text-3xl leading-tight tracking-[-0.02em] text-movApp-ink md:text-4xl">
        A comunidade MOV
      </h1>
      <p className="mt-3 max-w-2xl text-pretty text-sm leading-relaxed text-movApp-muted sm:text-base">
        A MOV conecta pessoas com intenção e transforma interesse em convivência real. O app organiza a sua
        entrada na jornada, enquanto a comunidade segue ativa no{" "}
        <strong className="font-medium text-movApp-ink">WhatsApp</strong>, com ritmo e continuidade.
      </p>

      <section className="mt-7 rounded-2xl border border-movApp-border bg-movApp-paper p-3 shadow-sm sm:mt-8 sm:p-4">
        <div className="grid grid-cols-1 gap-2.5 sm:gap-3">
          <figure className="relative overflow-hidden rounded-xl border border-movApp-border/70 bg-movApp-subtle/50">
            <img
              src={communityMosaic.hero.src}
              alt={communityMosaic.hero.alt}
              loading="lazy"
              className="h-56 w-full object-cover sm:h-64"
              style={{ objectPosition: communityMosaic.hero.objectPosition }}
            />
            <div className="pointer-events-none absolute inset-0 bg-gradient-to-t from-black/20 via-transparent to-transparent" />
          </figure>

          <div className="grid grid-cols-2 gap-2.5 sm:gap-3">
            {communityMosaic.highlights.map((photo) => (
              <figure
                key={photo.src}
                className="relative overflow-hidden rounded-xl border border-movApp-border/70 bg-movApp-subtle/50"
              >
                <img
                  src={photo.src}
                  alt={photo.alt}
                  loading="lazy"
                  className="h-32 w-full object-cover sm:h-36"
                  style={{ objectPosition: photo.objectPosition }}
                />
                <div className="pointer-events-none absolute inset-0 bg-gradient-to-t from-black/15 via-transparent to-transparent" />
              </figure>
            ))}
          </div>

          <div className="grid grid-cols-2 gap-2.5 sm:gap-3">
            {communityMosaic.supporting.map((photo, idx) => (
              <figure
                key={photo.src}
                className={`relative overflow-hidden rounded-xl border border-movApp-border/70 bg-movApp-subtle/50 ${
                  idx === 2 ? "col-span-2" : ""
                }`}
              >
                <img
                  src={photo.src}
                  alt={photo.alt}
                  loading="lazy"
                  className={`w-full object-cover ${idx === 2 ? "h-36 sm:h-40" : "h-32 sm:h-36"}`}
                  style={{ objectPosition: photo.objectPosition }}
                />
                <div className="pointer-events-none absolute inset-0 bg-gradient-to-t from-black/10 via-transparent to-transparent" />
              </figure>
            ))}
          </div>
        </div>
      </section>

      <div className="mt-8 space-y-6">
        <div className="rounded-2xl border border-movApp-border bg-movApp-paper p-6 shadow-sm sm:p-8">
          <h2 className="font-display text-xl leading-tight text-movApp-ink">O que fica no app</h2>
          <p className="mt-4 text-sm leading-relaxed text-movApp-muted">
            O app é a porta de entrada da comunidade MOV. É aqui que você acessa sua jornada, entra nos
            grupos certos para o seu momento e acompanha uma experiência mais organizada, intencional e
            curada.
          </p>
          <ul className="mt-4 list-inside list-disc space-y-2.5 text-sm leading-relaxed text-movApp-muted">
            <li>entrada na comunidade com curadoria</li>
            <li>acesso à jornada e aos próximos passos</li>
            <li>direcionamento para os grupos certos</li>
            <li>experiência mais organizada, clara e segura</li>
          </ul>
        </div>

        <div className="rounded-2xl border border-movApp-border bg-movApp-paper p-6 shadow-sm sm:p-8">
          <h2 className="font-display text-xl leading-tight text-movApp-ink">Uma comunidade viva e curada</h2>
          <p className="mt-4 text-sm leading-relaxed text-movApp-muted">
            A comunidade MOV continua no WhatsApp de forma ativa e curada. Cada grupo gira em torno de um
            interesse em comum e conta com 1 encontro por mês, criando constância, proximidade e novas
            conexões ao longo do tempo.
          </p>
          <p className="mt-3 text-sm leading-relaxed text-movApp-muted">
            Trilhas, corrida, música ao vivo, churrasco, escalada, jantares, speed dating e outros
            encontros presenciais.
          </p>
          <p className="mt-3 text-sm leading-relaxed text-movApp-ink">
            Mais do que entrar em um grupo, você entra em uma comunidade com curadoria.
          </p>
        </div>
      </div>
    </div>
  );
}
