import { MUNICIPIO } from "@/config/municipio";
import { useInstitutionalData } from "@/hooks/useInstitutionalData";
import { useCallback, useMemo, useState } from "react";
import { Link } from "@/lib/roteador-transparencia";
import { motion } from "framer-motion";
import {
  ArrowRight, ArrowUpRight, Calendar, HelpCircle, MessageCircleQuestion, Megaphone, Radar, Database, ShieldCheck, Sparkles,
} from "lucide-react";
import TransparencyLayout from "@/components/transparency/TransparencyLayout";
import TransparenciaBusca from "@/components/transparency/TransparenciaBusca";
import ResumoFinanceiro from "@/components/transparency/ResumoFinanceiro";
import { TEMAS, TODOS_ITENS, PERGUNTAS_CIDADAO, findItem, itemHref } from "@/data/transparenciaCatalogo";

const fadeUp = { initial: { opacity: 0, y: 14 }, animate: { opacity: 1, y: 0 }, transition: { duration: 0.35 } };

const SectionTitle = ({ eyebrow, title, desc }: { eyebrow: string; title: string; desc?: string }) => (
  <div className="mb-6 md:mb-8">
    <p className="text-xs font-bold uppercase tracking-[0.16em] text-primary">{eyebrow}</p>
    <h2 className="font-display text-2xl md:text-3xl font-bold text-foreground mt-1">{title}</h2>
    {desc && <p className="text-muted-foreground mt-2 max-w-2xl">{desc}</p>}
  </div>
);

const participacao = [
  { icon: MessageCircleQuestion, title: "Pedir uma informação", desc: "e-SIC: qualquer pessoa pode pedir, sem justificar.", href: "/e-sic" },
  { icon: Megaphone, title: "Falar com a Ouvidoria", desc: "Denúncias, reclamações, sugestões e elogios.", href: "/contato" },
  { icon: Radar, title: "Radar da Transparência", desc: "Como o município atende aos critérios da Atricon.", href: "/transparencia/atricon" },
  { icon: Database, title: "Dados Abertos", desc: "Baixe as bases em formato aberto.", href: "/transparencia/dados-abertos" },
  { icon: HelpCircle, title: "Perguntas Frequentes", desc: "Entenda os termos e como consultar.", href: "/transparencia/perguntas-frequentes" },
];

