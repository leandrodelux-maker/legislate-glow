import TransparencyLayout from "@/components/transparency/TransparencyLayout";
import { Radar, ExternalLink, Shield, ListChecks, ArrowRight, Info } from "lucide-react";
import { Link } from "@/lib/roteador-transparencia";
import { useInstitutionalData } from "@/hooks/useInstitutionalData";

/*
 * This page used to show "Nível Ouro / 9.2 / 2025" and a seal placeholder that were
 * example data. No official PNTP result for the municipality was confirmed, so the
 * page now points to the official Radar instead of displaying any score or seal.
 */
const RADAR_URL = "https://radardatransparencia.atricon.org.br";

const RadarPage = () => {
  const { data } = useInstitutionalData();
  const ente = data.municipio ? `Câmara Municipal de ${data.municipio}${data.uf ? ` (${data.uf})` : ""}` : "a Prefeitura";

  return (
    <TransparencyLayout title="Radar da Transparência" description="Avaliação do município no Programa Nacional de Transparência Pública."
      breadcrumbs={[{ label: "Início", href: "/" }, { label: "Transparência", href: "/transparencia" }, { label: "Radar da Transparência" }]}>
      <header className="mb-10 border-b border-border pb-10">
        <nav aria-label="Você está em" className="mb-3 text-[0.8125rem] text-muted-foreground">
          <Link to="/" className="hover:text-primary hover:underline">Início</Link>
          <span className="mx-1.5" aria-hidden="true">/</span>
          <Link to="/transparencia" className="hover:text-primary hover:underline">Transparência</Link>
          <span className="mx-1.5" aria-hidden="true">/</span>
          <span className="font-medium text-foreground" aria-current="page">Radar da Transparência</span>
        </nav>
        <p className="eyebrow">PNTP · Atricon</p>
        <h1 className="mt-2 font-display text-[2rem] font-extrabold leading-[1.05] tracking-[-0.03em] text-foreground md:text-[2.75rem]">Radar da Transparência Pública</h1>
        <p className="section-lead">Como é avaliada a transparência dos portais públicos e onde consultar o resultado oficial.</p>
      </header>

      <div className="grid gap-8 lg:grid-cols-[1fr_24rem]">
        <div className="space-y-8">
          <section aria-labelledby="o-que-e" className="rounded-leaf border border-border/70 bg-card p-6 md:p-8">
            <div className="flex items-center gap-3">
              <span className="flex h-11 w-11 items-center justify-center rounded-leaf-sm bg-primary/[0.08] text-primary"><Radar className="h-5 w-5" aria-hidden="true" /></span>
              <h2 id="o-que-e" className="font-display text-xl font-bold text-foreground">O que é o Radar da Transparência?</h2>
            </div>
            <p className="mt-4 text-[0.9375rem] leading-relaxed text-muted-foreground">
              O Radar da Transparência Pública é a ferramenta da Atricon (Associação dos Membros dos Tribunais de Contas do Brasil) que divulga
              os índices de transparência dos portais públicos de todo o país. Os resultados vêm das avaliações do Programa Nacional de
              Transparência Pública (PNTP), realizadas pelos Tribunais de Contas.
            </p>
          </section>

          <section aria-labelledby="pntp" className="rounded-leaf border border-border/70 bg-card p-6 md:p-8">
            <div className="flex items-center gap-3">
              <span className="flex h-11 w-11 items-center justify-center rounded-leaf-sm bg-primary/[0.08] text-primary"><Shield className="h-5 w-5" aria-hidden="true" /></span>
              <h2 id="pntp" className="font-display text-xl font-bold text-foreground">Programa Nacional de Transparência Pública (PNTP)</h2>
            </div>
            <p className="mt-4 text-[0.9375rem] leading-relaxed text-muted-foreground">
              O PNTP é conduzido pela Atricon em conjunto com Tribunais de Contas, com critérios baseados na Lei de Acesso à Informação
              (Lei nº 12.527/2011), na Lei de Responsabilidade Fiscal e em outras normas aplicáveis. Cada portal recebe um índice de
              transparência e, conforme o resultado, pode obter selo de qualidade.
            </p>
          </section>

          <section aria-labelledby="criterios" className="rounded-leaf border border-border/70 bg-card p-6 md:p-8">
            <div className="flex items-center gap-3">
              <span className="flex h-11 w-11 items-center justify-center rounded-leaf-sm bg-primary/[0.08] text-primary"><ListChecks className="h-5 w-5" aria-hidden="true" /></span>
              <h2 id="criterios" className="font-display text-xl font-bold text-foreground">Critérios e onde encontrar cada informação</h2>
            </div>
            <p className="mt-4 text-[0.9375rem] leading-relaxed text-muted-foreground">
              A matriz de critérios reúne, para cada item avaliado, o local deste portal onde a informação correspondente está publicada.
            </p>
            <Link to="/transparencia/atricon" className="link-arrow mt-5">
              Ver matriz de critérios <ArrowRight className="h-4 w-4" aria-hidden="true" />
            </Link>
          </section>
        </div>

        {/* Official result — no local score or seal is displayed */}
        <aside aria-labelledby="situacao" className="surface-deep rounded-leaf h-fit p-6 text-white md:p-8">
          <p className="eyebrow eyebrow-on-dark">Situação do município</p>
          <h2 id="situacao" className="mt-2 font-display text-2xl font-bold leading-tight">Consulte a avaliação oficial</h2>
          <p className="mt-3 text-sm leading-relaxed text-white/75">
            O índice, o nível e eventual selo de {ente} são publicados exclusivamente pelo Radar da Transparência Pública.
            Este portal não exibe nota nem selo próprios para evitar informações divergentes da avaliação oficial.
          </p>
          <a
            href={RADAR_URL}
            target="_blank"
            rel="noopener noreferrer"
            className="focus-on-dark mt-6 flex h-12 w-full items-center justify-center gap-2 rounded-xl bg-sun px-5 text-sm font-bold text-sun-foreground transition hover:brightness-105"
          >
            Acessar o Radar da Transparência <ExternalLink className="h-4 w-4" aria-hidden="true" />
            <span className="sr-only">(abre em nova aba)</span>
          </a>
          <p className="mt-4 flex items-start gap-2 text-xs leading-relaxed text-white/60">
            <Info className="mt-0.5 h-3.5 w-3.5 shrink-0" aria-hidden="true" />
            No Radar, pesquise pelo nome do município e pela UF para ver o resultado de cada ciclo de avaliação.
          </p>
        </aside>
      </div>

      <section aria-labelledby="compromisso" className="mt-8 rounded-leaf border border-primary/15 bg-primary/[0.04] p-6 md:p-8">
        <h2 id="compromisso" className="font-display text-xl font-bold text-foreground">Compromisso com a transparência</h2>
        <p className="mt-3 max-w-3xl text-[0.9375rem] leading-relaxed text-muted-foreground">
          A Câmara Municipal reafirma seu compromisso com a transparência pública como pilar da gestão democrática, buscando aprimorar
          continuamente a divulgação de dados, facilitar o acesso à informação e promover a participação social na fiscalização dos recursos públicos.
        </p>
      </section>
    </TransparencyLayout>
  );
};

export default RadarPage;
