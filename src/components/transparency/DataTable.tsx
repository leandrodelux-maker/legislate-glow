import { useEffect, useState } from "react";
import { ChevronLeft, ChevronRight, ArrowUpDown } from "lucide-react";

// Valor usado na ordenação: "R$ 1.230,28" vira número e "29/10/2026" vira 20261029; o resto fica texto.
const chaveOrdenacao = (v: unknown): number | string => {
  const s = String(v ?? "").trim();
  const data = s.match(/^(\d{2})\/(\d{2})\/(\d{4})/);
  if (data) return Number(data[3] + data[2] + data[1]);
  if (/^-?(R\$\s*)?-?[\d.]+,\d{2}$/.test(s)) return Number(s.replace(/[^\d,-]/g, "").replace(",", "."));
  return s;
};

// Valor da coluna "Pago": verde quando houve pagamento, vermelho leve quando ainda não foi pago.
export const ValorPago = ({ valor }: { valor?: string }) => {
  const n = chaveOrdenacao(valor);
  const pago = typeof n === "number" && n > 0;
  return (
    <span className={pago ? "font-semibold text-emerald-700 dark:text-emerald-400" : "text-red-500/90 dark:text-red-400/90"}>
      {valor || "—"}
    </span>
  );
};

export interface Column {
  key: string;
  label: string;
  sortable?: boolean;
  render?: (value: any, row: any) => React.ReactNode;
}

interface DataTableProps {
  columns: Column[];
  data: any[];
  pageSize?: number;
  onRowClick?: (row: Record<string, string>) => void;
}

const DataTable = ({ columns, data, pageSize = 10, onRowClick }: DataTableProps) => {
  const [page, setPage] = useState(0);
  const [sortKey, setSortKey] = useState<string | null>(null);
  const [sortDir, setSortDir] = useState<"asc" | "desc">("asc");

  // Volta para a primeira página quando a lista muda (novo filtro, outro ano).
  useEffect(() => { setPage(0); }, [data]);

  const sorted = sortKey
    ? [...data].sort((a, b) => {
        const va = chaveOrdenacao(a[sortKey]);
        const vb = chaveOrdenacao(b[sortKey]);
        const cmp = typeof va === "number" && typeof vb === "number"
          ? va - vb
          : String(va).localeCompare(String(vb), "pt-BR", { numeric: true });
        return sortDir === "asc" ? cmp : -cmp;
      })
    : data;

  const totalPages = Math.ceil(sorted.length / pageSize);
  const paged = sorted.slice(page * pageSize, (page + 1) * pageSize);

  const handleSort = (key: string) => {
    if (sortKey === key) setSortDir((d) => (d === "asc" ? "desc" : "asc"));
    else { setSortKey(key); setSortDir("asc"); }
  };

  return (
    <div>
      <div className="overflow-x-auto bg-card border rounded-lg">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b bg-muted/50">
              {columns.map((col) => (
                <th
                  key={col.key}
                  className="px-4 py-3 text-left font-semibold text-foreground whitespace-nowrap"
                >
                  {col.sortable ? (
                    <button onClick={() => handleSort(col.key)} className="flex items-center gap-1 hover:text-primary">
                      {col.label} <ArrowUpDown className="h-3 w-3" />
                    </button>
                  ) : col.label}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {paged.length === 0 ? (
              <tr><td colSpan={columns.length} className="px-4 py-8 text-center text-muted-foreground">Nenhum registro encontrado.</td></tr>
            ) : (
              paged.map((row, i) => (
                <tr
                  key={i}
                  onClick={onRowClick ? () => onRowClick(row) : undefined}
                  className={`border-b last:border-b-0 hover:bg-muted/30 ${onRowClick ? "cursor-pointer" : ""}`}
                >
                  {columns.map((col) => (
                    <td key={col.key} className="px-4 py-3 text-foreground">
                      {col.render ? col.render(row[col.key], row) : (row[col.key] ?? "—")}
                    </td>
                  ))}
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
      {totalPages > 1 && (
        <div className="flex items-center justify-between mt-4 text-sm">
          <span className="text-muted-foreground">
            Mostrando {page * pageSize + 1}–{Math.min((page + 1) * pageSize, sorted.length)} de {sorted.length}
          </span>
          <div className="flex items-center gap-1">
            <button onClick={() => setPage(0)} disabled={page === 0} className="px-2 py-1 rounded text-xs hover:bg-muted disabled:opacity-30">
              Primeira
            </button>
            <button onClick={() => setPage(Math.max(0, page - 1))} disabled={page === 0} className="p-2 rounded hover:bg-muted disabled:opacity-30">
              <ChevronLeft className="h-4 w-4" />
            </button>
            {Array.from({ length: Math.min(totalPages, 7) }, (_, i) => {
              let p: number;
              if (totalPages <= 7) p = i;
              else if (page < 4) p = i;
              else if (page > totalPages - 4) p = totalPages - 7 + i;
              else p = page - 3 + i;
              if (p < 0 || p >= totalPages) return null;
              return (
                <button key={p} onClick={() => setPage(p)} className={`w-8 h-8 rounded text-sm ${p === page ? "bg-primary text-primary-foreground" : "hover:bg-muted"}`}>
                  {p + 1}
                </button>
              );
            })}
            <button onClick={() => setPage(Math.min(totalPages - 1, page + 1))} disabled={page >= totalPages - 1} className="p-2 rounded hover:bg-muted disabled:opacity-30">
              <ChevronRight className="h-4 w-4" />
            </button>
            <button onClick={() => setPage(totalPages - 1)} disabled={page >= totalPages - 1} className="px-2 py-1 rounded text-xs hover:bg-muted disabled:opacity-30">
              Última
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default DataTable;
