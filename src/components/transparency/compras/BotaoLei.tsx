import { useEffect, useState } from "react";
import { Link } from "@/lib/roteador-transparencia";
import { Download, ExternalLink, FileArchive, FileWarning, Loader2, MessageCircleQuestion, Scale } from "lucide-react";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";

/**
 * Como o portal localiza o documento: pela tela ("Estrutura de Remuneração"), pelo local e tipo, pela lei
 * do orçamento de um ano (tipo de relatório 7 PPA, 8 LDO, 9 LOA) ou por um anexo dessas leis.
 */
export type OrigemLei =
  | { tela: string }
  | { local: number; tipo: number }
  | { lrf: number; ano: number }
  | { anexo: number; tipo: number; ano: number; mes?: number };

export const linkDocumento = (origem: OrigemLei, nome: string, ver: boolean) => {
  const q = "tela" in origem ? `tela=${encodeURIComponent(origem.tela)}`
    : "local" in origem ? `local=${origem.local}&tipo=${origem.tipo}`
    : "lrf" in origem ? `lrf=${origem.lrf}&ano=${origem.ano}`
    : `anexo=${origem.anexo}&tipo=${origem.tipo}&ano=${origem.ano}${origem.mes ? `&mes=${origem.mes}` : ""}`;
  return `/api/portal-documento?${q}&nome=${encodeURIComponent(nome)}${ver ? "&ver=1" : ""}`;
};

type Estado = { fase: "carregando" } | { fase: "pronto"; url: string; tipo: string } | { fase: "ausente" } | { fase: "erro" };

interface Visualizador {
  aberto: boolean;
  aoFechar: () => void;
  titulo: string;
  descricao?: string;
  origem: OrigemLei;
  cor: string;
  /** Como o aviso de "não publicado" se refere ao arquivo. */
  oQue?: "lei" | "documento";
}