const TransparenciaIndex = () => {
  const { data: inst } = useInstitutionalData();
  const [sincronizadoEm, setSincronizadoEm] = useState<string | null>(null);
  const onResumoAtualizado = useCallback((iso: string) => setSincronizadoEm(iso), []);
  const [filtroTema, setFiltroTema] = useState<string>("todos");

  const populares = TODOS_ITENS.filter((i) => i.popular).slice(0, 6);
  const indice = useMemo(() => {
    const lista = TODOS_ITENS.filter((i) => filtroTema === "todos" || i.tema.id === filtroTema)
      .sort((a, b) => a.label.localeCompare(b.label, "pt-BR"));
    const grupos = new Map<string, typeof lista>();
    lista.forEach((i) => {
      const letra = i.label[0].normalize("NFD").replace(/[̀-ͯ]/g, "").toUpperCase();
      grupos.set(letra, [...(grupos.get(letra) ?? []), i]);
    });
    return [...grupos.entries()];
  }, [filtroTema]);

  return (
    <TransparencyLayout title="Portal da Transparência" variant="home">
      {/* Destaque */}
      <section className="relative z-30 bg-primary text-primary-foreground">
        <div className="absolute inset-0 pointer-events-none" aria-hidden
          style={{ background: "radial-gradient(900px 420px at 85% 10%, color-mix(in oklab, var(--gold) 22%, transparent), transparent 60%), radial-gradient(700px 380px at 0% 100%, color-mix(in oklab, var(--success) 25%, transparent), transparent 60%)" }} />
        <div className="absolute inset-0 opacity-[0.08] pointer-events-none" aria-hidden
          style={{ backgroundImage: "radial-gradient(circle at 1px 1px, white 1px, transparent 0)", backgroundSize: "24px 24px" }} />
        <div className="container mx-auto px-4 py-12 md:py-16 relative grid gap-10 lg:grid-cols-[1.25fr_1fr] lg:items-center">
          <div>
            <p className="inline-flex items-center gap-2 text-xs font-bold uppercase tracking-[0.16em] text-white/80 bg-white/10 px-3 py-1.5 rounded-full">
              <ShieldCheck className="h-3.5 w-3.5" aria-hidden /> Lei de Acesso à Informação · LC 131/2009
            </p>
            <h1 className="font-display text-4xl md:text-5xl font-bold leading-[1.05] mt-4">
              Portal da <span className="text-[var(--gold)]">Transparência</span>
            </h1>
            <p className="text-white/85 text-base md:text-lg mt-4 max-w-xl leading-relaxed">
              Acompanhe como o dinheiro público da Câmara Municipal de {inst.municipio || MUNICIPIO.cidade} é arrecadado e aplicado. Tudo o que é publicado, em um só lugar.
            </p>
            <div className="mt-7 max-w-2xl">
              <TransparenciaBusca size="lg" />
            </div>
            <div className="mt-4 flex flex-wrap items-center gap-2">
              <span className="text-xs font-semibold text-white/70 mr-1">Mais procurados:</span>
              {populares.map((i) => (
                <Link key={i.slug} to={itemHref(i)} className="text-xs font-semibold bg-white/10 hover:bg-white/20 border border-white/15 px-3 py-1.5 rounded-full transition">
                  {i.label}
                </Link>
              ))}
            </div>
          </div>
          <ResumoFinanceiro onAtualizado={onResumoAtualizado} />
        </div>
      </section>

      <div className="container mx-auto px-4 py-12 md:py-16 space-y-16 md:space-y-20">
        {/* Perguntas do cidadão */}
        <motion.section {...fadeUp}>
          <SectionTitle eyebrow="Comece por aqui" title="O que você quer saber?" desc="Atalhos para as dúvidas mais comuns sobre a gestão do município." />
          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-3">
            {PERGUNTAS_CIDADAO.map(({ pergunta, slug }) => {
              const item = findItem(slug);
              if (!item) return null;
              return (
                <Link key={pergunta} to={itemHref(item)}
                  className="group relative flex flex-col justify-between gap-6 min-h-[132px] bg-card border border-border/50 rounded-2xl p-5 hover:-translate-y-0.5 hover:shadow-lg transition overflow-hidden">
                  <span className="absolute inset-x-0 top-0 h-1" style={{ backgroundColor: item.tema.color }} aria-hidden />
                  <p className="font-display text-lg font-semibold leading-snug text-foreground">{pergunta}</p>
                  <span className="flex items-center justify-between text-xs font-semibold" style={{ color: item.tema.color }}>
                    {item.label}
                    <ArrowUpRight className="h-4 w-4 transition group-hover:translate-x-0.5 group-hover:-translate-y-0.5" aria-hidden />
                  </span>
                </Link>
              );
            })}
          </div>
        </motion.section>

        {/* Temas */}
        <motion.section {...fadeUp}>
          <SectionTitle eyebrow="Navegue por tema" title="Tudo organizado por assunto" desc="Os mesmos temas do Portal da Transparência oficial, com cada informação em linguagem simples." />
          <div className="grid md:grid-cols-2 xl:grid-cols-3 gap-4">
            {TEMAS.map((tema) => (
              <article key={tema.id} className="group bg-card border border-border/50 rounded-3xl overflow-hidden hover:shadow-xl transition flex flex-col">
                <Link to={`/transparencia/tema/${tema.id}`} className="relative block p-6 text-white overflow-hidden"
                  style={{ background: `linear-gradient(135deg, ${tema.color}, color-mix(in srgb, ${tema.color} 72%, #0b1f1a))` }}>
                  <tema.icon className="absolute -right-5 -bottom-6 h-28 w-28 opacity-15 transition group-hover:scale-110" aria-hidden />
                  <span className="w-11 h-11 rounded-2xl bg-white/20 flex items-center justify-center">
                    <tema.icon className="h-5 w-5" aria-hidden />
                  </span>
                  <h3 className="font-display text-xl font-bold mt-4">{tema.label}</h3>
                  <p className="text-sm text-white/85 mt-1">{tema.desc}</p>
                </Link>
                <ul className="p-3 flex-1">
                  {tema.items.slice(0, 4).map((item) => (
                    <li key={item.slug}>
                      <Link to={itemHref(item)} className="flex items-center justify-between gap-2 px-3 py-2 rounded-xl text-sm font-medium text-foreground hover:bg-muted/60 transition">
                        {item.label}
                        <ArrowRight className="h-3.5 w-3.5 text-muted-foreground shrink-0" aria-hidden />
                      </Link>
                    </li>
                  ))}
                </ul>
                <Link to={`/transparencia/tema/${tema.id}`} className="mx-3 mb-3 flex items-center justify-center gap-1.5 text-sm font-semibold py-2.5 rounded-xl border border-border/60 hover:bg-muted/50 transition"
                  style={{ color: tema.color }}>
                  Ver os {tema.items.length} itens <ArrowRight className="h-4 w-4" aria-hidden />
                </Link>
              </article>
            ))}
            {/* Bloco de apoio no espaço que sobra da grade */}
            <article className="rounded-3xl p-6 border-2 border-dashed border-border flex flex-col justify-between gap-4">
              <div>
                <Sparkles className="h-6 w-6 text-primary" aria-hidden />
                <h3 className="font-display text-xl font-bold mt-3 text-foreground">Não encontrou o que procurava?</h3>
                <p className="text-sm text-muted-foreground mt-1">Toda informação pública pode ser pedida pelo e-SIC. A resposta é gratuita e o prazo é de até 20 dias.</p>
              </div>
              <Link to="/e-sic" className="inline-flex items-center justify-center gap-1.5 bg-primary text-primary-foreground font-semibold text-sm py-3 rounded-xl hover:bg-primary/90 transition">
                Fazer um pedido de informação <ArrowRight className="h-4 w-4" aria-hidden />
              </Link>
            </article>
          </div>
        </motion.section>

        {/* Índice A–Z */}
        <motion.section {...fadeUp}>
          <SectionTitle eyebrow="Índice de A a Z" title={`Tudo o que está publicado (${TODOS_ITENS.length} itens)`} />
          <div className="flex items-center gap-2 mb-6">
            <label htmlFor="tema-indice" className="text-sm font-semibold text-foreground">Tema</label>
            <select id="tema-indice" value={filtroTema} onChange={(e) => setFiltroTema(e.target.value)} className="h-11 w-full sm:w-auto sm:max-w-[16rem] min-w-0 rounded-xl border border-border/60 bg-card px-3 text-sm font-semibold focus:outline-none focus:ring-4 focus:ring-primary/15">
              <option value="todos">Todos</option>
              {TEMAS.map((t) => <option key={t.id} value={t.id}>{t.label}</option>)}
            </select>
          </div>
          <div className="bg-card border border-border/50 rounded-3xl p-5 md:p-8 columns-2 lg:columns-3 gap-5 md:gap-8">
            {indice.map(([letra, itens]) => (
              <div key={letra} className="break-inside-avoid mb-5">
                <p className="font-display text-2xl font-bold text-primary/80 mb-1">{letra}</p>
                <ul>
                  {itens.map((i) => (
                    <li key={i.slug}>
                      <Link to={itemHref(i)} className="group flex items-center gap-2 py-1 text-sm text-foreground hover:text-primary">
                        <span className="w-1.5 h-1.5 rounded-full shrink-0" style={{ backgroundColor: i.tema.color }} aria-hidden />
                        <span className="group-hover:underline underline-offset-2">{i.label}</span>
                      </Link>
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
        </motion.section>

        {/* Participação */}
        <motion.section {...fadeUp}>
          <SectionTitle eyebrow="Participe" title="Fale com a Câmara e acompanhe" />
          <div className="grid sm:grid-cols-2 lg:grid-cols-5 gap-3">
            {participacao.map(({ icon: Icon, title, desc, href }) => (
              <Link key={title} to={href} className="group bg-card border border-border/50 rounded-2xl p-5 hover:border-primary/30 hover:shadow-lg transition">
                <span className="w-10 h-10 rounded-xl bg-primary/10 text-primary flex items-center justify-center group-hover:bg-primary group-hover:text-primary-foreground transition">
                  <Icon className="h-5 w-5" aria-hidden />
                </span>
                <p className="font-semibold text-foreground mt-4">{title}</p>
                <p className="text-xs text-muted-foreground mt-1 leading-relaxed">{desc}</p>
              </Link>
            ))}
          </div>
        </motion.section>

        <p className="flex flex-wrap items-center gap-2 text-xs text-muted-foreground border-t border-border/60 pt-6">
          <Calendar className="h-3.5 w-3.5" aria-hidden />
          Última atualização dos dados:{" "}
          <strong className="text-foreground">
            {sincronizadoEm ? new Date(sincronizadoEm).toLocaleString("pt-BR", { dateStyle: "short", timeStyle: "short" }) : "em atualização"}
          </strong>
          · Fonte: Portal da Transparência oficial do município (sistema Megasoft).
        </p>
      </div>
    </TransparencyLayout>
  );
};

export default TransparenciaIndex;
