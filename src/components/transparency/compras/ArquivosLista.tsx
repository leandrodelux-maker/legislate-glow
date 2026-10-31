import { Download, Eye, FileArchive, FileImage, FileSpreadsheet, FileText, ExternalLink } from "lucide-react";
import { formatar, linkArquivo, type Registro } from "./formato";

const ICONES: Record<string, { icone: typeof FileText; cor: string }> = {
  pdf: { icone: FileText, cor: "#D93C3C" },
  xls: { icone: FileSpreadsheet, cor: "#1E8A4C" }, xlsx: { icone: FileSpreadsheet, cor: "#1E8A4C" }, ods: { icone: FileSpreadsheet, cor: "#1E8A4C" }, csv: { icone: FileSpreadsheet, cor: "#1E8A4C" },
  doc: { icone: FileText, cor: "#2B5DB8" }, docx: { icone: FileText, cor: "#2B5DB8" }, odt: { icone: FileText, cor: "#2B5DB8" },
  zip: { icone: FileArchive, cor: "#8A6A1E" }, rar: { icone: FileArchive, cor: "#8A6A1E" },
  jpg: { icone: FileImage, cor: "#7A4BC2" }, jpeg: { icone: FileImage, cor: "#7A4BC2" }, png: { icone: FileImage, cor: "#7A4BC2" },
};

const extensao = (a: Registro) => String(a.extensao ?? String(a.nome ?? "").split(".").pop() ?? "").replace(/^\./, "").toLowerCase();

// Arquivos anexados no portal (edital, contrato, parecer, planilhas): baixa direto pelo site.
const ArquivosLista = ({ arquivos, portal }: { arquivos: Registro[]; portal?: string }) => (
  <ul className="grid gap-2.5">
    {arquivos.map((a, i) => {
      const ext = extensao(a);
      const { icone: Icone, cor } = ICONES[ext] ?? { icone: FileText, cor: "#5B6470" };
      const baixar = linkArquivo(a);
      const nome = String(a.nome ?? a.descricao ?? "Arquivo");
      const descricao = a.descricao && a.descricao !== nome && !nome.startsWith(String(a.descricao)) ? String(a.descricao) : null;
      return (
        <li key={String(a.codigo ?? i)} className="group flex items-center gap-3.5 rounded-2xl border border-border/60 bg-background p-3.5 hover:border-transparent hover:shadow-lg transition">
          <span className="relative w-11 h-12 shrink-0 rounded-lg flex items-center justify-center text-white shadow-sm" style={{ backgroundColor: cor }}>
            <Icone className="h-5 w-5" aria-hidden />
            {ext && <span className="absolute -bottom-1.5 left-1/2 -translate-x-1/2 text-[9px] font-black uppercase tracking-wider bg-background text-foreground border border-border/70 rounded px-1 leading-4">{ext}</span>}
          </span>
          <span className="min-w-0 flex-1">
            <span className="block text-sm font-semibold text-foreground leading-snug break-words">{nome}</span>
            <span className="block text-xs text-muted-foreground mt-0.5">
              {[descricao, a.dataDeCadastro ? `enviado em ${formatar("dataDeCadastro", a.dataDeCadastro)}` : null, a.quantidadeDownloads != null ? `${a.quantidadeDownloads} download(s)` : null].filter(Boolean).join(" · ")}
            </span>
          </span>
          {baixar ? (
            <span className="flex items-center gap-1.5 shrink-0">
              {ext === "pdf" && (
                <a href={linkArquivo(a, true)!} target="_blank" rel="noopener noreferrer" title="Abrir em nova aba"
                  className="hidden sm:inline-flex h-9 w-9 items-center justify-center rounded-xl border border-border/60 text-muted-foreground hover:text-foreground hover:bg-muted/60 transition">
                  <Eye className="h-4 w-4" aria-hidden /><span className="sr-only">Visualizar {nome}</span>
                </a>
              )}
              <a href={baixar} download className="inline-flex h-9 items-center gap-1.5 rounded-xl px-3.5 text-sm font-semibold text-white shadow-sm hover:opacity-90 transition" style={{ backgroundColor: cor }}>
                <Download className="h-4 w-4" aria-hidden /> Baixar<span className="sr-only"> {nome}</span>
              </a>
            </span>
          ) : portal ? (
            <a href={portal} target="_blank" rel="noopener noreferrer" className="inline-flex h-9 items-center gap-1.5 rounded-xl px-3 text-sm font-semibold border border-border/60 hover:bg-muted/60 shrink-0">
              <ExternalLink className="h-4 w-4" aria-hidden /> No portal
            </a>
          ) : null}
        </li>
      );
    })}
  </ul>
);

export default ArquivosLista;
