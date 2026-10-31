import { useEffect, useMemo, useState } from "react";
import { Link, Navigate, useParams } from "@/lib/roteador-transparencia";
import { ExternalLink, MessageCircleQuestion, RefreshCw, Loader2, Clock, Search, FileSpreadsheet, FileText, Inbox, Info } from "lucide-react";
import TransparencyLayout from "@/components/transparency/TransparencyLayout";
import DataTable, { Column, ValorPago } from "@/components/transparency/DataTable";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { findItem, itemHref, portalUrl } from "@/data/transparenciaCatalogo";
import { fetchTransparenciaDataset } from "@/hooks/useTransparenciaDataset";
import { useTransparenciaUrls } from "@/hooks/useTransparenciaUrls";

type Linha = Record<string, string>;
const ANO_ATUAL = new Date().getFullYear();
const ANOS = [ANO_ATUAL, ANO_ATUAL - 1, ANO_ATUAL - 2, ANO_ATUAL - 3];
// Conjuntos em que a coluna de valor pago ganha cor (verde pago / vermelho leve não pago).
const COLUNA_PAGO: Record<string, string> = { empenhos: "Pago" };
const SIGLAS = /^(CPF|CNPJ|CPF\/CNPJ|LOA|LDO|PPA|TCM|SIC|FONTE)$/i;

// Títulos do portal vêm às vezes em caixa alta ("NATUREZA DA RECEITA"): exibe como frase.
const rotulo = (titulo: string) => {
  if (titulo !== titulo.toUpperCase()) return titulo;
  return titulo.split(" ").map((p, i) => (SIGLAS.test(p) ? p : i === 0 ? p.charAt(0) + p.slice(1).toLowerCase() : p.toLowerCase())).join(" ");
};
const normalizar = (s: string) => s.normalize("NFD").replace(/[̀-ͯ]/g, "").toLowerCase();

function exportarCsv(nome: string, colunas: string[], linhas: Linha[]) {
  const esc = (v: string) => `"${(v ?? "").replace(/"/g, '""')}"`;
  const corpo = [colunas.map((c) => esc(rotulo(c))).join(";"), ...linhas.map((l) => colunas.map((c) => esc(l[c])).join(";"))];
  const url = URL.createObjectURL(new Blob(["﻿" + corpo.join("\r\n")], { type: "text/csv;charset=utf-8" }));
  Object.assign(document.createElement("a"), { href: url, download: `${nome}.csv` }).click();
  URL.revokeObjectURL(url);
}