// Popup que abre um documento do portal: PDF dentro da página, outros formatos para baixar. Quando o portal
// não tem o documento publicado, avisa o cidadão e indica o e-SIC.
export const VisualizadorDocumento = ({ aberto, aoFechar, titulo, descricao, origem, cor, oQue = "documento" }: Visualizador) => {
  const lei = oQue === "lei";
  const [estado, setEstado] = useState<Estado>({ fase: "carregando" });
  const chave = JSON.stringify(origem);

  useEffect(() => {
    if (!aberto) return;
    let url: string | null = null;
    let ativo = true;
    setEstado({ fase: "carregando" });
    fetch(linkDocumento(origem, titulo, true))
      .then(async (r) => {
        if (r.status === 404) return ativo && setEstado({ fase: "ausente" });
        if (!r.ok) throw new Error(String(r.status));
        const blob = await r.blob();
        url = URL.createObjectURL(blob);
        if (ativo) setEstado({ fase: "pronto", url, tipo: blob.type });
      })
      .catch(() => ativo && setEstado({ fase: "erro" }));
    return () => { ativo = false; if (url) URL.revokeObjectURL(url); };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [aberto, chave]);

  const pdf = estado.fase === "pronto" && estado.tipo.includes("pdf");
  return (
    <Dialog open={aberto} onOpenChange={(a) => !a && aoFechar()}>
      <DialogContent className="max-w-4xl w-[calc(100vw-2rem)] p-0 overflow-hidden gap-0">
        <DialogHeader className="px-5 sm:px-6 py-4 border-b border-border/60 text-left">
          <DialogTitle className="flex items-center gap-2.5 pr-8">
            <span className="w-9 h-9 rounded-xl flex items-center justify-center text-white shrink-0" style={{ backgroundColor: cor }}><Scale className="h-4 w-4" aria-hidden /></span>
            {titulo}
          </DialogTitle>
          {descricao && <DialogDescription>{descricao}</DialogDescription>}
        </DialogHeader>

        {estado.fase === "carregando" && (
          <p className="flex items-center justify-center gap-2 text-sm text-muted-foreground py-24"><Loader2 className="h-5 w-5 animate-spin" aria-hidden /> Buscando o documento no Portal da Transparência…</p>
        )}

        {estado.fase === "pronto" && (
          <>
            {pdf ? (
              <iframe src={estado.url} title={titulo} className="w-full h-[70vh] bg-muted" />
            ) : (
              <div className="px-6 py-14 text-center">
                <span className="mx-auto w-14 h-14 rounded-2xl flex items-center justify-center text-white" style={{ backgroundColor: cor }}><FileArchive className="h-6 w-6" aria-hidden /></span>
                <p className="text-sm text-muted-foreground mt-4 max-w-md mx-auto">
                  {estado.tipo.includes("zip") ? "Este documento foi publicado como arquivo compactado (.zip), com vários arquivos dentro. Baixe para abrir no seu computador." : "Este documento não pode ser exibido aqui. Use o botão abaixo para baixá-lo."}
                </p>
              </div>
            )}
            <div className="flex flex-wrap items-center justify-end gap-2 px-5 sm:px-6 py-3 border-t border-border/60 bg-muted/30">
              {pdf && (
                <a href={estado.url} target="_blank" rel="noopener noreferrer" className="inline-flex h-10 items-center gap-1.5 rounded-xl px-4 text-sm font-semibold border border-border/60 hover:bg-muted/60">
                  <ExternalLink className="h-4 w-4" aria-hidden /> Abrir em nova aba
                </a>
              )}
              <a href={linkDocumento(origem, titulo, false)} download className="inline-flex h-10 items-center gap-1.5 rounded-xl px-4 text-sm font-semibold text-white hover:opacity-90" style={{ backgroundColor: cor }}>
                <Download className="h-4 w-4" aria-hidden /> Baixar
              </a>
            </div>
          </>
        )}

        {(estado.fase === "ausente" || estado.fase === "erro") && (
          <div className="px-6 py-12 text-center">
            <span className="mx-auto w-14 h-14 rounded-2xl flex items-center justify-center bg-amber-100 text-amber-700 dark:bg-amber-950/50 dark:text-amber-300">
              <FileWarning className="h-6 w-6" aria-hidden />
            </span>
            <h3 className="font-display text-xl font-bold text-foreground mt-4">
              {estado.fase === "ausente" ? (lei ? "Lei ainda não publicada" : "Documento ainda não publicado") : `Não foi possível abrir ${lei ? "a lei" : "o documento"} agora`}
            </h3>
            <p className="text-sm text-muted-foreground mt-2 max-w-md mx-auto">
              {estado.fase === "ausente"
                ? `Ainda não temos ${lei ? "esta lei publicada" : "este documento publicado"} no Portal da Transparência do município. Você pode ${lei ? "solicitá-la" : "solicitá-lo"} pelo e-SIC.`
                : `O Portal da Transparência não respondeu. Tente novamente em instantes ou solicite ${lei ? "a lei" : "o documento"} pelo e-SIC.`}
            </p>
            <Link to="/e-sic" className="mt-6 inline-flex h-10 items-center gap-1.5 rounded-xl px-4 text-sm font-semibold text-white hover:opacity-90" style={{ backgroundColor: cor }}>
              <MessageCircleQuestion className="h-4 w-4" aria-hidden /> Pedir pelo e-SIC
            </Link>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
};

interface Props {
  rotulo: string;
  /** Uma frase sobre o que a lei define, exibida no popup. */
  descricao: string;
  origem: OrigemLei;
  cor: string;
}

// Botão da lei que regulamenta o assunto da página (como "Legislação Diárias" no portal).
const BotaoLei = ({ rotulo, descricao, origem, cor }: Props) => {
  const [aberto, setAberto] = useState(false);
  return (
    <>
      <button type="button" onClick={() => setAberto(true)}
        className="h-11 inline-flex items-center justify-center gap-2 px-4 rounded-xl text-sm font-semibold text-white shadow-sm hover:opacity-90 transition shrink-0"
        style={{ backgroundColor: cor }}>
        <Scale className="h-4 w-4" aria-hidden /> {rotulo}
      </button>
      <VisualizadorDocumento aberto={aberto} aoFechar={() => setAberto(false)} titulo={rotulo} descricao={descricao} origem={origem} cor={cor} oQue="lei" />
    </>
  );
};

export default BotaoLei;
