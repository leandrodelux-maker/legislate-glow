import { useEffect, useRef, useState } from "react";
import { ExternalLink, Loader2, Printer, Search, X } from "lucide-react";
import { Dialog, DialogContent, DialogDescription, DialogTitle } from "@/components/ui/dialog";

export interface LeiFederal {
  slug: string; tipo: string; titulo: string; apelido: string; resumo: string; url: string;
  categoria: string; categoriaNome?: string; noPortal?: boolean; revogada?: boolean; ementa?: string | null;
  arquivo?: string; pdf?: boolean; artigos?: number[];
}
interface Texto { tituloOficial: string | null; ementa: string | null; html: string; fonte: string; copiadoEm: string }

// Texto oficial de uma lei federal (copiado do Planalto por scripts/leis-federais/gerar.mjs) apresentado como
// a publicação oficial: Brasão da República, cabeçalho da Presidência, título, ementa e o texto compilado.
const LeiFederalPopup = ({ lei, aoFechar }: { lei: LeiFederal | null; aoFechar: () => void }) => {
  const [texto, setTexto] = useState<{ carregando: boolean; dados: Texto | null }>({ carregando: true, dados: null });
  const [semRevogados, setSemRevogados] = useState(true);
  const [artigo, setArtigo] = useState("");
  const [aviso, setAviso] = useState<string | null>(null);
  const folha = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!lei?.arquivo || lei.pdf) return;
    setTexto({ carregando: true, dados: null });
    setArtigo(""); setAviso(null);
    fetch(`/leis-federais/${lei.arquivo}`).then((r) => r.json()).then((dados: Texto) => setTexto({ carregando: false, dados }))
      .catch(() => setTexto({ carregando: false, dados: null }));
  }, [lei]);

  const irPara = (n: string) => {
    const alvo = folha.current?.querySelector<HTMLElement>(`#art-${n.replace(/\D/g, "")}`);
    if (!alvo) { setAviso(`O art. ${n} não foi encontrado no texto vigente.`); return; }
    setAviso(null);
    alvo.scrollIntoView({ behavior: "smooth", block: "start" });
    alvo.classList.add("destaque");
    window.setTimeout(() => alvo.classList.remove("destaque"), 2200);
  };

  const imprimir = () => {
    const janela = window.open("", "_blank");
    if (!janela || !texto.dados || !lei) return;
    janela.document.write(`<!doctype html><html lang="pt-BR"><head><meta charset="utf-8"><title>${lei.titulo}</title>
      <style>body{font-family:Georgia,serif;max-width:46rem;margin:2rem auto;line-height:1.6;color:#111}header{text-align:center}img{height:80px}
      .c{text-align:center}.t{font-weight:bold}s{color:#888}.rev{display:${semRevogados ? "none" : "block"}}${semRevogados ? "s{display:none}" : ""}
      .ementa{margin-left:50%;font-style:italic;color:#7a1f1f}table{border-collapse:collapse}td{padding:2px 6px}a{color:inherit}</style></head><body>
      ${folha.current?.innerHTML ?? ""}</body></html>`);
    janela.document.close();
    janela.focus();
    janela.print();
  };

  const d = texto.dados;
  return (
    <Dialog open={!!lei} onOpenChange={(a) => !a && aoFechar()}>
      <DialogContent className="max-w-5xl w-[calc(100vw-1.5rem)] h-[92vh] p-0 gap-0 overflow-hidden flex flex-col bg-muted [&>button:last-child]:hidden">
        <DialogTitle className="sr-only">{lei?.titulo}</DialogTitle>
        <DialogDescription className="sr-only">{lei?.apelido}: texto oficial compilado</DialogDescription>

        {/* Ferramentas */}
        <div className="flex flex-wrap items-center gap-2 px-4 py-2.5 border-b border-border/60 bg-background">
          <span className="text-sm font-bold text-foreground mr-auto truncate max-w-[60%]">{lei?.apelido}</span>
          {!lei?.pdf && (
            <>
              <form onSubmit={(e) => { e.preventDefault(); if (artigo) irPara(artigo); }} className="relative">
                <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-muted-foreground" aria-hidden />
                <input value={artigo} onChange={(e) => setArtigo(e.target.value)} inputMode="numeric" placeholder="Ir para o art." aria-label="Ir para o artigo"
                  className="h-9 w-32 rounded-lg border border-border/60 bg-background pl-8 pr-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary/30" />
              </form>
              <label className="h-9 inline-flex items-center gap-2 rounded-lg border border-border/60 px-3 text-sm cursor-pointer select-none">
                <input type="checkbox" checked={semRevogados} onChange={(e) => setSemRevogados(e.target.checked)} className="accent-current" />
                Ocultar revogados
              </label>
              <button type="button" onClick={imprimir} className="h-9 inline-flex items-center gap-1.5 rounded-lg border border-border/60 px-3 text-sm hover:bg-muted/60">
                <Printer className="h-4 w-4" aria-hidden /> <span className="hidden sm:inline">Imprimir</span>
              </button>
            </>
          )}
          {lei && (
            <a href={lei.url} target="_blank" rel="noopener noreferrer" className="h-9 inline-flex items-center gap-1.5 rounded-lg border border-border/60 px-3 text-sm hover:bg-muted/60">
              <ExternalLink className="h-4 w-4" aria-hidden /> <span className="hidden sm:inline">Planalto</span>
            </a>
          )}
          <button type="button" onClick={aoFechar} className="h-9 w-9 inline-flex items-center justify-center rounded-lg hover:bg-muted/60" aria-label="Fechar">
            <X className="h-5 w-5" aria-hidden />
          </button>
        </div>
        {lei?.artigos && !lei.pdf && (
          <div className="flex flex-wrap items-center gap-1.5 px-4 py-2 border-b border-border/60 bg-background text-xs">
            <span className="text-muted-foreground mr-1">Artigos sobre a administração pública:</span>
            {lei.artigos.map((n) => (
              <button key={n} type="button" onClick={() => irPara(String(n))} className="h-7 rounded-full border border-border/60 px-2.5 font-semibold hover:bg-muted/60">art. {n}</button>
            ))}
          </div>
        )}
        {aviso && <p className="px-4 py-2 text-xs bg-amber-50 text-amber-800 border-b border-amber-200 dark:bg-amber-950/40 dark:text-amber-200">{aviso}</p>}

        {/* A folha */}
        <div className="flex-1 overflow-y-auto px-3 sm:px-8 py-6">
          {lei?.pdf ? (
            <div className="mx-auto max-w-xl bg-background rounded-xl p-8 text-center shadow">
              <p className="text-sm text-muted-foreground">Este ato foi publicado em PDF pela fonte original.</p>
              <a href={lei.url} target="_blank" rel="noopener noreferrer" className="mt-4 inline-flex items-center gap-2 rounded-lg px-4 py-2 text-sm font-semibold bg-foreground text-background"><ExternalLink className="h-4 w-4" aria-hidden /> Abrir na fonte</a>
            </div>
          ) : texto.carregando ? (
            <p className="flex items-center justify-center gap-2 text-sm text-muted-foreground py-24"><Loader2 className="h-5 w-5 animate-spin" aria-hidden /> Carregando o texto oficial…</p>
          ) : !d ? (
            <p className="text-center text-sm text-muted-foreground py-24">Não foi possível carregar o texto. <a href={lei?.url} target="_blank" rel="noopener noreferrer" className="underline">Abra no Planalto</a>.</p>
          ) : (
            <article className={`lei-oficial mx-auto max-w-[48rem] bg-white text-[#1a1a1a] shadow-xl rounded-sm px-6 sm:px-14 py-10 sm:py-14 ${semRevogados ? "sem-revogados" : ""}`}>
              <div ref={folha}>
                <header className="text-center">
                  <img src="/images/brasao-republica.svg" alt="Brasão da República Federativa do Brasil" className="mx-auto h-20 sm:h-24 w-auto" />
                  <p className="mt-3 font-editorial text-[15px] font-semibold tracking-wide">Presidência da República</p>
                  <p className="font-editorial text-sm">Casa Civil</p>
                  <p className="font-editorial text-xs text-[#555]">Secretaria Especial para Assuntos Jurídicos</p>
                </header>
                <h2 className="mt-8 text-center font-editorial text-base sm:text-lg font-bold uppercase tracking-wide text-[#0b2a6b]">{d.tituloOficial ?? lei?.titulo}</h2>
                {d.ementa && <p className="ementa mt-6 ml-auto sm:w-1/2 font-editorial italic text-[15px] leading-relaxed text-[#7a1f1f] text-justify">{d.ementa}</p>}
                <div className="corpo mt-8 font-editorial text-[16px] leading-[1.75] text-justify" dangerouslySetInnerHTML={{ __html: d.html }} />
              </div>
              <footer className="mt-10 pt-4 border-t border-[#ddd] text-xs text-[#666] font-sans">
                Texto compilado do Portal da Legislação do Planalto (planalto.gov.br), copiado em {new Date(`${d.copiadoEm}T12:00:00`).toLocaleDateString("pt-BR")}. Este texto não substitui o publicado no Diário Oficial da União.
              </footer>
            </article>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default LeiFederalPopup;