// Página padrão de um item da transparência: mostra a cópia sincronizada do portal
// (conjunto = slug do item) ou o caminho para a fonte oficial enquanto ela não existe.
const ConsultaPage = () => {
  const { slug = "" } = useParams();
  const item = findItem(slug);
  const { urls } = useTransparenciaUrls();
  const acumulado = item?.periodo === "acumulado";
  const [ano, setAno] = useState(ANO_ATUAL);
  const [busca, setBusca] = useState("");
  const [orgao, setOrgao] = useState("");
  const [detalhe, setDetalhe] = useState<Linha | null>(null);
  // sincronizado: já existe cópia concluída (mesmo vazia: o portal não tem nada publicado).
  const [estado, setEstado] = useState<{ carregando: boolean; linhas: Linha[]; atualizado: string | null; sincronizado?: boolean }>({ carregando: true, linhas: [], atualizado: null });

  useEffect(() => {
    if (!item || item.tipo === "relatorio") { setEstado({ carregando: false, linhas: [], atualizado: null }); return; }
    setEstado((e) => ({ ...e, carregando: true }));
    fetchTransparenciaDataset<Linha>(item.slug, acumulado ? ANO_ATUAL : ano)
      .then((r) => setEstado({ carregando: false, linhas: r?.data ?? [], atualizado: r?.atualizadoEm ?? null, sincronizado: !!r }))
      .catch(() => setEstado({ carregando: false, linhas: [], atualizado: null }));
  }, [item, ano, acumulado]);

  useEffect(() => { setBusca(""); setOrgao(""); }, [slug, ano]);

  const chaves = useMemo(() => Object.keys(estado.linhas[0] ?? {}), [estado.linhas]);
  // A tabela mostra as primeiras colunas; todas aparecem no detalhe do registro.
  const colunas: Column[] = useMemo(
    () => [
      ...chaves.slice(0, item?.colunasTabela ?? 7).map((k): Column => ({
        key: k, label: rotulo(k), sortable: true,
        render: item && COLUNA_PAGO[item.slug] === k ? (v) => <ValorPago valor={v} /> : undefined,
      })),
      {
        key: "_acoes",
        label: "Ações",
        render: (_: unknown, linha: Linha) => (
          <button type="button" onClick={(e) => { e.stopPropagation(); setDetalhe(linha); }}
            className="text-xs bg-primary/10 text-primary px-2 py-1 rounded hover:bg-primary/20 flex items-center gap-1 whitespace-nowrap">
            <Info className="h-3 w-3" aria-hidden /> Detalhes
          </button>
        ),
      },
    ],
    [chaves, item],
  );
  // A lista abre com todos os órgãos; a caixa de seleção detalha por órgão quando o conjunto informa esse campo.
  const campoOrgao = chaves.find((k) => /^Órgão/.test(k));
  const nomeOrgao = (v: unknown) => String(v ?? "").replace(/^\s*\d+\s*-\s*/, "").trim();
  const orgaos = useMemo(() => (campoOrgao ? [...new Set(estado.linhas.map((l) => nomeOrgao(l[campoOrgao])).filter(Boolean))].sort((a, b) => a.localeCompare(b, "pt-BR")) : []), [estado.linhas, campoOrgao]);
  const filtradas = useMemo(() => {
    const termos = normalizar(busca).split(/\s+/).filter(Boolean);
    const doOrgao = orgao && campoOrgao ? estado.linhas.filter((l) => nomeOrgao(l[campoOrgao]) === orgao) : estado.linhas;
    if (!termos.length) return doOrgao;
    return doOrgao.filter((l) => { const texto = normalizar(Object.values(l).join(" ")); return termos.every((t) => texto.includes(t)); });
  }, [estado.linhas, busca, orgao, campoOrgao]);

  if (!item) return <Navigate to="/transparencia" replace />;
  if (itemHref(item) !== `/transparencia/consulta/${item.slug}`) return <Navigate to={itemHref(item)} replace />;
  const fonte = portalUrl(item, `${urls.base_url}/`);
  const cor = item.tema.color;
  const temDados = estado.linhas.length > 0;

  return (
    <TransparencyLayout
      title={item.label}
      description={item.desc}
      breadcrumbs={[
        { label: "Início", href: "/" },
        { label: "Transparência", href: "/transparencia" },
        { label: item.tema.label, href: `/transparencia/tema/${item.tema.id}` },
        { label: item.label },
      ]}
    >
      {item.tipo !== "relatorio" && (
        <div className="flex flex-wrap items-center gap-3 mb-5">
          {!acumulado && (
            <div className="flex items-center gap-2 w-full sm:w-auto">
              <label htmlFor="ano" className="text-sm font-semibold text-foreground">Exercício</label>
              <select id="ano" value={ano} onChange={(e) => setAno(Number(e.target.value))}
                className="h-11 w-full sm:w-auto sm:max-w-[16rem] min-w-0 rounded-xl border border-border/60 bg-card px-3 text-sm font-semibold focus:outline-none focus:ring-4 focus:ring-primary/15">
                {ANOS.map((a) => <option key={a} value={a}>{a}</option>)}
              </select>
            </div>
          )}
          {temDados && orgaos.length > 1 && (
            <div className="flex items-center gap-2 w-full sm:w-auto">
              <label htmlFor="orgao" className="text-sm font-semibold text-foreground">Órgão</label>
              <select id="orgao" value={orgao} onChange={(e) => setOrgao(e.target.value)} className="h-11 w-full sm:w-auto sm:max-w-[16rem] min-w-0 rounded-xl border border-border/60 bg-card px-3 text-sm font-semibold focus:outline-none focus:ring-4 focus:ring-primary/15">
                <option value="">Todos</option>
                {orgaos.map((o) => <option key={o} value={o}>{o}</option>)}
              </select>
            </div>
          )}
          {temDados && (
            <>
              <div className="relative flex-1 min-w-full sm:min-w-[16rem]">
                <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" aria-hidden />
                <input type="search" value={busca} onChange={(e) => setBusca(e.target.value)}
                  placeholder={`Filtrar ${item.label.toLowerCase()} (nome, número, valor…)`} aria-label="Filtrar registros"
                  className="w-full h-11 rounded-xl border border-border/60 bg-card pl-10 pr-3 text-sm focus:outline-none focus:ring-4 focus:ring-primary/15" />
              </div>
              <button type="button" onClick={() => exportarCsv(`${item.slug}-${acumulado ? "atual" : ano}`, chaves, filtradas)}
                className="h-11 inline-flex items-center justify-center gap-2 px-4 rounded-xl border border-border/60 bg-card text-sm font-semibold hover:bg-muted/50 transition shrink-0">
                <FileSpreadsheet className="h-4 w-4 text-emerald-600" aria-hidden /> Baixar CSV
              </button>
            </>
          )}
        </div>
      )}

      {temDados && (
        <div className="flex flex-wrap items-center justify-between gap-2 mb-3 text-xs text-muted-foreground">
          <span>
            <strong className="text-foreground">{filtradas.length.toLocaleString("pt-BR")}</strong>
            {busca || orgao ? ` de ${estado.linhas.length.toLocaleString("pt-BR")}` : ""} registros
            {acumulado ? " · cadastro atual" : ` · exercício ${ano}`} · clique em uma linha para ver o detalhe
          </span>
          {estado.atualizado && (
            <span className="flex items-center gap-1.5">
              <Clock className="h-3.5 w-3.5" aria-hidden />
              Copiado do portal oficial em {new Date(estado.atualizado).toLocaleString("pt-BR", { dateStyle: "short", timeStyle: "short" })}
            </span>
          )}
        </div>
      )}

      {estado.carregando ? (
        <div className="flex flex-col items-center justify-center py-20 text-muted-foreground">
          <Loader2 className="h-8 w-8 animate-spin mb-3" aria-hidden />
          <p className="text-sm">Buscando {item.label.toLowerCase()}…</p>
        </div>
      ) : temDados ? (
        <DataTable columns={colunas} data={filtradas} onRowClick={setDetalhe} />
      ) : (
        <section className="relative overflow-hidden bg-card border border-border/50 rounded-3xl p-8 md:p-12 text-center">
          <span className="absolute inset-x-0 top-0 h-1.5" style={{ backgroundColor: cor }} aria-hidden />
          <span className="mx-auto w-14 h-14 rounded-2xl flex items-center justify-center text-white" style={{ backgroundColor: cor }}>
            {item.tipo === "relatorio" ? <FileText className="h-6 w-6" aria-hidden /> : estado.sincronizado ? <Inbox className="h-6 w-6" aria-hidden /> : <RefreshCw className="h-6 w-6" aria-hidden />}
          </span>
          <h2 className="font-display text-2xl font-bold text-foreground mt-5">
            {item.tipo === "relatorio" ? "Relatório gerado no portal oficial" : estado.sincronizado ? `Nenhum registro publicado${acumulado ? "" : ` em ${ano}`}` : "Estamos trazendo estes dados para o site"}
          </h2>
          <p className="text-muted-foreground mt-2 max-w-xl mx-auto">
            {item.tipo === "relatorio"
              ? <>O <strong className="text-foreground">{item.label}</strong> é montado pelo Portal da Transparência no momento da consulta: escolha o exercício e o período lá para gerar o documento.</>
              : estado.sincronizado
              ? <>O Portal da Transparência do município não tem registros de <strong className="text-foreground">{item.label}</strong>{acumulado ? "" : ` para ${ano}`}.{estado.atualizado && <> Conferido em {new Date(estado.atualizado).toLocaleString("pt-BR", { dateStyle: "short", timeStyle: "short" })}.</>} Se você procura uma informação que deveria estar aqui, peça pelo e-SIC.</>
              : <>Enquanto a cópia automática de <strong className="text-foreground">{item.label}</strong>{acumulado ? "" : ` (${ano})`} não fica pronta, a consulta completa e oficial está disponível no Portal da Transparência do município.</>}
          </p>
          <div className="mt-7 flex flex-col sm:flex-row items-center justify-center gap-3">
            {fonte && (
              <a href={fonte} target="_blank" rel="noopener noreferrer"
                className="inline-flex items-center gap-2 text-white font-semibold text-sm px-6 py-3 rounded-xl shadow-md hover:opacity-90 transition" style={{ backgroundColor: cor }}>
                <ExternalLink className="h-4 w-4" aria-hidden /> {item.tipo === "relatorio" ? "Gerar no portal oficial" : "Consultar no portal oficial"}
              </a>
            )}
            <Link to="/e-sic" className="inline-flex items-center gap-2 font-semibold text-sm px-6 py-3 rounded-xl border border-border/70 text-foreground hover:bg-muted/50 transition">
              <MessageCircleQuestion className="h-4 w-4" aria-hidden /> Pedir pelo e-SIC
            </Link>
          </div>
        </section>
      )}

      {/* Detalhe do registro */}
      <Dialog open={!!detalhe} onOpenChange={(aberto) => !aberto && setDetalhe(null)}>
        <DialogContent className="max-w-2xl max-h-[85vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Info className="h-5 w-5" style={{ color: cor }} aria-hidden /> {item.label}
            </DialogTitle>
          </DialogHeader>
          {detalhe && (
            <dl className="grid sm:grid-cols-2 gap-3">
              {chaves.map((k) => (
                <div key={k} className={`bg-muted/40 border border-border/50 rounded-xl px-4 py-3 ${String(detalhe[k] ?? "").length > 60 ? "sm:col-span-2" : ""}`}>
                  <dt className="text-[11px] font-bold uppercase tracking-wider text-muted-foreground">{rotulo(k)}</dt>
                  <dd className="text-sm font-medium text-foreground mt-1 break-words">{detalhe[k] || "—"}</dd>
                </div>
              ))}
            </dl>
          )}
          {fonte && (
            <a href={fonte} target="_blank" rel="noopener noreferrer" className="mt-2 inline-flex items-center gap-1.5 text-sm font-semibold hover:underline" style={{ color: cor }}>
              <ExternalLink className="h-4 w-4" aria-hidden /> Ver documentos e anexos no portal oficial
            </a>
          )}
        </DialogContent>
      </Dialog>

      {/* Outros itens do tema */}
      <h2 className="font-display text-lg font-bold text-foreground mt-12 mb-3">Mais em {item.tema.label}</h2>
      <div className="flex flex-wrap gap-2">
        {item.tema.items.filter((i) => i.slug !== item.slug).map((i) => (
          <Link key={i.slug} to={itemHref(i)} className="text-sm font-medium bg-card border border-border/60 rounded-full px-4 py-2 hover:shadow-md hover:border-transparent transition text-foreground">
            {i.label}
          </Link>
        ))}
      </div>
    </TransparencyLayout>
  );
};

export default ConsultaPage;
