import { useEffect, useMemo, useRef, useState, type ReactNode } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import { Sheet, SheetContent, SheetDescription, SheetTitle } from "@/components/ui/sheet";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import {
  ArrowDown,
  ArrowUp,
  Check,
  ChevronLeft,
  ChevronRight,
  Copy,
  Download,
  FileText,
  Inbox,
  LayoutGrid,
  List,
  Loader2,
  Pencil,
  Plus,
  Search,
  Trash2,
  Upload,
  X,
} from "lucide-react";
import { toast } from "sonner";
import { BotaoCabecalho, Indicadores, PaginaModulo, type Indicador } from "@/components/admin/painel/PaginaModulo";

export type FieldOption = { label: string; value: string };

export type FieldDef = {
  name: string;
  label: string;
  type?: "text" | "textarea" | "number" | "date" | "datetime-local" | "checkbox" | "url" | "email" | "select" | "file" | "custom" | "etapas" | "cor";
  renderCustom?: (row: any, form: any, setForm: any) => ReactNode;
  required?: boolean;
  placeholder?: string;
  options?: FieldOption[];
  table?: string;
  optionLabel?: string;
  optionValue?: string;
  /** Texto de apoio abaixo do campo. */
  ajuda?: string;
  /** Ocupa a linha inteira do formulário. */
  largo?: boolean;
  /** Tipo de arquivo do campo `file`. */
  arquivo?: "pdf" | "imagem";
  /** Preenche sozinho (endereço amigável) a partir de outro campo, enquanto for um novo registro. */
  slugDe?: string;
  /** Cores das etapas do campo `etapas`, por valor. */
  cores?: Record<string, string>;
  /** Só leitura no formulário. */
  somenteLeitura?: boolean;
};

export type ColumnDef<T> = {
  key: keyof T | string;
  label: string;
  render?: (row: T) => ReactNode;
};

/** Dados fora do banco do site: lê e grava por estas funções, em vez de ir direto à tabela. */
export type Repositorio = {
  listar: () => Promise<any[]>;
  salvar: (id: string | null, dados: Record<string, unknown>) => Promise<void>;
  excluir: (id: string) => Promise<void>;
  enviarPdf?: (file: File) => Promise<string>;
};

export type SecaoForm = { titulo: string; descricao?: string; campos: string[] };
export type FiltroDef<T> = { campo: string; rotulo: string; valor?: (row: T) => string | null | undefined; opcoes?: FieldOption[] };
export type CartaoDef<T> = {
  titulo: (row: T) => ReactNode;
  subtitulo?: (row: T) => ReactNode;
  texto?: (row: T) => ReactNode;
  selo?: (row: T) => ReactNode;
  imagem?: (row: T) => ReactNode;
  rodape?: (row: T) => ReactNode;
};

type Props<T extends { id: string }> = {
  title: string;
  description?: string;
  table: string;
  columns: ColumnDef<T>[];
  fields: FieldDef[];
  orderBy?: { column: string; ascending?: boolean };
  defaultValues?: Partial<T>;
  /** "projeto" monta "Novo projeto" e "Editar projeto". */
  singular?: string;
  feminino?: boolean;
  secoes?: SecaoForm[];
  indicadores?: (rows: T[]) => Indicador[];
  filtros?: FiltroDef<T>[];
  buscaEm?: string[];
  cartao?: CartaoDef<T>;
  /** Mostra ao lado do formulário como o registro aparece no site. */
  previa?: (form: any) => ReactNode;
  nomeDe?: (row: T) => string;
  acoesCartao?: (row: T) => ReactNode;
  acoesPagina?: ReactNode;
  /** Texto para quando ainda não há registros. */
  vazio?: string;
  repositorio?: Repositorio;
  /** Conteúdo acima dos indicadores. */
  antes?: ReactNode;
};

const POR_PAGINA = 12;
const VAZIO = "__vazio__";
const MB = 1024 * 1024;

const paraDataHoraLocal = (v: unknown) => {
  if (!v) return "";
  const d = new Date(String(v));
  if (Number.isNaN(d.getTime())) return String(v).slice(0, 16);
  const p = (n: number) => String(n).padStart(2, "0");
  return `${d.getFullYear()}-${p(d.getMonth() + 1)}-${p(d.getDate())}T${p(d.getHours())}:${p(d.getMinutes())}`;
};

export const slugify = (v: string) =>
  v.normalize("NFD").replace(/[̀-ͯ]/g, "").toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-+|-+$/g, "").slice(0, 90);

const lerRascunho = (chave: string) => {
  try {
    const t = localStorage.getItem(chave);
    return t ? (JSON.parse(t) as Record<string, unknown>) : null;
  } catch {
    return null;
  }
};
const gravarRascunho = (chave: string, valor: Record<string, unknown> | null) => {
  try {
    if (valor) localStorage.setItem(chave, JSON.stringify(valor));
    else localStorage.removeItem(chave);
  } catch {
    /* navegador sem armazenamento: o formulário segue funcionando */
  }
};

const mensagemDeErro = (error: { code?: string; message?: string }) =>
  error.code === "42501" || /row-level security|permission denied/i.test(error.message ?? "")
    ? "Sua conta não tem permissão para esta ação."
    : error.code === "23505"
      ? "Já existe um registro com esses dados."
      : `Não foi possível salvar: ${error.message}`;

