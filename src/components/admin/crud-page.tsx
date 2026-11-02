import { useMemo, type ReactNode } from "react";
import { CrudPage as Modulo, type CartaoDef, type ColumnDef, type FieldDef, type SecaoForm } from "@/components/admin/painel/CrudModulo";
import { GUIAS } from "@/components/admin/painel/guias";
import type { Indicador } from "@/components/admin/painel/PaginaModulo";

export type { ColumnDef, FieldDef };
export type CrudTab = { id: string; label: string; fieldNames: string[] };

type Props<T extends { id: string }> = {
  title: string;
  description?: string;
  table: string;
  columns: ColumnDef<T>[];
  fields: FieldDef[];
  tabs?: CrudTab[];
  orderBy?: { column: string; ascending?: boolean };
  defaultValues?: Partial<T>;
  /** Filtro fixo (ex.: { categoria: "portarias" }), aplicado na listagem e ao salvar. */
  filter?: Record<string, string | number | boolean>;
  cartao?: CartaoDef<T>;
  indicadores?: (rows: T[]) => Indicador[];
  acoesCartao?: (row: T, recarregar: () => void) => ReactNode;
  acoesPagina?: ReactNode;
};

/**
 * Tela de cadastro do painel. Usa o formulário moderno de CrudModulo e completa com as instruções de guias.ts,
 * para cada tela só precisar declarar seus campos.
 */
export function CrudPage<T extends { id: string }>({ tabs, filter, fields, table, indicadores, ...resto }: Props<T>) {
  const guia = GUIAS[filter?.categoria ? `${table}:${filter.categoria}` : table] ?? GUIAS[table] ?? {};

  const campos = useMemo(() => fields.map((f) => ({ ...f, ...guia.campos?.[f.name] })), [fields, guia]);
  const secoes: SecaoForm[] | undefined = guia.secoes ?? tabs?.map((t) => ({ titulo: t.label, campos: t.fieldNames }));
  const temAtivo = fields.some((f) => f.name === "ativo");
  const temPublicado = fields.some((f) => f.name === "publicado");

  const automaticos = (rows: T[]): Indicador[] => {
    const lista: Indicador[] = [{ rotulo: "Total", valor: rows.length }];
    const chave = temAtivo ? "ativo" : temPublicado ? "publicado" : null;
    if (chave) {
      const ligados = rows.filter((r) => (r as Record<string, unknown>)[chave]).length;
      lista.push({ rotulo: "No site", valor: ligados }, { rotulo: "Fora do site", valor: rows.length - ligados });
    }
    return lista;
  };

  return (
    <Modulo<T>
      {...resto}
      table={table}
      fields={campos}
      filter={filter}
      secoes={secoes}
      singular={guia.singular}
      feminino={guia.feminino}
      instrucoes={guia.intro || guia.passos ? { intro: guia.intro, passos: guia.passos } : undefined}
      filtros={guia.filtros}
      buscaEm={guia.buscaEm}
      vazio={guia.vazio}
      nomeDe={guia.nomeDe ? (r: T) => String((r as Record<string, unknown>)[guia.nomeDe!] ?? guia.singular ?? "registro") : undefined}
      indicadores={indicadores ?? automaticos}
      semCriar={guia.somenteAtender}
      semExcluir={guia.somenteAtender}
    />
  );
}