function CampoArquivo({ field, valor, onChange, cor, enviarPdf }: { field: FieldDef; valor: unknown; onChange: (v: string | null) => void; cor: string; enviarPdf?: (file: File) => Promise<string> }) {
  const ref = useRef<HTMLInputElement>(null);
  const [enviando, setEnviando] = useState(false);
  const [arrastando, setArrastando] = useState(false);
  const pdf = field.arquivo === "pdf";

  const enviar = async (file: File) => {
    const tipos = pdf ? ["application/pdf"] : ["image/jpeg", "image/png", "image/webp", "image/jpg"];
    const limite = pdf ? 20 : 2;
    if (!tipos.includes(file.type)) return toast.error(pdf ? "Envie um arquivo em PDF." : "Envie uma imagem JPG, PNG ou WebP.");
    if (file.size > limite * MB) return toast.error(`O arquivo passa do limite de ${limite} MB.`);
    setEnviando(true);
    if (pdf && enviarPdf) {
      try {
        onChange(await enviarPdf(file));
        toast.success("Arquivo enviado.");
      } catch (e) {
        toast.error(`Não foi possível enviar: ${e instanceof Error ? e.message : "erro desconhecido"}`);
      }
      setEnviando(false);
      return;
    }
    const extensao = file.name.split(".").pop()?.toLowerCase() || (pdf ? "pdf" : "jpg");
    const nome = slugify(file.name.replace(/\.[^.]+$/, "")) || "arquivo";
    const caminho = `${pdf ? "anexos/" : ""}${Date.now()}-${nome}.${extensao}`;
    const balde = pdf ? "documentos" : "vereadores";
    const { error } = await supabase.storage.from(balde).upload(caminho, file, { cacheControl: "3600", upsert: true, contentType: file.type });
    if (error) {
      setEnviando(false);
      return toast.error(`Não foi possível enviar: ${error.message}`);
    }
    const url = (await supabase.storage.from(balde).createSignedUrl(caminho, 60 * 60 * 24 * 365 * 10)).data?.signedUrl;
    setEnviando(false);
    if (!url) return toast.error("Não foi possível gerar o link do arquivo.");
    onChange(url);
    toast.success("Arquivo enviado.");
  };

  const texto = valor ? String(valor) : "";
  return (
    <div className="space-y-2">
      <input
        ref={ref}
        id={field.name}
        type="file"
        className="sr-only"
        accept={pdf ? "application/pdf" : "image/jpeg,image/png,image/webp"}
        onChange={(e) => {
          const f = e.target.files?.[0];
          e.target.value = "";
          if (f) enviar(f);
        }}
      />
      {texto ? (
        <div className="flex items-center gap-3 rounded-xl border border-border bg-muted/40 p-3">
          {pdf ? (
            <span className="w-11 h-11 rounded-lg grid place-items-center text-white shrink-0" style={{ backgroundColor: cor }}>
              <FileText className="w-5 h-5" aria-hidden />
            </span>
          ) : (
            <img src={texto} alt="Imagem enviada" className="w-14 h-14 rounded-lg object-cover border border-border shrink-0" />
          )}
          <div className="min-w-0 flex-1">
            <p className="text-sm font-semibold text-foreground">{pdf ? "PDF anexado" : "Imagem anexada"}</p>
            <a href={texto} target="_blank" rel="noreferrer" className="text-xs underline underline-offset-2 text-muted-foreground">Abrir arquivo</a>
          </div>
          <Button type="button" variant="outline" size="sm" onClick={() => ref.current?.click()} disabled={enviando}>Trocar</Button>
          <Button type="button" variant="ghost" size="icon" aria-label="Remover arquivo" onClick={() => onChange(null)}><X className="w-4 h-4" /></Button>
        </div>
      ) : (
        <button
          type="button"
          onClick={() => ref.current?.click()}
          onDragOver={(e) => { e.preventDefault(); setArrastando(true); }}
          onDragLeave={() => setArrastando(false)}
          onDrop={(e) => {
            e.preventDefault();
            setArrastando(false);
            const f = e.dataTransfer.files?.[0];
            if (f) enviar(f);
          }}
          className="w-full rounded-xl border-2 border-dashed p-5 text-center transition hover:bg-muted/50 focus-visible:outline-2 focus-visible:outline-offset-2"
          style={{ borderColor: arrastando ? cor : undefined, backgroundColor: arrastando ? `color-mix(in srgb, ${cor} 8%, transparent)` : undefined }}
        >
          {enviando ? <Loader2 className="w-6 h-6 mx-auto animate-spin text-muted-foreground" aria-hidden /> : <Upload className="w-6 h-6 mx-auto text-muted-foreground" aria-hidden />}
          <span className="block text-sm font-semibold text-foreground mt-1.5">{enviando ? "Enviando..." : "Clique para escolher ou arraste o arquivo aqui"}</span>
          <span className="block text-xs text-muted-foreground mt-0.5">{pdf ? "PDF de até 20 MB" : "JPG, PNG ou WebP de até 2 MB"}</span>
        </button>
      )}
    </div>
  );
}

export function CrudPage<T extends { id: string }>({
  title,
  description,
  table,
  columns,
  fields,
  orderBy,
  defaultValues = {},
  singular,
  feminino,
  secoes,
  indicadores,
  filtros = [],
  buscaEm,
  cartao,
  previa,
  nomeDe,
  acoesCartao,
  acoesPagina,
  vazio,
  repositorio,
  antes,
}: Props<T>) {
  const [rows, setRows] = useState<T[]>([]);
  const [loading, setLoading] = useState(true);
  const [erroCarga, setErroCarga] = useState("");
  const [open, setOpen] = useState(false);
  const [editing, setEditing] = useState<T | null>(null);
  const [form, setForm] = useState<Record<string, unknown>>({});
  const [inicial, setInicial] = useState("");
  const [erros, setErros] = useState<Record<string, string>>({});
  const [saving, setSaving] = useState(false);
  const [externalOptions, setExternalOptions] = useState<Record<string, FieldOption[]>>({});
  const [busca, setBusca] = useState("");
  const [selecao, setSelecao] = useState<Record<string, string>>({});
  const [pagina, setPagina] = useState(1);
  const [ordem, setOrdem] = useState<{ chave: string; asc: boolean } | null>(null);
  const [visao, setVisao] = useState<"cartoes" | "tabela">(cartao ? "cartoes" : "tabela");
  const [excluindo, setExcluindo] = useState<T | null>(null);
  const [descartar, setDescartar] = useState(false);
  const [recuperado, setRecuperado] = useState(false);
  const formRef = useRef<HTMLFormElement>(null);

  const chaveRascunho = `painel-rascunho:${table}`;
  const nomeNovo = singular ? `${feminino ? "Nova" : "Novo"} ${singular}` : "Novo registro";
  const nomeEditar = singular ? `Editar ${singular}` : "Editar registro";
  const nomeRegistro = (r: T) => (nomeDe ? nomeDe(r) : String((r as any).titulo ?? (r as any).nome ?? singular ?? "registro"));

  const load = async () => {
    setLoading(true);
    if (repositorio) {
      try {
        setRows((await repositorio.listar()) as T[]);
        setErroCarga("");
      } catch (e) {
        setErroCarga(e instanceof Error ? e.message : "Não foi possível carregar.");
      }
      setLoading(false);
      return;
    }
    let q = (supabase as any).from(table).select("*");
    if (orderBy) q = q.order(orderBy.column, { ascending: orderBy.ascending ?? false });
    const { data, error } = await q;
    if (error) setErroCarga(mensagemDeErro(error).replace("Não foi possível salvar", "Não foi possível carregar"));
    else {
      setErroCarga("");
      setRows((data as T[]) ?? []);
    }
    setLoading(false);
  };

  useEffect(() => {
    load();
    for (const field of fields) {
      if (field.table && field.optionLabel && field.optionValue) {
        (supabase as any)
          .from(field.table)
          .select(`${field.optionValue}, ${field.optionLabel}`)
          .then(({ data }: { data: any[] | null }) => {
            if (data) setExternalOptions((prev) => ({ ...prev, [field.name]: data.map((d) => ({ label: d[field.optionLabel!], value: String(d[field.optionValue!]) })) }));
          });
      }
    }
    /* eslint-disable-next-line react-hooks/exhaustive-deps */
  }, [table]);

  // Atalhos do início do painel abrem direto o formulário (?novo=1)
  useEffect(() => {
    if (new URLSearchParams(window.location.search).get("novo")) {
      startNew();
      window.history.replaceState(null, "", window.location.pathname);
    }
    /* eslint-disable-next-line react-hooks/exhaustive-deps */
  }, []);

  const opcoesDe = (f: FieldDef) => f.options ?? externalOptions[f.name] ?? [];

  const abrir = (valores: Record<string, unknown>, registro: T | null) => {
    setEditing(registro);
    setForm(valores);
    setInicial(JSON.stringify(valores));
    setErros({});
    setOpen(true);
  };

  function startNew() {
    const rascunho = lerRascunho(chaveRascunho);
    setRecuperado(Boolean(rascunho));
    abrir(rascunho ?? { ...defaultValues }, null);
  }

  const startEdit = (row: T) => {
    setRecuperado(false);
    abrir({ ...row }, row);
  };

  const duplicar = (row: T) => {
    const { id: _id, created_at: _c, updated_at: _u, slug: _s, protocolo: _p, ...resto } = row as any;
    setRecuperado(false);
    abrir(resto, null);
  };

  const alterado = open && JSON.stringify(form) !== inicial;

  // Rascunho automático: um novo cadastro interrompido não se perde
  useEffect(() => {
    if (!open || editing || !alterado) return;
    const t = window.setTimeout(() => gravarRascunho(chaveRascunho, form), 500);
    return () => window.clearTimeout(t);
    /* eslint-disable-next-line react-hooks/exhaustive-deps */
  }, [form, open, editing, alterado]);

  const fechar = () => {
    // Em um novo cadastro o rascunho já guardou tudo; ao editar, confirma antes de perder.
    if (alterado && editing) setDescartar(true);
    else setOpen(false);
  };

  const confirmarExclusao = async () => {
    const row = excluindo;
    setExcluindo(null);
    if (!row) return;
    if (repositorio) {
      try {
        await repositorio.excluir(row.id);
      } catch (e) {
        return toast.error(e instanceof Error ? e.message : "Não foi possível excluir.");
      }
    } else {
      const { error } = await (supabase as any).from(table).delete().eq("id", row.id);
      if (error) return toast.error(mensagemDeErro(error).replace("salvar", "excluir"));
    }
    load();
    toast.success(`"${nomeRegistro(row)}" foi excluído.`, {
      duration: 8000,
      action: {
        label: "Desfazer",
        onClick: async () => {
          if (repositorio) {
            const dados = Object.fromEntries(fields.map((f) => [f.name, (row as any)[f.name]]));
            try {
              await repositorio.salvar(null, dados);
              toast.success("Registro restaurado.");
              load();
            } catch (x) {
              toast.error(x instanceof Error ? x.message : "Não foi possível restaurar.");
            }
            return;
          }
          const { error: e } = await (supabase as any).from(table).insert(row);
          if (e) return toast.error(mensagemDeErro(e));
          toast.success("Registro restaurado.");
          load();
        },
      },
    });
  };

  const validar = () => {
    const novos: Record<string, string> = {};
    for (const f of fields) {
      const v = form[f.name];
      const preenchido = f.type === "checkbox" || (v !== undefined && v !== null && String(v).trim() !== "");
      if (f.required && !preenchido) novos[f.name] = `Informe: ${f.label}.`;
      else if (preenchido && f.type === "email" && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(String(v))) novos[f.name] = "Digite um e-mail válido, como nome@dominio.com.";
      else if (preenchido && f.type === "url" && !/^https?:\/\//i.test(String(v))) novos[f.name] = "O link deve começar com http:// ou https://.";
    }
    setErros(novos);
    const primeiro = fields.find((f) => novos[f.name]);
    if (primeiro) {
      const alvo = formRef.current?.querySelector<HTMLElement>(`[data-campo="${primeiro.name}"]`);
      alvo?.scrollIntoView({ behavior: "smooth", block: "center" });
      alvo?.querySelector<HTMLElement>("input,textarea,button")?.focus({ preventScroll: true });
    }
    return !primeiro;
  };

  const salvar = async (outro: boolean) => {
    if (!validar()) return;
    setSaving(true);
    const payload: Record<string, unknown> = {};
    fields.forEach((f) => {
      if (f.somenteLeitura) return;
      let v = form[f.name];
      if (f.type === "number" && v !== "" && v != null) v = Number(v);
      if (f.type === "checkbox") v = Boolean(v);
      if (f.type === "datetime-local" && v) v = new Date(String(v)).toISOString();
      if (v === "" || v === undefined) v = null;
      // Em um registro novo, o campo vazio fica para o valor padrão do banco (ex.: protocolo).
      if (v === null && !editing) return;
      payload[f.name] = v;
    });
    if (repositorio) {
      try {
        await repositorio.salvar(editing ? editing.id : null, payload);
      } catch (e) {
        setSaving(false);
        return toast.error(e instanceof Error ? e.message : "Não foi possível salvar.", { duration: 8000 });
      }
      setSaving(false);
      toast.success(editing ? "Alterações salvas." : `${singular ? singular.charAt(0).toUpperCase() + singular.slice(1) : "Registro"} ${feminino ? "criada" : "criado"}.`);
      if (!editing) gravarRascunho(chaveRascunho, null);
      load();
      if (outro) {
        setRecuperado(false);
        abrir({ ...defaultValues }, null);
      } else setOpen(false);
      return;
    }
    const op = editing
      ? (supabase as any).from(table).update(payload).eq("id", editing.id).select()
      : (supabase as any).from(table).insert(payload).select();
    const { error } = await op;
    setSaving(false);
    if (error) return toast.error(mensagemDeErro(error), { duration: 8000 });
    toast.success(editing ? "Alterações salvas." : `${singular ? singular.charAt(0).toUpperCase() + singular.slice(1) : "Registro"} ${feminino ? "criada" : "criado"}.`);
    if (!editing) gravarRascunho(chaveRascunho, null);
    load();
    if (outro) {
      setRecuperado(false);
      abrir({ ...defaultValues }, null);
    } else setOpen(false);
  };

  // Ctrl+S salva
  useEffect(() => {
    if (!open) return;
    const k = (e: KeyboardEvent) => {
      if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === "s") {
        e.preventDefault();
        salvar(false);
      }
    };
    window.addEventListener("keydown", k);
    return () => window.removeEventListener("keydown", k);
    /* eslint-disable-next-line react-hooks/exhaustive-deps */
  }, [open, form, editing]);

  const valorFiltro = (r: T, f: FiltroDef<T>) => (f.valor ? f.valor(r) : (r as any)[f.campo]);
  const rotuloFiltro = (f: FiltroDef<T>, v: string) =>
    f.opcoes?.find((o) => o.value === v)?.label ?? fields.find((c) => c.name === f.campo)?.options?.find((o) => o.value === v)?.label ?? externalOptions[f.campo]?.find((o) => o.value === v)?.label ?? v;

  const opcoesFiltro = useMemo(
    () => Object.fromEntries(filtros.map((f) => [f.campo, [...new Set(rows.map((r) => valorFiltro(r, f)).filter(Boolean).map(String))].sort((a, b) => rotuloFiltro(f, a).localeCompare(rotuloFiltro(f, b), "pt-BR"))])),
    /* eslint-disable-next-line react-hooks/exhaustive-deps */
    [rows, externalOptions],
  );

  const camposBusca = buscaEm ?? fields.filter((f) => !f.type || f.type === "textarea" || f.type === "email").map((f) => f.name);
  const normalizar = (s: string) => s.normalize("NFD").replace(/[̀-ͯ]/g, "").toLowerCase();

  const filtrados = useMemo(() => {
    const q = normalizar(busca.trim());
    let lista = rows.filter((r) => {
      for (const f of filtros) if (selecao[f.campo] && String(valorFiltro(r, f) ?? "") !== selecao[f.campo]) return false;
      return !q || camposBusca.some((c) => normalizar(String((r as any)[c] ?? "")).includes(q));
    });
    if (ordem) {
      lista = [...lista].sort((a, b) => {
        const x = (a as any)[ordem.chave], y = (b as any)[ordem.chave];
        const r = typeof x === "number" && typeof y === "number" ? x - y : String(x ?? "").localeCompare(String(y ?? ""), "pt-BR", { numeric: true });
        return ordem.asc ? r : -r;
      });
    }
    return lista;
    /* eslint-disable-next-line react-hooks/exhaustive-deps */
  }, [rows, busca, selecao, ordem]);

  useEffect(() => setPagina(1), [busca, selecao, ordem]);

  const totalPaginas = Math.max(1, Math.ceil(filtrados.length / POR_PAGINA));
  const paginaAtual = Math.min(pagina, totalPaginas);
  const visiveis = filtrados.slice((paginaAtual - 1) * POR_PAGINA, paginaAtual * POR_PAGINA);
  const temFiltro = Boolean(busca.trim()) || Object.values(selecao).some(Boolean);

  const exportar = () => {
    const cols = columns.filter((c) => rows[0] && String(c.key) in (rows[0] as object));
    const esc = (v: unknown) => `"${String(v ?? "").replace(/"/g, '""')}"`;
    const linhas = [cols.map((c) => esc(c.label)).join(";"), ...filtrados.map((r) => cols.map((c) => esc((r as any)[c.key])).join(";"))];
    const url = URL.createObjectURL(new Blob(["﻿" + linhas.join("\r\n")], { type: "text/csv;charset=utf-8" }));
    Object.assign(document.createElement("a"), { href: url, download: `${table}.csv` }).click();
    URL.revokeObjectURL(url);
  };

  const obrigatorios = fields.filter((f) => f.required);
  const preenchidos = obrigatorios.filter((f) => form[f.name] !== undefined && form[f.name] !== null && String(form[f.name]).trim() !== "").length;
  const usados = new Set(secoes?.flatMap((s) => s.campos));
  const grupos: SecaoForm[] = secoes
    ? [...secoes, ...(fields.some((f) => !usados.has(f.name)) ? [{ titulo: "Outras informações", campos: fields.filter((f) => !usados.has(f.name)).map((f) => f.name) }] : [])]
    : [{ titulo: "Informações", campos: fields.map((f) => f.name) }];

  const definir = (f: FieldDef, v: unknown) => {
    setForm((prev) => {
      const prox: Record<string, unknown> = { ...prev, [f.name]: v };
      if (!editing) for (const s of fields) if (s.slugDe === f.name) prox[s.name] = slugify(String(v ?? ""));
      return prox;
    });
    if (erros[f.name]) setErros((e) => ({ ...e, [f.name]: "" }));
  };

  const cor = "var(--tema)";

  const renderCampo = (f: FieldDef) => {
    const v = form[f.name];
    const idErro = `${f.name}-erro`;
    const comum = { "aria-invalid": Boolean(erros[f.name]) || undefined, "aria-required": f.required || undefined, "aria-describedby": erros[f.name] ? idErro : f.ajuda ? `${f.name}-ajuda` : undefined };
    if (f.somenteLeitura) return <p className="h-10 flex items-center px-3 rounded-lg bg-muted text-sm font-mono text-foreground">{String(v ?? "Gerado ao salvar")}</p>;
    switch (f.type) {
      case "textarea":
        return <Textarea id={f.name} rows={5} placeholder={f.placeholder} value={String(v ?? "")} onChange={(e) => definir(f, e.target.value)} {...comum} />;
      case "checkbox":
        return (
          <label htmlFor={f.name} className="flex items-center justify-between gap-4 min-h-12 rounded-xl border border-border px-4 py-2.5 cursor-pointer hover:bg-muted/40">
            <span className="text-sm text-muted-foreground">{f.placeholder ?? "Sim"}</span>
            <Switch id={f.name} checked={Boolean(v)} onCheckedChange={(c) => definir(f, c)} />
          </label>
        );
      case "etapas":
        return (
          <div role="radiogroup" aria-label={f.label} className="flex flex-wrap gap-1.5">
            {opcoesDe(f).map((o) => {
              const ativo = String(v ?? "") === o.value;
              const c = f.cores?.[o.value] ?? "#1F5FBF";
              return (
                <button
                  key={o.value}
                  type="button"
                  role="radio"
                  aria-checked={ativo}
                  onClick={() => definir(f, o.value)}
                  className="inline-flex items-center gap-1.5 min-h-10 px-3.5 rounded-full text-sm font-semibold border transition focus-visible:outline-2 focus-visible:outline-offset-2"
                  style={ativo ? { backgroundColor: c, borderColor: c, color: "white" } : { color: `color-mix(in srgb, ${c} 72%, var(--foreground))`, borderColor: `color-mix(in srgb, ${c} 35%, transparent)` }}
                >
                  {ativo && <Check className="w-3.5 h-3.5" aria-hidden />} {o.label}
                </button>
              );
            })}
          </div>
        );
      case "select": {
        const lista = opcoesDe(f).filter((o) => o.value !== "");
        const atual = String(v ?? "");
        // Valor antigo que não está na lista continua visível e não se perde ao salvar.
        const completa = atual && !lista.some((o) => o.value === atual) ? [...lista, { label: atual, value: atual }] : lista;
        return (
          <Select value={atual || (f.required ? "" : VAZIO)} onValueChange={(x) => definir(f, x === VAZIO ? null : x)}>
            <SelectTrigger id={f.name} className="h-10 w-full" {...comum}>
              <SelectValue placeholder={f.placeholder || "Selecione..."} />
            </SelectTrigger>
            <SelectContent>
              {!f.required && <SelectItem value={VAZIO}>{f.placeholder || "Nenhum"}</SelectItem>}
              {completa.map((o) => <SelectItem key={o.value} value={o.value}>{o.label}</SelectItem>)}
            </SelectContent>
          </Select>
        );
      }
      case "file":
        return <CampoArquivo field={f} valor={v} cor={cor} enviarPdf={repositorio?.enviarPdf} onChange={(u) => definir(f, u)} />;
      case "cor":
        return (
          <div className="flex items-center gap-2">
            <input type="color" aria-label={f.label} value={String(v || "#1F5FBF")} onChange={(e) => definir(f, e.target.value)} className="h-10 w-14 rounded-lg border border-border bg-transparent cursor-pointer" />
            <Input id={f.name} value={String(v ?? "")} onChange={(e) => definir(f, e.target.value)} className="font-mono h-10" {...comum} />
          </div>
        );
      case "custom":
        return f.renderCustom?.(editing, form, setForm);
      default:
        return (
          <Input
            id={f.name}
            type={f.type ?? "text"}
            placeholder={f.placeholder}
            className="h-10"
            value={f.type === "datetime-local" ? paraDataHoraLocal(v) : String(v ?? "")}
            onChange={(e) => definir(f, e.target.value)}
            {...comum}
          />
        );
    }
  };

  const acoesLinha = (row: T) => (
    <div className="flex items-center gap-0.5">
      {acoesCartao?.(row)}
      <Button type="button" size="icon" variant="ghost" aria-label={`Editar ${nomeRegistro(row)}`} title="Editar" onClick={() => startEdit(row)}><Pencil className="w-4 h-4" /></Button>
      <Button type="button" size="icon" variant="ghost" aria-label={`Duplicar ${nomeRegistro(row)}`} title="Duplicar" onClick={() => duplicar(row)}><Copy className="w-4 h-4" /></Button>
      <Button type="button" size="icon" variant="ghost" aria-label={`Excluir ${nomeRegistro(row)}`} title="Excluir" className="text-destructive hover:text-destructive" onClick={() => setExcluindo(row)}><Trash2 className="w-4 h-4" /></Button>
    </div>
  );

  return (
    <PaginaModulo
      titulo={title}
      descricao={description}
      acoes={
        <>
          {acoesPagina}
          <BotaoCabecalho onClick={startNew}><Plus className="w-4 h-4" aria-hidden /> {nomeNovo}</BotaoCabecalho>
        </>
      }
    >
      {antes}
      {indicadores && !loading && !erroCarga && <Indicadores itens={indicadores(rows)} />}

      <div className="flex flex-wrap items-center gap-2 bg-card border border-border rounded-2xl p-2.5">
        <div className="relative flex-1 min-w-[220px]">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" aria-hidden />
          <Input aria-label={`Buscar em ${title}`} value={busca} onChange={(e) => setBusca(e.target.value)} placeholder="Buscar..." className="pl-9 h-10 border-0 shadow-none bg-muted/50" />
        </div>
        {filtros.map((f) => (
          <Select key={f.campo} value={selecao[f.campo] || VAZIO} onValueChange={(v) => setSelecao((s) => ({ ...s, [f.campo]: v === VAZIO ? "" : v }))}>
            <SelectTrigger aria-label={`Filtrar por ${f.rotulo}`} className="h-10 w-auto min-w-[150px] max-w-[230px]"><SelectValue /></SelectTrigger>
            <SelectContent>
              <SelectItem value={VAZIO}>{f.rotulo}: todos</SelectItem>
              {(opcoesFiltro[f.campo] ?? []).map((o) => <SelectItem key={o} value={o}>{rotuloFiltro(f, o)}</SelectItem>)}
            </SelectContent>
          </Select>
        ))}
        {temFiltro && <Button type="button" variant="ghost" className="h-10" onClick={() => { setBusca(""); setSelecao({}); }}><X className="w-4 h-4 mr-1" /> Limpar</Button>}
        <div className="flex items-center gap-1 ml-auto">
          {cartao && (
            <div role="group" aria-label="Forma de exibição" className="flex rounded-lg bg-muted/60 p-0.5">
              <Button type="button" size="icon" variant={visao === "cartoes" ? "secondary" : "ghost"} className="h-9 w-9" aria-pressed={visao === "cartoes"} aria-label="Ver em cartões" title="Cartões" onClick={() => setVisao("cartoes")}><LayoutGrid className="w-4 h-4" /></Button>
              <Button type="button" size="icon" variant={visao === "tabela" ? "secondary" : "ghost"} className="h-9 w-9" aria-pressed={visao === "tabela"} aria-label="Ver em tabela" title="Tabela" onClick={() => setVisao("tabela")}><List className="w-4 h-4" /></Button>
            </div>
          )}
          <Button type="button" variant="outline" className="h-10" onClick={exportar} disabled={!filtrados.length}><Download className="w-4 h-4 mr-1.5" aria-hidden /> CSV</Button>
        </div>
      </div>

      <p className="text-sm text-muted-foreground" aria-live="polite">
        {loading ? "Carregando..." : `${filtrados.length.toLocaleString("pt-BR")} ${filtrados.length === 1 ? "registro" : "registros"}${temFiltro ? ` de ${rows.length.toLocaleString("pt-BR")}` : ""}`}
      </p>

      {loading ? (
        <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3" aria-hidden>
          {Array.from({ length: 6 }).map((_, i) => <div key={i} className="h-36 rounded-2xl bg-muted animate-pulse" />)}
        </div>
      ) : erroCarga ? (
        <div role="alert" className="bg-card border border-destructive/40 rounded-2xl p-8 text-center">
          <p className="font-semibold text-foreground">{erroCarga}</p>
          <Button type="button" variant="outline" className="mt-3" onClick={load}>Tentar novamente</Button>
        </div>
      ) : filtrados.length === 0 ? (
        <div className="bg-card border border-dashed border-border rounded-2xl p-12 text-center">
          <Inbox className="w-10 h-10 mx-auto text-muted-foreground" aria-hidden />
          <p className="font-display font-bold text-lg text-foreground mt-3">{temFiltro ? "Nada encontrado com esses filtros" : (vazio ?? "Nenhum registro ainda")}</p>
          {temFiltro ? (
            <Button type="button" variant="outline" className="mt-4" onClick={() => { setBusca(""); setSelecao({}); }}>Limpar filtros</Button>
          ) : (
            <Button type="button" className="mt-4 text-white" style={{ backgroundColor: cor }} onClick={startNew}><Plus className="w-4 h-4 mr-1.5" /> {nomeNovo}</Button>
          )}
        </div>
      ) : visao === "cartoes" && cartao ? (
        <ul className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
          {visiveis.map((row) => (
            <li key={row.id} className="group relative flex flex-col bg-card border border-border rounded-2xl overflow-hidden hover:shadow-md transition">
              <span className="absolute inset-x-0 top-0 h-1" style={{ backgroundColor: cor }} aria-hidden />
              <div className="flex gap-3 p-4 pt-5 flex-1">
                {cartao.imagem && <div className="shrink-0">{cartao.imagem(row)}</div>}
                <div className="min-w-0 flex-1">
                  <div className="flex items-start justify-between gap-2">
                    <button type="button" onClick={() => startEdit(row)} className="text-left font-display font-bold text-foreground leading-snug hover:underline underline-offset-2 focus-visible:outline-2 focus-visible:outline-offset-2 rounded">
                      {cartao.titulo(row)}
                    </button>
                    {cartao.selo?.(row)}
                  </div>
                  {cartao.subtitulo && <p className="text-sm text-muted-foreground mt-0.5">{cartao.subtitulo(row)}</p>}
                  {cartao.texto && <div className="text-sm text-muted-foreground mt-2 line-clamp-3">{cartao.texto(row)}</div>}
                </div>
              </div>
              <div className="flex items-center justify-between gap-2 border-t border-border px-3 py-1.5 bg-muted/30">
                <div className="text-xs text-muted-foreground min-w-0 truncate pl-1">{cartao.rodape?.(row)}</div>
                {acoesLinha(row)}
              </div>
            </li>
          ))}
        </ul>
      ) : (
        <div className="bg-card border border-border rounded-2xl overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-border bg-muted/40 text-left">
                {columns.map((c) => {
                  const chave = String(c.key);
                  const ativa = ordem?.chave === chave;
                  const ordenavel = rows[0] && chave in (rows[0] as object);
                  return (
                    <th key={chave} scope="col" aria-sort={ativa ? (ordem!.asc ? "ascending" : "descending") : undefined} className="px-4 py-3 font-semibold text-muted-foreground whitespace-nowrap">
                      {ordenavel ? (
                        <button type="button" className="inline-flex items-center gap-1 hover:text-foreground" onClick={() => setOrdem(ativa ? { chave, asc: !ordem!.asc } : { chave, asc: true })}>
                          {c.label}
                          {ativa && (ordem!.asc ? <ArrowUp className="w-3.5 h-3.5" aria-hidden /> : <ArrowDown className="w-3.5 h-3.5" aria-hidden />)}
                        </button>
                      ) : c.label}
                    </th>
                  );
                })}
                <th scope="col" className="px-4 py-3 text-right font-semibold text-muted-foreground">Ações</th>
              </tr>
            </thead>
            <tbody>
              {visiveis.map((row) => (
                <tr key={row.id} className="border-b border-border last:border-0 hover:bg-muted/30">
                  {columns.map((c) => (
                    <td key={String(c.key)} className="px-4 py-3 align-middle text-foreground">
                      {c.render ? c.render(row) : String((row as any)[c.key as string] ?? "—")}
                    </td>
                  ))}
                  <td className="px-3 py-2"><div className="flex justify-end">{acoesLinha(row)}</div></td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {totalPaginas > 1 && (
        <nav aria-label="Páginas" className="flex items-center justify-center gap-3">
          <Button type="button" variant="outline" size="icon" aria-label="Página anterior" disabled={paginaAtual === 1} onClick={() => setPagina(paginaAtual - 1)}><ChevronLeft className="w-4 h-4" /></Button>
          <span className="text-sm text-muted-foreground tabular-nums">Página {paginaAtual} de {totalPaginas}</span>
          <Button type="button" variant="outline" size="icon" aria-label="Próxima página" disabled={paginaAtual === totalPaginas} onClick={() => setPagina(paginaAtual + 1)}><ChevronRight className="w-4 h-4" /></Button>
        </nav>
      )}

      <Sheet open={open} onOpenChange={(a) => (a ? setOpen(true) : fechar())}>
        <SheetContent side="right" className={`w-full p-0 gap-0 flex flex-col [&>button]:text-white [&>button]:opacity-100 ${previa ? "sm:max-w-5xl" : "sm:max-w-2xl"}`}>
          <div className="px-6 py-5 text-white shrink-0" style={{ backgroundColor: cor }}>
            <SheetTitle className="text-white font-display text-xl font-bold pr-8">{editing ? nomeEditar : nomeNovo}</SheetTitle>
            <SheetDescription className="text-white/90 text-sm mt-0.5">
              {editing ? nomeRegistro(editing) : obrigatorios.length ? `${preenchidos} de ${obrigatorios.length} campos obrigatórios preenchidos` : "Preencha as informações abaixo"}
            </SheetDescription>
            {!editing && obrigatorios.length > 0 && (
              <div className="mt-3 h-1.5 rounded-full bg-white/25 overflow-hidden" aria-hidden>
                <div className="h-full bg-white rounded-full transition-all" style={{ width: `${(preenchidos / obrigatorios.length) * 100}%` }} />
              </div>
            )}
          </div>

          <form ref={formRef} noValidate onSubmit={(e) => { e.preventDefault(); salvar(false); }} className="flex-1 min-h-0 flex flex-col">
            <div className={`flex-1 min-h-0 overflow-y-auto ${previa ? "lg:grid lg:grid-cols-[1fr_340px]" : ""}`}>
              <div className="p-6 space-y-8">
                {recuperado && !editing && (
                  <div role="status" className="flex flex-wrap items-center justify-between gap-2 rounded-xl border border-border bg-muted/50 px-4 py-3 text-sm">
                    <span className="text-foreground">Recuperamos o rascunho que você estava preenchendo.</span>
                    <Button type="button" variant="outline" size="sm" onClick={() => { gravarRascunho(chaveRascunho, null); setRecuperado(false); abrir({ ...defaultValues }, null); }}>Começar do zero</Button>
                  </div>
                )}
                {grupos.map((s) => (
                  <fieldset key={s.titulo} className="space-y-4">
                    <legend className="w-full border-b border-border pb-2 mb-1">
                      <span className="font-display font-bold text-base text-foreground">{s.titulo}</span>
                      {s.descricao && <span className="block text-xs text-muted-foreground mt-0.5">{s.descricao}</span>}
                    </legend>
                    <div className="grid gap-4 sm:grid-cols-2">
                      {s.campos.map((nome) => {
                        const f = fields.find((c) => c.name === nome);
                        if (!f) return null;
                        const largo = f.largo ?? (f.type === "textarea" || f.type === "file" || f.type === "custom" || f.type === "etapas");
                        return (
                          <div key={f.name} data-campo={f.name} className={largo ? "sm:col-span-2" : ""}>
                            <label htmlFor={f.name} className="block text-sm font-semibold text-foreground mb-1.5">
                              {f.label}
                              {f.required && <span className="text-destructive" aria-hidden> *</span>}
                              {f.required && <span className="sr-only"> (obrigatório)</span>}
                            </label>
                            {renderCampo(f)}
                            {f.ajuda && !erros[f.name] && <p id={`${f.name}-ajuda`} className="text-xs text-muted-foreground mt-1">{f.ajuda}</p>}
                            {erros[f.name] && <p id={`${f.name}-erro`} role="alert" className="text-xs font-semibold text-destructive mt-1">{erros[f.name]}</p>}
                          </div>
                        );
                      })}
                    </div>
                  </fieldset>
                ))}
              </div>
              {previa && (
                <aside aria-label="Como aparece no site" className="hidden lg:block border-l border-border bg-muted/30 p-5">
                  <div className="sticky top-5">
                    <p className="text-xs font-bold uppercase tracking-wider text-muted-foreground mb-3">Como aparece no site</p>
                    {previa(form)}
                  </div>
                </aside>
              )}
            </div>
            <div className="shrink-0 flex flex-wrap items-center justify-between gap-2 border-t border-border bg-card px-6 py-3">
              <p className="text-xs text-muted-foreground hidden sm:block">
                {!editing && alterado ? "Rascunho guardado automaticamente · " : ""}<kbd className="font-mono">Ctrl+S</kbd> salva
              </p>
              <div className="flex items-center gap-2 ml-auto">
                <Button type="button" variant="outline" onClick={fechar}>Cancelar</Button>
                {!editing && <Button type="button" variant="outline" disabled={saving} onClick={() => salvar(true)}>Salvar e criar outro</Button>}
                <Button type="submit" disabled={saving} className="text-white hover:opacity-90" style={{ backgroundColor: cor }}>
                  {saving && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
                  {editing ? "Salvar alterações" : "Salvar"}
                </Button>
              </div>
            </div>
          </form>
        </SheetContent>
      </Sheet>

      <AlertDialog open={Boolean(excluindo)} onOpenChange={(a) => !a && setExcluindo(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Excluir "{excluindo ? nomeRegistro(excluindo) : ""}"?</AlertDialogTitle>
            <AlertDialogDescription>O registro sai do painel e do site. Logo depois da exclusão, você ainda pode clicar em Desfazer por alguns segundos.</AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Manter</AlertDialogCancel>
            <AlertDialogAction className="bg-destructive text-white hover:bg-destructive/90" onClick={confirmarExclusao}>Excluir</AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      <AlertDialog open={descartar} onOpenChange={setDescartar}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Descartar as alterações?</AlertDialogTitle>
            <AlertDialogDescription>O que você mudou neste registro ainda não foi salvo.</AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Continuar editando</AlertDialogCancel>
            <AlertDialogAction className="bg-destructive text-white hover:bg-destructive/90" onClick={() => { setDescartar(false); setOpen(false); }}>Descartar</AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </PaginaModulo>
  );
}
